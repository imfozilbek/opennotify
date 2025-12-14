import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    UseGuards,
} from "@nestjs/common"
import { ApiKeyPermission, Merchant } from "@opennotify/core"
import { CurrentMerchant, RequirePermissions } from "../common/decorators"
import { ApiKeyGuard } from "../common/guards"
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
@UseGuards(ApiKeyGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Post("send")
    @RequirePermissions(ApiKeyPermission.SEND)
    async send(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: SendNotificationDto,
    ): Promise<SendResponse> {
        const result = await this.notificationsService.send(dto, merchant.id)

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
    @RequirePermissions(ApiKeyPermission.READ)
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
    @RequirePermissions(ApiKeyPermission.READ)
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
