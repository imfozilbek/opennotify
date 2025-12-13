import { Channel } from "../../domain/value-objects/Channel"
import { Provider } from "../../domain/value-objects/Provider"
import { OtpRequest } from "../../domain/entities/OtpRequest"
import { NotificationProviderPort } from "../ports/NotificationProviderPort"
import { OtpRepositoryPort } from "../ports/OtpRepositoryPort"
import { RecipientRepositoryPort } from "../ports/RecipientRepositoryPort"

/**
 * Input for sending OTP.
 */
export interface SendOtpInput {
    /** Unique OTP request ID */
    id: string

    /** Merchant sending the OTP */
    merchantId: string

    /** Phone number to send OTP to (E.164 format) */
    phone: string

    /** Preferred channel (SMS or TELEGRAM) */
    channel?: Channel

    /** Custom OTP code (auto-generated if not provided) */
    code?: string

    /** OTP code length (default: 6) */
    codeLength?: number

    /** Expiration time in seconds (default: 300 = 5 minutes) */
    expiresInSeconds?: number

    /** Max verification attempts (default: 3) */
    maxAttempts?: number

    /** Custom message template. Use {code} as placeholder */
    messageTemplate?: string

    /** Additional metadata */
    metadata?: Record<string, unknown>
}

/**
 * Output from sending OTP.
 */
export interface SendOtpOutput {
    /** Whether OTP was sent successfully */
    success: boolean

    /** The OTP request (without the actual code) */
    otpRequest: OtpRequest

    /** Channel used to send OTP */
    channelUsed: Channel

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Configuration for SendOtpUseCase.
 */
export interface SendOtpConfig {
    /** Default message template */
    defaultTemplate: string

    /** Rate limit: max OTPs per phone per hour */
    rateLimitPerHour: number

    /** Default expiration in seconds */
    defaultExpiresInSeconds: number

    /** Default max attempts */
    defaultMaxAttempts: number
}

const DEFAULT_CONFIG: SendOtpConfig = {
    defaultTemplate: "Your verification code is {code}",
    rateLimitPerHour: 5,
    defaultExpiresInSeconds: 300,
    defaultMaxAttempts: 3,
}

/**
 * Use case for sending OTP codes.
 *
 * Features:
 * - Multi-channel delivery (Telegram first, SMS fallback)
 * - Rate limiting
 * - Customizable templates
 *
 * @example
 * ```typescript
 * const useCase = new SendOtpUseCase(
 *     providers,
 *     otpRepository,
 *     recipientRepository,
 * )
 *
 * const result = await useCase.execute({
 *     id: "otp_123",
 *     merchantId: "merchant_456",
 *     phone: "+998901234567",
 * })
 *
 * if (result.success) {
 *     console.log("OTP sent via", result.channelUsed)
 * }
 * ```
 */
export class SendOtpUseCase {
    private readonly config: SendOtpConfig

    constructor(
        private readonly providers: Map<Provider, NotificationProviderPort>,
        private readonly otpRepository: OtpRepositoryPort,
        private readonly recipientRepository: RecipientRepositoryPort,
        config?: Partial<SendOtpConfig>,
    ) {
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    async execute(input: SendOtpInput): Promise<SendOtpOutput> {
        // Rate limit check
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        const recentCount = await this.otpRepository.countRecent(
            input.merchantId,
            input.phone,
            oneHourAgo,
        )

        if (recentCount >= this.config.rateLimitPerHour) {
            const otp = this.createOtpRequest(input, "000000", Channel.SMS)
            return {
                success: false,
                otpRequest: otp,
                channelUsed: Channel.SMS,
                errorMessage: `Rate limit exceeded. Max ${String(this.config.rateLimitPerHour)} OTPs per hour.`,
            }
        }

        // Generate code
        const code = input.code ?? OtpRequest.generateCode(input.codeLength ?? 6)

        // Determine channel and try to send
        const { channel, provider } = await this.resolveChannelAndProvider(
            input.merchantId,
            input.phone,
            input.channel,
        )

        // Create OTP request
        const otp = this.createOtpRequest(input, code, channel)

        // Format message
        const template = input.messageTemplate ?? this.config.defaultTemplate
        const message = template.replace("{code}", code)

        // Send via provider
        const providerAdapter = this.providers.get(provider)
        if (!providerAdapter) {
            await this.otpRepository.save(otp)
            return {
                success: false,
                otpRequest: otp,
                channelUsed: channel,
                errorMessage: `Provider ${provider} not configured`,
            }
        }

        // Get recipient info for Telegram
        let telegramChatId: string | undefined
        if (channel === Channel.TELEGRAM) {
            const recipient = await this.recipientRepository.findByPhone(
                input.merchantId,
                input.phone,
            )
            telegramChatId = recipient?.telegramChatId
        }

        const sendResult = await providerAdapter.send({
            phone: channel === Channel.SMS ? input.phone : undefined,
            telegramChatId,
            text: message,
        })

        // Save OTP request
        await this.otpRepository.save(otp)

        if (!sendResult.success) {
            // Try fallback to SMS if Telegram failed
            if (channel === Channel.TELEGRAM) {
                return this.fallbackToSms(input, otp, code, message)
            }

            return {
                success: false,
                otpRequest: otp,
                channelUsed: channel,
                errorMessage: sendResult.errorMessage,
            }
        }

        return {
            success: true,
            otpRequest: otp,
            channelUsed: channel,
        }
    }

    private createOtpRequest(input: SendOtpInput, code: string, channel: Channel): OtpRequest {
        const expiresInSeconds = input.expiresInSeconds ?? this.config.defaultExpiresInSeconds
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000)

        return OtpRequest.create({
            id: input.id,
            merchantId: input.merchantId,
            phone: input.phone,
            code,
            channel,
            expiresAt,
            maxAttempts: input.maxAttempts ?? this.config.defaultMaxAttempts,
            metadata: input.metadata,
        })
    }

    private async resolveChannelAndProvider(
        merchantId: string,
        phone: string,
        preferredChannel?: Channel,
    ): Promise<{ channel: Channel; provider: Provider }> {
        // If channel specified, use it
        if (preferredChannel) {
            return {
                channel: preferredChannel,
                provider:
                    preferredChannel === Channel.TELEGRAM ? Provider.TELEGRAM_BOT : Provider.ESKIZ,
            }
        }

        // Try Telegram first if recipient has it linked
        const recipient = await this.recipientRepository.findByPhone(merchantId, phone)
        if (recipient?.telegramChatId && this.providers.has(Provider.TELEGRAM_BOT)) {
            return {
                channel: Channel.TELEGRAM,
                provider: Provider.TELEGRAM_BOT,
            }
        }

        // Default to SMS
        return {
            channel: Channel.SMS,
            provider: Provider.ESKIZ,
        }
    }

    private async fallbackToSms(
        input: SendOtpInput,
        otp: OtpRequest,
        code: string,
        message: string,
    ): Promise<SendOtpOutput> {
        const smsProvider = this.providers.get(Provider.ESKIZ)
        if (!smsProvider) {
            return {
                success: false,
                otpRequest: otp,
                channelUsed: Channel.TELEGRAM,
                errorMessage: "Telegram failed and SMS provider not configured",
            }
        }

        const smsResult = await smsProvider.send({
            phone: input.phone,
            text: message,
        })

        if (!smsResult.success) {
            return {
                success: false,
                otpRequest: otp,
                channelUsed: Channel.SMS,
                errorMessage: smsResult.errorMessage,
            }
        }

        return {
            success: true,
            otpRequest: otp,
            channelUsed: Channel.SMS,
        }
    }
}
