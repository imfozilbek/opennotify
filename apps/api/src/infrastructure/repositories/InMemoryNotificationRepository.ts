import {
    AggregatedStats,
    Channel,
    ChannelStats,
    DateRange,
    Notification,
    NotificationFilters,
    NotificationRepositoryPort,
    NotificationStatus,
} from "@opennotify/core"

/**
 * In-memory implementation of NotificationRepositoryPort.
 * For development and testing purposes.
 */
export class InMemoryNotificationRepository implements NotificationRepositoryPort {
    private readonly notifications = new Map<string, Notification>()

    async save(notification: Notification): Promise<void> {
        this.notifications.set(notification.id, notification)
        return Promise.resolve()
    }

    async findById(id: string): Promise<Notification | null> {
        return Promise.resolve(this.notifications.get(id) ?? null)
    }

    async findByExternalId(externalId: string): Promise<Notification | null> {
        for (const notification of this.notifications.values()) {
            if (notification.externalId === externalId) {
                return Promise.resolve(notification)
            }
        }
        return Promise.resolve(null)
    }

    async findByMerchantId(
        merchantId: string,
        limit?: number,
        offset?: number,
    ): Promise<Notification[]> {
        const filtered = Array.from(this.notifications.values())
            .filter((n) => n.merchantId === merchantId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        if (offset !== undefined && limit !== undefined) {
            return Promise.resolve(filtered.slice(offset, offset + limit))
        }
        if (limit !== undefined) {
            return Promise.resolve(filtered.slice(0, limit))
        }
        return Promise.resolve(filtered)
    }

    async getStats(merchantId: string, dateRange?: DateRange): Promise<AggregatedStats> {
        const notifications = this.filterByMerchantAndDate(merchantId, dateRange)

        const byStatus: Record<NotificationStatus, number> = {
            [NotificationStatus.PENDING]: 0,
            [NotificationStatus.SENT]: 0,
            [NotificationStatus.DELIVERED]: 0,
            [NotificationStatus.FAILED]: 0,
        }

        const byChannel: Record<Channel, number> = {
            [Channel.SMS]: 0,
            [Channel.TELEGRAM]: 0,
            [Channel.EMAIL]: 0,
            [Channel.PUSH]: 0,
            [Channel.WHATSAPP]: 0,
        }

        for (const notification of notifications) {
            byStatus[notification.status]++
            byChannel[notification.channel]++
        }

        return Promise.resolve({
            total: notifications.length,
            byStatus,
            byChannel,
        })
    }

    async getStatsByChannel(merchantId: string, dateRange?: DateRange): Promise<ChannelStats[]> {
        const notifications = this.filterByMerchantAndDate(merchantId, dateRange)

        const channelMap = new Map<
            Channel,
            { pending: number; sent: number; delivered: number; failed: number }
        >()

        // Initialize all channels
        for (const channel of Object.values(Channel)) {
            channelMap.set(channel, { pending: 0, sent: 0, delivered: 0, failed: 0 })
        }

        // Count notifications per channel and status
        for (const notification of notifications) {
            const stats = channelMap.get(notification.channel)
            if (stats) {
                switch (notification.status) {
                    case NotificationStatus.PENDING:
                        stats.pending++
                        break
                    case NotificationStatus.SENT:
                        stats.sent++
                        break
                    case NotificationStatus.DELIVERED:
                        stats.delivered++
                        break
                    case NotificationStatus.FAILED:
                        stats.failed++
                        break
                }
            }
        }

        // Convert to ChannelStats array (only channels with data)
        const result: ChannelStats[] = []
        for (const [channel, stats] of channelMap) {
            const total = stats.pending + stats.sent + stats.delivered + stats.failed
            if (total > 0) {
                result.push(
                    ChannelStats.create({
                        channel,
                        total,
                        pending: stats.pending,
                        sent: stats.sent,
                        delivered: stats.delivered,
                        failed: stats.failed,
                    }),
                )
            }
        }

        return Promise.resolve(result)
    }

    async findWithFilters(
        merchantId: string,
        filters: NotificationFilters,
    ): Promise<Notification[]> {
        let notifications = this.filterByMerchantAndDate(merchantId, filters.dateRange)

        // Apply status filter
        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
            notifications = notifications.filter((n) => statuses.includes(n.status))
        }

        // Apply channel filter
        if (filters.channel) {
            const channels = Array.isArray(filters.channel) ? filters.channel : [filters.channel]
            notifications = notifications.filter((n) => channels.includes(n.channel))
        }

        // Apply provider filter
        if (filters.provider) {
            const providers = Array.isArray(filters.provider)
                ? filters.provider
                : [filters.provider]
            notifications = notifications.filter((n) => providers.includes(n.provider))
        }

        // Sort by createdAt descending
        notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        // Apply pagination
        if (filters.offset !== undefined && filters.limit !== undefined) {
            return Promise.resolve(
                notifications.slice(filters.offset, filters.offset + filters.limit),
            )
        }
        if (filters.limit !== undefined) {
            return Promise.resolve(notifications.slice(0, filters.limit))
        }

        return Promise.resolve(notifications)
    }

    async countWithFilters(merchantId: string, filters: NotificationFilters): Promise<number> {
        let notifications = this.filterByMerchantAndDate(merchantId, filters.dateRange)

        // Apply status filter
        if (filters.status) {
            const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
            notifications = notifications.filter((n) => statuses.includes(n.status))
        }

        // Apply channel filter
        if (filters.channel) {
            const channels = Array.isArray(filters.channel) ? filters.channel : [filters.channel]
            notifications = notifications.filter((n) => channels.includes(n.channel))
        }

        // Apply provider filter
        if (filters.provider) {
            const providers = Array.isArray(filters.provider)
                ? filters.provider
                : [filters.provider]
            notifications = notifications.filter((n) => providers.includes(n.provider))
        }

        return Promise.resolve(notifications.length)
    }

    /**
     * Filter notifications by merchant ID and optional date range.
     */
    private filterByMerchantAndDate(merchantId: string, dateRange?: DateRange): Notification[] {
        let result = Array.from(this.notifications.values()).filter(
            (n) => n.merchantId === merchantId,
        )

        if (dateRange) {
            result = result.filter((n) => dateRange.contains(n.createdAt))
        }

        return result
    }

    /**
     * Clear all notifications (for testing).
     */
    clear(): void {
        this.notifications.clear()
    }

    /**
     * Get total count (for testing).
     */
    size(): number {
        return this.notifications.size
    }
}

/**
 * Shared singleton instance for the application.
 */
export const sharedNotificationRepository = new InMemoryNotificationRepository()
