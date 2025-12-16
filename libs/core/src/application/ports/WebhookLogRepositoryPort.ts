import { WebhookLog } from "../../domain/entities/WebhookLog"
import { Provider } from "../../domain/value-objects/Provider"
import { WebhookStatus } from "../../domain/value-objects/WebhookStatus"
import { DateRange } from "../../domain/value-objects/DateRange"

/**
 * Filters for querying webhook logs.
 */
export interface WebhookLogFilters {
    /** Filter by provider (single or multiple) */
    provider?: Provider | Provider[]

    /** Filter by webhook status (single or multiple) */
    status?: WebhookStatus | WebhookStatus[]

    /** Filter by date range */
    dateRange?: DateRange

    /** Maximum number of results */
    limit?: number

    /** Number of results to skip */
    offset?: number
}

/**
 * Port interface for webhook log persistence.
 * Implemented by infrastructure layer (database adapters).
 */
export interface WebhookLogRepositoryPort {
    /**
     * Save a webhook log entry.
     */
    save(log: WebhookLog): Promise<void>

    /**
     * Find webhook log by ID.
     */
    findById(id: string): Promise<WebhookLog | null>

    /**
     * Find webhook logs by merchant ID with optional filters.
     */
    findByMerchantId(merchantId: string, filters?: WebhookLogFilters): Promise<WebhookLog[]>

    /**
     * Count webhook logs matching filters.
     * Used for pagination total count.
     */
    countByMerchantId(merchantId: string, filters?: WebhookLogFilters): Promise<number>

    /**
     * Find webhook logs for a specific notification.
     */
    findByNotificationId(notificationId: string): Promise<WebhookLog[]>
}
