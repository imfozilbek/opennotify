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
 * Telegram Bot API configuration.
 */
export interface TelegramConfig {
    /** Bot token from @BotFather */
    botToken: string

    /** API base URL (default: https://api.telegram.org) */
    baseUrl?: string

    /** Request timeout in ms (default: 30000) */
    timeout?: number

    /** Parse mode for messages (default: HTML) */
    parseMode?: "HTML" | "Markdown" | "MarkdownV2"
}

/**
 * Telegram API response wrapper.
 */
interface TelegramApiResponse<T> {
    ok: boolean
    result?: T
    description?: string
    error_code?: number
}

/**
 * Telegram message object.
 */
interface TelegramMessage {
    message_id: number
    chat: {
        id: number
        type: string
    }
    date: number
    text?: string
}

/**
 * Telegram update object (for webhooks).
 */
interface TelegramUpdate {
    update_id: number
    message?: TelegramMessage
    callback_query?: {
        id: string
        message?: TelegramMessage
    }
}

/**
 * Telegram Bot API adapter.
 *
 * @see https://core.telegram.org/bots/api
 *
 * @example
 * ```typescript
 * const telegram = new TelegramAdapter({
 *     botToken: "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
 * })
 *
 * const result = await telegram.send({
 *     telegramChatId: "123456789",
 *     text: "Hello from OpenNotify!",
 * })
 * ```
 */
export class TelegramAdapter implements NotificationProviderPort {
    readonly channel = Channel.TELEGRAM
    readonly provider = Provider.TELEGRAM_BOT

    private readonly config: Required<TelegramConfig>

    constructor(config: TelegramConfig) {
        this.config = {
            baseUrl: "https://api.telegram.org",
            timeout: 30000,
            parseMode: "HTML",
            ...config,
        }
    }

    /**
     * Send message via Telegram Bot API.
     */
    async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
        if (!request.telegramChatId) {
            return {
                success: false,
                errorMessage: "Telegram chat ID is required",
            }
        }

        try {
            const response = await this.request<TelegramMessage>("sendMessage", {
                chat_id: request.telegramChatId,
                text: request.text,
                parse_mode: this.config.parseMode,
            })

            return {
                success: true,
                externalId: String(response.message_id),
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
     * Get delivery status for a Telegram message.
     *
     * Note: Telegram Bot API doesn't provide delivery status tracking.
     * Messages are considered delivered once the API returns success.
     */
    async getDeliveryStatus(externalId: string): Promise<DeliveryStatusResponse> {
        await Promise.resolve()

        // Telegram doesn't have a delivery status API
        // If we have an external ID, the message was sent successfully
        if (externalId) {
            return {
                status: NotificationStatus.DELIVERED,
            }
        }

        return {
            status: NotificationStatus.FAILED,
            errorMessage: "No external ID provided",
        }
    }

    /**
     * Verify and process Telegram webhook update.
     *
     * @see https://core.telegram.org/bots/api#setwebhook
     */
    async verifyWebhook(payload: WebhookPayload): Promise<WebhookResult> {
        await Promise.resolve()

        try {
            const update = payload.body as TelegramUpdate

            if (!update.update_id) {
                return {
                    valid: false,
                    errorMessage: "Invalid webhook payload: missing update_id",
                }
            }

            // Extract message ID if present
            const message = update.message ?? update.callback_query?.message
            const externalId = message ? String(message.message_id) : undefined

            return {
                valid: true,
                externalId,
                // Telegram webhooks are for incoming messages, not delivery status
                // So we don't set a status here
            }
        } catch (error) {
            return {
                valid: false,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }

    /**
     * Get bot information.
     * Useful for verifying bot token is valid.
     */
    async getMe(): Promise<{
        id: number
        username: string
        first_name: string
    }> {
        return this.request("getMe", {})
    }

    /**
     * Make request to Telegram Bot API.
     */
    private async request<T>(method: string, params: Record<string, unknown>): Promise<T> {
        const url = `${this.config.baseUrl}/bot${this.config.botToken}/${method}`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
            controller.abort()
        }, this.config.timeout)

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
                signal: controller.signal,
            })

            const data = (await response.json()) as TelegramApiResponse<T>

            if (!data.ok) {
                throw new Error(
                    `Telegram API error: ${String(data.error_code)} ${data.description ?? "Unknown error"}`,
                )
            }

            return data.result as T
        } finally {
            clearTimeout(timeoutId)
        }
    }
}
