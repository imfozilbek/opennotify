import { Provider } from "../value-objects/Provider"
import { WebhookStatus } from "../value-objects/WebhookStatus"
import { NotificationStatus } from "../value-objects/NotificationStatus"

/**
 * Properties for creating a new WebhookLog.
 */
export interface CreateWebhookLogProps {
    id: string
    merchantId: string
    provider: Provider
    notificationId?: string
    externalId?: string
}

/**
 * Properties for reconstructing a WebhookLog from persistence.
 */
export interface WebhookLogProps extends CreateWebhookLogProps {
    status: WebhookStatus
    notificationStatus?: NotificationStatus
    rawPayload: unknown
    rawHeaders: Record<string, string>
    errorMessage?: string
    processingTimeMs: number
    ipAddress?: string
    userAgent?: string
    createdAt: Date
}

/**
 * WebhookLog entity representing an incoming webhook event from a provider.
 *
 * @example
 * ```typescript
 * const log = WebhookLog.create(
 *     {
 *         id: "wh_123",
 *         merchantId: "merchant_456",
 *         provider: Provider.ESKIZ,
 *         notificationId: "notif_789",
 *         externalId: "eskiz_msg_123",
 *     },
 *     { message_id: "123", status: "DELIVERED" },
 *     { "content-type": "application/json" },
 * )
 *
 * log.markAsSuccess(NotificationStatus.DELIVERED, 45)
 * ```
 */
export class WebhookLog {
    private readonly _id: string
    private _merchantId: string
    private readonly _provider: Provider
    private _notificationId?: string
    private readonly _externalId?: string
    private readonly _rawPayload: unknown
    private readonly _rawHeaders: Record<string, string>
    private readonly _ipAddress?: string
    private readonly _userAgent?: string
    private readonly _createdAt: Date

    private _status: WebhookStatus
    private _notificationStatus?: NotificationStatus
    private _errorMessage?: string
    private _processingTimeMs: number

    private constructor(props: WebhookLogProps) {
        this._id = props.id
        this._merchantId = props.merchantId
        this._provider = props.provider
        this._notificationId = props.notificationId
        this._externalId = props.externalId
        this._status = props.status
        this._notificationStatus = props.notificationStatus
        this._rawPayload = props.rawPayload
        this._rawHeaders = props.rawHeaders
        this._errorMessage = props.errorMessage
        this._processingTimeMs = props.processingTimeMs
        this._ipAddress = props.ipAddress
        this._userAgent = props.userAgent
        this._createdAt = props.createdAt
    }

    /**
     * Create a new webhook log entry.
     */
    static create(
        props: CreateWebhookLogProps,
        rawPayload: unknown,
        rawHeaders: Record<string, string>,
        ipAddress?: string,
        userAgent?: string,
    ): WebhookLog {
        return new WebhookLog({
            ...props,
            status: WebhookStatus.PROCESSING_ERROR, // Will be updated after processing
            rawPayload,
            rawHeaders,
            processingTimeMs: 0,
            ipAddress,
            userAgent,
            createdAt: new Date(),
        })
    }

    /**
     * Reconstruct a webhook log from persistence.
     */
    static fromPersistence(props: WebhookLogProps): WebhookLog {
        return new WebhookLog(props)
    }

    // Getters
    get id(): string {
        return this._id
    }

    get merchantId(): string {
        return this._merchantId
    }

    get provider(): Provider {
        return this._provider
    }

    get notificationId(): string | undefined {
        return this._notificationId
    }

    get externalId(): string | undefined {
        return this._externalId
    }

    get status(): WebhookStatus {
        return this._status
    }

    get notificationStatus(): NotificationStatus | undefined {
        return this._notificationStatus
    }

    get rawPayload(): unknown {
        return this._rawPayload
    }

    get rawHeaders(): Record<string, string> {
        return this._rawHeaders
    }

    get errorMessage(): string | undefined {
        return this._errorMessage
    }

    get processingTimeMs(): number {
        return this._processingTimeMs
    }

    get ipAddress(): string | undefined {
        return this._ipAddress
    }

    get userAgent(): string | undefined {
        return this._userAgent
    }

    get createdAt(): Date {
        return this._createdAt
    }

    /**
     * Mark webhook as successfully processed.
     */
    markAsSuccess(notificationStatus: NotificationStatus, processingTimeMs: number): void {
        this._status = WebhookStatus.SUCCESS
        this._notificationStatus = notificationStatus
        this._processingTimeMs = processingTimeMs
    }

    /**
     * Mark webhook as failed with specific status.
     */
    markAsFailed(status: WebhookStatus, errorMessage: string, processingTimeMs: number): void {
        this._status = status
        this._errorMessage = errorMessage
        this._processingTimeMs = processingTimeMs
    }

    /**
     * Update notification ID after finding the related notification.
     */
    setNotificationId(notificationId: string): void {
        this._notificationId = notificationId
    }

    /**
     * Update merchant ID after finding the related notification.
     */
    setMerchantId(merchantId: string): void {
        this._merchantId = merchantId
    }

    /**
     * Convert to plain object for persistence.
     */
    toPersistence(): WebhookLogProps {
        return {
            id: this._id,
            merchantId: this._merchantId,
            provider: this._provider,
            notificationId: this._notificationId,
            externalId: this._externalId,
            status: this._status,
            notificationStatus: this._notificationStatus,
            rawPayload: this._rawPayload,
            rawHeaders: this._rawHeaders,
            errorMessage: this._errorMessage,
            processingTimeMs: this._processingTimeMs,
            ipAddress: this._ipAddress,
            userAgent: this._userAgent,
            createdAt: this._createdAt,
        }
    }
}
