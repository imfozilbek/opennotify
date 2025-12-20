import { Injectable } from "@nestjs/common"
import * as crypto from "crypto"
import {
    Channel,
    CreateRoutingRuleUseCase,
    DeleteRoutingRuleUseCase,
    GetRoutingRuleUseCase,
    ListRoutingRulesUseCase,
    MessageType,
    RetryableErrorType,
    RetryPolicyProps,
    RoutingConditions,
    RoutingRule,
    RoutingRuleRepositoryPort,
    RoutingStrategy,
    UpdateRoutingRuleUseCase,
} from "@opennotify/core"
import { sharedRoutingRuleRepository } from "../infrastructure/repositories"
import {
    ChannelDto,
    CreateRoutingRuleDto,
    MessageTypeDto,
    RetryableErrorTypeDto,
    RetryPolicyDto,
    RoutingConditionsDto,
    RoutingStrategyDto,
    RoutingStrategyTypeDto,
    UpdateRoutingRuleDto,
} from "./dto/routing-rule.dto"

export interface RoutingRuleResponse {
    id: string
    merchantId: string | null
    name: string
    priority: number
    conditions: RoutingConditions
    strategy: RoutingStrategy
    maxAttempts: number
    enabled: boolean
    retryPolicy: {
        maxRetries: number
        baseDelayMs: number
        maxDelayMs: number
        retryableErrors?: string[]
    }
    isSystemDefault: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateResult {
    success: boolean
    rule?: RoutingRuleResponse
    errorMessage?: string
}

export interface ListResult {
    rules: RoutingRuleResponse[]
    merchantRulesCount: number
    systemDefaultsCount: number
}

@Injectable()
export class RoutingRulesService {
    private readonly repository: RoutingRuleRepositoryPort
    private readonly createUseCase: CreateRoutingRuleUseCase
    private readonly updateUseCase: UpdateRoutingRuleUseCase
    private readonly deleteUseCase: DeleteRoutingRuleUseCase
    private readonly listUseCase: ListRoutingRulesUseCase
    private readonly getUseCase: GetRoutingRuleUseCase

    constructor() {
        this.repository = sharedRoutingRuleRepository
        this.createUseCase = new CreateRoutingRuleUseCase(this.repository)
        this.updateUseCase = new UpdateRoutingRuleUseCase(this.repository)
        this.deleteUseCase = new DeleteRoutingRuleUseCase(this.repository)
        this.listUseCase = new ListRoutingRulesUseCase(this.repository)
        this.getUseCase = new GetRoutingRuleUseCase(this.repository)
    }

    async create(merchantId: string, dto: CreateRoutingRuleDto): Promise<CreateResult> {
        const result = await this.createUseCase.execute({
            id: `rule_${crypto.randomUUID()}`,
            merchantId,
            name: dto.name,
            priority: dto.priority,
            conditions: this.mapConditions(dto.conditions),
            strategy: this.mapStrategy(dto.strategy),
            maxAttempts: dto.maxAttempts,
            enabled: dto.enabled,
            retryPolicy: dto.retryPolicy ? this.mapRetryPolicy(dto.retryPolicy) : undefined,
        })

        if (!result.success || !result.rule) {
            return {
                success: false,
                errorMessage: result.errorMessage ?? "Failed to create routing rule",
            }
        }

        return {
            success: true,
            rule: this.mapToResponse(result.rule),
        }
    }

    async list(
        merchantId: string,
        options: { includeDefaults?: boolean; enabled?: boolean },
    ): Promise<ListResult> {
        const result = await this.listUseCase.execute({
            merchantId,
            includeDefaults: options.includeDefaults,
            enabled: options.enabled,
        })

        return {
            rules: result.rules.map((r) => this.mapToResponse(r)),
            merchantRulesCount: result.merchantRulesCount,
            systemDefaultsCount: result.systemDefaultsCount,
        }
    }

    async getById(merchantId: string, id: string): Promise<RoutingRuleResponse | null> {
        const result = await this.getUseCase.execute({ id, merchantId })

        if (!result.success || !result.rule) {
            return null
        }

        return this.mapToResponse(result.rule)
    }

    async update(merchantId: string, id: string, dto: UpdateRoutingRuleDto): Promise<CreateResult> {
        const result = await this.updateUseCase.execute({
            id,
            merchantId,
            name: dto.name,
            priority: dto.priority,
            conditions: dto.conditions ? this.mapConditions(dto.conditions) : undefined,
            strategy: dto.strategy ? this.mapStrategy(dto.strategy) : undefined,
            maxAttempts: dto.maxAttempts,
            enabled: dto.enabled,
            retryPolicy: dto.retryPolicy ? this.mapRetryPolicy(dto.retryPolicy) : undefined,
        })

        if (!result.success || !result.rule) {
            return {
                success: false,
                errorMessage: result.errorMessage ?? "Failed to update routing rule",
            }
        }

        return {
            success: true,
            rule: this.mapToResponse(result.rule),
        }
    }

    async delete(
        merchantId: string,
        id: string,
    ): Promise<{ success: boolean; errorMessage?: string }> {
        const result = await this.deleteUseCase.execute({ id, merchantId })

        return {
            success: result.success,
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

    private mapMessageType(dto: MessageTypeDto): MessageType {
        const mapping: Record<MessageTypeDto, MessageType> = {
            [MessageTypeDto.OTP]: MessageType.OTP,
            [MessageTypeDto.TRANSACTIONAL]: MessageType.TRANSACTIONAL,
            [MessageTypeDto.MARKETING]: MessageType.MARKETING,
            [MessageTypeDto.ALERT]: MessageType.ALERT,
        }
        return mapping[dto]
    }

    private mapConditions(dto: RoutingConditionsDto): RoutingConditions {
        return {
            messageTypes: dto.messageTypes?.map((mt) => this.mapMessageType(mt)),
            allowedChannels: dto.allowedChannels?.map((ch) => this.mapChannel(ch)),
            excludedChannels: dto.excludedChannels?.map((ch) => this.mapChannel(ch)),
            activeTimeWindow: dto.activeTimeWindow,
            quietHours: dto.quietHours,
        }
    }

    private mapStrategy(dto: RoutingStrategyDto): RoutingStrategy {
        switch (dto.type) {
            case RoutingStrategyTypeDto.COST_OPTIMIZED:
                return { type: "cost_optimized" }
            case RoutingStrategyTypeDto.RELIABILITY_FIRST:
                return { type: "reliability_first" }
            case RoutingStrategyTypeDto.RECIPIENT_PREFERENCE:
                return { type: "recipient_preference" }
            case RoutingStrategyTypeDto.CHANNEL_PREFERENCE:
                return {
                    type: "channel_preference",
                    channels: dto.channels?.map((ch) => this.mapChannel(ch)) ?? [],
                }
        }
    }

    private mapRetryableError(dto: RetryableErrorTypeDto): RetryableErrorType {
        const mapping: Record<RetryableErrorTypeDto, RetryableErrorType> = {
            [RetryableErrorTypeDto.TIMEOUT]: RetryableErrorType.TIMEOUT,
            [RetryableErrorTypeDto.RATE_LIMIT]: RetryableErrorType.RATE_LIMIT,
            [RetryableErrorTypeDto.SERVER_ERROR]: RetryableErrorType.SERVER_ERROR,
            [RetryableErrorTypeDto.CONNECTION_ERROR]: RetryableErrorType.CONNECTION_ERROR,
        }
        return mapping[dto]
    }

    private mapRetryPolicy(dto: RetryPolicyDto): RetryPolicyProps {
        return {
            maxRetries: dto.maxRetries,
            baseDelayMs: dto.baseDelayMs,
            maxDelayMs: dto.maxDelayMs,
            retryableErrors: dto.retryableErrors?.map((e) => this.mapRetryableError(e)),
        }
    }

    private mapToResponse(rule: RoutingRule): RoutingRuleResponse {
        const retryPolicy = rule.retryPolicy
        return {
            id: rule.id,
            merchantId: rule.merchantId,
            name: rule.name,
            priority: rule.priority,
            conditions: rule.conditions,
            strategy: rule.strategy,
            maxAttempts: rule.maxAttempts,
            enabled: rule.enabled,
            retryPolicy: {
                maxRetries: retryPolicy.maxRetries,
                baseDelayMs: retryPolicy.baseDelayMs,
                maxDelayMs: retryPolicy.maxDelayMs,
                retryableErrors: retryPolicy.retryableErrors,
            },
            isSystemDefault: rule.isSystemDefault,
            createdAt: rule.createdAt.toISOString(),
            updatedAt: rule.updatedAt.toISOString(),
        }
    }
}
