/**
 * Webhook processing status.
 *
 * Indicates the result of processing an incoming webhook from a provider.
 */
export const WebhookStatus = {
    /** Webhook received and processed successfully */
    SUCCESS: "SUCCESS",

    /** Webhook received but signature verification failed */
    INVALID_SIGNATURE: "INVALID_SIGNATURE",

    /** Webhook received but payload was malformed or missing required fields */
    INVALID_PAYLOAD: "INVALID_PAYLOAD",

    /** Webhook received but related notification was not found */
    NOTIFICATION_NOT_FOUND: "NOTIFICATION_NOT_FOUND",

    /** Webhook processing failed due to internal error */
    PROCESSING_ERROR: "PROCESSING_ERROR",
} as const

export type WebhookStatus = (typeof WebhookStatus)[keyof typeof WebhookStatus]

/**
 * Get all webhook statuses.
 */
export function getWebhookStatuses(): WebhookStatus[] {
    return Object.values(WebhookStatus)
}

/**
 * Check if a value is a valid WebhookStatus.
 */
export function isWebhookStatus(value: unknown): value is WebhookStatus {
    return (
        typeof value === "string" && Object.values(WebhookStatus).includes(value as WebhookStatus)
    )
}

/**
 * Check if webhook status indicates success.
 */
export function isSuccessfulWebhook(status: WebhookStatus): boolean {
    return status === WebhookStatus.SUCCESS
}

/**
 * Check if webhook status indicates a validation error.
 */
export function isValidationError(status: WebhookStatus): boolean {
    return status === WebhookStatus.INVALID_SIGNATURE || status === WebhookStatus.INVALID_PAYLOAD
}
