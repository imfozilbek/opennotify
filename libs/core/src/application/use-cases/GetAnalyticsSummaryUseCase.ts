import { NotificationRepositoryPort } from "../ports/NotificationRepositoryPort"
import { AnalyticsPeriod } from "../../domain/value-objects/AnalyticsPeriod"
import { DateRange } from "../../domain/value-objects/DateRange"
import { NotificationStats } from "../../domain/value-objects/NotificationStats"
import { NotificationStatus } from "../../domain/value-objects/NotificationStatus"

/**
 * Input for GetAnalyticsSummaryUseCase.
 */
export interface GetAnalyticsSummaryInput {
    /** Merchant ID */
    merchantId: string

    /** Predefined period (optional) */
    period?: AnalyticsPeriod

    /** Custom date range (optional, overrides period) */
    dateRange?: {
        startDate: Date
        endDate: Date
    }
}

/**
 * Output for GetAnalyticsSummaryUseCase.
 */
export interface GetAnalyticsSummaryOutput {
    /** Aggregated statistics */
    stats: ReturnType<NotificationStats["toJSON"]>

    /** Date range used for the query */
    dateRange: {
        startDate: string
        endDate: string
    }
}

/**
 * Use case for getting analytics summary.
 *
 * Returns aggregated notification statistics for a merchant
 * within a specified time period.
 *
 * @example
 * ```typescript
 * const useCase = new GetAnalyticsSummaryUseCase(repository)
 *
 * // Get stats for last 7 days
 * const result = await useCase.execute({
 *     merchantId: "merchant_123",
 *     period: AnalyticsPeriod.LAST_7_DAYS,
 * })
 *
 * console.log(result.stats.deliveryRate) // 0.85
 * ```
 */
export class GetAnalyticsSummaryUseCase {
    constructor(private readonly repository: NotificationRepositoryPort) {}

    async execute(input: GetAnalyticsSummaryInput): Promise<GetAnalyticsSummaryOutput> {
        // Determine date range
        let dateRange: DateRange

        if (input.dateRange) {
            dateRange = DateRange.create(input.dateRange.startDate, input.dateRange.endDate)
        } else if (input.period) {
            dateRange = DateRange.fromPeriod(input.period)
        } else {
            // Default to last 30 days
            dateRange = DateRange.last(30)
        }

        // Get aggregated stats from repository
        const aggregatedStats = await this.repository.getStats(input.merchantId, dateRange)

        // Convert to NotificationStats value object
        const stats = NotificationStats.create({
            total: aggregatedStats.total,
            pending: aggregatedStats.byStatus[NotificationStatus.PENDING] ?? 0,
            sent: aggregatedStats.byStatus[NotificationStatus.SENT] ?? 0,
            delivered: aggregatedStats.byStatus[NotificationStatus.DELIVERED] ?? 0,
            failed: aggregatedStats.byStatus[NotificationStatus.FAILED] ?? 0,
        })

        return {
            stats: stats.toJSON(),
            dateRange: dateRange.toJSON(),
        }
    }
}
