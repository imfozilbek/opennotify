/**
 * Merchant status.
 */
export enum MerchantStatus {
    /** Merchant is active and can send notifications */
    ACTIVE = "ACTIVE",

    /** Merchant is suspended (e.g., payment issues) */
    SUSPENDED = "SUSPENDED",

    /** Merchant account is disabled */
    DISABLED = "DISABLED",
}

/**
 * Merchant settings.
 */
export interface MerchantSettings {
    /** Default sender name for SMS */
    defaultSmsSender?: string

    /** Default sender email */
    defaultEmailFrom?: string

    /** Webhook URL for delivery status updates */
    webhookUrl?: string

    /** Webhook secret for signature verification */
    webhookSecret?: string

    /** Timezone for time-based routing */
    timezone?: string

    /** Default language for templates */
    defaultLanguage?: string
}

/**
 * Properties for creating a new Merchant.
 */
export interface CreateMerchantProps {
    id: string
    name: string
    email: string
    settings?: MerchantSettings
    metadata?: Record<string, unknown>
}

/**
 * Properties for reconstructing a Merchant from persistence.
 */
export interface MerchantProps extends CreateMerchantProps {
    status: MerchantStatus
    createdAt: Date
    updatedAt: Date
}

/**
 * Merchant entity representing a business using the notification platform.
 *
 * @example
 * ```typescript
 * const merchant = Merchant.create({
 *     id: "merchant_123",
 *     name: "My Business",
 *     email: "admin@mybusiness.uz",
 *     settings: {
 *         defaultSmsSender: "MyBrand",
 *         timezone: "Asia/Tashkent",
 *     },
 * })
 *
 * merchant.updateSettings({ webhookUrl: "https://api.mybusiness.uz/webhooks" })
 * ```
 */
export class Merchant {
    private readonly _id: string
    private readonly _createdAt: Date

    private _name: string
    private _email: string
    private _status: MerchantStatus
    private _settings: MerchantSettings
    private _metadata: Record<string, unknown>
    private _updatedAt: Date

    private constructor(props: MerchantProps) {
        this._id = props.id
        this._name = props.name
        this._email = props.email
        this._status = props.status
        this._settings = { ...props.settings }
        this._metadata = { ...props.metadata }
        this._createdAt = props.createdAt
        this._updatedAt = props.updatedAt
    }

    /**
     * Create a new merchant in ACTIVE status.
     */
    static create(props: CreateMerchantProps): Merchant {
        const now = new Date()
        return new Merchant({
            ...props,
            status: MerchantStatus.ACTIVE,
            settings: props.settings ?? {},
            metadata: props.metadata ?? {},
            createdAt: now,
            updatedAt: now,
        })
    }

    /**
     * Reconstruct a merchant from persistence.
     */
    static fromPersistence(props: MerchantProps): Merchant {
        return new Merchant(props)
    }

    // Getters
    get id(): string {
        return this._id
    }

    get name(): string {
        return this._name
    }

    get email(): string {
        return this._email
    }

    get status(): MerchantStatus {
        return this._status
    }

    get settings(): MerchantSettings {
        return { ...this._settings }
    }

    get metadata(): Record<string, unknown> {
        return { ...this._metadata }
    }

    get createdAt(): Date {
        return this._createdAt
    }

    get updatedAt(): Date {
        return this._updatedAt
    }

    /**
     * Check if merchant is active.
     */
    isActive(): boolean {
        return this._status === MerchantStatus.ACTIVE
    }

    /**
     * Update merchant name.
     */
    updateName(name: string): void {
        this._name = name
        this._updatedAt = new Date()
    }

    /**
     * Update merchant email.
     */
    updateEmail(email: string): void {
        this._email = email
        this._updatedAt = new Date()
    }

    /**
     * Update merchant settings.
     */
    updateSettings(settings: Partial<MerchantSettings>): void {
        this._settings = {
            ...this._settings,
            ...settings,
        }
        this._updatedAt = new Date()
    }

    /**
     * Update metadata.
     */
    updateMetadata(metadata: Record<string, unknown>): void {
        this._metadata = {
            ...this._metadata,
            ...metadata,
        }
        this._updatedAt = new Date()
    }

    /**
     * Suspend merchant.
     */
    suspend(): void {
        if (this._status === MerchantStatus.DISABLED) {
            throw new Error("Cannot suspend a disabled merchant")
        }
        this._status = MerchantStatus.SUSPENDED
        this._updatedAt = new Date()
    }

    /**
     * Activate merchant.
     */
    activate(): void {
        if (this._status === MerchantStatus.DISABLED) {
            throw new Error("Cannot activate a disabled merchant")
        }
        this._status = MerchantStatus.ACTIVE
        this._updatedAt = new Date()
    }

    /**
     * Disable merchant permanently.
     */
    disable(): void {
        this._status = MerchantStatus.DISABLED
        this._updatedAt = new Date()
    }

    /**
     * Convert to plain object for persistence.
     */
    toPersistence(): MerchantProps {
        return {
            id: this._id,
            name: this._name,
            email: this._email,
            status: this._status,
            settings: { ...this._settings },
            metadata: { ...this._metadata },
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        }
    }
}
