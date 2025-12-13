import { Merchant } from "../../domain/entities/Merchant"

/**
 * Port interface for merchant persistence.
 */
export interface MerchantRepositoryPort {
    /**
     * Save a merchant (create or update).
     */
    save(merchant: Merchant): Promise<void>

    /**
     * Find merchant by ID.
     */
    findById(id: string): Promise<Merchant | null>

    /**
     * Find merchant by email.
     */
    findByEmail(email: string): Promise<Merchant | null>

    /**
     * List all merchants.
     */
    findAll(limit?: number, offset?: number): Promise<Merchant[]>

    /**
     * Delete a merchant.
     */
    delete(id: string): Promise<void>
}
