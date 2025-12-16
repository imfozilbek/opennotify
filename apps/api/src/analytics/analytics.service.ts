import { Injectable } from "@nestjs/common"
import {
    AnalyticsPeriod,
    Channel,
    GetAnalyticsByChannelUseCase,
    GetAnalyticsSummaryUseCase,
    GetNotificationLogsUseCase,
    NotificationRepositoryPort,
    NotificationStatus,
    Provider,
} from "@opennotify/core"
import { sharedNotificationRepository } from "../infrastructure/repositories"
import {
    AnalyticsPeriodDto,
    ChannelFilterDto,
    GetAnalyticsByChannelQueryDto,
    GetAnalyticsSummaryQueryDto,
    GetNotificationLogsQueryDto,
    ProviderFilterDto,
    StatusFilterDto,
} from "./dto/analytics.dto"

/**
 * Summary statistics response.
 */
export interface SummaryResponse {
    total: number
    pending: number
    sent: number
    delivered: number
    failed: number
    processed: number
    deliveryRate: number
    failureRate: number
    successRate: number
}

/**
 * Channel statistics response.
 */
export interface ChannelStatsResponse {
    channel: string
    total: number
    pending: number
    sent: number
    delivered: number
    failed: number
    processed: number
    deliveryRate: number
    failureRate: number
    successRate: number
}

/**
 * Date range response.
 */
export interface DateRangeResponse {
    startDate: string
    endDate: string
}

/**
 * Log entry response.
 */
export interface LogEntryResponse {
    id: string
    channel: string
    provider: string
    status: string
    recipient: string
    createdAt: string
    sentAt?: string
    deliveredAt?: string
    failedAt?: string
    errorMessage?: string
}

/**
 * Pagination response.
 */
export interface PaginationResponse {
    total: number
    page: number
    limit: number
    totalPages: number
}

@Injectable()
export class AnalyticsService {
    private readonly repository: NotificationRepositoryPort
    private readonly getSummaryUseCase: GetAnalyticsSummaryUseCase
    private readonly getByChannelUseCase: GetAnalyticsByChannelUseCase
    private readonly getLogsUseCase: GetNotificationLogsUseCase

    constructor() {
        this.repository = sharedNotificationRepository
        this.getSummaryUseCase = new GetAnalyticsSummaryUseCase(this.repository)
        this.getByChannelUseCase = new GetAnalyticsByChannelUseCase(this.repository)
        this.getLogsUseCase = new GetNotificationLogsUseCase(this.repository)
    }

    /**
     * Get analytics summary for a merchant.
     */
    async getSummary(
        merchantId: string,
        query: GetAnalyticsSummaryQueryDto,
    ): Promise<{ stats: SummaryResponse; dateRange: DateRangeResponse }> {
        const result = await this.getSummaryUseCase.execute({
            merchantId,
            period: this.mapPeriod(query.period),
            dateRange: this.buildDateRange(query.startDate, query.endDate),
        })

        return {
            stats: result.stats,
            dateRange: result.dateRange,
        }
    }

    /**
     * Get analytics breakdown by channel.
     */
    async getByChannel(
        merchantId: string,
        query: GetAnalyticsByChannelQueryDto,
    ): Promise<{ channels: ChannelStatsResponse[]; dateRange: DateRangeResponse }> {
        const result = await this.getByChannelUseCase.execute({
            merchantId,
            period: this.mapPeriod(query.period),
            dateRange: this.buildDateRange(query.startDate, query.endDate),
        })

        return {
            channels: result.channels,
            dateRange: result.dateRange,
        }
    }

    /**
     * Get notification logs with filters.
     */
    async getLogs(
        merchantId: string,
        query: GetNotificationLogsQueryDto,
    ): Promise<{ logs: LogEntryResponse[]; pagination: PaginationResponse }> {
        const page = query.page ?? 1
        const limit = query.limit ?? 20

        const result = await this.getLogsUseCase.execute({
            merchantId,
            filters: {
                status: this.mapStatuses(query.status),
                channel: this.mapChannels(query.channel),
                provider: this.mapProviders(query.provider),
            },
            dateRange: this.buildDateRange(query.startDate, query.endDate),
            pagination: { page, limit },
        })

        return {
            logs: result.logs,
            pagination: result.pagination,
        }
    }

    /**
     * Map DTO period to domain period.
     */
    private mapPeriod(period?: AnalyticsPeriodDto): AnalyticsPeriod | undefined {
        if (!period) {
            return undefined
        }

        const mapping: Record<AnalyticsPeriodDto, AnalyticsPeriod> = {
            [AnalyticsPeriodDto.TODAY]: AnalyticsPeriod.TODAY,
            [AnalyticsPeriodDto.THIS_WEEK]: AnalyticsPeriod.THIS_WEEK,
            [AnalyticsPeriodDto.THIS_MONTH]: AnalyticsPeriod.THIS_MONTH,
            [AnalyticsPeriodDto.LAST_7_DAYS]: AnalyticsPeriod.LAST_7_DAYS,
            [AnalyticsPeriodDto.LAST_30_DAYS]: AnalyticsPeriod.LAST_30_DAYS,
        }

        return mapping[period]
    }

    /**
     * Build date range from query params.
     */
    private buildDateRange(
        startDate?: string,
        endDate?: string,
    ): { startDate: Date; endDate: Date } | undefined {
        if (!startDate || !endDate) {
            return undefined
        }

        return {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        }
    }

    /**
     * Map DTO statuses to domain statuses.
     */
    private mapStatuses(statuses?: StatusFilterDto[]): NotificationStatus[] | undefined {
        if (!statuses || statuses.length === 0) {
            return undefined
        }

        const mapping: Record<StatusFilterDto, NotificationStatus> = {
            [StatusFilterDto.PENDING]: NotificationStatus.PENDING,
            [StatusFilterDto.SENT]: NotificationStatus.SENT,
            [StatusFilterDto.DELIVERED]: NotificationStatus.DELIVERED,
            [StatusFilterDto.FAILED]: NotificationStatus.FAILED,
        }

        return statuses.map((s) => mapping[s])
    }

    /**
     * Map DTO channels to domain channels.
     */
    private mapChannels(channels?: ChannelFilterDto[]): Channel[] | undefined {
        if (!channels || channels.length === 0) {
            return undefined
        }

        const mapping: Record<ChannelFilterDto, Channel> = {
            [ChannelFilterDto.SMS]: Channel.SMS,
            [ChannelFilterDto.TELEGRAM]: Channel.TELEGRAM,
            [ChannelFilterDto.EMAIL]: Channel.EMAIL,
            [ChannelFilterDto.PUSH]: Channel.PUSH,
            [ChannelFilterDto.WHATSAPP]: Channel.WHATSAPP,
        }

        return channels.map((c) => mapping[c])
    }

    /**
     * Map DTO providers to domain providers.
     */
    private mapProviders(providers?: ProviderFilterDto[]): Provider[] | undefined {
        if (!providers || providers.length === 0) {
            return undefined
        }

        const mapping: Record<ProviderFilterDto, Provider> = {
            [ProviderFilterDto.ESKIZ]: Provider.ESKIZ,
            [ProviderFilterDto.PLAYMOBILE]: Provider.PLAYMOBILE,
            [ProviderFilterDto.GETSMS]: Provider.GETSMS,
            [ProviderFilterDto.TELEGRAM_BOT]: Provider.TELEGRAM_BOT,
            [ProviderFilterDto.SMTP]: Provider.SMTP,
            [ProviderFilterDto.SENDGRID]: Provider.SENDGRID,
            [ProviderFilterDto.MAILGUN]: Provider.MAILGUN,
            [ProviderFilterDto.FCM]: Provider.FCM,
            [ProviderFilterDto.APNS]: Provider.APNS,
            [ProviderFilterDto.WHATSAPP_BUSINESS]: Provider.WHATSAPP_BUSINESS,
        }

        return providers.map((p) => mapping[p])
    }
}
