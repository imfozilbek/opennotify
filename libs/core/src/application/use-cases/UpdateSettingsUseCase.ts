import { MerchantSettings } from "../../domain/entities/Merchant"
import { MerchantRepositoryPort } from "../ports/MerchantRepositoryPort"

/**
 * Input for updating merchant settings.
 */
export interface UpdateSettingsInput {
    /** Merchant ID */
    merchantId: string

    /** Settings to update (partial) */
    settings: Partial<MerchantSettings>
}

/**
 * Output from updating merchant settings.
 */
export interface UpdateSettingsOutput {
    /** Whether update was successful */
    success: boolean

    /** The updated settings */
    settings: MerchantSettings | null

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for updating merchant settings.
 *
 * @example
 * ```typescript
 * const useCase = new UpdateSettingsUseCase(merchantRepository)
 *
 * const result = await useCase.execute({
 *     merchantId: "merchant_123",
 *     settings: {
 *         timezone: "Asia/Tashkent",
 *         defaultLanguage: "uz",
 *         rateLimitPerMinute: 100,
 *     },
 * })
 *
 * if (result.success) {
 *     console.log("Updated settings:", result.settings)
 * }
 * ```
 */
export class UpdateSettingsUseCase {
    constructor(private readonly merchantRepository: MerchantRepositoryPort) {}

    async execute(input: UpdateSettingsInput): Promise<UpdateSettingsOutput> {
        const merchant = await this.merchantRepository.findById(input.merchantId)

        if (!merchant) {
            return {
                success: false,
                settings: null,
                errorMessage: "Merchant not found",
            }
        }

        if (!merchant.isActive()) {
            return {
                success: false,
                settings: null,
                errorMessage: "Merchant account is not active",
            }
        }

        // Update settings
        merchant.updateSettings(input.settings)

        // Persist changes
        await this.merchantRepository.save(merchant)

        return {
            success: true,
            settings: merchant.settings,
        }
    }
}
