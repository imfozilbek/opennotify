/**
 * Error types that can be retried.
 */
export enum RetryableErrorType {
    /** Network timeout */
    TIMEOUT = "timeout",

    /** Rate limit exceeded */
    RATE_LIMIT = "rate_limit",

    /** Server error (5xx) */
    SERVER_ERROR = "server_error",

    /** Connection error */
    CONNECTION_ERROR = "connection_error",
}

/**
 * Properties for creating a RetryPolicy.
 */
export interface RetryPolicyProps {
    /** Maximum number of retries per provider (default: 1) */
    maxRetries?: number

    /** Initial delay in milliseconds (default: 1000) */
    baseDelayMs?: number

    /** Maximum delay cap in milliseconds (default: 10000) */
    maxDelayMs?: number

    /** Exponential backoff multiplier (default: 2) */
    backoffMultiplier?: number

    /** Error types that should trigger a retry (default: all retryable errors) */
    retryableErrors?: RetryableErrorType[]

    /** Whether to add random jitter to delays (default: true) */
    jitter?: boolean
}

const DEFAULT_RETRY_POLICY: Required<RetryPolicyProps> = {
    maxRetries: 1,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
        RetryableErrorType.TIMEOUT,
        RetryableErrorType.RATE_LIMIT,
        RetryableErrorType.SERVER_ERROR,
        RetryableErrorType.CONNECTION_ERROR,
    ],
    jitter: true,
}

/**
 * Retry policy value object.
 *
 * Configures how retries should be handled when sending notifications.
 * Supports exponential backoff with optional jitter.
 *
 * @example
 * ```typescript
 * // Create a policy with custom settings
 * const policy = RetryPolicy.create({
 *     maxRetries: 3,
 *     baseDelayMs: 500,
 *     backoffMultiplier: 2,
 * })
 *
 * // Calculate delay for retry attempt
 * const delay = policy.getDelayForAttempt(1) // ~1000ms (500 * 2^1)
 *
 * // Check if error should be retried
 * if (policy.shouldRetry(RetryableErrorType.TIMEOUT, attempt)) {
 *     await sleep(policy.getDelayForAttempt(attempt))
 *     // retry...
 * }
 * ```
 */
export class RetryPolicy {
    private readonly _props: Required<RetryPolicyProps>

    private constructor(props: RetryPolicyProps) {
        this._props = { ...DEFAULT_RETRY_POLICY, ...props }
    }

    /**
     * Create a new retry policy.
     */
    static create(props?: RetryPolicyProps): RetryPolicy {
        return new RetryPolicy(props ?? {})
    }

    /**
     * Create a default retry policy.
     */
    static default(): RetryPolicy {
        return new RetryPolicy({})
    }

    /**
     * Create a policy that disables retries.
     */
    static noRetry(): RetryPolicy {
        return new RetryPolicy({ maxRetries: 0 })
    }

    /**
     * Create an aggressive retry policy for critical messages.
     */
    static aggressive(): RetryPolicy {
        return new RetryPolicy({
            maxRetries: 3,
            baseDelayMs: 500,
            maxDelayMs: 5000,
            backoffMultiplier: 1.5,
        })
    }

    // Getters
    get maxRetries(): number {
        return this._props.maxRetries
    }

    get baseDelayMs(): number {
        return this._props.baseDelayMs
    }

    get maxDelayMs(): number {
        return this._props.maxDelayMs
    }

    get backoffMultiplier(): number {
        return this._props.backoffMultiplier
    }

    get retryableErrors(): RetryableErrorType[] {
        return [...this._props.retryableErrors]
    }

    get jitter(): boolean {
        return this._props.jitter
    }

    /**
     * Check if a specific error type should be retried.
     */
    isErrorRetryable(errorType: RetryableErrorType): boolean {
        return this._props.retryableErrors.includes(errorType)
    }

    /**
     * Check if we should retry given the error type and attempt number.
     *
     * @param errorType - The type of error that occurred
     * @param attempt - Current attempt number (0-indexed)
     */
    shouldRetry(errorType: RetryableErrorType, attempt: number): boolean {
        if (attempt >= this._props.maxRetries) {
            return false
        }
        return this.isErrorRetryable(errorType)
    }

    /**
     * Calculate delay for a specific retry attempt.
     *
     * Uses exponential backoff: delay = baseDelay * (multiplier ^ attempt)
     * Adds random jitter (0-25%) if enabled.
     *
     * @param attempt - Retry attempt number (0-indexed)
     * @returns Delay in milliseconds
     */
    getDelayForAttempt(attempt: number): number {
        // Calculate exponential delay
        const exponentialDelay =
            this._props.baseDelayMs * Math.pow(this._props.backoffMultiplier, attempt)

        // Cap at maxDelay
        let delay = Math.min(exponentialDelay, this._props.maxDelayMs)

        // Add jitter (0-25% random variation)
        if (this._props.jitter) {
            const jitterFactor = 1 + Math.random() * 0.25
            delay = Math.floor(delay * jitterFactor)
        }

        return delay
    }

    /**
     * Get all delays for the configured number of retries.
     *
     * Useful for logging/debugging retry schedules.
     */
    getAllDelays(): number[] {
        const delays: number[] = []
        for (let i = 0; i < this._props.maxRetries; i++) {
            delays.push(this.getDelayForAttempt(i))
        }
        return delays
    }

    /**
     * Convert to plain object for persistence.
     */
    toPersistence(): RetryPolicyProps {
        return { ...this._props }
    }
}
