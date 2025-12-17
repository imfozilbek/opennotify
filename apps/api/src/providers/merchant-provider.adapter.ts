import { Injectable } from "@nestjs/common"
import {
    ApnsAdapter,
    EskizAdapter,
    FcmAdapter,
    MerchantProviderPort,
    NotificationProviderPort,
    Provider,
    ProviderCredentials,
    TelegramAdapter,
    WhatsAppAdapter,
} from "@opennotify/core"
import { ProvidersService } from "./providers.service"

/**
 * Adapter implementing MerchantProviderPort for the API layer.
 *
 * Bridges the gap between stored provider credentials and
 * the notification sending flow. Creates provider adapters
 * on-demand using merchant's connected provider credentials.
 *
 * @example
 * ```typescript
 * @Module({
 *     providers: [MerchantProviderAdapter, ProvidersService],
 *     exports: [MerchantProviderAdapter],
 * })
 * export class ProvidersModule {}
 * ```
 */
@Injectable()
export class MerchantProviderAdapter implements MerchantProviderPort {
    // Cache of provider adapters per merchant: merchantId -> provider -> adapter
    private readonly adapterCache = new Map<string, Map<Provider, NotificationProviderPort>>()

    constructor(private readonly providersService: ProvidersService) {}

    /**
     * Get all providers connected by a merchant.
     */
    async getConnectedProviders(merchantId: string): Promise<Provider[]> {
        const providers = await this.providersService.listProviders(merchantId)
        return providers.map((p) => p.provider)
    }

    /**
     * Get a provider adapter instance initialized with merchant's credentials.
     */
    async getProviderAdapter(
        merchantId: string,
        provider: Provider,
    ): Promise<NotificationProviderPort | null> {
        // Check cache first
        const cached = this.getCachedAdapter(merchantId, provider)
        if (cached) {
            return cached
        }

        // Find the provider credentials
        const providers = await this.providersService.listProviders(merchantId)
        const providerInfo = providers.find((p) => p.provider === provider)

        if (!providerInfo) {
            return null
        }

        // Get decrypted credentials
        const credentials = await this.providersService.getDecryptedCredentials(
            merchantId,
            providerInfo.id,
        )

        if (!credentials) {
            return null
        }

        // Create adapter
        const adapter = this.createAdapter(provider, credentials)
        if (!adapter) {
            return null
        }

        // Cache it
        this.cacheAdapter(merchantId, provider, adapter)

        return adapter
    }

    /**
     * Check if a merchant has connected a specific provider.
     */
    async hasProvider(merchantId: string, provider: Provider): Promise<boolean> {
        const providers = await this.getConnectedProviders(merchantId)
        return providers.includes(provider)
    }

    /**
     * Clear cached adapters for a merchant.
     * Call this when provider credentials are updated or deleted.
     */
    clearCache(merchantId: string, provider?: Provider): void {
        if (provider) {
            const merchantCache = this.adapterCache.get(merchantId)
            if (merchantCache) {
                merchantCache.delete(provider)
            }
        } else {
            this.adapterCache.delete(merchantId)
        }
    }

    /**
     * Get cached adapter if available.
     */
    private getCachedAdapter(
        merchantId: string,
        provider: Provider,
    ): NotificationProviderPort | undefined {
        const merchantCache = this.adapterCache.get(merchantId)
        if (!merchantCache) {
            return undefined
        }
        return merchantCache.get(provider)
    }

    /**
     * Cache an adapter for reuse.
     */
    private cacheAdapter(
        merchantId: string,
        provider: Provider,
        adapter: NotificationProviderPort,
    ): void {
        let merchantCache = this.adapterCache.get(merchantId)
        if (!merchantCache) {
            merchantCache = new Map()
            this.adapterCache.set(merchantId, merchantCache)
        }
        merchantCache.set(provider, adapter)
    }

    /**
     * Create a provider adapter from credentials.
     */
    private createAdapter(
        provider: Provider,
        credentials: ProviderCredentials,
    ): NotificationProviderPort | null {
        switch (provider) {
            case Provider.ESKIZ: {
                const eskizCreds = credentials.asEskiz()
                if (!eskizCreds) {
                    return null
                }
                return new EskizAdapter({
                    email: eskizCreds.email,
                    password: eskizCreds.password,
                    from: eskizCreds.from,
                })
            }

            case Provider.TELEGRAM_BOT: {
                const telegramCreds = credentials.asTelegram()
                if (!telegramCreds) {
                    return null
                }
                return new TelegramAdapter({
                    botToken: telegramCreds.botToken,
                })
            }

            case Provider.FCM: {
                const fcmCreds = credentials.asFcm()
                if (!fcmCreds) {
                    return null
                }
                return new FcmAdapter({
                    projectId: fcmCreds.projectId,
                    clientEmail: fcmCreds.clientEmail,
                    privateKey: fcmCreds.privateKey,
                })
            }

            case Provider.APNS: {
                const apnsCreds = credentials.asApns()
                if (!apnsCreds) {
                    return null
                }
                return new ApnsAdapter({
                    keyId: apnsCreds.keyId,
                    teamId: apnsCreds.teamId,
                    privateKey: apnsCreds.privateKey,
                    bundleId: apnsCreds.bundleId,
                    production: apnsCreds.production,
                })
            }

            case Provider.WHATSAPP_BUSINESS: {
                const whatsappCreds = credentials.asWhatsApp()
                if (!whatsappCreds) {
                    return null
                }
                return new WhatsAppAdapter({
                    phoneNumberId: whatsappCreds.phoneNumberId,
                    accessToken: whatsappCreds.accessToken,
                    businessAccountId: whatsappCreds.businessAccountId,
                })
            }

            // TODO: Implement other providers as they are added
            case Provider.PLAYMOBILE:
            case Provider.GETSMS:
            case Provider.SMTP:
            case Provider.SENDGRID:
            case Provider.MAILGUN:
                // Not implemented yet
                return null

            default:
                return null
        }
    }
}
