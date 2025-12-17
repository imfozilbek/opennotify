import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"
import * as crypto from "crypto"
import {
    AddTeamMemberUseCase,
    CreateTeamUseCase,
    GetAuditLogsUseCase,
    RemoveTeamMemberUseCase,
    Team,
    TeamRole,
} from "@opennotify/core"
import { sharedAuditLogRepository, sharedTeamRepository } from "../infrastructure/repositories"
import {
    AddMemberDto,
    AuditLogResponse,
    CreateTeamDto,
    GetAuditLogsQueryDto,
    PaginatedAuditLogsResponse,
    TeamMemberResponse,
    TeamResponse,
    UpdateMemberRoleDto,
} from "./dto/team.dto"

@Injectable()
export class TeamsService {
    private readonly createTeamUseCase: CreateTeamUseCase
    private readonly addMemberUseCase: AddTeamMemberUseCase
    private readonly removeMemberUseCase: RemoveTeamMemberUseCase
    private readonly getAuditLogsUseCase: GetAuditLogsUseCase

    constructor() {
        this.createTeamUseCase = new CreateTeamUseCase(
            sharedTeamRepository,
            sharedAuditLogRepository,
        )
        this.addMemberUseCase = new AddTeamMemberUseCase(
            sharedTeamRepository,
            sharedAuditLogRepository,
        )
        this.removeMemberUseCase = new RemoveTeamMemberUseCase(
            sharedTeamRepository,
            sharedAuditLogRepository,
        )
        this.getAuditLogsUseCase = new GetAuditLogsUseCase(sharedAuditLogRepository)
    }

    /**
     * Get team for a merchant.
     */
    async getTeam(merchantId: string): Promise<TeamResponse | null> {
        const team = await sharedTeamRepository.findByMerchantId(merchantId)
        if (!team) {
            return null
        }
        return this.toTeamResponse(team)
    }

    /**
     * Create a team for a merchant.
     */
    async createTeam(
        merchantId: string,
        dto: CreateTeamDto,
        actorId: string,
        actorEmail: string,
        ipAddress?: string,
    ): Promise<TeamResponse> {
        const result = await this.createTeamUseCase.execute({
            id: `team_${crypto.randomUUID()}`,
            merchantId,
            name: dto.name,
            ownerId: actorId,
            ownerEmail: actorEmail,
            ownerName: actorEmail.split("@")[0],
            ipAddress,
        })

        return this.toTeamResponse(result.team)
    }

    /**
     * Add a member to a team.
     */
    async addMember(
        merchantId: string,
        dto: AddMemberDto,
        actorId: string,
        actorEmail: string,
        ipAddress?: string,
    ): Promise<TeamResponse> {
        const team = await sharedTeamRepository.findByMerchantId(merchantId)
        if (!team) {
            throw new NotFoundException("Team not found")
        }

        const result = await this.addMemberUseCase.execute({
            teamId: team.id,
            actorId,
            actorEmail,
            newMember: {
                userId: `user_${crypto.randomUUID()}`,
                email: dto.email,
                name: dto.name,
                role: dto.role,
            },
            ipAddress,
        })

        return this.toTeamResponse(result.team)
    }

    /**
     * Remove a member from a team.
     */
    async removeMember(
        merchantId: string,
        userId: string,
        actorId: string,
        actorEmail: string,
        ipAddress?: string,
    ): Promise<TeamResponse> {
        const team = await sharedTeamRepository.findByMerchantId(merchantId)
        if (!team) {
            throw new NotFoundException("Team not found")
        }

        const result = await this.removeMemberUseCase.execute({
            teamId: team.id,
            actorId,
            actorEmail,
            targetUserId: userId,
            ipAddress,
        })

        return this.toTeamResponse(result.team)
    }

    /**
     * Update a member's role.
     */
    async updateMemberRole(
        merchantId: string,
        userId: string,
        dto: UpdateMemberRoleDto,
        actorId: string,
        _ipAddress?: string,
    ): Promise<TeamResponse> {
        const team = await sharedTeamRepository.findByMerchantId(merchantId)
        if (!team) {
            throw new NotFoundException("Team not found")
        }

        try {
            team.updateMemberRole(userId, dto.role, actorId)
            await sharedTeamRepository.save(team)
            return this.toTeamResponse(team)
        } catch (error) {
            if (error instanceof Error) {
                throw new ForbiddenException(error.message)
            }
            throw error
        }
    }

    /**
     * Get audit logs for a merchant.
     */
    async getAuditLogs(
        merchantId: string,
        query: GetAuditLogsQueryDto,
    ): Promise<PaginatedAuditLogsResponse> {
        const team = await sharedTeamRepository.findByMerchantId(merchantId)

        const result = await this.getAuditLogsUseCase.execute({
            merchantId,
            teamId: team?.id,
            action: query.action,
            actorId: query.actorId,
            targetId: query.targetId,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
            page: query.page ?? 1,
            limit: query.limit ?? 20,
        })

        return {
            logs: result.logs.map(
                (log): AuditLogResponse => ({
                    id: log.id,
                    action: log.action,
                    actorId: log.actorId,
                    actorEmail: log.actorEmail,
                    targetId: log.targetId,
                    targetType: log.targetType,
                    details: log.details,
                    description: log.getDescription(),
                    createdAt: log.createdAt.toISOString(),
                }),
            ),
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
        }
    }

    /**
     * Convert Team entity to response.
     */
    private toTeamResponse(team: Team): TeamResponse {
        return {
            id: team.id,
            merchantId: team.merchantId,
            name: team.name,
            members: team.members.map(
                (m): TeamMemberResponse => ({
                    userId: m.userId,
                    email: m.email,
                    name: m.name,
                    role: m.role as TeamRole,
                    joinedAt: m.joinedAt.toISOString(),
                    invitedBy: m.invitedBy,
                }),
            ),
            memberCount: team.getMemberCount(),
            createdAt: team.createdAt.toISOString(),
            updatedAt: team.updatedAt.toISOString(),
        }
    }
}
