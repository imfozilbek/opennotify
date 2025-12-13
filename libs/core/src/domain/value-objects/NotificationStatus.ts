/**
 * Notification delivery status.
 *
 * Lifecycle:
 * PENDING → SENT → DELIVERED
 *              ↘ FAILED
 */
export const NotificationStatus = {
    /** Notification created, waiting to be sent */
    PENDING: "PENDING",

    /** Sent to provider, awaiting delivery confirmation */
    SENT: "SENT",

    /** Successfully delivered to recipient */
    DELIVERED: "DELIVERED",

    /** Delivery failed */
    FAILED: "FAILED",
} as const

export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus]

/**
 * Get all notification statuses.
 */
export function getNotificationStatuses(): NotificationStatus[] {
    return Object.values(NotificationStatus)
}

/**
 * Check if a value is a valid NotificationStatus.
 */
export function isNotificationStatus(value: unknown): value is NotificationStatus {
    return (
        typeof value === "string" &&
        Object.values(NotificationStatus).includes(value as NotificationStatus)
    )
}

/**
 * Check if status is terminal (no further transitions possible).
 */
export function isTerminalStatus(status: NotificationStatus): boolean {
    return status === NotificationStatus.DELIVERED || status === NotificationStatus.FAILED
}

/**
 * Check if status indicates success.
 */
export function isSuccessStatus(status: NotificationStatus): boolean {
    return status === NotificationStatus.SENT || status === NotificationStatus.DELIVERED
}

/**
 * Valid status transitions.
 */
export const StatusTransitions: Record<NotificationStatus, NotificationStatus[]> = {
    [NotificationStatus.PENDING]: [NotificationStatus.SENT, NotificationStatus.FAILED],
    [NotificationStatus.SENT]: [NotificationStatus.DELIVERED, NotificationStatus.FAILED],
    [NotificationStatus.DELIVERED]: [],
    [NotificationStatus.FAILED]: [],
}

/**
 * Check if a status transition is valid.
 */
export function canTransition(from: NotificationStatus, to: NotificationStatus): boolean {
    return StatusTransitions[from].includes(to)
}
