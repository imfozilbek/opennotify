# @opennotify/api Roadmap

## Overview

NestJS-based Platform API for OpenNotify.

---

## v0.1.0 — Basic API
> **Goal:** Send notifications via API

| Task | Status |
|------|--------|
| NestJS project setup | ✅ |
| POST /send endpoint | ✅ |
| GET /notifications/:id endpoint | ✅ |
| GET /notifications/:id/status endpoint | ✅ |
| POST /otp/send endpoint | ✅ |
| POST /otp/verify endpoint | ✅ |
| Basic error handling | ✅ |

---

## v0.2.0 — Merchant Onboarding
> **Goal:** Multi-tenant support

| Task | Status |
|------|--------|
| POST /auth/register | ⏳ |
| POST /auth/login | ⏳ |
| API Key authentication middleware | ⏳ |
| POST /providers — connect provider | ⏳ |
| GET /providers — list connected providers | ⏳ |

---

## v0.3.0 — OTP & Templates
> **Goal:** OTP service and templates

| Task | Status |
|------|--------|
| POST /otp/send | ⏳ |
| POST /otp/verify | ⏳ |
| POST /templates | ⏳ |
| GET /templates | ⏳ |
| PUT /templates/:id | ⏳ |
| DELETE /templates/:id | ⏳ |

---

## v0.4.0 — Recipients & Routing
> **Goal:** Contact management

| Task | Status |
|------|--------|
| POST /recipients | ⏳ |
| GET /recipients | ⏳ |
| PUT /recipients/:id | ⏳ |
| POST /routing-rules | ⏳ |
| GET /routing-rules | ⏳ |

---

## v0.5.0 — Analytics & Logs
> **Goal:** Visibility and insights

| Task | Status |
|------|--------|
| GET /analytics/summary | ⏳ |
| GET /analytics/by-channel | ⏳ |
| GET /logs/notifications | ⏳ |
| GET /logs/webhooks | ⏳ |

---

*Last updated: December 2025*
