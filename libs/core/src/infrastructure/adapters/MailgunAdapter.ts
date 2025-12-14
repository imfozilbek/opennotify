import * as crypto from "crypto"
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
 * Mailgun API configuration.
 */
export interface MailgunConfig {
    /** Mailgun API key */
    apiKey: string

    /** Mailgun domain (e.g., mg.example.com) */
    domain: string

    /** Default "From" email address */
    from: string

    /** Default "From" name (optional) */
    fromName?: string

    /** API base URL (default: https://api.mailgun.net/v3) */
    baseUrl?: string

    /** Request timeout in ms (default: 30000) */
    timeout?: number

    /** Use EU region (default: false) */
    euRegion?: boolean

    /** Webhook signing key (for signature verification) */
    webhookSigningKey?: string
}

/**
 * Mailgun send response.
 */
interface MailgunSendResponse {
    id: string
    message: string
}

/**
 * Mailgun webhook event payload.
 */
interface MailgunWebhookPayload {
    signature: {
        timestamp: string
        token: string
        signature: string
    }
    "event-data": {
        id: string
        event: string
        severity?: string
        reason?: string
        message: {
            headers: {
                "message-id": string
            }
        }
    }
}

/**
 * Mailgun email provider adapter.
 *
 * @see https://documentation.mailgun.com/en/latest/api-sending-messages.html
 *
 * @example
 * ```typescript
 * const mailgun = new MailgunAdapter({
 *     apiKey: "key-xxxxxxxxxxxxxxxx",
 *     domain: "mg.yourapp.com",
 *     from: "noreply@yourapp.com",
 *     fromName: "Your App",
 * })
 *
 * const result = await mailgun.send({
 *     email: "user@example.com",
 *     subject: "Welcome!",
 *     text: "<h1>Hello</h1><p>Welcome to our app!</p>",
 * })
 * ```
 */
export class MailgunAdapter implements NotificationProviderPort {
    readonly channel = Channel.EMAIL
    readonly provider = Provider.MAILGUN

    private readonly config: Required<MailgunConfig>

    constructor(config: MailgunConfig) {
        const defaultBaseUrl = config.euRegion
            ? "https://api.eu.mailgun.net/v3"
            : "https://api.mailgun.net/v3"

        this.config = {
            baseUrl: defaultBaseUrl,
            fromName: "",
            timeout: 30000,
            euRegion: false,
            webhookSigningKey: "",
            ...config,
        }
    }

    /**
     * Send email via Mailgun.
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

            // Mailgun uses form data
            const formData = new FormData()

            const fromAddress = this.config.fromName
                ? `${this.config.fromName} <${this.config.from}>`
                : this.config.from

            formData.append("from", fromAddress)
            formData.append("to", request.email)
            formData.append("subject", request.subject)

            if (isHtml) {
                formData.append("html", request.text)
                formData.append("text", this.stripHtml(request.text))
            } else {
                formData.append("text", request.text)
            }

            const response = await this.request<MailgunSendResponse>(
                `/${this.config.domain}/messages`,
                {
                    method: "POST",
                    headers: {
                        Authorization: this.getBasicAuth(),
                    },
                    body: formData,
                },
            )

            return {
                success: true,
                externalId: response.id,
                rawResponse: response,
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Unknown Mailgun error",
                rawResponse: error,
            }
        }
    }

    /**
     * Get email delivery status.
     *
     * Note: Mailgun provides events API but it's expensive to poll.
     * Use webhooks for real-time delivery status updates.
     */
    async getDeliveryStatus(externalId: string): Promise<DeliveryStatusResponse> {
        await Promise.resolve()

        // Mailgun doesn't have a simple status check endpoint
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
     * Verify and process Mailgun webhook.
     *
     * @see https://documentation.mailgun.com/en/latest/user_manual.html#webhooks
     */
    async verifyWebhook(payload: WebhookPayload): Promise<WebhookResult> {
        await Promise.resolve()

        try {
            const body = payload.body as MailgunWebhookPayload

            if (!body.signature || !body["event-data"]) {
                return {
                    valid: false,
                    errorMessage: "Invalid webhook payload structure",
                }
            }

            // Verify signature if signing key is configured
            if (this.config.webhookSigningKey) {
                const { timestamp, token, signature } = body.signature

                const expectedSignature = crypto
                    .createHmac("sha256", this.config.webhookSigningKey)
                    .update(timestamp + token)
                    .digest("hex")

                if (signature !== expectedSignature) {
                    return {
                        valid: false,
                        errorMessage: "Invalid webhook signature",
                    }
                }
            }

            const eventData = body["event-data"]
            const messageId = eventData.message?.headers?.["message-id"] ?? eventData.id

            return {
                valid: true,
                externalId: messageId,
                status: this.mapMailgunEvent(eventData.event, eventData.severity),
            }
        } catch (error) {
            return {
                valid: false,
                errorMessage: error instanceof Error ? error.message : "Invalid webhook payload",
            }
        }
    }

    /**
     * Make HTTP request to Mailgun API.
     */
    private async request<T>(path: string, options: RequestInit): Promise<T> {
        const url = `${this.config.baseUrl}${path}`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
            controller.abort()
        }, this.config.timeout)

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            })

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}))
                const errorMessage =
                    (errorBody as { message?: string }).message ?? `HTTP ${String(response.status)}`
                throw new Error(`Mailgun API error: ${errorMessage}`)
            }

            return (await response.json()) as T
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Get Basic Auth header value.
     */
    private getBasicAuth(): string {
        const credentials = Buffer.from(`api:${this.config.apiKey}`).toString("base64")
        return `Basic ${credentials}`
    }

    /**
     * Map Mailgun event to NotificationStatus.
     *
     * @see https://documentation.mailgun.com/en/latest/api-events.html#event-types
     */
    private mapMailgunEvent(event: string, severity?: string): NotificationStatus {
        // Handle failed events with severity
        if (event.toLowerCase() === "failed") {
            // Temporary failures might retry
            if (severity === "temporary") {
                return NotificationStatus.PENDING
            }
            return NotificationStatus.FAILED
        }

        const statusMap: Record<string, NotificationStatus> = {
            // Message accepted by Mailgun
            accepted: NotificationStatus.PENDING,

            // Successfully delivered
            delivered: NotificationStatus.DELIVERED,
            opened: NotificationStatus.DELIVERED,
            clicked: NotificationStatus.DELIVERED,

            // User actions (still delivered)
            unsubscribed: NotificationStatus.DELIVERED,

            // Failures
            rejected: NotificationStatus.FAILED,
            complained: NotificationStatus.FAILED,

            // Stored (for later delivery)
            stored: NotificationStatus.PENDING,
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
