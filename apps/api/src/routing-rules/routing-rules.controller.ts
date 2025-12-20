import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common"
import { ApiKeyPermission, Merchant } from "@opennotify/core"
import { CurrentMerchant, RequirePermissions } from "../common/decorators"
import { ApiKeyGuard } from "../common/guards"
import {
    CreateRoutingRuleDto,
    ListRoutingRulesQueryDto,
    UpdateRoutingRuleDto,
} from "./dto/routing-rule.dto"
import { RoutingRuleResponse, RoutingRulesService } from "./routing-rules.service"

interface SingleResponse {
    success: boolean
    data?: {
        rule: RoutingRuleResponse
    }
    error?: {
        message: string
    }
}

interface ListResponse {
    success: boolean
    data: {
        rules: RoutingRuleResponse[]
        merchantRulesCount: number
        systemDefaultsCount: number
    }
}

@Controller("routing-rules")
@UseGuards(ApiKeyGuard)
export class RoutingRulesController {
    constructor(private readonly routingRulesService: RoutingRulesService) {}

    @Post()
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async create(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: CreateRoutingRuleDto,
    ): Promise<SingleResponse> {
        const result = await this.routingRulesService.create(merchant.id, dto)

        if (!result.success || !result.rule) {
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to create routing rule",
                },
            }
        }

        return {
            success: true,
            data: {
                rule: result.rule,
            },
        }
    }

    @Get()
    @RequirePermissions(ApiKeyPermission.READ)
    async list(
        @CurrentMerchant() merchant: Merchant,
        @Query() query: ListRoutingRulesQueryDto,
    ): Promise<ListResponse> {
        const result = await this.routingRulesService.list(merchant.id, {
            includeDefaults: query.includeDefaults,
            enabled: query.enabled,
        })

        return {
            success: true,
            data: result,
        }
    }

    @Get(":id")
    @RequirePermissions(ApiKeyPermission.READ)
    async getById(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") id: string,
    ): Promise<SingleResponse> {
        const rule = await this.routingRulesService.getById(merchant.id, id)

        if (!rule) {
            throw new HttpException("Routing rule not found", HttpStatus.NOT_FOUND)
        }

        return {
            success: true,
            data: {
                rule,
            },
        }
    }

    @Put(":id")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async update(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") id: string,
        @Body() dto: UpdateRoutingRuleDto,
    ): Promise<SingleResponse> {
        const result = await this.routingRulesService.update(merchant.id, id, dto)

        if (!result.success || !result.rule) {
            if (
                result.errorMessage?.includes("not found") ||
                result.errorMessage?.includes("does not belong")
            ) {
                throw new HttpException(
                    result.errorMessage ?? "Routing rule not found",
                    HttpStatus.NOT_FOUND,
                )
            }
            if (result.errorMessage?.includes("system default")) {
                throw new HttpException(result.errorMessage, HttpStatus.FORBIDDEN)
            }
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to update routing rule",
                },
            }
        }

        return {
            success: true,
            data: {
                rule: result.rule,
            },
        }
    }

    @Delete(":id")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async delete(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") id: string,
    ): Promise<{ success: boolean }> {
        const result = await this.routingRulesService.delete(merchant.id, id)

        if (!result.success) {
            if (
                result.errorMessage?.includes("not found") ||
                result.errorMessage?.includes("does not belong")
            ) {
                throw new HttpException(
                    result.errorMessage ?? "Routing rule not found",
                    HttpStatus.NOT_FOUND,
                )
            }
            if (result.errorMessage?.includes("system default")) {
                throw new HttpException(result.errorMessage, HttpStatus.FORBIDDEN)
            }
            throw new HttpException(
                result.errorMessage ?? "Failed to delete routing rule",
                HttpStatus.BAD_REQUEST,
            )
        }

        return { success: true }
    }
}
