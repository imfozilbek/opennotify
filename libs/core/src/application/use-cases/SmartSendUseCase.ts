import { CreateNotificationProps, Notification } from "../../domain/entities/Notification"
import { Recipient } from "../../domain/entities/Recipient"
import { Channel } from "../../domain/value-objects/Channel"
import { MessageType } from "../../domain/value-objects/MessageType"
import { getChannelForProvider, Provider } from "../../domain/value-objects/Provider"
import { ProviderError } from "../../domain/value-objects/ProviderError"
import { RetryPolicy } from "../../domain/value-objects/RetryPolicy"
import { RoutingContext } from "../../domain/value-objects/RoutingContext"
import { hasRoutes, ProviderRoute, RoutingResult } from "../../domain/value-objects/RoutingResult"
import { SendAttempt } from "../../domain/value-objects/SendAttempt"
import { RoutingEngine } from "../services/RoutingEngine"
import { ProviderHealthTracker } from "../services/ProviderHealthTracker"
import { MerchantProviderPort } from "../ports/MerchantProviderPort"
import { NotificationRepositoryPort } from "../ports/NotificationRepositoryPort"
import { RecipientRepositoryPort } from "../ports/RecipientRepositoryPort"
import {
    NotificationProviderPort,
    SendNotificationRequest,
} from "../ports/NotificationProviderPort"

/**
 * Input for smart notification sending.
 */
export interface SmartSendInput {
    /** Unique notification ID */
    id: string

    /** Merchant sending the notification */
    merchantId: string

    /** Message type for routing decisions */
    messageType?: MessageType

    /** Recipient information */
    recipient: {
        /** Recipient ID (if stored) */
        id?: string

        /** Phone number (E.164 format) */
        phone?: string

        /** Email address */
        email?: string

        /** Telegram chat ID */
        telegramChatId?: string

        /** Push device token */
        deviceToken?: string

        /** Preferred channel override */
        preferredChannel?: Channel
    }

    /** Message content */
    payload: {
        /** Message text */
        text: string

        /** Email subject */
        subject?: string

        /** Template ID (for future use) */
        templateId?: string

        /** Template variables */
        variables?: Record<string, string>

        /** Additional metadata */
        metadata?: Record<string, unknown>
    }

    /** Override routing behavior */
    routing?: {
        /** Force specific channel */
        preferredChannel?: Channel

        /** Force specific provider */
        preferredProvider?: Provider

        /** Disable fallback (try only primary) */
        skipFallback?: boolean
    }
}

/**
 * Output from smart notification sending.
 */
export interface SmartSendOutput {
    /** Whether notification was delivered successfully */
    success: boolean

    /** The notification entity */
    notification: Notification

    /** Channel that was used */
    usedChannel: Channel

    /** Provider that was used */
    usedProvider: Provider

    /** Full routing path that was tried */
    routingPath: ProviderRoute[]

    /** Number of attempts made */
    attemptsMade: number

    /** Routing result from engine */
    routingResult: RoutingResult

    /** Error message if all attempts failed */
    errorMessage?: string

    /** Detailed attempt history for debugging/logging */
    attempts: SendAttempt[]

    /** Total duration of all attempts in milliseconds */
    totalDurationMs: number
}

/**
 * Use case for sending notifications with smart routing.
 *
 * Unlike SendNotificationUseCase, this use case:
 * - Uses RoutingEngine for channel/provider selection
 * - Supports automatic fallback on failure
 * - Respects recipient preferences and opt-outs
 * - Considers message type for routing decisions
 *
 * @example
 * ```typescript
 * const useCase = new SmartSendUseCase(
 *     routingEngine,
 *     merchantProviderPort,
 *     recipientRepository,
 *     notificationRepository,
 * )
 *
 * // Send OTP - will try Telegram first, then SMS
 * const result = await useCase.execute({
 *     id: "notif_123",
 *     merchantId: "merchant_456",
 *     messageType: MessageType.OTP,
 *     recipient: { phone: "+998901234567" },
 *     payload: { text: "Your code is 1234" },
 * })
 *
 * console.log(result.usedChannel)    // "TELEGRAM" or "SMS"
 * console.log(result.attemptsMade)   // 1 or 2
 * ```
 */
export class SmartSendUseCase {
    constructor(
        private readonly routingEngine: RoutingEngine,
        private readonly merchantProviderPort: MerchantProviderPort,
        private readonly recipientRepository: RecipientRepositoryPort,
        private readonly notificationRepository: NotificationRepositoryPort,
        private readonly healthTracker?: ProviderHealthTracker,
    ) {}

    async execute(input: SmartSendInput): Promise<SmartSendOutput> {
        // Load or create recipient
        const recipient = await this.resolveRecipient(input)

        // Get merchant's connected providers
        const availableProviders = await this.merchantProviderPort.getConnectedProviders(
            input.merchantId,
        )

        // Build routing context
        const context = this.buildRoutingContext(input, recipient, availableProviders)

        // Handle forced provider/channel
        if (input.routing?.preferredProvider) {
            return this.sendWithProvider(input, input.routing.preferredProvider)
        }

        // Get routing result
        const routingResult = this.routingEngine.resolve(context)

        // Check if we have any routes
        if (!hasRoutes(routingResult)) {
            return this.createFailureResult(
                input,
                routingResult,
                `No route available: ${routingResult.noRouteReason ?? "unknown"}`,
            )
        }

        // Determine max attempts
        const maxAttempts = input.routing?.skipFallback ? 1 : routingResult.maxAttempts

        // Get retry policy from routing result or use default
        const retryPolicy = routingResult.retryPolicy
            ? RetryPolicy.create(routingResult.retryPolicy)
            : RetryPolicy.default()

        // Try routes in order
        return this.executeWithFallback(input, routingResult, maxAttempts, retryPolicy)
    }

    /**
     * Resolve recipient from ID or create from input data.
     */
    private async resolveRecipient(input: SmartSendInput): Promise<Recipient> {
        // Try to load by ID
        if (input.recipient.id) {
            const stored = await this.recipientRepository.findById(input.recipient.id)
            if (stored) {
                return stored
            }
        }

        // Try to load by phone
        if (input.recipient.phone) {
            const stored = await this.recipientRepository.findByPhone(
                input.merchantId,
                input.recipient.phone,
            )
            if (stored) {
                return stored
            }
        }

        // Create temporary recipient from input
        return Recipient.create({
            id: `temp_${input.id}`,
            merchantId: input.merchantId,
            contacts: {
                phone: input.recipient.phone,
                email: input.recipient.email,
                telegramChatId: input.recipient.telegramChatId,
                deviceTokens: input.recipient.deviceToken
                    ? [input.recipient.deviceToken]
                    : undefined,
            },
            preferences: {
                preferredChannel: input.recipient.preferredChannel,
            },
        })
    }

    /**
     * Build routing context from input.
     */
    private buildRoutingContext(
        input: SmartSendInput,
        recipient: Recipient,
        availableProviders: Provider[],
    ): RoutingContext {
        return {
            merchantId: input.merchantId,
            messageType: input.messageType,
            recipient,
            availableProviders,
            currentTime: new Date(),
            timezone: undefined, // TODO: Get from merchant settings
        }
    }

    /**
     * Send directly with a specific provider (bypass routing).
     */
    private async sendWithProvider(
        input: SmartSendInput,
        provider: Provider,
    ): Promise<SmartSendOutput> {
        const startTime = Date.now()
        const adapter = await this.merchantProviderPort.getProviderAdapter(
            input.merchantId,
            provider,
        )

        if (!adapter) {
            const channel = getChannelForProvider(provider)
            const notification = this.createNotification(input, channel, provider)
            notification.markAsFailed(`Provider ${provider} not connected`)
            await this.notificationRepository.save(notification)

            return {
                success: false,
                notification,
                usedChannel: channel,
                usedProvider: provider,
                routingPath: [],
                attemptsMade: 0,
                routingResult: {
                    routes: [],
                    maxAttempts: 0,
                    noRouteReason: "no_providers",
                    quietHoursApplied: false,
                    filteredChannels: [],
                },
                errorMessage: `Provider ${provider} not connected`,
                attempts: [
                    SendAttempt.skippedNotAvailable({
                        provider,
                        channel,
                        attemptNumber: 0,
                    }),
                ],
                totalDurationMs: Date.now() - startTime,
            }
        }

        const notification = this.createNotification(input, adapter.channel, provider)
        const attemptStartTime = Date.now()

        const result = await adapter.send({
            phone: input.recipient.phone,
            email: input.recipient.email,
            telegramChatId: input.recipient.telegramChatId,
            deviceToken: input.recipient.deviceToken,
            text: input.payload.text,
            subject: input.payload.subject,
        })

        const durationMs = Date.now() - attemptStartTime
        const attempts: SendAttempt[] = []

        if (result.success && result.externalId) {
            notification.markAsSent(result.externalId)
            attempts.push(
                SendAttempt.success({
                    provider,
                    channel: adapter.channel,
                    durationMs,
                    externalId: result.externalId,
                    attemptNumber: 0,
                }),
            )
            this.healthTracker?.recordSuccess(provider)
        } else {
            notification.markAsFailed(result.errorMessage ?? "Unknown error")
            const providerError = ProviderError.fromMessage(result.errorMessage ?? "Unknown error")
            attempts.push(
                SendAttempt.failed({
                    provider,
                    channel: adapter.channel,
                    durationMs,
                    error: providerError,
                    attemptNumber: 0,
                }),
            )
            this.healthTracker?.recordFailure(provider, providerError)
        }

        await this.notificationRepository.save(notification)

        return {
            success: result.success,
            notification,
            usedChannel: adapter.channel,
            usedProvider: provider,
            routingPath: [{ channel: adapter.channel, provider, priority: 0 }],
            attemptsMade: 1,
            routingResult: {
                routes: [{ channel: adapter.channel, provider, priority: 0 }],
                maxAttempts: 1,
                quietHoursApplied: false,
                filteredChannels: [],
            },
            errorMessage: result.errorMessage,
            attempts,
            totalDurationMs: Date.now() - startTime,
        }
    }

    /**
     * Execute with fallback chain and retry logic.
     */
    private async executeWithFallback(
        input: SmartSendInput,
        routingResult: RoutingResult,
        maxAttempts: number,
        retryPolicy: RetryPolicy,
    ): Promise<SmartSendOutput> {
        const routes = routingResult.routes.slice(0, maxAttempts)
        const attempts: SendAttempt[] = []
        let attemptsMade = 0
        let lastError: string | undefined
        let lastChannel: Channel = routes[0].channel
        let lastProvider: Provider = routes[0].provider
        const startTime = Date.now()

        for (const route of routes) {
            lastChannel = route.channel
            lastProvider = route.provider

            // Check if provider is available (circuit breaker)
            if (this.healthTracker && !this.healthTracker.isAvailable(route.provider)) {
                attempts.push(
                    SendAttempt.skippedCircuitOpen({
                        provider: route.provider,
                        channel: route.channel,
                        attemptNumber: attemptsMade,
                    }),
                )
                continue
            }

            const adapter = await this.merchantProviderPort.getProviderAdapter(
                input.merchantId,
                route.provider,
            )

            if (!adapter) {
                attempts.push(
                    SendAttempt.skippedNotAvailable({
                        provider: route.provider,
                        channel: route.channel,
                        attemptNumber: attemptsMade,
                    }),
                )
                lastError = `Provider ${route.provider} not available`
                continue
            }

            // Try with retries
            const result = await this.executeWithRetry(
                adapter,
                {
                    phone: input.recipient.phone,
                    email: input.recipient.email,
                    telegramChatId: input.recipient.telegramChatId,
                    deviceToken: input.recipient.deviceToken,
                    text: input.payload.text,
                    subject: input.payload.subject,
                },
                retryPolicy,
                route,
                attemptsMade,
                attempts,
            )

            attemptsMade = attempts.filter((a) => !a.isSkipped()).length

            if (result.success && result.externalId) {
                // Success - create notification and return
                const notification = this.createNotification(input, route.channel, route.provider)
                notification.markAsSent(result.externalId)
                await this.notificationRepository.save(notification)

                return {
                    success: true,
                    notification,
                    usedChannel: route.channel,
                    usedProvider: route.provider,
                    routingPath: routes,
                    attemptsMade,
                    routingResult,
                    attempts,
                    totalDurationMs: Date.now() - startTime,
                }
            }

            // Failed - record error and try next route
            lastError = result.errorMessage ?? "Unknown error"
        }

        // All attempts failed
        const notification = this.createNotification(input, lastChannel, lastProvider)
        notification.markAsFailed(lastError ?? "All routes failed")
        await this.notificationRepository.save(notification)

        return {
            success: false,
            notification,
            usedChannel: lastChannel,
            usedProvider: lastProvider,
            routingPath: routes,
            attemptsMade,
            routingResult,
            errorMessage: lastError,
            attempts,
            totalDurationMs: Date.now() - startTime,
        }
    }

    /**
     * Execute a single provider with retry logic.
     */
    private async executeWithRetry(
        adapter: NotificationProviderPort,
        request: SendNotificationRequest,
        retryPolicy: RetryPolicy,
        route: ProviderRoute,
        baseAttemptNumber: number,
        attempts: SendAttempt[],
    ): Promise<{ success: boolean; externalId?: string; errorMessage?: string }> {
        let currentAttempt = 0
        const maxRetries = retryPolicy.maxRetries

        while (currentAttempt <= maxRetries) {
            const attemptStartTime = Date.now()
            const isRetry = currentAttempt > 0

            try {
                const result = await adapter.send(request)
                const durationMs = Date.now() - attemptStartTime

                if (result.success && result.externalId) {
                    // Record success
                    attempts.push(
                        SendAttempt.success({
                            provider: route.provider,
                            channel: route.channel,
                            durationMs,
                            externalId: result.externalId,
                            attemptNumber: baseAttemptNumber + currentAttempt,
                            isRetry,
                        }),
                    )

                    // Record to health tracker
                    this.healthTracker?.recordSuccess(route.provider)

                    return {
                        success: true,
                        externalId: result.externalId,
                    }
                }

                // Failed - classify error
                const providerError = ProviderError.fromMessage(
                    result.errorMessage ?? "Unknown error",
                )

                // Record failure attempt
                attempts.push(
                    SendAttempt.failed({
                        provider: route.provider,
                        channel: route.channel,
                        durationMs,
                        error: providerError,
                        attemptNumber: baseAttemptNumber + currentAttempt,
                        isRetry,
                    }),
                )

                // Record to health tracker
                this.healthTracker?.recordFailure(route.provider, providerError)

                // Check if we should retry
                const retryableType = providerError.getRetryableErrorType()
                if (retryableType && retryPolicy.shouldRetry(retryableType, currentAttempt)) {
                    // Wait before retry
                    const delay = retryPolicy.getDelayForAttempt(currentAttempt)
                    await this.sleep(delay)
                    currentAttempt++
                    continue
                }

                // Not retryable or max retries reached
                return {
                    success: false,
                    errorMessage: result.errorMessage,
                }
            } catch (error) {
                const durationMs = Date.now() - attemptStartTime
                const providerError =
                    error instanceof Error
                        ? ProviderError.fromError(error)
                        : ProviderError.fromMessage(String(error))

                // Record failure attempt
                attempts.push(
                    SendAttempt.failed({
                        provider: route.provider,
                        channel: route.channel,
                        durationMs,
                        error: providerError,
                        attemptNumber: baseAttemptNumber + currentAttempt,
                        isRetry,
                    }),
                )

                // Record to health tracker
                this.healthTracker?.recordFailure(route.provider, providerError)

                // Check if we should retry
                const retryableType = providerError.getRetryableErrorType()
                if (retryableType && retryPolicy.shouldRetry(retryableType, currentAttempt)) {
                    // Wait before retry
                    const delay = retryPolicy.getDelayForAttempt(currentAttempt)
                    await this.sleep(delay)
                    currentAttempt++
                    continue
                }

                // Not retryable or max retries reached
                return {
                    success: false,
                    errorMessage: providerError.message,
                }
            }
        }

        return {
            success: false,
            errorMessage: "Max retries exceeded",
        }
    }

    /**
     * Sleep for a specified duration.
     */
    private async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    /**
     * Create a failure result when no routes available.
     */
    private async createFailureResult(
        input: SmartSendInput,
        routingResult: RoutingResult,
        errorMessage: string,
    ): Promise<SmartSendOutput> {
        // Create notification with default channel/provider for error tracking
        const notification = this.createNotification(input, Channel.SMS, Provider.ESKIZ)
        notification.markAsFailed(errorMessage)
        await this.notificationRepository.save(notification)

        return {
            success: false,
            notification,
            usedChannel: Channel.SMS,
            usedProvider: Provider.ESKIZ,
            routingPath: [],
            attemptsMade: 0,
            routingResult,
            errorMessage,
            attempts: [],
            totalDurationMs: 0,
        }
    }

    /**
     * Create a notification entity.
     */
    private createNotification(
        input: SmartSendInput,
        channel: Channel,
        provider: Provider,
    ): Notification {
        const props: CreateNotificationProps = {
            id: input.id,
            merchantId: input.merchantId,
            channel,
            provider,
            recipient: {
                phone: input.recipient.phone,
                email: input.recipient.email,
                telegramChatId: input.recipient.telegramChatId,
                deviceToken: input.recipient.deviceToken,
            },
            payload: input.payload,
        }

        return Notification.create(props)
    }
}
