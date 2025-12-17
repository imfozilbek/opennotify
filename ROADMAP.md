# OpenNotify Product Roadmap

## Vision & Mission

**Vision:**
Стать единой notification-инфраструктурой для бизнеса Центральной Азии.
Один API для всех каналов: SMS, Telegram, Email, Push, WhatsApp.

**Mission:**
Дать бизнесу единый интерфейс для управления всеми каналами коммуникации.
Клиент подключает свои аккаунты провайдеров — мы даём софт для управления.

---

## Ключевое позиционирование

**Мы НЕ:**
- SMS-шлюз/агрегатор (не перепродаём трафик)
- Telegram-бот платформа (не хостим ботов)
- Email-сервис (не отправляем от своего имени)

**Мы:**
- SaaS платформа для управления notification-каналами клиента
- Unified API поверх провайдеров клиента
- Orchestration layer с умной маршрутизацией

---

## Почему Multi-channel > SMS-only

| Проблема SMS | Решение OpenNotify |
|--------------|-------------------|
| SMS дорого (~80-150 сум) | Telegram бесплатно как primary |
| SMS не везде работает | Fallback chain: Telegram → SMS |
| Разные API для каналов | Один unified API |
| Нет visibility | Единый дашборд всех каналов |

**Unit Economics выгода для клиента:**
```
Сценарий: 10,000 OTP/месяц

Только SMS:
10,000 × 100 сум = 1,000,000 сум ($80)

OpenNotify (70% Telegram, 30% SMS fallback):
7,000 × 0 сум + 3,000 × 100 сум = 300,000 сум ($24)
Экономия: $56/месяц (70%)
```

---

## Каналы и приоритеты

### Phase 1: Core Channels
| Канал | Провайдеры | Приоритет |
|-------|------------|-----------|
| **SMS** | Eskiz, PlayMobile, GetSMS | 🔴 Critical |
| **Telegram Bot** | Telegram Bot API | 🔴 Critical |
| **Email** | SMTP, SendGrid, Mailgun | 🟡 High |

### Phase 2: Extended Channels
| Канал | Провайдеры | Приоритет |
|-------|------------|-----------|
| **Push** | Firebase FCM, Apple APNs | 🟡 High |
| **WhatsApp** | WhatsApp Business API | 🟢 Medium |
| **Viber** | Viber Business | 🟢 Medium |

---

## Product Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenNotify Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Unified    │  │   Smart     │  │  Analytics  │         │
│  │    API      │  │  Routing    │  │  Dashboard  │         │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘         │
│         │                │                                  │
│         ▼                ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Channel Orchestration Layer             │   │
│  └─────────────────────────────────────────────────────┘   │
│         │         │         │         │         │          │
│         ▼         ▼         ▼         ▼         ▼          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────┐  │
│  │   SMS   │ │Telegram │ │  Email  │ │  Push   │ │ More │  │
│  │Providers│ │  Bots   │ │Providers│ │Services │ │      │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └──────┘  │
│                                                             │
│  Customer's own accounts (Eskiz, SendGrid, FCM, etc.)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Product Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     OpenNotify Platform                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │     OTP      │  │   Bulk       │  │  Automation  │           │
│  │   Service    │  │  Messaging   │  │   Workflows  │           │
│  │              │  │              │  │              │           │
│  │  Any app     │  │  Marketing   │  │  Triggered   │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                    │
│  ┌──────▼─────────────────▼─────────────────▼───────┐           │
│  │              Core API + SDKs                      │           │
│  │           Developers, Mid-size business           │           │
│  └──────────────────────┬────────────────────────────┘           │
│                         │                                        │
│  ┌──────────────────────▼────────────────────────────┐           │
│  │           Dashboard + Analytics                    │           │
│  │         All customers (logs, stats, routing)       │           │
│  └────────────────────────────────────────────────────┘           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Monetization Model

```
┌─────────────────────────────────────────────┐
│  FREE TIER                                  │
│  - API access (up to 500 notifications/mo)  │
│  - 2 channels (SMS + Telegram)              │
│  - Basic dashboard                          │
│  Goal: attract developers                   │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  STARTER — $29/month                        │
│  - 5,000 notifications                      │
│  - All Phase 1 channels                     │
│  - Smart routing                            │
│  - Templates                                │
│  Goal: small business, startups             │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  GROWTH — $79/month                         │
│  - 25,000 notifications                     │
│  - All channels                             │
│  - Advanced analytics                       │
│  - Recipient management                     │
│  Goal: mid-size business                    │
└─────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│  BUSINESS — $199/month                      │
│  - 100,000 notifications                    │
│  - Priority support                         │
│  - SLA 99.9%                                │
│  - Custom integrations                      │
│  Goal: large business                       │
└─────────────────────────────────────────────┘
```

---

## Roadmap Phases

### Phase 1: Foundation (v0.1.0 - v0.3.0)
> Goal: SMS + Telegram MVP with OTP

| Component | Version | Status | Key Features |
|-----------|---------|--------|--------------|
| libs/core | v0.1.0 | ✅ Done | Eskiz adapter, Telegram adapter |
| libs/core | v0.2.0 | ✅ Done | Recipient entity, use cases |
| libs/core | v0.3.0 | ✅ Done | Multi-tenant, OTP service |
| apps/api | v0.1.0 | ✅ Done | Basic API, webhooks |
| apps/api | v0.2.0 | ✅ Done | Merchant onboarding |
| apps/dashboard | v0.1.0 | ✅ Done | Provider setup, logs |

### Phase 2: Smart Routing (v0.4.0 - v0.5.0)
> Goal: Intelligent channel orchestration

| Component | Version | Status | Key Features |
|-----------|---------|--------|--------------|
| libs/core | v0.4.0 | ✅ Done | Priority routing, cost routing, fallback chains |
| libs/core | v0.5.0 | ✅ Done | Templates, PlayMobile, GetSMS adapters |
| apps/api | v0.3.0 | ✅ Done | Template API (CRUD, publish, render) |
| apps/dashboard | v0.2.0 | ⏳ | Routing rules UI, template editor |

### Phase 3: Email & Push (v0.6.0 - v0.7.0)
> Goal: Full multi-channel coverage

| Component | Version | Key Features |
|-----------|---------|--------------|
| libs/core | v0.6.0 | Email adapters (SMTP, SendGrid, Mailgun) |
| libs/core | v0.7.0 | Push adapters (FCM, APNs) |
| apps/api | v0.4.0 | Analytics API |
| apps/dashboard | v0.3.0 | Analytics UI, channel comparison |

### Phase 4: Enterprise Features (v0.8.0 - v0.9.0)
> Goal: Enterprise-ready platform

| Component | Version | Status | Key Features |
|-----------|---------|--------|--------------|
| libs/core | v0.8.0 | ✅ Done | WhatsApp adapter |
| apps/api | v0.5.0 | ⏳ | Team management, audit logs |
| apps/dashboard | v0.4.0 | ⏳ | Team UI, advanced security |
| SDKs | v0.1.0 | ⏳ | Node.js, Python, PHP, Go SDKs |

### Phase 5: Ecosystem (v1.0.0+)
> Goal: Platform ecosystem

| Component | Version | Key Features |
|-----------|---------|--------------|
| libs/core | v1.0.0 | Viber, advanced fraud detection |
| apps/api | v1.0.0 | Workflow automation |
| Plugins | v0.1.0 | WooCommerce, n8n, 1C |

---

## Component Roadmaps

Detailed roadmaps for each component:

| Component | Path | Focus |
|-----------|------|-------|
| Core Library | [libs/core/ROADMAP.md](libs/core/ROADMAP.md) | Domain logic, providers |
| Platform API | [apps/api/ROADMAP.md](apps/api/ROADMAP.md) | REST API, business logic |
| Dashboard | [apps/dashboard/ROADMAP.md](apps/dashboard/ROADMAP.md) | Merchant portal |
| Landing | [apps/landing/ROADMAP.md](apps/landing/ROADMAP.md) | Marketing site |
| Node.js SDK | [packages/node-sdk/ROADMAP.md](packages/node-sdk/ROADMAP.md) | JS/TS SDK |
| Python SDK | [packages/python-sdk/ROADMAP.md](packages/python-sdk/ROADMAP.md) | Python SDK |
| PHP SDK | [packages/php-sdk/ROADMAP.md](packages/php-sdk/ROADMAP.md) | PHP SDK |
| Go SDK | [packages/go-sdk/ROADMAP.md](packages/go-sdk/ROADMAP.md) | Go SDK |
| Java SDK | [packages/java-sdk/ROADMAP.md](packages/java-sdk/ROADMAP.md) | Java/Kotlin SDK |
| C#/.NET SDK | [packages/dotnet-sdk/ROADMAP.md](packages/dotnet-sdk/ROADMAP.md) | .NET SDK |
| Ruby SDK | [packages/ruby-sdk/ROADMAP.md](packages/ruby-sdk/ROADMAP.md) | Ruby SDK |
| Rust SDK | [packages/rust-sdk/ROADMAP.md](packages/rust-sdk/ROADMAP.md) | Rust SDK |

---

## Success Metrics

### Phase 1-2 (Foundation + Early Traction)
- [ ] 20 registered accounts
- [ ] 5 paying customers
- [ ] 50,000 notifications processed
- [ ] $500 MRR

### Phase 3 (Product-Market Fit)
- [ ] 50 paying customers
- [ ] 500,000 notifications/month
- [ ] $3,000 MRR
- [ ] 30% notifications via Telegram (cost savings)

### Phase 4 (Growth)
- [ ] 200 paying customers
- [ ] $15,000 MRR
- [ ] Net Revenue Retention > 110%

### Phase 5 (Scale)
- [ ] $50,000 MRR
- [ ] Kazakhstan launch
- [ ] 1M+ notifications/month

---

## Competitive Advantages

| Feature | OpenNotify | Novu | Knock | Local SMS providers |
|---------|------------|------|-------|---------------------|
| Multi-channel | ✅ | ✅ | ✅ | ❌ SMS only |
| Local SMS providers | ✅ Eskiz, PlayMobile | ❌ | ❌ | ✅ Own only |
| Telegram integration | ✅ Native | ❌ | ❌ | ❌ |
| Smart routing | ✅ | ✅ | ✅ | ❌ |
| OTP service | ✅ Built-in | ❌ | ❌ | ✅ Basic |
| Local support | ✅ Uzbek, Russian | ❌ | ❌ | ✅ |
| Pricing in UZS | ✅ | ❌ | ❌ | ✅ |

**Unique advantages:**
1. Единственный с нативной поддержкой локальных SMS-провайдеров
2. Telegram как first-class channel (не afterthought)
3. Локальная поддержка и понимание рынка
4. OTP service с multi-channel fallback

---

## Integration with OpenPayment

```
┌─────────────────────────────────────────────────────────────┐
│                   OpenPayment Ecosystem                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ OpenPayment  │  │  OpenNotify  │  │   Future:    │       │
│  │  (Payments)  │◄─┤(Notifications)│  │ OpenInvoice  │       │
│  │              │  │              │  │              │       │
│  │  $49/mo      │  │  $29/mo      │  │  $X/mo       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                 │                                  │
│         └────────┬────────┘                                  │
│                  ▼                                           │
│         Bundle: $69/mo (save $9)                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Синергия:**
- OpenPayment event → OpenNotify sends notification
- Payment success → SMS/Telegram confirmation
- Subscription renewal → Email reminder
- Failed payment → Push notification

**Built-in integration:**
```javascript
// В OpenPayment автоматически
openPayment.on('payment.success', (payment) => {
  openNotify.send({
    to: payment.customer.phone,
    template: 'payment_success',
    data: { amount: payment.amount, orderId: payment.orderId }
  });
});
```

---

## Technical Stack

### Backend
```
Language: TypeScript/Node.js
Framework: NestJS
Database: PostgreSQL + Redis
Queue: Bull (Redis-based)
```

### Infrastructure
```
Hosting: DigitalOcean / Hetzner
Container: Docker + Docker Compose
CI/CD: GitHub Actions
Monitoring: Sentry + custom metrics
```

### Security
```
Encryption: AES-256 for credentials
API Auth: API Keys + JWT
Rate Limiting: Per-tenant, per-endpoint
```

---

*Last updated: December 2025*
*Model: Multi-channel Notification Platform (SaaS)*
