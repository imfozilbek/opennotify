/**
 * Template lifecycle status.
 *
 * @example
 * ```typescript
 * const status = TemplateStatus.DRAFT
 * if (canTransitionTemplate(status, TemplateStatus.ACTIVE)) {
 *     // Can publish
 * }
 * ```
 */
export const TemplateStatus = {
    /** Template is being edited, not yet usable for sending */
    DRAFT: "DRAFT",

    /** Template is active and can be used for sending notifications */
    ACTIVE: "ACTIVE",

    /** Template is archived and no longer usable */
    ARCHIVED: "ARCHIVED",
} as const

export type TemplateStatus = (typeof TemplateStatus)[keyof typeof TemplateStatus]

/**
 * Valid status transitions for templates.
 *
 * - DRAFT -> ACTIVE (publish)
 * - DRAFT -> ARCHIVED (archive without publishing)
 * - ACTIVE -> DRAFT (unpublish for editing)
 * - ACTIVE -> ARCHIVED (archive)
 * - ARCHIVED -> DRAFT (restore for editing)
 */
export const TemplateStatusTransitions: Record<TemplateStatus, TemplateStatus[]> = {
    [TemplateStatus.DRAFT]: [TemplateStatus.ACTIVE, TemplateStatus.ARCHIVED],
    [TemplateStatus.ACTIVE]: [TemplateStatus.DRAFT, TemplateStatus.ARCHIVED],
    [TemplateStatus.ARCHIVED]: [TemplateStatus.DRAFT],
}

/**
 * Check if a template status transition is valid.
 *
 * @param from - Current status
 * @param to - Target status
 * @returns true if transition is allowed
 *
 * @example
 * ```typescript
 * canTransitionTemplate(TemplateStatus.DRAFT, TemplateStatus.ACTIVE) // true
 * canTransitionTemplate(TemplateStatus.ARCHIVED, TemplateStatus.ACTIVE) // false
 * ```
 */
export function canTransitionTemplate(from: TemplateStatus, to: TemplateStatus): boolean {
    return TemplateStatusTransitions[from].includes(to)
}

/**
 * Get all available template statuses.
 */
export function getTemplateStatuses(): TemplateStatus[] {
    return Object.values(TemplateStatus)
}

/**
 * Type guard to check if a value is a valid TemplateStatus.
 */
export function isTemplateStatus(value: unknown): value is TemplateStatus {
    return (
        typeof value === "string" && Object.values(TemplateStatus).includes(value as TemplateStatus)
    )
}

/**
 * Display names for template statuses.
 */
export const TemplateStatusDisplayName: Record<TemplateStatus, string> = {
    [TemplateStatus.DRAFT]: "Draft",
    [TemplateStatus.ACTIVE]: "Active",
    [TemplateStatus.ARCHIVED]: "Archived",
}
