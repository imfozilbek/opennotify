import { apiDelete, apiGet, apiPost } from "./client"
import type {
    ApiResponse,
    ConnectedProvider,
    ConnectProviderData,
    ConnectProviderRequest,
} from "@/types/api"

export async function listProviders(): Promise<ApiResponse<{ providers: ConnectedProvider[] }>> {
    return apiGet<{ providers: ConnectedProvider[] }>("/api/v1/providers")
}

export async function connectProvider(
    data: ConnectProviderRequest,
): Promise<ApiResponse<ConnectProviderData>> {
    return apiPost<ConnectProviderData>("/api/v1/providers", data)
}

export async function deleteProvider(id: string): Promise<ApiResponse<null>> {
    return apiDelete<null>(`/api/v1/providers/${id}`)
}
