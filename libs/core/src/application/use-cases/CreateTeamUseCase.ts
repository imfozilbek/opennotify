import { Team } from "../../domain/entities/Team"
import { AuditAction, AuditLog } from "../../domain/entities/AuditLog"
import { TeamRepositoryPort } from "../ports/TeamRepositoryPort"
import { AuditLogRepositoryPort } from "../ports/AuditLogRepositoryPort"

/**
 * Input for creating a team.
 */
export interface CreateTeamInput {
    id: string
    merchantId: string
    name: string
    ownerId: string
    ownerEmail: string
    ownerName: string
    ipAddress?: string
    userAgent?: string
}

/**
 * Output from creating a team.
 */
export interface CreateTeamOutput {
    team: Team
}

/**
 * Use case for creating a new team for a merchant.
 *
 * Each merchant can have only one team. The creator becomes the owner.
 *
 * @example
 * ```typescript
 * const useCase = new CreateTeamUseCase(teamRepo, auditRepo)
 * const result = await useCase.execute({
 *     id: "team_123",
 *     merchantId: "merchant_456",
 *     name: "My Company",
 *     ownerId: "user_789",
 *     ownerEmail: "owner@company.uz",
 *     ownerName: "John Doe",
 * })
 * ```
 */
export class CreateTeamUseCase {
    constructor(
        private readonly teamRepository: TeamRepositoryPort,
        private readonly auditLogRepository: AuditLogRepositoryPort,
    ) {}

    async execute(input: CreateTeamInput): Promise<CreateTeamOutput> {
        // Check if merchant already has a team
        const existingTeam = await this.teamRepository.findByMerchantId(input.merchantId)
        if (existingTeam) {
            throw new Error("Merchant already has a team")
        }

        // Create team
        const team = Team.create({
            id: input.id,
            merchantId: input.merchantId,
            name: input.name,
            ownerId: input.ownerId,
            ownerEmail: input.ownerEmail,
            ownerName: input.ownerName,
        })

        // Save team
        await this.teamRepository.save(team)

        // Create audit log
        const auditLog = AuditLog.create({
            id: `audit_${String(Date.now())}`,
            merchantId: input.merchantId,
            teamId: team.id,
            action: AuditAction.TEAM_CREATED,
            actorId: input.ownerId,
            actorEmail: input.ownerEmail,
            details: { teamName: input.name },
            ipAddress: input.ipAddress,
            userAgent: input.userAgent,
        })

        await this.auditLogRepository.save(auditLog)

        return { team }
    }
}
