import {
    IsArray,
    IsBoolean,
    IsIn,
    IsIP,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    Matches,
    Max,
    MaxLength,
    Min,
} from "class-validator"

/**
 * DTO for updating merchant settings.
 * All fields are optional - only provided fields will be updated.
 */
export class UpdateSettingsDto {
    // ─────────────────────────────────────────────────────────────
    // General Settings
    // ─────────────────────────────────────────────────────────────

    @IsOptional()
    @IsString()
    @MaxLength(100)
    companyName?: string

    @IsOptional()
    @IsString()
    @MaxLength(2)
    country?: string

    @IsOptional()
    @IsString()
    @MaxLength(50)
    timezone?: string

    @IsOptional()
    @IsString()
    @IsIn(["uz", "ru", "en"])
    defaultLanguage?: string

    // ─────────────────────────────────────────────────────────────
    // Notification Settings
    // ─────────────────────────────────────────────────────────────

    @IsOptional()
    @IsString()
    @MaxLength(20)
    defaultSmsSender?: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    defaultEmailFrom?: string

    @IsOptional()
    @IsString()
    @IsUrl()
    webhookUrl?: string

    @IsOptional()
    @IsString()
    @MaxLength(100)
    webhookSecret?: string

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(1000)
    rateLimitPerMinute?: number

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100000)
    rateLimitPerDay?: number

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(5)
    retryAttempts?: number

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(3600)
    retryDelaySeconds?: number

    // ─────────────────────────────────────────────────────────────
    // Security Settings
    // ─────────────────────────────────────────────────────────────

    @IsOptional()
    @IsBoolean()
    twoFactorEnabled?: boolean

    @IsOptional()
    @IsNumber()
    @Min(5)
    @Max(1440)
    sessionTimeoutMinutes?: number

    @IsOptional()
    @IsArray()
    @IsIP(undefined, { each: true })
    ipWhitelist?: string[]

    // ─────────────────────────────────────────────────────────────
    // Branding Settings
    // ─────────────────────────────────────────────────────────────

    @IsOptional()
    @IsString()
    @IsUrl()
    logoUrl?: string

    @IsOptional()
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, {
        message: "primaryColor must be a valid hex color (e.g., #3B82F6)",
    })
    primaryColor?: string

    @IsOptional()
    @IsString()
    @Matches(/^#[0-9A-Fa-f]{6}$/, {
        message: "accentColor must be a valid hex color (e.g., #10B981)",
    })
    accentColor?: string
}

/**
 * Response interface for settings.
 */
export interface SettingsResponse {
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
