# @opennotify/docs Roadmap

## Overview

Documentation site for OpenNotify — built with Fumadocs.

**Tech Stack:** Next.js 15, Fumadocs, Tailwind CSS 4.0, Shiki, Mermaid

---

## v0.1.0 — Foundation

> **Goal:** Basic docs infrastructure

| Task | Status |
|------|--------|
| Next.js 15 + Fumadocs setup | ⏳ |
| DocsLayout with sidebar | ⏳ |
| Homepage | ⏳ |
| Dynamic [[...slug]] routing | ⏳ |
| Dark/light theme | ⏳ |
| Getting Started section (3 pages) | ⏳ |

---

## v0.2.0 — Core Content

> **Goal:** SDK and channel documentation

| Task | Status |
|------|--------|
| SDK docs — Node.js | ⏳ |
| SDK docs — Python | ⏳ |
| SDK docs — PHP | ⏳ |
| SDK docs — Go | ⏳ |
| Channel docs — SMS | ⏳ |
| Channel docs — Telegram | ⏳ |
| Channel docs — Email | ⏳ |
| Channel docs — Push | ⏳ |
| Channel docs — WhatsApp | ⏳ |
| Features docs — Smart Routing | ⏳ |
| Features docs — Templates | ⏳ |
| Features docs — OTP | ⏳ |
| Features docs — Webhooks | ⏳ |

---

## v0.3.0 — API Reference

> **Goal:** OpenAPI integration

| Task | Status |
|------|--------|
| OpenAPI spec generation from apps/api | ⏳ |
| fumadocs-openapi integration | ⏳ |
| API reference auto-generation script | ⏳ |
| Error codes documentation | ⏳ |

---

## v0.4.0 — Provider Guides

> **Goal:** Setup guides for all providers

| Task | Status |
|------|--------|
| Eskiz setup guide | ⏳ |
| PlayMobile setup guide | ⏳ |
| GetSMS setup guide | ⏳ |
| Telegram Bot setup guide | ⏳ |
| SMTP setup guide | ⏳ |
| SendGrid setup guide | ⏳ |
| Mailgun setup guide | ⏳ |
| FCM setup guide | ⏳ |
| APNs setup guide | ⏳ |
| WhatsApp Business setup guide | ⏳ |

---

## v0.5.0 — Search & Polish

> **Goal:** Production ready

| Task | Status |
|------|--------|
| Fumadocs search integration | ⏳ |
| SEO optimization (meta tags, OG images) | ⏳ |
| Mermaid diagram support | ⏳ |
| Structured data (JSON-LD) | ⏳ |
| Resources section (FAQ, Changelog, Support) | ⏳ |

---

## Content Structure

```
content/docs/
├── index.mdx
├── getting-started/          # v0.1.0
│   ├── quickstart.mdx
│   ├── authentication.mdx
│   └── first-notification.mdx
├── sdks/                     # v0.2.0
│   ├── node.mdx
│   ├── python.mdx
│   ├── php.mdx
│   └── go.mdx
├── channels/                 # v0.2.0
│   ├── sms.mdx
│   ├── telegram.mdx
│   ├── email.mdx
│   ├── push.mdx
│   └── whatsapp.mdx
├── features/                 # v0.2.0
│   ├── smart-routing.mdx
│   ├── templates.mdx
│   ├── otp.mdx
│   └── webhooks.mdx
├── api-reference/            # v0.3.0
│   └── [auto-generated]
├── providers/                # v0.4.0
│   └── [10 provider guides]
└── resources/                # v0.5.0
    ├── faq.mdx
    ├── changelog.mdx
    └── support.mdx
```

---

*Last updated: December 2025*
