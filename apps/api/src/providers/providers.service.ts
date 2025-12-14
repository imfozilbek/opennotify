import { Injectable } from "@nestjs/common"
import * as crypto from "crypto"
import {
    EncryptedCredentials,
    Provider,
    ProviderCredentials,
    ProviderCredentialsData,
} from "@opennotify/core"
import { ConnectProviderDto, ProviderTypeDto } from "./dto/connect-provider.dto"

export interface ConnectedProvider {
    id: string
    provider: Provider
    createdAt: Date
    maskedCredentials: Record<string, unknown>
}

export interface ConnectResult {
    success: boolean
    providerId?: string
    errorMessage?: string
}

@Injectable()
export class ProvidersService {
    // In-memory storage: merchantId -> providerId -> encrypted credentials
    private readonly providerStore = new Map<string, Map<string, EncryptedCredentials>>()

    private readonly encryptionKey: string

    constructor() {
        // Use environment variable for encryption key or generate default for development
        this.encryptionKey = process.env.ENCRYPTION_KEY ?? crypto.randomBytes(32).toString("hex")
    }

    async connect(merchantId: string, dto: ConnectProviderDto): Promise<ConnectResult> {
        const provider = this.mapProviderType(dto.provider)

        // Build credentials data
        const credentialsData: ProviderCredentialsData = {
            provider,
            ...dto.credentials,
        } as ProviderCredentialsData

        // Create and encrypt credentials
        const credentials = ProviderCredentials.create(credentialsData)
        const encrypted = credentials.encrypt(this.encryptionKey)

        // Generate provider ID
        const providerId = `prov_${crypto.randomUUID()}`

        // Store encrypted credentials
        let merchantProviders = this.providerStore.get(merchantId)
        if (!merchantProviders) {
            merchantProviders = new Map()
            this.providerStore.set(merchantId, merchantProviders)
        }
        merchantProviders.set(providerId, encrypted)

        return {
            success: true,
            providerId,
        }
    }

    async listProviders(merchantId: string): Promise<ConnectedProvider[]> {
        const merchantProviders = this.providerStore.get(merchantId)
        if (!merchantProviders) {
            return []
        }

        const result: ConnectedProvider[] = []
        for (const [id, encrypted] of merchantProviders.entries()) {
            // Decrypt to get masked view
            const credentials = ProviderCredentials.decrypt(encrypted, this.encryptionKey)
            result.push({
                id,
                provider: encrypted.provider,
                createdAt: new Date(), // Would be stored in real implementation
                maskedCredentials: credentials.toMasked(),
            })
        }

        return result
    }

    async deleteProvider(merchantId: string, providerId: string): Promise<boolean> {
        const merchantProviders = this.providerStore.get(merchantId)
        if (!merchantProviders) {
            return false
        }
        return merchantProviders.delete(providerId)
    }

    async getDecryptedCredentials(
        merchantId: string,
        providerId: string,
    ): Promise<ProviderCredentials | null> {
        const merchantProviders = this.providerStore.get(merchantId)
        if (!merchantProviders) {
            return null
        }

        const encrypted = merchantProviders.get(providerId)
        if (!encrypted) {
            return null
        }

        return ProviderCredentials.decrypt(encrypted, this.encryptionKey)
    }

    private mapProviderType(dto: ProviderTypeDto): Provider {
        const mapping: Record<ProviderTypeDto, Provider> = {
            [ProviderTypeDto.ESKIZ]: Provider.ESKIZ,
            [ProviderTypeDto.PLAYMOBILE]: Provider.PLAYMOBILE,
            [ProviderTypeDto.GETSMS]: Provider.GETSMS,
            [ProviderTypeDto.TELEGRAM_BOT]: Provider.TELEGRAM_BOT,
            [ProviderTypeDto.SMTP]: Provider.SMTP,
            [ProviderTypeDto.SENDGRID]: Provider.SENDGRID,
            [ProviderTypeDto.MAILGUN]: Provider.MAILGUN,
            [ProviderTypeDto.FCM]: Provider.FCM,
            [ProviderTypeDto.APNS]: Provider.APNS,
            [ProviderTypeDto.WHATSAPP_BUSINESS]: Provider.WHATSAPP_BUSINESS,
        }
        return mapping[dto]
    }
}
