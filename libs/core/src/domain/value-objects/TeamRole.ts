/**
 * Team member roles with hierarchical permissions.
 */
export enum TeamRole {
    /**
     * Full access to team and all resources.
     * Can manage team members, billing, and settings.
     */
    OWNER = "OWNER",

    /**
     * Can manage team members and most settings.
     * Cannot delete team or transfer ownership.
     */
    ADMIN = "ADMIN",

    /**
     * Can send notifications, manage templates.
     * Cannot manage team members.
     */
    MEMBER = "MEMBER",

    /**
     * Read-only access to logs and analytics.
     * Cannot send notifications.
     */
    VIEWER = "VIEWER",
}

/**
 * Check if a role has permission to perform an action.
 */
export function roleHasPermission(role: TeamRole, action: TeamAction): boolean {
    const permissions = ROLE_PERMISSIONS[role]
    return permissions.includes(action)
}

/**
 * Team actions that can be performed.
 */
export enum TeamAction {
    // Team management
    UPDATE_TEAM = "UPDATE_TEAM",
    DELETE_TEAM = "DELETE_TEAM",
    TRANSFER_OWNERSHIP = "TRANSFER_OWNERSHIP",

    // Member management
    INVITE_MEMBER = "INVITE_MEMBER",
    REMOVE_MEMBER = "REMOVE_MEMBER",
    UPDATE_MEMBER_ROLE = "UPDATE_MEMBER_ROLE",

    // Notifications
    SEND_NOTIFICATION = "SEND_NOTIFICATION",
    VIEW_NOTIFICATIONS = "VIEW_NOTIFICATIONS",

    // Templates
    MANAGE_TEMPLATES = "MANAGE_TEMPLATES",
    VIEW_TEMPLATES = "VIEW_TEMPLATES",

    // Providers
    MANAGE_PROVIDERS = "MANAGE_PROVIDERS",
    VIEW_PROVIDERS = "VIEW_PROVIDERS",

    // Analytics
    VIEW_ANALYTICS = "VIEW_ANALYTICS",

    // Settings
    MANAGE_SETTINGS = "MANAGE_SETTINGS",
    VIEW_SETTINGS = "VIEW_SETTINGS",
}

/**
 * Permissions matrix for each role.
 */
const ROLE_PERMISSIONS: Record<TeamRole, TeamAction[]> = {
    [TeamRole.OWNER]: Object.values(TeamAction),

    [TeamRole.ADMIN]: [
        TeamAction.UPDATE_TEAM,
        TeamAction.INVITE_MEMBER,
        TeamAction.REMOVE_MEMBER,
        TeamAction.UPDATE_MEMBER_ROLE,
        TeamAction.SEND_NOTIFICATION,
        TeamAction.VIEW_NOTIFICATIONS,
        TeamAction.MANAGE_TEMPLATES,
        TeamAction.VIEW_TEMPLATES,
        TeamAction.MANAGE_PROVIDERS,
        TeamAction.VIEW_PROVIDERS,
        TeamAction.VIEW_ANALYTICS,
        TeamAction.MANAGE_SETTINGS,
        TeamAction.VIEW_SETTINGS,
    ],

    [TeamRole.MEMBER]: [
        TeamAction.SEND_NOTIFICATION,
        TeamAction.VIEW_NOTIFICATIONS,
        TeamAction.MANAGE_TEMPLATES,
        TeamAction.VIEW_TEMPLATES,
        TeamAction.VIEW_PROVIDERS,
        TeamAction.VIEW_ANALYTICS,
        TeamAction.VIEW_SETTINGS,
    ],

    [TeamRole.VIEWER]: [
        TeamAction.VIEW_NOTIFICATIONS,
        TeamAction.VIEW_TEMPLATES,
        TeamAction.VIEW_PROVIDERS,
        TeamAction.VIEW_ANALYTICS,
        TeamAction.VIEW_SETTINGS,
    ],
}

/**
 * Get all permissions for a role.
 */
export function getRolePermissions(role: TeamRole): TeamAction[] {
    return [...ROLE_PERMISSIONS[role]]
}

/**
 * Check if a role can manage another role.
 * OWNER can manage all, ADMIN can manage MEMBER and VIEWER.
 */
export function canManageRole(managerRole: TeamRole, targetRole: TeamRole): boolean {
    if (managerRole === TeamRole.OWNER) {
        return true
    }
    if (managerRole === TeamRole.ADMIN) {
        return targetRole === TeamRole.MEMBER || targetRole === TeamRole.VIEWER
    }
    return false
}
