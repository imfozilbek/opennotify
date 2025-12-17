import * as crypto from "crypto"
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
 * Firebase Cloud Messaging configuration.
 */
export interface FcmConfig {
    /** Firebase project ID */
    projectId: string

    /** Service account client email */
    clientEmail: string

    /** Service account private key (PEM format) */
    privateKey: string

    /** API base URL (default: https://fcm.googleapis.com) */
    baseUrl?: string

    /** Request timeout in ms (default: 30000) */
    timeout?: number
}

/**
 * FCM message payload structure.
 */
interface FcmMessage {
    message: {
        token: string
        notification?: {
            title?: string
            body: string
        }
        data?: Record<string, string>
        android?: {
            priority?: "normal" | "high"
            ttl?: string
            notification?: {
                channel_id?: string
                click_action?: string
            }
        }
        webpush?: {
            headers?: Record<string, string>
            notification?: {
                icon?: string
                badge?: string
            }
        }
        apns?: {
            headers?: Record<string, string>
            payload?: {
                aps?: {
                    badge?: number
                    sound?: string
                }
            }
        }
    }
}

/**
 * FCM API response on success.
 */
interface FcmResponse {
    name: string // Format: projects/{project}/messages/{message_id}
}

/**
 * FCM API error response.
 */
interface FcmErrorResponse {
    error: {
        code: number
        message: string
        status: string
        details?: unknown[]
    }
}

/**
 * Google OAuth token response.
 */
interface GoogleTokenResponse {
    access_token: string
    expires_in: number
    token_type: string
}

/**
 * Firebase Cloud Messaging (FCM) provider adapter.
 *
 * Uses FCM HTTP v1 API with OAuth 2.0 authentication.
 *
 * @see https://firebase.google.com/docs/cloud-messaging/http-server-ref
 *
 * @example
 * ```typescript
 * const fcm = new FcmAdapter({
 *     projectId: "my-project-id",
 *     clientEmail: "firebase-adminsdk@my-project.iam.gserviceaccount.com",
 *     privateKey: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----",
 * })
 *
 * const result = await fcm.send({
 *     deviceToken: "device_token_here",
 *     subject: "New Message",
 *     text: "You have a new notification!",
 *     options: {
 *         data: { orderId: "123" },
 *         priority: "high",
 *     },
 * })
 * ```
 */
export class FcmAdapter implements NotificationProviderPort {
    readonly channel = Channel.PUSH
    readonly provider = Provider.FCM

    private readonly config: Required<FcmConfig>
    private cachedToken: string | null = null
    private tokenExpiresAt = 0

    constructor(config: FcmConfig) {
        this.config = {
            baseUrl: "https://fcm.googleapis.com",
            timeout: 30000,
            ...config,
        }
    }

    /**
     * Send push notification via FCM.
     */
    async send(request: SendNotificationRequest): Promise<SendNotificationResponse> {
        if (!request.deviceToken) {
            return {
                success: false,
                errorMessage: "Device token is required for push notifications",
            }
        }

        try {
            const accessToken = await this.getAccessToken()
            const message = this.buildFcmMessage(request)
            const response = await this.sendFcmRequest(accessToken, message)

            // Extract message ID from response name
            // Format: projects/{project}/messages/{message_id}
            const messageId = response.name.split("/").pop()

            return {
                success: true,
                externalId: messageId,
                rawResponse: response,
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Unknown FCM error",
                rawResponse: error,
            }
        }
    }

    /**
     * Build FCM message from request.
     */
    private buildFcmMessage(request: SendNotificationRequest): FcmMessage {
        const message: FcmMessage = {
            message: {
                token: request.deviceToken ?? "",
                notification: {
                    title: request.subject,
                    body: request.text,
                },
            },
        }

        if (!request.options) {
            return message
        }

        // Add custom data payload
        if (request.options.data) {
            message.message.data = request.options.data as Record<string, string>
        }

        // Add Android-specific config
        this.addAndroidConfig(message, request.options)

        // Add iOS/APNs-specific config via FCM
        this.addApnsConfig(message, request.options)

        return message
    }

    /**
     * Add Android-specific configuration to FCM message.
     */
    private addAndroidConfig(message: FcmMessage, options: Record<string, unknown>): void {
        const hasAndroidOptions = options.priority || options.ttl || options.channelId
        if (!hasAndroidOptions) {
            return
        }

        message.message.android = {
            priority: (options.priority as "normal" | "high") ?? "high",
        }

        if (typeof options.ttl === "number") {
            message.message.android.ttl = `${String(options.ttl)}s`
        }

        if (options.channelId) {
            message.message.android.notification = {
                channel_id: options.channelId as string,
            }
        }
    }

    /**
     * Add APNs-specific configuration to FCM message.
     */
    private addApnsConfig(message: FcmMessage, options: Record<string, unknown>): void {
        const hasApnsOptions = options.badge !== undefined || options.sound
        if (!hasApnsOptions) {
            return
        }

        const aps: { badge?: number; sound?: string } = {}

        if (typeof options.badge === "number") {
            aps.badge = options.badge
        }

        if (typeof options.sound === "string") {
            aps.sound = options.sound
        }

        message.message.apns = {
            payload: { aps },
        }
    }

    /**
     * Get push notification delivery status.
     *
     * Note: FCM does not provide a direct API to check delivery status.
     * Once FCM accepts the message, it returns SENT status.
     * For actual delivery confirmation, use Firebase Analytics or implement
     * client-side delivery receipts.
     */
    async getDeliveryStatus(externalId: string): Promise<DeliveryStatusResponse> {
        await Promise.resolve()

        // FCM doesn't have a direct status check API
        // If we have an externalId, the message was accepted by FCM
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
     * Verify FCM webhook.
     *
     * Note: FCM does not send delivery webhooks.
     * This method always returns invalid.
     */
    async verifyWebhook(_payload: WebhookPayload): Promise<WebhookResult> {
        await Promise.resolve()

        return {
            valid: false,
            errorMessage: "FCM does not support delivery webhooks",
        }
    }

    /**
     * Get OAuth 2.0 access token for FCM API.
     * Uses JWT for service account authentication.
     */
    private async getAccessToken(): Promise<string> {
        // Return cached token if still valid (with 5 minute buffer)
        const now = Date.now()
        if (this.cachedToken && this.tokenExpiresAt > now + 300000) {
            return this.cachedToken
        }

        const jwt = this.createJwt()
        const tokenResponse = await this.exchangeJwtForToken(jwt)

        this.cachedToken = tokenResponse.access_token
        this.tokenExpiresAt = now + tokenResponse.expires_in * 1000

        return this.cachedToken
    }

    /**
     * Create JWT for Google OAuth.
     */
    private createJwt(): string {
        const now = Math.floor(Date.now() / 1000)
        const expiry = now + 3600 // 1 hour

        const header = {
            alg: "RS256",
            typ: "JWT",
        }

        const payload = {
            iss: this.config.clientEmail,
            scope: "https://www.googleapis.com/auth/firebase.messaging",
            aud: "https://oauth2.googleapis.com/token",
            iat: now,
            exp: expiry,
        }

        const encodedHeader = this.base64UrlEncode(JSON.stringify(header))
        const encodedPayload = this.base64UrlEncode(JSON.stringify(payload))

        const signatureInput = `${encodedHeader}.${encodedPayload}`
        const signature = this.signRs256(signatureInput, this.config.privateKey)

        return `${signatureInput}.${signature}`
    }

    /**
     * Sign data with RS256 (RSA + SHA-256).
     */
    private signRs256(data: string, privateKey: string): string {
        const sign = crypto.createSign("RSA-SHA256")
        sign.update(data)
        const signature = sign.sign(privateKey, "base64")
        return this.base64ToBase64Url(signature)
    }

    /**
     * Exchange JWT for access token.
     */
    private async exchangeJwtForToken(jwt: string): Promise<GoogleTokenResponse> {
        const url = "https://oauth2.googleapis.com/token"
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
            controller.abort()
        }, this.config.timeout)

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
                    assertion: jwt,
                }),
                signal: controller.signal,
            })

            if (!response.ok) {
                const errorBody = await response.text()
                throw new Error(`Google OAuth error: ${errorBody}`)
            }

            return (await response.json()) as GoogleTokenResponse
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Send message to FCM API.
     */
    private async sendFcmRequest(accessToken: string, message: FcmMessage): Promise<FcmResponse> {
        const url = `${this.config.baseUrl}/v1/projects/${this.config.projectId}/messages:send`
        const controller = new AbortController()
        const timeoutId = setTimeout(() => {
            controller.abort()
        }, this.config.timeout)

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(message),
                signal: controller.signal,
            })

            if (!response.ok) {
                const errorBody = (await response.json()) as FcmErrorResponse
                const errorMessage = errorBody.error?.message ?? `HTTP ${String(response.status)}`

                // Classify error for retry logic
                if (response.status === 429 || response.status >= 500) {
                    throw new Error(`FCM API error (retryable): ${errorMessage}`)
                }

                throw new Error(`FCM API error: ${errorMessage}`)
            }

            return (await response.json()) as FcmResponse
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Encode string to base64url format.
     */
    private base64UrlEncode(str: string): string {
        return Buffer.from(str)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "")
    }

    /**
     * Convert base64 to base64url format.
     */
    private base64ToBase64Url(base64: string): string {
        return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
    }
}
