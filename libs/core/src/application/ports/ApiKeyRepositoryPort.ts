import { ApiKey } from "../../domain/entities/ApiKey"

/**
 * Port interface for API key persistence.
 */
export interface ApiKeyRepositoryPort {
    /**
     * Save an API key (create or update).
     */
    save(apiKey: ApiKey): Promise<void>

    /**
     * Find API key by ID.
     */
    findById(id: string): Promise<ApiKey | null>

    /**
     * Find API key by key prefix.
     * Used for quick lookup before full validation.
     */
    findByPrefix(prefix: string): Promise<ApiKey | null>

    /**
     * Find all API keys for a merchant.
     */
    findByMerchantId(merchantId: string): Promise<ApiKey[]>

    /**
     * Delete an API key.
     */
    delete(id: string): Promise<void>
}
