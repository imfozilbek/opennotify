<h1 align="center">OpenNotify</h1>

<p align="center">
  <strong>Unified Notification API for Central Asia</strong><br/>
  One API to send SMS, Telegram, Email, Push & WhatsApp through your own provider accounts.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#features">Features</a> &bull;
  <a href="#sdks">SDKs</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="ROADMAP.md">Roadmap</a>
</p>

---

## What is OpenNotify?

OpenNotify is a **SaaS notification platform** that gives businesses a single API to manage all their communication channels. You connect your own provider accounts (Eskiz, SendGrid, Telegram Bot, etc.) — we provide the orchestration layer with smart routing, fallback chains, and analytics.

**We are NOT** an SMS gateway or aggregator. We don't resell traffic. We're a unified management layer on top of *your* providers.

```
Your App  →  OpenNotify API  →  Smart Routing  →  Eskiz (SMS)
                                                →  Telegram Bot
                                                →  SendGrid (Email)
                                                →  Firebase (Push)
                                                →  WhatsApp Business
```

## Why OpenNotify?

| Problem | Solution |
|---------|----------|
| SMS is expensive (~100 UZS per message) | Telegram-first routing, SMS as fallback — save up to 70% |
| Different API for every provider | One unified API for all channels |
| No visibility across channels | Single dashboard with analytics |
| Complex OTP implementation | Built-in OTP service with multi-channel fallback |
| Provider goes down | Automatic failover to backup providers |

## Features

- **Multi-channel** — SMS, Telegram, Email, Push, WhatsApp from a single API
- **Smart Routing** — priority-based, cost-based, time-based routing with fallback chains
- **OTP Service** — send and verify OTPs with automatic channel fallback
- **10 Provider Adapters** — Eskiz, PlayMobile, GetSMS, Telegram, SMTP, SendGrid, Mailgun, FCM, APNs, WhatsApp
- **Templates** — create, manage, and render message templates with variables
- **Analytics** — per-channel delivery stats, cost analysis, routing insights
- **Multi-tenant** — team management, API keys, audit logs
- **Merchant Dashboard** — full-featured portal for provider setup, routing rules, and monitoring
- **Webhooks** — real-time delivery status callbacks

## Quick Start

### Send a notification

```bash
curl -X POST https://api.opennotify.uz/v1/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+998901234567",
    "channel": "sms",
    "message": "Your order #1234 has been shipped!"
  }'
```

### Send OTP

```bash
curl -X POST https://api.opennotify.uz/v1/otp/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+998901234567",
    "channel": "telegram"
  }'
```

### Using Node.js SDK

```bash
npm install @opennotify/node-sdk
```

```typescript
import { OpenNotify } from "@opennotify/node-sdk"

const client = new OpenNotify({ apiKey: "your-api-key" })

await client.notifications.send({
    to: "+998901234567",
    channel: "sms",
    message: "Hello from OpenNotify!",
})

// OTP
const otp = await client.otp.send({ to: "+998901234567" })
const result = await client.otp.verify({ id: otp.id, code: "123456" })
```

## SDKs

| Language | Package | Version | Install |
|----------|---------|---------|---------|
| **Node.js** | `@opennotify/node-sdk` | 0.2.0 | `npm install @opennotify/node-sdk` |
| **Python** | `opennotify` | 0.1.0 | `pip install opennotify` |
| **PHP** | `opennotify/opennotify-php` | 0.1.0 | `composer require opennotify/opennotify-php` |
| **Go** | `opennotify-go` | 0.1.0 | `go get github.com/opennotify/opennotify-go` |
| Java | `opennotify-java` | — | Planned |
| C# / .NET | `OpenNotify.NET` | — | Planned |
| Ruby | `opennotify` | — | Planned |
| Rust | `opennotify-rs` | — | Planned |

## Supported Channels & Providers

| Channel | Providers | Use Case |
|---------|-----------|----------|
| **SMS** | Eskiz, PlayMobile, GetSMS | OTP, transactional, marketing |
| **Telegram** | Telegram Bot API | OTP, transactional (free) |
| **Email** | SMTP, SendGrid, Mailgun | Marketing, transactional |
| **Push** | Firebase FCM, Apple APNs | Alerts, engagement |
| **WhatsApp** | WhatsApp Business API | Support, transactional |

### Smart Routing Examples

```
OTP         → Telegram first → SMS fallback
Marketing   → Email + Push (batch)
Transactional → SMS (guaranteed delivery)
Night hours → Push only (no SMS)
```

## Architecture

TypeScript monorepo built with **DDD + Clean Architecture**.

```
opennotify/
├── libs/
│   └── core/              # Domain logic, entities, use cases, provider adapters
├── apps/
│   ├── api/               # NestJS REST API (v0.10.4)
│   ├── dashboard/         # Merchant Portal — React + Vite (v0.6.2)
│   ├── landing/           # Marketing Site — Next.js 15 (v0.2.0)
│   └── docs/              # Developer Docs — Fumadocs (v0.1.0)
├── packages/
│   ├── node-sdk/          # Node.js SDK
│   ├── python-sdk/        # Python SDK
│   ├── php-sdk/           # PHP SDK
│   ├── go-sdk/            # Go SDK
│   ├── java-sdk/          # Java SDK (planned)
│   ├── dotnet-sdk/        # .NET SDK (planned)
│   ├── ruby-sdk/          # Ruby SDK (planned)
│   └── rust-sdk/          # Rust SDK (planned)
└── package.json
```

### Domain Layer (libs/core)

```
Domain         → Entities, Value Objects, Events (no framework imports)
Application    → Use Cases, Ports (interfaces)
Infrastructure → Provider Adapters (Eskiz, Telegram, SendGrid, etc.)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | NestJS, TypeScript, Node.js 22+ |
| Dashboard | React 18, Vite, Tailwind CSS |
| Landing | Next.js 15, Framer Motion, MDX |
| Docs | Next.js, Fumadocs |
| Database | MongoDB, Redis |
| Testing | Vitest |
| Monorepo | pnpm workspaces |

## Development

### Prerequisites

- Node.js >= 22.0.0
- pnpm >= 9.0.0

### Setup

```bash
git clone https://github.com/opennotifyuz/opennotify.git
cd opennotify
pnpm install
```

### Commands

```bash
pnpm build              # Build all packages
pnpm test               # Run all tests
pnpm lint               # Lint and fix
pnpm format             # Format code (Prettier)

# Run specific package
pnpm --filter @opennotify/api build
pnpm --filter @opennotify/core test
```

### Code Style

- 4 spaces indentation
- No semicolons
- Double quotes
- 100 char line width
- Trailing commas

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/v1/send` | Send notification |
| `GET` | `/v1/notifications/:id` | Get notification details |
| `GET` | `/v1/notifications/:id/status` | Get delivery status |
| `POST` | `/v1/otp/send` | Send OTP |
| `POST` | `/v1/otp/verify` | Verify OTP code |
| `GET` | `/v1/analytics/summary` | Analytics summary |
| `GET` | `/v1/analytics/channels` | Per-channel analytics |
| `POST` | `/v1/templates` | Create template |
| `GET` | `/v1/templates` | List templates |

## Contributing

Contributions are welcome! Please read the codebase guidelines in [CLAUDE.md](CLAUDE.md) for code style, architecture rules, and commit conventions.

```bash
# Commit format
<type>(<package>): <subject>

# Examples
feat(core): add eskiz adapter
fix(node-sdk): resolve timeout issue
test(api): add notification endpoint tests
```

## License

[MIT](LICENSE)

---

<p align="center">
  Built for businesses in Central Asia
</p>
