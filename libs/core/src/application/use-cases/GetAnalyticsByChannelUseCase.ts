import { NotificationRepositoryPort } from "../ports/NotificationRepositoryPort"
import { AnalyticsPeriod } from "../../domain/value-objects/AnalyticsPeriod"
import { DateRange } from "../../domain/value-objects/DateRange"
import { ChannelStats } from "../../domain/value-objects/ChannelStats"

/**
 * Input for GetAnalyticsByChannelUseCase.
 */
export interface GetAnalyticsByChannelInput {
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
 * Output for GetAnalyticsByChannelUseCase.
 */
export interface GetAnalyticsByChannelOutput {
    /** Statistics per channel */
    channels: ReturnType<ChannelStats["toJSON"]>[]

    /** Date range used for the query */
    dateRange: {
        startDate: string
        endDate: string
    }
}

/**
 * Use case for getting analytics breakdown by channel.
 *
 * Returns notification statistics grouped by channel (SMS, Telegram, Email, etc.)
 * for a merchant within a specified time period.
 *
 * @example
 * ```typescript
 * const useCase = new GetAnalyticsByChannelUseCase(repository)
 *
 * const result = await useCase.execute({
 *     merchantId: "merchant_123",
 *     period: AnalyticsPeriod.THIS_MONTH,
 * })
 *
 * result.channels.forEach(ch => {
 *     console.log(`${ch.channel}: ${ch.total} (${ch.deliveryRate * 100}% delivered)`)
 * })
 * // SMS: 500 (85% delivered)
 * // TELEGRAM: 300 (95% delivered)
 * // EMAIL: 200 (78% delivered)
 * ```
 */
export class GetAnalyticsByChannelUseCase {
    constructor(private readonly repository: NotificationRepositoryPort) {}

    async execute(input: GetAnalyticsByChannelInput): Promise<GetAnalyticsByChannelOutput> {
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

        // Get stats by channel from repository
        const channelStats = await this.repository.getStatsByChannel(input.merchantId, dateRange)

        // Sort by total count descending (most used channels first)
        const sortedStats = [...channelStats].sort((a, b) => b.total - a.total)

        return {
            channels: sortedStats.map((stats) => stats.toJSON()),
            dateRange: dateRange.toJSON(),
        }
    }
}
