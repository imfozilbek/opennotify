import { Channel } from "../../domain/value-objects/Channel"
import { Provider } from "../../domain/value-objects/Provider"
import { NotificationStatus } from "../../domain/value-objects/NotificationStatus"

/**
 * Request to send a notification via provider.
 */
export interface SendNotificationRequest {
    /** Recipient phone number (E.164 format) */
    phone?: string

    /** Recipient email address */
    email?: string

    /** Telegram chat ID */
    telegramChatId?: string

    /** Push device token */
    deviceToken?: string

    /** Message text */
    text: string

    /** Email subject */
    subject?: string

    /** Additional provider-specific options */
    options?: Record<string, unknown>
}

/**
 * Response from sending a notification.
 */
export interface SendNotificationResponse {
    /** Whether the send request was successful */
    success: boolean

    /** Provider's message ID for tracking */
    externalId?: string

    /** Error message if failed */
    errorMessage?: string

    /** Raw provider response for debugging */
    rawResponse?: unknown
}

/**
 * Response from checking delivery status.
 */
export interface DeliveryStatusResponse {
    /** Current delivery status */
    status: NotificationStatus

    /** Timestamp when status was updated */
    updatedAt?: Date

    /** Error details if failed */
    errorMessage?: string

    /** Raw provider response */
    rawResponse?: unknown
}

/**
 * Webhook payload from provider.
 */
export interface WebhookPayload {
    /** Raw webhook body */
    body: unknown

    /** Webhook headers */
    headers: Record<string, string>

    /** Provider-specific signature for verification */
    signature?: string
}

/**
 * Result of processing a webhook.
 */
export interface WebhookResult {
    /** Whether webhook was valid */
    valid: boolean

    /** Provider's message ID */
    externalId?: string

    /** New status from webhook */
    status?: NotificationStatus

    /** Error message if webhook processing failed */
    errorMessage?: string
}

/**
 * Port interface for notification providers.
 * All provider adapters must implement this interface.
 *
 * @example
 * ```typescript
 * class EskizAdapter implements NotificationProviderPort {
 *     readonly channel = Channel.SMS
 *     readonly provider = Provider.ESKIZ
 *
 *     async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
 *         // Eskiz-specific implementation
 *     }
 * }
 * ```
 */
export interface NotificationProviderPort {
    /** Channel this provider supports */
    readonly channel: Channel

    /** Provider identifier */
    readonly provider: Provider

    /**
     * Send a notification.
     */
    send(request: SendNotificationRequest): Promise<SendNotificationResponse>

    /**
     * Get delivery status for a sent message.
     * @param externalId - Provider's message ID
     */
    getDeliveryStatus(externalId: string): Promise<DeliveryStatusResponse>

    /**
     * Verify and process incoming webhook.
     */
    verifyWebhook(payload: WebhookPayload): Promise<WebhookResult>
}
