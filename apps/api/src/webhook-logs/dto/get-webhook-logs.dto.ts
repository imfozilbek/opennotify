import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, Min } from "class-validator"
import { Transform, Type } from "class-transformer"

/**
 * Provider filter options.
 */
export enum ProviderFilterDto {
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

/**
 * Webhook status filter options.
 */
export enum WebhookStatusFilterDto {
    SUCCESS = "SUCCESS",
    INVALID_SIGNATURE = "INVALID_SIGNATURE",
    INVALID_PAYLOAD = "INVALID_PAYLOAD",
    NOTIFICATION_NOT_FOUND = "NOTIFICATION_NOT_FOUND",
    PROCESSING_ERROR = "PROCESSING_ERROR",
}

/**
 * Query params for webhook logs.
 */
export class GetWebhookLogsQueryDto {
    @IsOptional()
    @IsArray()
    @IsEnum(ProviderFilterDto, { each: true })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === "string" ? [value] : (value as ProviderFilterDto[]),
    )
    provider?: ProviderFilterDto[]

    @IsOptional()
    @IsArray()
    @IsEnum(WebhookStatusFilterDto, { each: true })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === "string" ? [value] : (value as WebhookStatusFilterDto[]),
    )
    status?: WebhookStatusFilterDto[]

    @IsOptional()
    @IsDateString()
    startDate?: string

    @IsOptional()
    @IsDateString()
    endDate?: string

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number
}
