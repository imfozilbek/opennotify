import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from "class-validator"
import { Type } from "class-transformer"

/**
 * Supported channels for templates.
 */
export enum ChannelDto {
    SMS = "SMS",
    TELEGRAM = "TELEGRAM",
    EMAIL = "EMAIL",
    PUSH = "PUSH",
    WHATSAPP = "WHATSAPP",
}

/**
 * Template variable definition.
 */
export class TemplateVariableDto {
    @IsString()
    name: string

    @IsBoolean()
    required: boolean

    @IsOptional()
    @IsString()
    defaultValue?: string

    @IsOptional()
    @IsString()
    description?: string
}

/**
 * DTO for creating a new template.
 */
export class CreateTemplateDto {
    @IsString()
    name: string

    @IsEnum(ChannelDto)
    channel: ChannelDto

    @IsString()
    body: string

    @IsOptional()
    @IsString()
    subject?: string

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TemplateVariableDto)
    variables?: TemplateVariableDto[]

    @IsOptional()
    @IsString()
    description?: string
}

/**
 * DTO for updating an existing template.
 */
export class UpdateTemplateDto {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    body?: string

    @IsOptional()
    @IsString()
    subject?: string

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TemplateVariableDto)
    variables?: TemplateVariableDto[]

    @IsOptional()
    @IsString()
    description?: string
}

/**
 * DTO for rendering a template.
 */
export class RenderTemplateDto {
    @IsString()
    templateId: string

    @IsObject()
    variables: Record<string, string>
}

/**
 * Query params for listing templates.
 */
export class ListTemplatesQueryDto {
    @IsOptional()
    @IsString()
    status?: string

    @IsOptional()
    @IsString()
    channel?: string

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
