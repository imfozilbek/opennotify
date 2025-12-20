import { RoutingRule } from "../../domain/entities/RoutingRule"
import { RoutingRuleRepositoryPort } from "../ports/RoutingRuleRepositoryPort"

/**
 * Input for listing routing rules.
 */
export interface ListRoutingRulesInput {
    /** Merchant ID */
    merchantId: string

    /** Include system default rules */
    includeDefaults?: boolean

    /** Filter by enabled status */
    enabled?: boolean
}

/**
 * Output from listing routing rules.
 */
export interface ListRoutingRulesOutput {
    /** Whether the operation was successful */
    success: boolean

    /** List of routing rules (sorted by priority) */
    rules: RoutingRule[]

    /** Count of merchant-owned rules */
    merchantRulesCount: number

    /** Count of system default rules (if included) */
    systemDefaultsCount: number

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for listing routing rules.
 *
 * Returns all routing rules for a merchant, optionally including system defaults.
 * Rules are sorted by priority (lower = higher priority).
 *
 * @example
 * ```typescript
 * const useCase = new ListRoutingRulesUseCase(repository)
 *
 * // Get all rules including defaults
 * const result = await useCase.execute({
 *     merchantId: "merchant_456",
 *     includeDefaults: true,
 * })
 *
 * console.log("Merchant rules:", result.merchantRulesCount)
 * console.log("System defaults:", result.systemDefaultsCount)
 *
 * // Get only enabled rules
 * const enabledResult = await useCase.execute({
 *     merchantId: "merchant_456",
 *     enabled: true,
 * })
 * ```
 */
export class ListRoutingRulesUseCase {
    constructor(private readonly repository: RoutingRuleRepositoryPort) {}

    async execute(input: ListRoutingRulesInput): Promise<ListRoutingRulesOutput> {
        try {
            // Get merchant rules
            const merchantRules = await this.repository.findByMerchantId(input.merchantId, {
                enabled: input.enabled,
            })

            let systemDefaults: RoutingRule[] = []
            if (input.includeDefaults !== false) {
                // Include defaults by default
                systemDefaults = await this.repository.getSystemDefaults()

                // Filter defaults by enabled status if specified
                if (input.enabled !== undefined) {
                    systemDefaults = systemDefaults.filter((rule) => rule.enabled === input.enabled)
                }
            }

            // Combine and sort by priority
            const allRules = [...merchantRules, ...systemDefaults].sort(
                (a, b) => a.priority - b.priority,
            )

            return {
                success: true,
                rules: allRules,
                merchantRulesCount: merchantRules.length,
                systemDefaultsCount: systemDefaults.length,
            }
        } catch (error) {
            return {
                success: false,
                rules: [],
                merchantRulesCount: 0,
                systemDefaultsCount: 0,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }
}
