import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { RegisterDto } from "./dto/register.dto"

interface RegisterResponse {
    success: boolean
    data?: {
        merchantId: string
        apiKey: string
    }
    error?: {
        message: string
    }
}

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    async register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
        const result = await this.authService.register(dto)

        if (!result.success) {
            if (result.errorMessage === "Email already registered") {
                throw new HttpException(result.errorMessage, HttpStatus.CONFLICT)
            }
            throw new HttpException(
                result.errorMessage ?? "Registration failed",
                HttpStatus.INTERNAL_SERVER_ERROR,
            )
        }

        return {
            success: true,
            data: {
                merchantId: result.merchantId ?? "",
                apiKey: result.apiKey ?? "",
            },
        }
    }
}
