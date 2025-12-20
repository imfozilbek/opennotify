# @opennotify/node-sdk Roadmap

## Overview

Node.js/TypeScript SDK for OpenNotify Platform API.

---

## v0.1.0 — Foundation ✅
> **Goal:** Basic notification sending

| Task | Status |
|------|--------|
| OpenNotify client class | ✅ |
| send(options) method | ✅ |
| getNotification(id) method | ✅ |
| getStatus(id) method | ✅ |
| listNotifications(options) method | ✅ |
| TypeScript types | ✅ |
| OpenNotifyError class | ✅ |
| npm package setup | ✅ |

---

## v0.2.0 — OTP & Templates ✅
> **Goal:** OTP and templates support

| Task | Status |
|------|--------|
| otp.send(options) method | ✅ |
| otp.verify(options) method | ✅ |
| templates.create(options) | ✅ |
| templates.list() | ✅ |
| templates.get(id) | ✅ |
| templates.update(id) | ✅ |
| templates.delete(id) | ✅ |
| templates.publish(id) | ✅ |
| templates.unpublish(id) | ✅ |
| templates.archive(id) | ✅ |
| templates.render(options) | ✅ |

---

## v0.3.0 — Production Ready
> **Goal:** Production features

| Task | Status |
|------|--------|
| Webhook signature verification | ⏳ |
| Automatic retries with backoff | ⏳ |
| Request/response logging | ⏳ |
| Timeout configuration | ⏳ |
| Custom fetch implementation | ⏳ |

---

## v0.4.0 — Recipients & Routing
> **Goal:** Full API coverage

| Task | Status |
|------|--------|
| recipients.create(options) | ⏳ |
| recipients.list(filters) | ⏳ |
| recipients.update(id, options) | ⏳ |
| routing.getRules() | ⏳ |
| routing.setRules(rules) | ⏳ |

---

*Last updated: December 2025*
