import { Channel, ChannelCostPriority } from "../../domain/value-objects/Channel"
import { getChannelForProvider, Provider } from "../../domain/value-objects/Provider"
import { getAvailableChannels, RoutingContext } from "../../domain/value-objects/RoutingContext"
import {
    createEmptyResult,
    createRoutingResult,
    ProviderRoute,
    RoutingResult,
} from "../../domain/value-objects/RoutingResult"
import {
    DEFAULT_ROUTING_RULES,
    RoutingRule,
    RoutingStrategy,
} from "../../domain/entities/RoutingRule"

/**
 * Configuration for the RoutingEngine.
 */
export interface RoutingEngineConfig {
    /** Default routing rules */
    defaultRules?: RoutingRule[]

    /** Default max attempts if not specified by rule */
    defaultMaxAttempts?: number

    /** Channels allowed during quiet hours */
    quietHoursChannels?: Channel[]
}

const DEFAULT_CONFIG: RoutingEngineConfig = {
    defaultRules: DEFAULT_ROUTING_RULES,
    defaultMaxAttempts: 2,
    quietHoursChannels: [Channel.PUSH], // Only push during quiet hours
}

/**
 * Routing engine for intelligent channel and provider selection.
 *
 * Evaluates routing rules and returns an ordered fallback chain
 * of providers to try for notification delivery.
 *
 * @example
 * ```typescript
 * const engine = new RoutingEngine()
 *
 * const result = engine.resolve({
 *     merchantId: "merchant_123",
 *     messageType: MessageType.OTP,
 *     recipient,
 *     availableProviders: [Provider.ESKIZ, Provider.TELEGRAM_BOT],
 *     currentTime: new Date(),
 * })
 *
 * // result.routes = [
 * //   { channel: TELEGRAM, provider: TELEGRAM_BOT, priority: 0 },
 * //   { channel: SMS, provider: ESKIZ, priority: 1 },
 * // ]
 * ```
 */
export class RoutingEngine {
    private readonly config: RoutingEngineConfig

    constructor(config?: Partial<RoutingEngineConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    /**
     * Resolve the best routing path for a notification.
     *
     * Algorithm:
     * 1. Sort rules by priority
     * 2. Find first matching rule
     * 3. Apply routing strategy to get channel order
     * 4. Filter by recipient's available channels
     * 5. Filter by recipient's opt-out preferences
     * 6. Filter by merchant's available providers
     * 7. Apply quiet hours restrictions if applicable
     * 8. Build and return ordered fallback chain
     */
    resolve(context: RoutingContext, merchantRules?: RoutingRule[]): RoutingResult {
        // Combine merchant rules with default rules
        const allRules = this.mergeRules(merchantRules)

        // Sort by priority (lower = higher priority)
        const sortedRules = allRules.sort((a, b) => a.priority - b.priority)

        // Find first matching rule
        let matchedRule: RoutingRule | undefined
        for (const rule of sortedRules) {
            if (rule.matches(context)) {
                matchedRule = rule
                break
            }
        }

        // If no rule matches, return empty result
        if (!matchedRule) {
            return createEmptyResult("no_matching_rule")
        }

        // Get available channels for recipient
        const recipientChannels = getAvailableChannels(context)
        if (recipientChannels.length === 0) {
            return createEmptyResult("no_channels")
        }

        // Check if in quiet hours
        const inQuietHours = matchedRule.isInQuietHours(context.currentTime, context.timezone)

        // Apply routing strategy to get channel order
        let orderedChannels = this.applyStrategy(matchedRule.strategy, context, recipientChannels)

        // Filter by rule's allowed/excluded channels
        orderedChannels = orderedChannels.filter((ch) => matchedRule.isChannelAllowed(ch))

        // Apply quiet hours filter
        const filteredChannels: Channel[] = []
        if (inQuietHours) {
            const quietChannels = this.config.quietHoursChannels ?? [Channel.PUSH]
            const originalChannels = [...orderedChannels]
            orderedChannels = orderedChannels.filter((ch) => quietChannels.includes(ch))
            // Track filtered channels
            for (const ch of originalChannels) {
                if (!orderedChannels.includes(ch)) {
                    filteredChannels.push(ch)
                }
            }
        }

        // Build routes from channels and available providers
        const routes = this.buildRoutes(orderedChannels, context.availableProviders)

        // Check if we have any routes
        if (routes.length === 0) {
            if (context.availableProviders.length === 0) {
                return createEmptyResult("no_providers")
            }
            if (inQuietHours && filteredChannels.length > 0) {
                return createEmptyResult("quiet_hours")
            }
            return createEmptyResult("no_channels")
        }

        return createRoutingResult({
            routes,
            appliedRuleId: matchedRule.id,
            appliedRuleName: matchedRule.name,
            maxAttempts: matchedRule.maxAttempts,
            quietHoursApplied: inQuietHours,
            filteredChannels,
            retryPolicy: matchedRule.toPersistence().retryPolicy,
        })
    }

    /**
     * Get channels sorted by cost (cheapest first).
     */
    getChannelsByCost(): Channel[] {
        return Object.entries(ChannelCostPriority)
            .sort(([, a], [, b]) => a - b)
            .map(([channel]) => channel as Channel)
    }

    /**
     * Get channels sorted by reliability (SMS first).
     */
    getChannelsByReliability(): Channel[] {
        return [Channel.SMS, Channel.TELEGRAM, Channel.EMAIL, Channel.PUSH, Channel.WHATSAPP]
    }

    /**
     * Merge merchant rules with default rules.
     * Merchant rules take precedence (come first in evaluation).
     */
    private mergeRules(merchantRules?: RoutingRule[]): RoutingRule[] {
        const defaultRules = this.config.defaultRules ?? []
        if (!merchantRules || merchantRules.length === 0) {
            return defaultRules
        }
        return [...merchantRules, ...defaultRules]
    }

    /**
     * Apply a routing strategy to get ordered channels.
     */
    private applyStrategy(
        strategy: RoutingStrategy,
        context: RoutingContext,
        availableChannels: Channel[],
    ): Channel[] {
        switch (strategy.type) {
            case "cost_optimized":
                return this.applyCostOptimized(availableChannels)

            case "reliability_first":
                return this.applyReliabilityFirst(availableChannels)

            case "recipient_preference":
                return this.applyRecipientPreference(context, availableChannels)

            case "channel_preference":
                return this.applyChannelPreference(strategy.channels, availableChannels)

            default:
                return availableChannels
        }
    }

    /**
     * Sort channels by cost (cheapest first).
     */
    private applyCostOptimized(channels: Channel[]): Channel[] {
        return [...channels].sort((a, b) => ChannelCostPriority[a] - ChannelCostPriority[b])
    }

    /**
     * Sort channels by reliability (SMS first, then others).
     */
    private applyReliabilityFirst(channels: Channel[]): Channel[] {
        const reliability = this.getChannelsByReliability()
        return [...channels].sort((a, b) => reliability.indexOf(a) - reliability.indexOf(b))
    }

    /**
     * Put recipient's preferred channel first, then sort by cost.
     */
    private applyRecipientPreference(context: RoutingContext, channels: Channel[]): Channel[] {
        const preferred = context.recipient.preferences?.preferredChannel
        if (!preferred || !channels.includes(preferred)) {
            return this.applyCostOptimized(channels)
        }

        const rest = channels.filter((ch) => ch !== preferred)
        const sortedRest = this.applyCostOptimized(rest)
        return [preferred, ...sortedRest]
    }

    /**
     * Use explicit channel order, filtering to available channels.
     */
    private applyChannelPreference(
        preferredOrder: Channel[],
        availableChannels: Channel[],
    ): Channel[] {
        // Start with preferred channels that are available
        const result: Channel[] = []
        for (const channel of preferredOrder) {
            if (availableChannels.includes(channel)) {
                result.push(channel)
            }
        }

        // Add any remaining available channels (sorted by cost)
        const remaining = availableChannels.filter((ch) => !result.includes(ch))
        const sortedRemaining = this.applyCostOptimized(remaining)
        result.push(...sortedRemaining)

        return result
    }

    /**
     * Build routes from channels and available providers.
     */
    private buildRoutes(channels: Channel[], availableProviders: Provider[]): ProviderRoute[] {
        const routes: ProviderRoute[] = []
        let priority = 0

        for (const channel of channels) {
            // Find a provider for this channel
            const provider = this.findProviderForChannel(channel, availableProviders)
            if (provider) {
                routes.push({ channel, provider, priority })
                priority++
            }
        }

        return routes
    }

    /**
     * Find a provider for a given channel from available providers.
     */
    private findProviderForChannel(
        channel: Channel,
        availableProviders: Provider[],
    ): Provider | undefined {
        for (const provider of availableProviders) {
            const providerChannel = getChannelForProvider(provider)
            if (providerChannel === channel) {
                return provider
            }
        }
        return undefined
    }
}
