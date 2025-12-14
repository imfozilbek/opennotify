import { Recipient } from "../entities/Recipient"
import { Channel } from "./Channel"
import { MessageType } from "./MessageType"
import { Provider } from "./Provider"

/**
 * Context for routing decisions.
 *
 * Contains all information needed to determine the best
 * channel and provider for a notification.
 *
 * @example
 * ```typescript
 * const context: RoutingContext = {
 *     merchantId: "merchant_123",
 *     messageType: MessageType.OTP,
 *     recipient,
 *     availableProviders: [Provider.ESKIZ, Provider.TELEGRAM_BOT],
 *     currentTime: new Date(),
 *     timezone: "Asia/Tashkent",
 * }
 * ```
 */
export interface RoutingContext {
    /** Merchant ID for provider lookup */
    merchantId: string

    /** Message type for routing strategy selection */
    messageType?: MessageType

    /** Recipient with contacts and preferences */
    recipient: Recipient

    /** Providers connected by the merchant */
    availableProviders: Provider[]

    /** Current timestamp for time-based rules */
    currentTime: Date

    /** Merchant's timezone for quiet hours calculation */
    timezone?: string
}

/**
 * Minimal recipient data for routing when full Recipient entity is not available.
 *
 * Used when creating notifications with inline recipient data
 * instead of a stored Recipient entity.
 */
export interface RecipientRoutingData {
    /** Phone number (E.164 format) */
    phone?: string

    /** Email address */
    email?: string

    /** Telegram chat ID */
    telegramChatId?: string

    /** Push device tokens */
    deviceTokens?: string[]

    /** Preferred channel */
    preferredChannel?: Channel

    /** Opted-out channels */
    optedOutChannels?: Channel[]

    /** Quiet hours settings */
    quietHours?: {
        start: string
        end: string
        timezone: string
    }
}

/**
 * Create a routing context from minimal data.
 *
 * Useful when you don't have a full Recipient entity but need
 * to perform routing.
 */
export function createRoutingContext(params: {
    merchantId: string
    messageType?: MessageType
    recipientData: RecipientRoutingData
    availableProviders: Provider[]
    currentTime?: Date
    timezone?: string
}): RoutingContext {
    // Create a temporary recipient for routing
    const recipient = Recipient.create({
        id: "temp_routing",
        merchantId: params.merchantId,
        contacts: {
            phone: params.recipientData.phone,
            email: params.recipientData.email,
            telegramChatId: params.recipientData.telegramChatId,
            deviceTokens: params.recipientData.deviceTokens,
        },
        preferences: {
            preferredChannel: params.recipientData.preferredChannel,
            optedOutChannels: params.recipientData.optedOutChannels,
            quietHours: params.recipientData.quietHours,
        },
    })

    return {
        merchantId: params.merchantId,
        messageType: params.messageType,
        recipient,
        availableProviders: params.availableProviders,
        currentTime: params.currentTime ?? new Date(),
        timezone: params.timezone,
    }
}

/**
 * Check if a channel is available for the recipient in the context.
 */
export function isChannelAvailable(context: RoutingContext, channel: Channel): boolean {
    // Check if recipient has contact info for this channel
    if (!context.recipient.hasChannel(channel)) {
        return false
    }

    // Check if recipient opted out
    if (context.recipient.isOptedOut(channel)) {
        return false
    }

    return true
}

/**
 * Get available channels for a routing context.
 */
export function getAvailableChannels(context: RoutingContext): Channel[] {
    return context.recipient.getAvailableChannels().filter((channel) => {
        return !context.recipient.isOptedOut(channel)
    })
}
