import { Channel } from "./Channel"

/**
 * Notification providers supported by OpenNotify.
 * Each provider is tied to a specific channel.
 */
export const Provider = {
    // SMS Providers (Uzbekistan)
    ESKIZ: "ESKIZ",
    PLAYMOBILE: "PLAYMOBILE",
    GETSMS: "GETSMS",

    // Telegram
    TELEGRAM_BOT: "TELEGRAM_BOT",

    // Email Providers
    SMTP: "SMTP",
    SENDGRID: "SENDGRID",
    MAILGUN: "MAILGUN",

    // Push Providers
    FCM: "FCM",
    APNS: "APNS",

    // WhatsApp
    WHATSAPP_BUSINESS: "WHATSAPP_BUSINESS",
} as const

export type Provider = (typeof Provider)[keyof typeof Provider]

/**
 * Get all available providers.
 */
export function getProviders(): Provider[] {
    return Object.values(Provider)
}

/**
 * Check if a value is a valid Provider.
 */
export function isProvider(value: unknown): value is Provider {
    return typeof value === "string" && Object.values(Provider).includes(value as Provider)
}

/**
 * Provider display names for UI.
 */
export const ProviderDisplayName: Record<Provider, string> = {
    [Provider.ESKIZ]: "Eskiz",
    [Provider.PLAYMOBILE]: "PlayMobile",
    [Provider.GETSMS]: "GetSMS",
    [Provider.TELEGRAM_BOT]: "Telegram Bot",
    [Provider.SMTP]: "SMTP",
    [Provider.SENDGRID]: "SendGrid",
    [Provider.MAILGUN]: "Mailgun",
    [Provider.FCM]: "Firebase Cloud Messaging",
    [Provider.APNS]: "Apple Push Notification",
    [Provider.WHATSAPP_BUSINESS]: "WhatsApp Business",
}

/**
 * Map providers to their respective channels.
 */
export const ProviderChannel: Record<Provider, Channel> = {
    [Provider.ESKIZ]: Channel.SMS,
    [Provider.PLAYMOBILE]: Channel.SMS,
    [Provider.GETSMS]: Channel.SMS,
    [Provider.TELEGRAM_BOT]: Channel.TELEGRAM,
    [Provider.SMTP]: Channel.EMAIL,
    [Provider.SENDGRID]: Channel.EMAIL,
    [Provider.MAILGUN]: Channel.EMAIL,
    [Provider.FCM]: Channel.PUSH,
    [Provider.APNS]: Channel.PUSH,
    [Provider.WHATSAPP_BUSINESS]: Channel.WHATSAPP,
}

/**
 * Get providers for a specific channel.
 */
export function getProvidersByChannel(channel: Channel): Provider[] {
    return Object.entries(ProviderChannel)
        .filter(([, ch]) => ch === channel)
        .map(([provider]) => provider as Provider)
}

/**
 * Get the channel for a provider.
 */
export function getChannelForProvider(provider: Provider): Channel {
    return ProviderChannel[provider]
}
