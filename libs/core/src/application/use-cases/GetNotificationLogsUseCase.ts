import { NotificationRepositoryPort } from "../ports/NotificationRepositoryPort"
import { Channel } from "../../domain/value-objects/Channel"
import { Provider } from "../../domain/value-objects/Provider"
import { NotificationStatus } from "../../domain/value-objects/NotificationStatus"
import { DateRange } from "../../domain/value-objects/DateRange"

/**
 * Input for GetNotificationLogsUseCase.
 */
export interface GetNotificationLogsInput {
    /** Merchant ID */
    merchantId: string

    /** Filters for querying logs */
    filters?: {
        /** Filter by status */
        status?: NotificationStatus[]

        /** Filter by channel */
        channel?: Channel[]

        /** Filter by provider */
        provider?: Provider[]
    }

    /** Date range filter */
    dateRange?: {
        startDate: Date
        endDate: Date
    }

    /** Pagination */
    pagination: {
        page: number
        limit: number
    }
}

/**
 * Single notification log entry.
 */
export interface NotificationLogEntry {
    id: string
    channel: Channel
    provider: Provider
    status: NotificationStatus
    recipient: string // Masked recipient (phone/email)
    createdAt: string
    sentAt?: string
    deliveredAt?: string
    failedAt?: string
    errorMessage?: string
}

/**
 * Output for GetNotificationLogsUseCase.
 */
export interface GetNotificationLogsOutput {
    /** Log entries */
    logs: NotificationLogEntry[]

    /** Pagination info */
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

/**
 * Use case for getting notification logs with filters.
 *
 * Returns paginated notification logs for a merchant,
 * with optional filtering by status, channel, provider, and date range.
 *
 * @example
 * ```typescript
 * const useCase = new GetNotificationLogsUseCase(repository)
 *
 * const result = await useCase.execute({
 *     merchantId: "merchant_123",
 *     filters: {
 *         status: [NotificationStatus.FAILED],
 *         channel: [Channel.SMS],
 *     },
 *     pagination: { page: 1, limit: 20 },
 * })
 *
 * console.log(`Found ${result.pagination.total} failed SMS notifications`)
 * ```
 */
export class GetNotificationLogsUseCase {
    constructor(private readonly repository: NotificationRepositoryPort) {}

    async execute(input: GetNotificationLogsInput): Promise<GetNotificationLogsOutput> {
        const { merchantId, filters, pagination } = input

        // Build date range if provided
        const dateRange = input.dateRange
            ? DateRange.create(input.dateRange.startDate, input.dateRange.endDate)
            : undefined

        // Calculate offset
        const offset = (pagination.page - 1) * pagination.limit

        // Build repository filters
        const repositoryFilters = {
            status: filters?.status,
            channel: filters?.channel,
            provider: filters?.provider,
            dateRange,
            limit: pagination.limit,
            offset,
        }

        // Get notifications and total count in parallel
        const [notifications, total] = await Promise.all([
            this.repository.findWithFilters(merchantId, repositoryFilters),
            this.repository.countWithFilters(merchantId, {
                status: filters?.status,
                channel: filters?.channel,
                provider: filters?.provider,
                dateRange,
            }),
        ])

        // Transform to log entries
        const logs: NotificationLogEntry[] = notifications.map((notification) => ({
            id: notification.id,
            channel: notification.channel,
            provider: notification.provider,
            status: notification.status,
            recipient: this.maskRecipient(notification),
            createdAt: notification.createdAt.toISOString(),
            sentAt: notification.sentAt?.toISOString(),
            deliveredAt: notification.deliveredAt?.toISOString(),
            failedAt: notification.failedAt?.toISOString(),
            errorMessage: notification.errorMessage,
        }))

        // Calculate total pages
        const totalPages = Math.ceil(total / pagination.limit)

        return {
            logs,
            pagination: {
                total,
                page: pagination.page,
                limit: pagination.limit,
                totalPages,
            },
        }
    }

    /**
     * Mask recipient information for privacy.
     */
    private maskRecipient(notification: { recipient: { phone?: string; email?: string } }): string {
        const { phone, email } = notification.recipient

        if (phone) {
            // Mask phone: +998901234567 -> +998***4567
            if (phone.length > 7) {
                return `${phone.slice(0, 4)}***${phone.slice(-4)}`
            }
            return `***${phone.slice(-4)}`
        }

        if (email) {
            // Mask email: user@example.com -> u***@example.com
            const [local, domain] = email.split("@")
            if (local && domain) {
                const maskedLocal = `${local.charAt(0)}***`
                return `${maskedLocal}@${domain}`
            }
            return "***@***"
        }

        return "***"
    }
}
