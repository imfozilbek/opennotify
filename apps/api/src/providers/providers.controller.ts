import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    UseGuards,
} from "@nestjs/common"
import { ApiKeyPermission, Merchant } from "@opennotify/core"
import { CurrentMerchant, RequirePermissions } from "../common/decorators"
import { ApiKeyGuard } from "../common/guards"
import { ConnectProviderDto } from "./dto/connect-provider.dto"
import { ConnectedProvider, ProvidersService } from "./providers.service"

interface ConnectResponse {
    success: boolean
    data?: {
        providerId: string
    }
    error?: {
        message: string
    }
}

interface ListResponse {
    success: boolean
    data: {
        providers: ConnectedProvider[]
    }
}

@Controller("providers")
@UseGuards(ApiKeyGuard)
export class ProvidersController {
    constructor(private readonly providersService: ProvidersService) {}

    @Post()
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async connect(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: ConnectProviderDto,
    ): Promise<ConnectResponse> {
        const result = await this.providersService.connect(merchant.id, dto)

        if (!result.success) {
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to connect provider",
                },
            }
        }

        return {
            success: true,
            data: {
                providerId: result.providerId ?? "",
            },
        }
    }

    @Get()
    @RequirePermissions(ApiKeyPermission.READ)
    async list(@CurrentMerchant() merchant: Merchant): Promise<ListResponse> {
        const providers = await this.providersService.listProviders(merchant.id)

        return {
            success: true,
            data: {
                providers,
            },
        }
    }

    @Delete(":id")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async delete(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") providerId: string,
    ): Promise<{ success: boolean }> {
        const deleted = await this.providersService.deleteProvider(merchant.id, providerId)

        if (!deleted) {
            throw new HttpException("Provider not found", HttpStatus.NOT_FOUND)
        }

        return { success: true }
    }
}
