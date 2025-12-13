import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common"
import { NotificationsService } from "./notifications.service"
import { SendNotificationDto } from "./dto/send-notification.dto"

interface SendResponse {
    success: boolean
    data?: {
        notificationId: string
    }
    error?: {
        message: string
    }
}

interface NotificationResponse {
    id: string
    status: string
    channel: string
    provider: string
    createdAt: string
    sentAt?: string
    deliveredAt?: string
}

@Controller("notifications")
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post("send")
    async send(@Body() dto: SendNotificationDto): Promise<SendResponse> {
        // TODO: Get merchantId from API key auth
        const merchantId = "demo_merchant"

        const result = await this.notificationsService.send(dto, merchantId)

        if (!result.success) {
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to send notification",
                },
            }
        }

        return {
            success: true,
            data: {
                notificationId: result.notificationId,
            },
        }
    }

    @Get(":id")
    async getById(@Param("id") id: string): Promise<NotificationResponse> {
        const notification = await this.notificationsService.getById(id)

        if (!notification) {
            throw new HttpException("Notification not found", HttpStatus.NOT_FOUND)
        }

        return {
            id: notification.id,
            status: notification.status,
            channel: notification.channel,
            provider: notification.provider,
            createdAt: notification.createdAt.toISOString(),
            sentAt: notification.sentAt?.toISOString(),
            deliveredAt: notification.deliveredAt?.toISOString(),
        }
    }

    @Get(":id/status")
    async getStatus(@Param("id") id: string): Promise<{ status: string }> {
        const notification = await this.notificationsService.getById(id)

        if (!notification) {
            throw new HttpException("Notification not found", HttpStatus.NOT_FOUND)
        }

        return {
            status: notification.status,
        }
    }
}
