# @opennotify/core Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Value Objects**
  - `Channel` enum (SMS, TELEGRAM, EMAIL, PUSH, WHATSAPP)
  - `Provider` enum (ESKIZ, PLAYMOBILE, GETSMS, TELEGRAM_BOT, etc.)
  - `NotificationStatus` enum with status transitions (PENDING, SENT, DELIVERED, FAILED)
- **Entities**
  - `Notification` entity with full lifecycle management
- **Ports**
  - `NotificationProviderPort` interface for provider adapters
  - `NotificationRepositoryPort` interface for persistence
- **Adapters**
  - `EskizAdapter` implementation for Eskiz SMS provider
- **Use Cases**
  - `SendNotificationUseCase` for sending notifications
  - `GetNotificationStatusUseCase` for checking delivery status

---

*Last updated: December 2025*
