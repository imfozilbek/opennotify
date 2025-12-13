import { Injectable } from "@nestjs/common"
import {
    EskizAdapter,
    NotificationProviderPort,
    OtpRequest,
    Provider,
    Recipient,
    SendOtpUseCase,
    TelegramAdapter,
    VerifyOtpUseCase,
} from "@opennotify/core"
import { SendOtpDto, VerifyOtpDto } from "./dto/otp.dto"

// In-memory stores (replace with database in production)
const otpStore = new Map<string, OtpRequest>()
const recipientStore = new Map<string, Recipient>()

// Mock OTP repository
const mockOtpRepository = {
    async save(otp: OtpRequest): Promise<void> {
        otpStore.set(otp.id, otp)
    },
    async findById(id: string): Promise<OtpRequest | null> {
        return otpStore.get(id) ?? null
    },
    async findLatestByPhone(merchantId: string, phone: string): Promise<OtpRequest | null> {
        let latest: OtpRequest | null = null
        for (const otp of otpStore.values()) {
            if (otp.merchantId === merchantId && otp.phone === phone && otp.isPending()) {
                if (!latest || otp.createdAt > latest.createdAt) {
                    latest = otp
                }
            }
        }
        return latest
    },
    async countRecent(merchantId: string, phone: string, since: Date): Promise<number> {
        let count = 0
        for (const otp of otpStore.values()) {
            if (otp.merchantId === merchantId && otp.phone === phone && otp.createdAt >= since) {
                count++
            }
        }
        return count
    },
    async deleteExpired(): Promise<number> {
        return 0
    },
}

// Mock recipient repository
const mockRecipientRepository = {
    async save(_recipient: Recipient): Promise<void> {
        // In-memory mock - no persistence needed
    },
    async findById(_id: string): Promise<Recipient | null> {
        return null
    },
    async findByExternalId(_merchantId: string, _externalId: string): Promise<Recipient | null> {
        return null
    },
    async findByPhone(merchantId: string, phone: string): Promise<Recipient | null> {
        const key = `${merchantId}:${phone}`
        return recipientStore.get(key) ?? null
    },
    async findByEmail(_merchantId: string, _email: string): Promise<Recipient | null> {
        return null
    },
    async findByTelegramChatId(_merchantId: string, _chatId: string): Promise<Recipient | null> {
        return null
    },
    async findByMerchantId(_merchantId: string): Promise<Recipient[]> {
        return []
    },
    async delete(_id: string): Promise<void> {
        // In-memory mock - no deletion needed
    },
}

@Injectable()
export class OtpService {
    private readonly providers: Map<Provider, NotificationProviderPort>
    private readonly sendOtpUseCase: SendOtpUseCase
    private readonly verifyOtpUseCase: VerifyOtpUseCase

    constructor() {
        this.providers = new Map()
        this.initializeProviders()
        this.sendOtpUseCase = new SendOtpUseCase(
            this.providers,
            mockOtpRepository,
            mockRecipientRepository,
        )
        this.verifyOtpUseCase = new VerifyOtpUseCase(mockOtpRepository)
    }

    private initializeProviders(): void {
        if (process.env.ESKIZ_EMAIL && process.env.ESKIZ_PASSWORD) {
            this.providers.set(
                Provider.ESKIZ,
                new EskizAdapter({
                    email: process.env.ESKIZ_EMAIL,
                    password: process.env.ESKIZ_PASSWORD,
                    from: process.env.ESKIZ_FROM ?? "OpenNotify",
                }),
            )
        }

        if (process.env.TELEGRAM_BOT_TOKEN) {
            this.providers.set(
                Provider.TELEGRAM_BOT,
                new TelegramAdapter({
                    botToken: process.env.TELEGRAM_BOT_TOKEN,
                }),
            )
        }
    }

    async sendOtp(
        dto: SendOtpDto,
        merchantId: string,
    ): Promise<{ success: boolean; otpId?: string; expiresAt?: string; errorMessage?: string }> {
        const otpId = this.generateId()

        const result = await this.sendOtpUseCase.execute({
            id: otpId,
            merchantId,
            phone: dto.phone,
            codeLength: dto.codeLength,
            expiresInSeconds: dto.expiresInSeconds,
            messageTemplate: dto.messageTemplate,
        })

        if (!result.success) {
            return {
                success: false,
                errorMessage: result.errorMessage,
            }
        }

        return {
            success: true,
            otpId: result.otpRequest.id,
            expiresAt: result.otpRequest.expiresAt.toISOString(),
        }
    }

    async verifyOtp(
        dto: VerifyOtpDto,
        merchantId: string,
    ): Promise<{ success: boolean; errorMessage?: string; remainingAttempts?: number }> {
        const result = await this.verifyOtpUseCase.execute({
            merchantId,
            phone: dto.phone,
            code: dto.code,
        })

        return {
            success: result.success,
            errorMessage: result.errorMessage,
            remainingAttempts: result.remainingAttempts,
        }
    }

    private generateId(): string {
        return `otp_${String(Date.now())}_${Math.random().toString(36).substring(2, 9)}`
    }
}
