# @opennotify/api Changelog

All notable changes to this package will be documented in this file.

---

## [Unreleased]

---

## [0.1.0] - 2025-12-14

### Added
- **NestJS Setup**
  - Main application entry point with global validation pipe
  - CORS enabled, API prefix `/api/v1`
- **Health Module**
  - `GET /health` endpoint for status checks
- **Notifications Module**
  - `POST /notifications/send` - Send notification via provider
  - `GET /notifications/:id` - Get notification details
  - `GET /notifications/:id/status` - Get delivery status
  - In-memory notification store (demo)
- **OTP Module**
  - `POST /otp/send` - Send OTP code
  - `POST /otp/verify` - Verify OTP code
  - Rate limiting and attempt tracking
  - In-memory OTP store (demo)
- **Provider Integration**
  - Eskiz SMS adapter (via env vars)
  - Telegram Bot adapter (via env vars)

---

*Last updated: December 2025*
