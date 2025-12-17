import { AuditAction, AuditLog } from "../../domain/entities/AuditLog"
import { AuditLogFilters, AuditLogRepositoryPort } from "../ports/AuditLogRepositoryPort"

/**
 * Input for getting audit logs.
 */
export interface GetAuditLogsInput {
    merchantId: string
    teamId?: string
    actorId?: string
    action?: AuditAction
    targetId?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
}

/**
 * Output from getting audit logs.
 */
export interface GetAuditLogsOutput {
    logs: AuditLog[]
    total: number
    page: number
    limit: number
    totalPages: number
}

/**
 * Use case for retrieving audit logs.
 *
 * @example
 * ```typescript
 * const useCase = new GetAuditLogsUseCase(auditRepo)
 * const result = await useCase.execute({
 *     merchantId: "merchant_123",
 *     action: AuditAction.MEMBER_ADDED,
 *     page: 1,
 *     limit: 20,
 * })
 * ```
 */
export class GetAuditLogsUseCase {
    constructor(private readonly auditLogRepository: AuditLogRepositoryPort) {}

    async execute(input: GetAuditLogsInput): Promise<GetAuditLogsOutput> {
        const page = input.page ?? 1
        const limit = input.limit ?? 20

        const filters: AuditLogFilters = {
            merchantId: input.merchantId,
            teamId: input.teamId,
            actorId: input.actorId,
            action: input.action,
            targetId: input.targetId,
            startDate: input.startDate,
            endDate: input.endDate,
        }

        const [logs, total] = await Promise.all([
            this.auditLogRepository.findWithFilters(filters, page, limit),
            this.auditLogRepository.countWithFilters(filters),
        ])

        return {
            logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        }
    }
}
