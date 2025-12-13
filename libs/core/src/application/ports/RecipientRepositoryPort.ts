import { Recipient } from "../../domain/entities/Recipient"

/**
 * Port interface for recipient persistence.
 * Implemented by infrastructure layer (database adapters).
 */
export interface RecipientRepositoryPort {
    /**
     * Save a recipient (create or update).
     */
    save(recipient: Recipient): Promise<void>

    /**
     * Find recipient by ID.
     */
    findById(id: string): Promise<Recipient | null>

    /**
     * Find recipient by external ID (your system's user ID).
     */
    findByExternalId(merchantId: string, externalId: string): Promise<Recipient | null>

    /**
     * Find recipient by phone number.
     */
    findByPhone(merchantId: string, phone: string): Promise<Recipient | null>

    /**
     * Find recipient by email.
     */
    findByEmail(merchantId: string, email: string): Promise<Recipient | null>

    /**
     * Find recipient by Telegram chat ID.
     */
    findByTelegramChatId(merchantId: string, chatId: string): Promise<Recipient | null>

    /**
     * Find recipients by merchant ID.
     */
    findByMerchantId(merchantId: string, limit?: number, offset?: number): Promise<Recipient[]>

    /**
     * Delete a recipient.
     */
    delete(id: string): Promise<void>
}
