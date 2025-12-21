import { Channel } from "./Channel"
import { Provider } from "./Provider"

/**
 * Cost breakdown for a specific provider.
 */
export interface ProviderCostBreakdown {
    provider: Provider
    count: number
    cost: number
    pricePerMessage: number
}

/**
 * Properties for channel cost breakdown.
 */
export interface ChannelCostBreakdownProps {
    channel: Channel
    count: number
    actualCost: number
    potentialSmsCost: number
    savings: number
    savingsPercent: number
    providers: ProviderCostBreakdown[]
}

/**
 * Properties for creating CostAnalysis.
 */
export interface CostAnalysisProps {
    /** Total number of notifications */
    totalNotifications: number

    /** Actual total cost in currency units */
    totalCost: number

    /** What it would have cost if all were SMS */
    potentialSmsCost: number

    /** Total savings compared to SMS-only */
    totalSavings: number

    /** Savings percentage (0-100) */
    savingsPercent: number

    /** Average cost per notification */
    averageCostPerNotification: number

    /** Breakdown by channel */
    byChannel: ChannelCostBreakdownProps[]

    /** Currency code */
    currency: string
}

/**
 * Cost analysis result value object.
 *
 * Calculates actual costs, potential SMS costs, and savings
 * from using free/cheaper channels like Telegram.
 *
 * @example
 * ```typescript
 * const analysis = CostAnalysis.create({
 *     totalNotifications: 10000,
 *     totalCost: 450000,           // Actual cost
 *     potentialSmsCost: 1500000,   // If all were SMS
 *     totalSavings: 1050000,       // 70% savings
 *     savingsPercent: 70,
 *     averageCostPerNotification: 45,
 *     byChannel: [...],
 *     currency: "UZS",
 * })
 *
 * // Example calculation:
 * // 10,000 notifications total
 * // - 7,000 via Telegram (free) = 0 UZS
 * // - 3,000 via SMS = 450,000 UZS
 * // If all 10,000 were SMS = 1,500,000 UZS
 * // Savings = 1,500,000 - 450,000 = 1,050,000 UZS (70%)
 * ```
 */
export class CostAnalysis {
    private readonly _props: CostAnalysisProps

    private constructor(props: CostAnalysisProps) {
        this._props = props
    }

    /**
     * Create CostAnalysis from props.
     */
    static create(props: CostAnalysisProps): CostAnalysis {
        return new CostAnalysis(props)
    }

    /**
     * Create empty CostAnalysis (all zeros).
     */
    static empty(): CostAnalysis {
        return new CostAnalysis({
            totalNotifications: 0,
            totalCost: 0,
            potentialSmsCost: 0,
            totalSavings: 0,
            savingsPercent: 0,
            averageCostPerNotification: 0,
            byChannel: [],
            currency: "UZS",
        })
    }

    /**
     * Total number of notifications.
     */
    get totalNotifications(): number {
        return this._props.totalNotifications
    }

    /**
     * Actual total cost in currency units.
     */
    get totalCost(): number {
        return this._props.totalCost
    }

    /**
     * What it would have cost if all were SMS.
     */
    get potentialSmsCost(): number {
        return this._props.potentialSmsCost
    }

    /**
     * Total savings compared to SMS-only.
     */
    get totalSavings(): number {
        return this._props.totalSavings
    }

    /**
     * Savings percentage (0-100).
     */
    get savingsPercent(): number {
        return this._props.savingsPercent
    }

    /**
     * Average cost per notification.
     */
    get averageCostPerNotification(): number {
        return this._props.averageCostPerNotification
    }

    /**
     * Breakdown by channel.
     */
    get byChannel(): ChannelCostBreakdownProps[] {
        return this._props.byChannel
    }

    /**
     * Currency code.
     */
    get currency(): string {
        return this._props.currency
    }

    /**
     * Check if there are any savings.
     */
    get hasSavings(): boolean {
        return this._props.totalSavings > 0
    }

    /**
     * Check if there are any notifications.
     */
    get hasNotifications(): boolean {
        return this._props.totalNotifications > 0
    }

    /**
     * Convert to JSON-serializable object.
     */
    toJSON(): CostAnalysisProps {
        return {
            totalNotifications: this._props.totalNotifications,
            totalCost: this._props.totalCost,
            potentialSmsCost: this._props.potentialSmsCost,
            totalSavings: this._props.totalSavings,
            savingsPercent: Math.round(this._props.savingsPercent * 100) / 100,
            averageCostPerNotification:
                Math.round(this._props.averageCostPerNotification * 100) / 100,
            byChannel: this._props.byChannel.map((ch) => ({
                ...ch,
                savingsPercent: Math.round(ch.savingsPercent * 100) / 100,
            })),
            currency: this._props.currency,
        }
    }
}
