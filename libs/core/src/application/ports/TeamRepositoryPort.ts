import { Team } from "../../domain/entities/Team"

/**
 * Port for Team persistence operations.
 */
export interface TeamRepositoryPort {
    /**
     * Save a team (create or update).
     */
    save(team: Team): Promise<void>

    /**
     * Find a team by ID.
     */
    findById(id: string): Promise<Team | null>

    /**
     * Find a team by merchant ID.
     * Each merchant has exactly one team.
     */
    findByMerchantId(merchantId: string): Promise<Team | null>

    /**
     * Find teams where a user is a member.
     */
    findByUserId(userId: string): Promise<Team[]>

    /**
     * Find a team by member email.
     */
    findByMemberEmail(email: string): Promise<Team | null>

    /**
     * Delete a team.
     */
    delete(id: string): Promise<void>

    /**
     * Check if a team exists for a merchant.
     */
    existsForMerchant(merchantId: string): Promise<boolean>
}
