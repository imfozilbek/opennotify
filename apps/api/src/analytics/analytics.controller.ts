import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import { ApiKeyPermission, Merchant } from "@opennotify/core"
import { CurrentMerchant, RequirePermissions } from "../common/decorators"
import { ApiKeyGuard } from "../common/guards"
import {
    AnalyticsService,
    ChannelStatsResponse,
    CostAnalysisResponse,
    DateRangeResponse,
    LogEntryResponse,
    PaginationResponse,
    SummaryResponse,
} from "./analytics.service"
import {
    GetAnalyticsByChannelQueryDto,
    GetAnalyticsSummaryQueryDto,
    GetCostAnalyticsQueryDto,
    GetNotificationLogsQueryDto,
} from "./dto/analytics.dto"

/**
 * Summary response shape.
 */
interface SummaryApiResponse {
    success: boolean
    data: {
        stats: SummaryResponse
        dateRange: DateRangeResponse
    }
}

/**
 * By-channel response shape.
 */
interface ByChannelApiResponse {
    success: boolean
    data: {
        channels: ChannelStatsResponse[]
        dateRange: DateRangeResponse
    }
}

/**
 * Logs response shape.
 */
interface LogsApiResponse {
    success: boolean
    data: {
        logs: LogEntryResponse[]
        pagination: PaginationResponse
    }
}

/**
 * Costs response shape.
 */
interface CostsApiResponse {
    success: boolean
    data: {
        costs: CostAnalysisResponse
        dateRange: DateRangeResponse
    }
}

@Controller("analytics")
@UseGuards(ApiKeyGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    /**
     * GET /analytics/summary
     *
     * Get aggregated notification statistics for the merchant.
     *
     * Query params:
     * - period: Preset period (today, this_week, this_month, last_7_days, last_30_days)
     * - startDate: Custom start date (ISO 8601)
     * - endDate: Custom end date (ISO 8601)
     *
     * If both period and custom dates are provided, custom dates take precedence.
     * If neither is provided, defaults to last 30 days.
     */
    @Get("summary")
    @RequirePermissions(ApiKeyPermission.READ)
    async getSummary(
        @CurrentMerchant() merchant: Merchant,
        @Query() query: GetAnalyticsSummaryQueryDto,
    ): Promise<SummaryApiResponse> {
        const result = await this.analyticsService.getSummary(merchant.id, query)

        return {
            success: true,
            data: result,
        }
    }

    /**
     * GET /analytics/channels
     *
     * Get notification statistics breakdown by channel.
     *
     * Query params:
     * - period: Preset period (today, this_week, this_month, last_7_days, last_30_days)
     * - startDate: Custom start date (ISO 8601)
     * - endDate: Custom end date (ISO 8601)
     *
     * Returns stats for each channel (SMS, Telegram, Email, etc.)
     * sorted by total count descending.
     */
    @Get("channels")
    @RequirePermissions(ApiKeyPermission.READ)
    async getByChannel(
        @CurrentMerchant() merchant: Merchant,
        @Query() query: GetAnalyticsByChannelQueryDto,
    ): Promise<ByChannelApiResponse> {
        const result = await this.analyticsService.getByChannel(merchant.id, query)

        return {
            success: true,
            data: result,
        }
    }

    /**
     * GET /analytics/logs
     *
     * Get notification logs with filtering and pagination.
     *
     * Query params:
     * - status: Filter by status (can be multiple: ?status=SENT&status=FAILED)
     * - channel: Filter by channel (can be multiple)
     * - provider: Filter by provider (can be multiple)
     * - startDate: Filter by date range start (ISO 8601)
     * - endDate: Filter by date range end (ISO 8601)
     * - page: Page number (default: 1)
     * - limit: Items per page (default: 20)
     *
     * Recipient info is masked for privacy (e.g., +998***4567).
     */
    @Get("logs")
    @RequirePermissions(ApiKeyPermission.READ)
    async getLogs(
        @CurrentMerchant() merchant: Merchant,
        @Query() query: GetNotificationLogsQueryDto,
    ): Promise<LogsApiResponse> {
        const result = await this.analyticsService.getLogs(merchant.id, query)

        return {
            success: true,
            data: result,
        }
    }

    /**
     * GET /analytics/costs
     *
     * Get cost analysis with savings breakdown.
     *
     * Query params:
     * - period: Preset period (today, this_week, this_month, last_7_days, last_30_days)
     * - startDate: Custom start date (ISO 8601)
     * - endDate: Custom end date (ISO 8601)
     *
     * Returns:
     * - Total costs and potential SMS costs
     * - Savings from using cheaper channels (Telegram, Email, Push)
     * - Breakdown by channel and provider
     */
    @Get("costs")
    @RequirePermissions(ApiKeyPermission.READ)
    async getCosts(
        @CurrentMerchant() merchant: Merchant,
        @Query() query: GetCostAnalyticsQueryDto,
    ): Promise<CostsApiResponse> {
        const result = await this.analyticsService.getCosts(merchant.id, query)

        return {
            success: true,
            data: result,
        }
    }
}
