import { Injectable } from "@nestjs/common"
import * as crypto from "crypto"
import {
    Channel,
    CreateRecipientUseCase,
    Recipient,
    RecipientContacts,
    RecipientPreferences,
    RecipientRepositoryPort,
    UpdateRecipientUseCase,
} from "@opennotify/core"
import { InMemoryRecipientRepository } from "../infrastructure/repositories"
import {
    CreateRecipientDto,
    UpdateRecipientDto,
    RecipientPreferencesDto,
} from "./dto/recipient.dto"
import { ChannelDto } from "../templates/dto/template.dto"

export interface RecipientResponse {
    id: string
    merchantId: string
    externalId?: string
    contacts: {
        phone?: string
        email?: string
        telegramChatId?: string
        deviceTokens?: string[]
    }
    preferences: {
        preferredChannel?: string
        optedOutChannels?: string[]
        quietHours?: {
            start: string
            end: string
            timezone: string
        }
        language?: string
    }
    metadata: Record<string, unknown>
    createdAt: string
    updatedAt: string
}

export interface CreateResult {
    success: boolean
    recipient?: RecipientResponse
    errorMessage?: string
}

export interface ListResult {
    recipients: RecipientResponse[]
    total: number
    page: number
    limit: number
}

@Injectable()
export class RecipientsService {
    private readonly repository: RecipientRepositoryPort & {
        countByMerchantId(merchantId: string): Promise<number>
    }
    private readonly createUseCase: CreateRecipientUseCase
    private readonly updateUseCase: UpdateRecipientUseCase

    constructor() {
        this.repository = new InMemoryRecipientRepository()
        this.createUseCase = new CreateRecipientUseCase(this.repository)
        this.updateUseCase = new UpdateRecipientUseCase(this.repository)
    }

    async create(merchantId: string, dto: CreateRecipientDto): Promise<CreateResult> {
        const contacts: RecipientContacts = {
            phone: dto.phone,
            email: dto.email,
            telegramChatId: dto.telegramChatId,
            deviceTokens: dto.deviceTokens,
        }

        const preferences = dto.preferences
            ? this.mapPreferencesFromDto(dto.preferences)
            : undefined

        const result = await this.createUseCase.execute({
            id: `rcpt_${crypto.randomUUID()}`,
            merchantId,
            externalId: dto.externalId,
            contacts,
            preferences,
            metadata: dto.metadata,
        })

        if (!result.success) {
            return {
                success: false,
                errorMessage: result.errorMessage ?? "Failed to create recipient",
            }
        }

        return {
            success: true,
            recipient: this.mapToResponse(result.recipient),
        }
    }

    async list(
        merchantId: string,
        options: { page?: number; limit?: number },
    ): Promise<ListResult> {
        const page = options.page ?? 1
        const limit = options.limit ?? 20
        const offset = (page - 1) * limit

        const recipients = await this.repository.findByMerchantId(merchantId, limit, offset)
        const total = await this.repository.countByMerchantId(merchantId)

        return {
            recipients: recipients.map((r) => this.mapToResponse(r)),
            total,
            page,
            limit,
        }
    }

    async getById(merchantId: string, id: string): Promise<RecipientResponse | null> {
        const recipient = await this.repository.findById(id)
        if (recipient?.merchantId !== merchantId) {
            return null
        }
        return this.mapToResponse(recipient)
    }

    async update(merchantId: string, id: string, dto: UpdateRecipientDto): Promise<CreateResult> {
        const recipient = await this.repository.findById(id)
        if (recipient?.merchantId !== merchantId) {
            return {
                success: false,
                errorMessage: "Recipient not found",
            }
        }

        const result = await this.updateUseCase.execute({
            id,
            phone: dto.phone,
            email: dto.email,
            telegramChatId: dto.telegramChatId,
            preferences: dto.preferences ? this.mapPreferencesFromDto(dto.preferences) : undefined,
            metadata: dto.metadata,
        })

        if (!result.success || !result.recipient) {
            return {
                success: false,
                errorMessage: result.errorMessage ?? "Failed to update recipient",
            }
        }

        // Handle device tokens separately
        if (dto.deviceTokens !== undefined) {
            // Clear existing tokens and add new ones
            const currentTokens = result.recipient.deviceTokens
            for (const token of currentTokens) {
                result.recipient.removeDeviceToken(token)
            }
            for (const token of dto.deviceTokens) {
                result.recipient.addDeviceToken(token)
            }
            await this.repository.save(result.recipient)
        }

        return {
            success: true,
            recipient: this.mapToResponse(result.recipient),
        }
    }

    async delete(merchantId: string, id: string): Promise<boolean> {
        const recipient = await this.repository.findById(id)
        if (recipient?.merchantId !== merchantId) {
            return false
        }
        await this.repository.delete(id)
        return true
    }

    async linkTelegram(
        merchantId: string,
        id: string,
        telegramChatId: string,
    ): Promise<CreateResult> {
        const recipient = await this.repository.findById(id)
        if (recipient?.merchantId !== merchantId) {
            return {
                success: false,
                errorMessage: "Recipient not found",
            }
        }

        recipient.linkTelegram(telegramChatId)
        await this.repository.save(recipient)

        return {
            success: true,
            recipient: this.mapToResponse(recipient),
        }
    }

    private mapPreferencesFromDto(dto: RecipientPreferencesDto): RecipientPreferences {
        return {
            preferredChannel: dto.preferredChannel
                ? this.mapChannel(dto.preferredChannel)
                : undefined,
            optedOutChannels: dto.optedOutChannels?.map((c) => this.mapChannel(c)),
            quietHours: dto.quietHours,
            language: dto.language,
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

    private mapToResponse(recipient: Recipient): RecipientResponse {
        const contacts = recipient.contacts
        const preferences = recipient.preferences

        return {
            id: recipient.id,
            merchantId: recipient.merchantId,
            externalId: recipient.externalId,
            contacts: {
                phone: contacts.phone,
                email: contacts.email,
                telegramChatId: contacts.telegramChatId,
                deviceTokens: contacts.deviceTokens,
            },
            preferences: {
                preferredChannel: preferences.preferredChannel,
                optedOutChannels: preferences.optedOutChannels,
                quietHours: preferences.quietHours,
                language: preferences.language,
            },
            metadata: recipient.metadata,
            createdAt: recipient.createdAt.toISOString(),
            updatedAt: recipient.updatedAt.toISOString(),
        }
    }
}
