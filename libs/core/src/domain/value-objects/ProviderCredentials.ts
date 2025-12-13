import * as crypto from "crypto"
import { Provider } from "./Provider"

/**
 * Eskiz SMS provider credentials.
 */
export interface EskizCredentials {
    provider: typeof Provider.ESKIZ
    email: string
    password: string
    from: string
}

/**
 * PlayMobile SMS provider credentials.
 */
export interface PlayMobileCredentials {
    provider: typeof Provider.PLAYMOBILE
    login: string
    password: string
    from: string
}

/**
 * GetSMS provider credentials.
 */
export interface GetSmsCredentials {
    provider: typeof Provider.GETSMS
    login: string
    password: string
    from: string
}

/**
 * Telegram Bot credentials.
 */
export interface TelegramBotCredentials {
    provider: typeof Provider.TELEGRAM_BOT
    botToken: string
}

/**
 * SMTP email credentials.
 */
export interface SmtpCredentials {
    provider: typeof Provider.SMTP
    host: string
    port: number
    username: string
    password: string
    from: string
    fromName?: string
    secure?: boolean
}

/**
 * SendGrid email credentials.
 */
export interface SendGridCredentials {
    provider: typeof Provider.SENDGRID
    apiKey: string
    from: string
    fromName?: string
}

/**
 * Mailgun email credentials.
 */
export interface MailgunCredentials {
    provider: typeof Provider.MAILGUN
    apiKey: string
    domain: string
    from: string
    fromName?: string
}

/**
 * Firebase Cloud Messaging credentials.
 */
export interface FcmCredentials {
    provider: typeof Provider.FCM
    projectId: string
    privateKey: string
    clientEmail: string
}

/**
 * Apple Push Notification Service credentials.
 */
export interface ApnsCredentials {
    provider: typeof Provider.APNS
    keyId: string
    teamId: string
    privateKey: string
    bundleId: string
    production?: boolean
}

/**
 * WhatsApp Business API credentials.
 */
export interface WhatsAppCredentials {
    provider: typeof Provider.WHATSAPP_BUSINESS
    phoneNumberId: string
    accessToken: string
    businessAccountId: string
}

/**
 * Union type of all provider credentials.
 */
export type ProviderCredentialsData =
    | EskizCredentials
    | PlayMobileCredentials
    | GetSmsCredentials
    | TelegramBotCredentials
    | SmtpCredentials
    | SendGridCredentials
    | MailgunCredentials
    | FcmCredentials
    | ApnsCredentials
    | WhatsAppCredentials

/**
 * Encrypted provider credentials for storage.
 */
export interface EncryptedCredentials {
    provider: Provider
    encryptedData: string
    iv: string
    authTag: string
}

/**
 * Provider credentials value object.
 * Handles encryption/decryption of sensitive provider credentials.
 *
 * @example
 * ```typescript
 * // Create credentials for Eskiz
 * const credentials = ProviderCredentials.create({
 *     provider: "ESKIZ",
 *     email: "merchant@example.com",
 *     password: "secret",
 *     from: "BrandName",
 * })
 *
 * // Encrypt for storage
 * const encrypted = credentials.encrypt(encryptionKey)
 *
 * // Decrypt from storage
 * const decrypted = ProviderCredentials.decrypt(encrypted, encryptionKey)
 * ```
 */
export class ProviderCredentials {
    private readonly _data: ProviderCredentialsData

    private constructor(data: ProviderCredentialsData) {
        this._data = data
    }

    /**
     * Create provider credentials.
     */
    static create(data: ProviderCredentialsData): ProviderCredentials {
        return new ProviderCredentials(data)
    }

    /**
     * Decrypt credentials from encrypted storage.
     */
    static decrypt(encrypted: EncryptedCredentials, key: string): ProviderCredentials {
        const decipher = crypto.createDecipheriv(
            "aes-256-gcm",
            Buffer.from(key, "hex"),
            Buffer.from(encrypted.iv, "hex"),
        )
        decipher.setAuthTag(Buffer.from(encrypted.authTag, "hex"))

        let decrypted = decipher.update(encrypted.encryptedData, "hex", "utf8")
        decrypted += decipher.final("utf8")

        const data = JSON.parse(decrypted) as ProviderCredentialsData
        return new ProviderCredentials(data)
    }

    /**
     * Get the provider type.
     */
    get provider(): Provider {
        return this._data.provider
    }

    /**
     * Get raw credentials data.
     * Use with caution - contains sensitive information.
     */
    get data(): ProviderCredentialsData {
        return { ...this._data } as ProviderCredentialsData
    }

    /**
     * Encrypt credentials for storage.
     */
    encrypt(key: string): EncryptedCredentials {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv)

        const plaintext = JSON.stringify(this._data)
        let encrypted = cipher.update(plaintext, "utf8", "hex")
        encrypted += cipher.final("hex")

        const authTag = cipher.getAuthTag()

        return {
            provider: this._data.provider,
            encryptedData: encrypted,
            iv: iv.toString("hex"),
            authTag: authTag.toString("hex"),
        }
    }

    /**
     * Get credentials as specific type.
     */
    asEskiz(): EskizCredentials | null {
        if (this._data.provider === Provider.ESKIZ) {
            return this._data
        }
        return null
    }

    asTelegram(): TelegramBotCredentials | null {
        if (this._data.provider === Provider.TELEGRAM_BOT) {
            return this._data
        }
        return null
    }

    asSendGrid(): SendGridCredentials | null {
        if (this._data.provider === Provider.SENDGRID) {
            return this._data
        }
        return null
    }

    asSmtp(): SmtpCredentials | null {
        if (this._data.provider === Provider.SMTP) {
            return this._data
        }
        return null
    }

    /**
     * Mask sensitive data for logging.
     */
    toMasked(): Record<string, unknown> {
        const masked: Record<string, unknown> = {
            provider: this._data.provider,
        }

        // Add non-sensitive fields based on provider
        switch (this._data.provider) {
            case Provider.ESKIZ:
                masked.email = this._data.email
                masked.from = this._data.from
                break
            case Provider.TELEGRAM_BOT:
                masked.botToken = `***${this._data.botToken.slice(-4)}`
                break
            case Provider.SENDGRID:
                masked.from = this._data.from
                break
            case Provider.SMTP:
                masked.host = this._data.host
                masked.from = this._data.from
                break
        }

        return masked
    }
}
