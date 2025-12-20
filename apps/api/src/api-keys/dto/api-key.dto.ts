import { IsArray, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator"
import { ApiKeyPermission } from "@opennotify/core"

export class CreateApiKeyDto {
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name: string

    @IsArray()
    @IsEnum(ApiKeyPermission, { each: true })
    permissions: ApiKeyPermission[]

    @IsOptional()
    @IsString()
    expiresAt?: string
}

export interface ApiKeyResponse {
    id: string
    name: string
    keyPrefix: string
    permissions: ApiKeyPermission[]
    isActive: boolean
    expiresAt: string | null
    lastUsedAt: string | null
    createdAt: string
}

export interface CreateApiKeyResponse {
    apiKey: ApiKeyResponse
    rawKey: string
}

export interface ApiKeyListResponse {
    apiKeys: ApiKeyResponse[]
    total: number
}
