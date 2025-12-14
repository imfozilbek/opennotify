/**
 * Analytics time period presets.
 */
export const AnalyticsPeriod = {
    /** Today (from midnight to now) */
    TODAY: "today",

    /** Current week (from Monday to now) */
    THIS_WEEK: "this_week",

    /** Current month (from 1st to now) */
    THIS_MONTH: "this_month",

    /** Last 7 days */
    LAST_7_DAYS: "last_7_days",

    /** Last 30 days */
    LAST_30_DAYS: "last_30_days",
} as const

export type AnalyticsPeriod = (typeof AnalyticsPeriod)[keyof typeof AnalyticsPeriod]

/**
 * Check if value is valid AnalyticsPeriod.
 */
export function isAnalyticsPeriod(value: unknown): value is AnalyticsPeriod {
    return (
        typeof value === "string" &&
        Object.values(AnalyticsPeriod).includes(value as AnalyticsPeriod)
    )
}

/**
 * Get all analytics periods.
 */
export function getAnalyticsPeriods(): AnalyticsPeriod[] {
    return Object.values(AnalyticsPeriod)
}
