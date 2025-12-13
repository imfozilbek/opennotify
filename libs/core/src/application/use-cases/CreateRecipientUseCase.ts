import {
    CreateRecipientProps,
    Recipient,
    RecipientContacts,
    RecipientPreferences,
} from "../../domain/entities/Recipient"
import { RecipientRepositoryPort } from "../ports/RecipientRepositoryPort"

/**
 * Input for creating a recipient.
 */
export interface CreateRecipientInput {
    /** Unique recipient ID */
    id: string

    /** Merchant this recipient belongs to */
    merchantId: string

    /** External ID from your system (e.g., user ID) */
    externalId?: string

    /** Recipient contact information */
    contacts: RecipientContacts

    /** Notification preferences */
    preferences?: RecipientPreferences

    /** Additional metadata */
    metadata?: Record<string, unknown>
}

/**
 * Output from creating a recipient.
 */
export interface CreateRecipientOutput {
    /** Whether the recipient was created successfully */
    success: boolean

    /** The created recipient entity */
    recipient: Recipient

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for creating recipients.
 *
 * @example
 * ```typescript
 * const useCase = new CreateRecipientUseCase(repository)
 *
 * const result = await useCase.execute({
 *     id: "rcpt_123",
 *     merchantId: "merchant_456",
 *     externalId: "user_789",
 *     contacts: {
 *         phone: "+998901234567",
 *         email: "user@example.com",
 *     },
 *     preferences: {
 *         preferredChannel: Channel.TELEGRAM,
 *     },
 * })
 *
 * if (result.success) {
 *     console.log("Created:", result.recipient.id)
 * }
 * ```
 */
export class CreateRecipientUseCase {
    constructor(private readonly repository: RecipientRepositoryPort) {}

    async execute(input: CreateRecipientInput): Promise<CreateRecipientOutput> {
        // Check for duplicate external ID
        if (input.externalId) {
            const existing = await this.repository.findByExternalId(
                input.merchantId,
                input.externalId,
            )
            if (existing) {
                return {
                    success: false,
                    recipient: existing,
                    errorMessage: `Recipient with external ID ${input.externalId} already exists`,
                }
            }
        }

        // Check for duplicate phone
        if (input.contacts.phone) {
            const existing = await this.repository.findByPhone(
                input.merchantId,
                input.contacts.phone,
            )
            if (existing) {
                return {
                    success: false,
                    recipient: existing,
                    errorMessage: `Recipient with phone ${input.contacts.phone} already exists`,
                }
            }
        }

        // Check for duplicate email
        if (input.contacts.email) {
            const existing = await this.repository.findByEmail(
                input.merchantId,
                input.contacts.email,
            )
            if (existing) {
                return {
                    success: false,
                    recipient: existing,
                    errorMessage: `Recipient with email ${input.contacts.email} already exists`,
                }
            }
        }

        // Create recipient entity
        const recipientProps: CreateRecipientProps = {
            id: input.id,
            merchantId: input.merchantId,
            externalId: input.externalId,
            contacts: input.contacts,
            preferences: input.preferences,
            metadata: input.metadata,
        }

        const recipient = Recipient.create(recipientProps)

        // Persist recipient
        await this.repository.save(recipient)

        return {
            success: true,
            recipient,
        }
    }
}
