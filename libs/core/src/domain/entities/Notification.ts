import { Channel } from "../value-objects/Channel"
import { Provider } from "../value-objects/Provider"
import { canTransition, NotificationStatus } from "../value-objects/NotificationStatus"

/**
 * Notification recipient information.
 */
export interface NotificationRecipient {
    /** Phone number for SMS/WhatsApp (E.164 format: +998901234567) */
    phone?: string

    /** Email address */
    email?: string

    /** Telegram chat ID */
    telegramChatId?: string

    /** Push notification device token */
    deviceToken?: string
}

/**
 * Notification payload content.
 */
export interface NotificationPayload {
    /** Message text content */
    text: string

    /** Subject line (for email) */
    subject?: string

    /** Template ID (if using templates) */
    templateId?: string

    /** Template variables */
    variables?: Record<string, string>

    /** Additional provider-specific data */
    metadata?: Record<string, unknown>
}

/**
 * Properties for creating a new Notification.
 */
export interface CreateNotificationProps {
    id: string
    merchantId: string
    channel: Channel
    provider: Provider
    recipient: NotificationRecipient
    payload: NotificationPayload
}

/**
 * Properties for reconstructing a Notification from persistence.
 */
export interface NotificationProps extends CreateNotificationProps {
    status: NotificationStatus
    externalId?: string
    errorMessage?: string
    sentAt?: Date
    deliveredAt?: Date
    failedAt?: Date
    createdAt: Date
    updatedAt: Date
}

/**
 * Notification entity representing a message to be sent via any channel.
 *
 * @example
 * ```typescript
 * const notification = Notification.create({
 *     id: "notif_123",
 *     merchantId: "merchant_456",
 *     channel: Channel.SMS,
 *     provider: Provider.ESKIZ,
 *     recipient: { phone: "+998901234567" },
 *     payload: { text: "Your OTP code is 1234" },
 * })
 *
 * notification.markAsSent("eskiz_msg_789")
 * notification.markAsDelivered()
 * ```
 */
export class Notification {
    private readonly _id: string
    private readonly _merchantId: string
    private readonly _channel: Channel
    private readonly _provider: Provider
    private readonly _recipient: NotificationRecipient
    private readonly _payload: NotificationPayload
    private readonly _createdAt: Date

    private _status: NotificationStatus
    private _externalId?: string
    private _errorMessage?: string
    private _sentAt?: Date
    private _deliveredAt?: Date
    private _failedAt?: Date
    private _updatedAt: Date

    private constructor(props: NotificationProps) {
        this._id = props.id
        this._merchantId = props.merchantId
        this._channel = props.channel
        this._provider = props.provider
        this._recipient = props.recipient
        this._payload = props.payload
        this._status = props.status
        this._externalId = props.externalId
        this._errorMessage = props.errorMessage
        this._sentAt = props.sentAt
        this._deliveredAt = props.deliveredAt
        this._failedAt = props.failedAt
        this._createdAt = props.createdAt
        this._updatedAt = props.updatedAt
    }

    /**
     * Create a new notification in PENDING status.
     */
    static create(props: CreateNotificationProps): Notification {
        const now = new Date()
        return new Notification({
            ...props,
            status: NotificationStatus.PENDING,
            createdAt: now,
            updatedAt: now,
        })
    }

    /**
     * Reconstruct a notification from persistence.
     */
    static fromPersistence(props: NotificationProps): Notification {
        return new Notification(props)
    }

    // Getters
    get id(): string {
        return this._id
    }

    get merchantId(): string {
        return this._merchantId
    }

    get channel(): Channel {
        return this._channel
    }

    get provider(): Provider {
        return this._provider
    }

    get recipient(): NotificationRecipient {
        return this._recipient
    }

    get payload(): NotificationPayload {
        return this._payload
    }

    get status(): NotificationStatus {
        return this._status
    }

    get externalId(): string | undefined {
        return this._externalId
    }

    get errorMessage(): string | undefined {
        return this._errorMessage
    }

    get sentAt(): Date | undefined {
        return this._sentAt
    }

    get deliveredAt(): Date | undefined {
        return this._deliveredAt
    }

    get failedAt(): Date | undefined {
        return this._failedAt
    }

    get createdAt(): Date {
        return this._createdAt
    }

    get updatedAt(): Date {
        return this._updatedAt
    }

    /**
     * Mark notification as sent.
     * @param externalId - Provider's message ID for tracking
     */
    markAsSent(externalId: string): void {
        this.transitionTo(NotificationStatus.SENT)
        this._externalId = externalId
        this._sentAt = new Date()
    }

    /**
     * Mark notification as delivered.
     */
    markAsDelivered(): void {
        this.transitionTo(NotificationStatus.DELIVERED)
        this._deliveredAt = new Date()
    }

    /**
     * Mark notification as failed.
     * @param errorMessage - Error description
     */
    markAsFailed(errorMessage: string): void {
        this.transitionTo(NotificationStatus.FAILED)
        this._errorMessage = errorMessage
        this._failedAt = new Date()
    }

    /**
     * Check if notification can be retried.
     */
    canRetry(): boolean {
        return this._status === NotificationStatus.FAILED
    }

    /**
     * Transition to a new status with validation.
     */
    private transitionTo(newStatus: NotificationStatus): void {
        if (!canTransition(this._status, newStatus)) {
            throw new Error(`Invalid status transition: ${this._status} → ${newStatus}`)
        }
        this._status = newStatus
        this._updatedAt = new Date()
    }

    /**
     * Convert to plain object for persistence.
     */
    toPersistence(): NotificationProps {
        return {
            id: this._id,
            merchantId: this._merchantId,
            channel: this._channel,
            provider: this._provider,
            recipient: this._recipient,
            payload: this._payload,
            status: this._status,
            externalId: this._externalId,
            errorMessage: this._errorMessage,
            sentAt: this._sentAt,
            deliveredAt: this._deliveredAt,
            failedAt: this._failedAt,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        }
    }
}
