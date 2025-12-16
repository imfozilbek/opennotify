import { WebhookLog } from "../../domain/entities/WebhookLog"
import { Provider } from "../../domain/value-objects/Provider"
import { WebhookStatus } from "../../domain/value-objects/WebhookStatus"
import { DateRange } from "../../domain/value-objects/DateRange"
import { WebhookLogFilters, WebhookLogRepositoryPort } from "../ports/WebhookLogRepositoryPort"

/**
 * Input for getting webhook logs.
 */
export interface GetWebhookLogsInput {
    /** Merchant ID */
    merchantId: string

    /** Filter by provider */
    provider?: Provider[]

    /** Filter by webhook status */
    status?: WebhookStatus[]

    /** Filter by date range */
    dateRange?: {
        startDate: Date
        endDate: Date
    }

    /** Pagination */
    pagination?: {
        page: number
        limit: number
    }
}

/**
 * Webhook log entry for response.
 */
export interface WebhookLogEntry {
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
 * Output from getting webhook logs.
 */
export interface GetWebhookLogsOutput {
    logs: WebhookLogEntry[]
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

/**
 * Use case for retrieving webhook logs.
 *
 * Returns paginated webhook logs for a merchant with optional filters.
 *
 * @example
 * ```typescript
 * const useCase = new GetWebhookLogsUseCase(repository)
 *
 * const result = await useCase.execute({
 *     merchantId: "merchant_123",
 *     provider: [Provider.ESKIZ],
 *     status: [WebhookStatus.SUCCESS],
 *     pagination: { page: 1, limit: 20 },
 * })
 * ```
 */
export class GetWebhookLogsUseCase {
    constructor(private readonly repository: WebhookLogRepositoryPort) {}

    async execute(input: GetWebhookLogsInput): Promise<GetWebhookLogsOutput> {
        const page = input.pagination?.page ?? 1
        const limit = input.pagination?.limit ?? 20
        const offset = (page - 1) * limit

        // Build filters
        const filters: WebhookLogFilters = {
            provider: input.provider,
            status: input.status,
            limit,
            offset,
        }

        if (input.dateRange) {
            filters.dateRange = DateRange.create(input.dateRange.startDate, input.dateRange.endDate)
        }

        // Get logs and count in parallel
        const [logs, total] = await Promise.all([
            this.repository.findByMerchantId(input.merchantId, filters),
            this.repository.countByMerchantId(input.merchantId, {
                ...filters,
                limit: undefined,
                offset: undefined,
            }),
        ])

        return {
            logs: logs.map((log) => this.mapToEntry(log)),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        }
    }

    /**
     * Map WebhookLog entity to response entry.
     */
    private mapToEntry(log: WebhookLog): WebhookLogEntry {
        return {
            id: log.id,
            provider: log.provider,
            status: log.status,
            notificationId: log.notificationId,
            externalId: log.externalId,
            notificationStatus: log.notificationStatus,
            errorMessage: log.errorMessage,
            processingTimeMs: log.processingTimeMs,
            ipAddress: log.ipAddress,
            createdAt: log.createdAt.toISOString(),
        }
    }
}
