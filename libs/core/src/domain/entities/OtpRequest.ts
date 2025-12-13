import { Channel } from "../value-objects/Channel"

/**
 * OTP request status.
 */
export enum OtpStatus {
    /** OTP sent, waiting for verification */
    PENDING = "PENDING",

    /** OTP verified successfully */
    VERIFIED = "VERIFIED",

    /** OTP expired */
    EXPIRED = "EXPIRED",

    /** Max attempts exceeded */
    BLOCKED = "BLOCKED",
}

/**
 * Properties for creating a new OtpRequest.
 */
export interface CreateOtpRequestProps {
    id: string
    merchantId: string
    phone: string
    code: string
    channel: Channel
    expiresAt: Date
    maxAttempts?: number
    metadata?: Record<string, unknown>
}

/**
 * Properties for reconstructing an OtpRequest from persistence.
 */
export interface OtpRequestProps extends CreateOtpRequestProps {
    status: OtpStatus
    attempts: number
    verifiedAt?: Date
    createdAt: Date
    updatedAt: Date
}

/**
 * OTP (One-Time Password) request entity.
 *
 * @example
 * ```typescript
 * // Create OTP request
 * const otp = OtpRequest.create({
 *     id: "otp_123",
 *     merchantId: "merchant_456",
 *     phone: "+998901234567",
 *     code: "123456",
 *     channel: Channel.SMS,
 *     expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
 * })
 *
 * // Verify code
 * const result = otp.verify("123456")
 * if (result.success) {
 *     console.log("OTP verified!")
 * }
 * ```
 */
export class OtpRequest {
    private readonly _id: string
    private readonly _merchantId: string
    private readonly _phone: string
    private readonly _code: string
    private readonly _channel: Channel
    private readonly _expiresAt: Date
    private readonly _maxAttempts: number
    private readonly _createdAt: Date

    private _status: OtpStatus
    private _attempts: number
    private _verifiedAt?: Date
    private readonly _metadata: Record<string, unknown>
    private _updatedAt: Date

    private constructor(props: OtpRequestProps) {
        this._id = props.id
        this._merchantId = props.merchantId
        this._phone = props.phone
        this._code = props.code
        this._channel = props.channel
        this._expiresAt = props.expiresAt
        this._maxAttempts = props.maxAttempts ?? 3
        this._status = props.status
        this._attempts = props.attempts
        this._verifiedAt = props.verifiedAt
        this._metadata = { ...props.metadata }
        this._createdAt = props.createdAt
        this._updatedAt = props.updatedAt
    }

    /**
     * Create a new OTP request in PENDING status.
     */
    static create(props: CreateOtpRequestProps): OtpRequest {
        const now = new Date()
        return new OtpRequest({
            ...props,
            maxAttempts: props.maxAttempts ?? 3,
            status: OtpStatus.PENDING,
            attempts: 0,
            metadata: props.metadata ?? {},
            createdAt: now,
            updatedAt: now,
        })
    }

    /**
     * Reconstruct an OTP request from persistence.
     */
    static fromPersistence(props: OtpRequestProps): OtpRequest {
        return new OtpRequest(props)
    }

    /**
     * Generate a random OTP code.
     */
    static generateCode(length = 6): string {
        const digits = "0123456789"
        let code = ""
        const randomValues = new Uint8Array(length)
        crypto.getRandomValues(randomValues)
        for (let i = 0; i < length; i++) {
            code += digits[randomValues[i] % 10]
        }
        return code
    }

    // Getters
    get id(): string {
        return this._id
    }

    get merchantId(): string {
        return this._merchantId
    }

    get phone(): string {
        return this._phone
    }

    get channel(): Channel {
        return this._channel
    }

    get expiresAt(): Date {
        return this._expiresAt
    }

    get maxAttempts(): number {
        return this._maxAttempts
    }

    get status(): OtpStatus {
        return this._status
    }

    get attempts(): number {
        return this._attempts
    }

    get verifiedAt(): Date | undefined {
        return this._verifiedAt
    }

    get metadata(): Record<string, unknown> {
        return { ...this._metadata }
    }

    get createdAt(): Date {
        return this._createdAt
    }

    get updatedAt(): Date {
        return this._updatedAt
    }

    get remainingAttempts(): number {
        return Math.max(0, this._maxAttempts - this._attempts)
    }

    /**
     * Check if OTP is still pending verification.
     */
    isPending(): boolean {
        return this._status === OtpStatus.PENDING
    }

    /**
     * Check if OTP has been verified.
     */
    isVerified(): boolean {
        return this._status === OtpStatus.VERIFIED
    }

    /**
     * Check if OTP has expired.
     */
    isExpired(): boolean {
        return this._expiresAt < new Date()
    }

    /**
     * Check if max attempts exceeded.
     */
    isBlocked(): boolean {
        return this._status === OtpStatus.BLOCKED
    }

    /**
     * Check if OTP can still be verified.
     */
    canVerify(): boolean {
        return this.isPending() && !this.isExpired() && !this.isBlocked()
    }

    /**
     * Verify the OTP code.
     *
     * @returns Verification result with success status and error if failed
     */
    verify(code: string): { success: boolean; error?: string } {
        // Check if already verified
        if (this._status === OtpStatus.VERIFIED) {
            return { success: false, error: "OTP already verified" }
        }

        // Check if expired
        if (this.isExpired()) {
            this._status = OtpStatus.EXPIRED
            this._updatedAt = new Date()
            return { success: false, error: "OTP expired" }
        }

        // Check if blocked
        if (this._status === OtpStatus.BLOCKED) {
            return { success: false, error: "Too many attempts" }
        }

        // Increment attempts
        this._attempts++
        this._updatedAt = new Date()

        // Check if max attempts exceeded
        if (this._attempts >= this._maxAttempts && code !== this._code) {
            this._status = OtpStatus.BLOCKED
            return { success: false, error: "Too many attempts" }
        }

        // Verify code
        if (code !== this._code) {
            return {
                success: false,
                error: `Invalid code. ${String(this.remainingAttempts)} attempts remaining`,
            }
        }

        // Success
        this._status = OtpStatus.VERIFIED
        this._verifiedAt = new Date()
        return { success: true }
    }

    /**
     * Mark as expired (for cleanup jobs).
     */
    markExpired(): void {
        if (this._status === OtpStatus.PENDING) {
            this._status = OtpStatus.EXPIRED
            this._updatedAt = new Date()
        }
    }

    /**
     * Convert to plain object for persistence.
     * Note: code is included for persistence but should not be exposed via API.
     */
    toPersistence(): OtpRequestProps {
        return {
            id: this._id,
            merchantId: this._merchantId,
            phone: this._phone,
            code: this._code,
            channel: this._channel,
            expiresAt: this._expiresAt,
            maxAttempts: this._maxAttempts,
            status: this._status,
            attempts: this._attempts,
            verifiedAt: this._verifiedAt,
            metadata: { ...this._metadata },
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        }
    }

    /**
     * Convert to safe object for API responses.
     * Does NOT include the code.
     */
    toResponse(): Omit<OtpRequestProps, "code"> {
        const { code: _, ...rest } = this.toPersistence()
        return rest
    }
}
