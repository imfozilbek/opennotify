import { Channel } from "./Channel"
import { MessageType } from "./MessageType"
import { RetryPolicy, RetryPolicyProps } from "./RetryPolicy"
import { RoutingContext } from "./RoutingContext"

/**
 * Time window definition (e.g., for quiet hours).
 *
 * Times are in HH:mm format (24-hour).
 * Handles overnight ranges (e.g., 22:00 - 08:00).
 */
export interface TimeWindow {
    /** Start time in HH:mm format */
    start: string

    /** End time in HH:mm format */
    end: string

    /** IANA timezone (e.g., "Asia/Tashkent") */
    timezone: string
}

/**
 * Conditions that determine when a routing rule applies.
 */
export interface RoutingConditions {
    /** Only apply to these message types */
    messageTypes?: MessageType[]

    /** Only route to these channels (whitelist) */
    allowedChannels?: Channel[]

    /** Never route to these channels (blacklist) */
    excludedChannels?: Channel[]

    /** Time window when this rule is active */
    activeTimeWindow?: TimeWindow

    /** Quiet hours - suppress non-urgent during this time */
    quietHours?: TimeWindow
}

/**
 * Routing strategy types.
 */
export type RoutingStrategy =
    | { type: "cost_optimized" }
    | { type: "reliability_first" }
    | { type: "recipient_preference" }
    | { type: "channel_preference"; channels: Channel[] }

/**
 * Properties for creating a RoutingRule.
 */
export interface RoutingRuleProps {
    /** Unique rule identifier */
    id: string

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

    /** Retry policy for this rule (optional, uses default if not specified) */
    retryPolicy?: RetryPolicyProps
}

/**
 * Routing rule value object.
 *
 * Defines when and how to route notifications based on
 * message type, time, and other conditions.
 *
 * @example
 * ```typescript
 * const otpRule = RoutingRule.create({
 *     id: "otp_priority",
 *     name: "OTP Priority",
 *     priority: 1,
 *     conditions: { messageTypes: [MessageType.OTP] },
 *     strategy: {
 *         type: "channel_preference",
 *         channels: [Channel.TELEGRAM, Channel.SMS]
 *     },
 *     maxAttempts: 2,
 *     enabled: true,
 * })
 *
 * if (otpRule.matches(context)) {
 *     // Apply this rule
 * }
 * ```
 */
export class RoutingRule {
    private readonly _props: RoutingRuleProps

    private constructor(props: RoutingRuleProps) {
        this._props = { ...props }
    }

    /**
     * Create a new routing rule.
     */
    static create(props: RoutingRuleProps): RoutingRule {
        return new RoutingRule(props)
    }

    /**
     * Create a default cost-optimized rule (lowest priority, matches everything).
     */
    static createDefault(): RoutingRule {
        return new RoutingRule({
            id: "default_cost_optimized",
            name: "Default Cost Optimized",
            priority: 1000,
            conditions: {},
            strategy: { type: "cost_optimized" },
            maxAttempts: 2,
            enabled: true,
        })
    }

    // Getters
    get id(): string {
        return this._props.id
    }

    get name(): string {
        return this._props.name
    }

    get priority(): number {
        return this._props.priority
    }

    get conditions(): RoutingConditions {
        return { ...this._props.conditions }
    }

    get strategy(): RoutingStrategy {
        return this._props.strategy
    }

    get maxAttempts(): number {
        return this._props.maxAttempts
    }

    get enabled(): boolean {
        return this._props.enabled
    }

    get retryPolicy(): RetryPolicy {
        return this._props.retryPolicy
            ? RetryPolicy.create(this._props.retryPolicy)
            : RetryPolicy.default()
    }

    /**
     * Check if this rule matches the given routing context.
     */
    matches(context: RoutingContext): boolean {
        if (!this._props.enabled) {
            return false
        }

        const { conditions } = this._props

        // Check message type condition
        if (conditions.messageTypes && conditions.messageTypes.length > 0) {
            if (!context.messageType) {
                return false
            }
            if (!conditions.messageTypes.includes(context.messageType)) {
                return false
            }
        }

        // Check active time window
        if (conditions.activeTimeWindow) {
            if (!this.isInTimeWindow(context.currentTime, conditions.activeTimeWindow)) {
                return false
            }
        }

        return true
    }

    /**
     * Check if current time is within quiet hours.
     */
    isInQuietHours(currentTime: Date, timezone?: string): boolean {
        if (!this._props.conditions.quietHours) {
            return false
        }

        return this.isInTimeWindow(currentTime, this._props.conditions.quietHours, timezone)
    }

    /**
     * Check if a channel is allowed by this rule.
     */
    isChannelAllowed(channel: Channel): boolean {
        const { allowedChannels, excludedChannels } = this._props.conditions

        // Check blacklist first
        if (excludedChannels?.includes(channel)) {
            return false
        }

        // Check whitelist
        if (allowedChannels && allowedChannels.length > 0) {
            return allowedChannels.includes(channel)
        }

        return true
    }

    /**
     * Check if a time is within a time window.
     */
    private isInTimeWindow(time: Date, window: TimeWindow, overrideTimezone?: string): boolean {
        const timezone = overrideTimezone ?? window.timezone

        // Get current time in the specified timezone
        const timeStr = time.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            timeZone: timezone,
        })

        const currentMinutes = this.timeToMinutes(timeStr)
        const startMinutes = this.timeToMinutes(window.start)
        const endMinutes = this.timeToMinutes(window.end)

        // Handle overnight ranges (e.g., 22:00 - 08:00)
        if (startMinutes > endMinutes) {
            // Overnight: either after start OR before end
            return currentMinutes >= startMinutes || currentMinutes < endMinutes
        }
        // Same day: between start and end
        return currentMinutes >= startMinutes && currentMinutes < endMinutes
    }

    /**
     * Convert HH:mm time string to minutes since midnight.
     */
    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(":").map(Number)
        return hours * 60 + minutes
    }

    /**
     * Convert to plain object for persistence.
     */
    toPersistence(): RoutingRuleProps {
        return { ...this._props }
    }
}

/**
 * Default routing rules for the platform.
 */
export const DEFAULT_ROUTING_RULES: RoutingRule[] = [
    // OTP: Try Telegram first (free), fallback to SMS (reliable)
    RoutingRule.create({
        id: "otp_priority",
        name: "OTP Priority",
        priority: 1,
        conditions: { messageTypes: [MessageType.OTP] },
        strategy: {
            type: "channel_preference",
            channels: [Channel.TELEGRAM, Channel.SMS],
        },
        maxAttempts: 2,
        enabled: true,
    }),

    // Alerts: Fast delivery through Push and Telegram
    RoutingRule.create({
        id: "alert_speed",
        name: "Alert Speed",
        priority: 2,
        conditions: { messageTypes: [MessageType.ALERT] },
        strategy: {
            type: "channel_preference",
            channels: [Channel.PUSH, Channel.TELEGRAM, Channel.SMS],
        },
        maxAttempts: 3,
        enabled: true,
    }),

    // Marketing: Cost optimized, no SMS (too expensive for bulk)
    RoutingRule.create({
        id: "marketing_cost",
        name: "Marketing Cost Optimized",
        priority: 3,
        conditions: {
            messageTypes: [MessageType.MARKETING],
            excludedChannels: [Channel.SMS],
        },
        strategy: { type: "cost_optimized" },
        maxAttempts: 1,
        enabled: true,
    }),

    // Transactional: Prefer recipient's choice, then cost optimized
    RoutingRule.create({
        id: "transactional_preference",
        name: "Transactional Preference",
        priority: 4,
        conditions: { messageTypes: [MessageType.TRANSACTIONAL] },
        strategy: { type: "recipient_preference" },
        maxAttempts: 2,
        enabled: true,
    }),

    // Default: Cost optimized for everything else
    RoutingRule.createDefault(),
]
