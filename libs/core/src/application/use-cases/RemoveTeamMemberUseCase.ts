import { Team } from "../../domain/entities/Team"
import { AuditAction, AuditLog } from "../../domain/entities/AuditLog"
import { roleHasPermission, TeamAction } from "../../domain/value-objects/TeamRole"
import { TeamRepositoryPort } from "../ports/TeamRepositoryPort"
import { AuditLogRepositoryPort } from "../ports/AuditLogRepositoryPort"

/**
 * Input for removing a team member.
 */
export interface RemoveTeamMemberInput {
    teamId: string
    actorId: string
    actorEmail: string
    targetUserId: string
    ipAddress?: string
    userAgent?: string
}

/**
 * Output from removing a team member.
 */
export interface RemoveTeamMemberOutput {
    team: Team
}

/**
 * Use case for removing a member from a team.
 *
 * Only users with REMOVE_MEMBER permission can remove members.
 * Cannot remove the team owner.
 *
 * @example
 * ```typescript
 * const useCase = new RemoveTeamMemberUseCase(teamRepo, auditRepo)
 * const result = await useCase.execute({
 *     teamId: "team_123",
 *     actorId: "user_456",
 *     actorEmail: "admin@company.uz",
 *     targetUserId: "user_789",
 * })
 * ```
 */
export class RemoveTeamMemberUseCase {
    constructor(
        private readonly teamRepository: TeamRepositoryPort,
        private readonly auditLogRepository: AuditLogRepositoryPort,
    ) {}

    async execute(input: RemoveTeamMemberInput): Promise<RemoveTeamMemberOutput> {
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
        if (!roleHasPermission(actor.role, TeamAction.REMOVE_MEMBER)) {
            throw new Error("Actor does not have permission to remove members")
        }

        // Get target member info before removal
        const targetMember = team.getMember(input.targetUserId)
        if (!targetMember) {
            throw new Error("Target user is not a member of this team")
        }

        // Remove member
        team.removeMember(input.targetUserId)

        // Save team
        await this.teamRepository.save(team)

        // Create audit log
        const auditLog = AuditLog.create({
            id: `audit_${String(Date.now())}`,
            merchantId: team.merchantId,
            teamId: team.id,
            action: AuditAction.MEMBER_REMOVED,
            actorId: input.actorId,
            actorEmail: input.actorEmail,
            targetId: input.targetUserId,
            targetType: "TeamMember",
            details: {
                email: targetMember.email,
                name: targetMember.name,
                role: targetMember.role,
            },
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
        })

        await this.auditLogRepository.save(auditLog)

        return { team }
    }
}
