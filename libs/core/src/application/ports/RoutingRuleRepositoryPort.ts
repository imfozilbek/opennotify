import { RoutingRule } from "../../domain/entities/RoutingRule"

/**
 * Filters for querying routing rules.
 */
export interface RoutingRuleFilters {
    /** Filter by enabled status */
    enabled?: boolean
}

/**
 * Repository port for routing rule persistence.
 *
 * @example
 * ```typescript
 * // Get all rules for a merchant (including system defaults)
 * const merchantRules = await repository.findByMerchantId("merchant_123")
 * const systemDefaults = await repository.getSystemDefaults()
 * const allRules = [...merchantRules, ...systemDefaults]
 *
 * // Create a new rule
 * const rule = RoutingRule.create({
 *     id: "rule_456",
 *     merchantId: "merchant_123",
 *     name: "Custom OTP Rule",
 *     priority: 1,
 *     conditions: { messageTypes: [MessageType.OTP] },
 *     strategy: { type: "cost_optimized" },
 *     maxAttempts: 2,
 *     enabled: true,
 * })
 * await repository.save(rule)
 * ```
 */
export interface RoutingRuleRepositoryPort {
    /**
     * Save a routing rule (create or update).
     */
    save(rule: RoutingRule): Promise<void>

    /**
     * Find a routing rule by ID.
     */
    findById(id: string): Promise<RoutingRule | null>

    /**
     * Find all routing rules for a merchant.
     * Does not include system defaults.
     */
    findByMerchantId(merchantId: string, filters?: RoutingRuleFilters): Promise<RoutingRule[]>

    /**
     * Find a routing rule by name for a merchant.
     * Used for uniqueness validation.
     */
    findByName(merchantId: string, name: string): Promise<RoutingRule | null>

    /**
     * Delete a routing rule by ID.
     */
    delete(id: string): Promise<void>

    /**
     * Get all system default routing rules (merchantId is null).
     */
    getSystemDefaults(): Promise<RoutingRule[]>

    /**
     * Count routing rules for a merchant.
     */
    countByMerchantId(merchantId: string): Promise<number>
}
