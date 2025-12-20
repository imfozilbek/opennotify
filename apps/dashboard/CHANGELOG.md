# @opennotify/dashboard Changelog

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.6.0] - 2025-12-20

### Added
- **Routing Rules Page**
  - View merchant rules and system defaults
  - Create new routing rules
  - Edit existing rules
  - Delete rules with confirmation
  - Enable/disable toggle for rules

- **Routing Rule Components**
  - `RoutingRuleCard` - display rule with conditions, strategy, and actions
  - `RoutingRuleForm` - modal form for create/edit
  - `StrategyBadge` - color-coded strategy indicator
  - `ChannelSelector` - multi-select for channels
  - `TimeWindowInput` - time range picker with timezone

- **Form Features**
  - Basic info: name, priority, enabled toggle
  - Conditions: message types, allowed/excluded channels, time windows
  - Strategy: cost optimized, reliability first, recipient preference, channel preference
  - Channel order for channel_preference strategy
  - Retry policy: max retries, delays, retryable errors

- **API Client**
  - `listRoutingRules()` - list rules with system defaults
  - `createRoutingRule()` - create new rule
  - `updateRoutingRule()` - update existing rule
  - `deleteRoutingRule()` - delete rule
  - `toggleRoutingRule()` - enable/disable rule

- **Types**
  - `RoutingRule`, `RoutingConditions`, `RoutingStrategy`
  - `TimeWindow`, `RetryPolicy`
  - `MessageType`, `RoutingStrategyType`, `RetryableErrorType`
  - Label and color mappings for UI

---

## [0.5.2] - 2025-12-20

### Added
- **Settings Page**
  - Tab-based navigation: General, Notifications, Security, Branding
  - Save changes button with loading state
  - Success/error notifications

- **General Settings Tab**
  - Company name input
  - Country selector (Central Asian countries)
  - Timezone selector (Central Asian timezones)
  - Default language selector (Uzbek, Russian, English)

- **Notification Settings Tab**
  - Default SMS sender name
  - Default email from address
  - Webhook URL and secret configuration
  - Rate limits (per minute, per day)
  - Retry settings (attempts, delay)

- **Security Settings Tab**
  - Two-factor authentication toggle
  - Session timeout configuration
  - IP whitelist management (add/remove)

- **Branding Settings Tab**
  - Logo URL with live preview
  - Primary color picker with hex input
  - Accent color picker with hex input
  - Color preview squares

- **API Client**
  - `getSettings()` - fetch merchant settings
  - `updateSettings()` - update merchant settings

- **Types**
  - Updated `MerchantSettings` to match API response
  - Added `UpdateSettingsRequest` for PUT requests
  - Added `TIMEZONE_OPTIONS`, `LANGUAGE_OPTIONS`, `COUNTRY_OPTIONS` constants

---

## [0.5.1] - 2025-12-20

### Added
- **Webhook Logs Page**
  - View incoming webhook events from providers
  - Paginated table with provider, status, notification ID, processing time, timestamp
  - Color-coded status badges (Success, Failed, Invalid Signature, etc.)
  - Filter by provider (Eskiz, PlayMobile, Telegram, etc.)
  - Filter by status (Success, Failed, Pending, Invalid Signature)
  - Filter by date range
  - Clear all filters button

- **Webhook Log Detail Modal**
  - View full webhook details
  - Shows notification ID, external ID, notification status
  - Processing time, IP address
  - Error message for failed webhooks

- **Webhook Components**
  - `WebhookLogTable` - paginated webhook log display
  - `WebhookLogFilters` - multi-select filters with chip buttons
  - `WebhookLogModal` - detailed webhook information view

- **API Client**
  - `getWebhookLogs()` - fetch webhook logs with filtering

- **Navigation**
  - Added Webhook Logs page to sidebar

---

## [0.5.0] - 2025-12-20

### Added
- **API Keys Page**
  - List all API keys with masked key prefix
  - Create new API key with name, permissions, and expiration
  - Copy key prefix to clipboard
  - Revoke API key with confirmation
  - View last used date and expiration

- **API Key Created Modal**
  - Shows full raw key only once after creation
  - Copy to clipboard button
  - Warning about saving key securely

- **API Key Components**
  - `ApiKeyCard` - key display with masked value and actions
  - `CreateApiKeyForm` - modal form with permissions checkboxes
  - `ApiKeyCreatedModal` - one-time key display with copy

- **API Client**
  - `listApiKeys()` - fetch all API keys
  - `createApiKey()` - create new API key
  - `revokeApiKey()` - revoke API key

- **Types**
  - `ApiKey`, `ApiKeyPermission` types
  - `CreateApiKeyRequest`, `ApiKeyListData`, `CreateApiKeyData` interfaces

- **Navigation**
  - Added API Keys, Webhook Logs, Routing, Cost Analysis, Settings pages to sidebar
  - New routes: `/api-keys`, `/webhook-logs`, `/routing`, `/cost-analysis`, `/settings`

---

## [0.4.0] - 2025-12-20

### Added
- **Team Management Page**
  - View team members with roles (Owner, Admin, Member, Viewer)
  - Add new team members with role selection
  - Change member roles (based on current user's permissions)
  - Remove team members with confirmation
  - Role-based action visibility

- **Audit Logs**
  - View audit log history in dedicated tab
  - Paginated table with action, actor, description, and timestamp
  - Color-coded action badges
  - Time-ago formatting for timestamps

- **Team Components**
  - `TeamMemberCard` - member display with role badge and actions
  - `AddMemberForm` - modal form to invite new members
  - `UpdateRoleForm` - modal form to change member role
  - `AuditLogTable` - paginated audit log display
  - `RoleBadge` - color-coded role indicator

- **API Client**
  - `getTeam()` - fetch team data
  - `addMember()` - add new team member
  - `updateMemberRole()` - change member role
  - `removeMember()` - remove team member
  - `getAuditLogs()` - fetch audit logs with pagination

- **Types**
  - `TeamRole` type with OWNER, ADMIN, MEMBER, VIEWER
  - `Team`, `TeamMember` interfaces
  - `AuditAction`, `AuditLog` types
  - Role and action label/color mappings

- **Navigation**
  - Added Team page to sidebar

---

## [0.3.0] - 2025-12-18

### Added
- **Analytics Page**
  - Summary stats cards: Total, Delivered, Failed, Pending notifications
  - Delivery rate and failure rate percentages
  - Period selector: Today, This Week, This Month, Last 7 Days, Last 30 Days

- **Channel Breakdown**
  - Visual bar chart showing notification distribution by channel
  - Color-coded segments: green (delivered), blue (sent/pending), red (failed)
  - Per-channel statistics

- **Delivery Rate by Channel**
  - Progress bars showing delivery success rate per channel
  - Percentage display

- **Notification Logs**
  - Paginated table of recent notifications
  - Filter by status (Pending, Sent, Delivered, Failed)
  - Filter by channel (SMS, Telegram, Email, Push, WhatsApp)
  - Masked recipient information for privacy

- **API Client**
  - `getAnalyticsSummary()` - fetch aggregated statistics
  - `getAnalyticsByChannel()` - fetch per-channel breakdown
  - `getAnalyticsLogs()` - fetch notification logs with filters

- **Navigation**
  - Added Analytics page to sidebar

- **Types**
  - `AnalyticsPeriod` enum
  - `AnalyticsSummary`, `ChannelStats`, `LogEntry` interfaces
  - Query interfaces for API calls

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
