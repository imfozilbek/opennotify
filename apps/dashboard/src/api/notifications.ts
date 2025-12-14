import { apiGet } from "./client"
import type { ApiResponse, Notification, NotificationListData } from "@/types/api"

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
