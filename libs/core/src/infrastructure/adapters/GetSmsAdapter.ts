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
 * GetSMS API configuration.
 */
export interface GetSmsConfig {
    /** GetSMS account login */
    login: string

    /** GetSMS account password */
    password: string

    /** Alpha-name/nickname for sending (optional) */
    nickname?: string

    /** API base URL (default: http://185.8.212.184/smsgateway) */
    baseUrl?: string

    /** Request timeout in ms (default: 30000) */
    timeout?: number
}

/**
 * GetSMS send request data item.
 */
interface GetSmsSendItem {
    phone: string
    text: string
}

/**
 * GetSMS API response for sending SMS.
 */
interface GetSmsSendResponse {
    status?: string
    error_code?: number
    error_message?: string
    data?: {
        recipient: string
        text: string
        user_id: string
        message_id: string
        request_id: string
    }[]
}

/**
 * GetSMS status response item.
 */
interface GetSmsStatusItem {
    request_id: string
    status: string
    description?: string
    delivery_time?: string
}

/**
 * GetSMS API response for status check.
 */
interface GetSmsStatusResponse {
    error_code?: number
    error_message?: string
    data?: GetSmsStatusItem[]
}

/**
 * GetSMS SMS provider adapter.
 *
 * GetSMS is an SMS provider in Uzbekistan offering
 * affordable SMS delivery services.
 *
 * @see https://getsms.uz/page/index/16
 *
 * @example
 * ```typescript
 * const getsms = new GetSmsAdapter({
 *     login: "your_login",
 *     password: "your_password",
 *     nickname: "YourBrand",
 * })
 *
 * const result = await getsms.send({
 *     phone: "+998901234567",
 *     text: "Your OTP code is 1234",
 * })
 *
 * if (result.success) {
 *     console.log("Sent! ID:", result.externalId)
 * }
 * ```
 */
export class GetSmsAdapter implements NotificationProviderPort {
    readonly channel = Channel.SMS
    readonly provider = Provider.GETSMS

    private readonly config: Required<GetSmsConfig>

    constructor(config: GetSmsConfig) {
        this.config = {
            baseUrl: "http://185.8.212.184/smsgateway",
            timeout: 30000,
            nickname: "",
            ...config,
        }
    }

    /**
     * Send SMS via GetSMS.
     */
    async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
        if (!request.phone) {
            return {
                success: false,
                errorMessage: "Phone number is required for SMS",
            }
        }

        try {
            const smsData: GetSmsSendItem[] = [
                {
                    phone: this.normalizePhone(request.phone),
                    text: request.text,
                },
            ]

            const formData = new URLSearchParams()
            formData.append("login", this.config.login)
            formData.append("password", this.config.password)
            if (this.config.nickname) {
                formData.append("nickname", this.config.nickname)
            }
            formData.append("data", JSON.stringify(smsData))

            const response = await this.request<GetSmsSendResponse>("/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            })

            // Check for error codes
            if (response.error_code) {
                return {
                    success: false,
                    errorMessage: this.getErrorMessage(response.error_code),
                    rawResponse: response,
                }
            }

            if (response.data && response.data.length > 0) {
                return {
                    success: true,
                    externalId: response.data[0].request_id,
                    rawResponse: response,
                }
            }

            return {
                success: false,
                errorMessage: "No response data from GetSMS",
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
     * Get SMS delivery status from GetSMS.
     */
    async getDeliveryStatus(externalId: string): Promise<DeliveryStatusResponse> {
        try {
            const formData = new URLSearchParams()
            formData.append("login", this.config.login)
            formData.append("password", this.config.password)
            formData.append("data", JSON.stringify([{ request_id: externalId }]))

            const response = await this.request<GetSmsStatusResponse>("/status/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData.toString(),
            })

            if (response.error_code) {
                return {
                    status: NotificationStatus.FAILED,
                    errorMessage: this.getErrorMessage(response.error_code),
                    rawResponse: response,
                }
            }

            if (response.data && response.data.length > 0) {
                return {
                    status: this.mapGetSmsStatus(response.data[0].status),
                    rawResponse: response,
                }
            }

            return {
                status: NotificationStatus.PENDING,
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
     * Verify GetSMS webhook callback.
     */
    async verifyWebhook(payload: WebhookPayload): Promise<WebhookResult> {
        await Promise.resolve()

        try {
            const body = payload.body as {
                request_id?: string
                status?: string
            }

            if (!body.request_id || !body.status) {
                return {
                    valid: false,
                    errorMessage: "Invalid webhook payload: missing request_id or status",
                }
            }

            return {
                valid: true,
                externalId: body.request_id,
                status: this.mapGetSmsStatus(body.status),
            }
        } catch (error) {
            return {
                valid: false,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    /**
     * Make HTTP request to GetSMS API.
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
                throw new Error(`GetSMS API error: ${String(response.status)} ${errorText}`)
            }

            return (await response.json()) as T
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Normalize phone number (remove + and ensure 998 prefix).
     */
    private normalizePhone(phone: string): string {
        let normalized = phone.replace(/^\+/, "")
        // Ensure Uzbekistan country code
        if (!normalized.startsWith("998")) {
            normalized = `998${normalized}`
        }
        return normalized
    }

    /**
     * Get error message from GetSMS error code.
     */
    private getErrorMessage(errorCode: number): string {
        const errorMessages: Record<number, string> = {
            100: "Login or password is NULL",
            101: "Incorrect login or password",
            102: "Account is blocked",
            103: "Limit is over",
            104: "Invalid request format",
            105: "Service temporarily unavailable",
            300: "Invalid phone number",
            301: "Invalid sender name",
            302: "Message text is empty",
            303: "Message text too long",
        }

        return errorMessages[errorCode] ?? `Unknown error (code: ${String(errorCode)})`
    }

    /**
     * Map GetSMS status to NotificationStatus.
     */
    private mapGetSmsStatus(status: string): NotificationStatus {
        const statusMap: Record<string, NotificationStatus> = {
            pending: NotificationStatus.PENDING,
            waiting: NotificationStatus.PENDING,
            sent: NotificationStatus.SENT,
            delivered: NotificationStatus.DELIVERED,
            failed: NotificationStatus.FAILED,
            expired: NotificationStatus.FAILED,
            rejected: NotificationStatus.FAILED,
        }

        return statusMap[status.toLowerCase()] ?? NotificationStatus.PENDING
    }
}
