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
 * // Send notification
 * await client.send({
 *     channel: "sms",
 *     provider: "eskiz",
 *     recipient: "+998901234567",
 *     message: "Hello!",
 * })
 *
 * // Send OTP
 * const { otpId } = await client.otp.send({ phone: "+998901234567" })
 * const { verified } = await client.otp.verify({ phone: "+998901234567", code: "123456" })
 *
 * // Templates
 * const template = await client.templates.create({
 *     name: "Welcome",
 *     channel: "sms",
 *     body: "Hello {{name}}!",
 * })
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { OpenNotify } from "./client.js"

// Sub-clients
export { OtpClient } from "./otp.js"
export { TemplatesClient } from "./templates.js"

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
    // OTP
    SendOtpOptions,
    SendOtpResult,
    VerifyOtpOptions,
    VerifyOtpResult,
    // Templates
    CreateTemplateOptions,
    ListTemplatesOptions,
    RenderResult,
    RenderTemplateOptions,
    Template,
    TemplateList,
    TemplateVariable,
    UpdateTemplateOptions,
} from "./types/index.js"
