# @opennotify/dashboard Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.2.0] - 2025-12-14

### Added
- **Templates Page**
  - List templates with grid layout
  - Filter by status (Draft, Active, Archived) and channel
  - Create template modal with variable editor
  - Edit template modal
  - Publish/Unpublish/Archive actions
  - Live preview with variable substitution
  - Delete with confirmation

- **Recipients Page**
  - Table view with contact info and available channels
  - Create/Edit recipient modal
  - Contact fields: phone, email, Telegram chat ID
  - Preferences: preferred channel, opted-out channels, language
  - Quiet hours configuration with timezone
  - Channel availability indicators
  - Delete with confirmation dialog

- **Send Notification**
  - Send button on Notifications page
  - Modal with two modes: Direct message and Template
  - Direct mode: channel, provider, recipient, message
  - Template mode: template selection, variable inputs, live preview
  - Provider selection filtered by channel

- **Delivery Tracking**
  - Click notification row to view details
  - Notification detail modal with delivery timeline
  - Status progression: Created → Sent → Delivered/Failed
  - Error message display for failed notifications
  - Message content preview

- **Reusable Components**
  - `StatusBadge` - notification/template status indicator
  - `ChannelBadge` - channel type badge with icon
  - `ConfirmDialog` - reusable delete confirmation
  - `TemplateCard` - template display with actions
  - `TemplateForm` - create/edit template modal
  - `RecipientForm` - create/edit recipient modal
  - `SendNotificationModal` - unified send form
  - `NotificationDetailModal` - delivery details view

- **Navigation**
  - Added Templates page to sidebar
  - Added Recipients page to sidebar

- **API Client**
  - Templates API: list, get, create, update, delete, publish, unpublish, archive, render
  - Recipients API: list, get, create, update, delete, linkTelegram
  - Added `apiPut` function to client

- **Types**
  - Template, TemplateVariable, TemplateStatus
  - Recipient, RecipientContacts, RecipientPreferences
  - Enhanced Notification with failedAt, errorMessage
  - Channel and status color mappings

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
