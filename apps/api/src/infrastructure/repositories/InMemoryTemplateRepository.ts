import { Injectable } from "@nestjs/common"
import {
    FindTemplatesOptions,
    Template,
    TemplateProps,
    TemplateRepositoryPort,
    TemplateStatus,
} from "@opennotify/core"

/**
 * In-memory implementation of TemplateRepositoryPort.
 * For development and testing purposes.
 */
@Injectable()
export class InMemoryTemplateRepository implements TemplateRepositoryPort {
    private readonly templates = new Map<string, TemplateProps>()

    async save(template: Template): Promise<void> {
        this.templates.set(template.id, template.toPersistence())
        return Promise.resolve()
    }

    async findById(id: string): Promise<Template | null> {
        const data = this.templates.get(id)
        if (!data) {
            return Promise.resolve(null)
        }
        return Promise.resolve(Template.fromPersistence(data))
    }

    async findByMerchantId(
        merchantId: string,
        options?: FindTemplatesOptions,
    ): Promise<Template[]> {
        const all = Array.from(this.templates.values()).filter(
            (data) => data.merchantId === merchantId,
        )

        // Apply filters
        let filtered = all
        if (options?.status) {
            filtered = filtered.filter((data) => data.status === options.status)
        }
        if (options?.channel) {
            filtered = filtered.filter((data) => data.channel === options.channel)
        }

        // Sort by updatedAt descending (newest first)
        filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        // Apply pagination
        const start = options?.offset ?? 0
        const end = options?.limit ? start + options.limit : undefined
        const paginated = filtered.slice(start, end)

        return Promise.resolve(paginated.map((data) => Template.fromPersistence(data)))
    }

    async findByName(merchantId: string, name: string): Promise<Template | null> {
        for (const data of this.templates.values()) {
            if (data.merchantId === merchantId && data.name === name) {
                return Promise.resolve(Template.fromPersistence(data))
            }
        }
        return Promise.resolve(null)
    }

    async delete(id: string): Promise<void> {
        this.templates.delete(id)
        return Promise.resolve()
    }

    async countByMerchantId(merchantId: string, status?: TemplateStatus): Promise<number> {
        let count = 0
        for (const data of this.templates.values()) {
            if (data.merchantId === merchantId) {
                if (!status || data.status === status) {
                    count++
                }
            }
        }
        return Promise.resolve(count)
    }
}
