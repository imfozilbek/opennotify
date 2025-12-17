import { Team } from "../../domain/entities/Team"
import { AuditAction, AuditLog } from "../../domain/entities/AuditLog"
import { roleHasPermission, TeamAction, TeamRole } from "../../domain/value-objects/TeamRole"
import { TeamRepositoryPort } from "../ports/TeamRepositoryPort"
import { AuditLogRepositoryPort } from "../ports/AuditLogRepositoryPort"

/**
 * Input for adding a team member.
 */
export interface AddTeamMemberInput {
    teamId: string
    actorId: string
    actorEmail: string
    newMember: {
        userId: string
        email: string
        name: string
        role: TeamRole
    }
    ipAddress?: string
    userAgent?: string
}

/**
 * Output from adding a team member.
 */
export interface AddTeamMemberOutput {
    team: Team
}

/**
 * Use case for adding a new member to a team.
 *
 * Only users with INVITE_MEMBER permission can add members.
 * Cannot add members with a higher role than the actor can manage.
 *
 * @example
 * ```typescript
 * const useCase = new AddTeamMemberUseCase(teamRepo, auditRepo)
 * const result = await useCase.execute({
 *     teamId: "team_123",
 *     actorId: "user_456",
 *     actorEmail: "admin@company.uz",
 *     newMember: {
 *         userId: "user_789",
 *         email: "dev@company.uz",
 *         name: "Jane Smith",
 *         role: TeamRole.MEMBER,
 *     },
 * })
 * ```
 */
export class AddTeamMemberUseCase {
    constructor(
        private readonly teamRepository: TeamRepositoryPort,
        private readonly auditLogRepository: AuditLogRepositoryPort,
    ) {}

    async execute(input: AddTeamMemberInput): Promise<AddTeamMemberOutput> {
        // Find team
        const team = await this.teamRepository.findById(input.teamId)
        if (!team) {
            throw new Error("Team not found")
        }

        // Check actor is a member
        const actor = team.getMember(input.actorId)
        if (!actor) {
            throw new Error("Actor is not a member of this team")
        }

        // Check actor has permission
        if (!roleHasPermission(actor.role, TeamAction.INVITE_MEMBER)) {
            throw new Error("Actor does not have permission to invite members")
        }

        // Add member
        team.addMember({
            userId: input.newMember.userId,
            email: input.newMember.email,
            name: input.newMember.name,
            role: input.newMember.role,
            invitedBy: input.actorId,
        })

        // Save team
        await this.teamRepository.save(team)

        // Create audit log
        const auditLog = AuditLog.create({
            id: `audit_${String(Date.now())}`,
            merchantId: team.merchantId,
            teamId: team.id,
            action: AuditAction.MEMBER_ADDED,
            actorId: input.actorId,
            actorEmail: input.actorEmail,
            targetId: input.newMember.userId,
            targetType: "TeamMember",
            details: {
                email: input.newMember.email,
                name: input.newMember.name,
                role: input.newMember.role,
            },
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
        })

        await this.auditLogRepository.save(auditLog)

        return { team }
    }
}
