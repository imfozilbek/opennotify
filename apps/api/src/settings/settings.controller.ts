import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common"
import { ApiKeyGuard } from "../common/guards"
import { CurrentMerchant, RequirePermissions } from "../common/decorators"
import { ApiKeyPermission, Merchant } from "@opennotify/core"
import { SettingsService } from "./settings.service"
import { SettingsResponse, UpdateSettingsDto } from "./dto/settings.dto"

@Controller("settings")
@UseGuards(ApiKeyGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    /**
     * Get merchant settings.
     */
    @Get()
    @RequirePermissions(ApiKeyPermission.READ)
    async getSettings(@CurrentMerchant() merchant: Merchant): Promise<SettingsResponse> {
        return this.settingsService.getSettings(merchant.id)
    }

    /**
     * Update merchant settings.
     */
    @Put()
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async updateSettings(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: UpdateSettingsDto,
    ): Promise<SettingsResponse> {
        return this.settingsService.updateSettings(merchant.id, dto)
    }
}
