import type { ApiResponse } from "@/types/api"

const API_BASE_URL = import.meta.env.VITE_API_URL || ""

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode: number,
    ) {
        super(message)
        this.name = "ApiError"
    }
}

function getApiKey(): string | null {
    return localStorage.getItem("apiKey")
}

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<ApiResponse<T>> {
    const apiKey = getApiKey()

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    }

    // Merge existing headers if provided
    if (options.headers) {
        const existingHeaders = options.headers as Record<string, string>
        for (const [key, value] of Object.entries(existingHeaders)) {
            headers[key] = value
        }
    }

    if (apiKey) {
        headers["X-API-Key"] = apiKey
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    })

    if (response.status === 401) {
        localStorage.removeItem("apiKey")
        localStorage.removeItem("merchantId")
        window.location.href = "/login"
        throw new ApiError("Unauthorized", 401)
    }

    const data = (await response.json()) as ApiResponse<T>

    if (!response.ok && !data.error) {
        throw new ApiError(`HTTP error ${String(response.status)}`, response.status)
    }

    return data
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiClient<T>(endpoint, { method: "GET" })
}

export async function apiPost<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return apiClient<T>(endpoint, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
    })
}

export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return apiClient<T>(endpoint, { method: "DELETE" })
}
