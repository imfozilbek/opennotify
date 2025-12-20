import { RoutingRule } from "../../domain/entities/RoutingRule"
import { RoutingRuleRepositoryPort } from "../ports/RoutingRuleRepositoryPort"

/**
 * Input for getting a routing rule.
 */
export interface GetRoutingRuleInput {
    /** Rule ID to get */
    id: string

    /** Merchant ID (for ownership verification) */
    merchantId: string
}

/**
 * Output from getting a routing rule.
 */
export interface GetRoutingRuleOutput {
    /** Whether the operation was successful */
    success: boolean

    /** The routing rule entity */
    rule?: RoutingRule

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for getting a single routing rule.
 *
 * Returns a routing rule by ID. Both merchant-owned and system default rules
 * can be retrieved.
 *
 * @example
 * ```typescript
 * const useCase = new GetRoutingRuleUseCase(repository)
 *
 * const result = await useCase.execute({
 *     id: "rule_123",
 *     merchantId: "merchant_456",
 * })
 *
 * if (result.success) {
 *     console.log("Rule:", result.rule?.name)
 *     console.log("Is system default:", result.rule?.isSystemDefault)
 * } else {
 *     console.error("Failed:", result.errorMessage)
 * }
 * ```
 */
export class GetRoutingRuleUseCase {
    constructor(private readonly repository: RoutingRuleRepositoryPort) {}

    async execute(input: GetRoutingRuleInput): Promise<GetRoutingRuleOutput> {
        try {
            // Find rule
            const rule = await this.repository.findById(input.id)
            if (!rule) {
                return {
                    success: false,
                    errorMessage: `Routing rule with ID "${input.id}" not found`,
                }
            }

            // Allow access to system defaults (merchantId is null)
            // or rules belonging to the merchant
            if (!rule.isSystemDefault && rule.merchantId !== input.merchantId) {
                return {
                    success: false,
                    errorMessage: "Routing rule does not belong to this merchant",
                }
            }

            return {
                success: true,
                rule,
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }
}
