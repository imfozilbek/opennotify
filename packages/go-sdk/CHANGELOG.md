# opennotify Go SDK Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] - 2025-12-21

### Added
- **Client**
  - `New()` constructor with API key and optional configuration
  - `Options` struct for custom base URL and timeout
- **Notifications**
  - `Send()` method for sending notifications
  - `GetNotification()` method for retrieving notification details
  - `GetStatus()` method for checking delivery status
  - `ListNotifications()` method with pagination support
- **Types**
  - `Channel` enum: SMS, Telegram, Email, Push, WhatsApp
  - `Provider` enum: Eskiz, PlayMobile, GetSMS, TelegramBot, SMTP, SendGrid, Mailgun, FCM, APNs, WhatsAppBusiness
  - `NotificationStatus` enum: Pending, Sent, Delivered, Failed
  - `SendOptions` for notification parameters
  - `SendResult` with notification ID
  - `Notification` with full notification details
  - `StatusResponse` for status checks
  - `NotificationList` for paginated results
  - `ListOptions` for pagination parameters
- **Error Handling**
  - `APIError` type with status code and message
  - Helper methods: `IsNotFound()`, `IsUnauthorized()`, `IsForbidden()`, `IsRateLimited()`, `IsServerError()`
  - `IsAPIError()` function for error type checking
  - Validation errors for required fields
- **Context Support**
  - All methods accept `context.Context` for cancellation and timeouts

---

*Last updated: December 2025*
