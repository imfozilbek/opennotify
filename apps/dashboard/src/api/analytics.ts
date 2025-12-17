import type {
    AnalyticsChannelsData,
    AnalyticsLogsData,
    AnalyticsLogsQuery,
    AnalyticsSummaryData,
    AnalyticsSummaryQuery,
    ApiResponse,
} from "@/types/api"
import { apiGet } from "./client"

/**
 * Build query string from analytics query params.
 */
function buildQueryString(params: object): string {
    const searchParams = new URLSearchParams()

    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
            continue
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                searchParams.append(key, String(item))
            }
        } else {
            searchParams.append(key, String(value))
        }
    }

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ""
}

/**
 * Get analytics summary statistics.
 */
export async function getAnalyticsSummary(
    query?: AnalyticsSummaryQuery,
): Promise<ApiResponse<AnalyticsSummaryData>> {
    const queryString = query ? buildQueryString(query) : ""
    return apiGet<AnalyticsSummaryData>(`/api/v1/analytics/summary${queryString}`)
}

/**
 * Get analytics breakdown by channel.
 */
export async function getAnalyticsByChannel(
    query?: AnalyticsSummaryQuery,
): Promise<ApiResponse<AnalyticsChannelsData>> {
    const queryString = query ? buildQueryString(query) : ""
    return apiGet<AnalyticsChannelsData>(`/api/v1/analytics/channels${queryString}`)
}

/**
 * Get notification logs with filtering.
 */
export async function getAnalyticsLogs(
    query?: AnalyticsLogsQuery,
): Promise<ApiResponse<AnalyticsLogsData>> {
    const queryString = query ? buildQueryString(query) : ""
    return apiGet<AnalyticsLogsData>(`/api/v1/analytics/logs${queryString}`)
}
