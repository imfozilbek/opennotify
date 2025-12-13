import { ApiKey, ApiKeyPermission } from "../../domain/entities/ApiKey"
import { ApiKeyRepositoryPort } from "../ports/ApiKeyRepositoryPort"
import { MerchantRepositoryPort } from "../ports/MerchantRepositoryPort"

/**
 * Input for creating an API key.
 */
export interface CreateApiKeyInput {
    /** Unique key ID */
    id: string

    /** Merchant creating the key */
    merchantId: string

    /** Key name (for identification) */
    name: string

    /** Permissions for this key */
    permissions: ApiKeyPermission[]

    /** Environment (live or test) */
    environment?: "live" | "test"

    /** Expiration date (optional) */
    expiresAt?: Date

    /** Additional metadata */
    metadata?: Record<string, unknown>
}

/**
 * Output from creating an API key.
 */
export interface CreateApiKeyOutput {
    /** Whether creation was successful */
    success: boolean

    /** The created API key entity */
    apiKey: ApiKey | null

    /** The raw key (SHOW TO USER ONCE, never stored) */
    rawKey: string | null

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for creating API keys.
 *
 * IMPORTANT: The rawKey is only returned once at creation.
 * It cannot be retrieved later - only the hash is stored.
 *
 * @example
 * ```typescript
 * const useCase = new CreateApiKeyUseCase(apiKeyRepository, merchantRepository)
 *
 * const result = await useCase.execute({
 *     id: "key_123",
 *     merchantId: "merchant_456",
 *     name: "Production API Key",
 *     permissions: [ApiKeyPermission.SEND, ApiKeyPermission.READ],
 *     environment: "live",
 * })
 *
 * if (result.success) {
 *     // Show rawKey to user ONCE
 *     console.log("Your API key:", result.rawKey)
 *     console.log("Save it securely - it won't be shown again!")
 * }
 * ```
 */
export class CreateApiKeyUseCase {
    constructor(
        private readonly apiKeyRepository: ApiKeyRepositoryPort,
        private readonly merchantRepository: MerchantRepositoryPort,
    ) {}

    async execute(input: CreateApiKeyInput): Promise<CreateApiKeyOutput> {
        // Verify merchant exists and is active
        const merchant = await this.merchantRepository.findById(input.merchantId)
        if (!merchant) {
            return {
                success: false,
                apiKey: null,
                rawKey: null,
                errorMessage: "Merchant not found",
            }
        }

        if (!merchant.isActive()) {
            return {
                success: false,
                apiKey: null,
                rawKey: null,
                errorMessage: "Merchant account is not active",
            }
        }

        // Generate API key
        const { apiKey, rawKey } = ApiKey.generate({
            id: input.id,
            merchantId: input.merchantId,
            name: input.name,
            permissions: input.permissions,
            environment: input.environment,
            expiresAt: input.expiresAt,
            metadata: input.metadata,
        })

        // Save to repository
        await this.apiKeyRepository.save(apiKey)

        return {
            success: true,
            apiKey,
            rawKey,
        }
    }

    /**
     * Revoke an API key.
     */
    async revoke(
        keyId: string,
        merchantId: string,
    ): Promise<{ success: boolean; errorMessage?: string }> {
        const apiKey = await this.apiKeyRepository.findById(keyId)

        if (!apiKey) {
            return {
                success: false,
                errorMessage: "API key not found",
            }
        }

        // Verify ownership
        if (apiKey.merchantId !== merchantId) {
            return {
                success: false,
                errorMessage: "API key not found",
            }
        }

        apiKey.revoke()
        await this.apiKeyRepository.save(apiKey)

        return { success: true }
    }

    /**
     * List API keys for a merchant.
     */
    async listForMerchant(merchantId: string): Promise<ApiKey[]> {
        return this.apiKeyRepository.findByMerchantId(merchantId)
    }
}
