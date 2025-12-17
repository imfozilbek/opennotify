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
import * as crypto from "crypto"

/**
 * WhatsApp Business API configuration.
 */
export interface WhatsAppConfig {
    /** WhatsApp Business phone number ID */
    phoneNumberId: string

    /** Meta access token (long-lived) */
    accessToken: string

    /** WhatsApp Business Account ID */
    businessAccountId: string

    /** Webhook verification token (for signature verification) */
    webhookVerifyToken?: string

    /** App secret (for webhook signature verification) */
    appSecret?: string

    /** API version (default: v18.0) */
    apiVersion?: string

    /** API base URL (default: https://graph.facebook.com) */
    baseUrl?: string

    /** Request timeout in ms (default: 30000) */
    timeout?: number
}

/**
 * WhatsApp text message payload.
 */
interface WhatsAppTextMessage {
    messaging_product: "whatsapp"
    recipient_type: "individual"
    to: string
    type: "text"
    text: {
        preview_url?: boolean
        body: string
    }
}

/**
 * WhatsApp template message payload.
 */
interface WhatsAppTemplateMessage {
    messaging_product: "whatsapp"
    recipient_type: "individual"
    to: string
    type: "template"
    template: {
        name: string
        language: {
            code: string
        }
        components?: WhatsAppTemplateComponent[]
    }
}

/**
 * WhatsApp template component for variable substitution.
 */
interface WhatsAppTemplateComponent {
    type: "header" | "body" | "button"
    parameters?: WhatsAppTemplateParameter[]
    sub_type?: "quick_reply" | "url"
    index?: number
}

/**
 * WhatsApp template parameter types.
 */
type WhatsAppTemplateParameter =
    | { type: "text"; text: string }
    | { type: "currency"; currency: { fallback_value: string; code: string; amount_1000: number } }
    | { type: "date_time"; date_time: { fallback_value: string } }
    | { type: "image"; image: { link: string } }
    | { type: "document"; document: { link: string; filename?: string } }
    | { type: "video"; video: { link: string } }

/**
 * WhatsApp API response for sending messages.
 */
interface WhatsAppSendResponse {
    messaging_product: "whatsapp"
    contacts: {
        input: string
        wa_id: string
    }[]
    messages: {
        id: string
    }[]
}

/**
 * WhatsApp API error response.
 */
interface WhatsAppErrorResponse {
    error: {
        message: string
        type: string
        code: number
        error_subcode?: number
        fbtrace_id: string
    }
}

/**
 * WhatsApp webhook notification entry.
 */
interface WhatsAppWebhookEntry {
    id: string
    changes: {
        value: {
            messaging_product: "whatsapp"
            metadata: {
                display_phone_number: string
                phone_number_id: string
            }
            statuses?: {
                id: string
                status: "sent" | "delivered" | "read" | "failed"
                timestamp: string
                recipient_id: string
                errors?: {
                    code: number
                    title: string
                }[]
            }[]
            messages?: {
                from: string
                id: string
                timestamp: string
                type: string
                text?: { body: string }
            }[]
        }
        field: string
    }[]
}

/**
 * WhatsApp webhook payload structure.
 */
interface WhatsAppWebhookPayload {
    object: "whatsapp_business_account"
    entry: WhatsAppWebhookEntry[]
}

/**
 * Options for WhatsApp message sending.
 */
export interface WhatsAppMessageOptions {
    /** Template name (required for template messages) */
    templateName?: string

    /** Template language code (default: en) */
    templateLanguage?: string

    /** Template variables for header */
    headerVariables?: string[]

    /** Template variables for body */
    bodyVariables?: string[]

    /** Template variables for buttons */
    buttonVariables?: string[]

    /** Enable URL preview for text messages */
    previewUrl?: boolean
}

/**
 * WhatsApp Business API adapter.
 *
 * Supports the WhatsApp Cloud API (hosted by Meta).
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * @example
 * ```typescript
 * // Text message
 * const whatsapp = new WhatsAppAdapter({
 *     phoneNumberId: "123456789",
 *     accessToken: "EAAxxxxxxx",
 *     businessAccountId: "987654321",
 * })
 *
 * const result = await whatsapp.send({
 *     phone: "+998901234567",
 *     text: "Hello! This is a test message.",
 * })
 *
 * // Template message (for business-initiated conversations)
 * const result = await whatsapp.send({
 *     phone: "+998901234567",
 *     text: "", // Ignored for templates
 *     options: {
 *         templateName: "otp_code",
 *         templateLanguage: "en",
 *         bodyVariables: ["123456"],
 *     },
 * })
 * ```
 */
export class WhatsAppAdapter implements NotificationProviderPort {
    readonly channel = Channel.WHATSAPP
    readonly provider = Provider.WHATSAPP_BUSINESS

    private readonly config: Required<Omit<WhatsAppConfig, "webhookVerifyToken" | "appSecret">> &
        Pick<WhatsAppConfig, "webhookVerifyToken" | "appSecret">

    constructor(config: WhatsAppConfig) {
        this.config = {
            apiVersion: "v18.0",
            baseUrl: "https://graph.facebook.com",
            timeout: 30000,
            ...config,
        }
    }

    /**
     * Send message via WhatsApp Business API.
     *
     * Supports both text messages and template messages.
     * Template messages are required for business-initiated conversations
     * (when the user hasn't messaged you in the last 24 hours).
     */
    async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
        if (!request.phone) {
            return {
                success: false,
                errorMessage: "Phone number is required for WhatsApp",
            }
        }

        try {
            const options = request.options as WhatsAppMessageOptions | undefined
            const payload = options?.templateName
                ? this.buildTemplateMessage(request.phone, options)
                : this.buildTextMessage(request.phone, request.text, options)

            const response = await this.sendRequest<WhatsAppSendResponse>(payload)

            return {
                success: true,
                externalId: response.messages[0].id,
                rawResponse: response,
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Unknown WhatsApp error",
                rawResponse: error,
            }
        }
    }

    /**
     * Get message delivery status.
     *
     * Note: WhatsApp Cloud API does not provide a direct status check endpoint.
     * Use webhooks for real-time delivery status updates.
     */
    async getDeliveryStatus(externalId: string): Promise<DeliveryStatusResponse> {
        await Promise.resolve()

        // WhatsApp doesn't have a direct status check API
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
     * Verify and process WhatsApp webhook.
     *
     * WhatsApp sends status updates and incoming messages via webhooks.
     * Supports HMAC-SHA256 signature verification when appSecret is configured.
     *
     * @see https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks
     */
    async verifyWebhook(payload: WebhookPayload): Promise<WebhookResult> {
        await Promise.resolve()

        try {
            // Verify signature if appSecret is configured
            if (this.config.appSecret && payload.headers) {
                const signature = this.getHeader(payload.headers, "x-hub-signature-256")
                if (!signature) {
                    return {
                        valid: false,
                        errorMessage: "Missing webhook signature",
                    }
                }

                const rawBody =
                    typeof payload.body === "string" ? payload.body : JSON.stringify(payload.body)
                const expectedSignature = this.computeSignature(rawBody)

                if (!this.secureCompare(signature, `sha256=${expectedSignature}`)) {
                    return {
                        valid: false,
                        errorMessage: "Invalid webhook signature",
                    }
                }
            }

            // Parse webhook payload
            const webhookData = (
                typeof payload.body === "string" ? JSON.parse(payload.body) : payload.body
            ) as WhatsAppWebhookPayload

            if (webhookData.object !== "whatsapp_business_account") {
                return {
                    valid: false,
                    errorMessage: "Invalid webhook object type",
                }
            }

            // Extract status update from webhook
            const statusUpdate = this.extractStatusUpdate(webhookData)

            if (!statusUpdate) {
                // Might be an incoming message, not a status update
                return {
                    valid: true,
                    // No status update, but webhook is valid
                }
            }

            return {
                valid: true,
                externalId: statusUpdate.messageId,
                status: statusUpdate.status,
            }
        } catch (error) {
            return {
                valid: false,
                errorMessage: error instanceof Error ? error.message : "Invalid webhook payload",
            }
        }
    }

    /**
     * Build text message payload.
     */
    private buildTextMessage(
        phone: string,
        text: string,
        options?: WhatsAppMessageOptions,
    ): WhatsAppTextMessage {
        return {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: this.normalizePhone(phone),
            type: "text",
            text: {
                preview_url: options?.previewUrl ?? false,
                body: text,
            },
        }
    }

    /**
     * Build template message payload.
     */
    private buildTemplateMessage(
        phone: string,
        options: WhatsAppMessageOptions,
    ): WhatsAppTemplateMessage {
        const components: WhatsAppTemplateComponent[] = []

        // Add header parameters
        if (options.headerVariables?.length) {
            components.push({
                type: "header",
                parameters: options.headerVariables.map((text) => ({ type: "text", text })),
            })
        }

        // Add body parameters
        if (options.bodyVariables?.length) {
            components.push({
                type: "body",
                parameters: options.bodyVariables.map((text) => ({ type: "text", text })),
            })
        }

        // Add button parameters
        if (options.buttonVariables?.length) {
            options.buttonVariables.forEach((text, index) => {
                components.push({
                    type: "button",
                    sub_type: "quick_reply",
                    index,
                    parameters: [{ type: "text", text }],
                })
            })
        }

        // templateName is guaranteed to exist when this method is called
        const templateName = options.templateName ?? ""

        return {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: this.normalizePhone(phone),
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: options.templateLanguage ?? "en",
                },
                ...(components.length > 0 && { components }),
            },
        }
    }

    /**
     * Send request to WhatsApp Cloud API.
     */
    private async sendRequest<T>(
        payload: WhatsAppTextMessage | WhatsAppTemplateMessage,
    ): Promise<T> {
        const url = `${this.config.baseUrl}/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
            controller.abort()
        }, this.config.timeout)

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.config.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            })

            const responseBody = (await response.json()) as T | WhatsAppErrorResponse

            if (!response.ok) {
                const errorResponse = responseBody as WhatsAppErrorResponse
                throw new Error(
                    `WhatsApp API error: ${errorResponse.error.message} (code: ${String(errorResponse.error.code)})`,
                )
            }

            return responseBody as T
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Normalize phone number to WhatsApp format.
     *
     * WhatsApp expects phone numbers without + prefix.
     */
    private normalizePhone(phone: string): string {
        return phone.replace(/^\+/, "").replace(/[\s\-()]/g, "")
    }

    /**
     * Extract status update from webhook payload.
     */
    private extractStatusUpdate(
        webhookData: WhatsAppWebhookPayload,
    ): { messageId: string; status: NotificationStatus } | null {
        for (const entry of webhookData.entry) {
            for (const change of entry.changes) {
                const statuses = change.value.statuses
                if (statuses?.length) {
                    const status = statuses[0]
                    return {
                        messageId: status.id,
                        status: this.mapWhatsAppStatus(status.status),
                    }
                }
            }
        }
        return null
    }

    /**
     * Map WhatsApp status to NotificationStatus.
     */
    private mapWhatsAppStatus(
        whatsappStatus: "sent" | "delivered" | "read" | "failed",
    ): NotificationStatus {
        const statusMap: Record<string, NotificationStatus> = {
            sent: NotificationStatus.SENT,
            delivered: NotificationStatus.DELIVERED,
            read: NotificationStatus.DELIVERED,
            failed: NotificationStatus.FAILED,
        }

        return statusMap[whatsappStatus] ?? NotificationStatus.PENDING
    }

    /**
     * Compute HMAC-SHA256 signature for webhook verification.
     * appSecret is guaranteed to exist when this method is called.
     */
    private computeSignature(payload: string): string {
        const secret = this.config.appSecret ?? ""
        return crypto.createHmac("sha256", secret).update(payload).digest("hex")
    }

    /**
     * Timing-safe string comparison to prevent timing attacks.
     */
    private secureCompare(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false
        }
        return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
    }

    /**
     * Get header value (case-insensitive).
     */
    private getHeader(headers: Record<string, string>, name: string): string | undefined {
        const lowerName = name.toLowerCase()
        for (const [key, value] of Object.entries(headers)) {
            if (key.toLowerCase() === lowerName) {
                return value
            }
        }
        return undefined
    }
}
