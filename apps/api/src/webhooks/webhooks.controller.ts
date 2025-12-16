import {
    BadRequestException,
    Body,
    Controller,
    Headers,
    HttpCode,
    HttpStatus,
    Ip,
    Param,
    Post,
} from "@nestjs/common"
import { isProvider, Provider } from "@opennotify/core"
import { WebhooksService } from "./webhooks.service"

/**
 * Provider parameter mapping (URL-friendly to Provider enum).
 */
const PROVIDER_MAP: Record<string, Provider> = {
    eskiz: Provider.ESKIZ,
    playmobile: Provider.PLAYMOBILE,
    getsms: Provider.GETSMS,
    telegram: Provider.TELEGRAM_BOT,
    sendgrid: Provider.SENDGRID,
    mailgun: Provider.MAILGUN,
    smtp: Provider.SMTP,
    fcm: Provider.FCM,
    apns: Provider.APNS,
    whatsapp: Provider.WHATSAPP_BUSINESS,
}

/**
 * Webhook response shape.
 */
interface WebhookApiResponse {
    success: boolean
    message: string
    webhookId?: string
}

/**
 * Controller for receiving webhooks from notification providers.
 *
 * IMPORTANT: This controller does NOT require authentication.
 * Providers cannot authenticate with API keys - they just send
 * webhooks to configured endpoints. Security is handled via:
 * - Signature verification (where supported by provider)
 * - IP whitelisting (can be configured at infrastructure level)
 */
@Controller("webhooks")
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) {}

    /**
     * POST /webhooks/:provider
     *
     * Receive webhook from a notification provider.
     *
     * Supported providers:
     * - eskiz, playmobile, getsms (SMS)
     * - telegram (Telegram)
     * - sendgrid, mailgun (Email)
     * - fcm, apns (Push)
     * - whatsapp (WhatsApp)
     */
    @Post(":provider")
    @HttpCode(HttpStatus.OK)
    async handleWebhook(
        @Param("provider") providerParam: string,
        @Body() body: unknown,
        @Headers() headers: Record<string, string>,
        @Ip() ipAddress: string,
    ): Promise<WebhookApiResponse> {
        // Map URL parameter to Provider enum
        const provider = PROVIDER_MAP[providerParam.toLowerCase()]

        if (!provider || !isProvider(provider)) {
            throw new BadRequestException(`Unknown provider: ${providerParam}`)
        }

        // Extract signature if present
        const signature = this.extractSignature(headers, provider)

        // Process webhook
        const result = await this.webhooksService.processWebhook({
            provider,
            body,
            headers,
            signature,
            ipAddress,
            userAgent: headers["user-agent"],
        })

        return {
            success: result.success,
            message: result.success
                ? "Webhook processed"
                : (result.errorMessage ?? "Processing failed"),
            webhookId: result.webhookId,
        }
    }

    /**
     * Extract signature from headers based on provider.
     */
    private extractSignature(
        headers: Record<string, string>,
        provider: Provider,
    ): string | undefined {
        // Normalize header keys to lowercase
        const normalizedHeaders: Record<string, string> = {}
        for (const [key, value] of Object.entries(headers)) {
            normalizedHeaders[key.toLowerCase()] = value
        }

        switch (provider) {
            case Provider.MAILGUN:
                // Mailgun includes signature in the payload, not headers
                return undefined

            case Provider.SENDGRID:
                // SendGrid uses X-Twilio-Email-Event-Webhook-Signature
                return normalizedHeaders["x-twilio-email-event-webhook-signature"]

            default:
                // Check common signature headers
                return (
                    normalizedHeaders["x-signature"] ??
                    normalizedHeaders["x-webhook-signature"] ??
                    normalizedHeaders["x-hub-signature-256"]
                )
        }
    }
}
