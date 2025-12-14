/**
 * Notification delivery channels.
 */
export type Channel = "sms" | "telegram" | "email" | "push" | "whatsapp"

/**
 * Notification providers.
 */
export type Provider =
    | "eskiz"
    | "playmobile"
    | "getsms"
    | "telegram_bot"
    | "smtp"
    | "sendgrid"
    | "mailgun"
    | "fcm"
    | "apns"
    | "whatsapp_business"

/**
 * Notification delivery status.
 */
export type NotificationStatus = "pending" | "sent" | "delivered" | "failed"

/**
 * Template status.
 */
export type TemplateStatus = "draft" | "active" | "archived"
