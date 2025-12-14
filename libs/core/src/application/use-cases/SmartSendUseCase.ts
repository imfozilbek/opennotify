import { CreateNotificationProps, Notification } from "../../domain/entities/Notification"
import { Recipient } from "../../domain/entities/Recipient"
import { Channel } from "../../domain/value-objects/Channel"
import { MessageType } from "../../domain/value-objects/MessageType"
import { getChannelForProvider, Provider } from "../../domain/value-objects/Provider"
import { RoutingContext } from "../../domain/value-objects/RoutingContext"
import { hasRoutes, ProviderRoute, RoutingResult } from "../../domain/value-objects/RoutingResult"
import { RoutingEngine } from "../services/RoutingEngine"
import { MerchantProviderPort } from "../ports/MerchantProviderPort"
import { NotificationRepositoryPort } from "../ports/NotificationRepositoryPort"
import { RecipientRepositoryPort } from "../ports/RecipientRepositoryPort"

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

        // Try routes in order
        return this.executeWithFallback(input, routingResult, maxAttempts)
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
            }
        }

        const notification = this.createNotification(input, adapter.channel, provider)

        const result = await adapter.send({
            phone: input.recipient.phone,
            email: input.recipient.email,
            telegramChatId: input.recipient.telegramChatId,
            deviceToken: input.recipient.deviceToken,
            text: input.payload.text,
            subject: input.payload.subject,
        })

        if (result.success && result.externalId) {
            notification.markAsSent(result.externalId)
        } else {
            notification.markAsFailed(result.errorMessage ?? "Unknown error")
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
        }
    }

    /**
     * Execute with fallback chain.
     */
    private async executeWithFallback(
        input: SmartSendInput,
        routingResult: RoutingResult,
        maxAttempts: number,
    ): Promise<SmartSendOutput> {
        const routes = routingResult.routes.slice(0, maxAttempts)
        let attemptsMade = 0
        let lastError: string | undefined
        let lastChannel: Channel = routes[0].channel
        let lastProvider: Provider = routes[0].provider

        for (const route of routes) {
            attemptsMade++
            lastChannel = route.channel
            lastProvider = route.provider

            const adapter = await this.merchantProviderPort.getProviderAdapter(
                input.merchantId,
                route.provider,
            )

            if (!adapter) {
                lastError = `Provider ${route.provider} not available`
                continue
            }

            const result = await adapter.send({
                phone: input.recipient.phone,
                email: input.recipient.email,
                telegramChatId: input.recipient.telegramChatId,
                deviceToken: input.recipient.deviceToken,
                text: input.payload.text,
                subject: input.payload.subject,
            })

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
                }
            }

            // Failed - record error and try next
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
        }
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
