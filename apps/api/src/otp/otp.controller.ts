import { Body, Controller, Post } from "@nestjs/common"
import { OtpService } from "./otp.service"
import { SendOtpDto, VerifyOtpDto } from "./dto/otp.dto"

interface SendOtpResponse {
    success: boolean
    data?: {
        otpId: string
        expiresAt: string
    }
    error?: {
        message: string
    }
}

interface VerifyOtpResponse {
    success: boolean
    data?: {
        verified: true
    }
    error?: {
        message: string
        remainingAttempts?: number
    }
}

@Controller("otp")
export class OtpController {
    constructor(private readonly otpService: OtpService) {}

    @Post("send")
    async send(@Body() dto: SendOtpDto): Promise<SendOtpResponse> {
        // TODO: Get merchantId from API key auth
        const merchantId = "demo_merchant"

        const result = await this.otpService.sendOtp(dto, merchantId)

        if (!result.success) {
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Failed to send OTP",
                },
            }
        }

        return {
            success: true,
            data: {
                otpId: result.otpId ?? "",
                expiresAt: result.expiresAt ?? "",
            },
        }
    }

    @Post("verify")
    async verify(@Body() dto: VerifyOtpDto): Promise<VerifyOtpResponse> {
        // TODO: Get merchantId from API key auth
        const merchantId = "demo_merchant"

        const result = await this.otpService.verifyOtp(dto, merchantId)

        if (!result.success) {
            return {
                success: false,
                error: {
                    message: result.errorMessage ?? "Verification failed",
                    remainingAttempts: result.remainingAttempts,
                },
            }
        }

        return {
            success: true,
            data: {
                verified: true,
            },
        }
    }
}
