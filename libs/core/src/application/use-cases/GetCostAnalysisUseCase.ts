import {
    ChannelProviderStats,
    NotificationRepositoryPort,
} from "../ports/NotificationRepositoryPort"
import { AnalyticsPeriod } from "../../domain/value-objects/AnalyticsPeriod"
import { DateRange } from "../../domain/value-objects/DateRange"
import { Channel } from "../../domain/value-objects/Channel"
import {
    ChannelCostBreakdownProps,
    CostAnalysis,
    ProviderCostBreakdown,
} from "../../domain/value-objects/CostAnalysis"
import {
    DefaultCurrency,
    getProviderPrice,
    ReferenceSmsPrice,
} from "../../domain/value-objects/ChannelPricing"

/**
 * Input for GetCostAnalysisUseCase.
 */
export interface GetCostAnalysisInput {
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
 * Output for GetCostAnalysisUseCase.
 */
export interface GetCostAnalysisOutput {
    /** Cost analysis data */
    costs: ReturnType<CostAnalysis["toJSON"]>

    /** Date range used for the query */
    dateRange: {
        startDate: string
        endDate: string
    }
}

/**
 * Use case for getting cost analysis.
 *
 * Calculates actual notification costs, potential SMS-only costs,
 * and savings from using cheaper channels like Telegram.
 *
 * @example
 * ```typescript
 * const useCase = new GetCostAnalysisUseCase(repository)
 *
 * const result = await useCase.execute({
 *     merchantId: "merchant_123",
 *     period: AnalyticsPeriod.LAST_30_DAYS,
 * })
 *
 * console.log(`Total notifications: ${result.costs.totalNotifications}`)
 * console.log(`Actual cost: ${result.costs.totalCost} ${result.costs.currency}`)
 * console.log(`If all SMS: ${result.costs.potentialSmsCost} ${result.costs.currency}`)
 * console.log(`Savings: ${result.costs.totalSavings} (${result.costs.savingsPercent}%)`)
 *
 * // Example output:
 * // Total notifications: 10000
 * // Actual cost: 450000 UZS
 * // If all SMS: 1500000 UZS
 * // Savings: 1050000 (70%)
 * ```
 */
export class GetCostAnalysisUseCase {
    constructor(private readonly repository: NotificationRepositoryPort) {}

    async execute(input: GetCostAnalysisInput): Promise<GetCostAnalysisOutput> {
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

        // Get stats by channel and provider
        const stats = await this.repository.getStatsByChannelAndProvider(
            input.merchantId,
            dateRange,
        )

        // Calculate costs
        const costAnalysis = this.calculateCostAnalysis(stats)

        return {
            costs: costAnalysis.toJSON(),
            dateRange: dateRange.toJSON(),
        }
    }

    private calculateCostAnalysis(stats: ChannelProviderStats[]): CostAnalysis {
        if (stats.length === 0) {
            return CostAnalysis.empty()
        }

        // Group by channel
        const byChannel = new Map<
            Channel,
            {
                providers: ProviderCostBreakdown[]
                totalCount: number
                totalCost: number
            }
        >()

        // Calculate costs per provider
        for (const stat of stats) {
            const providerPrice = getProviderPrice(stat.provider)
            const cost = stat.count * providerPrice

            const existing = byChannel.get(stat.channel)
            if (existing) {
                existing.providers.push({
                    provider: stat.provider,
                    count: stat.count,
                    cost,
                    pricePerMessage: providerPrice,
                })
                existing.totalCount += stat.count
                existing.totalCost += cost
            } else {
                byChannel.set(stat.channel, {
                    providers: [
                        {
                            provider: stat.provider,
                            count: stat.count,
                            cost,
                            pricePerMessage: providerPrice,
                        },
                    ],
                    totalCount: stat.count,
                    totalCost: cost,
                })
            }
        }

        // Build channel breakdowns
        let totalNotifications = 0
        let totalCost = 0
        let potentialSmsCost = 0
        const channelBreakdowns: ChannelCostBreakdownProps[] = []

        for (const [channel, data] of byChannel) {
            totalNotifications += data.totalCount
            totalCost += data.totalCost

            const channelPotentialSmsCost = data.totalCount * ReferenceSmsPrice
            potentialSmsCost += channelPotentialSmsCost

            const channelSavings = channelPotentialSmsCost - data.totalCost
            const channelSavingsPercent =
                channelPotentialSmsCost > 0 ? (channelSavings / channelPotentialSmsCost) * 100 : 0

            channelBreakdowns.push({
                channel,
                count: data.totalCount,
                actualCost: data.totalCost,
                potentialSmsCost: channelPotentialSmsCost,
                savings: channelSavings,
                savingsPercent: channelSavingsPercent,
                providers: data.providers,
            })
        }

        // Sort by savings (highest first)
        channelBreakdowns.sort((a, b) => b.savings - a.savings)

        // Calculate totals
        const totalSavings = potentialSmsCost - totalCost
        const savingsPercent = potentialSmsCost > 0 ? (totalSavings / potentialSmsCost) * 100 : 0
        const averageCostPerNotification =
            totalNotifications > 0 ? totalCost / totalNotifications : 0

        return CostAnalysis.create({
            totalNotifications,
            totalCost,
            potentialSmsCost,
            totalSavings,
            savingsPercent,
            averageCostPerNotification,
            byChannel: channelBreakdowns,
            currency: DefaultCurrency,
        })
    }
}
