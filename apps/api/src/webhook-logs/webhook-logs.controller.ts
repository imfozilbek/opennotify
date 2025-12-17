import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { ApiKeyPermission, Merchant } from "@opennotify/core"
import { CurrentMerchant, RequirePermissions } from "../common/decorators"
import { ApiKeyGuard } from "../common/guards"
import { PaginationResponse, WebhookLogResponse, WebhookLogsService } from "./webhook-logs.service"
import { GetWebhookLogsQueryDto } from "./dto/get-webhook-logs.dto"

/**
 * Webhook logs response shape.
 */
interface WebhookLogsApiResponse {
    success: boolean
    data: {
        logs: WebhookLogResponse[]
        pagination: PaginationResponse
    }
}

/**
 * Controller for viewing webhook logs.
 * Requires API key authentication.
 */
@Controller("logs")
@UseGuards(ApiKeyGuard)
export class WebhookLogsController {
    constructor(private readonly webhookLogsService: WebhookLogsService) {}

    /**
     * GET /logs/webhooks
     *
     * Get webhook logs for the authenticated merchant.
     *
     * Query params:
     * - provider: Filter by provider (can be multiple)
     * - status: Filter by webhook status (SUCCESS, INVALID_SIGNATURE, etc.)
     * - startDate: Filter by date range start (ISO 8601)
     * - endDate: Filter by date range end (ISO 8601)
     * - page: Page number (default: 1)
     * - limit: Items per page (default: 20)
     */
    @Get("webhooks")
    @RequirePermissions(ApiKeyPermission.READ)
    async getWebhookLogs(
        @CurrentMerchant() merchant: Merchant,
        @Query() query: GetWebhookLogsQueryDto,
    ): Promise<WebhookLogsApiResponse> {
        const result = await this.webhookLogsService.getWebhookLogs(merchant.id, query)

        return {
            success: true,
            data: result,
        }
    }
}
