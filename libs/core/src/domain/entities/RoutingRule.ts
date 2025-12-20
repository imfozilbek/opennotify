import { Channel } from "../value-objects/Channel"
import { MessageType } from "../value-objects/MessageType"
import { RetryPolicy, RetryPolicyProps } from "../value-objects/RetryPolicy"
import { RoutingContext } from "../value-objects/RoutingContext"

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
export interface CreateRoutingRuleProps {
    /** Unique rule identifier */
    id: string

    /** Merchant ID (null for system defaults) */
    merchantId: string | null

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
 * Properties for persisting/reconstructing a RoutingRule.
 */
export interface RoutingRuleProps extends CreateRoutingRuleProps {
    createdAt: Date
    updatedAt: Date
}

/**
 * Properties for updating a RoutingRule.
 */
export interface UpdateRoutingRuleProps {
    name?: string
    priority?: number
    conditions?: RoutingConditions
    strategy?: RoutingStrategy
    maxAttempts?: number
    enabled?: boolean
    retryPolicy?: RetryPolicyProps
}

/**
 * Routing rule entity.
 *
 * Defines when and how to route notifications based on
 * message type, time, and other conditions.
 *
 * @example
 * ```typescript
 * const otpRule = RoutingRule.create({
 *     id: "rule_123",
 *     merchantId: "merchant_456",
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
    private readonly _id: string
    private readonly _merchantId: string | null
    private readonly _createdAt: Date

    private _name: string
    private _priority: number
    private _conditions: RoutingConditions
    private _strategy: RoutingStrategy
    private _maxAttempts: number
    private _enabled: boolean
    private _retryPolicy?: RetryPolicyProps
    private _updatedAt: Date

    private constructor(props: RoutingRuleProps) {
        this._id = props.id
        this._merchantId = props.merchantId
        this._name = props.name
        this._priority = props.priority
        this._conditions = { ...props.conditions }
        this._strategy = props.strategy
        this._maxAttempts = props.maxAttempts
        this._enabled = props.enabled
        this._retryPolicy = props.retryPolicy
        this._createdAt = props.createdAt
        this._updatedAt = props.updatedAt
    }

    /**
     * Create a new routing rule.
     */
    static create(props: CreateRoutingRuleProps): RoutingRule {
        const now = new Date()
        return new RoutingRule({
            ...props,
            createdAt: now,
            updatedAt: now,
        })
    }

    /**
     * Reconstruct a routing rule from persistence.
     */
    static fromPersistence(props: RoutingRuleProps): RoutingRule {
        return new RoutingRule(props)
    }

    /**
     * Create a default cost-optimized rule (system default, lowest priority).
     */
    static createDefault(): RoutingRule {
        return RoutingRule.create({
            id: "default_cost_optimized",
            merchantId: null,
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
        return this._id
    }

    get merchantId(): string | null {
        return this._merchantId
    }

    get name(): string {
        return this._name
    }

    get priority(): number {
        return this._priority
    }

    get conditions(): RoutingConditions {
        return { ...this._conditions }
    }

    get strategy(): RoutingStrategy {
        return this._strategy
    }

    get maxAttempts(): number {
        return this._maxAttempts
    }

    get enabled(): boolean {
        return this._enabled
    }

    get retryPolicy(): RetryPolicy {
        return this._retryPolicy ? RetryPolicy.create(this._retryPolicy) : RetryPolicy.default()
    }

    get createdAt(): Date {
        return this._createdAt
    }

    get updatedAt(): Date {
        return this._updatedAt
    }

    /**
     * Check if this is a system default rule.
     */
    get isSystemDefault(): boolean {
        return this._merchantId === null
    }

    /**
     * Update the routing rule properties.
     */
    update(props: UpdateRoutingRuleProps): void {
        if (props.name !== undefined) {
            this._name = props.name
        }
        if (props.priority !== undefined) {
            this._priority = props.priority
        }
        if (props.conditions !== undefined) {
            this._conditions = { ...props.conditions }
        }
        if (props.strategy !== undefined) {
            this._strategy = props.strategy
        }
        if (props.maxAttempts !== undefined) {
            this._maxAttempts = props.maxAttempts
        }
        if (props.enabled !== undefined) {
            this._enabled = props.enabled
        }
        if (props.retryPolicy !== undefined) {
            this._retryPolicy = props.retryPolicy
        }
        this._updatedAt = new Date()
    }

    /**
     * Enable the routing rule.
     */
    enable(): void {
        this._enabled = true
        this._updatedAt = new Date()
    }

    /**
     * Disable the routing rule.
     */
    disable(): void {
        this._enabled = false
        this._updatedAt = new Date()
    }

    /**
     * Check if this rule matches the given routing context.
     */
    matches(context: RoutingContext): boolean {
        if (!this._enabled) {
            return false
        }

        const { conditions } = this

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
        if (!this._conditions.quietHours) {
            return false
        }

        return this.isInTimeWindow(currentTime, this._conditions.quietHours, timezone)
    }

    /**
     * Check if a channel is allowed by this rule.
     */
    isChannelAllowed(channel: Channel): boolean {
        const { allowedChannels, excludedChannels } = this._conditions

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
        return {
            id: this._id,
            merchantId: this._merchantId,
            name: this._name,
            priority: this._priority,
            conditions: { ...this._conditions },
            strategy: this._strategy,
            maxAttempts: this._maxAttempts,
            enabled: this._enabled,
            retryPolicy: this._retryPolicy,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        }
    }
}

/**
 * Default routing rules for the platform.
 */
export const DEFAULT_ROUTING_RULES: RoutingRule[] = [
    // OTP: Try Telegram first (free), fallback to SMS (reliable)
    RoutingRule.create({
        id: "otp_priority",
        merchantId: null,
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
        merchantId: null,
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
        merchantId: null,
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
        merchantId: null,
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
