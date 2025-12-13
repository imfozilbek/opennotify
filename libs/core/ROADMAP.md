# @opennotify/core Roadmap

## Overview

Core library containing domain logic, provider adapters, and use cases for the OpenNotify platform.

---

## v0.1.0 — SMS Foundation
> **Goal:** Basic SMS sending via Eskiz

| Task | Status |
|------|--------|
| Channel enum (SMS, Telegram, Email, Push, WhatsApp) | ✅ |
| Provider enum (Eskiz, PlayMobile, GetSMS, Telegram, SendGrid, etc.) | ✅ |
| NotificationStatus value object | ✅ |
| Notification entity | ✅ |
| NotificationProviderPort interface | ✅ |
| EskizAdapter implementation | ✅ |
| SendNotificationUseCase | ✅ |
| GetNotificationStatusUseCase | ✅ |

---

## v0.2.0 — Telegram Integration
> **Goal:** Telegram as first-class channel

| Task | Status |
|------|--------|
| TelegramAdapter implementation | ⏳ |
| Recipient entity (phone, telegram_chat_id, preferences) | ⏳ |
| RecipientRepositoryPort | ⏳ |
| Phone-to-ChatId linking logic | ⏳ |
| CreateRecipientUseCase | ⏳ |
| UpdateRecipientUseCase | ⏳ |

---

## v0.3.0 — Multi-tenant & OTP
> **Goal:** Multi-tenancy and OTP service

| Task | Status |
|------|--------|
| Merchant entity | ⏳ |
| ApiKey entity | ⏳ |
| ProviderCredentials value object (encrypted) | ⏳ |
| OtpRequest entity | ⏳ |
| SendOtpUseCase | ⏳ |
| VerifyOtpUseCase | ⏳ |
| ValidateApiKeyUseCase | ⏳ |
| CreateApiKeyUseCase | ⏳ |

---

## v0.4.0 — Smart Routing
> **Goal:** Intelligent channel selection

| Task | Status |
|------|--------|
| RoutingRule value object | ⏳ |
| RoutingEngine service | ⏳ |
| Priority-based routing | ⏳ |
| Cost-based routing | ⏳ |
| Fallback chain logic | ⏳ |
| Time-based rules | ⏳ |

---

## v0.5.0 — Templates & More SMS Providers
> **Goal:** Template system and provider diversity

| Task | Status |
|------|--------|
| Template entity | ⏳ |
| TemplateVariable value object | ⏳ |
| CreateTemplateUseCase | ⏳ |
| RenderTemplateUseCase | ⏳ |
| PlayMobileAdapter implementation | ⏳ |
| GetSmsAdapter implementation | ⏳ |
| Provider failover logic | ⏳ |

---

## v0.6.0 — Email Channel
> **Goal:** Full email support

| Task | Status |
|------|--------|
| SmtpAdapter implementation | ⏳ |
| SendGridAdapter implementation | ⏳ |
| MailgunAdapter implementation | ⏳ |
| HTML template rendering | ⏳ |
| Email-specific delivery status | ⏳ |

---

## v0.7.0 — Push Notifications
> **Goal:** Mobile push support

| Task | Status |
|------|--------|
| FcmAdapter implementation (Firebase) | ⏳ |
| ApnsAdapter implementation (Apple) | ⏳ |
| PushToken entity | ⏳ |
| Device management | ⏳ |

---

## v0.8.0 — WhatsApp
> **Goal:** WhatsApp Business API integration

| Task | Status |
|------|--------|
| WhatsAppAdapter implementation | ⏳ |
| WhatsApp template format support | ⏳ |
| WhatsApp-specific status handling | ⏳ |

---

## v1.0.0 — Production Ready
> **Goal:** Stable, well-tested core

| Task | Status |
|------|--------|
| Full test coverage (>80%) | ⏳ |
| Performance optimization | ⏳ |
| Documentation | ⏳ |
| Viber adapter (optional) | ⏳ |

---

## Domain Model

```
┌─────────────────────────────────────────────────────────────┐
│                       Domain Layer                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Entities:                                                   │
│  ├── Notification (id, channel, provider, status, payload)  │
│  ├── Merchant (id, name, credentials, settings)             │
│  ├── ApiKey (id, merchantId, key, permissions)              │
│  ├── Recipient (id, phone, email, telegramChatId, prefs)    │
│  ├── Template (id, name, channel, content, variables)       │
│  └── OtpRequest (id, phone, code, expiresAt, verified)      │
│                                                              │
│  Value Objects:                                              │
│  ├── Channel (SMS, Telegram, Email, Push, WhatsApp)         │
│  ├── Provider (Eskiz, PlayMobile, Telegram, SendGrid...)    │
│  ├── NotificationStatus (Pending, Sent, Delivered, Failed)  │
│  ├── ProviderCredentials (encrypted config per provider)    │
│  └── RoutingRule (conditions, priority, fallback)           │
│                                                              │
│  Events:                                                     │
│  ├── NotificationSent                                        │
│  ├── NotificationDelivered                                   │
│  ├── NotificationFailed                                      │
│  ├── OtpRequested                                            │
│  └── OtpVerified                                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

*Last updated: December 2025*
