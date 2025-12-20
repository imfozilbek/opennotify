import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from "class-validator"
import { Type } from "class-transformer"

/**
 * Supported channels.
 */
export enum ChannelDto {
    SMS = "SMS",
    TELEGRAM = "TELEGRAM",
    EMAIL = "EMAIL",
    PUSH = "PUSH",
    WHATSAPP = "WHATSAPP",
}

/**
 * Supported message types.
 */
export enum MessageTypeDto {
    OTP = "OTP",
    TRANSACTIONAL = "TRANSACTIONAL",
    MARKETING = "MARKETING",
    ALERT = "ALERT",
}

/**
 * Routing strategy types.
 */
export enum RoutingStrategyTypeDto {
    COST_OPTIMIZED = "cost_optimized",
    RELIABILITY_FIRST = "reliability_first",
    RECIPIENT_PREFERENCE = "recipient_preference",
    CHANNEL_PREFERENCE = "channel_preference",
}

/**
 * Time window definition.
 */
export class TimeWindowDto {
    @IsString()
    start: string

    @IsString()
    end: string

    @IsString()
    timezone: string
}

/**
 * Routing conditions DTO.
 */
export class RoutingConditionsDto {
    @IsOptional()
    @IsArray()
    @IsEnum(MessageTypeDto, { each: true })
    messageTypes?: MessageTypeDto[]

    @IsOptional()
    @IsArray()
    @IsEnum(ChannelDto, { each: true })
    allowedChannels?: ChannelDto[]

    @IsOptional()
    @IsArray()
    @IsEnum(ChannelDto, { each: true })
    excludedChannels?: ChannelDto[]

    @IsOptional()
    @ValidateNested()
    @Type(() => TimeWindowDto)
    activeTimeWindow?: TimeWindowDto

    @IsOptional()
    @ValidateNested()
    @Type(() => TimeWindowDto)
    quietHours?: TimeWindowDto
}

/**
 * Routing strategy DTO.
 */
export class RoutingStrategyDto {
    @IsEnum(RoutingStrategyTypeDto)
    type: RoutingStrategyTypeDto

    @IsOptional()
    @IsArray()
    @IsEnum(ChannelDto, { each: true })
    channels?: ChannelDto[]
}

/**
 * Retryable error types.
 */
export enum RetryableErrorTypeDto {
    TIMEOUT = "timeout",
    RATE_LIMIT = "rate_limit",
    SERVER_ERROR = "server_error",
    CONNECTION_ERROR = "connection_error",
}

/**
 * Retry policy DTO.
 */
export class RetryPolicyDto {
    @IsInt()
    @Min(0)
    @Max(10)
    maxRetries: number

    @IsInt()
    @Min(100)
    baseDelayMs: number

    @IsInt()
    @Min(100)
    maxDelayMs: number

    @IsOptional()
    @IsArray()
    @IsEnum(RetryableErrorTypeDto, { each: true })
    retryableErrors?: RetryableErrorTypeDto[]
}

/**
 * DTO for creating a new routing rule.
 */
export class CreateRoutingRuleDto {
    @IsString()
    name: string

    @IsInt()
    @Min(1)
    @Max(999)
    priority: number

    @IsObject()
    @ValidateNested()
    @Type(() => RoutingConditionsDto)
    conditions: RoutingConditionsDto

    @IsObject()
    @ValidateNested()
    @Type(() => RoutingStrategyDto)
    strategy: RoutingStrategyDto

    @IsInt()
    @Min(1)
    @Max(10)
    maxAttempts: number

    @IsBoolean()
    enabled: boolean

    @IsOptional()
    @ValidateNested()
    @Type(() => RetryPolicyDto)
    retryPolicy?: RetryPolicyDto
}

/**
 * DTO for updating an existing routing rule.
 */
export class UpdateRoutingRuleDto {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(999)
    priority?: number

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => RoutingConditionsDto)
    conditions?: RoutingConditionsDto

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => RoutingStrategyDto)
    strategy?: RoutingStrategyDto

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(10)
    maxAttempts?: number

    @IsOptional()
    @IsBoolean()
    enabled?: boolean

    @IsOptional()
    @ValidateNested()
    @Type(() => RetryPolicyDto)
    retryPolicy?: RetryPolicyDto
}

/**
 * Query params for listing routing rules.
 */
export class ListRoutingRulesQueryDto {
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    includeDefaults?: boolean

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    enabled?: boolean
}
