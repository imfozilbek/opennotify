import { OtpRequest } from "../../domain/entities/OtpRequest"

/**
 * Port interface for OTP request persistence.
 */
export interface OtpRepositoryPort {
    /**
     * Save an OTP request (create or update).
     */
    save(otp: OtpRequest): Promise<void>

    /**
     * Find OTP request by ID.
     */
    findById(id: string): Promise<OtpRequest | null>

    /**
     * Find the latest pending OTP for a phone number.
     */
    findLatestByPhone(merchantId: string, phone: string): Promise<OtpRequest | null>

    /**
     * Count recent OTP requests for rate limiting.
     * @param phone Phone number
     * @param since Count requests since this time
     */
    countRecent(merchantId: string, phone: string, since: Date): Promise<number>

    /**
     * Delete expired OTP requests (cleanup job).
     */
    deleteExpired(): Promise<number>
}
