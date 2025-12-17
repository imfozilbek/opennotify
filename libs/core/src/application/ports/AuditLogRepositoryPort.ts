import { AuditAction, AuditLog } from "../../domain/entities/AuditLog"

/**
 * Filters for querying audit logs.
 */
export interface AuditLogFilters {
    merchantId?: string
    teamId?: string
    actorId?: string
    action?: AuditAction
    targetId?: string
    startDate?: Date
    endDate?: Date
}

/**
 * Port for AuditLog persistence operations.
 */
export interface AuditLogRepositoryPort {
    /**
     * Save an audit log entry.
     */
    save(auditLog: AuditLog): Promise<void>

    /**
     * Find an audit log by ID.
     */
    findById(id: string): Promise<AuditLog | null>

    /**
     * Find audit logs by merchant ID with pagination.
     */
    findByMerchantId(merchantId: string, page: number, limit: number): Promise<AuditLog[]>

    /**
     * Find audit logs with filters.
     */
    findWithFilters(filters: AuditLogFilters, page: number, limit: number): Promise<AuditLog[]>

    /**
     * Count audit logs with filters.
     */
    countWithFilters(filters: AuditLogFilters): Promise<number>
}
