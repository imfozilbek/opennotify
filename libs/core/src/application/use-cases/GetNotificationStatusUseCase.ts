import { Notification } from "../../domain/entities/Notification"
import { isTerminalStatus, NotificationStatus } from "../../domain/value-objects/NotificationStatus"
import { Provider } from "../../domain/value-objects/Provider"
import { NotificationProviderPort } from "../ports/NotificationProviderPort"
import { NotificationRepositoryPort } from "../ports/NotificationRepositoryPort"

/**
 * Input for getting notification status.
 */
export interface GetNotificationStatusInput {
    /** Notification ID */
    notificationId: string

    /** Whether to refresh status from provider */
    refresh?: boolean
}

/**
 * Output from getting notification status.
 */
export interface GetNotificationStatusOutput {
    /** The notification entity */
    notification: Notification

    /** Current status */
    status: NotificationStatus

    /** Whether status was refreshed from provider */
    refreshed: boolean
}

/**
 * Use case for getting notification delivery status.
 *
 * @example
 * ```typescript
 * const useCase = new GetNotificationStatusUseCase(providerRegistry, repository)
 *
 * // Get cached status
 * const result = await useCase.execute({ notificationId: "notif_123" })
 *
 * // Refresh from provider
 * const fresh = await useCase.execute({ notificationId: "notif_123", refresh: true })
 * ```
 */
export class GetNotificationStatusUseCase {
    constructor(
        private readonly providers: Map<Provider, NotificationProviderPort>,
        private readonly repository: NotificationRepositoryPort,
    ) {}

    async execute(input: GetNotificationStatusInput): Promise<GetNotificationStatusOutput> {
        const notification = await this.repository.findById(input.notificationId)
        if (!notification) {
            throw new Error(`Notification not found: ${input.notificationId}`)
        }

        // If status is terminal or refresh not requested, return cached status
        if (!input.refresh || isTerminalStatus(notification.status)) {
            return {
                notification,
                status: notification.status,
                refreshed: false,
            }
        }

        // Refresh status from provider
        const provider = this.providers.get(notification.provider)
        if (!provider) {
            throw new Error(`Provider not configured: ${notification.provider}`)
        }

        const externalId = notification.externalId
        if (!externalId) {
            return {
                notification,
                status: notification.status,
                refreshed: false,
            }
        }

        const statusResult = await provider.getDeliveryStatus(externalId)

        // Update notification status if changed
        if (statusResult.status !== notification.status) {
            if (statusResult.status === NotificationStatus.DELIVERED) {
                notification.markAsDelivered()
            } else if (statusResult.status === NotificationStatus.FAILED) {
                notification.markAsFailed(statusResult.errorMessage ?? "Delivery failed")
            }

            await this.repository.save(notification)
        }

        return {
            notification,
            status: notification.status,
            refreshed: true,
        }
    }
}
