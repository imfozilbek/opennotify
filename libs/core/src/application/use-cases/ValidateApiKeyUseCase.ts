import { ApiKey, ApiKeyPermission } from "../../domain/entities/ApiKey"
import { Merchant } from "../../domain/entities/Merchant"
import { ApiKeyRepositoryPort } from "../ports/ApiKeyRepositoryPort"
import { MerchantRepositoryPort } from "../ports/MerchantRepositoryPort"

/**
 * Input for validating an API key.
 */
export interface ValidateApiKeyInput {
    /** Raw API key from request header */
    rawKey: string

    /** Required permissions for the operation */
    requiredPermissions?: ApiKeyPermission[]
}

/**
 * Output from validating an API key.
 */
export interface ValidateApiKeyOutput {
    /** Whether the key is valid */
    valid: boolean

    /** The API key entity if valid */
    apiKey: ApiKey | null

    /** The merchant entity if valid */
    merchant: Merchant | null

    /** Error message if invalid */
    errorMessage?: string

    /** Error code for programmatic handling */
    errorCode?:
        | "INVALID_KEY"
        | "EXPIRED_KEY"
        | "REVOKED_KEY"
        | "MERCHANT_INACTIVE"
        | "INSUFFICIENT_PERMISSIONS"
}

/**
 * Use case for validating API keys.
 *
 * @example
 * ```typescript
 * const useCase = new ValidateApiKeyUseCase(apiKeyRepository, merchantRepository)
 *
 * // In middleware
 * const result = await useCase.execute({
 *     rawKey: req.headers["x-api-key"],
 *     requiredPermissions: [ApiKeyPermission.SEND],
 * })
 *
 * if (!result.valid) {
 *     return res.status(401).json({ error: result.errorMessage })
 * }
 *
 * req.merchant = result.merchant
 * req.apiKey = result.apiKey
 * ```
 */
export class ValidateApiKeyUseCase {
    constructor(
        private readonly apiKeyRepository: ApiKeyRepositoryPort,
        private readonly merchantRepository: MerchantRepositoryPort,
    ) {}

    async execute(input: ValidateApiKeyInput): Promise<ValidateApiKeyOutput> {
        // Extract prefix from key for lookup
        const prefix = this.extractPrefix(input.rawKey)
        if (!prefix) {
            return {
                valid: false,
                apiKey: null,
                merchant: null,
                errorMessage: "Invalid API key format",
                errorCode: "INVALID_KEY",
            }
        }

        // Find API key by prefix
        const apiKey = await this.apiKeyRepository.findByPrefix(prefix)
        if (!apiKey) {
            return {
                valid: false,
                apiKey: null,
                merchant: null,
                errorMessage: "Invalid API key",
                errorCode: "INVALID_KEY",
            }
        }

        // Validate the full key
        if (!apiKey.validateKey(input.rawKey)) {
            return {
                valid: false,
                apiKey: null,
                merchant: null,
                errorMessage: "Invalid API key",
                errorCode: "INVALID_KEY",
            }
        }

        // Check if key is expired
        if (apiKey.isExpired()) {
            return {
                valid: false,
                apiKey,
                merchant: null,
                errorMessage: "API key has expired",
                errorCode: "EXPIRED_KEY",
            }
        }

        // Check if key is revoked
        if (!apiKey.isActive) {
            return {
                valid: false,
                apiKey,
                merchant: null,
                errorMessage: "API key has been revoked",
                errorCode: "REVOKED_KEY",
            }
        }

        // Load merchant
        const merchant = await this.merchantRepository.findById(apiKey.merchantId)
        if (!merchant) {
            return {
                valid: false,
                apiKey,
                merchant: null,
                errorMessage: "Merchant not found",
                errorCode: "INVALID_KEY",
            }
        }

        // Check if merchant is active
        if (!merchant.isActive()) {
            return {
                valid: false,
                apiKey,
                merchant,
                errorMessage: "Merchant account is not active",
                errorCode: "MERCHANT_INACTIVE",
            }
        }

        // Check permissions
        if (input.requiredPermissions?.length) {
            if (!apiKey.hasAllPermissions(input.requiredPermissions)) {
                return {
                    valid: false,
                    apiKey,
                    merchant,
                    errorMessage: "Insufficient permissions",
                    errorCode: "INSUFFICIENT_PERMISSIONS",
                }
            }
        }

        // Record usage
        apiKey.recordUsage()
        await this.apiKeyRepository.save(apiKey)

        return {
            valid: true,
            apiKey,
            merchant,
        }
    }

    /**
     * Extract the prefix from a raw API key.
     * Format: on_{env}_{random} -> on_{env}_{first8chars}
     */
    private extractPrefix(rawKey: string): string | null {
        // Expected format: on_live_abc123... or on_test_abc123...
        const match = /^(on_(?:live|test)_[a-zA-Z0-9]{8})/.exec(rawKey)
        return match ? match[1] : null
    }
}
