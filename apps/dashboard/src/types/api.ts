export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: {
        message: string
    }
}

export interface RegisterRequest {
    name: string
    email: string
}

export interface RegisterData {
    merchantId: string
    apiKey: string
}

export enum ProviderType {
    ESKIZ = "ESKIZ",
    PLAYMOBILE = "PLAYMOBILE",
    GETSMS = "GETSMS",
    TELEGRAM_BOT = "TELEGRAM_BOT",
    SMTP = "SMTP",
    SENDGRID = "SENDGRID",
    MAILGUN = "MAILGUN",
    FCM = "FCM",
    APNS = "APNS",
    WHATSAPP_BUSINESS = "WHATSAPP_BUSINESS",
}

export interface ConnectedProvider {
    id: string
    provider: ProviderType
    createdAt: string
    maskedCredentials: Record<string, unknown>
}

export interface ConnectProviderRequest {
    provider: ProviderType
    credentials: Record<string, unknown>
}

export interface ConnectProviderData {
    providerId: string
}

export interface Notification {
    id: string
    status: NotificationStatus
    channel: ChannelType
    provider: string
    recipient: string
    payload: {
        text: string
        subject?: string
    }
    createdAt: string
    sentAt?: string
    deliveredAt?: string
    failedAt?: string
    errorMessage?: string
}

// Channel Types
export type ChannelType = "SMS" | "TELEGRAM" | "EMAIL" | "PUSH" | "WHATSAPP"

export const CHANNEL_LABELS: Record<ChannelType, string> = {
    SMS: "SMS",
    TELEGRAM: "Telegram",
    EMAIL: "Email",
    PUSH: "Push",
    WHATSAPP: "WhatsApp",
}

export const CHANNEL_COLORS: Record<ChannelType, string> = {
    SMS: "blue",
    TELEGRAM: "cyan",
    EMAIL: "purple",
    PUSH: "orange",
    WHATSAPP: "green",
}

// Notification Status
export type NotificationStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED"

export const STATUS_COLORS: Record<NotificationStatus, string> = {
    PENDING: "yellow",
    SENT: "blue",
    DELIVERED: "green",
    FAILED: "red",
}

// Template Types
export type TemplateStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"

export const TEMPLATE_STATUS_COLORS: Record<TemplateStatus, string> = {
    DRAFT: "gray",
    ACTIVE: "green",
    ARCHIVED: "yellow",
}

export interface TemplateVariable {
    name: string
    required: boolean
    defaultValue?: string
    description?: string
}

export interface Template {
    id: string
    merchantId: string
    name: string
    channel: ChannelType
    body: string
    subject?: string
    variables: TemplateVariable[]
    description?: string
    status: TemplateStatus
    createdAt: string
    updatedAt: string
}

export interface CreateTemplateRequest {
    name: string
    channel: ChannelType
    body: string
    subject?: string
    variables?: TemplateVariable[]
    description?: string
}

export interface UpdateTemplateRequest {
    name?: string
    body?: string
    subject?: string
    variables?: TemplateVariable[]
    description?: string
}

export interface RenderTemplateRequest {
    templateId: string
    variables: Record<string, string>
}

export interface TemplateListData {
    templates: Template[]
    total: number
    page: number
    limit: number
}

export interface RenderTemplateData {
    body: string
    subject?: string
}

// Recipient Types
export interface QuietHours {
    start: string
    end: string
    timezone: string
}

export interface RecipientPreferences {
    preferredChannel?: ChannelType
    optedOutChannels?: ChannelType[]
    quietHours?: QuietHours
    language?: string
}

export interface RecipientContacts {
    phone?: string
    email?: string
    telegramChatId?: string
    deviceTokens?: string[]
}

export interface Recipient {
    id: string
    merchantId: string
    externalId?: string
    contacts: RecipientContacts
    preferences: RecipientPreferences
    metadata: Record<string, unknown>
    createdAt: string
    updatedAt: string
}

export interface CreateRecipientRequest {
    externalId?: string
    phone?: string
    email?: string
    telegramChatId?: string
    deviceTokens?: string[]
    preferences?: RecipientPreferences
    metadata?: Record<string, unknown>
}

export interface UpdateRecipientRequest {
    externalId?: string
    phone?: string
    email?: string
    telegramChatId?: string
    deviceTokens?: string[]
    preferences?: RecipientPreferences
    metadata?: Record<string, unknown>
}

export interface LinkTelegramRequest {
    telegramChatId: string
}

export interface RecipientListData {
    recipients: Recipient[]
    total: number
    page: number
    limit: number
}

// Send Notification Types
export interface SendNotificationRequest {
    provider: ProviderType
    recipient: {
        phone?: string
        email?: string
        telegramChatId?: string
        deviceToken?: string
    }
    payload: {
        text: string
        subject?: string
        templateId?: string
        variables?: Record<string, string>
    }
}

export interface SendNotificationData {
    notificationId: string
}

export interface NotificationListData {
    notifications: Notification[]
    total: number
    page: number
    limit: number
}

export interface HealthData {
    status: string
    timestamp: string
    version: string
}

// Provider credential field definitions for dynamic forms
export interface ProviderFieldConfig {
    name: string
    type: "text" | "email" | "password" | "number" | "checkbox"
    label: string
    required: boolean
    placeholder?: string
}

export const PROVIDER_FIELDS: Record<ProviderType, ProviderFieldConfig[]> = {
    [ProviderType.ESKIZ]: [
        {
            name: "email",
            type: "email",
            label: "Email",
            required: true,
            placeholder: "your@email.com",
        },
        {
            name: "password",
            type: "password",
            label: "Password",
            required: true,
            placeholder: "••••••••",
        },
        {
            name: "from",
            type: "text",
            label: "Sender Name",
            required: true,
            placeholder: "MyCompany",
        },
    ],
    [ProviderType.TELEGRAM_BOT]: [
        {
            name: "botToken",
            type: "password",
            label: "Bot Token",
            required: true,
            placeholder: "123456:ABC-DEF...",
        },
    ],
    [ProviderType.SMTP]: [
        {
            name: "host",
            type: "text",
            label: "SMTP Host",
            required: true,
            placeholder: "smtp.gmail.com",
        },
        { name: "port", type: "number", label: "Port", required: true, placeholder: "587" },
        { name: "username", type: "text", label: "Username", required: true, placeholder: "user" },
        {
            name: "password",
            type: "password",
            label: "Password",
            required: true,
            placeholder: "••••••••",
        },
        {
            name: "from",
            type: "email",
            label: "From Email",
            required: true,
            placeholder: "noreply@example.com",
        },
        {
            name: "fromName",
            type: "text",
            label: "From Name",
            required: false,
            placeholder: "My App",
        },
        { name: "secure", type: "checkbox", label: "Use TLS/SSL", required: false },
    ],
    [ProviderType.SENDGRID]: [
        {
            name: "apiKey",
            type: "password",
            label: "API Key",
            required: true,
            placeholder: "SG.xxx...",
        },
        {
            name: "from",
            type: "email",
            label: "From Email",
            required: true,
            placeholder: "noreply@example.com",
        },
        {
            name: "fromName",
            type: "text",
            label: "From Name",
            required: false,
            placeholder: "My App",
        },
    ],
    [ProviderType.MAILGUN]: [
        {
            name: "apiKey",
            type: "password",
            label: "API Key",
            required: true,
            placeholder: "key-xxx...",
        },
        {
            name: "domain",
            type: "text",
            label: "Domain",
            required: true,
            placeholder: "mg.example.com",
        },
        {
            name: "from",
            type: "email",
            label: "From Email",
            required: true,
            placeholder: "noreply@example.com",
        },
    ],
    [ProviderType.PLAYMOBILE]: [
        { name: "login", type: "text", label: "Login", required: true, placeholder: "your_login" },
        {
            name: "password",
            type: "password",
            label: "Password",
            required: true,
            placeholder: "••••••••",
        },
        {
            name: "from",
            type: "text",
            label: "Sender Name",
            required: true,
            placeholder: "MyCompany",
        },
    ],
    [ProviderType.GETSMS]: [
        { name: "login", type: "text", label: "Login", required: true, placeholder: "your_login" },
        {
            name: "password",
            type: "password",
            label: "Password",
            required: true,
            placeholder: "••••••••",
        },
        {
            name: "from",
            type: "text",
            label: "Sender Name",
            required: true,
            placeholder: "MyCompany",
        },
    ],
    [ProviderType.FCM]: [
        {
            name: "projectId",
            type: "text",
            label: "Project ID",
            required: true,
            placeholder: "my-firebase-project",
        },
        {
            name: "privateKey",
            type: "password",
            label: "Private Key",
            required: true,
            placeholder: "-----BEGIN PRIVATE KEY-----...",
        },
        {
            name: "clientEmail",
            type: "email",
            label: "Client Email",
            required: true,
            placeholder: "firebase-adminsdk@project.iam.gserviceaccount.com",
        },
    ],
    [ProviderType.APNS]: [
        { name: "keyId", type: "text", label: "Key ID", required: true, placeholder: "ABCD1234" },
        { name: "teamId", type: "text", label: "Team ID", required: true, placeholder: "TEAM1234" },
        {
            name: "privateKey",
            type: "password",
            label: "Private Key (.p8)",
            required: true,
            placeholder: "-----BEGIN PRIVATE KEY-----...",
        },
        {
            name: "bundleId",
            type: "text",
            label: "Bundle ID",
            required: true,
            placeholder: "com.example.app",
        },
    ],
    [ProviderType.WHATSAPP_BUSINESS]: [
        {
            name: "phoneNumberId",
            type: "text",
            label: "Phone Number ID",
            required: true,
            placeholder: "123456789",
        },
        {
            name: "accessToken",
            type: "password",
            label: "Access Token",
            required: true,
            placeholder: "EAAx...",
        },
    ],
}

export const PROVIDER_LABELS: Record<ProviderType, string> = {
    [ProviderType.ESKIZ]: "Eskiz SMS",
    [ProviderType.PLAYMOBILE]: "PlayMobile SMS",
    [ProviderType.GETSMS]: "GetSMS",
    [ProviderType.TELEGRAM_BOT]: "Telegram Bot",
    [ProviderType.SMTP]: "SMTP Email",
    [ProviderType.SENDGRID]: "SendGrid",
    [ProviderType.MAILGUN]: "Mailgun",
    [ProviderType.FCM]: "Firebase Cloud Messaging",
    [ProviderType.APNS]: "Apple Push Notifications",
    [ProviderType.WHATSAPP_BUSINESS]: "WhatsApp Business",
}

export const PROVIDER_CHANNELS: Record<ProviderType, string> = {
    [ProviderType.ESKIZ]: "SMS",
    [ProviderType.PLAYMOBILE]: "SMS",
    [ProviderType.GETSMS]: "SMS",
    [ProviderType.TELEGRAM_BOT]: "Telegram",
    [ProviderType.SMTP]: "Email",
    [ProviderType.SENDGRID]: "Email",
    [ProviderType.MAILGUN]: "Email",
    [ProviderType.FCM]: "Push",
    [ProviderType.APNS]: "Push",
    [ProviderType.WHATSAPP_BUSINESS]: "WhatsApp",
}

// Analytics Types
export enum AnalyticsPeriod {
    TODAY = "today",
    THIS_WEEK = "this_week",
    THIS_MONTH = "this_month",
    LAST_7_DAYS = "last_7_days",
    LAST_30_DAYS = "last_30_days",
}

export const PERIOD_LABELS: Record<AnalyticsPeriod, string> = {
    [AnalyticsPeriod.TODAY]: "Today",
    [AnalyticsPeriod.THIS_WEEK]: "This Week",
    [AnalyticsPeriod.THIS_MONTH]: "This Month",
    [AnalyticsPeriod.LAST_7_DAYS]: "Last 7 Days",
    [AnalyticsPeriod.LAST_30_DAYS]: "Last 30 Days",
}

export interface AnalyticsSummary {
    total: number
    pending: number
    sent: number
    delivered: number
    failed: number
    processed: number
    deliveryRate: number
    failureRate: number
    successRate: number
}

export interface ChannelStats {
    channel: ChannelType
    total: number
    pending: number
    sent: number
    delivered: number
    failed: number
    processed: number
    deliveryRate: number
    failureRate: number
    successRate: number
}

export interface DateRange {
    startDate: string
    endDate: string
}

export interface AnalyticsSummaryData {
    stats: AnalyticsSummary
    dateRange: DateRange
}

export interface AnalyticsChannelsData {
    channels: ChannelStats[]
    dateRange: DateRange
}

export interface LogEntry {
    id: string
    channel: ChannelType
    provider: string
    status: NotificationStatus
    recipient: string
    createdAt: string
    sentAt?: string
    deliveredAt?: string
    failedAt?: string
    errorMessage?: string
}

export interface AnalyticsLogsData {
    logs: LogEntry[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export interface AnalyticsSummaryQuery {
    period?: AnalyticsPeriod
    startDate?: string
    endDate?: string
}

export interface AnalyticsLogsQuery {
    status?: NotificationStatus[]
    channel?: ChannelType[]
    provider?: ProviderType[]
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
}

// Team Types
export type TeamRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"

export const ROLE_LABELS: Record<TeamRole, string> = {
    OWNER: "Owner",
    ADMIN: "Admin",
    MEMBER: "Member",
    VIEWER: "Viewer",
}

export const ROLE_COLORS: Record<TeamRole, string> = {
    OWNER: "purple",
    ADMIN: "blue",
    MEMBER: "green",
    VIEWER: "gray",
}

export interface TeamMember {
    userId: string
    email: string
    name: string
    role: TeamRole
    joinedAt: string
    invitedBy?: string
}

export interface Team {
    id: string
    merchantId: string
    name: string
    members: TeamMember[]
    memberCount: number
    createdAt: string
    updatedAt: string
}

export interface CreateTeamRequest {
    name: string
}

export interface AddMemberRequest {
    email: string
    name: string
    role: TeamRole
}

export interface UpdateMemberRoleRequest {
    role: TeamRole
}

// Audit Log Types
export type AuditAction =
    | "TEAM_CREATED"
    | "TEAM_UPDATED"
    | "TEAM_DELETED"
    | "MEMBER_ADDED"
    | "MEMBER_REMOVED"
    | "MEMBER_ROLE_CHANGED"
    | "OWNERSHIP_TRANSFERRED"
    | "PROVIDER_CONNECTED"
    | "PROVIDER_DISCONNECTED"
    | "API_KEY_CREATED"
    | "API_KEY_REVOKED"
    | "SETTINGS_UPDATED"

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
    TEAM_CREATED: "Team Created",
    TEAM_UPDATED: "Team Updated",
    TEAM_DELETED: "Team Deleted",
    MEMBER_ADDED: "Member Added",
    MEMBER_REMOVED: "Member Removed",
    MEMBER_ROLE_CHANGED: "Role Changed",
    OWNERSHIP_TRANSFERRED: "Ownership Transferred",
    PROVIDER_CONNECTED: "Provider Connected",
    PROVIDER_DISCONNECTED: "Provider Disconnected",
    API_KEY_CREATED: "API Key Created",
    API_KEY_REVOKED: "API Key Revoked",
    SETTINGS_UPDATED: "Settings Updated",
}

export interface AuditLog {
    id: string
    action: AuditAction
    actorId: string
    actorEmail: string
    targetId?: string
    targetType?: string
    details: Record<string, unknown>
    description: string
    createdAt: string
}

export interface AuditLogsQuery {
    action?: AuditAction
    actorId?: string
    targetId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
}

export interface PaginatedAuditLogs {
    logs: AuditLog[]
    total: number
    page: number
    limit: number
    totalPages: number
}
