/**
 * Error codes for OpenNotify SDK errors.
 */
export type OpenNotifyErrorCode =
    | "NETWORK_ERROR"
    | "TIMEOUT_ERROR"
    | "AUTHENTICATION_ERROR"
    | "VALIDATION_ERROR"
    | "NOT_FOUND"
    | "RATE_LIMIT"
    | "SERVER_ERROR"
    | "UNKNOWN_ERROR"

/**
 * Base error class for all OpenNotify SDK errors.
 */
export class OpenNotifyError extends Error {
    /**
     * Error code for programmatic handling.
     */
    readonly code: OpenNotifyErrorCode

    /**
     * HTTP status code (if applicable).
     */
    readonly statusCode?: number

    /**
     * Original error message from API.
     */
    readonly apiMessage?: string

    constructor(
        message: string,
        code: OpenNotifyErrorCode,
        statusCode?: number,
        apiMessage?: string,
    ) {
        super(message)
        this.code = code
        this.statusCode = statusCode
        this.apiMessage = apiMessage
        this.name = "OpenNotifyError"
    }

    /**
     * Check if error is retryable.
     */
    isRetryable(): boolean {
        return (
            this.code === "NETWORK_ERROR" ||
            this.code === "TIMEOUT_ERROR" ||
            this.code === "RATE_LIMIT" ||
            this.code === "SERVER_ERROR"
        )
    }

    /**
     * Create error from HTTP response.
     */
    static fromResponse(statusCode: number, message?: string): OpenNotifyError {
        const apiMessage = message

        switch (statusCode) {
            case 401:
                return new OpenNotifyError(
                    "Invalid API key",
                    "AUTHENTICATION_ERROR",
                    statusCode,
                    apiMessage,
                )
            case 403:
                return new OpenNotifyError(
                    "Insufficient permissions",
                    "AUTHENTICATION_ERROR",
                    statusCode,
                    apiMessage,
                )
            case 404:
                return new OpenNotifyError(
                    message ?? "Resource not found",
                    "NOT_FOUND",
                    statusCode,
                    apiMessage,
                )
            case 422:
            case 400:
                return new OpenNotifyError(
                    message ?? "Validation error",
                    "VALIDATION_ERROR",
                    statusCode,
                    apiMessage,
                )
            case 429:
                return new OpenNotifyError(
                    "Rate limit exceeded",
                    "RATE_LIMIT",
                    statusCode,
                    apiMessage,
                )
            default:
                if (statusCode >= 500) {
                    return new OpenNotifyError(
                        message ?? "Server error",
                        "SERVER_ERROR",
                        statusCode,
                        apiMessage,
                    )
                }
                return new OpenNotifyError(
                    message ?? "Unknown error",
                    "UNKNOWN_ERROR",
                    statusCode,
                    apiMessage,
                )
        }
    }

    /**
     * Create network error.
     */
    static networkError(cause?: Error): OpenNotifyError {
        const error = new OpenNotifyError(
            cause?.message ?? "Network request failed",
            "NETWORK_ERROR",
        )
        if (cause) {
            error.cause = cause
        }
        return error
    }

    /**
     * Create timeout error.
     */
    static timeoutError(timeoutMs: number): OpenNotifyError {
        return new OpenNotifyError(
            `Request timed out after ${String(timeoutMs)}ms`,
            "TIMEOUT_ERROR",
        )
    }
}
