import { Notification } from "../../domain/entities/Notification"
import { Channel } from "../../domain/value-objects/Channel"
import { Provider } from "../../domain/value-objects/Provider"
import { NotificationStatus } from "../../domain/value-objects/NotificationStatus"
import { DateRange } from "../../domain/value-objects/DateRange"
import { ChannelStats } from "../../domain/value-objects/ChannelStats"

/**
 * Filters for querying notifications.
 */
export interface NotificationFilters {
    /** Filter by status (single or multiple) */
    status?: NotificationStatus | NotificationStatus[]

    /** Filter by channel (single or multiple) */
    channel?: Channel | Channel[]

    /** Filter by provider (single or multiple) */
    provider?: Provider | Provider[]

    /** Filter by date range */
    dateRange?: DateRange

    /** Maximum number of results */
    limit?: number

    /** Number of results to skip */
    offset?: number
}

/**
 * Aggregated statistics by status and channel.
 */
export interface AggregatedStats {
    /** Total notifications count */
    total: number

    /** Count by status */
    byStatus: Record<NotificationStatus, number>

    /** Count by channel */
    byChannel: Record<Channel, number>
}

/**
 * Port interface for notification persistence.
 * Implemented by infrastructure layer (database adapters).
 */
export interface NotificationRepositoryPort {
    /**
     * Save a notification (create or update).
     */
    save(notification: Notification): Promise<void>

    /**
     * Find notification by ID.
     */
    findById(id: string): Promise<Notification | null>

    /**
     * Find notification by provider's external ID.
     */
    findByExternalId(externalId: string): Promise<Notification | null>

    /**
     * Find notifications by merchant ID.
     */
    findByMerchantId(merchantId: string, limit?: number, offset?: number): Promise<Notification[]>

    // ==================== Analytics Methods ====================

    /**
     * Get aggregated statistics for a merchant.
     * Returns total count and breakdown by status and channel.
     */
    getStats(merchantId: string, dateRange?: DateRange): Promise<AggregatedStats>

    /**
     * Get statistics grouped by channel.
     * Returns detailed stats for each channel.
     */
    getStatsByChannel(merchantId: string, dateRange?: DateRange): Promise<ChannelStats[]>

    /**
     * Find notifications with filters (for logs/search).
     * Supports filtering by status, channel, provider, and date range.
     */
    findWithFilters(merchantId: string, filters: NotificationFilters): Promise<Notification[]>

    /**
     * Count notifications matching filters.
     * Used for pagination total count.
     */
    countWithFilters(merchantId: string, filters: NotificationFilters): Promise<number>
}
