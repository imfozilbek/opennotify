/**
 * Audit log action types.
 */
export enum AuditAction {
    // Team actions
    TEAM_CREATED = "TEAM_CREATED",
    TEAM_UPDATED = "TEAM_UPDATED",
    TEAM_DELETED = "TEAM_DELETED",

    // Member actions
    MEMBER_ADDED = "MEMBER_ADDED",
    MEMBER_REMOVED = "MEMBER_REMOVED",
    MEMBER_ROLE_CHANGED = "MEMBER_ROLE_CHANGED",
    OWNERSHIP_TRANSFERRED = "OWNERSHIP_TRANSFERRED",

    // Provider actions
    PROVIDER_CONNECTED = "PROVIDER_CONNECTED",
    PROVIDER_DISCONNECTED = "PROVIDER_DISCONNECTED",

    // API Key actions
    API_KEY_CREATED = "API_KEY_CREATED",
    API_KEY_REVOKED = "API_KEY_REVOKED",

    // Settings actions
    SETTINGS_UPDATED = "SETTINGS_UPDATED",
}

/**
 * Properties for creating a new AuditLog.
 */
export interface CreateAuditLogProps {
    id: string
    merchantId: string
    teamId?: string
    action: AuditAction
    actorId: string
    actorEmail: string
    targetId?: string
    targetType?: string
    details?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
}

/**
 * Properties for reconstructing an AuditLog from persistence.
 */
export interface AuditLogProps extends CreateAuditLogProps {
    createdAt: Date
}

/**
 * AuditLog entity for tracking important actions.
 *
 * Audit logs are immutable - once created, they cannot be modified.
 *
 * @example
 * ```typescript
 * const log = AuditLog.create({
 *     id: "audit_123",
 *     merchantId: "merchant_456",
 *     teamId: "team_789",
 *     action: AuditAction.MEMBER_ADDED,
 *     actorId: "user_abc",
 *     actorEmail: "admin@company.uz",
 *     targetId: "user_def",
 *     targetType: "TeamMember",
 *     details: { role: "MEMBER", email: "new@company.uz" },
 *     ipAddress: "192.168.1.1",
 * })
 * ```
 */
export class AuditLog {
    private readonly _id: string
    private readonly _merchantId: string
    private readonly _teamId?: string
    private readonly _action: AuditAction
    private readonly _actorId: string
    private readonly _actorEmail: string
    private readonly _targetId?: string
    private readonly _targetType?: string
    private readonly _details: Record<string, unknown>
    private readonly _ipAddress?: string
    private readonly _userAgent?: string
    private readonly _createdAt: Date

    private constructor(props: AuditLogProps) {
        this._id = props.id
        this._merchantId = props.merchantId
        this._teamId = props.teamId
        this._action = props.action
        this._actorId = props.actorId
        this._actorEmail = props.actorEmail
        this._targetId = props.targetId
        this._targetType = props.targetType
        this._details = { ...props.details }
        this._ipAddress = props.ipAddress
        this._userAgent = props.userAgent
        this._createdAt = props.createdAt
    }

    /**
     * Create a new audit log entry.
     */
    static create(props: CreateAuditLogProps): AuditLog {
        return new AuditLog({
            ...props,
            details: props.details ?? {},
            createdAt: new Date(),
        })
    }

    /**
     * Reconstruct an audit log from persistence.
     */
    static fromPersistence(props: AuditLogProps): AuditLog {
        return new AuditLog(props)
    }

    // Getters (all readonly - audit logs are immutable)
    get id(): string {
        return this._id
    }

    get merchantId(): string {
        return this._merchantId
    }

    get teamId(): string | undefined {
        return this._teamId
    }

    get action(): AuditAction {
        return this._action
    }

    get actorId(): string {
        return this._actorId
    }

    get actorEmail(): string {
        return this._actorEmail
    }

    get targetId(): string | undefined {
        return this._targetId
    }

    get targetType(): string | undefined {
        return this._targetType
    }

    get details(): Record<string, unknown> {
        return { ...this._details }
    }

    get ipAddress(): string | undefined {
        return this._ipAddress
    }

    get userAgent(): string | undefined {
        return this._userAgent
    }

    get createdAt(): Date {
        return this._createdAt
    }

    /**
     * Get a human-readable description of the action.
     */
    getDescription(): string {
        const descriptions: Record<AuditAction, string> = {
            [AuditAction.TEAM_CREATED]: "Team was created",
            [AuditAction.TEAM_UPDATED]: "Team was updated",
            [AuditAction.TEAM_DELETED]: "Team was deleted",
            [AuditAction.MEMBER_ADDED]: "Member was added to team",
            [AuditAction.MEMBER_REMOVED]: "Member was removed from team",
            [AuditAction.MEMBER_ROLE_CHANGED]: "Member role was changed",
            [AuditAction.OWNERSHIP_TRANSFERRED]: "Team ownership was transferred",
            [AuditAction.PROVIDER_CONNECTED]: "Provider was connected",
            [AuditAction.PROVIDER_DISCONNECTED]: "Provider was disconnected",
            [AuditAction.API_KEY_CREATED]: "API key was created",
            [AuditAction.API_KEY_REVOKED]: "API key was revoked",
            [AuditAction.SETTINGS_UPDATED]: "Settings were updated",
        }

        return descriptions[this._action]
    }

    /**
     * Convert to plain object for persistence.
     */
    toPersistence(): AuditLogProps {
        return {
            id: this._id,
            merchantId: this._merchantId,
            teamId: this._teamId,
            action: this._action,
            actorId: this._actorId,
            actorEmail: this._actorEmail,
            targetId: this._targetId,
            targetType: this._targetType,
            details: { ...this._details },
            ipAddress: this._ipAddress,
            userAgent: this._userAgent,
            createdAt: this._createdAt,
        }
    }
}
