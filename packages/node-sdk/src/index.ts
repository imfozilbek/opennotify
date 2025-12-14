/**
 * OpenNotify Node.js SDK
 *
 * Unified notification API for SMS, Telegram, Email, Push, and WhatsApp.
 *
 * @example
 * ```typescript
 * import { OpenNotify } from "@opennotify/node-sdk"
 *
 * const client = new OpenNotify({ apiKey: "your-api-key" })
 *
 * await client.send({
 *     channel: "sms",
 *     provider: "eskiz",
 *     recipient: "+998901234567",
 *     message: "Hello!",
 * })
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { OpenNotify } from "./client.js"

// Errors
export { OpenNotifyError } from "./errors.js"
export type { OpenNotifyErrorCode } from "./errors.js"

// Types
export type {
    // Common
    Channel,
    NotificationStatus,
    Provider,
    TemplateStatus,
    // Options
    OpenNotifyOptions,
    PaginationOptions,
    // Notifications
    Notification,
    NotificationList,
    NotificationStatusResponse,
    SendNotificationOptions,
    SendNotificationResult,
} from "./types/index.js"
