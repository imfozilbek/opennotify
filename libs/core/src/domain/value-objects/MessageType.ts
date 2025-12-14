import { Channel } from "./Channel"

/**
 * Message types for routing decisions.
 *
 * Different message types have different routing priorities:
 * - OTP: Reliability first (Telegram → SMS fallback)
 * - TRANSACTIONAL: Balanced (user's preferred channel)
 * - MARKETING: Cost optimized (cheapest channels first)
 * - ALERT: Immediate delivery (Push → Telegram → SMS)
 *
 * @example
 * ```typescript
 * const type = MessageType.OTP
 * const defaults = getMessageTypeDefaults(type)
 * console.log(defaults.channels) // [TELEGRAM, SMS]
 * ```
 */
export const MessageType = {
    /** One-time password / verification codes */
    OTP: "OTP",

    /** Order confirmations, receipts, status updates */
    TRANSACTIONAL: "TRANSACTIONAL",

    /** Promotional content, newsletters */
    MARKETING: "MARKETING",

    /** Urgent notifications, security alerts */
    ALERT: "ALERT",
} as const

export type MessageType = (typeof MessageType)[keyof typeof MessageType]

/**
 * Get all available message types.
 */
export function getMessageTypes(): MessageType[] {
    return Object.values(MessageType)
}

/**
 * Check if a value is a valid MessageType.
 */
export function isMessageType(value: unknown): value is MessageType {
    return typeof value === "string" && Object.values(MessageType).includes(value as MessageType)
}

/**
 * Message type display names for UI.
 */
export const MessageTypeDisplayName: Record<MessageType, string> = {
    [MessageType.OTP]: "OTP / Verification",
    [MessageType.TRANSACTIONAL]: "Transactional",
    [MessageType.MARKETING]: "Marketing",
    [MessageType.ALERT]: "Alert",
}

/**
 * Routing priority for message types.
 */
export type RoutingPriority = "reliability" | "cost" | "speed"

/**
 * Default routing configuration per message type.
 */
export interface MessageTypeDefaults {
    /** Preferred channels in order of priority */
    channels: Channel[]

    /** Routing priority strategy */
    priority: RoutingPriority

    /** Maximum fallback attempts */
    maxAttempts: number

    /** Description for UI */
    description: string
}

/**
 * Default routing settings per message type.
 */
export const MESSAGE_TYPE_DEFAULTS: Record<MessageType, MessageTypeDefaults> = {
    [MessageType.OTP]: {
        channels: [Channel.TELEGRAM, Channel.SMS],
        priority: "reliability",
        maxAttempts: 2,
        description: "Try Telegram first (free), fallback to SMS (guaranteed)",
    },
    [MessageType.TRANSACTIONAL]: {
        channels: [Channel.TELEGRAM, Channel.EMAIL, Channel.SMS],
        priority: "reliability",
        maxAttempts: 2,
        description: "Balanced approach with multiple fallbacks",
    },
    [MessageType.MARKETING]: {
        channels: [Channel.EMAIL, Channel.PUSH, Channel.TELEGRAM],
        priority: "cost",
        maxAttempts: 1,
        description: "Cost optimized, no SMS (expensive for bulk)",
    },
    [MessageType.ALERT]: {
        channels: [Channel.PUSH, Channel.TELEGRAM, Channel.SMS],
        priority: "speed",
        maxAttempts: 3,
        description: "Immediate delivery through fastest channels",
    },
}

/**
 * Get default routing settings for a message type.
 */
export function getMessageTypeDefaults(type: MessageType): MessageTypeDefaults {
    return MESSAGE_TYPE_DEFAULTS[type]
}
