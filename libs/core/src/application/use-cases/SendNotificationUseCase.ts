import { CreateNotificationProps, Notification } from "../../domain/entities/Notification"
import { getChannelForProvider, Provider } from "../../domain/value-objects/Provider"
import { NotificationProviderPort } from "../ports/NotificationProviderPort"
import { NotificationRepositoryPort } from "../ports/NotificationRepositoryPort"

/**
 * Input for sending a notification.
 */
export interface SendNotificationInput {
    /** Unique notification ID */
    id: string

    /** Merchant sending the notification */
    merchantId: string

    /** Provider to use for sending */
    provider: Provider

    /** Recipient information */
    recipient: {
        phone?: string
        email?: string
        telegramChatId?: string
        deviceToken?: string
    }

    /** Message content */
    payload: {
        text: string
        subject?: string
        templateId?: string
        variables?: Record<string, string>
        metadata?: Record<string, unknown>
    }
}

/**
 * Output from sending a notification.
 */
export interface SendNotificationOutput {
    /** Whether the notification was sent successfully */
    success: boolean

    /** The notification entity */
    notification: Notification

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for sending notifications.
 *
 * @example
 * ```typescript
 * const useCase = new SendNotificationUseCase(providerRegistry, repository)
 *
 * const result = await useCase.execute({
 *     id: "notif_123",
 *     merchantId: "merchant_456",
 *     provider: Provider.ESKIZ,
 *     recipient: { phone: "+998901234567" },
 *     payload: { text: "Your OTP is 1234" },
 * })
 *
 * if (result.success) {
 *     console.log("Sent:", result.notification.externalId)
 * }
 * ```
 */
export class SendNotificationUseCase {
    constructor(
        private readonly providers: Map<Provider, NotificationProviderPort>,
        private readonly repository: NotificationRepositoryPort,
    ) {}

    async execute(input: SendNotificationInput): Promise<SendNotificationOutput> {
        const provider = this.providers.get(input.provider)
        if (!provider) {
            throw new Error(`Provider not configured: ${input.provider}`)
        }

        const channel = getChannelForProvider(input.provider)

        // Create notification entity
        const notificationProps: CreateNotificationProps = {
            id: input.id,
            merchantId: input.merchantId,
            channel,
            provider: input.provider,
            recipient: input.recipient,
            payload: input.payload,
        }

        const notification = Notification.create(notificationProps)

        // Send via provider
        const result = await provider.send({
            phone: input.recipient.phone,
            email: input.recipient.email,
            telegramChatId: input.recipient.telegramChatId,
            deviceToken: input.recipient.deviceToken,
            text: input.payload.text,
            subject: input.payload.subject,
        })

        if (result.success && result.externalId) {
            notification.markAsSent(result.externalId)
        } else {
            notification.markAsFailed(result.errorMessage ?? "Unknown error")
        }

        // Persist notification
        await this.repository.save(notification)

        return {
            success: result.success,
            notification,
            errorMessage: result.errorMessage,
        }
    }
}
