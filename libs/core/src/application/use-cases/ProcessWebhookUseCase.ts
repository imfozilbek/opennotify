import { Notification } from "../../domain/entities/Notification"
import { WebhookLog } from "../../domain/entities/WebhookLog"
import { Provider } from "../../domain/value-objects/Provider"
import { WebhookStatus } from "../../domain/value-objects/WebhookStatus"
import { NotificationStatus } from "../../domain/value-objects/NotificationStatus"
import { NotificationProviderPort, WebhookPayload } from "../ports/NotificationProviderPort"
import { NotificationRepositoryPort } from "../ports/NotificationRepositoryPort"
import { WebhookLogRepositoryPort } from "../ports/WebhookLogRepositoryPort"

/**
 * Input for processing a webhook.
 */
export interface ProcessWebhookInput {
    /** Unique webhook log ID */
    id: string

    /** Provider that sent the webhook */
    provider: Provider

    /** Raw webhook payload */
    payload: WebhookPayload

    /** Client IP address */
    ipAddress?: string

    /** User agent string */
    userAgent?: string
}

/**
 * Output from processing a webhook.
 */
export interface ProcessWebhookOutput {
    /** Whether webhook was processed successfully */
    success: boolean

    /** Webhook processing status */
    webhookStatus: WebhookStatus

    /** Updated notification (if found) */
    notification?: Notification

    /** Webhook log entry */
    webhookLog: WebhookLog

    /** Error message if processing failed */
    errorMessage?: string
}

/**
 * Use case for processing incoming webhooks from providers.
 *
 * This use case:
 * 1. Verifies the webhook using the provider adapter
 * 2. Finds the related notification by externalId
 * 3. Updates the notification status
 * 4. Logs the webhook event
 *
 * @example
 * ```typescript
 * const useCase = new ProcessWebhookUseCase(
 *     providerRegistry,
 *     notificationRepository,
 *     webhookLogRepository,
 * )
 *
 * const result = await useCase.execute({
 *     id: "wh_123",
 *     provider: Provider.ESKIZ,
 *     payload: { body: webhookBody, headers: webhookHeaders },
 * })
 * ```
 */
export class ProcessWebhookUseCase {
    constructor(
        private readonly providers: Map<Provider, NotificationProviderPort>,
        private readonly notificationRepository: NotificationRepositoryPort,
        private readonly webhookLogRepository: WebhookLogRepositoryPort,
    ) {}

    async execute(input: ProcessWebhookInput): Promise<ProcessWebhookOutput> {
        const startTime = Date.now()

        // Create initial webhook log
        const webhookLog = WebhookLog.create(
            {
                id: input.id,
                merchantId: "unknown", // Will be updated if notification is found
                provider: input.provider,
            },
            input.payload.body,
            input.payload.headers,
            input.ipAddress,
            input.userAgent,
        )

        // Get provider adapter
        const adapter = this.providers.get(input.provider)
        if (!adapter) {
            webhookLog.markAsFailed(
                WebhookStatus.PROCESSING_ERROR,
                `Provider not configured: ${input.provider}`,
                Date.now() - startTime,
            )
            await this.webhookLogRepository.save(webhookLog)

            return {
                success: false,
                webhookStatus: WebhookStatus.PROCESSING_ERROR,
                webhookLog,
                errorMessage: `Provider not configured: ${input.provider}`,
            }
        }

        // Verify webhook with provider adapter
        const verifyResult = await adapter.verifyWebhook(input.payload)

        if (!verifyResult.valid) {
            const status = verifyResult.errorMessage?.toLowerCase().includes("signature")
                ? WebhookStatus.INVALID_SIGNATURE
                : WebhookStatus.INVALID_PAYLOAD

            webhookLog.markAsFailed(
                status,
                verifyResult.errorMessage ?? "Invalid webhook",
                Date.now() - startTime,
            )
            await this.webhookLogRepository.save(webhookLog)

            return {
                success: false,
                webhookStatus: status,
                webhookLog,
                errorMessage: verifyResult.errorMessage,
            }
        }

        // Find notification by external ID
        let notification: Notification | null = null

        if (verifyResult.externalId) {
            notification = await this.notificationRepository.findByExternalId(
                verifyResult.externalId,
            )

            if (notification) {
                // Update webhook log with notification info
                webhookLog.setMerchantId(notification.merchantId)
                webhookLog.setNotificationId(notification.id)

                // Update notification status if provided
                if (verifyResult.status) {
                    this.updateNotificationStatus(notification, verifyResult.status)
                    await this.notificationRepository.save(notification)
                }
            }
        }

        // Mark webhook as success
        webhookLog.markAsSuccess(
            verifyResult.status ?? NotificationStatus.PENDING,
            Date.now() - startTime,
        )
        await this.webhookLogRepository.save(webhookLog)

        return {
            success: true,
            webhookStatus: WebhookStatus.SUCCESS,
            notification: notification ?? undefined,
            webhookLog,
        }
    }

    /**
     * Update notification status based on webhook data.
     */
    private updateNotificationStatus(
        notification: Notification,
        newStatus: NotificationStatus,
    ): void {
        try {
            switch (newStatus) {
                case NotificationStatus.DELIVERED:
                    if (notification.status === NotificationStatus.SENT) {
                        notification.markAsDelivered()
                    }
                    break
                case NotificationStatus.FAILED:
                    if (
                        notification.status !== NotificationStatus.DELIVERED &&
                        notification.status !== NotificationStatus.FAILED
                    ) {
                        notification.markAsFailed("Delivery failed (reported via webhook)")
                    }
                    break
                // PENDING and SENT don't trigger updates via webhook
            }
        } catch {
            // Invalid state transition, ignore
        }
    }
}
