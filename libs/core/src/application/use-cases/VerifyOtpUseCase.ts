import { OtpRequest } from "../../domain/entities/OtpRequest"
import { OtpRepositoryPort } from "../ports/OtpRepositoryPort"

/**
 * Input for verifying OTP.
 */
export interface VerifyOtpInput {
    /** Merchant ID */
    merchantId: string

    /** Phone number the OTP was sent to */
    phone: string

    /** OTP code to verify */
    code: string
}

/**
 * Output from verifying OTP.
 */
export interface VerifyOtpOutput {
    /** Whether verification was successful */
    success: boolean

    /** The OTP request */
    otpRequest: OtpRequest | null

    /** Error message if failed */
    errorMessage?: string

    /** Remaining attempts if failed */
    remainingAttempts?: number
}

/**
 * Use case for verifying OTP codes.
 *
 * @example
 * ```typescript
 * const useCase = new VerifyOtpUseCase(otpRepository)
 *
 * const result = await useCase.execute({
 *     merchantId: "merchant_456",
 *     phone: "+998901234567",
 *     code: "123456",
 * })
 *
 * if (result.success) {
 *     console.log("Phone verified!")
 * } else {
 *     console.log(result.errorMessage)
 *     console.log("Remaining attempts:", result.remainingAttempts)
 * }
 * ```
 */
export class VerifyOtpUseCase {
    constructor(private readonly otpRepository: OtpRepositoryPort) {}

    async execute(input: VerifyOtpInput): Promise<VerifyOtpOutput> {
        // Find latest pending OTP for this phone
        const otp = await this.otpRepository.findLatestByPhone(input.merchantId, input.phone)

        if (!otp) {
            return {
                success: false,
                otpRequest: null,
                errorMessage: "No pending OTP found for this phone number",
            }
        }

        // Check if OTP can be verified
        if (!otp.canVerify()) {
            let errorMessage: string
            if (otp.isVerified()) {
                errorMessage = "OTP already verified"
            } else if (otp.isExpired()) {
                errorMessage = "OTP expired"
            } else if (otp.isBlocked()) {
                errorMessage = "Too many failed attempts"
            } else {
                errorMessage = "OTP cannot be verified"
            }

            return {
                success: false,
                otpRequest: otp,
                errorMessage,
                remainingAttempts: otp.remainingAttempts,
            }
        }

        // Verify the code
        const result = otp.verify(input.code)

        // Save updated OTP state
        await this.otpRepository.save(otp)

        if (!result.success) {
            return {
                success: false,
                otpRequest: otp,
                errorMessage: result.error,
                remainingAttempts: otp.remainingAttempts,
            }
        }

        return {
            success: true,
            otpRequest: otp,
        }
    }

    /**
     * Verify OTP by ID instead of phone.
     */
    async verifyById(otpId: string, code: string): Promise<VerifyOtpOutput> {
        const otp = await this.otpRepository.findById(otpId)

        if (!otp) {
            return {
                success: false,
                otpRequest: null,
                errorMessage: "OTP not found",
            }
        }

        if (!otp.canVerify()) {
            let errorMessage: string
            if (otp.isVerified()) {
                errorMessage = "OTP already verified"
            } else if (otp.isExpired()) {
                errorMessage = "OTP expired"
            } else if (otp.isBlocked()) {
                errorMessage = "Too many failed attempts"
            } else {
                errorMessage = "OTP cannot be verified"
            }

            return {
                success: false,
                otpRequest: otp,
                errorMessage,
                remainingAttempts: otp.remainingAttempts,
            }
        }

        const result = otp.verify(code)
        await this.otpRepository.save(otp)

        if (!result.success) {
            return {
                success: false,
                otpRequest: otp,
                errorMessage: result.error,
                remainingAttempts: otp.remainingAttempts,
            }
        }

        return {
            success: true,
            otpRequest: otp,
        }
    }
}
