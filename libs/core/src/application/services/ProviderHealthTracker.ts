import { Provider } from "../../domain/value-objects/Provider"
import { ProviderError } from "../../domain/value-objects/ProviderError"
import { HealthStatus, ProviderHealth } from "../../domain/value-objects/ProviderHealth"

/**
 * Configuration for ProviderHealthTracker.
 */
export interface ProviderHealthTrackerConfig {
    /** Size of the sliding window in milliseconds (default: 60000 = 1 minute) */
    windowSizeMs?: number

    /** Duration to keep circuit breaker open in milliseconds (default: 30000 = 30 sec) */
    circuitOpenDurationMs?: number

    /** Number of failures before opening circuit breaker (default: 5) */
    failureThreshold?: number

    /** Failure rate threshold to be considered healthy (default: 0.1 = 10%) */
    healthyThreshold?: number

    /** Failure rate threshold to be considered degraded vs unhealthy (default: 0.5 = 50%) */
    unhealthyThreshold?: number

    /** Minimum requests before evaluating health (default: 3) */
    minRequestsForEvaluation?: number
}

const DEFAULT_CONFIG: Required<ProviderHealthTrackerConfig> = {
    windowSizeMs: 60000, // 1 minute
    circuitOpenDurationMs: 30000, // 30 seconds
    failureThreshold: 5,
    healthyThreshold: 0.1,
    unhealthyThreshold: 0.5,
    minRequestsForEvaluation: 3,
}

/**
 * Internal record for tracking a single request result.
 */
interface RequestRecord {
    timestamp: number
    success: boolean
    error?: ProviderError
}

/**
 * Internal state for a provider.
 */
interface ProviderState {
    records: RequestRecord[]
    circuitOpenUntil?: number
    lastFailure?: number
}

/**
 * Provider health tracker service.
 *
 * Tracks the health of notification providers using a sliding window
 * and implements circuit breaker pattern for fault tolerance.
 *
 * Features:
 * - Sliding window for recent request tracking
 * - Automatic health status calculation
 * - Circuit breaker with auto-recovery
 * - Per-provider state tracking
 *
 * @example
 * ```typescript
 * const tracker = new ProviderHealthTracker()
 *
 * // Record successful send
 * tracker.recordSuccess(Provider.ESKIZ)
 *
 * // Record failed send
 * tracker.recordFailure(Provider.ESKIZ, ProviderError.timeout())
 *
 * // Check if provider can be used
 * if (tracker.isAvailable(Provider.ESKIZ)) {
 *     // use provider
 * }
 *
 * // Get health status
 * const health = tracker.getHealth(Provider.ESKIZ)
 * console.log(health.status) // "healthy", "degraded", or "unhealthy"
 * ```
 */
export class ProviderHealthTracker {
    private readonly config: Required<ProviderHealthTrackerConfig>
    private readonly states = new Map<Provider, ProviderState>()

    constructor(config?: ProviderHealthTrackerConfig) {
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    /**
     * Record a successful request for a provider.
     */
    recordSuccess(provider: Provider): void {
        const state = this.getOrCreateState(provider)
        this.pruneOldRecords(state)

        state.records.push({
            timestamp: Date.now(),
            success: true,
        })

        // Clear circuit breaker on success (half-open → closed)
        if (state.circuitOpenUntil && Date.now() >= state.circuitOpenUntil) {
            state.circuitOpenUntil = undefined
        }
    }

    /**
     * Record a failed request for a provider.
     */
    recordFailure(provider: Provider, error: ProviderError): void {
        const state = this.getOrCreateState(provider)
        this.pruneOldRecords(state)

        const now = Date.now()
        state.records.push({
            timestamp: now,
            success: false,
            error,
        })
        state.lastFailure = now

        // Check if we should open the circuit breaker
        const recentFailures = this.countRecentFailures(state)
        if (recentFailures >= this.config.failureThreshold) {
            state.circuitOpenUntil = now + this.config.circuitOpenDurationMs
        }
    }

    /**
     * Get health status for a provider.
     */
    getHealth(provider: Provider): ProviderHealth {
        const state = this.states.get(provider)

        if (!state) {
            return ProviderHealth.healthy(provider)
        }

        this.pruneOldRecords(state)

        const successCount = state.records.filter((r) => r.success).length
        const failureCount = state.records.filter((r) => !r.success).length
        const status = this.calculateStatus(successCount, failureCount, state)

        return ProviderHealth.create({
            provider,
            status,
            successCount,
            failureCount,
            lastFailure: state.lastFailure ? new Date(state.lastFailure) : undefined,
            circuitOpenedAt: state.circuitOpenUntil
                ? new Date(state.circuitOpenUntil - this.config.circuitOpenDurationMs)
                : undefined,
            circuitOpenUntil: state.circuitOpenUntil ? new Date(state.circuitOpenUntil) : undefined,
            updatedAt: new Date(),
        })
    }

    /**
     * Check if a provider is available (circuit is closed or half-open).
     */
    isAvailable(provider: Provider): boolean {
        const state = this.states.get(provider)
        if (!state) {
            return true
        }

        // Circuit is closed
        if (!state.circuitOpenUntil) {
            return true
        }

        // Check if circuit has expired (half-open state)
        return Date.now() >= state.circuitOpenUntil
    }

    /**
     * Check if circuit breaker is currently open for a provider.
     */
    isCircuitOpen(provider: Provider): boolean {
        return !this.isAvailable(provider)
    }

    /**
     * Get remaining cooldown time in milliseconds.
     * Returns 0 if circuit is closed.
     */
    getCircuitCooldownRemaining(provider: Provider): number {
        const state = this.states.get(provider)
        if (!state?.circuitOpenUntil) {
            return 0
        }
        return Math.max(0, state.circuitOpenUntil - Date.now())
    }

    /**
     * Reset health tracking for a provider.
     */
    reset(provider: Provider): void {
        this.states.delete(provider)
    }

    /**
     * Reset health tracking for all providers.
     */
    resetAll(): void {
        this.states.clear()
    }

    /**
     * Get health summary for all tracked providers.
     */
    getAllHealth(): Map<Provider, ProviderHealth> {
        const result = new Map<Provider, ProviderHealth>()
        for (const provider of this.states.keys()) {
            result.set(provider, this.getHealth(provider))
        }
        return result
    }

    /**
     * Get list of providers with open circuits.
     */
    getUnavailableProviders(): Provider[] {
        const unavailable: Provider[] = []
        for (const provider of this.states.keys()) {
            if (!this.isAvailable(provider)) {
                unavailable.push(provider)
            }
        }
        return unavailable
    }

    /**
     * Force open circuit breaker for a provider.
     * Useful for manual intervention or testing.
     */
    forceOpenCircuit(provider: Provider, durationMs?: number): void {
        const state = this.getOrCreateState(provider)
        state.circuitOpenUntil = Date.now() + (durationMs ?? this.config.circuitOpenDurationMs)
    }

    /**
     * Force close circuit breaker for a provider.
     * Useful for manual intervention or testing.
     */
    forceCloseCircuit(provider: Provider): void {
        const state = this.states.get(provider)
        if (state) {
            state.circuitOpenUntil = undefined
        }
    }

    /**
     * Get or create state for a provider.
     */
    private getOrCreateState(provider: Provider): ProviderState {
        let state = this.states.get(provider)
        if (!state) {
            state = { records: [] }
            this.states.set(provider, state)
        }
        return state
    }

    /**
     * Remove records outside the sliding window.
     */
    private pruneOldRecords(state: ProviderState): void {
        const cutoff = Date.now() - this.config.windowSizeMs
        state.records = state.records.filter((r) => r.timestamp > cutoff)
    }

    /**
     * Count recent failures in the sliding window.
     */
    private countRecentFailures(state: ProviderState): number {
        return state.records.filter((r) => !r.success).length
    }

    /**
     * Calculate health status based on counts and circuit state.
     */
    private calculateStatus(
        successCount: number,
        failureCount: number,
        state: ProviderState,
    ): HealthStatus {
        // If circuit is open, status is unhealthy
        if (state.circuitOpenUntil && Date.now() < state.circuitOpenUntil) {
            return HealthStatus.UNHEALTHY
        }

        const total = successCount + failureCount

        // Not enough data to evaluate
        if (total < this.config.minRequestsForEvaluation) {
            return HealthStatus.HEALTHY
        }

        const failureRate = failureCount / total

        if (failureRate >= this.config.unhealthyThreshold) {
            return HealthStatus.UNHEALTHY
        }

        if (failureRate >= this.config.healthyThreshold) {
            return HealthStatus.DEGRADED
        }

        return HealthStatus.HEALTHY
    }
}
