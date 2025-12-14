import { Channel } from "./Channel"

/**
 * Properties for creating ChannelStats.
 */
export interface ChannelStatsProps {
    channel: Channel
    total: number
    pending: number
    sent: number
    delivered: number
    failed: number
}

/**
 * Notification statistics for a specific channel.
 *
 * @example
 * ```typescript
 * const smsStats = ChannelStats.create({
 *     channel: Channel.SMS,
 *     total: 500,
 *     pending: 20,
 *     sent: 100,
 *     delivered: 350,
 *     failed: 30,
 * })
 *
 * console.log(smsStats.channel)      // "SMS"
 * console.log(smsStats.deliveryRate) // 0.729
 * ```
 */
export class ChannelStats {
    private readonly _channel: Channel
    private readonly _total: number
    private readonly _pending: number
    private readonly _sent: number
    private readonly _delivered: number
    private readonly _failed: number

    private constructor(props: ChannelStatsProps) {
        this._channel = props.channel
        this._total = props.total
        this._pending = props.pending
        this._sent = props.sent
        this._delivered = props.delivered
        this._failed = props.failed
    }

    /**
     * Create ChannelStats from counts.
     */
    static create(props: ChannelStatsProps): ChannelStats {
        return new ChannelStats(props)
    }

    /**
     * Create empty stats for a channel (all zeros).
     */
    static empty(channel: Channel): ChannelStats {
        return new ChannelStats({
            channel,
            total: 0,
            pending: 0,
            sent: 0,
            delivered: 0,
            failed: 0,
        })
    }

    /**
     * Channel type.
     */
    get channel(): Channel {
        return this._channel
    }

    /**
     * Total notifications count for this channel.
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
     * Sent notifications count.
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
     */
    get processed(): number {
        return this._total - this._pending
    }

    /**
     * Delivery rate: delivered / processed.
     */
    get deliveryRate(): number {
        if (this.processed === 0) {
            return 0
        }
        return this._delivered / this.processed
    }

    /**
     * Failure rate: failed / processed.
     */
    get failureRate(): number {
        if (this.processed === 0) {
            return 0
        }
        return this._failed / this.processed
    }

    /**
     * Success rate: (sent + delivered) / total.
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
    toJSON(): ChannelStatsProps & {
        processed: number
        deliveryRate: number
        failureRate: number
        successRate: number
    } {
        return {
            channel: this._channel,
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
