import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, Min } from "class-validator"
import { Transform, Type } from "class-transformer"

/**
 * Analytics period presets.
 */
export enum AnalyticsPeriodDto {
    TODAY = "today",
    THIS_WEEK = "this_week",
    THIS_MONTH = "this_month",
    LAST_7_DAYS = "last_7_days",
    LAST_30_DAYS = "last_30_days",
}

/**
 * Channel filter options.
 */
export enum ChannelFilterDto {
    SMS = "SMS",
    TELEGRAM = "TELEGRAM",
    EMAIL = "EMAIL",
    PUSH = "PUSH",
    WHATSAPP = "WHATSAPP",
}

/**
 * Status filter options.
 */
export enum StatusFilterDto {
    PENDING = "PENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    FAILED = "FAILED",
}

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
 * Query params for analytics summary.
 */
export class GetAnalyticsSummaryQueryDto {
    @IsOptional()
    @IsEnum(AnalyticsPeriodDto)
    period?: AnalyticsPeriodDto

    @IsOptional()
    @IsDateString()
    startDate?: string

    @IsOptional()
    @IsDateString()
    endDate?: string
}

/**
 * Query params for analytics by channel.
 */
export class GetAnalyticsByChannelQueryDto {
    @IsOptional()
    @IsEnum(AnalyticsPeriodDto)
    period?: AnalyticsPeriodDto

    @IsOptional()
    @IsDateString()
    startDate?: string

    @IsOptional()
    @IsDateString()
    endDate?: string
}

/**
 * Query params for notification logs.
 */
export class GetNotificationLogsQueryDto {
    @IsOptional()
    @IsArray()
    @IsEnum(StatusFilterDto, { each: true })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === "string" ? [value] : (value as StatusFilterDto[]),
    )
    status?: StatusFilterDto[]

    @IsOptional()
    @IsArray()
    @IsEnum(ChannelFilterDto, { each: true })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === "string" ? [value] : (value as ChannelFilterDto[]),
    )
    channel?: ChannelFilterDto[]

    @IsOptional()
    @IsArray()
    @IsEnum(ProviderFilterDto, { each: true })
    @Transform(({ value }: { value: unknown }) =>
        typeof value === "string" ? [value] : (value as ProviderFilterDto[]),
    )
    provider?: ProviderFilterDto[]

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

/**
 * Query params for cost analytics.
 */
export class GetCostAnalyticsQueryDto {
    @IsOptional()
    @IsEnum(AnalyticsPeriodDto)
    period?: AnalyticsPeriodDto

    @IsOptional()
    @IsDateString()
    startDate?: string

    @IsOptional()
    @IsDateString()
    endDate?: string
}
