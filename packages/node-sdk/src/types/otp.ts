/**
 * Options for sending an OTP.
 */
export interface SendOtpOptions {
    /**
     * Phone number to send OTP to.
     * Should include country code (e.g., "+998901234567").
     */
    phone: string

    /**
     * Length of the OTP code.
     * @default 6
     * @minimum 4
     * @maximum 8
     */
    codeLength?: number

    /**
     * Time in seconds until the OTP expires.
     * @default 300
     * @minimum 60
     * @maximum 600
     */
    expiresInSeconds?: number

    /**
     * Custom message template.
     * Use {{code}} as placeholder for the OTP code.
     * @example "Your verification code is {{code}}"
     */
    messageTemplate?: string
}

/**
 * Result of sending an OTP.
 */
export interface SendOtpResult {
    /**
     * Unique identifier for the OTP request.
     */
    otpId: string

    /**
     * When the OTP expires (ISO 8601 datetime).
     */
    expiresAt: string
}

/**
 * Options for verifying an OTP.
 */
export interface VerifyOtpOptions {
    /**
     * Phone number that received the OTP.
     */
    phone: string

    /**
     * OTP code to verify.
     */
    code: string
}

/**
 * Result of OTP verification.
 */
export interface VerifyOtpResult {
    /**
     * Whether the OTP was verified successfully.
     */
    verified: boolean
}
