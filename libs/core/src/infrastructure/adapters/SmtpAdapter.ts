import { Channel } from "../../domain/value-objects/Channel"
import { Provider } from "../../domain/value-objects/Provider"
import { NotificationStatus } from "../../domain/value-objects/NotificationStatus"
import {
    DeliveryStatusResponse,
    NotificationProviderPort,
    SendNotificationRequest,
    SendNotificationResponse,
    WebhookPayload,
    WebhookResult,
} from "../../application/ports/NotificationProviderPort"

/**
 * SMTP configuration.
 */
export interface SmtpConfig {
    /** SMTP server hostname */
    host: string

    /** SMTP server port (default: 587) */
    port?: number

    /** Use SSL/TLS connection (default: false, true for port 465) */
    secure?: boolean

    /** SMTP username (usually email address) */
    username?: string

    /** SMTP password */
    password?: string

    /** Default "From" email address */
    from: string

    /** Default "From" name (optional) */
    fromName?: string

    /** Connection timeout in ms (default: 30000) */
    timeout?: number
}

/**
 * Nodemailer transport type (for dynamic import).
 */
interface NodemailerTransport {
    sendMail(options: NodemailerMailOptions): Promise<NodemailerSendResult>
    close(): void
}

/**
 * Nodemailer mail options.
 */
interface NodemailerMailOptions {
    from: string
    to: string
    subject: string
    text?: string
    html?: string
}

/**
 * Nodemailer send result.
 */
interface NodemailerSendResult {
    messageId: string
    accepted: string[]
    rejected: string[]
    response: string
}

/**
 * SMTP email provider adapter.
 *
 * Uses nodemailer as optional peer dependency for SMTP communication.
 * Install nodemailer: `pnpm add nodemailer`
 *
 * @see https://nodemailer.com/
 *
 * @example
 * ```typescript
 * const smtp = new SmtpAdapter({
 *     host: "smtp.gmail.com",
 *     port: 587,
 *     username: "your@gmail.com",
 *     password: "your_app_password",
 *     from: "your@gmail.com",
 *     fromName: "Your App",
 * })
 *
 * const result = await smtp.send({
 *     email: "user@example.com",
 *     subject: "Welcome!",
 *     text: "Hello from OpenNotify",
 * })
 * ```
 */
export class SmtpAdapter implements NotificationProviderPort {
    readonly channel = Channel.EMAIL
    readonly provider = Provider.SMTP

    private readonly config: Required<SmtpConfig>
    private transporter: NodemailerTransport | null = null

    constructor(config: SmtpConfig) {
        this.config = {
            port: 587,
            secure: config.port === 465,
            username: "",
            password: "",
            fromName: "",
            timeout: 30000,
            ...config,
        }
    }

    /**
     * Send email via SMTP.
     */
    async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
        if (!request.email) {
            return {
                success: false,
                errorMessage: "Email address is required",
            }
        }

        if (!request.subject) {
            return {
                success: false,
                errorMessage: "Email subject is required",
            }
        }

        try {
            const transporter = await this.getTransporter()
            const isHtml = this.isHtmlContent(request.text)

            const fromAddress = this.config.fromName
                ? `"${this.config.fromName}" <${this.config.from}>`
                : this.config.from

            const mailOptions: NodemailerMailOptions = {
                from: fromAddress,
                to: request.email,
                subject: request.subject,
            }

            if (isHtml) {
                mailOptions.html = request.text
                mailOptions.text = this.stripHtml(request.text)
            } else {
                mailOptions.text = request.text
            }

            const result = await transporter.sendMail(mailOptions)

            // Check if email was accepted
            if (result.rejected.length > 0) {
                return {
                    success: false,
                    errorMessage: `Email rejected: ${result.rejected.join(", ")}`,
                    rawResponse: result,
                }
            }

            return {
                success: true,
                externalId: result.messageId,
                rawResponse: result,
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Unknown SMTP error",
                rawResponse: error,
            }
        }
    }

    /**
     * Get email delivery status.
     *
     * Note: Standard SMTP does not support delivery tracking.
     * If we have a messageId, assume the email was sent successfully.
     */
    async getDeliveryStatus(externalId: string): Promise<DeliveryStatusResponse> {
        await Promise.resolve()

        // SMTP doesn't provide delivery tracking
        // If we have an externalId, the message was accepted by the server
        if (externalId) {
            return {
                status: NotificationStatus.SENT,
            }
        }

        return {
            status: NotificationStatus.FAILED,
            errorMessage: "No message ID provided",
        }
    }

    /**
     * Verify webhook payload.
     *
     * Note: Standard SMTP does not support webhooks.
     */
    async verifyWebhook(_payload: WebhookPayload): Promise<WebhookResult> {
        await Promise.resolve()

        return {
            valid: false,
            errorMessage:
                "SMTP does not support webhooks. Use SendGrid or Mailgun for delivery tracking.",
        }
    }

    /**
     * Get or create nodemailer transporter.
     */
    private async getTransporter(): Promise<NodemailerTransport> {
        if (this.transporter) {
            return this.transporter
        }

        // Dynamic import of nodemailer
        let nodemailer: { createTransport: (options: unknown) => NodemailerTransport }
        try {
            nodemailer = await import("nodemailer")
        } catch {
            throw new Error(
                "nodemailer is required for SmtpAdapter. Install it with: pnpm add nodemailer",
            )
        }

        this.transporter = nodemailer.createTransport({
            host: this.config.host,
            port: this.config.port,
            secure: this.config.secure,
            auth:
                this.config.username && this.config.password
                    ? {
                          user: this.config.username,
                          pass: this.config.password,
                      }
                    : undefined,
            connectionTimeout: this.config.timeout,
            greetingTimeout: this.config.timeout,
            socketTimeout: this.config.timeout,
        })

        return this.transporter
    }

    /**
     * Check if content contains HTML.
     */
    private isHtmlContent(text: string): boolean {
        return (
            text.includes("<html") ||
            text.includes("<body") ||
            text.includes("<div") ||
            text.includes("<p>") ||
            text.includes("<br") ||
            text.includes("<table")
        )
    }

    /**
     * Strip HTML tags from text for plain text version.
     */
    private stripHtml(html: string): string {
        return html
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
    }

    /**
     * Close SMTP connection.
     */
    close(): void {
        if (this.transporter) {
            this.transporter.close()
            this.transporter = null
        }
    }
}
