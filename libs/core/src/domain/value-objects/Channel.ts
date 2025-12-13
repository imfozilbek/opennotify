/**
 * Notification delivery channels supported by OpenNotify.
 *
 * @example
 * ```typescript
 * const channel = Channel.SMS
 * console.log(Channel.values()) // [SMS, TELEGRAM, EMAIL, PUSH, WHATSAPP]
 * ```
 */
export const Channel = {
    SMS: "SMS",
    TELEGRAM: "TELEGRAM",
    EMAIL: "EMAIL",
    PUSH: "PUSH",
    WHATSAPP: "WHATSAPP",
} as const

export type Channel = (typeof Channel)[keyof typeof Channel]

/**
 * Get all available channels.
 */
export function getChannels(): Channel[] {
    return Object.values(Channel)
}

/**
 * Check if a value is a valid Channel.
 */
export function isChannel(value: unknown): value is Channel {
    return typeof value === "string" && Object.values(Channel).includes(value as Channel)
}

/**
 * Channel display names for UI.
 */
export const ChannelDisplayName: Record<Channel, string> = {
    [Channel.SMS]: "SMS",
    [Channel.TELEGRAM]: "Telegram",
    [Channel.EMAIL]: "Email",
    [Channel.PUSH]: "Push Notification",
    [Channel.WHATSAPP]: "WhatsApp",
}

/**
 * Channel priorities for smart routing (lower = higher priority).
 * Telegram is cheapest, SMS is most reliable.
 */
export const ChannelCostPriority: Record<Channel, number> = {
    [Channel.TELEGRAM]: 1,
    [Channel.EMAIL]: 2,
    [Channel.PUSH]: 3,
    [Channel.WHATSAPP]: 4,
    [Channel.SMS]: 5,
}
