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

// ============ API Keys Types ============
export type ApiKeyPermission = "read" | "write" | "admin"

export interface ApiKey {
    id: string
    name: string
    keyPrefix: string
    permissions: ApiKeyPermission[]
    isActive: boolean
    expiresAt?: string
    lastUsedAt?: string
    createdAt: string
}

export interface CreateApiKeyRequest {
    name: string
    permissions: ApiKeyPermission[]
    expiresAt?: string
}

export interface ApiKeyListData {
    apiKeys: ApiKey[]
    total: number
}

export interface CreateApiKeyData {
    apiKey: ApiKey
    rawKey: string
}

// ============ Webhook Logs Types ============
export type WebhookStatus = "SUCCESS" | "FAILED" | "PENDING" | "INVALID_SIGNATURE"

export const WEBHOOK_STATUS_COLORS: Record<WebhookStatus, string> = {
    SUCCESS: "green",
    FAILED: "red",
    PENDING: "yellow",
    INVALID_SIGNATURE: "orange",
}

export const WEBHOOK_STATUS_LABELS: Record<WebhookStatus, string> = {
    SUCCESS: "Success",
    FAILED: "Failed",
    PENDING: "Pending",
    INVALID_SIGNATURE: "Invalid Signature",
}

export interface WebhookLog {
    id: string
    provider: string
    status: string
    notificationId?: string
    externalId?: string
    notificationStatus?: string
    errorMessage?: string
    processingTimeMs: number
    ipAddress?: string
    createdAt: string
}

export interface WebhookLogsQuery {
    provider?: ProviderType[]
    status?: WebhookStatus[]
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
}

export interface WebhookLogsData {
    logs: WebhookLog[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

// ============ Settings Types ============
// Matches the API response from GET /settings
export interface MerchantSettings {
    // General
    companyName: string | null
    country: string | null
    timezone: string | null
    defaultLanguage: string | null

    // Notification
    defaultSmsSender: string | null
    defaultEmailFrom: string | null
    webhookUrl: string | null
    webhookSecret: string | null
    rateLimitPerMinute: number | null
    rateLimitPerDay: number | null
    retryAttempts: number | null
    retryDelaySeconds: number | null

    // Security
    twoFactorEnabled: boolean
    sessionTimeoutMinutes: number | null
    ipWhitelist: string[]

    // Branding
    logoUrl: string | null
    primaryColor: string | null
    accentColor: string | null
}

// Matches the DTO for PUT /settings
export interface UpdateSettingsRequest {
    // General
    companyName?: string
    country?: string
    timezone?: string
    defaultLanguage?: string

    // Notification
    defaultSmsSender?: string
    defaultEmailFrom?: string
    webhookUrl?: string
    webhookSecret?: string
    rateLimitPerMinute?: number
    rateLimitPerDay?: number
    retryAttempts?: number
    retryDelaySeconds?: number

    // Security
    twoFactorEnabled?: boolean
    sessionTimeoutMinutes?: number
    ipWhitelist?: string[]

    // Branding
    logoUrl?: string
    primaryColor?: string
    accentColor?: string
}

export const TIMEZONE_OPTIONS = [
    { value: "Asia/Tashkent", label: "Tashkent (UTC+5)" },
    { value: "Asia/Almaty", label: "Almaty (UTC+6)" },
    { value: "Asia/Bishkek", label: "Bishkek (UTC+6)" },
    { value: "Asia/Dushanbe", label: "Dushanbe (UTC+5)" },
    { value: "Asia/Ashgabat", label: "Ashgabat (UTC+5)" },
    { value: "Europe/Moscow", label: "Moscow (UTC+3)" },
    { value: "UTC", label: "UTC" },
]

export const LANGUAGE_OPTIONS = [
    { value: "uz", label: "O'zbek" },
    { value: "ru", label: "Русский" },
    { value: "en", label: "English" },
]

export const COUNTRY_OPTIONS = [
    { value: "UZ", label: "Uzbekistan" },
    { value: "KZ", label: "Kazakhstan" },
    { value: "KG", label: "Kyrgyzstan" },
    { value: "TJ", label: "Tajikistan" },
    { value: "TM", label: "Turkmenistan" },
]

// ============ Routing Rules Types ============
export type MessageType = "OTP" | "MARKETING" | "TRANSACTIONAL" | "ALERT"

export const MESSAGE_TYPE_LABELS: Record<MessageType, string> = {
    OTP: "OTP",
    MARKETING: "Marketing",
    TRANSACTIONAL: "Transactional",
    ALERT: "Alert",
}

export const MESSAGE_TYPE_COLORS: Record<MessageType, string> = {
    OTP: "purple",
    MARKETING: "pink",
    TRANSACTIONAL: "blue",
    ALERT: "red",
}

export type RoutingStrategyType =
    | "cost_optimized"
    | "reliability_first"
    | "recipient_preference"
    | "channel_preference"

export const ROUTING_STRATEGY_LABELS: Record<RoutingStrategyType, string> = {
    cost_optimized: "Cost Optimized",
    reliability_first: "Reliability First",
    recipient_preference: "Recipient Preference",
    channel_preference: "Channel Preference",
}

export const ROUTING_STRATEGY_COLORS: Record<RoutingStrategyType, string> = {
    cost_optimized: "green",
    reliability_first: "blue",
    recipient_preference: "purple",
    channel_preference: "orange",
}

export const ROUTING_STRATEGY_ICONS: Record<RoutingStrategyType, string> = {
    cost_optimized: "$",
    reliability_first: "shield",
    recipient_preference: "user",
    channel_preference: "list",
}

export type RetryableErrorType = "timeout" | "rate_limit" | "server_error" | "connection_error"

export const RETRYABLE_ERROR_LABELS: Record<RetryableErrorType, string> = {
    timeout: "Timeout",
    rate_limit: "Rate Limit",
    server_error: "Server Error",
    connection_error: "Connection Error",
}

export interface TimeWindow {
    start: string // HH:mm format
    end: string // HH:mm format
    timezone: string
}

export interface RoutingConditions {
    messageTypes?: MessageType[]
    allowedChannels?: ChannelType[]
    excludedChannels?: ChannelType[]
    activeTimeWindow?: TimeWindow
    quietHours?: TimeWindow
}

export interface RoutingStrategy {
    type: RoutingStrategyType
    channels?: ChannelType[] // only for channel_preference
}

export interface RetryPolicy {
    maxRetries: number
    baseDelayMs: number
    maxDelayMs: number
    retryableErrors?: RetryableErrorType[]
}

export interface RoutingRule {
    id: string
    merchantId: string | null
    name: string
    priority: number
    conditions: RoutingConditions
    strategy: RoutingStrategy
    maxAttempts: number
    enabled: boolean
    retryPolicy?: RetryPolicy
    isSystemDefault: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateRoutingRuleRequest {
    name: string
    priority: number
    conditions: RoutingConditions
    strategy: RoutingStrategy
    maxAttempts: number
    enabled: boolean
    retryPolicy?: RetryPolicy
}

export interface UpdateRoutingRuleRequest {
    name?: string
    priority?: number
    enabled?: boolean
    conditions?: RoutingConditions
    strategy?: RoutingStrategy
    maxAttempts?: number
    retryPolicy?: RetryPolicy
}

export interface RoutingRulesListData {
    rules: RoutingRule[]
    merchantRulesCount: number
    systemDefaultsCount: number
}

export interface RoutingRuleData {
    rule: RoutingRule
}

// ============ Cost Analysis Types ============

export interface ProviderCostBreakdown {
    provider: string
    count: number
    cost: number
    pricePerMessage: number
}

export interface ChannelCostBreakdown {
    channel: string
    count: number
    actualCost: number
    potentialSmsCost: number
    savings: number
    savingsPercent: number
    providers: ProviderCostBreakdown[]
}

export interface CostAnalysis {
    totalNotifications: number
    totalCost: number
    potentialSmsCost: number
    totalSavings: number
    savingsPercent: number
    averageCostPerNotification: number
    byChannel: ChannelCostBreakdown[]
    currency: string
}

export interface CostAnalyticsData {
    costs: CostAnalysis
    dateRange: DateRange
}

export interface CostAnalyticsQuery {
    period?: AnalyticsPeriod
    startDate?: string
    endDate?: string
}
