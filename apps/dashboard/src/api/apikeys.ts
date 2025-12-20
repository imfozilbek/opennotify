import { apiDelete, apiGet, apiPost } from "./client"
import type {
    ApiKeyListData,
    ApiResponse,
    CreateApiKeyData,
    CreateApiKeyRequest,
} from "@/types/api"

/**
 * List all API keys for the current merchant.
 */
export async function listApiKeys(): Promise<ApiResponse<ApiKeyListData>> {
    return apiGet<ApiKeyListData>("/api/v1/api-keys")
}

/**
 * Create a new API key.
 */
export async function createApiKey(
    data: CreateApiKeyRequest,
): Promise<ApiResponse<CreateApiKeyData>> {
    return apiPost<CreateApiKeyData>("/api/v1/api-keys", data)
}

/**
 * Revoke (delete) an API key.
 */
export async function revokeApiKey(keyId: string): Promise<ApiResponse<undefined>> {
    return apiDelete<undefined>(`/api/v1/api-keys/${keyId}`)
}
