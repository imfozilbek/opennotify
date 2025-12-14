import { Inject, Injectable } from "@nestjs/common"
import * as crypto from "crypto"
import {
    ApiKeyPermission,
    ApiKeyRepositoryPort,
    CreateApiKeyUseCase,
    Merchant,
    MerchantRepositoryPort,
} from "@opennotify/core"
import { RegisterDto } from "./dto/register.dto"

export interface RegisterResult {
    success: boolean
    merchantId?: string
    apiKey?: string
    errorMessage?: string
}

@Injectable()
export class AuthService {
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

    async register(dto: RegisterDto): Promise<RegisterResult> {
        // Check if email is already taken
        const existing = await this.merchantRepository.findByEmail(dto.email)
        if (existing) {
            return {
                success: false,
                errorMessage: "Email already registered",
            }
        }

        // Create merchant
        const merchantId = `merchant_${crypto.randomUUID()}`
        const merchant = Merchant.create({
            id: merchantId,
            name: dto.name,
            email: dto.email,
        })

        await this.merchantRepository.save(merchant)

        // Create initial API key with all permissions
        const keyId = `key_${crypto.randomUUID()}`
        const keyResult = await this.createApiKeyUseCase.execute({
            id: keyId,
            merchantId,
            name: "Default API Key",
            permissions: [ApiKeyPermission.ADMIN],
            environment: "live",
        })

        if (!keyResult.success || !keyResult.rawKey) {
            return {
                success: false,
                errorMessage: "Failed to create API key",
            }
        }

        return {
            success: true,
            merchantId,
            apiKey: keyResult.rawKey,
        }
    }
}
