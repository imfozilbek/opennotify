import { Injectable } from "@nestjs/common"
import { Merchant, MerchantProps, MerchantRepositoryPort } from "@opennotify/core"

/**
 * In-memory implementation of MerchantRepositoryPort.
 * For development and testing purposes.
 */
@Injectable()
export class InMemoryMerchantRepository implements MerchantRepositoryPort {
    private readonly merchants = new Map<string, MerchantProps>()

    async save(merchant: Merchant): Promise<void> {
        this.merchants.set(merchant.id, merchant.toPersistence())
        return Promise.resolve()
    }

    async findById(id: string): Promise<Merchant | null> {
        const data = this.merchants.get(id)
        if (!data) {
            return Promise.resolve(null)
        }
        return Promise.resolve(Merchant.fromPersistence(data))
    }

    async findByEmail(email: string): Promise<Merchant | null> {
        for (const data of this.merchants.values()) {
            if (data.email === email) {
                return Promise.resolve(Merchant.fromPersistence(data))
            }
        }
        return Promise.resolve(null)
    }

    async findAll(limit?: number, offset?: number): Promise<Merchant[]> {
        const all = Array.from(this.merchants.values())
        const start = offset ?? 0
        const end = limit ? start + limit : undefined
        return Promise.resolve(all.slice(start, end).map((data) => Merchant.fromPersistence(data)))
    }

    async delete(id: string): Promise<void> {
        this.merchants.delete(id)
        return Promise.resolve()
    }
}
