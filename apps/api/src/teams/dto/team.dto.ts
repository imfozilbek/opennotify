import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from "class-validator"
import { AuditAction, TeamRole } from "@opennotify/core"

/**
 * DTO for creating a team.
 */
export class CreateTeamDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name!: string
}

/**
 * DTO for adding a team member.
 */
export class AddMemberDto {
    @IsEmail()
    email!: string

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    name!: string

    @IsEnum(TeamRole)
    role!: TeamRole
}

/**
 * DTO for updating a member's role.
 */
export class UpdateMemberRoleDto {
    @IsEnum(TeamRole)
    role!: TeamRole
}

/**
 * DTO for querying audit logs.
 */
export class GetAuditLogsQueryDto {
    @IsOptional()
    @IsEnum(AuditAction)
    action?: AuditAction

    @IsOptional()
    @IsString()
    actorId?: string

    @IsOptional()
    @IsString()
    targetId?: string

    @IsOptional()
    @IsString()
    startDate?: string

    @IsOptional()
    @IsString()
    endDate?: string

    @IsOptional()
    page?: number

    @IsOptional()
    limit?: number
}

/**
 * Team member response.
 */
export interface TeamMemberResponse {
    userId: string
    email: string
    name: string
    role: TeamRole
    joinedAt: string
    invitedBy?: string
}

/**
 * Team response.
 */
export interface TeamResponse {
    id: string
    merchantId: string
    name: string
    members: TeamMemberResponse[]
    memberCount: number
    createdAt: string
    updatedAt: string
}

/**
 * Audit log response.
 */
export interface AuditLogResponse {
    id: string
    action: AuditAction
    actorId: string
    actorEmail: string
    targetId?: string
    targetType?: string
    details: Record<string, unknown>
    description: string
    createdAt: string
}

/**
 * Paginated audit logs response.
 */
export interface PaginatedAuditLogsResponse {
    logs: AuditLogResponse[]
    total: number
    page: number
    limit: number
    totalPages: number
}
