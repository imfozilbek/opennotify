import { Channel } from "../../domain/value-objects/Channel"
import { Provider } from "../../domain/value-objects/Provider"
import { NotificationStatus } from "../../domain/value-objects/NotificationStatus"
import {
    DeliveryStatusResponse,
    NotificationProviderPort,
    SendNotificationRequest,
    SendNotificationResponse,
    WebhookPayload,
    WebhookResult,
} from "../../application/ports/NotificationProviderPort"

/**
 * Apple Push Notification Service configuration.
 */
export interface ApnsConfig {
    /** Key ID from Apple Developer Portal */
    keyId: string

    /** Team ID from Apple Developer Portal */
    teamId: string

    /** Private key content (p8 file content) */
    privateKey: string

    /** App bundle identifier (e.g., com.example.app) */
    bundleId: string

    /** Use production environment (default: false for sandbox) */
    production?: boolean

    /** Request timeout in ms (default: 30000) */
    timeout?: number
}

/**
 * apns2 module type for dynamic import.
 */
interface Apns2Module {
    ApnsClient: new (options: Apns2Options) => Apns2Client
    Notification: new (deviceToken: string, options?: Apns2NotificationOptions) => Apns2Notification
}

/**
 * apns2 client options.
 */
interface Apns2Options {
    team: string
    signingKey: string
    keyId: string
    defaultTopic?: string
    host?: string
    requestTimeout?: number
}

/**
 * apns2 client interface.
 */
interface Apns2Client {
    send(notification: Apns2Notification): Promise<Apns2Notification>
    close(): Promise<void>
}

/**
 * apns2 notification options.
 */
interface Apns2NotificationOptions {
    alert?:
        | string
        | {
              title?: string
              subtitle?: string
              body: string
          }
    badge?: number
    sound?: string
    data?: Record<string, unknown>
    contentAvailable?: boolean
    mutableContent?: boolean
    threadId?: string
    category?: string
    priority?: number
    expiration?: number | Date
    collapseId?: string
    topic?: string
}

/**
 * apns2 notification instance.
 */
interface Apns2Notification {
    deviceToken: string
    options: Apns2NotificationOptions
}

/**
 * Apple Push Notification Service (APNs) provider adapter.
 *
 * Uses apns2 package for HTTP/2 communication with Apple's servers.
 * Install apns2: `pnpm add apns2`
 *
 * @see https://developer.apple.com/documentation/usernotifications
 *
 * @example
 * ```typescript
 * const apns = new ApnsAdapter({
 *     keyId: "ABC123DEFG",
 *     teamId: "DEF456GHIJ",
 *     privateKey: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
 *     bundleId: "com.example.myapp",
 *     production: true,
 * })
 *
 * const result = await apns.send({
 *     deviceToken: "device_token_here",
 *     subject: "New Message",
 *     text: "You have a new notification!",
 *     options: {
 *         badge: 1,
 *         sound: "default",
 *     },
 * })
 * ```
 */
export class ApnsAdapter implements NotificationProviderPort {
    readonly channel = Channel.PUSH
    readonly provider = Provider.APNS

    private readonly config: Required<ApnsConfig>
    private client: Apns2Client | null = null
    private apns2Module: Apns2Module | null = null

    constructor(config: ApnsConfig) {
        this.config = {
            production: false,
            timeout: 30000,
            ...config,
        }
    }

    /**
     * Send push notification via APNs.
     */
    async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
        if (!request.deviceToken) {
            return {
                success: false,
                errorMessage: "Device token is required for push notifications",
            }
        }

        try {
            const { client, NotificationClass } = await this.getClient()

            const options = this.buildNotificationOptions(request)
            const notification = new NotificationClass(request.deviceToken, options)

            const result = await client.send(notification)

            return {
                success: true,
                externalId: result.deviceToken,
                rawResponse: result,
            }
        } catch (error) {
            // Handle apns2 errors
            const errorMessage = this.extractErrorMessage(error)

            return {
                success: false,
                errorMessage,
                rawResponse: error,
            }
        }
    }

    /**
     * Get push notification delivery status.
     *
     * Note: APNs does not provide a direct API to check delivery status.
     * Once APNs accepts the message, it returns SENT status.
     * For actual delivery confirmation, implement client-side delivery receipts.
     */
    async getDeliveryStatus(externalId: string): Promise<DeliveryStatusResponse> {
        await Promise.resolve()

        // APNs doesn't have a direct status check API
        // If we have an externalId, the message was accepted by APNs
        if (externalId) {
            return {
                status: NotificationStatus.SENT,
            }
        }

        return {
            status: NotificationStatus.FAILED,
            errorMessage: "No device token provided",
        }
    }

    /**
     * Verify APNs webhook.
     *
     * Note: APNs does not send delivery webhooks.
     * This method always returns invalid.
     */
    async verifyWebhook(_payload: WebhookPayload): Promise<WebhookResult> {
        await Promise.resolve()

        return {
            valid: false,
            errorMessage: "APNs does not support delivery webhooks",
        }
    }

    /**
     * Get or create apns2 client.
     */
    private async getClient(): Promise<{
        client: Apns2Client
        NotificationClass: Apns2Module["Notification"]
    }> {
        if (this.client && this.apns2Module) {
            return {
                client: this.client,
                NotificationClass: this.apns2Module.Notification,
            }
        }

        // Dynamic import of apns2
        try {
            this.apns2Module = (await import("apns2")) as unknown as Apns2Module
        } catch {
            throw new Error("apns2 is required for ApnsAdapter. Install it with: pnpm add apns2")
        }

        const { ApnsClient } = this.apns2Module

        this.client = new ApnsClient({
            team: this.config.teamId,
            keyId: this.config.keyId,
            signingKey: this.config.privateKey,
            defaultTopic: this.config.bundleId,
            host: this.config.production ? "api.push.apple.com" : "api.sandbox.push.apple.com",
            requestTimeout: this.config.timeout,
        })

        return {
            client: this.client,
            NotificationClass: this.apns2Module.Notification,
        }
    }

    /**
     * Build notification options from request.
     */
    private buildNotificationOptions(request: SendNotificationRequest): Apns2NotificationOptions {
        const options: Apns2NotificationOptions = {}

        // Build alert
        options.alert = this.buildAlert(request)

        // Apply additional options from request.options
        if (request.options) {
            this.applyRequestOptions(options, request.options)
        }

        return options
    }

    /**
     * Build alert from request.
     */
    private buildAlert(request: SendNotificationRequest): Apns2NotificationOptions["alert"] {
        if (request.subject) {
            return { title: request.subject, body: request.text }
        }
        return request.text
    }

    /**
     * Apply request options to notification options.
     */
    private applyRequestOptions(
        options: Apns2NotificationOptions,
        reqOptions: Record<string, unknown>,
    ): void {
        if (typeof reqOptions.badge === "number") {
            options.badge = reqOptions.badge
        }
        if (typeof reqOptions.sound === "string") {
            options.sound = reqOptions.sound
        }
        if (reqOptions.contentAvailable) {
            options.contentAvailable = true
        }
        if (reqOptions.mutableContent) {
            options.mutableContent = true
        }
        if (typeof reqOptions.threadId === "string") {
            options.threadId = reqOptions.threadId
        }
        if (typeof reqOptions.category === "string") {
            options.category = reqOptions.category
        }
        if (reqOptions.data) {
            options.data = reqOptions.data as Record<string, unknown>
        }
        if (reqOptions.priority === "high" || reqOptions.priority === "normal") {
            options.priority = reqOptions.priority === "high" ? 10 : 5
        }
        if (typeof reqOptions.expiration === "number") {
            options.expiration = reqOptions.expiration
        }
        if (typeof reqOptions.collapseId === "string") {
            options.collapseId = reqOptions.collapseId
        }
    }

    /**
     * Extract error message from apns2 error.
     */
    private extractErrorMessage(error: unknown): string {
        if (error instanceof Error) {
            // Check for apns2-specific error properties
            const apnsError = error as Error & { reason?: string; statusCode?: number }
            if (apnsError.reason) {
                return `APNs error: ${apnsError.reason}`
            }
            if (apnsError.statusCode) {
                return `APNs error: HTTP ${String(apnsError.statusCode)} - ${apnsError.message}`
            }
            return apnsError.message
        }
        return "Unknown APNs error"
    }

    /**
     * Close APNs connection.
     */
    async close(): Promise<void> {
        if (this.client) {
            await this.client.close()
            this.client = null
        }
    }
}
