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
    status: string
    channel: string
    provider: string
    recipient: string
    payload: {
        text: string
        subject?: string
    }
    createdAt: string
    sentAt?: string
    deliveredAt?: string
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
