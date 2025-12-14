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
 * SendGrid API configuration.
 */
export interface SendGridConfig {
    /** SendGrid API key (starts with SG.) */
    apiKey: string

    /** Default "From" email address (must be verified in SendGrid) */
    from: string

    /** Default "From" name (optional) */
    fromName?: string

    /** API base URL (default: https://api.sendgrid.com/v3) */
    baseUrl?: string

    /** Request timeout in ms (default: 30000) */
    timeout?: number
}

/**
 * SendGrid Mail API request body.
 */
interface SendGridMailRequest {
    personalizations: {
        to: { email: string; name?: string }[]
        subject?: string
    }[]
    from: { email: string; name?: string }
    subject: string
    content: {
        type: "text/plain" | "text/html"
        value: string
    }[]
}

/**
 * SendGrid webhook event.
 */
interface SendGridWebhookEvent {
    email: string
    event: string
    sg_message_id: string
    timestamp: number
    reason?: string
    "smtp-id"?: string
}

/**
 * SendGrid email provider adapter.
 *
 * @see https://docs.sendgrid.com/api-reference/mail-send/mail-send
 *
 * @example
 * ```typescript
 * const sendgrid = new SendGridAdapter({
 *     apiKey: "SG.xxxxxxxxxxxx",
 *     from: "noreply@yourapp.com",
 *     fromName: "Your App",
 * })
 *
 * const result = await sendgrid.send({
 *     email: "user@example.com",
 *     subject: "Welcome!",
 *     text: "<h1>Hello</h1><p>Welcome to our app!</p>",
 * })
 * ```
 */
export class SendGridAdapter implements NotificationProviderPort {
    readonly channel = Channel.EMAIL
    readonly provider = Provider.SENDGRID

    private readonly config: Required<SendGridConfig>

    constructor(config: SendGridConfig) {
        this.config = {
            baseUrl: "https://api.sendgrid.com/v3",
            fromName: "",
            timeout: 30000,
            ...config,
        }
    }

    /**
     * Send email via SendGrid.
     */
    async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
        if (!request.email) {
            return {
                success: false,
                errorMessage: "Email address is required",
            }
        }

        if (!request.subject) {
            return {
                success: false,
                errorMessage: "Email subject is required",
            }
        }

        try {
            const isHtml = this.isHtmlContent(request.text)

            const mailRequest: SendGridMailRequest = {
                personalizations: [
                    {
                        to: [{ email: request.email }],
                    },
                ],
                from: this.config.fromName
                    ? { email: this.config.from, name: this.config.fromName }
                    : { email: this.config.from },
                subject: request.subject,
                content: isHtml
                    ? [
                          { type: "text/plain", value: this.stripHtml(request.text) },
                          { type: "text/html", value: request.text },
                      ]
                    : [{ type: "text/plain", value: request.text }],
            }

            const messageId = await this.sendRequest(mailRequest)

            return {
                success: true,
                externalId: messageId,
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Unknown SendGrid error",
                rawResponse: error,
            }
        }
    }

    /**
     * Get email delivery status.
     *
     * Note: SendGrid does not provide a direct API to check status.
     * Use webhooks for real-time delivery status updates.
     */
    async getDeliveryStatus(externalId: string): Promise<DeliveryStatusResponse> {
        await Promise.resolve()

        // SendGrid doesn't have a direct status check API
        // Status updates come via webhooks
        if (externalId) {
            return {
                status: NotificationStatus.SENT,
            }
        }

        return {
            status: NotificationStatus.FAILED,
            errorMessage: "No message ID provided",
        }
    }

    /**
     * Verify and process SendGrid webhook.
     *
     * @see https://docs.sendgrid.com/for-developers/tracking-events/event
     */
    async verifyWebhook(payload: WebhookPayload): Promise<WebhookResult> {
        await Promise.resolve()

        try {
            // SendGrid sends an array of events
            const events = payload.body as SendGridWebhookEvent[]

            if (!Array.isArray(events) || events.length === 0) {
                return {
                    valid: false,
                    errorMessage: "Invalid webhook payload: expected array of events",
                }
            }

            // Process first event (multiple events can be batched)
            const event = events[0]

            if (!event.sg_message_id && !event["smtp-id"]) {
                return {
                    valid: false,
                    errorMessage: "Missing message ID in webhook event",
                }
            }

            return {
                valid: true,
                externalId: event.sg_message_id || event["smtp-id"],
                status: this.mapSendGridEvent(event.event),
            }
        } catch (error) {
            return {
                valid: false,
                errorMessage: error instanceof Error ? error.message : "Invalid webhook payload",
            }
        }
    }

    /**
     * Send mail request to SendGrid API.
     */
    private async sendRequest(mailRequest: SendGridMailRequest): Promise<string | undefined> {
        const url = `${this.config.baseUrl}/mail/send`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
            controller.abort()
        }, this.config.timeout)

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(mailRequest),
                signal: controller.signal,
            })

            // SendGrid returns 202 for successful send
            if (response.status === 202) {
                return response.headers.get("x-message-id") ?? undefined
            }

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}))
                const errors = (errorBody as { errors?: { message: string }[] }).errors
                const errorMessage = errors?.[0]?.message ?? `HTTP ${String(response.status)}`
                throw new Error(`SendGrid API error: ${errorMessage}`)
            }

            return undefined
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Map SendGrid event to NotificationStatus.
     *
     * @see https://docs.sendgrid.com/for-developers/tracking-events/event#events
     */
    private mapSendGridEvent(event: string): NotificationStatus {
        const statusMap: Record<string, NotificationStatus> = {
            // Processed by SendGrid
            processed: NotificationStatus.SENT,

            // Successfully delivered
            delivered: NotificationStatus.DELIVERED,
            open: NotificationStatus.DELIVERED,
            click: NotificationStatus.DELIVERED,

            // Failed
            bounce: NotificationStatus.FAILED,
            dropped: NotificationStatus.FAILED,
            spamreport: NotificationStatus.FAILED,
            blocked: NotificationStatus.FAILED,

            // Unsubscribed (still delivered)
            unsubscribe: NotificationStatus.DELIVERED,
            group_unsubscribe: NotificationStatus.DELIVERED,

            // Deferred (temporary)
            deferred: NotificationStatus.PENDING,
        }

        return statusMap[event.toLowerCase()] ?? NotificationStatus.PENDING
    }

    /**
     * Check if content contains HTML.
     */
    private isHtmlContent(text: string): boolean {
        return (
            text.includes("<html") ||
            text.includes("<body") ||
            text.includes("<div") ||
            text.includes("<p>") ||
            text.includes("<br") ||
            text.includes("<table")
        )
    }

    /**
     * Strip HTML tags from text for plain text version.
     */
    private stripHtml(html: string): string {
        return html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
    }
}
