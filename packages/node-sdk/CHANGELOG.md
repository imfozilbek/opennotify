# @opennotify/node-sdk Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.2.0] - 2025-12-20

### Added
- **OTP Support**
  - `client.otp.send(options)` - Send OTP to phone number
    - Configurable code length (4-8 digits)
    - Configurable expiration (60-600 seconds)
    - Custom message template support
  - `client.otp.verify(options)` - Verify OTP code
  - `OtpClient` class exported for advanced usage

- **Templates Support**
  - `client.templates.create(options)` - Create new template
  - `client.templates.list(options)` - List templates with filters
  - `client.templates.get(id)` - Get template by ID
  - `client.templates.update(id, options)` - Update template
  - `client.templates.delete(id)` - Delete template
  - `client.templates.publish(id)` - Publish template (DRAFT → ACTIVE)
  - `client.templates.unpublish(id)` - Unpublish template (ACTIVE → DRAFT)
  - `client.templates.archive(id)` - Archive template
  - `client.templates.render(options)` - Render template with variables
  - `TemplatesClient` class exported for advanced usage

- **New Types**
  - OTP: `SendOtpOptions`, `SendOtpResult`, `VerifyOtpOptions`, `VerifyOtpResult`
  - Templates: `Template`, `TemplateVariable`, `CreateTemplateOptions`, `UpdateTemplateOptions`, `ListTemplatesOptions`, `TemplateList`, `RenderTemplateOptions`, `RenderResult`

---

## [0.1.0] - 2025-12-14

### Added
- **OpenNotify Client**
  - `new OpenNotify({ apiKey, baseUrl?, timeout? })` - Create client instance
  - `send(options)` - Send notification to any channel
  - `getNotification(id)` - Get notification details
  - `getStatus(id)` - Get delivery status
  - `listNotifications(options?)` - List notifications with pagination

- **Channels Support**
  - SMS: Eskiz, PlayMobile, GetSMS
  - Telegram: Telegram Bot
  - Email: SMTP, SendGrid, Mailgun
  - Push: FCM, APNs
  - WhatsApp: WhatsApp Business

- **Error Handling**
  - `OpenNotifyError` class with error codes
  - Error codes: `AUTHENTICATION_ERROR`, `VALIDATION_ERROR`, `NOT_FOUND`, `RATE_LIMIT`, `NETWORK_ERROR`, `TIMEOUT_ERROR`, `SERVER_ERROR`
  - `isRetryable()` method for retry logic

- **TypeScript Support**
  - Full TypeScript definitions
  - Exported types: `Channel`, `Provider`, `NotificationStatus`, `Notification`, `SendNotificationOptions`, etc.

---

*Last updated: December 2025*
