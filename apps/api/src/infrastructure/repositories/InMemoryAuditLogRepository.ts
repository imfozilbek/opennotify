import { AuditLog, AuditLogFilters, AuditLogRepositoryPort } from "@opennotify/core"

/**
 * In-memory implementation of AuditLogRepositoryPort.
 * For development and testing purposes.
 */
export class InMemoryAuditLogRepository implements AuditLogRepositoryPort {
    private readonly logs: AuditLog[] = []

    async save(auditLog: AuditLog): Promise<void> {
        this.logs.push(auditLog)
    }

    async findById(id: string): Promise<AuditLog | null> {
        const log = this.logs.find((l) => l.id === id)
        return log ?? null
    }

    async findByMerchantId(merchantId: string, page: number, limit: number): Promise<AuditLog[]> {
        const filtered = this.logs
            .filter((l) => l.merchantId === merchantId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        const offset = (page - 1) * limit
        return filtered.slice(offset, offset + limit)
    }

    async findWithFilters(
        filters: AuditLogFilters,
        page: number,
        limit: number,
    ): Promise<AuditLog[]> {
        let filtered = [...this.logs]

        if (filters.merchantId) {
            filtered = filtered.filter((l) => l.merchantId === filters.merchantId)
        }

        if (filters.teamId) {
            filtered = filtered.filter((l) => l.teamId === filters.teamId)
        }

        if (filters.actorId) {
            filtered = filtered.filter((l) => l.actorId === filters.actorId)
        }

        if (filters.action) {
            filtered = filtered.filter((l) => l.action === filters.action)
        }

        if (filters.targetId) {
            filtered = filtered.filter((l) => l.targetId === filters.targetId)
        }

        if (filters.startDate) {
            filtered = filtered.filter((l) => l.createdAt >= filters.startDate!)
        }

        if (filters.endDate) {
            filtered = filtered.filter((l) => l.createdAt <= filters.endDate!)
        }

        // Sort by newest first
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        const offset = (page - 1) * limit
        return filtered.slice(offset, offset + limit)
    }

    async countWithFilters(filters: AuditLogFilters): Promise<number> {
        let filtered = [...this.logs]

        if (filters.merchantId) {
            filtered = filtered.filter((l) => l.merchantId === filters.merchantId)
        }

        if (filters.teamId) {
            filtered = filtered.filter((l) => l.teamId === filters.teamId)
        }

        if (filters.actorId) {
            filtered = filtered.filter((l) => l.actorId === filters.actorId)
        }

        if (filters.action) {
            filtered = filtered.filter((l) => l.action === filters.action)
        }

        if (filters.targetId) {
            filtered = filtered.filter((l) => l.targetId === filters.targetId)
        }

        if (filters.startDate) {
            filtered = filtered.filter((l) => l.createdAt >= filters.startDate!)
        }

        if (filters.endDate) {
            filtered = filtered.filter((l) => l.createdAt <= filters.endDate!)
        }

        return filtered.length
    }
}

// Shared instance for cross-module access
export const sharedAuditLogRepository = new InMemoryAuditLogRepository()
