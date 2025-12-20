import { apiGet, apiPut } from "./client"
import type { ApiResponse, MerchantSettings, UpdateSettingsRequest } from "@/types/api"

/**
 * Get merchant settings.
 */
export async function getSettings(): Promise<ApiResponse<MerchantSettings>> {
    return apiGet<MerchantSettings>("/api/v1/settings")
}

/**
 * Update merchant settings.
 */
export async function updateSettings(
    data: UpdateSettingsRequest,
): Promise<ApiResponse<MerchantSettings>> {
    return apiPut<MerchantSettings>("/api/v1/settings", data)
}
