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
| POST /auth/register | ✅ |
| API Key authentication middleware | ✅ |
| POST /providers — connect provider | ✅ |
| GET /providers — list connected providers | ✅ |
| DELETE /providers/:id — disconnect provider | ✅ |

---

## v0.3.0 — Templates ✅
> **Goal:** Template management

| Task | Status |
|------|--------|
| POST /templates | ✅ |
| GET /templates | ✅ |
| GET /templates/:id | ✅ |
| PUT /templates/:id | ✅ |
| DELETE /templates/:id | ✅ |
| POST /templates/:id/publish | ✅ |
| POST /templates/:id/unpublish | ✅ |
| POST /templates/:id/archive | ✅ |
| POST /templates/render | ✅ |

---

## v0.4.0 — Recipients ✅
> **Goal:** Contact management

| Task | Status |
|------|--------|
| POST /recipients | ✅ |
| GET /recipients | ✅ |
| GET /recipients/:id | ✅ |
| PUT /recipients/:id | ✅ |
| DELETE /recipients/:id | ✅ |
| POST /recipients/:id/link-telegram | ✅ |

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
