import { Channel } from "../value-objects/Channel"

/**
 * Recipient contact information.
 */
export interface RecipientContacts {
    /** Phone number in E.164 format (+998901234567) */
    phone?: string

    /** Email address */
    email?: string

    /** Telegram chat ID (obtained after user starts the bot) */
    telegramChatId?: string

    /** Push notification device tokens */
    deviceTokens?: string[]
}

/**
 * Recipient notification preferences.
 */
export interface RecipientPreferences {
    /** Preferred channel for receiving notifications */
    preferredChannel?: Channel

    /** Channels the recipient has opted out of */
    optedOutChannels?: Channel[]

    /** Quiet hours (no notifications) */
    quietHours?: {
        start: string // "22:00"
        end: string // "08:00"
        timezone: string // "Asia/Tashkent"
    }

    /** Language preference for messages */
    language?: string
}

/**
 * Properties for creating a new Recipient.
 */
export interface CreateRecipientProps {
    id: string
    merchantId: string
    externalId?: string
    contacts: RecipientContacts
    preferences?: RecipientPreferences
    metadata?: Record<string, unknown>
}

/**
 * Properties for reconstructing a Recipient from persistence.
 */
export interface RecipientProps extends CreateRecipientProps {
    createdAt: Date
    updatedAt: Date
}

/**
 * Recipient entity representing a notification recipient.
 *
 * Tracks contact information across all channels and user preferences.
 *
 * @example
 * ```typescript
 * const recipient = Recipient.create({
 *     id: "rcpt_123",
 *     merchantId: "merchant_456",
 *     externalId: "user_789", // Your system's user ID
 *     contacts: {
 *         phone: "+998901234567",
 *         email: "user@example.com",
 *     },
 *     preferences: {
 *         preferredChannel: Channel.TELEGRAM,
 *         language: "uz",
 *     },
 * })
 *
 * // Link Telegram after user starts the bot
 * recipient.linkTelegram("123456789")
 * ```
 */
export class Recipient {
    private readonly _id: string
    private readonly _merchantId: string
    private readonly _externalId?: string
    private readonly _createdAt: Date

    private readonly _contacts: RecipientContacts
    private _preferences: RecipientPreferences
    private _metadata: Record<string, unknown>
    private _updatedAt: Date

    private constructor(props: RecipientProps) {
        this._id = props.id
        this._merchantId = props.merchantId
        this._externalId = props.externalId
        this._contacts = { ...props.contacts }
        this._preferences = { ...props.preferences }
        this._metadata = { ...props.metadata }
        this._createdAt = props.createdAt
        this._updatedAt = props.updatedAt
    }

    /**
     * Create a new recipient.
     */
    static create(props: CreateRecipientProps): Recipient {
        const now = new Date()
        return new Recipient({
            ...props,
            preferences: props.preferences ?? {},
            metadata: props.metadata ?? {},
            createdAt: now,
            updatedAt: now,
        })
    }

    /**
     * Reconstruct a recipient from persistence.
     */
    static fromPersistence(props: RecipientProps): Recipient {
        return new Recipient(props)
    }

    // Getters
    get id(): string {
        return this._id
    }

    get merchantId(): string {
        return this._merchantId
    }

    get externalId(): string | undefined {
        return this._externalId
    }

    get contacts(): RecipientContacts {
        return { ...this._contacts }
    }

    get preferences(): RecipientPreferences {
        return { ...this._preferences }
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

    // Contact getters
    get phone(): string | undefined {
        return this._contacts.phone
    }

    get email(): string | undefined {
        return this._contacts.email
    }

    get telegramChatId(): string | undefined {
        return this._contacts.telegramChatId
    }

    get deviceTokens(): string[] {
        return [...(this._contacts.deviceTokens ?? [])]
    }

    /**
     * Check if recipient has a specific channel available.
     */
    hasChannel(channel: Channel): boolean {
        switch (channel) {
            case Channel.SMS:
            case Channel.WHATSAPP:
                return Boolean(this._contacts.phone)
            case Channel.EMAIL:
                return Boolean(this._contacts.email)
            case Channel.TELEGRAM:
                return Boolean(this._contacts.telegramChatId)
            case Channel.PUSH:
                return Boolean(this._contacts.deviceTokens?.length)
            default:
                return false
        }
    }

    /**
     * Get available channels for this recipient.
     */
    getAvailableChannels(): Channel[] {
        const channels: Channel[] = []

        if (this._contacts.phone) {
            channels.push(Channel.SMS)
            channels.push(Channel.WHATSAPP)
        }
        if (this._contacts.email) {
            channels.push(Channel.EMAIL)
        }
        if (this._contacts.telegramChatId) {
            channels.push(Channel.TELEGRAM)
        }
        if (this._contacts.deviceTokens?.length) {
            channels.push(Channel.PUSH)
        }

        return channels
    }

    /**
     * Check if channel is opted out.
     */
    isOptedOut(channel: Channel): boolean {
        return this._preferences.optedOutChannels?.includes(channel) ?? false
    }

    /**
     * Link Telegram chat ID (after user starts the bot).
     */
    linkTelegram(chatId: string): void {
        this._contacts.telegramChatId = chatId
        this._updatedAt = new Date()
    }

    /**
     * Unlink Telegram.
     */
    unlinkTelegram(): void {
        this._contacts.telegramChatId = undefined
        this._updatedAt = new Date()
    }

    /**
     * Update phone number.
     */
    updatePhone(phone: string | undefined): void {
        this._contacts.phone = phone
        this._updatedAt = new Date()
    }

    /**
     * Update email address.
     */
    updateEmail(email: string | undefined): void {
        this._contacts.email = email
        this._updatedAt = new Date()
    }

    /**
     * Add a push device token.
     */
    addDeviceToken(token: string): void {
        if (!this._contacts.deviceTokens) {
            this._contacts.deviceTokens = []
        }
        if (!this._contacts.deviceTokens.includes(token)) {
            this._contacts.deviceTokens.push(token)
            this._updatedAt = new Date()
        }
    }

    /**
     * Remove a push device token.
     */
    removeDeviceToken(token: string): void {
        if (this._contacts.deviceTokens) {
            this._contacts.deviceTokens = this._contacts.deviceTokens.filter((t) => t !== token)
            this._updatedAt = new Date()
        }
    }

    /**
     * Update notification preferences.
     */
    updatePreferences(preferences: Partial<RecipientPreferences>): void {
        this._preferences = {
            ...this._preferences,
            ...preferences,
        }
        this._updatedAt = new Date()
    }

    /**
     * Opt out of a channel.
     */
    optOut(channel: Channel): void {
        if (!this._preferences.optedOutChannels) {
            this._preferences.optedOutChannels = []
        }
        if (!this._preferences.optedOutChannels.includes(channel)) {
            this._preferences.optedOutChannels.push(channel)
            this._updatedAt = new Date()
        }
    }

    /**
     * Opt back in to a channel.
     */
    optIn(channel: Channel): void {
        if (this._preferences.optedOutChannels) {
            this._preferences.optedOutChannels = this._preferences.optedOutChannels.filter(
                (c) => c !== channel,
            )
            this._updatedAt = new Date()
        }
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
     * Convert to plain object for persistence.
     */
    toPersistence(): RecipientProps {
        return {
            id: this._id,
            merchantId: this._merchantId,
            externalId: this._externalId,
            contacts: { ...this._contacts },
            preferences: { ...this._preferences },
            metadata: { ...this._metadata },
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        }
    }
}
