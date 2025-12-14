import { Template } from "../../domain/entities/Template"
import { Channel } from "../../domain/value-objects/Channel"
import { TemplateStatus } from "../../domain/value-objects/TemplateStatus"

/**
 * Options for filtering templates.
 */
export interface FindTemplatesOptions {
    /** Filter by status */
    status?: TemplateStatus

    /** Filter by channel */
    channel?: Channel

    /** Maximum number of results */
    limit?: number

    /** Number of results to skip */
    offset?: number
}

/**
 * Port interface for template persistence.
 *
 * This interface defines the contract for template storage operations.
 * Implemented by infrastructure layer (e.g., database repositories).
 *
 * @example
 * ```typescript
 * class InMemoryTemplateRepository implements TemplateRepositoryPort {
 *     private templates = new Map<string, Template>()
 *
 *     async save(template: Template): Promise<void> {
 *         this.templates.set(template.id, template)
 *     }
 *
 *     async findById(id: string): Promise<Template | null> {
 *         return this.templates.get(id) ?? null
 *     }
 *     // ...
 * }
 * ```
 */
export interface TemplateRepositoryPort {
    /**
     * Save a template (create or update).
     *
     * @param template - Template entity to save
     */
    save(template: Template): Promise<void>

    /**
     * Find template by ID.
     *
     * @param id - Template ID
     * @returns Template if found, null otherwise
     */
    findById(id: string): Promise<Template | null>

    /**
     * Find templates by merchant ID.
     *
     * @param merchantId - Merchant ID
     * @param options - Filter and pagination options
     * @returns Array of templates
     */
    findByMerchantId(merchantId: string, options?: FindTemplatesOptions): Promise<Template[]>

    /**
     * Find template by name within a merchant.
     *
     * Template names are unique per merchant.
     *
     * @param merchantId - Merchant ID
     * @param name - Template name
     * @returns Template if found, null otherwise
     */
    findByName(merchantId: string, name: string): Promise<Template | null>

    /**
     * Delete a template by ID.
     *
     * @param id - Template ID
     */
    delete(id: string): Promise<void>

    /**
     * Count templates by merchant.
     *
     * @param merchantId - Merchant ID
     * @param status - Optional status filter
     * @returns Number of templates
     */
    countByMerchantId(merchantId: string, status?: TemplateStatus): Promise<number>
}
