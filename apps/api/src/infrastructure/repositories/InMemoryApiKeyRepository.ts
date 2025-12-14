import { Injectable } from "@nestjs/common"
import { ApiKey, ApiKeyProps, ApiKeyRepositoryPort } from "@opennotify/core"

/**
 * In-memory implementation of ApiKeyRepositoryPort.
 * For development and testing purposes.
 */
@Injectable()
export class InMemoryApiKeyRepository implements ApiKeyRepositoryPort {
    private readonly apiKeys = new Map<string, ApiKeyProps>()

    async save(apiKey: ApiKey): Promise<void> {
        this.apiKeys.set(apiKey.id, apiKey.toPersistence())
        return Promise.resolve()
    }

    async findById(id: string): Promise<ApiKey | null> {
        const data = this.apiKeys.get(id)
        if (!data) {
            return Promise.resolve(null)
        }
        return Promise.resolve(ApiKey.fromPersistence(data))
    }

    async findByPrefix(prefix: string): Promise<ApiKey | null> {
        for (const data of this.apiKeys.values()) {
            if (data.keyPrefix === prefix) {
                return Promise.resolve(ApiKey.fromPersistence(data))
            }
        }
        return Promise.resolve(null)
    }

    async findByMerchantId(merchantId: string): Promise<ApiKey[]> {
        const result: ApiKey[] = []
        for (const data of this.apiKeys.values()) {
            if (data.merchantId === merchantId) {
                result.push(ApiKey.fromPersistence(data))
            }
        }
        return Promise.resolve(result)
    }

    async delete(id: string): Promise<void> {
        this.apiKeys.delete(id)
        return Promise.resolve()
    }
}
