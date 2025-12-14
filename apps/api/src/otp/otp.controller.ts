import { Body, Controller, Post, UseGuards } from "@nestjs/common"
import { ApiKeyPermission, Merchant } from "@opennotify/core"
import { CurrentMerchant, RequirePermissions } from "../common/decorators"
import { ApiKeyGuard } from "../common/guards"
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
@UseGuards(ApiKeyGuard)
export class OtpController {
    constructor(private readonly otpService: OtpService) {}

    @Post("send")
    @RequirePermissions(ApiKeyPermission.SEND)
    async send(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: SendOtpDto,
    ): Promise<SendOtpResponse> {
        const result = await this.otpService.sendOtp(dto, merchant.id)

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
    @RequirePermissions(ApiKeyPermission.SEND)
    async verify(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: VerifyOtpDto,
    ): Promise<VerifyOtpResponse> {
        const result = await this.otpService.verifyOtp(dto, merchant.id)

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
