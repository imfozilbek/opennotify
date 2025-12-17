import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common"
import { Request } from "express"
import { ApiKeyGuard } from "../common/guards"
import { CurrentMerchant, RequirePermissions } from "../common/decorators"
import { ApiKeyPermission, Merchant } from "@opennotify/core"
import { TeamsService } from "./teams.service"
import {
    AddMemberDto,
    CreateTeamDto,
    GetAuditLogsQueryDto,
    PaginatedAuditLogsResponse,
    TeamResponse,
    UpdateMemberRoleDto,
} from "./dto/team.dto"

@Controller("teams")
@UseGuards(ApiKeyGuard)
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) {}

    /**
     * Get the current team for the merchant.
     */
    @Get()
    @RequirePermissions(ApiKeyPermission.READ)
    async getTeam(@CurrentMerchant() merchant: Merchant): Promise<TeamResponse> {
        const team = await this.teamsService.getTeam(merchant.id)
        if (!team) {
            throw new NotFoundException("Team not found. Create a team first.")
        }
        return team
    }

    /**
     * Create a new team for the merchant.
     */
    @Post()
    @RequirePermissions(ApiKeyPermission.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createTeam(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: CreateTeamDto,
        @Req() req: Request,
    ): Promise<TeamResponse> {
        const ipAddress = req.ip ?? req.socket.remoteAddress
        return this.teamsService.createTeam(
            merchant.id,
            dto,
            merchant.id, // Owner is the merchant creator
            merchant.email,
            ipAddress,
        )
    }

    /**
     * Add a member to the team.
     */
    @Post("members")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async addMember(
        @CurrentMerchant() merchant: Merchant,
        @Body() dto: AddMemberDto,
        @Req() req: Request,
    ): Promise<TeamResponse> {
        const ipAddress = req.ip ?? req.socket.remoteAddress
        return this.teamsService.addMember(merchant.id, dto, merchant.id, merchant.email, ipAddress)
    }

    /**
     * Update a member's role.
     */
    @Put("members/:userId/role")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async updateMemberRole(
        @CurrentMerchant() merchant: Merchant,
        @Param("userId") userId: string,
        @Body() dto: UpdateMemberRoleDto,
        @Req() req: Request,
    ): Promise<TeamResponse> {
        const ipAddress = req.ip ?? req.socket.remoteAddress
        return this.teamsService.updateMemberRole(merchant.id, userId, dto, merchant.id, ipAddress)
    }

    /**
     * Remove a member from the team.
     */
    @Delete("members/:userId")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async removeMember(
        @CurrentMerchant() merchant: Merchant,
        @Param("userId") userId: string,
        @Req() req: Request,
    ): Promise<TeamResponse> {
        const ipAddress = req.ip ?? req.socket.remoteAddress
        return this.teamsService.removeMember(
            merchant.id,
            userId,
            merchant.id,
            merchant.email,
            ipAddress,
        )
    }

    /**
     * Get audit logs for the merchant.
     */
    @Get("audit-logs")
    @RequirePermissions(ApiKeyPermission.ADMIN)
    async getAuditLogs(
        @CurrentMerchant() merchant: Merchant,
        @Query() query: GetAuditLogsQueryDto,
    ): Promise<PaginatedAuditLogsResponse> {
        return this.teamsService.getAuditLogs(merchant.id, query)
    }
}
