import {
    IsArray,
    IsEmail,
    IsEnum,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from "class-validator"
import { Type } from "class-transformer"
import { ChannelDto } from "../../templates/dto/template.dto"

/**
 * Quiet hours configuration.
 */
export class QuietHoursDto {
    @IsString()
    start: string // "22:00"

    @IsString()
    end: string // "08:00"

    @IsString()
    timezone: string // "Asia/Tashkent"
}

/**
 * Recipient preferences.
 */
export class RecipientPreferencesDto {
    @IsOptional()
    @IsEnum(ChannelDto)
    preferredChannel?: ChannelDto

    @IsOptional()
    @IsArray()
    @IsEnum(ChannelDto, { each: true })
    optedOutChannels?: ChannelDto[]

    @IsOptional()
    @ValidateNested()
    @Type(() => QuietHoursDto)
    quietHours?: QuietHoursDto

    @IsOptional()
    @IsString()
    language?: string
}

/**
 * DTO for creating a new recipient.
 */
export class CreateRecipientDto {
    @IsOptional()
    @IsString()
    externalId?: string

    @IsOptional()
    @IsString()
    phone?: string

    @IsOptional()
    @IsEmail()
    email?: string

    @IsOptional()
    @IsString()
    telegramChatId?: string

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    deviceTokens?: string[]

    @IsOptional()
    @ValidateNested()
    @Type(() => RecipientPreferencesDto)
    preferences?: RecipientPreferencesDto

    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>
}

/**
 * DTO for updating an existing recipient.
 */
export class UpdateRecipientDto {
    @IsOptional()
    @IsString()
    externalId?: string

    @IsOptional()
    @IsString()
    phone?: string

    @IsOptional()
    @IsEmail()
    email?: string

    @IsOptional()
    @IsString()
    telegramChatId?: string

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    deviceTokens?: string[]

    @IsOptional()
    @ValidateNested()
    @Type(() => RecipientPreferencesDto)
    preferences?: RecipientPreferencesDto

    @IsOptional()
    @IsObject()
    metadata?: Record<string, unknown>
}

/**
 * DTO for linking Telegram chat ID.
 */
export class LinkTelegramDto {
    @IsString()
    telegramChatId: string
}

/**
 * Query params for listing recipients.
 */
export class ListRecipientsQueryDto {
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
