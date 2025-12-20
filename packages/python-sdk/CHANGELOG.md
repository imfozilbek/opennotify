# opennotify Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] - 2025-12-21

### Added
- **OpenNotify Client**
  - `OpenNotify` class for synchronous API calls
  - `AsyncOpenNotify` class for async/await support
  - Context manager support (`with` / `async with`)

- **Notification Methods**
  - `send(options)` - Send notification to any channel
  - `get_notification(id)` - Get notification details
  - `get_status(id)` - Get delivery status
  - `list_notifications(page, limit)` - List with pagination

- **Channel Support**
  - SMS: Eskiz, PlayMobile, GetSMS
  - Telegram: Telegram Bot
  - Email: SMTP, SendGrid, Mailgun
  - Push: FCM, APNs
  - WhatsApp: WhatsApp Business

- **Error Handling**
  - `OpenNotifyError` exception class
  - Error codes: `AUTHENTICATION_ERROR`, `VALIDATION_ERROR`, `NOT_FOUND`, `RATE_LIMIT`, `NETWORK_ERROR`, `TIMEOUT_ERROR`, `SERVER_ERROR`
  - `is_retryable()` method for retry logic

- **Type Hints**
  - Full type hints for Python 3.9+
  - `TypedDict` for all options and responses
  - `Literal` types for channels, providers, statuses

- **HTTP Client**
  - Built on `httpx` for sync and async support
  - Automatic timeout handling
  - Connection error handling

---

*Last updated: December 2025*
