/**
 * Properties for creating NotificationStats.
 */
export interface NotificationStatsProps {
    total: number
    pending: number
    sent: number
    delivered: number
    failed: number
}

/**
 * Aggregated notification statistics value object.
 *
 * Provides computed metrics like delivery rate, failure rate, and success rate.
 *
 * @example
 * ```typescript
 * const stats = NotificationStats.create({
 *     total: 1000,
 *     pending: 50,
 *     sent: 200,
 *     delivered: 700,
 *     failed: 50,
 * })
 *
 * console.log(stats.deliveryRate)  // 0.7368 (700 / 950)
 * console.log(stats.failureRate)   // 0.0526 (50 / 950)
 * console.log(stats.successRate)   // 0.9 (900 / 1000)
 * ```
 */
export class NotificationStats {
    private readonly _total: number
    private readonly _pending: number
    private readonly _sent: number
    private readonly _delivered: number
    private readonly _failed: number

    private constructor(props: NotificationStatsProps) {
        this._total = props.total
        this._pending = props.pending
        this._sent = props.sent
        this._delivered = props.delivered
        this._failed = props.failed
    }

    /**
     * Create NotificationStats from counts.
     */
    static create(props: NotificationStatsProps): NotificationStats {
        return new NotificationStats(props)
    }

    /**
     * Create empty stats (all zeros).
     */
    static empty(): NotificationStats {
        return new NotificationStats({
            total: 0,
            pending: 0,
            sent: 0,
            delivered: 0,
            failed: 0,
        })
    }

    /**
     * Total notifications count.
     */
    get total(): number {
        return this._total
    }

    /**
     * Pending notifications count.
     */
    get pending(): number {
        return this._pending
    }

    /**
     * Sent notifications count (accepted by provider).
     */
    get sent(): number {
        return this._sent
    }

    /**
     * Delivered notifications count.
     */
    get delivered(): number {
        return this._delivered
    }

    /**
     * Failed notifications count.
     */
    get failed(): number {
        return this._failed
    }

    /**
     * Processed notifications (total - pending).
     * These are notifications that have a final or intermediate status.
     */
    get processed(): number {
        return this._total - this._pending
    }

    /**
     * Delivery rate: delivered / processed.
     * Returns 0 if no processed notifications.
     */
    get deliveryRate(): number {
        if (this.processed === 0) {
            return 0
        }
        return this._delivered / this.processed
    }

    /**
     * Failure rate: failed / processed.
     * Returns 0 if no processed notifications.
     */
    get failureRate(): number {
        if (this.processed === 0) {
            return 0
        }
        return this._failed / this.processed
    }

    /**
     * Success rate: (sent + delivered) / total.
     * Includes both sent (accepted by provider) and delivered.
     * Returns 0 if no notifications.
     */
    get successRate(): number {
        if (this._total === 0) {
            return 0
        }
        return (this._sent + this._delivered) / this._total
    }

    /**
     * Convert to JSON-serializable object.
     */
    toJSON(): NotificationStatsProps & {
        processed: number
        deliveryRate: number
        failureRate: number
        successRate: number
    } {
        return {
            total: this._total,
            pending: this._pending,
            sent: this._sent,
            delivered: this._delivered,
            failed: this._failed,
            processed: this.processed,
            deliveryRate: Math.round(this.deliveryRate * 10000) / 10000,
            failureRate: Math.round(this.failureRate * 10000) / 10000,
            successRate: Math.round(this.successRate * 10000) / 10000,
        }
    }
}
