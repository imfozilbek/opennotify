import type { HttpClient } from "./http.js"
import type {
    SendOtpOptions,
    SendOtpResult,
    VerifyOtpOptions,
    VerifyOtpResult,
} from "./types/index.js"

/**
 * OTP client for sending and verifying one-time passwords.
 *
 * @example
 * ```typescript
 * const client = new OpenNotify({ apiKey: "your-api-key" })
 *
 * // Send OTP
 * const { otpId, expiresAt } = await client.otp.send({
 *     phone: "+998901234567",
 * })
 *
 * // Verify OTP
 * const { verified } = await client.otp.verify({
 *     phone: "+998901234567",
 *     code: "123456",
 * })
 * ```
 */
export class OtpClient {
    private readonly http: HttpClient

    constructor(http: HttpClient) {
        this.http = http
    }

    /**
     * Send an OTP to a phone number.
     *
     * @param options - OTP sending options
     * @returns OTP ID and expiration time
     *
     * @example
     * ```typescript
     * // Basic usage
     * const { otpId, expiresAt } = await client.otp.send({
     *     phone: "+998901234567",
     * })
     *
     * // With custom options
     * const result = await client.otp.send({
     *     phone: "+998901234567",
     *     codeLength: 4,
     *     expiresInSeconds: 120,
     *     messageTemplate: "Your code: {{code}}",
     * })
     * ```
     */
    async send(options: SendOtpOptions): Promise<SendOtpResult> {
        return this.http.post<SendOtpResult>("/otp/send", {
            phone: options.phone,
            codeLength: options.codeLength,
            expiresInSeconds: options.expiresInSeconds,
            messageTemplate: options.messageTemplate,
        })
    }

    /**
     * Verify an OTP code.
     *
     * @param options - OTP verification options
     * @returns Whether the OTP was verified successfully
     *
     * @example
     * ```typescript
     * const { verified } = await client.otp.verify({
     *     phone: "+998901234567",
     *     code: "123456",
     * })
     *
     * if (verified) {
     *     console.log("Phone number verified!")
     * } else {
     *     console.log("Invalid or expired code")
     * }
     * ```
     */
    async verify(options: VerifyOtpOptions): Promise<VerifyOtpResult> {
        return this.http.post<VerifyOtpResult>("/otp/verify", {
            phone: options.phone,
            code: options.code,
        })
    }
}
