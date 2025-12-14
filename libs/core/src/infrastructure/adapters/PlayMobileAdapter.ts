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
 * PlayMobile API configuration.
 */
export interface PlayMobileConfig {
    /** PlayMobile account username */
    username: string

    /** PlayMobile account password */
    password: string

    /** Sender ID (registered with PlayMobile) */
    sender: string

    /** API base URL (default: https://send.playmobile.uz) */
    baseUrl?: string

    /** Request timeout in ms (default: 30000) */
    timeout?: number
}

/**
 * PlayMobile SMS message structure.
 */
interface PlayMobileSms {
    id: string
    sender: string
    recipient: string
    text: string
}

/**
 * PlayMobile API response for sending SMS.
 */
interface PlayMobileSendResponse {
    status: string
    message?: string
    data?: {
        id: string
        status: string
    }
}

/**
 * PlayMobile status response.
 */
interface PlayMobileStatusResponse {
    status: string
    message_id: string
    delivery_status: string
}

/**
 * PlayMobile SMS provider adapter.
 *
 * PlayMobile is a major SMS provider in Uzbekistan offering
 * reliable SMS delivery with competitive pricing.
 *
 * @see https://wiki.playmobile.uz
 *
 * @example
 * ```typescript
 * const playmobile = new PlayMobileAdapter({
 *     username: "your_username",
 *     password: "your_password",
 *     sender: "YourBrand",
 * })
 *
 * const result = await playmobile.send({
 *     phone: "+998901234567",
 *     text: "Your OTP code is 1234",
 * })
 *
 * if (result.success) {
 *     console.log("Sent! ID:", result.externalId)
 * }
 * ```
 */
export class PlayMobileAdapter implements NotificationProviderPort {
    readonly channel = Channel.SMS
    readonly provider = Provider.PLAYMOBILE

    private readonly config: Required<PlayMobileConfig>

    constructor(config: PlayMobileConfig) {
        this.config = {
            baseUrl: "https://send.playmobile.uz",
            timeout: 30000,
            ...config,
        }
    }

    /**
     * Send SMS via PlayMobile.
     */
    async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
        if (!request.phone) {
            return {
                success: false,
                errorMessage: "Phone number is required for SMS",
            }
        }

        try {
            const messageId = this.generateMessageId()
            const sms: PlayMobileSms = {
                id: messageId,
                sender: this.config.sender,
                recipient: this.normalizePhone(request.phone),
                text: request.text,
            }

            const response = await this.request<PlayMobileSendResponse>("/broker-api/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.getBasicAuth(),
                },
                body: JSON.stringify({
                    messages: [sms],
                }),
            })

            if (response.status === "success" || response.status === "ok") {
                return {
                    success: true,
                    externalId: response.data?.id ?? messageId,
                    rawResponse: response,
                }
            }

            return {
                success: false,
                errorMessage: response.message ?? "Unknown error from PlayMobile",
                rawResponse: response,
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
                rawResponse: error,
            }
        }
    }

    /**
     * Get SMS delivery status from PlayMobile.
     */
    async getDeliveryStatus(externalId: string): Promise<DeliveryStatusResponse> {
        try {
            const response = await this.request<PlayMobileStatusResponse>(
                `/broker-api/status/${externalId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: this.getBasicAuth(),
                    },
                },
            )

            return {
                status: this.mapPlayMobileStatus(response.delivery_status),
                rawResponse: response,
            }
        } catch (error) {
            return {
                status: NotificationStatus.FAILED,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
                rawResponse: error,
            }
        }
    }

    /**
     * Verify PlayMobile webhook callback.
     */
    async verifyWebhook(payload: WebhookPayload): Promise<WebhookResult> {
        await Promise.resolve()

        try {
            const body = payload.body as {
                message_id?: string
                status?: string
            }

            if (!body.message_id || !body.status) {
                return {
                    valid: false,
                    errorMessage: "Invalid webhook payload: missing message_id or status",
                }
            }

            return {
                valid: true,
                externalId: body.message_id,
                status: this.mapPlayMobileStatus(body.status),
            }
        } catch (error) {
            return {
                valid: false,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    /**
     * Get Basic Authentication header value.
     */
    private getBasicAuth(): string {
        const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString(
            "base64",
        )
        return `Basic ${credentials}`
    }

    /**
     * Make HTTP request to PlayMobile API.
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
                const errorText = await response.text()
                throw new Error(`PlayMobile API error: ${String(response.status)} ${errorText}`)
            }

            return (await response.json()) as T
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Normalize phone number (remove + prefix).
     */
    private normalizePhone(phone: string): string {
        return phone.replace(/^\+/, "")
    }

    /**
     * Generate unique message ID.
     */
    private generateMessageId(): string {
        return `pm_${String(Date.now())}_${Math.random().toString(36).substring(2, 9)}`
    }

    /**
     * Map PlayMobile status to NotificationStatus.
     */
    private mapPlayMobileStatus(status: string): NotificationStatus {
        const statusMap: Record<string, NotificationStatus> = {
            PENDING: NotificationStatus.PENDING,
            WAITING: NotificationStatus.PENDING,
            SENT: NotificationStatus.SENT,
            TRANSMIT: NotificationStatus.SENT,
            DELIVERED: NotificationStatus.DELIVERED,
            FAILED: NotificationStatus.FAILED,
            EXPIRED: NotificationStatus.FAILED,
            REJECTED: NotificationStatus.FAILED,
            UNDELIVERABLE: NotificationStatus.FAILED,
        }

        return statusMap[status.toUpperCase()] ?? NotificationStatus.PENDING
    }
}
