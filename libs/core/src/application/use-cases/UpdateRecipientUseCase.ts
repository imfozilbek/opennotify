import { Channel } from "../../domain/value-objects/Channel"
import { Recipient, RecipientPreferences } from "../../domain/entities/Recipient"
import { RecipientRepositoryPort } from "../ports/RecipientRepositoryPort"

/**
 * Input for updating a recipient.
 */
export interface UpdateRecipientInput {
    /** Recipient ID to update */
    id: string

    /** Update phone number */
    phone?: string | null

    /** Update email address */
    email?: string | null

    /** Link/unlink Telegram chat ID */
    telegramChatId?: string | null

    /** Add device token */
    addDeviceToken?: string

    /** Remove device token */
    removeDeviceToken?: string

    /** Update preferences */
    preferences?: Partial<RecipientPreferences>

    /** Update metadata */
    metadata?: Record<string, unknown>
}

/**
 * Output from updating a recipient.
 */
export interface UpdateRecipientOutput {
    /** Whether the update was successful */
    success: boolean

    /** The updated recipient entity */
    recipient: Recipient | null

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Input for linking Telegram to a recipient.
 */
export interface LinkTelegramInput {
    /** Merchant ID */
    merchantId: string

    /** Phone number to match (used to find recipient) */
    phone: string

    /** Telegram chat ID to link */
    telegramChatId: string
}

/**
 * Use case for updating recipients.
 *
 * @example
 * ```typescript
 * const useCase = new UpdateRecipientUseCase(repository)
 *
 * // Update contact info
 * await useCase.execute({
 *     id: "rcpt_123",
 *     phone: "+998901234567",
 *     email: "newemail@example.com",
 * })
 *
 * // Link Telegram
 * await useCase.execute({
 *     id: "rcpt_123",
 *     telegramChatId: "123456789",
 * })
 *
 * // Opt out of SMS
 * await useCase.execute({
 *     id: "rcpt_123",
 *     preferences: {
 *         optedOutChannels: [Channel.SMS],
 *     },
 * })
 * ```
 */
export class UpdateRecipientUseCase {
    constructor(private readonly repository: RecipientRepositoryPort) {}

    async execute(input: UpdateRecipientInput): Promise<UpdateRecipientOutput> {
        const recipient = await this.repository.findById(input.id)
        if (!recipient) {
            return {
                success: false,
                recipient: null,
                errorMessage: `Recipient not found: ${input.id}`,
            }
        }

        // Update phone
        if (input.phone !== undefined) {
            recipient.updatePhone(input.phone ?? undefined)
        }

        // Update email
        if (input.email !== undefined) {
            recipient.updateEmail(input.email ?? undefined)
        }

        // Update Telegram
        if (input.telegramChatId !== undefined) {
            if (input.telegramChatId === null) {
                recipient.unlinkTelegram()
            } else {
                recipient.linkTelegram(input.telegramChatId)
            }
        }

        // Add device token
        if (input.addDeviceToken) {
            recipient.addDeviceToken(input.addDeviceToken)
        }

        // Remove device token
        if (input.removeDeviceToken) {
            recipient.removeDeviceToken(input.removeDeviceToken)
        }

        // Update preferences
        if (input.preferences) {
            recipient.updatePreferences(input.preferences)
        }

        // Update metadata
        if (input.metadata) {
            recipient.updateMetadata(input.metadata)
        }

        // Persist changes
        await this.repository.save(recipient)

        return {
            success: true,
            recipient,
        }
    }

    /**
     * Link Telegram chat ID to a recipient by phone number.
     * Used when user starts the Telegram bot and sends their phone.
     *
     * @example
     * ```typescript
     * // User sends /start to the bot, then shares phone number
     * const result = await useCase.linkTelegramByPhone({
     *     merchantId: "merchant_456",
     *     phone: "+998901234567",
     *     telegramChatId: "123456789",
     * })
     *
     * if (result.success) {
     *     // Send confirmation via Telegram
     *     await telegramAdapter.send({
     *         telegramChatId: "123456789",
     *         text: "Your Telegram is now linked!",
     *     })
     * }
     * ```
     */
    async linkTelegramByPhone(input: LinkTelegramInput): Promise<UpdateRecipientOutput> {
        const recipient = await this.repository.findByPhone(input.merchantId, input.phone)
        if (!recipient) {
            return {
                success: false,
                recipient: null,
                errorMessage: `Recipient not found with phone: ${input.phone}`,
            }
        }

        recipient.linkTelegram(input.telegramChatId)
        await this.repository.save(recipient)

        return {
            success: true,
            recipient,
        }
    }

    /**
     * Opt a recipient out of a channel.
     */
    async optOut(id: string, channel: Channel): Promise<UpdateRecipientOutput> {
        const recipient = await this.repository.findById(id)
        if (!recipient) {
            return {
                success: false,
                recipient: null,
                errorMessage: `Recipient not found: ${id}`,
            }
        }

        recipient.optOut(channel)
        await this.repository.save(recipient)

        return {
            success: true,
            recipient,
        }
    }

    /**
     * Opt a recipient back into a channel.
     */
    async optIn(id: string, channel: Channel): Promise<UpdateRecipientOutput> {
        const recipient = await this.repository.findById(id)
        if (!recipient) {
            return {
                success: false,
                recipient: null,
                errorMessage: `Recipient not found: ${id}`,
            }
        }

        recipient.optIn(channel)
        await this.repository.save(recipient)

        return {
            success: true,
            recipient,
        }
    }
}
