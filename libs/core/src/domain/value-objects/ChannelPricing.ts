import { Channel } from "./Channel"
import { Provider } from "./Provider"

/**
 * Default prices per message in UZS (Uzbek Sum).
 *
 * Prices are approximate and based on typical provider rates.
 * Used for cost analytics and savings calculations.
 */
export const DefaultProviderPricing: Record<Provider, number> = {
    // Free channels
    [Provider.TELEGRAM_BOT]: 0,
    [Provider.FCM]: 0,
    [Provider.APNS]: 0,
    [Provider.SMTP]: 0,

    // Paid email providers
    [Provider.SENDGRID]: 30,
    [Provider.MAILGUN]: 30,

    // WhatsApp
    [Provider.WHATSAPP_BUSINESS]: 300,

    // SMS providers (Uzbekistan)
    [Provider.ESKIZ]: 150,
    [Provider.PLAYMOBILE]: 150,
    [Provider.GETSMS]: 150,
}

/**
 * Default channel pricing (using cheapest provider per channel).
 */
export const DefaultChannelPricing: Record<Channel, number> = {
    [Channel.TELEGRAM]: 0,
    [Channel.EMAIL]: 0, // SMTP is free
    [Channel.PUSH]: 0,
    [Channel.WHATSAPP]: 300,
    [Channel.SMS]: 150,
}

/**
 * Reference SMS price for savings calculation.
 *
 * This is used to calculate "what you would have paid if all were SMS".
 * Based on average Uzbekistan SMS provider rates.
 */
export const ReferenceSmsPrice = 150

/**
 * Default currency for cost calculations.
 */
export const DefaultCurrency = "UZS"

/**
 * Get price for a specific provider.
 *
 * @param provider - The provider to get price for
 * @returns Price per message in UZS
 *
 * @example
 * ```typescript
 * getProviderPrice(Provider.ESKIZ)      // 150
 * getProviderPrice(Provider.TELEGRAM_BOT) // 0
 * ```
 */
export function getProviderPrice(provider: Provider): number {
    return DefaultProviderPricing[provider]
}

/**
 * Get price for a specific channel (using default/cheapest provider).
 *
 * @param channel - The channel to get price for
 * @returns Price per message in UZS
 *
 * @example
 * ```typescript
 * getChannelPrice(Channel.SMS)      // 150
 * getChannelPrice(Channel.TELEGRAM) // 0
 * ```
 */
export function getChannelPrice(channel: Channel): number {
    return DefaultChannelPricing[channel]
}

/**
 * Check if a channel is free (zero cost).
 *
 * @param channel - The channel to check
 * @returns true if the channel has zero cost
 *
 * @example
 * ```typescript
 * isFreeChannel(Channel.TELEGRAM) // true
 * isFreeChannel(Channel.SMS)      // false
 * ```
 */
export function isFreeChannel(channel: Channel): boolean {
    return DefaultChannelPricing[channel] === 0
}

/**
 * Check if a provider is free (zero cost).
 *
 * @param provider - The provider to check
 * @returns true if the provider has zero cost
 *
 * @example
 * ```typescript
 * isFreeProvider(Provider.TELEGRAM_BOT) // true
 * isFreeProvider(Provider.ESKIZ)        // false
 * ```
 */
export function isFreeProvider(provider: Provider): boolean {
    return DefaultProviderPricing[provider] === 0
}
