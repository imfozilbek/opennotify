import {
    CreateRoutingRuleProps,
    RoutingConditions,
    RoutingRule,
    RoutingStrategy,
} from "../../domain/entities/RoutingRule"
import { RetryPolicyProps } from "../../domain/value-objects/RetryPolicy"
import { RoutingRuleRepositoryPort } from "../ports/RoutingRuleRepositoryPort"

/**
 * Input for creating a routing rule.
 */
export interface CreateRoutingRuleInput {
    /** Unique rule ID */
    id: string

    /** Merchant this rule belongs to */
    merchantId: string

    /** Human-readable rule name */
    name: string

    /** Rule priority (lower = evaluated first) */
    priority: number

    /** Conditions when this rule applies */
    conditions: RoutingConditions

    /** Routing strategy to apply */
    strategy: RoutingStrategy

    /** Maximum fallback attempts */
    maxAttempts: number

    /** Whether the rule is enabled */
    enabled: boolean

    /** Retry policy for this rule */
    retryPolicy?: RetryPolicyProps
}

/**
 * Output from creating a routing rule.
 */
export interface CreateRoutingRuleOutput {
    /** Whether the rule was created successfully */
    success: boolean

    /** The created routing rule entity */
    rule?: RoutingRule

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for creating routing rules.
 *
 * Creates a new routing rule for a merchant. Rules must have unique names
 * within a merchant.
 *
 * @example
 * ```typescript
 * const useCase = new CreateRoutingRuleUseCase(repository)
 *
 * const result = await useCase.execute({
 *     id: "rule_123",
 *     merchantId: "merchant_456",
 *     name: "Custom OTP Rule",
 *     priority: 1,
 *     conditions: { messageTypes: [MessageType.OTP] },
 *     strategy: { type: "cost_optimized" },
 *     maxAttempts: 2,
 *     enabled: true,
 * })
 *
 * if (result.success) {
 *     console.log("Created:", result.rule?.id)
 * } else {
 *     console.error("Failed:", result.errorMessage)
 * }
 * ```
 */
export class CreateRoutingRuleUseCase {
    constructor(private readonly repository: RoutingRuleRepositoryPort) {}

    async execute(input: CreateRoutingRuleInput): Promise<CreateRoutingRuleOutput> {
        // Check for duplicate name within merchant
        const existingByName = await this.repository.findByName(input.merchantId, input.name)
        if (existingByName) {
            return {
                success: false,
                errorMessage: `Routing rule with name "${input.name}" already exists for this merchant`,
            }
        }

        // Check if ID already exists
        const existingById = await this.repository.findById(input.id)
        if (existingById) {
            return {
                success: false,
                errorMessage: `Routing rule with ID "${input.id}" already exists`,
            }
        }

        try {
            // Create routing rule entity
            const ruleProps: CreateRoutingRuleProps = {
                id: input.id,
                merchantId: input.merchantId,
                name: input.name,
                priority: input.priority,
                conditions: input.conditions,
                strategy: input.strategy,
                maxAttempts: input.maxAttempts,
                enabled: input.enabled,
                retryPolicy: input.retryPolicy,
            }

            const rule = RoutingRule.create(ruleProps)

            // Persist rule
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
