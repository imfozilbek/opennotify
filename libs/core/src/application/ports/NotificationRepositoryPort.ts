import { Notification } from "../../domain/entities/Notification"

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
}
