import { Inject, Injectable, NotFoundException } from "@nestjs/common"
import {
    GetSettingsUseCase,
    MerchantRepositoryPort,
    MerchantSettings,
    UpdateSettingsUseCase,
} from "@opennotify/core"
import { SettingsResponse, UpdateSettingsDto } from "./dto/settings.dto"

@Injectable()
export class SettingsService {
    private readonly getSettingsUseCase: GetSettingsUseCase
    private readonly updateSettingsUseCase: UpdateSettingsUseCase

    constructor(
        @Inject("MerchantRepository")
        private readonly merchantRepository: MerchantRepositoryPort,
    ) {
        this.getSettingsUseCase = new GetSettingsUseCase(this.merchantRepository)
        this.updateSettingsUseCase = new UpdateSettingsUseCase(this.merchantRepository)
    }

    /**
     * Get merchant settings.
     */
    async getSettings(merchantId: string): Promise<SettingsResponse> {
        const result = await this.getSettingsUseCase.execute({ merchantId })

        if (!result.success || !result.settings) {
            throw new NotFoundException(result.errorMessage ?? "Settings not found")
        }

        return this.toSettingsResponse(result.settings)
    }

    /**
     * Update merchant settings.
     */
    async updateSettings(merchantId: string, dto: UpdateSettingsDto): Promise<SettingsResponse> {
        const result = await this.updateSettingsUseCase.execute({
            merchantId,
            settings: dto,
        })

        if (!result.success || !result.settings) {
            throw new NotFoundException(result.errorMessage ?? "Failed to update settings")
        }

        return this.toSettingsResponse(result.settings)
    }

    /**
     * Convert MerchantSettings to response.
     */
    // eslint-disable-next-line complexity
    private toSettingsResponse(settings: MerchantSettings): SettingsResponse {
        return {
            // General
            companyName: settings.companyName ?? null,
            country: settings.country ?? null,
            timezone: settings.timezone ?? null,
            defaultLanguage: settings.defaultLanguage ?? null,

            // Notification
            defaultSmsSender: settings.defaultSmsSender ?? null,
            defaultEmailFrom: settings.defaultEmailFrom ?? null,
            webhookUrl: settings.webhookUrl ?? null,
            webhookSecret: settings.webhookSecret ?? null,
            rateLimitPerMinute: settings.rateLimitPerMinute ?? null,
            rateLimitPerDay: settings.rateLimitPerDay ?? null,
            retryAttempts: settings.retryAttempts ?? null,
            retryDelaySeconds: settings.retryDelaySeconds ?? null,

            // Security
            twoFactorEnabled: settings.twoFactorEnabled ?? false,
            sessionTimeoutMinutes: settings.sessionTimeoutMinutes ?? null,
            ipWhitelist: settings.ipWhitelist ?? [],

            // Branding
            logoUrl: settings.logoUrl ?? null,
            primaryColor: settings.primaryColor ?? null,
            accentColor: settings.accentColor ?? null,
        }
    }
}
