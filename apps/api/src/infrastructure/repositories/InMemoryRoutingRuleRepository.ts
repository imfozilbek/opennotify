import { Injectable } from "@nestjs/common"
import {
    DEFAULT_ROUTING_RULES,
    RoutingRule,
    RoutingRuleFilters,
    RoutingRuleProps,
    RoutingRuleRepositoryPort,
} from "@opennotify/core"

/**
 * In-memory implementation of RoutingRuleRepositoryPort.
 * For development and testing purposes.
 */
@Injectable()
export class InMemoryRoutingRuleRepository implements RoutingRuleRepositoryPort {
    private readonly rules = new Map<string, RoutingRuleProps>()

    async save(rule: RoutingRule): Promise<void> {
        this.rules.set(rule.id, rule.toPersistence())
        return Promise.resolve()
    }

    async findById(id: string): Promise<RoutingRule | null> {
        // First check merchant rules
        const data = this.rules.get(id)
        if (data) {
            return Promise.resolve(RoutingRule.fromPersistence(data))
        }

        // Then check system defaults
        const systemDefault = DEFAULT_ROUTING_RULES.find((rule) => rule.id === id)
        if (systemDefault) {
            return Promise.resolve(systemDefault)
        }

        return Promise.resolve(null)
    }

    async findByMerchantId(
        merchantId: string,
        filters?: RoutingRuleFilters,
    ): Promise<RoutingRule[]> {
        const all = Array.from(this.rules.values()).filter((data) => data.merchantId === merchantId)

        // Apply filters
        let filtered = all
        if (filters?.enabled !== undefined) {
            filtered = filtered.filter((data) => data.enabled === filters.enabled)
        }

        // Sort by priority (lower = higher priority)
        filtered.sort((a, b) => a.priority - b.priority)

        return Promise.resolve(filtered.map((data) => RoutingRule.fromPersistence(data)))
    }

    async findByName(merchantId: string, name: string): Promise<RoutingRule | null> {
        for (const data of this.rules.values()) {
            if (data.merchantId === merchantId && data.name === name) {
                return Promise.resolve(RoutingRule.fromPersistence(data))
            }
        }
        return Promise.resolve(null)
    }

    async delete(id: string): Promise<void> {
        this.rules.delete(id)
        return Promise.resolve()
    }

    async getSystemDefaults(): Promise<RoutingRule[]> {
        return Promise.resolve([...DEFAULT_ROUTING_RULES])
    }

    async countByMerchantId(merchantId: string): Promise<number> {
        let count = 0
        for (const data of this.rules.values()) {
            if (data.merchantId === merchantId) {
                count++
            }
        }
        return Promise.resolve(count)
    }
}

/**
 * Shared instance for cross-module access.
 */
export const sharedRoutingRuleRepository = new InMemoryRoutingRuleRepository()
