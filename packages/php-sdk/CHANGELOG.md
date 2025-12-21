# opennotify-php Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] - 2025-12-21

### Added
- **OpenNotify Client**
  - `OpenNotify` class for API communication
  - Constructor with apiKey, baseUrl, timeout options

- **Notification Methods**
  - `send(array $options)` - Send notification to any channel
  - `getNotification(string $id)` - Get notification details
  - `getStatus(string $id)` - Get delivery status
  - `listNotifications(int $page, int $limit)` - List with pagination

- **Channel Support**
  - SMS: Eskiz, PlayMobile, GetSMS
  - Telegram: Telegram Bot
  - Email: SMTP, SendGrid, Mailgun
  - Push: FCM, APNs
  - WhatsApp: WhatsApp Business

- **Error Handling**
  - `OpenNotifyException` class with error codes
  - `isRetryable()` method for retry logic
  - Factory methods: `fromResponse()`, `networkError()`, `timeoutError()`

- **PHP 8.1+ Enums**
  - `Channel` enum with recipient field helper
  - `Provider` enum with channel mapping
  - `NotificationStatus` enum with status helpers

- **HTTP Client**
  - Guzzle 7.x based HTTP client
  - Automatic timeout handling
  - Connection error handling

---

*Last updated: December 2025*
