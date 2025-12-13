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
 * Eskiz API configuration.
 */
export interface EskizConfig {
    /** Eskiz account email */
    email: string

    /** Eskiz account password */
    password: string

    /** SMS sender name (registered with Eskiz) */
    from: string

    /** API base URL (default: https://notify.eskiz.uz/api) */
    baseUrl?: string

    /** Request timeout in ms (default: 30000) */
    timeout?: number
}

/**
 * Eskiz API response for auth.
 */
interface EskizAuthResponse {
    message: string
    data: {
        token: string
    }
    token_type: string
}

/**
 * Eskiz API response for sending SMS.
 */
interface EskizSendResponse {
    id: string
    status: string
    message: string
}

/**
 * Eskiz API response for status check.
 */
interface EskizStatusResponse {
    id: string
    status: string
    message?: string
}

/**
 * Eskiz SMS provider adapter.
 *
 * @see https://documenter.getpostman.com/view/663428/RzfmES4z
 *
 * @example
 * ```typescript
 * const eskiz = new EskizAdapter({
 *     email: "your@email.com",
 *     password: "your_password",
 *     from: "YourBrand",
 * })
 *
 * const result = await eskiz.send({
 *     phone: "+998901234567",
 *     text: "Your OTP code is 1234",
 * })
 * ```
 */
export class EskizAdapter implements NotificationProviderPort {
    readonly channel = Channel.SMS
    readonly provider = Provider.ESKIZ

    private readonly config: Required<EskizConfig>
    private token: string | null = null
    private tokenExpiresAt: Date | null = null

    constructor(config: EskizConfig) {
        this.config = {
            baseUrl: "https://notify.eskiz.uz/api",
            timeout: 30000,
            ...config,
        }
    }

    /**
     * Send SMS via Eskiz.
     */
    async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
        if (!request.phone) {
            return {
                success: false,
                errorMessage: "Phone number is required for SMS",
            }
        }

        try {
            const token = await this.getToken()
            const response = await this.request<EskizSendResponse>("/message/sms/send", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mobile_phone: this.normalizePhone(request.phone),
                    message: request.text,
                    from: this.config.from,
                }),
            })

            return {
                success: true,
                externalId: response.id,
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
     * Get SMS delivery status from Eskiz.
     */
    async getDeliveryStatus(externalId: string): Promise<DeliveryStatusResponse> {
        try {
            const token = await this.getToken()
            const response = await this.request<EskizStatusResponse>(
                `/message/sms/status/${externalId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            return {
                status: this.mapEskizStatus(response.status),
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
     * Verify Eskiz webhook callback.
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
                    errorMessage: "Invalid webhook payload",
                }
            }

            return {
                valid: true,
                externalId: body.message_id,
                status: this.mapEskizStatus(body.status),
            }
        } catch (error) {
            return {
                valid: false,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    /**
     * Get authentication token (cached).
     */
    private async getToken(): Promise<string> {
        if (this.token && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
            return this.token
        }

        const response = await this.request<EskizAuthResponse>("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: this.config.email,
                password: this.config.password,
            }),
        })

        this.token = response.data.token
        // Token expires in 30 days, refresh after 29 days
        this.tokenExpiresAt = new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)

        return this.token
    }

    /**
     * Make HTTP request to Eskiz API.
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
                throw new Error(`Eskiz API error: ${String(response.status)} ${errorText}`)
            }

            return (await response.json()) as T
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Normalize phone number to Eskiz format (without +).
     */
    private normalizePhone(phone: string): string {
        return phone.replace(/^\+/, "")
    }

    /**
     * Map Eskiz status to NotificationStatus.
     */
    private mapEskizStatus(eskizStatus: string): NotificationStatus {
        const statusMap: Record<string, NotificationStatus> = {
            WAITING: NotificationStatus.PENDING,
            TRANSMIT: NotificationStatus.SENT,
            DELIVERED: NotificationStatus.DELIVERED,
            FAILED: NotificationStatus.FAILED,
            EXPIRED: NotificationStatus.FAILED,
            REJECTED: NotificationStatus.FAILED,
        }

        return statusMap[eskizStatus.toUpperCase()] ?? NotificationStatus.PENDING
    }
}
