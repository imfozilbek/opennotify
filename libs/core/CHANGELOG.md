# @opennotify/core Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.9.0] - 2025-12-18

### Added
- **Entities**
  - `Team` entity for managing team members and roles
    - Owner, Admin, Member, Viewer roles
    - Add/remove members with permission checks
    - Role-based permission system
    - Ownership transfer support
  - `AuditLog` entity for tracking important actions
    - Immutable audit trail
    - Action types: team, member, provider, API key, settings
    - Actor and target tracking
    - IP address and user agent logging
- **Value Objects**
  - `TeamRole` enum with OWNER, ADMIN, MEMBER, VIEWER
  - `TeamAction` enum for permission checking
  - Role permission matrix with `roleHasPermission()` helper
- **Ports**
  - `TeamRepositoryPort` for team persistence
  - `AuditLogRepositoryPort` for audit log persistence
- **Use Cases**
  - `CreateTeamUseCase` for creating teams with audit logging
  - `AddTeamMemberUseCase` for inviting members with permission checks
  - `RemoveTeamMemberUseCase` for removing members with audit logging
  - `GetAuditLogsUseCase` for querying audit logs with filters

---

## [0.8.0] - 2025-12-18

### Added
- **Adapters**
  - `WhatsAppAdapter` for WhatsApp Business Cloud API
    - Bearer token authentication via Meta Graph API
    - Text message support for user-initiated conversations
    - Template message support for business-initiated conversations
      - Header, body, and button variable substitution
      - Language selection for templates
    - HMAC-SHA256 webhook signature verification
    - Status mapping: sent, delivered, read, failed
    - Phone number normalization (E.164 format)

---

## [0.7.0] - 2025-12-17

### Added
- **Adapters**
  - `FcmAdapter` for Firebase Cloud Messaging (HTTP v1 API)
    - OAuth 2.0 JWT authentication with token caching
    - Supports notification and data messages
    - Android-specific options: priority, TTL, notification channel
    - iOS-specific options via FCM: badge, sound
  - `ApnsAdapter` for Apple Push Notification Service
    - Uses `apns2` package for HTTP/2 communication
    - Token-based authentication (ES256)
    - Supports: alert, badge, sound, content-available, mutable-content
    - Priority and expiration control
    - Collapse ID for notification replacement
- **ProviderCredentials**
  - `asFcm()` helper method for FCM credentials
  - `asApns()` helper method for APNs credentials
  - `asMailgun()` helper method for Mailgun credentials
  - `asWhatsApp()` helper method for WhatsApp credentials
  - Updated `toMasked()` for FCM, APNs, Mailgun, WhatsApp providers

### Dependencies
- Added `apns2` as optional peer dependency (^11.0.0) for ApnsAdapter

---

## [0.6.1] - 2025-12-14

### Added
- **Value Objects**
  - `AnalyticsPeriod` enum for time period presets (today, this_week, this_month, last_7_days, last_30_days)
  - `DateRange` for date range queries with factory methods (today, thisWeek, thisMonth, last)
  - `NotificationStats` for aggregated statistics with computed metrics (deliveryRate, failureRate, successRate)
  - `ChannelStats` for per-channel statistics breakdown
- **Ports**
  - Extended `NotificationRepositoryPort` with analytics methods:
    - `getStats()` - aggregated stats by status and channel
    - `getStatsByChannel()` - detailed stats per channel
    - `findWithFilters()` - filtered notification queries
    - `countWithFilters()` - count for pagination
  - `NotificationFilters` interface for query filtering
  - `AggregatedStats` interface for stats response
- **Use Cases**
  - `GetAnalyticsSummaryUseCase` - get overall notification statistics
  - `GetAnalyticsByChannelUseCase` - get statistics breakdown by channel
  - `GetNotificationLogsUseCase` - get paginated notification logs with filters

---

## [0.6.0] - 2025-12-14

### Added
- **Adapters**
  - `SmtpAdapter` for generic SMTP email sending
    - Uses nodemailer as optional peer dependency
    - Supports TLS/SSL connections (ports 465, 587)
    - Auto-detection of HTML content
    - Plain text fallback generation
    - Configurable from address and name
  - `SendGridAdapter` for SendGrid email API v3
    - Bearer token authentication
    - HTML and plain text content support
    - Webhook event processing for delivery status
    - Status mapping: processed, delivered, bounce, dropped, etc.
  - `MailgunAdapter` for Mailgun email API
    - Basic auth (api:key) authentication
    - EU region support
    - HMAC-SHA256 webhook signature verification
    - Status mapping: accepted, delivered, failed, etc.

### Dependencies
- Added `nodemailer` as optional peer dependency (^6.9.0) for SmtpAdapter

---

## [0.5.0] - 2025-12-14

### Added
- **Value Objects**
  - `TemplateStatus` enum (DRAFT, ACTIVE, ARCHIVED) with status transitions
  - `TemplateVariable` for template placeholder definitions with validation
  - `RetryPolicy` for configurable retry behavior with exponential backoff
  - `ProviderError` for error classification (retryable vs permanent)
  - `ProviderHealth` for tracking provider health status
  - `SendAttempt` for detailed attempt tracking and debugging
- **Entities**
  - `Template` entity for reusable message templates
    - Variable placeholders: `{{variable_name}}`
    - Render with substitution and defaults
    - Status lifecycle: DRAFT → ACTIVE → ARCHIVED
    - Validation for body/subject variables consistency
- **Ports**
  - `TemplateRepositoryPort` for template persistence
- **Services**
  - `ProviderHealthTracker` for circuit breaker and health monitoring
    - Sliding window failure tracking
    - Automatic circuit breaker (opens after 5 failures)
    - Auto-recovery after 30 second cooldown
    - Health status: healthy, degraded, unhealthy
- **Use Cases**
  - `CreateTemplateUseCase` for creating templates with validation
  - `RenderTemplateUseCase` for rendering templates with variables
- **Adapters**
  - `PlayMobileAdapter` for PlayMobile SMS provider (Uzbekistan)
  - `GetSmsAdapter` for GetSMS provider (Uzbekistan)

### Enhanced
- **SmartSendUseCase** - Provider failover logic
  - Retry with exponential backoff for transient errors
  - Circuit breaker integration (skip unhealthy providers)
  - Error classification (retryable: timeout, rate limit, server error)
  - Detailed attempt tracking in output
  - Health tracking integration
- **RoutingRule** - Added `retryPolicy` configuration
- **RoutingResult** - Added `retryPolicy` from matched rule

---

## [0.4.0] - 2025-12-14

### Added
- **Value Objects**
  - `MessageType` enum (OTP, TRANSACTIONAL, MARKETING, ALERT) with routing defaults
  - `RoutingRule` for defining routing conditions and strategies
  - `RoutingContext` for routing decision context
  - `RoutingResult` for routing engine output with fallback chains
- **Services**
  - `RoutingEngine` for intelligent channel/provider selection
    - Cost-optimized routing (cheapest first)
    - Reliability-first routing (SMS first)
    - Recipient preference routing
    - Channel preference routing
    - Quiet hours support
    - Fallback chain logic
- **Ports**
  - `MerchantProviderPort` for dynamic provider adapter access
- **Use Cases**
  - `SmartSendUseCase` with automatic routing and fallback
    - No provider specification required
    - Automatic channel selection based on message type
    - Fallback on delivery failure
    - Respects recipient opt-outs and preferences

### Default Routing Rules
- OTP: Telegram first, SMS fallback (reliability)
- Alert: Push → Telegram → SMS (speed)
- Marketing: Email → Push → Telegram, no SMS (cost)
- Transactional: Recipient preference, then cost optimized
- Default: Cost optimized with 2 fallback attempts

---

## [0.3.0] - 2025-12-14

### Added
- **Entities**
  - `Merchant` entity with status management and settings
  - `ApiKey` entity with permissions, hashing, and validation
  - `OtpRequest` entity with verification and expiration logic
- **Value Objects**
  - `ProviderCredentials` for encrypted provider config (AES-256-GCM)
- **Ports**
  - `MerchantRepositoryPort` for merchant persistence
  - `ApiKeyRepositoryPort` for API key persistence
  - `OtpRepositoryPort` for OTP request persistence
- **Use Cases**
  - `SendOtpUseCase` with multi-channel delivery and rate limiting
  - `VerifyOtpUseCase` with attempt tracking
  - `ValidateApiKeyUseCase` for API authentication
  - `CreateApiKeyUseCase` for key generation

---

## [0.2.0] - 2025-12-14

### Added
- **Adapters**
  - `TelegramAdapter` implementation for Telegram Bot API
- **Entities**
  - `Recipient` entity for managing notification recipients across channels
- **Ports**
  - `RecipientRepositoryPort` interface for recipient persistence
- **Use Cases**
  - `CreateRecipientUseCase` for creating recipients with duplicate checking
  - `UpdateRecipientUseCase` for updating contacts, preferences, and Telegram linking

---

## [0.1.0] - 2025-12-14

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
