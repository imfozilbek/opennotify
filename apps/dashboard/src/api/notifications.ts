import { apiGet, apiPost } from "./client"
import type {
    ApiResponse,
    Notification,
    NotificationListData,
    SendNotificationData,
    SendNotificationRequest,
} from "@/types/api"

export async function listNotifications(
    page = 1,
    limit = 20,
): Promise<ApiResponse<NotificationListData>> {
    return apiGet<NotificationListData>(
        `/api/v1/notifications?page=${String(page)}&limit=${String(limit)}`,
    )
}

export async function getNotification(id: string): Promise<ApiResponse<Notification>> {
    return apiGet<Notification>(`/api/v1/notifications/${id}`)
}

export async function getNotificationStatus(id: string): Promise<ApiResponse<{ status: string }>> {
    return apiGet<{ status: string }>(`/api/v1/notifications/${id}/status`)
}

export async function sendNotification(
    data: SendNotificationRequest,
): Promise<ApiResponse<SendNotificationData>> {
    return apiPost<SendNotificationData>("/api/v1/notifications/send", data)
}
