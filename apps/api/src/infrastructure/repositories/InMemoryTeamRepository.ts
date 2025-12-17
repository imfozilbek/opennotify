import { Team, TeamRepositoryPort } from "@opennotify/core"

/**
 * In-memory implementation of TeamRepositoryPort.
 * For development and testing purposes.
 */
export class InMemoryTeamRepository implements TeamRepositoryPort {
    private readonly teams = new Map<string, Team>()

    async save(team: Team): Promise<void> {
        this.teams.set(team.id, team)
    }

    async findById(id: string): Promise<Team | null> {
        const team = this.teams.get(id)
        return team ?? null
    }

    async findByMerchantId(merchantId: string): Promise<Team | null> {
        for (const team of this.teams.values()) {
            if (team.merchantId === merchantId) {
                return team
            }
        }
        return null
    }

    async findByUserId(userId: string): Promise<Team[]> {
        const result: Team[] = []
        for (const team of this.teams.values()) {
            if (team.isMember(userId)) {
                result.push(team)
            }
        }
        return result
    }

    async findByMemberEmail(email: string): Promise<Team | null> {
        for (const team of this.teams.values()) {
            if (team.getMemberByEmail(email)) {
                return team
            }
        }
        return null
    }

    async delete(id: string): Promise<void> {
        this.teams.delete(id)
    }

    async existsForMerchant(merchantId: string): Promise<boolean> {
        for (const team of this.teams.values()) {
            if (team.merchantId === merchantId) {
                return true
            }
        }
        return false
    }
}

// Shared instance for cross-module access
export const sharedTeamRepository = new InMemoryTeamRepository()
