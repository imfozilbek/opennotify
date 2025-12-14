import { AnalyticsPeriod } from "./AnalyticsPeriod"

/**
 * Properties for creating a DateRange.
 */
export interface DateRangeProps {
    startDate: Date
    endDate: Date
}

/**
 * Immutable date range value object for analytics queries.
 *
 * @example
 * ```typescript
 * // Create from dates
 * const range = DateRange.create(new Date("2025-01-01"), new Date("2025-01-31"))
 *
 * // Create from period preset
 * const today = DateRange.today()
 * const lastWeek = DateRange.last(7)
 * const thisMonth = DateRange.fromPeriod(AnalyticsPeriod.THIS_MONTH)
 *
 * // Check if date is in range
 * range.contains(new Date("2025-01-15")) // true
 * ```
 */
export class DateRange {
    private readonly _startDate: Date
    private readonly _endDate: Date

    private constructor(startDate: Date, endDate: Date) {
        this._startDate = startDate
        this._endDate = endDate
    }

    /**
     * Create DateRange from start and end dates.
     * @throws Error if startDate is after endDate
     */
    static create(startDate: Date, endDate: Date): DateRange {
        if (startDate > endDate) {
            throw new Error("Start date cannot be after end date")
        }
        return new DateRange(startDate, endDate)
    }

    /**
     * Create DateRange for today (from midnight to end of day).
     */
    static today(): DateRange {
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
        return new DateRange(startDate, endDate)
    }

    /**
     * Create DateRange for current week (Monday to now).
     */
    static thisWeek(): DateRange {
        const now = new Date()
        const dayOfWeek = now.getDay()
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        const monday = new Date(now)
        monday.setDate(now.getDate() + mondayOffset)
        monday.setHours(0, 0, 0, 0)
        return new DateRange(monday, now)
    }

    /**
     * Create DateRange for current month (1st to now).
     */
    static thisMonth(): DateRange {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
        return new DateRange(firstDay, now)
    }

    /**
     * Create DateRange for last N days.
     */
    static last(days: number): DateRange {
        if (days <= 0) {
            throw new Error("Days must be positive")
        }
        const now = new Date()
        const startDate = new Date(now)
        startDate.setDate(now.getDate() - days)
        startDate.setHours(0, 0, 0, 0)
        return new DateRange(startDate, now)
    }

    /**
     * Create DateRange from AnalyticsPeriod preset.
     */
    static fromPeriod(period: AnalyticsPeriod): DateRange {
        switch (period) {
            case AnalyticsPeriod.TODAY:
                return DateRange.today()
            case AnalyticsPeriod.THIS_WEEK:
                return DateRange.thisWeek()
            case AnalyticsPeriod.THIS_MONTH:
                return DateRange.thisMonth()
            case AnalyticsPeriod.LAST_7_DAYS:
                return DateRange.last(7)
            case AnalyticsPeriod.LAST_30_DAYS:
                return DateRange.last(30)
            default:
                throw new Error(`Unknown period: ${String(period)}`)
        }
    }

    /**
     * Get start date.
     */
    get startDate(): Date {
        return new Date(this._startDate)
    }

    /**
     * Get end date.
     */
    get endDate(): Date {
        return new Date(this._endDate)
    }

    /**
     * Check if a date is within this range (inclusive).
     */
    contains(date: Date): boolean {
        return date >= this._startDate && date <= this._endDate
    }

    /**
     * Get duration in milliseconds.
     */
    get durationMs(): number {
        return this._endDate.getTime() - this._startDate.getTime()
    }

    /**
     * Get duration in days.
     */
    get durationDays(): number {
        return Math.ceil(this.durationMs / (1000 * 60 * 60 * 24))
    }

    /**
     * Convert to JSON-serializable object.
     */
    toJSON(): { startDate: string; endDate: string } {
        return {
            startDate: this._startDate.toISOString(),
            endDate: this._endDate.toISOString(),
        }
    }

    /**
     * Create from JSON object.
     */
    static fromJSON(json: { startDate: string; endDate: string }): DateRange {
        return DateRange.create(new Date(json.startDate), new Date(json.endDate))
    }
}
