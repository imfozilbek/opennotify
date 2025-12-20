import { MerchantSettings } from "../../domain/entities/Merchant"
import { MerchantRepositoryPort } from "../ports/MerchantRepositoryPort"

/**
 * Input for getting merchant settings.
 */
export interface GetSettingsInput {
    /** Merchant ID */
    merchantId: string
}

/**
 * Output from getting merchant settings.
 */
export interface GetSettingsOutput {
    /** Whether retrieval was successful */
    success: boolean

    /** The merchant settings */
    settings: MerchantSettings | null

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for retrieving merchant settings.
 *
 * @example
 * ```typescript
 * const useCase = new GetSettingsUseCase(merchantRepository)
 *
 * const result = await useCase.execute({
 *     merchantId: "merchant_123",
 * })
 *
 * if (result.success) {
 *     console.log("Settings:", result.settings)
 * }
 * ```
 */
export class GetSettingsUseCase {
    constructor(private readonly merchantRepository: MerchantRepositoryPort) {}

    async execute(input: GetSettingsInput): Promise<GetSettingsOutput> {
        const merchant = await this.merchantRepository.findById(input.merchantId)

        if (!merchant) {
            return {
                success: false,
                settings: null,
                errorMessage: "Merchant not found",
            }
        }

        return {
            success: true,
            settings: merchant.settings,
        }
    }
}
