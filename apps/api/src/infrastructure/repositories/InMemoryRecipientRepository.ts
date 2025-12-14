import { Injectable } from "@nestjs/common"
import { Recipient, RecipientProps, RecipientRepositoryPort } from "@opennotify/core"

/**
 * In-memory implementation of RecipientRepositoryPort.
 * For development and testing purposes.
 */
@Injectable()
export class InMemoryRecipientRepository implements RecipientRepositoryPort {
    private readonly recipients = new Map<string, RecipientProps>()

    async save(recipient: Recipient): Promise<void> {
        this.recipients.set(recipient.id, recipient.toPersistence())
        return Promise.resolve()
    }

    async findById(id: string): Promise<Recipient | null> {
        const data = this.recipients.get(id)
        if (!data) {
            return Promise.resolve(null)
        }
        return Promise.resolve(Recipient.fromPersistence(data))
    }

    async findByExternalId(merchantId: string, externalId: string): Promise<Recipient | null> {
        for (const data of this.recipients.values()) {
            if (data.merchantId === merchantId && data.externalId === externalId) {
                return Promise.resolve(Recipient.fromPersistence(data))
            }
        }
        return Promise.resolve(null)
    }

    async findByPhone(merchantId: string, phone: string): Promise<Recipient | null> {
        for (const data of this.recipients.values()) {
            if (data.merchantId === merchantId && data.contacts.phone === phone) {
                return Promise.resolve(Recipient.fromPersistence(data))
            }
        }
        return Promise.resolve(null)
    }

    async findByEmail(merchantId: string, email: string): Promise<Recipient | null> {
        for (const data of this.recipients.values()) {
            if (data.merchantId === merchantId && data.contacts.email === email) {
                return Promise.resolve(Recipient.fromPersistence(data))
            }
        }
        return Promise.resolve(null)
    }

    async findByTelegramChatId(merchantId: string, chatId: string): Promise<Recipient | null> {
        for (const data of this.recipients.values()) {
            if (data.merchantId === merchantId && data.contacts.telegramChatId === chatId) {
                return Promise.resolve(Recipient.fromPersistence(data))
            }
        }
        return Promise.resolve(null)
    }

    async findByMerchantId(
        merchantId: string,
        limit?: number,
        offset?: number,
    ): Promise<Recipient[]> {
        const all = Array.from(this.recipients.values()).filter(
            (data) => data.merchantId === merchantId,
        )

        // Sort by updatedAt descending (newest first)
        all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        // Apply pagination
        const start = offset ?? 0
        const end = limit ? start + limit : undefined
        const paginated = all.slice(start, end)

        return Promise.resolve(paginated.map((data) => Recipient.fromPersistence(data)))
    }

    async delete(id: string): Promise<void> {
        this.recipients.delete(id)
        return Promise.resolve()
    }

    /**
     * Count recipients for a merchant.
     */
    async countByMerchantId(merchantId: string): Promise<number> {
        let count = 0
        for (const data of this.recipients.values()) {
            if (data.merchantId === merchantId) {
                count++
            }
        }
        return Promise.resolve(count)
    }
}
