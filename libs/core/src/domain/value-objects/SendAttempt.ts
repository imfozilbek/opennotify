import { Channel } from "./Channel"
import { Provider } from "./Provider"
import { ProviderError } from "./ProviderError"

/**
 * Result of a send attempt.
 */
export enum AttemptResult {
    /** Successfully sent */
    SUCCESS = "success",

    /** Failed, can retry */
    FAILED_RETRYABLE = "failed_retryable",

    /** Failed, permanent error */
    FAILED_PERMANENT = "failed_permanent",

    /** Skipped due to circuit breaker */
    SKIPPED_CIRCUIT_OPEN = "skipped_circuit_open",

    /** Skipped because provider not available */
    SKIPPED_NOT_AVAILABLE = "skipped_not_available",
}

/**
 * Properties for creating a SendAttempt.
 */
export interface SendAttemptProps {
    /** Provider used for this attempt */
    provider: Provider

    /** Channel used for this attempt */
    channel: Channel

    /** When the attempt started */
    timestamp: Date

    /** Result of the attempt */
    result: AttemptResult

    /** Duration of the attempt in milliseconds */
    durationMs: number

    /** Error details if failed */
    error?: ProviderError

    /** External message ID if successful */
    externalId?: string

    /** Which retry attempt this was (0 = first attempt) */
    attemptNumber: number

    /** Whether this was a retry after backoff */
    isRetry: boolean
}

/**
 * Send attempt value object.
 *
 * Tracks individual notification send attempts for debugging,
 * logging, and analytics.
 *
 * @example
 * ```typescript
 * // Record a successful attempt
 * const attempt = SendAttempt.success({
 *     provider: Provider.ESKIZ,
 *     channel: Channel.SMS,
 *     durationMs: 250,
 *     externalId: "msg_123",
 *     attemptNumber: 0,
 * })
 *
 * // Record a failed attempt
 * const attempt = SendAttempt.failed({
 *     provider: Provider.ESKIZ,
 *     channel: Channel.SMS,
 *     durationMs: 30000,
 *     error: ProviderError.timeout(),
 *     attemptNumber: 0,
 * })
 * ```
 */
export class SendAttempt {
    private readonly _props: SendAttemptProps

    private constructor(props: SendAttemptProps) {
        this._props = { ...props }
    }

    /**
     * Create a send attempt from props.
     */
    static create(props: SendAttemptProps): SendAttempt {
        return new SendAttempt(props)
    }

    /**
     * Create a successful attempt.
     */
    static success(params: {
        provider: Provider
        channel: Channel
        durationMs: number
        externalId: string
        attemptNumber: number
        isRetry?: boolean
    }): SendAttempt {
        return new SendAttempt({
            provider: params.provider,
            channel: params.channel,
            timestamp: new Date(),
            result: AttemptResult.SUCCESS,
            durationMs: params.durationMs,
            externalId: params.externalId,
            attemptNumber: params.attemptNumber,
            isRetry: params.isRetry ?? params.attemptNumber > 0,
        })
    }

    /**
     * Create a failed attempt.
     */
    static failed(params: {
        provider: Provider
        channel: Channel
        durationMs: number
        error: ProviderError
        attemptNumber: number
        isRetry?: boolean
    }): SendAttempt {
        const result = params.error.isRetryable()
            ? AttemptResult.FAILED_RETRYABLE
            : AttemptResult.FAILED_PERMANENT

        return new SendAttempt({
            provider: params.provider,
            channel: params.channel,
            timestamp: new Date(),
            result,
            durationMs: params.durationMs,
            error: params.error,
            attemptNumber: params.attemptNumber,
            isRetry: params.isRetry ?? params.attemptNumber > 0,
        })
    }

    /**
     * Create a skipped attempt (circuit open).
     */
    static skippedCircuitOpen(params: {
        provider: Provider
        channel: Channel
        attemptNumber: number
    }): SendAttempt {
        return new SendAttempt({
            provider: params.provider,
            channel: params.channel,
            timestamp: new Date(),
            result: AttemptResult.SKIPPED_CIRCUIT_OPEN,
            durationMs: 0,
            attemptNumber: params.attemptNumber,
            isRetry: false,
        })
    }

    /**
     * Create a skipped attempt (provider not available).
     */
    static skippedNotAvailable(params: {
        provider: Provider
        channel: Channel
        attemptNumber: number
    }): SendAttempt {
        return new SendAttempt({
            provider: params.provider,
            channel: params.channel,
            timestamp: new Date(),
            result: AttemptResult.SKIPPED_NOT_AVAILABLE,
            durationMs: 0,
            attemptNumber: params.attemptNumber,
            isRetry: false,
        })
    }

    // Getters
    get provider(): Provider {
        return this._props.provider
    }

    get channel(): Channel {
        return this._props.channel
    }

    get timestamp(): Date {
        return this._props.timestamp
    }

    get result(): AttemptResult {
        return this._props.result
    }

    get durationMs(): number {
        return this._props.durationMs
    }

    get error(): ProviderError | undefined {
        return this._props.error
    }

    get externalId(): string | undefined {
        return this._props.externalId
    }

    get attemptNumber(): number {
        return this._props.attemptNumber
    }

    get isRetry(): boolean {
        return this._props.isRetry
    }

    /**
     * Check if this attempt was successful.
     */
    isSuccess(): boolean {
        return this._props.result === AttemptResult.SUCCESS
    }

    /**
     * Check if this attempt failed.
     */
    isFailed(): boolean {
        return (
            this._props.result === AttemptResult.FAILED_RETRYABLE ||
            this._props.result === AttemptResult.FAILED_PERMANENT
        )
    }

    /**
     * Check if this attempt was skipped.
     */
    isSkipped(): boolean {
        return (
            this._props.result === AttemptResult.SKIPPED_CIRCUIT_OPEN ||
            this._props.result === AttemptResult.SKIPPED_NOT_AVAILABLE
        )
    }

    /**
     * Check if this failed attempt can be retried.
     */
    canRetry(): boolean {
        return this._props.result === AttemptResult.FAILED_RETRYABLE
    }

    /**
     * Convert to plain object for persistence/logging.
     */
    toPersistence(): SendAttemptProps & { errorMessage?: string } {
        return {
            ...this._props,
            error: this._props.error,
            errorMessage: this._props.error?.message,
        }
    }
}

/**
 * Helper to calculate total duration from multiple attempts.
 */
export function getTotalAttemptsDuration(attempts: SendAttempt[]): number {
    return attempts.reduce((sum, attempt) => sum + attempt.durationMs, 0)
}

/**
 * Helper to count attempts by result.
 */
export function countAttemptsByResult(attempts: SendAttempt[]): Record<AttemptResult, number> {
    const counts: Record<AttemptResult, number> = {
        [AttemptResult.SUCCESS]: 0,
        [AttemptResult.FAILED_RETRYABLE]: 0,
        [AttemptResult.FAILED_PERMANENT]: 0,
        [AttemptResult.SKIPPED_CIRCUIT_OPEN]: 0,
        [AttemptResult.SKIPPED_NOT_AVAILABLE]: 0,
    }

    for (const attempt of attempts) {
        counts[attempt.result]++
    }

    return counts
}
