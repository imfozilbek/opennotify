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

## v0.5.0 — Analytics & Logs ✅
> **Goal:** Visibility and insights

| Task | Status |
|------|--------|
| GET /analytics/summary | ✅ |
| GET /analytics/channels | ✅ |
| GET /analytics/logs | ✅ |

---

## v0.6.0 — Webhooks & Logs ✅
> **Goal:** Webhook management

| Task | Status |
|------|--------|
| GET /logs/webhooks | ✅ |
| POST /webhooks/:provider | ✅ |
| Webhook signature verification | ✅ |

---

## v0.7.0 — Push Notifications ✅
> **Goal:** Push notification support

| Task | Status |
|------|--------|
| FCM provider integration | ✅ |
| APNs provider integration | ✅ |
| MerchantProviderAdapter updates | ✅ |

---

## v0.8.0 — WhatsApp Business ✅
> **Goal:** WhatsApp channel support

| Task | Status |
|------|--------|
| WhatsApp Business adapter integration | ✅ |
| WhatsApp webhook handler | ✅ |
| MerchantProviderAdapter updates | ✅ |

---

## v0.9.0 — Team Management ✅
> **Goal:** Enterprise team features

| Task | Status |
|------|--------|
| Team entity and repository | ✅ |
| GET /teams — get team | ✅ |
| POST /teams — create team | ✅ |
| POST /teams/members — add member | ✅ |
| PUT /teams/members/:userId/role — update role | ✅ |
| DELETE /teams/members/:userId — remove member | ✅ |
| Role-based access control (RBAC) | ✅ |
| Audit logs for team actions | ✅ |

---

*Last updated: December 2025*
