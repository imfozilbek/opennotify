/**
 * OpenNotify client configuration options.
 */
export interface OpenNotifyOptions {
    /**
     * Your API key from OpenNotify dashboard.
     */
    apiKey: string

    /**
     * Base URL for the API.
     * @default "https://api.opennotify.dev/api/v1"
     */
    baseUrl?: string

    /**
     * Request timeout in milliseconds.
     * @default 30000
     */
    timeout?: number
}

/**
 * Pagination options for list endpoints.
 */
export interface PaginationOptions {
    /**
     * Page number (1-based).
     * @default 1
     */
    page?: number

    /**
     * Number of items per page.
     * @default 20
     */
    limit?: number
}
