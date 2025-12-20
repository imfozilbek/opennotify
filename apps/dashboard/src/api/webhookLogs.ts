import { apiGet } from "./client"
import type { ApiResponse, WebhookLogsData, WebhookLogsQuery } from "@/types/api"

/**
 * Build query string from WebhookLogsQuery
 */
function buildQueryString(query?: WebhookLogsQuery): string {
    if (!query) {
        return ""
    }

    const params = new URLSearchParams()

    if (query.provider && query.provider.length > 0) {
        query.provider.forEach((p) => {
            params.append("provider", p)
        })
    }

    if (query.status && query.status.length > 0) {
        query.status.forEach((s) => {
            params.append("status", s)
        })
    }

    if (query.startDate) {
        params.append("startDate", query.startDate)
    }

    if (query.endDate) {
        params.append("endDate", query.endDate)
    }

    if (query.page) {
        params.append("page", query.page.toString())
    }

    if (query.limit) {
        params.append("limit", query.limit.toString())
    }

    const queryString = params.toString()
    return queryString ? `?${queryString}` : ""
}

/**
 * Get webhook logs for the current merchant.
 */
export async function getWebhookLogs(
    query?: WebhookLogsQuery,
): Promise<ApiResponse<WebhookLogsData>> {
    return apiGet<WebhookLogsData>(`/api/v1/logs/webhooks${buildQueryString(query)}`)
}
