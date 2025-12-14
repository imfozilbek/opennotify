import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Query,
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
    recipient: string
    payload: {
        text: string
        subject?: string
    }
    createdAt: string
    sentAt?: string
    deliveredAt?: string
}

interface NotificationListResponse {
    success: boolean
    data?: {
        notifications: NotificationResponse[]
        total: number
        page: number
        limit: number
    }
    error?: {
        message: string
    }
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

    @Get()
    @RequirePermissions(ApiKeyPermission.READ)
    async list(
        @CurrentMerchant() merchant: Merchant,
        @Query("page") pageStr?: string,
        @Query("limit") limitStr?: string,
    ): Promise<NotificationListResponse> {
        const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1)
        const limit = Math.min(100, Math.max(1, parseInt(limitStr ?? "20", 10) || 20))

        const result = await this.notificationsService.list(merchant.id, page, limit)

        return {
            success: true,
            data: {
                notifications: result.notifications.map((n) => ({
                    id: n.id,
                    status: n.status,
                    channel: n.channel,
                    provider: n.provider,
                    recipient:
                        n.recipient.phone ?? n.recipient.email ?? n.recipient.telegramChatId ?? "",
                    payload: {
                        text: n.payload.text,
                        subject: n.payload.subject,
                    },
                    createdAt: n.createdAt.toISOString(),
                    sentAt: n.sentAt?.toISOString(),
                    deliveredAt: n.deliveredAt?.toISOString(),
                })),
                total: result.total,
                page,
                limit,
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
            recipient:
                notification.recipient.phone ??
                notification.recipient.email ??
                notification.recipient.telegramChatId ??
                "",
            payload: {
                text: notification.payload.text,
                subject: notification.payload.subject,
            },
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
