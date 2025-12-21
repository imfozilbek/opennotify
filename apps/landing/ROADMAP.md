# @opennotify/landing Roadmap

## Overview

Marketing website for OpenNotify — unified notification platform for Central Asia.

**Tech Stack:** Next.js 15, shadcn/ui, Tailwind CSS 4.0, Framer Motion

> **Note:** Documentation moved to separate package: [apps/docs/ROADMAP.md](../docs/ROADMAP.md)

---

## v0.1.0 — Foundation ✅

> **Goal:** High-converting single-page landing with dark mode

| Task | Status |
|------|--------|
| Next.js 15 + TypeScript setup | ✅ |
| Tailwind CSS 4.0 + shadcn/ui | ✅ |
| Dark mode (next-themes) | ✅ |
| Fonts: Inter + JetBrains Mono | ✅ |
| Header (sticky, mobile menu) | ✅ |
| Hero section (headline, CTA, code snippet) | ✅ |
| Social proof bar (client logos) | ✅ |
| Problem → Solution section | ✅ |
| Channels section (5 cards) | ✅ |
| Features section (3 key features) | ✅ |
| Code examples (Node, Python, PHP, Go tabs) | ✅ |
| Savings calculator (interactive) | ✅ |
| Testimonials (3 cards) | ✅ |
| Pricing preview (4 tiers) | ✅ |
| FAQ section (accordion) | ✅ |
| Final CTA section | ✅ |
| Footer (4-column) | ✅ |
| SEO meta tags + OG images | ✅ |
| Lighthouse score > 90 | ⏳ |

---

## v0.2.0 — Marketing Pages ✅

> **Goal:** Full marketing site with dedicated pages

| Task | Status |
|------|--------|
| Pricing page (full comparison table) | ✅ |
| Annual/Monthly toggle | ✅ |
| Enterprise tier (Contact Sales) | ✅ |
| Features page (detailed) | ✅ |
| Channels page (per-channel details) | ✅ |
| Use cases page (6 use cases) | ✅ |
| About page | ✅ |
| Blog setup (MDX) | ✅ |

---

## v0.3.0 — Localization

> **Goal:** Multi-language support (RU, UZ, EN)

| Task | Status |
|------|--------|
| next-intl configuration | ⏳ |
| Language switcher component | ⏳ |
| URL structure (/ru, /uz, /en) | ⏳ |
| Russian translation (all pages) | ⏳ |
| Uzbek translation (all pages) | ⏳ |
| English (base language) | ⏳ |

---

## v0.4.0 — Advanced Features

> **Goal:** Conversion optimization and analytics

| Task | Status |
|------|--------|
| Posthog/Plausible analytics | ⏳ |
| Event tracking (CTA clicks) | ⏳ |
| A/B testing framework | ⏳ |
| Hero headline variants | ⏳ |
| Interactive product demo | ⏳ |
| API playground | ⏳ |

---

## Page Structure (v0.1.0)

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (sticky)                                             │
│  Logo | Product | Pricing | Docs | GitHub | Login | Sign Up │
├─────────────────────────────────────────────────────────────┤
│  HERO                                                        │
│  Badge: "🇺🇿 Made for Central Asia"                          │
│  Headline: "Единый API для всех каналов уведомлений"        │
│  Subheadline: "SMS, Telegram, Email, Push, WhatsApp..."     │
│  [Начать бесплатно]  [Документация →]                       │
│  Code snippet (6 lines)                                      │
├─────────────────────────────────────────────────────────────┤
│  SOCIAL PROOF: "50+ компаний" | Logo | Logo | Logo | ...    │
├─────────────────────────────────────────────────────────────┤
│  PROBLEM → SOLUTION                                          │
│  ❌ Без OpenNotify  →  ✅ С OpenNotify                       │
├─────────────────────────────────────────────────────────────┤
│  CHANNELS: [SMS] [Telegram] [Email] [Push] [WhatsApp]       │
├─────────────────────────────────────────────────────────────┤
│  FEATURES: Smart Routing | Multi-Channel | Cost Savings     │
├─────────────────────────────────────────────────────────────┤
│  CODE EXAMPLES: [Node.js] [Python] [PHP] [Go] [cURL]        │
├─────────────────────────────────────────────────────────────┤
│  SAVINGS CALCULATOR: Slider → "Экономия: $X/месяц"          │
├─────────────────────────────────────────────────────────────┤
│  TESTIMONIALS: 3 customer quotes                             │
├─────────────────────────────────────────────────────────────┤
│  PRICING: FREE | STARTER ★ | GROWTH                         │
├─────────────────────────────────────────────────────────────┤
│  FAQ: 7 accordion items                                      │
├─────────────────────────────────────────────────────────────┤
│  FINAL CTA: "Готовы начать?" [Создать аккаунт бесплатно]    │
├─────────────────────────────────────────────────────────────┤
│  FOOTER: Product | Resources | Company | Legal | Social     │
└─────────────────────────────────────────────────────────────┘
```

---

## Content

### Hero

```
Badge: "🇺🇿 Создано для Центральной Азии"
Headline: "Единый API для всех каналов уведомлений"
Subheadline: "SMS, Telegram, Email, Push, WhatsApp — один API, умная маршрутизация, 70% экономии"
Primary CTA: "Начать бесплатно"
Secondary CTA: "Документация →"
```

### Code Snippet (Hero)

```typescript
import { OpenNotify } from "@opennotify/sdk"

const notify = new OpenNotify("sk_live_...")

await notify.send({
  to: "+998901234567",
  message: "Ваш код: 123456"
})
```

### Pricing Tiers

```
FREE        STARTER ★    GROWTH      BUSINESS
$0/мес      $29/мес      $79/мес     $199/мес
500 msg     5,000 msg    25,000 msg  100,000 msg
2 channels  All          All         All
```

### FAQ Items

1. Как начать использовать OpenNotify?
2. Какие SMS-провайдеры поддерживаются?
3. Как работает smart routing?
4. Сколько стоит отправка через Telegram?
5. Есть ли SDK для моего языка?
6. Как перенести существующую интеграцию?
7. Какие гарантии SLA?

---

## Design System

```
Colors:
  Primary:     #2563EB (blue)
  Accent:      #7C3AED (violet)
  Success:     #10B981 (green)
  Warning:     #F59E0B (amber)
  Error:       #EF4444 (red)
  Background:  Slate (dark mode first)

Typography:
  Headings:    Inter
  Body:        Inter
  Code:        JetBrains Mono
```

---

*Last updated: December 2025*
