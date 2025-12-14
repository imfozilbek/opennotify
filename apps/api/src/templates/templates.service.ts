import { Injectable } from "@nestjs/common"
import * as crypto from "crypto"
import {
    Channel,
    CreateTemplateUseCase,
    RenderTemplateUseCase,
    Template,
    TemplateRepositoryPort,
    TemplateStatus,
    TemplateVariableProps,
} from "@opennotify/core"
import { InMemoryTemplateRepository } from "../infrastructure/repositories"
import {
    ChannelDto,
    CreateTemplateDto,
    RenderTemplateDto,
    UpdateTemplateDto,
} from "./dto/template.dto"

export interface TemplateResponse {
    id: string
    merchantId: string
    name: string
    channel: string
    body: string
    subject?: string
    variables: TemplateVariableProps[]
    description?: string
    status: string
    createdAt: string
    updatedAt: string
}

export interface CreateResult {
    success: boolean
    template?: TemplateResponse
    errorMessage?: string
}

export interface RenderResult {
    success: boolean
    body?: string
    subject?: string
    errorMessage?: string
}

export interface ListResult {
    templates: TemplateResponse[]
    total: number
    page: number
    limit: number
}

@Injectable()
export class TemplatesService {
    private readonly repository: TemplateRepositoryPort
    private readonly createUseCase: CreateTemplateUseCase
    private readonly renderUseCase: RenderTemplateUseCase

    constructor() {
        this.repository = new InMemoryTemplateRepository()
        this.createUseCase = new CreateTemplateUseCase(this.repository)
        this.renderUseCase = new RenderTemplateUseCase(this.repository)
    }

    async create(merchantId: string, dto: CreateTemplateDto): Promise<CreateResult> {
        const result = await this.createUseCase.execute({
            id: `tpl_${crypto.randomUUID()}`,
            merchantId,
            name: dto.name,
            channel: this.mapChannel(dto.channel),
            body: dto.body,
            subject: dto.subject,
            variables: dto.variables,
            description: dto.description,
        })

        if (!result.success || !result.template) {
            return {
                success: false,
                errorMessage: result.errorMessage ?? "Failed to create template",
            }
        }

        return {
            success: true,
            template: this.mapToResponse(result.template),
        }
    }

    async list(
        merchantId: string,
        options: { status?: string; channel?: string; page?: number; limit?: number },
    ): Promise<ListResult> {
        const page = options.page ?? 1
        const limit = options.limit ?? 20
        const offset = (page - 1) * limit

        const templates = await this.repository.findByMerchantId(merchantId, {
            status: options.status as TemplateStatus | undefined,
            channel: options.channel as Channel | undefined,
            limit,
            offset,
        })

        const total = await this.repository.countByMerchantId(
            merchantId,
            options.status as TemplateStatus | undefined,
        )

        return {
            templates: templates.map((t) => this.mapToResponse(t)),
            total,
            page,
            limit,
        }
    }

    async getById(merchantId: string, id: string): Promise<TemplateResponse | null> {
        const template = await this.repository.findById(id)
        if (template?.merchantId !== merchantId) {
            return null
        }
        return this.mapToResponse(template)
    }

    async update(merchantId: string, id: string, dto: UpdateTemplateDto): Promise<CreateResult> {
        const template = await this.repository.findById(id)
        if (template?.merchantId !== merchantId) {
            return {
                success: false,
                errorMessage: "Template not found",
            }
        }

        try {
            // Update fields if provided
            if (dto.name !== undefined) {
                template.updateName(dto.name)
            }
            if (dto.body !== undefined || dto.subject !== undefined) {
                template.updateContent(dto.body ?? template.body, dto.subject ?? template.subject)
            }
            if (dto.variables !== undefined) {
                template.updateVariables(dto.variables)
            }
            if (dto.description !== undefined) {
                template.updateDescription(dto.description)
            }

            await this.repository.save(template)

            return {
                success: true,
                template: this.mapToResponse(template),
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Failed to update template",
            }
        }
    }

    async delete(merchantId: string, id: string): Promise<boolean> {
        const template = await this.repository.findById(id)
        if (template?.merchantId !== merchantId) {
            return false
        }
        await this.repository.delete(id)
        return true
    }

    async publish(merchantId: string, id: string): Promise<CreateResult> {
        const template = await this.repository.findById(id)
        if (template?.merchantId !== merchantId) {
            return {
                success: false,
                errorMessage: "Template not found",
            }
        }

        try {
            template.publish()
            await this.repository.save(template)
            return {
                success: true,
                template: this.mapToResponse(template),
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Failed to publish template",
            }
        }
    }

    async unpublish(merchantId: string, id: string): Promise<CreateResult> {
        const template = await this.repository.findById(id)
        if (template?.merchantId !== merchantId) {
            return {
                success: false,
                errorMessage: "Template not found",
            }
        }

        try {
            template.unpublish()
            await this.repository.save(template)
            return {
                success: true,
                template: this.mapToResponse(template),
            }
        } catch (error) {
            return {
                success: false,
                errorMessage:
                    error instanceof Error ? error.message : "Failed to unpublish template",
            }
        }
    }

    async archive(merchantId: string, id: string): Promise<CreateResult> {
        const template = await this.repository.findById(id)
        if (template?.merchantId !== merchantId) {
            return {
                success: false,
                errorMessage: "Template not found",
            }
        }

        try {
            template.archive()
            await this.repository.save(template)
            return {
                success: true,
                template: this.mapToResponse(template),
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Failed to archive template",
            }
        }
    }

    async render(merchantId: string, dto: RenderTemplateDto): Promise<RenderResult> {
        // Verify template belongs to merchant
        const template = await this.repository.findById(dto.templateId)
        if (template?.merchantId !== merchantId) {
            return {
                success: false,
                errorMessage: "Template not found",
            }
        }

        const result = await this.renderUseCase.execute({
            templateId: dto.templateId,
            variables: dto.variables,
        })

        return {
            success: result.success,
            body: result.body,
            subject: result.subject,
            errorMessage: result.errorMessage,
        }
    }

    private mapChannel(dto: ChannelDto): Channel {
        const mapping: Record<ChannelDto, Channel> = {
            [ChannelDto.SMS]: Channel.SMS,
            [ChannelDto.TELEGRAM]: Channel.TELEGRAM,
            [ChannelDto.EMAIL]: Channel.EMAIL,
            [ChannelDto.PUSH]: Channel.PUSH,
            [ChannelDto.WHATSAPP]: Channel.WHATSAPP,
        }
        return mapping[dto]
    }

    private mapToResponse(template: Template): TemplateResponse {
        return {
            id: template.id,
            merchantId: template.merchantId,
            name: template.name,
            channel: template.channel,
            body: template.body,
            subject: template.subject,
            variables: template.variables.map((v) => v.toPersistence()),
            description: template.description,
            status: template.status,
            createdAt: template.createdAt.toISOString(),
            updatedAt: template.updatedAt.toISOString(),
        }
    }
}
