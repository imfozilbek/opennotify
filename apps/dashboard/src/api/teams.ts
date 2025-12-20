import { apiDelete, apiGet, apiPost, apiPut } from "./client"
import type {
    AddMemberRequest,
    ApiResponse,
    AuditLogsQuery,
    CreateTeamRequest,
    PaginatedAuditLogs,
    Team,
    TeamMember,
    TeamRole,
} from "@/types/api"

export interface TeamData {
    team: Team
}

export interface MemberData {
    member: TeamMember
}

export async function getTeam(): Promise<ApiResponse<TeamData>> {
    return apiGet<TeamData>("/api/v1/teams")
}

export async function createTeam(data: CreateTeamRequest): Promise<ApiResponse<TeamData>> {
    return apiPost<TeamData>("/api/v1/teams", data)
}

export async function addMember(data: AddMemberRequest): Promise<ApiResponse<MemberData>> {
    return apiPost<MemberData>("/api/v1/teams/members", data)
}

export async function updateMemberRole(
    userId: string,
    role: TeamRole,
): Promise<ApiResponse<MemberData>> {
    return apiPut<MemberData>(`/api/v1/teams/members/${userId}/role`, { role })
}

export async function removeMember(userId: string): Promise<ApiResponse<undefined>> {
    return apiDelete<undefined>(`/api/v1/teams/members/${userId}`)
}

export async function getAuditLogs(
    query: AuditLogsQuery = {},
): Promise<ApiResponse<PaginatedAuditLogs>> {
    const params = new URLSearchParams()

    if (query.action) {
        params.append("action", query.action)
    }
    if (query.actorId) {
        params.append("actorId", query.actorId)
    }
    if (query.targetId) {
        params.append("targetId", query.targetId)
    }
    if (query.startDate) {
        params.append("startDate", query.startDate)
    }
    if (query.endDate) {
        params.append("endDate", query.endDate)
    }
    if (query.page) {
        params.append("page", String(query.page))
    }
    if (query.limit) {
        params.append("limit", String(query.limit))
    }

    const queryString = params.toString()
    const endpoint = queryString
        ? `/api/v1/teams/audit-logs?${queryString}`
        : "/api/v1/teams/audit-logs"

    return apiGet<PaginatedAuditLogs>(endpoint)
}
