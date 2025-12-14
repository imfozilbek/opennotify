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
    CreateRecipientDto,
    LinkTelegramDto,
    ListRecipientsQueryDto,
    UpdateRecipientDto,
} from "./dto/recipient.dto"
import { RecipientResponse, RecipientsService } from "./recipients.service"

interface SingleResponse {
    success: boolean
    data?: {
        recipient: RecipientResponse
    }
    error?: {
        message: string
    }
}

interface ListResponse {
    success: boolean
    data: {
        recipients: RecipientResponse[]
        total: number
        page: number
        limit: number
    }
}

@Controller("recipients")
@UseGuards(ApiKeyGuard)
export class RecipientsController {
    constructor(private readonly recipientsService: RecipientsService) {}

    @Post()
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async create(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: CreateRecipientDto,
    ): Promise<SingleResponse> {
        const result = await this.recipientsService.create(merchant.id, dto)

        if (!result.success || !result.recipient) {
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to create recipient",
                },
            }
        }

        return {
            success: true,
            data: {
                recipient: result.recipient,
            },
        }
    }

    @Get()
    @RequirePermissions(ApiKeyPermission.READ)
    async list(
        @CurrentMerchant() merchant: Merchant,
        @Query() query: ListRecipientsQueryDto,
    ): Promise<ListResponse> {
        const result = await this.recipientsService.list(merchant.id, {
            page: query.page,
            limit: query.limit,
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
        const recipient = await this.recipientsService.getById(merchant.id, id)

        if (!recipient) {
            throw new HttpException("Recipient not found", HttpStatus.NOT_FOUND)
        }

        return {
            success: true,
            data: {
                recipient,
            },
        }
    }

    @Put(":id")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async update(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") id: string,
        @Body() dto: UpdateRecipientDto,
    ): Promise<SingleResponse> {
        const result = await this.recipientsService.update(merchant.id, id, dto)

        if (!result.success || !result.recipient) {
            if (result.errorMessage === "Recipient not found") {
                throw new HttpException("Recipient not found", HttpStatus.NOT_FOUND)
            }
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to update recipient",
                },
            }
        }

        return {
            success: true,
            data: {
                recipient: result.recipient,
            },
        }
    }

    @Delete(":id")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async delete(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") id: string,
    ): Promise<{ success: boolean }> {
        const deleted = await this.recipientsService.delete(merchant.id, id)

        if (!deleted) {
            throw new HttpException("Recipient not found", HttpStatus.NOT_FOUND)
        }

        return { success: true }
    }

    @Post(":id/link-telegram")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async linkTelegram(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") id: string,
        @Body() dto: LinkTelegramDto,
    ): Promise<SingleResponse> {
        const result = await this.recipientsService.linkTelegram(
            merchant.id,
            id,
            dto.telegramChatId,
        )

        if (!result.success || !result.recipient) {
            if (result.errorMessage === "Recipient not found") {
                throw new HttpException("Recipient not found", HttpStatus.NOT_FOUND)
            }
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to link Telegram",
                },
            }
        }

        return {
            success: true,
            data: {
                recipient: result.recipient,
            },
        }
    }
}
