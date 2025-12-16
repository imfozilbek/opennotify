# @opennotify/api Changelog

All notable changes to this package will be documented in this file.

---

## [Unreleased]

---

## [0.6.0] - 2025-12-17

### Added
- **Webhooks Module**
  - `POST /webhooks/:provider` - Receive webhooks from notification providers
    - Supports: eskiz, playmobile, getsms, telegram, sendgrid, mailgun, fcm, apns, whatsapp
    - No authentication required (providers cannot authenticate)
    - Automatic signature verification where supported (Mailgun HMAC-SHA256)
    - Updates notification status based on webhook data (DELIVERED, FAILED)
    - Logs all incoming webhooks for auditing
- **Logs Module**
  - `GET /logs/webhooks` - View webhook logs with filtering
    - Filter by provider (ESKIZ, PLAYMOBILE, etc.)
    - Filter by status (SUCCESS, INVALID_SIGNATURE, INVALID_PAYLOAD, etc.)
    - Filter by date range (startDate, endDate)
    - Pagination support (page, limit)
    - Requires API key with READ permission
- **Core Domain**
  - `WebhookStatus` value object with statuses: SUCCESS, INVALID_SIGNATURE, INVALID_PAYLOAD, NOTIFICATION_NOT_FOUND, PROCESSING_ERROR
  - `WebhookLog` entity for tracking webhook events
  - `WebhookLogRepositoryPort` interface for webhook log persistence
  - `ProcessWebhookUseCase` for handling incoming webhooks
  - `GetWebhookLogsUseCase` for querying webhook logs
- **Infrastructure**
  - `InMemoryWebhookLogRepository` implementation

---

## [0.5.0] - 2025-12-14

### Added
- **Analytics Module**
  - `GET /analytics/summary` - Get aggregated notification statistics
    - Supports period presets: today, this_week, this_month, last_7_days, last_30_days
    - Supports custom date range (startDate, endDate)
    - Returns: total, pending, sent, delivered, failed counts
    - Computed metrics: deliveryRate, failureRate, successRate
  - `GET /analytics/channels` - Get statistics breakdown by channel
    - Same period/date filtering as summary
    - Returns per-channel stats sorted by total (most used first)
    - Includes: SMS, Telegram, Email, Push, WhatsApp
  - `GET /analytics/logs` - Get notification logs with filtering
    - Filter by status (PENDING, SENT, DELIVERED, FAILED)
    - Filter by channel (SMS, TELEGRAM, EMAIL, PUSH, WHATSAPP)
    - Filter by provider (ESKIZ, PLAYMOBILE, etc.)
    - Filter by date range
    - Pagination (page, limit)
    - Masked recipient info for privacy (+998***4567, u***@example.com)
- **Infrastructure**
  - `InMemoryNotificationRepository` with full analytics support
  - Shared notification repository for cross-module data access
- **DTOs**
  - `GetAnalyticsSummaryQueryDto` for summary endpoint
  - `GetAnalyticsByChannelQueryDto` for channels endpoint
  - `GetNotificationLogsQueryDto` with array transforms for filters

### Changed
- `NotificationsService` now uses shared `InMemoryNotificationRepository`
- Analytics data is shared with notifications for accurate stats

---

## [0.4.0] - 2025-12-14

### Added
- **Recipients Module**
  - `POST /recipients` - Create recipient with contacts and preferences
  - `GET /recipients` - List recipients with pagination
  - `GET /recipients/:id` - Get recipient by ID
  - `PUT /recipients/:id` - Update recipient
  - `DELETE /recipients/:id` - Delete recipient
  - `POST /recipients/:id/link-telegram` - Link Telegram chat ID
- **Infrastructure**
  - `InMemoryRecipientRepository` implementation
- **DTOs**
  - `CreateRecipientDto` with contacts, preferences, metadata
  - `UpdateRecipientDto` for partial updates
  - `RecipientPreferencesDto` with preferred channel, opted-out channels, quiet hours
  - `LinkTelegramDto` for Telegram linking
  - `ListRecipientsQueryDto` for pagination

---

## [0.3.0] - 2025-12-14

### Added
- **Templates Module**
  - `POST /templates` - Create new template (DRAFT status)
  - `GET /templates` - List templates with pagination and filters
  - `GET /templates/:id` - Get template by ID
  - `PUT /templates/:id` - Update template
  - `DELETE /templates/:id` - Delete template
  - `POST /templates/:id/publish` - Publish template (DRAFT → ACTIVE)
  - `POST /templates/:id/unpublish` - Unpublish template (ACTIVE → DRAFT)
  - `POST /templates/:id/archive` - Archive template
  - `POST /templates/render` - Render template with variables
- **Infrastructure**
  - `InMemoryTemplateRepository` implementation
- **Notifications Module**
  - `GET /notifications` - List notifications with pagination (page, limit query params)
  - Response includes recipient and payload fields

---

## [0.2.0] - 2025-12-14

### Added
- **Auth Module**
  - `POST /auth/register` - Register merchant and get API key
  - API Key authentication guard with permission checking
  - `@CurrentMerchant()` and `@CurrentApiKey()` decorators
  - `@RequirePermissions()` decorator for endpoint protection
- **Providers Module**
  - `POST /providers` - Connect provider with encrypted credentials
  - `GET /providers` - List connected providers (masked credentials)
  - `DELETE /providers/:id` - Disconnect provider
  - AES-256-GCM encryption for credentials storage
- **Infrastructure**
  - `InMemoryMerchantRepository` implementation
  - `InMemoryApiKeyRepository` implementation
- **Security**
  - All notification and OTP endpoints now require API key authentication
  - Permission-based access control (SEND, READ, ADMIN)

### Changed
- Notifications endpoints now require `X-API-Key` header with SEND/READ permissions
- OTP endpoints now require `X-API-Key` header with SEND permission

---

## [0.1.0] - 2025-12-14

### Added
- **NestJS Setup**
  - Main application entry point with global validation pipe
  - CORS enabled, API prefix `/api/v1`
- **Health Module**
  - `GET /health` endpoint for status checks
- **Notifications Module**
  - `POST /notifications/send` - Send notification via provider
  - `GET /notifications/:id` - Get notification details
  - `GET /notifications/:id/status` - Get delivery status
  - In-memory notification store (demo)
- **OTP Module**
  - `POST /otp/send` - Send OTP code
  - `POST /otp/verify` - Verify OTP code
  - Rate limiting and attempt tracking
  - In-memory OTP store (demo)
- **Provider Integration**
  - Eskiz SMS adapter (via env vars)
  - Telegram Bot adapter (via env vars)

---

*Last updated: December 2025*
