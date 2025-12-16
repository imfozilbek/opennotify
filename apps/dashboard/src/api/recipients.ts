import { apiDelete, apiGet, apiPost, apiPut } from "./client"
import type {
    ApiResponse,
    CreateRecipientRequest,
    LinkTelegramRequest,
    Recipient,
    RecipientListData,
    UpdateRecipientRequest,
} from "@/types/api"

export async function listRecipients(
    page = 1,
    limit = 20,
): Promise<ApiResponse<RecipientListData>> {
    return apiGet<RecipientListData>(
        `/api/v1/recipients?page=${String(page)}&limit=${String(limit)}`,
    )
}

export async function getRecipient(id: string): Promise<ApiResponse<{ recipient: Recipient }>> {
    return apiGet<{ recipient: Recipient }>(`/api/v1/recipients/${id}`)
}

export async function createRecipient(
    data: CreateRecipientRequest,
): Promise<ApiResponse<{ recipient: Recipient }>> {
    return apiPost<{ recipient: Recipient }>("/api/v1/recipients", data)
}

export async function updateRecipient(
    id: string,
    data: UpdateRecipientRequest,
): Promise<ApiResponse<{ recipient: Recipient }>> {
    return apiPut<{ recipient: Recipient }>(`/api/v1/recipients/${id}`, data)
}

export async function deleteRecipient(id: string): Promise<ApiResponse<undefined>> {
    return apiDelete<undefined>(`/api/v1/recipients/${id}`)
}

export async function linkTelegram(
    id: string,
    data: LinkTelegramRequest,
): Promise<ApiResponse<{ recipient: Recipient }>> {
    return apiPost<{ recipient: Recipient }>(`/api/v1/recipients/${id}/link-telegram`, data)
}
