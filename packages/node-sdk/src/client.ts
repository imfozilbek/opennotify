import { HttpClient } from "./http.js"
import { OtpClient } from "./otp.js"
import { TemplatesClient } from "./templates.js"
import type {
    Notification,
    NotificationList,
    NotificationStatusResponse,
    OpenNotifyOptions,
    PaginationOptions,
    SendNotificationOptions,
    SendNotificationResult,
} from "./types/index.js"

const DEFAULT_BASE_URL = "https://api.opennotify.dev/api/v1"
const DEFAULT_TIMEOUT = 30000

/**
 * OpenNotify SDK client for sending notifications.
 *
 * @example
 * ```typescript
 * import { OpenNotify } from "@opennotify/node-sdk"
 *
 * const client = new OpenNotify({ apiKey: "your-api-key" })
 *
 * // Send SMS
 * const { notificationId } = await client.send({
 *     channel: "sms",
 *     provider: "eskiz",
 *     recipient: "+998901234567",
 *     message: "Hello from OpenNotify!",
 * })
 *
 * // Check status
 * const { status } = await client.getStatus(notificationId)
 * console.log(status) // "delivered"
 * ```
 */
export class OpenNotify {
    private readonly http: HttpClient

    /**
     * OTP client for sending and verifying one-time passwords.
     */
    public readonly otp: OtpClient

    /**
     * Templates client for managing message templates.
     */
    public readonly templates: TemplatesClient

    /**
     * Create a new OpenNotify client.
     *
     * @param options - Client configuration options
     * @throws {Error} If apiKey is not provided
     */
    constructor(options: OpenNotifyOptions) {
        if (!options.apiKey) {
            throw new Error("apiKey is required")
        }

        this.http = new HttpClient(
            options.baseUrl ?? DEFAULT_BASE_URL,
            options.apiKey,
            options.timeout ?? DEFAULT_TIMEOUT,
        )

        this.otp = new OtpClient(this.http)
        this.templates = new TemplatesClient(this.http)
    }

    /**
     * Send a notification.
     *
     * @param options - Notification options
     * @returns The created notification ID
     *
     * @example
     * ```typescript
     * // Send SMS via Eskiz
     * const result = await client.send({
     *     channel: "sms",
     *     provider: "eskiz",
     *     recipient: "+998901234567",
     *     message: "Your verification code is 1234",
     * })
     *
     * // Send Telegram message
     * const result = await client.send({
     *     channel: "telegram",
     *     provider: "telegram_bot",
     *     recipient: "123456789", // chat ID
     *     message: "Hello from OpenNotify!",
     * })
     *
     * // Send Email
     * const result = await client.send({
     *     channel: "email",
     *     provider: "sendgrid",
     *     recipient: "user@example.com",
     *     subject: "Welcome!",
     *     message: "Thank you for signing up.",
     * })
     * ```
     */
    async send(options: SendNotificationOptions): Promise<SendNotificationResult> {
        return this.http.post<SendNotificationResult>("/notifications/send", {
            channel: options.channel,
            provider: options.provider,
            recipient: this.buildRecipient(options.channel, options.recipient),
            payload: {
                text: options.message,
                subject: options.subject,
                metadata: options.metadata,
            },
        })
    }

    /**
     * Get a notification by ID.
     *
     * @param id - Notification ID
     * @returns The notification object
     *
     * @example
     * ```typescript
     * const notification = await client.getNotification("notif_123")
     * console.log(notification.status) // "delivered"
     * console.log(notification.channel) // "sms"
     * ```
     */
    async getNotification(id: string): Promise<Notification> {
        return this.http.get<Notification>(`/notifications/${id}`)
    }

    /**
     * Get notification delivery status.
     *
     * @param id - Notification ID
     * @returns The current status
     *
     * @example
     * ```typescript
     * const { status } = await client.getStatus("notif_123")
     *
     * if (status === "delivered") {
     *     console.log("Message delivered!")
     * } else if (status === "failed") {
     *     console.log("Delivery failed")
     * }
     * ```
     */
    async getStatus(id: string): Promise<NotificationStatusResponse> {
        return this.http.get<NotificationStatusResponse>(`/notifications/${id}/status`)
    }

    /**
     * List notifications with pagination.
     *
     * @param options - Pagination options
     * @returns Paginated list of notifications
     *
     * @example
     * ```typescript
     * // Get first page
     * const { notifications, total } = await client.listNotifications()
     *
     * // Get specific page
     * const page2 = await client.listNotifications({ page: 2, limit: 50 })
     * ```
     */
    async listNotifications(options?: PaginationOptions): Promise<NotificationList> {
        return this.http.get<NotificationList>("/notifications", {
            page: options?.page,
            limit: options?.limit,
        })
    }

    /**
     * Build recipient object based on channel.
     */
    private buildRecipient(channel: string, recipient: string): Record<string, string> {
        switch (channel) {
            case "sms":
            case "whatsapp":
                return { phone: recipient }
            case "email":
                return { email: recipient }
            case "telegram":
                return { telegramChatId: recipient }
            case "push":
                return { deviceToken: recipient }
            default:
                return { phone: recipient }
        }
    }
}
