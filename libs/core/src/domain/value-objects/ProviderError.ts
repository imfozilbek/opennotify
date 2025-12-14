import { RetryableErrorType } from "./RetryPolicy"

/**
 * Error category classification.
 */
export enum ErrorCategory {
    /** Temporary error - should be retried */
    RETRYABLE = "retryable",

    /** Permanent error - should not be retried */
    PERMANENT = "permanent",

    /** Unknown error - depends on context */
    UNKNOWN = "unknown",
}

/**
 * Specific error codes for provider errors.
 */
export enum ProviderErrorCode {
    // Retryable errors
    TIMEOUT = "timeout",
    RATE_LIMITED = "rate_limited",
    SERVER_ERROR = "server_error",
    CONNECTION_FAILED = "connection_failed",
    SERVICE_UNAVAILABLE = "service_unavailable",

    // Permanent errors
    INVALID_CREDENTIALS = "invalid_credentials",
    INVALID_RECIPIENT = "invalid_recipient",
    INVALID_PHONE = "invalid_phone",
    INVALID_EMAIL = "invalid_email",
    INVALID_REQUEST = "invalid_request",
    INSUFFICIENT_BALANCE = "insufficient_balance",
    BLOCKED_RECIPIENT = "blocked_recipient",
    PROVIDER_NOT_CONFIGURED = "provider_not_configured",

    // Unknown
    UNKNOWN = "unknown",
}

/**
 * Properties for creating a ProviderError.
 */
export interface ProviderErrorProps {
    /** Error code */
    code: ProviderErrorCode

    /** Human-readable error message */
    message: string

    /** Original error or response */
    cause?: unknown

    /** HTTP status code if applicable */
    httpStatus?: number

    /** Provider-specific error code */
    providerCode?: string
}

/**
 * Mapping from error codes to categories.
 */
const ERROR_CATEGORY_MAP: Record<ProviderErrorCode, ErrorCategory> = {
    // Retryable
    [ProviderErrorCode.TIMEOUT]: ErrorCategory.RETRYABLE,
    [ProviderErrorCode.RATE_LIMITED]: ErrorCategory.RETRYABLE,
    [ProviderErrorCode.SERVER_ERROR]: ErrorCategory.RETRYABLE,
    [ProviderErrorCode.CONNECTION_FAILED]: ErrorCategory.RETRYABLE,
    [ProviderErrorCode.SERVICE_UNAVAILABLE]: ErrorCategory.RETRYABLE,

    // Permanent
    [ProviderErrorCode.INVALID_CREDENTIALS]: ErrorCategory.PERMANENT,
    [ProviderErrorCode.INVALID_RECIPIENT]: ErrorCategory.PERMANENT,
    [ProviderErrorCode.INVALID_PHONE]: ErrorCategory.PERMANENT,
    [ProviderErrorCode.INVALID_EMAIL]: ErrorCategory.PERMANENT,
    [ProviderErrorCode.INVALID_REQUEST]: ErrorCategory.PERMANENT,
    [ProviderErrorCode.INSUFFICIENT_BALANCE]: ErrorCategory.PERMANENT,
    [ProviderErrorCode.BLOCKED_RECIPIENT]: ErrorCategory.PERMANENT,
    [ProviderErrorCode.PROVIDER_NOT_CONFIGURED]: ErrorCategory.PERMANENT,

    // Unknown
    [ProviderErrorCode.UNKNOWN]: ErrorCategory.UNKNOWN,
}

/**
 * Mapping from error codes to retryable error types.
 */
const RETRYABLE_ERROR_TYPE_MAP: Partial<Record<ProviderErrorCode, RetryableErrorType>> = {
    [ProviderErrorCode.TIMEOUT]: RetryableErrorType.TIMEOUT,
    [ProviderErrorCode.RATE_LIMITED]: RetryableErrorType.RATE_LIMIT,
    [ProviderErrorCode.SERVER_ERROR]: RetryableErrorType.SERVER_ERROR,
    [ProviderErrorCode.CONNECTION_FAILED]: RetryableErrorType.CONNECTION_ERROR,
    [ProviderErrorCode.SERVICE_UNAVAILABLE]: RetryableErrorType.SERVER_ERROR,
}

/**
 * Provider error value object.
 *
 * Represents an error from a notification provider with classification
 * for retry decisions and error handling.
 *
 * @example
 * ```typescript
 * // From an Error object
 * const error = ProviderError.fromError(new Error("Connection timeout"))
 *
 * // From HTTP status
 * const error = ProviderError.fromHttpStatus(429, "Rate limit exceeded")
 *
 * // Check if retryable
 * if (error.isRetryable()) {
 *     // retry with backoff
 * }
 *
 * // Get retry error type for policy
 * const retryType = error.getRetryableErrorType()
 * if (retryType && policy.shouldRetry(retryType, attempt)) {
 *     // retry
 * }
 * ```
 */
export class ProviderError {
    private readonly _props: ProviderErrorProps

    private constructor(props: ProviderErrorProps) {
        this._props = { ...props }
    }

    /**
     * Create a provider error from props.
     */
    static create(props: ProviderErrorProps): ProviderError {
        return new ProviderError(props)
    }

    /**
     * Create from a JavaScript Error object.
     */
    static fromError(error: Error): ProviderError {
        const message = error.message.toLowerCase()

        // Detect timeout errors
        if (
            message.includes("timeout") ||
            message.includes("timed out") ||
            message.includes("etimedout")
        ) {
            return new ProviderError({
                code: ProviderErrorCode.TIMEOUT,
                message: error.message,
                cause: error,
            })
        }

        // Detect connection errors
        if (
            message.includes("econnrefused") ||
            message.includes("econnreset") ||
            message.includes("enotfound") ||
            message.includes("connection")
        ) {
            return new ProviderError({
                code: ProviderErrorCode.CONNECTION_FAILED,
                message: error.message,
                cause: error,
            })
        }

        // Detect network errors
        if (message.includes("network") || message.includes("fetch failed")) {
            return new ProviderError({
                code: ProviderErrorCode.CONNECTION_FAILED,
                message: error.message,
                cause: error,
            })
        }

        // Unknown error
        return new ProviderError({
            code: ProviderErrorCode.UNKNOWN,
            message: error.message,
            cause: error,
        })
    }

    /**
     * Create from HTTP status code.
     */
    static fromHttpStatus(status: number, message?: string): ProviderError {
        const errorMessage = message ?? `HTTP ${String(status)}`

        // Rate limiting
        if (status === 429) {
            return new ProviderError({
                code: ProviderErrorCode.RATE_LIMITED,
                message: errorMessage,
                httpStatus: status,
            })
        }

        // Server errors (5xx) - retryable
        if (status >= 500) {
            if (status === 503) {
                return new ProviderError({
                    code: ProviderErrorCode.SERVICE_UNAVAILABLE,
                    message: errorMessage,
                    httpStatus: status,
                })
            }
            return new ProviderError({
                code: ProviderErrorCode.SERVER_ERROR,
                message: errorMessage,
                httpStatus: status,
            })
        }

        // Client errors (4xx) - permanent
        if (status === 401 || status === 403) {
            return new ProviderError({
                code: ProviderErrorCode.INVALID_CREDENTIALS,
                message: errorMessage,
                httpStatus: status,
            })
        }

        if (status === 400) {
            return new ProviderError({
                code: ProviderErrorCode.INVALID_REQUEST,
                message: errorMessage,
                httpStatus: status,
            })
        }

        if (status === 404) {
            return new ProviderError({
                code: ProviderErrorCode.INVALID_RECIPIENT,
                message: errorMessage,
                httpStatus: status,
            })
        }

        if (status >= 400 && status < 500) {
            return new ProviderError({
                code: ProviderErrorCode.INVALID_REQUEST,
                message: errorMessage,
                httpStatus: status,
            })
        }

        return new ProviderError({
            code: ProviderErrorCode.UNKNOWN,
            message: errorMessage,
            httpStatus: status,
        })
    }

    /**
     * Create from error message string.
     */
    static fromMessage(message: string): ProviderError {
        const lowerMessage = message.toLowerCase()

        // Check for common patterns
        if (lowerMessage.includes("invalid phone") || lowerMessage.includes("phone number")) {
            return new ProviderError({
                code: ProviderErrorCode.INVALID_PHONE,
                message,
            })
        }

        if (lowerMessage.includes("invalid email") || lowerMessage.includes("email address")) {
            return new ProviderError({
                code: ProviderErrorCode.INVALID_EMAIL,
                message,
            })
        }

        if (
            lowerMessage.includes("balance") ||
            lowerMessage.includes("insufficient") ||
            lowerMessage.includes("credit")
        ) {
            return new ProviderError({
                code: ProviderErrorCode.INSUFFICIENT_BALANCE,
                message,
            })
        }

        if (lowerMessage.includes("blocked") || lowerMessage.includes("blacklist")) {
            return new ProviderError({
                code: ProviderErrorCode.BLOCKED_RECIPIENT,
                message,
            })
        }

        if (lowerMessage.includes("rate") && lowerMessage.includes("limit")) {
            return new ProviderError({
                code: ProviderErrorCode.RATE_LIMITED,
                message,
            })
        }

        if (
            lowerMessage.includes("credential") ||
            lowerMessage.includes("unauthorized") ||
            lowerMessage.includes("authentication")
        ) {
            return new ProviderError({
                code: ProviderErrorCode.INVALID_CREDENTIALS,
                message,
            })
        }

        return new ProviderError({
            code: ProviderErrorCode.UNKNOWN,
            message,
        })
    }

    /**
     * Create a timeout error.
     */
    static timeout(message?: string): ProviderError {
        return new ProviderError({
            code: ProviderErrorCode.TIMEOUT,
            message: message ?? "Request timed out",
        })
    }

    /**
     * Create a rate limit error.
     */
    static rateLimited(message?: string): ProviderError {
        return new ProviderError({
            code: ProviderErrorCode.RATE_LIMITED,
            message: message ?? "Rate limit exceeded",
        })
    }

    /**
     * Create an invalid recipient error.
     */
    static invalidRecipient(message?: string): ProviderError {
        return new ProviderError({
            code: ProviderErrorCode.INVALID_RECIPIENT,
            message: message ?? "Invalid recipient",
        })
    }

    // Getters
    get code(): ProviderErrorCode {
        return this._props.code
    }

    get message(): string {
        return this._props.message
    }

    get cause(): unknown {
        return this._props.cause
    }

    get httpStatus(): number | undefined {
        return this._props.httpStatus
    }

    get providerCode(): string | undefined {
        return this._props.providerCode
    }

    /**
     * Get the error category.
     */
    get category(): ErrorCategory {
        return ERROR_CATEGORY_MAP[this._props.code]
    }

    /**
     * Check if this error is retryable.
     */
    isRetryable(): boolean {
        return this.category === ErrorCategory.RETRYABLE
    }

    /**
     * Check if this error is permanent (should not be retried).
     */
    isPermanent(): boolean {
        return this.category === ErrorCategory.PERMANENT
    }

    /**
     * Check if this error category is unknown.
     */
    isUnknown(): boolean {
        return this.category === ErrorCategory.UNKNOWN
    }

    /**
     * Get the retryable error type for use with RetryPolicy.
     * Returns undefined if not retryable.
     */
    getRetryableErrorType(): RetryableErrorType | undefined {
        return RETRYABLE_ERROR_TYPE_MAP[this._props.code]
    }

    /**
     * Convert to a plain error message.
     */
    toString(): string {
        return `[${this._props.code}] ${this._props.message}`
    }

    /**
     * Convert to plain object for persistence/logging.
     */
    toPersistence(): ProviderErrorProps & { category: ErrorCategory } {
        return {
            ...this._props,
            category: this.category,
        }
    }
}
