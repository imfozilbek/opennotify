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
    CreateTemplateDto,
    ListTemplatesQueryDto,
    RenderTemplateDto,
    UpdateTemplateDto,
} from "./dto/template.dto"
import { TemplateResponse, TemplatesService } from "./templates.service"

interface SingleResponse {
    success: boolean
    data?: {
        template: TemplateResponse
    }
    error?: {
        message: string
    }
}

interface ListResponse {
    success: boolean
    data: {
        templates: TemplateResponse[]
        total: number
        page: number
        limit: number
    }
}

interface RenderResponse {
    success: boolean
    data?: {
        body: string
        subject?: string
    }
    error?: {
        message: string
    }
}

@Controller("templates")
@UseGuards(ApiKeyGuard)
export class TemplatesController {
    constructor(private readonly templatesService: TemplatesService) {}

    @Post()
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async create(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: CreateTemplateDto,
    ): Promise<SingleResponse> {
        const result = await this.templatesService.create(merchant.id, dto)

        if (!result.success || !result.template) {
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to create template",
                },
            }
        }

        return {
            success: true,
            data: {
                template: result.template,
            },
        }
    }

    @Get()
    @RequirePermissions(ApiKeyPermission.READ)
    async list(
        @CurrentMerchant() merchant: Merchant,
        @Query() query: ListTemplatesQueryDto,
    ): Promise<ListResponse> {
        const result = await this.templatesService.list(merchant.id, {
            status: query.status,
            channel: query.channel,
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
        const template = await this.templatesService.getById(merchant.id, id)

        if (!template) {
            throw new HttpException("Template not found", HttpStatus.NOT_FOUND)
        }

        return {
            success: true,
            data: {
                template,
            },
        }
    }

    @Put(":id")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async update(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") id: string,
        @Body() dto: UpdateTemplateDto,
    ): Promise<SingleResponse> {
        const result = await this.templatesService.update(merchant.id, id, dto)

        if (!result.success || !result.template) {
            if (result.errorMessage === "Template not found") {
                throw new HttpException("Template not found", HttpStatus.NOT_FOUND)
            }
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to update template",
                },
            }
        }

        return {
            success: true,
            data: {
                template: result.template,
            },
        }
    }

    @Delete(":id")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async delete(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") id: string,
    ): Promise<{ success: boolean }> {
        const deleted = await this.templatesService.delete(merchant.id, id)

        if (!deleted) {
            throw new HttpException("Template not found", HttpStatus.NOT_FOUND)
        }

        return { success: true }
    }

    @Post(":id/publish")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async publish(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") id: string,
    ): Promise<SingleResponse> {
        const result = await this.templatesService.publish(merchant.id, id)

        if (!result.success || !result.template) {
            if (result.errorMessage === "Template not found") {
                throw new HttpException("Template not found", HttpStatus.NOT_FOUND)
            }
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to publish template",
                },
            }
        }

        return {
            success: true,
            data: {
                template: result.template,
            },
        }
    }

    @Post(":id/unpublish")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async unpublish(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") id: string,
    ): Promise<SingleResponse> {
        const result = await this.templatesService.unpublish(merchant.id, id)

        if (!result.success || !result.template) {
            if (result.errorMessage === "Template not found") {
                throw new HttpException("Template not found", HttpStatus.NOT_FOUND)
            }
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to unpublish template",
                },
            }
        }

        return {
            success: true,
            data: {
                template: result.template,
            },
        }
    }

    @Post(":id/archive")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async archive(
        @CurrentMerchant() merchant: Merchant,
        @Param("id") id: string,
    ): Promise<SingleResponse> {
        const result = await this.templatesService.archive(merchant.id, id)

        if (!result.success || !result.template) {
            if (result.errorMessage === "Template not found") {
                throw new HttpException("Template not found", HttpStatus.NOT_FOUND)
            }
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to archive template",
                },
            }
        }

        return {
            success: true,
            data: {
                template: result.template,
            },
        }
    }

    @Post("render")
    @RequirePermissions(ApiKeyPermission.SEND)
    async render(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: RenderTemplateDto,
    ): Promise<RenderResponse> {
        const result = await this.templatesService.render(merchant.id, dto)

        if (!result.success) {
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to render template",
                },
            }
        }

        return {
            success: true,
            data: {
                body: result.body ?? "",
                subject: result.subject,
            },
        }
    }
}
