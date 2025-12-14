import { OpenNotifyError } from "./errors.js"

/**
 * HTTP request configuration.
 */
export interface HttpRequestConfig {
    method: "GET" | "POST" | "PUT" | "DELETE"
    path: string
    body?: unknown
    query?: Record<string, string | number | undefined>
}

/**
 * API response wrapper.
 */
interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: {
        message: string
    }
}

/**
 * HTTP client for OpenNotify API.
 */
export class HttpClient {
    private readonly baseUrl: string
    private readonly apiKey: string
    private readonly timeout: number

    constructor(baseUrl: string, apiKey: string, timeout: number) {
        this.baseUrl = baseUrl.replace(/\/$/, "")
        this.apiKey = apiKey
        this.timeout = timeout
    }

    /**
     * Make an HTTP request to the API.
     */
    async request<T>(config: HttpRequestConfig): Promise<T> {
        const url = this.buildUrl(config.path, config.query)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
            controller.abort()
        }, this.timeout)

        try {
            const response = await fetch(url, {
                method: config.method,
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": this.apiKey,
                },
                body: config.body ? JSON.stringify(config.body) : undefined,
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            const json = (await response.json()) as ApiResponse<T>

            if (!response.ok) {
                throw OpenNotifyError.fromResponse(response.status, json.error?.message)
            }

            if (!json.success) {
                throw new OpenNotifyError(
                    json.error?.message ?? "Request failed",
                    "UNKNOWN_ERROR",
                    response.status,
                    json.error?.message,
                )
            }

            return json.data as T
        } catch (error) {
            clearTimeout(timeoutId)

            if (error instanceof OpenNotifyError) {
                throw error
            }

            if (error instanceof Error) {
                if (error.name === "AbortError") {
                    throw OpenNotifyError.timeoutError(this.timeout)
                }
                throw OpenNotifyError.networkError(error)
            }

            throw OpenNotifyError.networkError()
        }
    }

    /**
     * Make a GET request.
     */
    async get<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
        return this.request<T>({ method: "GET", path, query })
    }

    /**
     * Make a POST request.
     */
    async post<T>(path: string, body?: unknown): Promise<T> {
        return this.request<T>({ method: "POST", path, body })
    }

    /**
     * Make a PUT request.
     */
    async put<T>(path: string, body?: unknown): Promise<T> {
        return this.request<T>({ method: "PUT", path, body })
    }

    /**
     * Make a DELETE request.
     */
    async delete<T>(path: string): Promise<T> {
        return this.request<T>({ method: "DELETE", path })
    }

    /**
     * Build full URL with query parameters.
     */
    private buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
        const url = new URL(path, this.baseUrl)

        if (query) {
            for (const [key, value] of Object.entries(query)) {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value))
                }
            }
        }

        return url.toString()
    }
}
