import { RoutingRuleRepositoryPort } from "../ports/RoutingRuleRepositoryPort"

/**
 * Input for deleting a routing rule.
 */
export interface DeleteRoutingRuleInput {
    /** Rule ID to delete */
    id: string

    /** Merchant ID (for ownership verification) */
    merchantId: string
}

/**
 * Output from deleting a routing rule.
 */
export interface DeleteRoutingRuleOutput {
    /** Whether the rule was deleted successfully */
    success: boolean

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for deleting routing rules.
 *
 * Deletes an existing routing rule. Only merchant-owned rules can be deleted
 * (system defaults cannot be removed).
 *
 * @example
 * ```typescript
 * const useCase = new DeleteRoutingRuleUseCase(repository)
 *
 * const result = await useCase.execute({
 *     id: "rule_123",
 *     merchantId: "merchant_456",
 * })
 *
 * if (result.success) {
 *     console.log("Rule deleted")
 * } else {
 *     console.error("Failed:", result.errorMessage)
 * }
 * ```
 */
export class DeleteRoutingRuleUseCase {
    constructor(private readonly repository: RoutingRuleRepositoryPort) {}

    async execute(input: DeleteRoutingRuleInput): Promise<DeleteRoutingRuleOutput> {
        // Find existing rule
        const rule = await this.repository.findById(input.id)
        if (!rule) {
            return {
                success: false,
                errorMessage: `Routing rule with ID "${input.id}" not found`,
            }
        }

        // Cannot delete system defaults
        if (rule.isSystemDefault) {
            return {
                success: false,
                errorMessage: "Cannot delete system default routing rules",
            }
        }

        // Verify rule belongs to merchant
        if (rule.merchantId !== input.merchantId) {
            return {
                success: false,
                errorMessage: "Routing rule does not belong to this merchant",
            }
        }

        try {
            // Delete rule
            await this.repository.delete(input.id)

            return {
                success: true,
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }
}
