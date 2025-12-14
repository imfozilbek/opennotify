import { apiPost } from "./client"
import type { ApiResponse, RegisterData, RegisterRequest } from "@/types/api"

export async function register(data: RegisterRequest): Promise<ApiResponse<RegisterData>> {
    return apiPost<RegisterData>("/api/v1/auth/register", data)
}
