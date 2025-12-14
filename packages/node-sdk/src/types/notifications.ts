import type { Channel, NotificationStatus, Provider } from "./common.js"

/**
 * Options for sending a notification.
 */
export interface SendNotificationOptions {
    /**
     * Delivery channel.
     */
    channel: Channel

    /**
     * Provider to use for sending.
     */
    provider: Provider

    /**
     * Recipient identifier (phone, email, chat ID, or device token).
     */
    recipient: string

    /**
     * Message content.
     */
    message: string

    /**
     * Subject line (for email).
     */
    subject?: string

    /**
     * Additional metadata.
     */
    metadata?: Record<string, unknown>
}

/**
 * Result of sending a notification.
 */
export interface SendNotificationResult {
    /**
     * ID of the created notification.
     */
    notificationId: string
}

/**
 * Notification object returned from API.
 */
export interface Notification {
    /**
     * Unique notification ID.
     */
    id: string

    /**
     * Current delivery status.
     */
    status: NotificationStatus

    /**
     * Delivery channel used.
     */
    channel: Channel

    /**
     * Provider used for delivery.
     */
    provider: Provider

    /**
     * Recipient identifier.
     */
    recipient: string

    /**
     * Message content.
     */
    payload: {
        text: string
        subject?: string
    }

    /**
     * When the notification was created.
     */
    createdAt: string

    /**
     * When the notification was sent to the provider.
     */
    sentAt?: string

    /**
     * When the notification was delivered to the recipient.
     */
    deliveredAt?: string
}

/**
 * Paginated list of notifications.
 */
export interface NotificationList {
    /**
     * Array of notifications.
     */
    notifications: Notification[]

    /**
     * Total count of notifications.
     */
    total: number

    /**
     * Current page number.
     */
    page: number

    /**
     * Items per page.
     */
    limit: number
}

/**
 * Notification status response.
 */
export interface NotificationStatusResponse {
    /**
     * Current delivery status.
     */
    status: NotificationStatus
}
