import { Injectable } from "@nestjs/common"
import {
    GetWebhookLogsUseCase,
    Provider,
    WebhookLogRepositoryPort,
    WebhookStatus,
} from "@opennotify/core"
import { sharedWebhookLogRepository } from "../infrastructure/repositories"
import {
    GetWebhookLogsQueryDto,
    ProviderFilterDto,
    WebhookStatusFilterDto,
} from "./dto/get-webhook-logs.dto"

/**
 * Webhook log response entry.
 */
export interface WebhookLogResponse {
    id: string
    provider: string
    status: string
    notificationId?: string
    externalId?: string
    notificationStatus?: string
    errorMessage?: string
    processingTimeMs: number
    ipAddress?: string
    createdAt: string
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
export class WebhookLogsService {
    private readonly repository: WebhookLogRepositoryPort
    private readonly getWebhookLogsUseCase: GetWebhookLogsUseCase

    constructor() {
        this.repository = sharedWebhookLogRepository
        this.getWebhookLogsUseCase = new GetWebhookLogsUseCase(this.repository)
    }

    /**
     * Get webhook logs for a merchant.
     */
    async getWebhookLogs(
        merchantId: string,
        query: GetWebhookLogsQueryDto,
    ): Promise<{ logs: WebhookLogResponse[]; pagination: PaginationResponse }> {
        const page = query.page ?? 1
        const limit = query.limit ?? 20

        const result = await this.getWebhookLogsUseCase.execute({
            merchantId,
            provider: this.mapProviders(query.provider),
            status: this.mapStatuses(query.status),
            dateRange: this.buildDateRange(query.startDate, query.endDate),
            pagination: { page, limit },
        })

        return {
            logs: result.logs,
            pagination: result.pagination,
        }
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

    /**
     * Map DTO statuses to domain statuses.
     */
    private mapStatuses(statuses?: WebhookStatusFilterDto[]): WebhookStatus[] | undefined {
        if (!statuses || statuses.length === 0) {
            return undefined
        }

        const mapping: Record<WebhookStatusFilterDto, WebhookStatus> = {
            [WebhookStatusFilterDto.SUCCESS]: WebhookStatus.SUCCESS,
            [WebhookStatusFilterDto.INVALID_SIGNATURE]: WebhookStatus.INVALID_SIGNATURE,
            [WebhookStatusFilterDto.INVALID_PAYLOAD]: WebhookStatus.INVALID_PAYLOAD,
            [WebhookStatusFilterDto.NOTIFICATION_NOT_FOUND]: WebhookStatus.NOTIFICATION_NOT_FOUND,
            [WebhookStatusFilterDto.PROCESSING_ERROR]: WebhookStatus.PROCESSING_ERROR,
        }

        return statuses.map((s) => mapping[s])
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
}
