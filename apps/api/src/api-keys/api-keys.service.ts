import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import * as crypto from "crypto"
import {
    ApiKey,
    ApiKeyPermission,
    ApiKeyRepositoryPort,
    CreateApiKeyUseCase,
    MerchantRepositoryPort,
} from "@opennotify/core"
import {
    ApiKeyListResponse,
    ApiKeyResponse,
    CreateApiKeyDto,
    CreateApiKeyResponse,
} from "./dto/api-key.dto"

@Injectable()
export class ApiKeysService {
    private readonly createApiKeyUseCase: CreateApiKeyUseCase

    constructor(
        @Inject("MerchantRepository")
        private readonly merchantRepository: MerchantRepositoryPort,
        @Inject("ApiKeyRepository")
        private readonly apiKeyRepository: ApiKeyRepositoryPort,
    ) {
        this.createApiKeyUseCase = new CreateApiKeyUseCase(
            this.apiKeyRepository,
            this.merchantRepository,
        )
    }

    /**
     * List all API keys for a merchant.
     */
    async listApiKeys(merchantId: string): Promise<ApiKeyListResponse> {
        const apiKeys = await this.createApiKeyUseCase.listForMerchant(merchantId)
        return {
            apiKeys: apiKeys.map((key) => this.toApiKeyResponse(key)),
            total: apiKeys.length,
        }
    }

    /**
     * Create a new API key.
     */
    async createApiKey(merchantId: string, dto: CreateApiKeyDto): Promise<CreateApiKeyResponse> {
        const keyId = `key_${crypto.randomUUID()}`

        const result = await this.createApiKeyUseCase.execute({
            id: keyId,
            merchantId,
            name: dto.name,
            permissions: dto.permissions as ApiKeyPermission[],
            environment: "live",
            expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        })

        if (!result.success || !result.apiKey || !result.rawKey) {
            throw new Error(result.errorMessage ?? "Failed to create API key")
        }

        return {
            apiKey: this.toApiKeyResponse(result.apiKey),
            rawKey: result.rawKey,
        }
    }

    /**
     * Revoke an API key.
     */
    async revokeApiKey(merchantId: string, keyId: string): Promise<void> {
        const result = await this.createApiKeyUseCase.revoke(keyId, merchantId)

        if (!result.success) {
            throw new NotFoundException(result.errorMessage ?? "API key not found")
        }
    }

    /**
     * Convert ApiKey entity to response.
     */
    private toApiKeyResponse(apiKey: ApiKey): ApiKeyResponse {
        return {
            id: apiKey.id,
            name: apiKey.name,
            keyPrefix: apiKey.keyPrefix,
            permissions: apiKey.permissions,
            isActive: apiKey.isActive,
            expiresAt: apiKey.expiresAt?.toISOString() ?? null,
            lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? null,
            createdAt: apiKey.createdAt.toISOString(),
        }
    }
}
