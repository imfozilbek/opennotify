import { Injectable } from "@nestjs/common"
import {
    EskizAdapter,
    Notification,
    NotificationProviderPort,
    NotificationRepositoryPort,
    Provider,
    SendNotificationInput,
    SendNotificationUseCase,
    TelegramAdapter,
} from "@opennotify/core"
import { sharedNotificationRepository } from "../infrastructure/repositories"
import { SendNotificationDto } from "./dto/send-notification.dto"

@Injectable()
export class NotificationsService {
    private readonly providers: Map<Provider, NotificationProviderPort>
    private readonly repository: NotificationRepositoryPort
    private readonly sendUseCase: SendNotificationUseCase

    constructor() {
        this.providers = new Map()
        this.repository = sharedNotificationRepository
        this.initializeProviders()
        this.sendUseCase = new SendNotificationUseCase(this.providers, this.repository)
    }

    private initializeProviders(): void {
        // Initialize Eskiz if credentials are available
        if (process.env.ESKIZ_EMAIL && process.env.ESKIZ_PASSWORD) {
            this.providers.set(
                Provider.ESKIZ,
                new EskizAdapter({
                    email: process.env.ESKIZ_EMAIL,
                    password: process.env.ESKIZ_PASSWORD,
                    from: process.env.ESKIZ_FROM ?? "OpenNotify",
                }),
            )
        }

        // Initialize Telegram if bot token is available
        if (process.env.TELEGRAM_BOT_TOKEN) {
            this.providers.set(
                Provider.TELEGRAM_BOT,
                new TelegramAdapter({
                    botToken: process.env.TELEGRAM_BOT_TOKEN,
                }),
            )
        }
    }

    async send(
        dto: SendNotificationDto,
        merchantId: string,
    ): Promise<{ success: boolean; notificationId: string; errorMessage?: string }> {
        const notificationId = this.generateId()

        const input: SendNotificationInput = {
            id: notificationId,
            merchantId,
            provider: dto.provider as Provider,
            recipient: {
                phone: dto.recipient.phone,
                email: dto.recipient.email,
                telegramChatId: dto.recipient.telegramChatId,
                deviceToken: dto.recipient.deviceToken,
            },
            payload: {
                text: dto.payload.text,
                subject: dto.payload.subject,
                templateId: dto.payload.templateId,
                variables: dto.payload.variables,
            },
        }

        const result = await this.sendUseCase.execute(input)

        return {
            success: result.success,
            notificationId: result.notification.id,
            errorMessage: result.errorMessage,
        }
    }

    async getById(id: string): Promise<Notification | null> {
        return this.repository.findById(id)
    }

    async list(
        merchantId: string,
        page: number,
        limit: number,
    ): Promise<{ notifications: Notification[]; total: number }> {
        const all = await this.repository.findByMerchantId(merchantId)
        const total = all.length
        const start = (page - 1) * limit
        const notifications = all.slice(start, start + limit)

        return { notifications, total }
    }

    private generateId(): string {
        return `notif_${String(Date.now())}_${Math.random().toString(36).substring(2, 9)}`
    }
}
