import { Provider } from "./Provider"

/**
 * Health status of a provider.
 */
export enum HealthStatus {
    /** Provider is working well (< 10% failure rate) */
    HEALTHY = "healthy",

    /** Provider has some issues (10-50% failure rate) */
    DEGRADED = "degraded",

    /** Provider is not working (> 50% failure rate, circuit open) */
    UNHEALTHY = "unhealthy",
}

/**
 * Properties for creating a ProviderHealth.
 */
export interface ProviderHealthProps {
    /** Provider identifier */
    provider: Provider

    /** Current health status */
    status: HealthStatus

    /** Number of successful requests in window */
    successCount: number

    /** Number of failed requests in window */
    failureCount: number

    /** Timestamp of last failure */
    lastFailure?: Date

    /** Timestamp when circuit breaker was opened */
    circuitOpenedAt?: Date

    /** Timestamp when circuit breaker will close (allow retry) */
    circuitOpenUntil?: Date

    /** Last updated timestamp */
    updatedAt: Date
}

/**
 * Provider health value object.
 *
 * Tracks the health status of a notification provider
 * for circuit breaker and failover decisions.
 *
 * @example
 * ```typescript
 * const health = ProviderHealth.create({
 *     provider: Provider.ESKIZ,
 *     status: HealthStatus.HEALTHY,
 *     successCount: 95,
 *     failureCount: 5,
 *     updatedAt: new Date(),
 * })
 *
 * // Check if provider can be used
 * if (health.isAvailable()) {
 *     // use provider
 * }
 *
 * // Get failure rate
 * console.log(health.failureRate) // 0.05 (5%)
 * ```
 */
export class ProviderHealth {
    private readonly _props: ProviderHealthProps

    private constructor(props: ProviderHealthProps) {
        this._props = { ...props }
    }

    /**
     * Create a new provider health object.
     */
    static create(props: ProviderHealthProps): ProviderHealth {
        return new ProviderHealth(props)
    }

    /**
     * Create initial healthy state for a provider.
     */
    static healthy(provider: Provider): ProviderHealth {
        return new ProviderHealth({
            provider,
            status: HealthStatus.HEALTHY,
            successCount: 0,
            failureCount: 0,
            updatedAt: new Date(),
        })
    }

    // Getters
    get provider(): Provider {
        return this._props.provider
    }

    get status(): HealthStatus {
        return this._props.status
    }

    get successCount(): number {
        return this._props.successCount
    }

    get failureCount(): number {
        return this._props.failureCount
    }

    get lastFailure(): Date | undefined {
        return this._props.lastFailure
    }

    get circuitOpenedAt(): Date | undefined {
        return this._props.circuitOpenedAt
    }

    get circuitOpenUntil(): Date | undefined {
        return this._props.circuitOpenUntil
    }

    get updatedAt(): Date {
        return this._props.updatedAt
    }

    /**
     * Get total number of requests in window.
     */
    get totalCount(): number {
        return this._props.successCount + this._props.failureCount
    }

    /**
     * Calculate failure rate (0-1).
     */
    get failureRate(): number {
        if (this.totalCount === 0) {
            return 0
        }
        return this._props.failureCount / this.totalCount
    }

    /**
     * Calculate success rate (0-1).
     */
    get successRate(): number {
        return 1 - this.failureRate
    }

    /**
     * Check if provider is healthy.
     */
    isHealthy(): boolean {
        return this._props.status === HealthStatus.HEALTHY
    }

    /**
     * Check if provider is degraded.
     */
    isDegraded(): boolean {
        return this._props.status === HealthStatus.DEGRADED
    }

    /**
     * Check if provider is unhealthy.
     */
    isUnhealthy(): boolean {
        return this._props.status === HealthStatus.UNHEALTHY
    }

    /**
     * Check if provider can be used (circuit is closed or half-open).
     */
    isAvailable(): boolean {
        // If circuit is open, check if we've passed the cooldown
        if (this._props.circuitOpenUntil) {
            return new Date() >= this._props.circuitOpenUntil
        }
        return true
    }

    /**
     * Check if circuit breaker is open (blocking requests).
     */
    isCircuitOpen(): boolean {
        if (!this._props.circuitOpenUntil) {
            return false
        }
        return new Date() < this._props.circuitOpenUntil
    }

    /**
     * Get remaining time until circuit closes (in milliseconds).
     * Returns 0 if circuit is closed.
     */
    getCircuitCooldownRemaining(): number {
        if (!this._props.circuitOpenUntil) {
            return 0
        }
        const remaining = this._props.circuitOpenUntil.getTime() - Date.now()
        return Math.max(0, remaining)
    }

    /**
     * Create a new health object with updated success count.
     */
    withSuccess(): ProviderHealth {
        const newSuccessCount = this._props.successCount + 1
        const newTotal = newSuccessCount + this._props.failureCount
        const newFailureRate = this._props.failureCount / newTotal

        return new ProviderHealth({
            ...this._props,
            successCount: newSuccessCount,
            status: this.calculateStatus(newFailureRate),
            updatedAt: new Date(),
            // Clear circuit breaker on success
            circuitOpenedAt: undefined,
            circuitOpenUntil: undefined,
        })
    }

    /**
     * Create a new health object with updated failure count.
     */
    withFailure(circuitOpenUntil?: Date): ProviderHealth {
        const newFailureCount = this._props.failureCount + 1
        const newTotal = this._props.successCount + newFailureCount
        const newFailureRate = newFailureCount / newTotal
        const now = new Date()

        return new ProviderHealth({
            ...this._props,
            failureCount: newFailureCount,
            lastFailure: now,
            status: this.calculateStatus(newFailureRate),
            updatedAt: now,
            circuitOpenedAt: circuitOpenUntil ? now : this._props.circuitOpenedAt,
            circuitOpenUntil: circuitOpenUntil ?? this._props.circuitOpenUntil,
        })
    }

    /**
     * Create a new health object with reset counts (new window).
     */
    withReset(): ProviderHealth {
        return new ProviderHealth({
            ...this._props,
            successCount: 0,
            failureCount: 0,
            status: HealthStatus.HEALTHY,
            updatedAt: new Date(),
            circuitOpenedAt: undefined,
            circuitOpenUntil: undefined,
        })
    }

    /**
     * Create a new health object with circuit breaker opened.
     */
    withCircuitOpen(duration: number): ProviderHealth {
        const now = new Date()
        return new ProviderHealth({
            ...this._props,
            status: HealthStatus.UNHEALTHY,
            circuitOpenedAt: now,
            circuitOpenUntil: new Date(now.getTime() + duration),
            updatedAt: now,
        })
    }

    /**
     * Calculate health status based on failure rate.
     */
    private calculateStatus(failureRate: number): HealthStatus {
        if (failureRate > 0.5) {
            return HealthStatus.UNHEALTHY
        }
        if (failureRate > 0.1) {
            return HealthStatus.DEGRADED
        }
        return HealthStatus.HEALTHY
    }

    /**
     * Convert to plain object for persistence/logging.
     */
    toPersistence(): ProviderHealthProps & {
        totalCount: number
        failureRate: number
        isAvailable: boolean
    } {
        return {
            ...this._props,
            totalCount: this.totalCount,
            failureRate: this.failureRate,
            isAvailable: this.isAvailable(),
        }
    }
}
