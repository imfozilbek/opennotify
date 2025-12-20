import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
} from "@nestjs/common"
import { ApiKeyGuard } from "../common/guards"
import { CurrentMerchant, RequirePermissions } from "../common/decorators"
import { ApiKeyPermission, Merchant } from "@opennotify/core"
import { ApiKeysService } from "./api-keys.service"
import { ApiKeyListResponse, CreateApiKeyDto, CreateApiKeyResponse } from "./dto/api-key.dto"

@Controller("api-keys")
@UseGuards(ApiKeyGuard)
export class ApiKeysController {
    constructor(private readonly apiKeysService: ApiKeysService) {}

    /**
     * List all API keys for the current merchant.
     */
    @Get()
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async listApiKeys(@CurrentMerchant() merchant: Merchant): Promise<ApiKeyListResponse> {
        return this.apiKeysService.listApiKeys(merchant.id)
    }

    /**
     * Create a new API key.
     */
    @Post()
    @RequirePermissions(ApiKeyPermission.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createApiKey(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: CreateApiKeyDto,
    ): Promise<CreateApiKeyResponse> {
        return this.apiKeysService.createApiKey(merchant.id, dto)
    }

    /**
     * Revoke an API key.
     */
    @Delete(":id")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async revokeApiKey(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") keyId: string,
    ): Promise<void> {
        return this.apiKeysService.revokeApiKey(merchant.id, keyId)
    }
}
