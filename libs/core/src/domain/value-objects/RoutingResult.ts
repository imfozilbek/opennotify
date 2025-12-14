import { Channel } from "./Channel"
import { Provider } from "./Provider"

/**
 * A single route in the fallback chain.
 *
 * Represents one attempt to deliver a notification
 * via a specific channel and provider.
 */
export interface ProviderRoute {
    /** Channel to use */
    channel: Channel

    /** Provider to use for this channel */
    provider: Provider

    /** Order in fallback chain (0 = first attempt) */
    priority: number
}

/**
 * Reason why routing failed or was limited.
 */
export type NoRouteReason =
    | "no_providers" // Merchant has no providers connected
    | "no_channels" // Recipient has no contact info
    | "all_opted_out" // Recipient opted out of all available channels
    | "quiet_hours" // Currently in quiet hours, no urgent channels available
    | "no_matching_rule" // No routing rule matched the context

/**
 * Result of routing engine evaluation.
 *
 * Contains an ordered list of routes to try (fallback chain)
 * and metadata about the routing decision.
 *
 * @example
 * ```typescript
 * const result = routingEngine.resolve(context)
 *
 * if (result.routes.length === 0) {
 *     console.log("Cannot route:", result.noRouteReason)
 * } else {
 *     for (const route of result.routes) {
 *         const success = await tryRoute(route)
 *         if (success) break
 *     }
 * }
 * ```
 */
export interface RoutingResult {
    /** Ordered list of routes to try (first = primary, rest = fallbacks) */
    routes: ProviderRoute[]

    /** ID of the routing rule that was applied */
    appliedRuleId?: string

    /** Name of the routing rule that was applied */
    appliedRuleName?: string

    /** Maximum attempts to make (may be less than routes.length) */
    maxAttempts: number

    /** Reason if no routes available */
    noRouteReason?: NoRouteReason

    /** Whether quiet hours affected the result */
    quietHoursApplied: boolean

    /** Channels that were filtered out due to opt-out */
    filteredChannels: Channel[]
}

/**
 * Create an empty routing result (no routes available).
 */
export function createEmptyResult(reason: NoRouteReason): RoutingResult {
    return {
        routes: [],
        maxAttempts: 0,
        noRouteReason: reason,
        quietHoursApplied: false,
        filteredChannels: [],
    }
}

/**
 * Create a routing result with routes.
 */
export function createRoutingResult(params: {
    routes: ProviderRoute[]
    appliedRuleId?: string
    appliedRuleName?: string
    maxAttempts?: number
    quietHoursApplied?: boolean
    filteredChannels?: Channel[]
}): RoutingResult {
    const maxAttempts = params.maxAttempts ?? params.routes.length

    return {
        routes: params.routes,
        appliedRuleId: params.appliedRuleId,
        appliedRuleName: params.appliedRuleName,
        maxAttempts: Math.min(maxAttempts, params.routes.length),
        quietHoursApplied: params.quietHoursApplied ?? false,
        filteredChannels: params.filteredChannels ?? [],
    }
}

/**
 * Check if the routing result has any routes.
 */
export function hasRoutes(result: RoutingResult): boolean {
    return result.routes.length > 0
}

/**
 * Get the primary route (first in chain).
 */
export function getPrimaryRoute(result: RoutingResult): ProviderRoute | undefined {
    return result.routes[0]
}

/**
 * Get fallback routes (all except primary).
 */
export function getFallbackRoutes(result: RoutingResult): ProviderRoute[] {
    return result.routes.slice(1)
}
