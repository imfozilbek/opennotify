# @opennotify/dashboard Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] - 2025-12-14

### Added
- **Project Setup**
  - Vite 6 + React 18 + TypeScript configuration
  - Tailwind CSS 3.4 for styling
  - React Router DOM 7 for routing
  - Path aliases (`@/`) for clean imports

- **Authentication**
  - Login page with API key authentication
  - Register page for new merchant onboarding
  - AuthContext for state management
  - Protected routes with redirect to login
  - API key stored in localStorage

- **Layout**
  - Responsive sidebar navigation
  - Main layout with content area
  - Logout functionality

- **Dashboard Page**
  - Overview stats (connected providers, active channels)
  - Quick access to recent providers
  - Empty state for new accounts

- **Providers Page**
  - List of connected providers with masking
  - Connect provider modal with dynamic form fields
  - Provider deletion with confirmation
  - Support for all provider types:
    - SMS: Eskiz, PlayMobile, GetSMS
    - Telegram: Telegram Bot
    - Email: SMTP, SendGrid, Mailgun
    - Push: FCM, APNs
    - WhatsApp: WhatsApp Business

- **Notifications Page**
  - Paginated notification list
  - Status badges (pending, sent, delivered, failed)
  - Empty state for no notifications

- **API Integration**
  - Typed API client with error handling
  - Auto-redirect on 401 (invalid API key)
  - Endpoint modules: auth, providers, notifications

---

*Last updated: December 2025*
