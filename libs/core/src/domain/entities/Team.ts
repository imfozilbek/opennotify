import { canManageRole, TeamRole } from "../value-objects/TeamRole"

/**
 * Team member representation.
 */
export interface TeamMember {
    /** User ID (email or unique identifier) */
    userId: string

    /** Member's email */
    email: string

    /** Member's display name */
    name: string

    /** Role in the team */
    role: TeamRole

    /** When the member joined */
    joinedAt: Date

    /** Who invited this member */
    invitedBy?: string
}

/**
 * Properties for creating a new Team.
 */
export interface CreateTeamProps {
    id: string
    merchantId: string
    name: string
    ownerId: string
    ownerEmail: string
    ownerName: string
}

/**
 * Properties for reconstructing a Team from persistence.
 */
export interface TeamProps {
    id: string
    merchantId: string
    name: string
    members: TeamMember[]
    createdAt: Date
    updatedAt: Date
}

/**
 * Team entity for managing access to merchant resources.
 *
 * Each merchant has one team. Team members have different roles
 * that determine their permissions.
 *
 * @example
 * ```typescript
 * const team = Team.create({
 *     id: "team_123",
 *     merchantId: "merchant_456",
 *     name: "My Company",
 *     ownerId: "user_789",
 *     ownerEmail: "owner@company.uz",
 *     ownerName: "John Doe",
 * })
 *
 * team.addMember({
 *     userId: "user_abc",
 *     email: "dev@company.uz",
 *     name: "Jane Smith",
 *     role: TeamRole.MEMBER,
 *     invitedBy: "user_789",
 * })
 * ```
 */
export class Team {
    private readonly _id: string
    private readonly _merchantId: string
    private readonly _createdAt: Date

    private _name: string
    private _members: TeamMember[]
    private _updatedAt: Date

    private constructor(props: TeamProps) {
        this._id = props.id
        this._merchantId = props.merchantId
        this._name = props.name
        this._members = props.members.map((m) => ({ ...m }))
        this._createdAt = props.createdAt
        this._updatedAt = props.updatedAt
    }

    /**
     * Create a new team with an owner.
     */
    static create(props: CreateTeamProps): Team {
        const now = new Date()
        const owner: TeamMember = {
            userId: props.ownerId,
            email: props.ownerEmail,
            name: props.ownerName,
            role: TeamRole.OWNER,
            joinedAt: now,
        }

        return new Team({
            id: props.id,
            merchantId: props.merchantId,
            name: props.name,
            members: [owner],
            createdAt: now,
            updatedAt: now,
        })
    }

    /**
     * Reconstruct a team from persistence.
     */
    static fromPersistence(props: TeamProps): Team {
        return new Team(props)
    }

    // Getters
    get id(): string {
        return this._id
    }

    get merchantId(): string {
        return this._merchantId
    }

    get name(): string {
        return this._name
    }

    get members(): TeamMember[] {
        return this._members.map((m) => ({ ...m }))
    }

    get createdAt(): Date {
        return this._createdAt
    }

    get updatedAt(): Date {
        return this._updatedAt
    }

    /**
     * Get the team owner.
     */
    getOwner(): TeamMember | undefined {
        return this._members.find((m) => m.role === TeamRole.OWNER)
    }

    /**
     * Get a member by user ID.
     */
    getMember(userId: string): TeamMember | undefined {
        const member = this._members.find((m) => m.userId === userId)
        return member ? { ...member } : undefined
    }

    /**
     * Get a member by email.
     */
    getMemberByEmail(email: string): TeamMember | undefined {
        const member = this._members.find((m) => m.email.toLowerCase() === email.toLowerCase())
        return member ? { ...member } : undefined
    }

    /**
     * Check if a user is a member of the team.
     */
    isMember(userId: string): boolean {
        return this._members.some((m) => m.userId === userId)
    }

    /**
     * Get member count.
     */
    getMemberCount(): number {
        return this._members.length
    }

    /**
     * Update team name.
     */
    updateName(name: string): void {
        this._name = name
        this._updatedAt = new Date()
    }

    /**
     * Add a new member to the team.
     * @throws Error if member already exists
     */
    addMember(member: Omit<TeamMember, "joinedAt"> & { invitedBy: string }): void {
        if (this.isMember(member.userId)) {
            throw new Error(`User ${member.userId} is already a member of this team`)
        }

        if (this.getMemberByEmail(member.email)) {
            throw new Error(`Email ${member.email} is already used by another team member`)
        }

        if (member.role === TeamRole.OWNER) {
            throw new Error("Cannot add another owner. Use transferOwnership instead.")
        }

        this._members.push({
            ...member,
            joinedAt: new Date(),
        })
        this._updatedAt = new Date()
    }

    /**
     * Remove a member from the team.
     * @throws Error if member is the owner or doesn't exist
     */
    removeMember(userId: string): void {
        const member = this.getMember(userId)

        if (!member) {
            throw new Error(`User ${userId} is not a member of this team`)
        }

        if (member.role === TeamRole.OWNER) {
            throw new Error("Cannot remove the team owner")
        }

        this._members = this._members.filter((m) => m.userId !== userId)
        this._updatedAt = new Date()
    }

    /**
     * Update a member's role.
     * @throws Error if trying to change owner role or member doesn't exist
     */
    updateMemberRole(userId: string, newRole: TeamRole, byUserId: string): void {
        const memberIndex = this._members.findIndex((m) => m.userId === userId)

        if (memberIndex === -1) {
            throw new Error(`User ${userId} is not a member of this team`)
        }

        const member = this._members[memberIndex]
        const manager = this.getMember(byUserId)

        if (!manager) {
            throw new Error(`Manager ${byUserId} is not a member of this team`)
        }

        if (member.role === TeamRole.OWNER) {
            throw new Error("Cannot change owner role. Use transferOwnership instead.")
        }

        if (newRole === TeamRole.OWNER) {
            throw new Error("Cannot promote to owner. Use transferOwnership instead.")
        }

        if (!canManageRole(manager.role, newRole)) {
            throw new Error(`${manager.role} cannot assign ${newRole} role`)
        }

        this._members[memberIndex] = {
            ...member,
            role: newRole,
        }
        this._updatedAt = new Date()
    }

    /**
     * Transfer ownership to another member.
     * The current owner becomes an admin.
     * @throws Error if target is not a member or caller is not owner
     */
    transferOwnership(newOwnerId: string, currentOwnerId: string): void {
        const currentOwner = this.getMember(currentOwnerId)
        const newOwner = this.getMember(newOwnerId)

        if (!currentOwner || currentOwner.role !== TeamRole.OWNER) {
            throw new Error("Only the owner can transfer ownership")
        }

        if (!newOwner) {
            throw new Error(`User ${newOwnerId} is not a member of this team`)
        }

        // Update roles
        const currentOwnerIndex = this._members.findIndex((m) => m.userId === currentOwnerId)
        const newOwnerIndex = this._members.findIndex((m) => m.userId === newOwnerId)

        this._members[currentOwnerIndex] = {
            ...this._members[currentOwnerIndex],
            role: TeamRole.ADMIN,
        }

        this._members[newOwnerIndex] = {
            ...this._members[newOwnerIndex],
            role: TeamRole.OWNER,
        }

        this._updatedAt = new Date()
    }

    /**
     * Convert to plain object for persistence.
     */
    toPersistence(): TeamProps {
        return {
            id: this._id,
            merchantId: this._merchantId,
            name: this._name,
            members: this._members.map((m) => ({ ...m })),
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        }
    }
}
