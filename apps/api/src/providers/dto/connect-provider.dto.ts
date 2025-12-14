import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString } from "class-validator"

export enum ProviderTypeDto {
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

// Eskiz credentials
export class EskizCredentialsDto {
    @IsString()
    email: string

    @IsString()
    password: string

    @IsString()
    from: string
}

// Telegram Bot credentials
export class TelegramCredentialsDto {
    @IsString()
    botToken: string
}

// SMTP credentials
export class SmtpCredentialsDto {
    @IsString()
    host: string

    @IsNumber()
    port: number

    @IsString()
    username: string

    @IsString()
    password: string

    @IsString()
    from: string

    @IsOptional()
    @IsString()
    fromName?: string

    @IsOptional()
    @IsBoolean()
    secure?: boolean
}

// SendGrid credentials
export class SendGridCredentialsDto {
    @IsString()
    apiKey: string

    @IsString()
    from: string

    @IsOptional()
    @IsString()
    fromName?: string
}

// Generic credentials object for flexibility
export class ConnectProviderDto {
    @IsEnum(ProviderTypeDto)
    provider: ProviderTypeDto

    @IsObject()
    credentials: Record<string, unknown>
}
