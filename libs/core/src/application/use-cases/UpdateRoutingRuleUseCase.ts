import {
    RoutingConditions,
    RoutingRule,
    RoutingStrategy,
    UpdateRoutingRuleProps,
} from "../../domain/entities/RoutingRule"
import { RetryPolicyProps } from "../../domain/value-objects/RetryPolicy"
import { RoutingRuleRepositoryPort } from "../ports/RoutingRuleRepositoryPort"

/**
 * Input for updating a routing rule.
 */
export interface UpdateRoutingRuleInput {
    /** Rule ID to update */
    id: string

    /** Merchant ID (for ownership verification) */
    merchantId: string

    /** New rule name (optional) */
    name?: string

    /** New priority (optional) */
    priority?: number

    /** New conditions (optional) */
    conditions?: RoutingConditions

    /** New strategy (optional) */
    strategy?: RoutingStrategy

    /** New max attempts (optional) */
    maxAttempts?: number

    /** Enable/disable rule (optional) */
    enabled?: boolean

    /** New retry policy (optional) */
    retryPolicy?: RetryPolicyProps
}

/**
 * Output from updating a routing rule.
 */
export interface UpdateRoutingRuleOutput {
    /** Whether the rule was updated successfully */
    success: boolean

    /** The updated routing rule entity */
    rule?: RoutingRule

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for updating routing rules.
 *
 * Updates an existing routing rule. Only merchant-owned rules can be updated
 * (system defaults cannot be modified).
 *
 * @example
 * ```typescript
 * const useCase = new UpdateRoutingRuleUseCase(repository)
 *
 * const result = await useCase.execute({
 *     id: "rule_123",
 *     merchantId: "merchant_456",
 *     name: "Updated Rule Name",
 *     priority: 2,
 *     enabled: false,
 * })
 *
 * if (result.success) {
 *     console.log("Updated:", result.rule?.name)
 * } else {
 *     console.error("Failed:", result.errorMessage)
 * }
 * ```
 */
export class UpdateRoutingRuleUseCase {
    constructor(private readonly repository: RoutingRuleRepositoryPort) {}

    async execute(input: UpdateRoutingRuleInput): Promise<UpdateRoutingRuleOutput> {
        // Find existing rule
        const rule = await this.repository.findById(input.id)
        if (!rule) {
            return {
                success: false,
                errorMessage: `Routing rule with ID "${input.id}" not found`,
            }
        }

        // Verify ownership - cannot update system defaults
        if (rule.isSystemDefault) {
            return {
                success: false,
                errorMessage: "Cannot update system default routing rules",
            }
        }

        // Verify rule belongs to merchant
        if (rule.merchantId !== input.merchantId) {
            return {
                success: false,
                errorMessage: "Routing rule does not belong to this merchant",
            }
        }

        // Check for name conflict if name is being changed
        if (input.name && input.name !== rule.name) {
            const existingByName = await this.repository.findByName(input.merchantId, input.name)
            if (existingByName && existingByName.id !== input.id) {
                return {
                    success: false,
                    errorMessage: `Routing rule with name "${input.name}" already exists for this merchant`,
                }
            }
        }

        try {
            // Build update props
            const updateProps: UpdateRoutingRuleProps = {}
            if (input.name !== undefined) {
                updateProps.name = input.name
            }
            if (input.priority !== undefined) {
                updateProps.priority = input.priority
            }
            if (input.conditions !== undefined) {
                updateProps.conditions = input.conditions
            }
            if (input.strategy !== undefined) {
                updateProps.strategy = input.strategy
            }
            if (input.maxAttempts !== undefined) {
                updateProps.maxAttempts = input.maxAttempts
            }
            if (input.enabled !== undefined) {
                updateProps.enabled = input.enabled
            }
            if (input.retryPolicy !== undefined) {
                updateProps.retryPolicy = input.retryPolicy
            }

            // Update rule
            rule.update(updateProps)

            // Persist changes
            await this.repository.save(rule)

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
