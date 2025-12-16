import { Injectable } from "@nestjs/common"
import * as crypto from "crypto"
import {
    EskizAdapter,
    GetSmsAdapter,
    MailgunAdapter,
    NotificationProviderPort,
    PlayMobileAdapter,
    ProcessWebhookUseCase,
    Provider,
    SendGridAdapter,
    SmtpAdapter,
    TelegramAdapter,
    WebhookPayload,
    WebhookStatus,
} from "@opennotify/core"
import {
    sharedNotificationRepository,
    sharedWebhookLogRepository,
} from "../infrastructure/repositories"

/**
 * Input for processing a webhook.
 */
export interface ProcessWebhookInput {
    provider: Provider
    body: unknown
    headers: Record<string, string>
    signature?: string
    ipAddress?: string
    userAgent?: string
}

/**
 * Result from processing a webhook.
 */
export interface ProcessWebhookResult {
    success: boolean
    webhookId: string
    webhookStatus: WebhookStatus
    errorMessage?: string
}

@Injectable()
export class WebhooksService {
    private readonly providers: Map<Provider, NotificationProviderPort>
    private readonly processWebhookUseCase: ProcessWebhookUseCase

    constructor() {
        // Initialize provider adapters for webhook verification
        this.providers = this.initializeProviders()

        // Initialize use case
        this.processWebhookUseCase = new ProcessWebhookUseCase(
            this.providers,
            sharedNotificationRepository,
            sharedWebhookLogRepository,
        )
    }

    /**
     * Process incoming webhook from provider.
     */
    async processWebhook(input: ProcessWebhookInput): Promise<ProcessWebhookResult> {
        const webhookId = `wh_${crypto.randomUUID()}`

        const payload: WebhookPayload = {
            body: input.body,
            headers: input.headers,
            signature: input.signature,
        }

        // Process webhook using use case
        const result = await this.processWebhookUseCase.execute({
            id: webhookId,
            provider: input.provider,
            payload,
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
        })

        return {
            success: result.success,
            webhookId,
            webhookStatus: result.webhookStatus,
            errorMessage: result.errorMessage,
        }
    }

    /**
     * Initialize provider adapters for webhook verification.
     * Uses minimal config since we only need verifyWebhook() method.
     */
    private initializeProviders(): Map<Provider, NotificationProviderPort> {
        const providers = new Map<Provider, NotificationProviderPort>()

        // SMS Providers
        providers.set(
            Provider.ESKIZ,
            new EskizAdapter({
                email: "webhook@opennotify.uz",
                password: "webhook",
                from: "OpenNotify",
            }),
        )

        providers.set(
            Provider.PLAYMOBILE,
            new PlayMobileAdapter({
                username: "webhook",
                password: "webhook",
                sender: "OpenNotify",
            }),
        )

        providers.set(
            Provider.GETSMS,
            new GetSmsAdapter({
                login: "webhook",
                password: "webhook",
                nickname: "OpenNotify",
            }),
        )

        // Telegram
        providers.set(
            Provider.TELEGRAM_BOT,
            new TelegramAdapter({
                botToken: "webhook:token",
            }),
        )

        // Email Providers
        providers.set(
            Provider.SENDGRID,
            new SendGridAdapter({
                apiKey: "webhook",
                from: "webhook@opennotify.uz",
            }),
        )

        providers.set(
            Provider.MAILGUN,
            new MailgunAdapter({
                apiKey: "webhook",
                domain: "mg.opennotify.uz",
                from: "webhook@opennotify.uz",
            }),
        )

        providers.set(
            Provider.SMTP,
            new SmtpAdapter({
                host: "localhost",
                port: 587,
                from: "webhook@opennotify.uz",
            }),
        )

        return providers
    }
}
