# @opennotify/core Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.5.0] - 2025-12-14

### Added
- **Value Objects**
  - `TemplateStatus` enum (DRAFT, ACTIVE, ARCHIVED) with status transitions
  - `TemplateVariable` for template placeholder definitions with validation
- **Entities**
  - `Template` entity for reusable message templates
    - Variable placeholders: `{{variable_name}}`
    - Render with substitution and defaults
    - Status lifecycle: DRAFT → ACTIVE → ARCHIVED
    - Validation for body/subject variables consistency
- **Ports**
  - `TemplateRepositoryPort` for template persistence
- **Use Cases**
  - `CreateTemplateUseCase` for creating templates with validation
  - `RenderTemplateUseCase` for rendering templates with variables
- **Adapters**
  - `PlayMobileAdapter` for PlayMobile SMS provider (Uzbekistan)
  - `GetSmsAdapter` for GetSMS provider (Uzbekistan)

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
