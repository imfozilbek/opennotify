import { WebhookLog, WebhookLogFilters, WebhookLogRepositoryPort } from "@opennotify/core"

/**
 * In-memory implementation of WebhookLogRepositoryPort.
 * For development and testing purposes.
 */
export class InMemoryWebhookLogRepository implements WebhookLogRepositoryPort {
    private readonly logs = new Map<string, WebhookLog>()

    async save(log: WebhookLog): Promise<void> {
        this.logs.set(log.id, log)
        return Promise.resolve()
    }

    async findById(id: string): Promise<WebhookLog | null> {
        return Promise.resolve(this.logs.get(id) ?? null)
    }

    async findByMerchantId(merchantId: string, filters?: WebhookLogFilters): Promise<WebhookLog[]> {
        let result = Array.from(this.logs.values()).filter((log) => log.merchantId === merchantId)

        result = this.applyFilters(result, filters)

        // Sort by createdAt descending
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        // Apply pagination
        if (filters?.offset !== undefined && filters?.limit !== undefined) {
            return Promise.resolve(result.slice(filters.offset, filters.offset + filters.limit))
        }
        if (filters?.limit !== undefined) {
            return Promise.resolve(result.slice(0, filters.limit))
        }

        return Promise.resolve(result)
    }

    async countByMerchantId(merchantId: string, filters?: WebhookLogFilters): Promise<number> {
        let result = Array.from(this.logs.values()).filter((log) => log.merchantId === merchantId)

        result = this.applyFilters(result, filters)

        return Promise.resolve(result.length)
    }

    async findByNotificationId(notificationId: string): Promise<WebhookLog[]> {
        return Promise.resolve(
            Array.from(this.logs.values())
                .filter((log) => log.notificationId === notificationId)
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        )
    }

    /**
     * Apply filters to webhook logs.
     */
    private applyFilters(logs: WebhookLog[], filters?: WebhookLogFilters): WebhookLog[] {
        if (!filters) {
            return logs
        }

        let result = logs

        // Filter by provider
        if (filters.provider) {
            const providers = Array.isArray(filters.provider)
                ? filters.provider
                : [filters.provider]
            result = result.filter((log) => providers.includes(log.provider))
        }

        // Filter by status
        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
            result = result.filter((log) => statuses.includes(log.status))
        }

        // Filter by date range
        if (filters.dateRange) {
            const dateRange = filters.dateRange
            result = result.filter((log) => dateRange.contains(log.createdAt))
        }

        return result
    }

    /**
     * Clear all logs (for testing).
     */
    clear(): void {
        this.logs.clear()
    }

    /**
     * Get total count (for testing).
     */
    size(): number {
        return this.logs.size
    }
}

/**
 * Shared singleton instance for the application.
 */
export const sharedWebhookLogRepository = new InMemoryWebhookLogRepository()
