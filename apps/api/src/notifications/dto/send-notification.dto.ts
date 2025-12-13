import { IsEnum, IsObject, IsOptional, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"

export enum ChannelDto {
    SMS = "SMS",
    TELEGRAM = "TELEGRAM",
    EMAIL = "EMAIL",
    PUSH = "PUSH",
    WHATSAPP = "WHATSAPP",
}

export enum ProviderDto {
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

export class RecipientDto {
    @IsOptional()
    @IsString()
    phone?: string

    @IsOptional()
    @IsString()
    email?: string

    @IsOptional()
    @IsString()
    telegramChatId?: string

    @IsOptional()
    @IsString()
    deviceToken?: string
}

export class PayloadDto {
    @IsString()
    text: string

    @IsOptional()
    @IsString()
    subject?: string

    @IsOptional()
    @IsString()
    templateId?: string

    @IsOptional()
    @IsObject()
    variables?: Record<string, string>
}

export class SendNotificationDto {
    @IsEnum(ProviderDto)
    provider: ProviderDto

    @ValidateNested()
    @Type(() => RecipientDto)
    recipient: RecipientDto

    @ValidateNested()
    @Type(() => PayloadDto)
    payload: PayloadDto
}
