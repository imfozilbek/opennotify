import { CreateTemplateProps, Template } from "../../domain/entities/Template"
import { Channel } from "../../domain/value-objects/Channel"
import { TemplateVariableProps } from "../../domain/value-objects/TemplateVariable"
import { TemplateRepositoryPort } from "../ports/TemplateRepositoryPort"

/**
 * Input for creating a template.
 */
export interface CreateTemplateInput {
    /** Unique template ID */
    id: string

    /** Merchant this template belongs to */
    merchantId: string

    /** Template name (unique per merchant) */
    name: string

    /** Channel this template is for */
    channel: Channel

    /** Template body with {{variable}} placeholders */
    body: string

    /** Subject line (required for email templates) */
    subject?: string

    /** Variable definitions */
    variables?: TemplateVariableProps[]

    /** Human-readable description */
    description?: string

    /** Additional metadata */
    metadata?: Record<string, unknown>
}

/**
 * Output from creating a template.
 */
export interface CreateTemplateOutput {
    /** Whether the template was created successfully */
    success: boolean

    /** The created template entity */
    template?: Template

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for creating message templates.
 *
 * Creates a new template in DRAFT status. Templates must have unique names
 * within a merchant and all variables used in the body must be declared.
 *
 * @example
 * ```typescript
 * const useCase = new CreateTemplateUseCase(repository)
 *
 * const result = await useCase.execute({
 *     id: "tpl_123",
 *     merchantId: "merchant_456",
 *     name: "otp_sms",
 *     channel: Channel.SMS,
 *     body: "Your code is {{code}}",
 *     variables: [{ name: "code", required: true }],
 * })
 *
 * if (result.success) {
 *     console.log("Created:", result.template?.id)
 * } else {
 *     console.error("Failed:", result.errorMessage)
 * }
 * ```
 */
export class CreateTemplateUseCase {
    constructor(private readonly repository: TemplateRepositoryPort) {}

    async execute(input: CreateTemplateInput): Promise<CreateTemplateOutput> {
        // Check for duplicate name within merchant
        const existingByName = await this.repository.findByName(input.merchantId, input.name)
        if (existingByName) {
            return {
                success: false,
                errorMessage: `Template with name "${input.name}" already exists for this merchant`,
            }
        }

        // Check if ID already exists
        const existingById = await this.repository.findById(input.id)
        if (existingById) {
            return {
                success: false,
                errorMessage: `Template with ID "${input.id}" already exists`,
            }
        }

        try {
            // Create template entity (validates variables in body)
            const templateProps: CreateTemplateProps = {
                id: input.id,
                merchantId: input.merchantId,
                name: input.name,
                channel: input.channel,
                body: input.body,
                subject: input.subject,
                variables: input.variables,
                description: input.description,
                metadata: input.metadata,
            }

            const template = Template.create(templateProps)

            // Run full validation
            const validation = template.validate()
            if (!validation.valid) {
                return {
                    success: false,
                    errorMessage: `Template validation failed: ${validation.errors.join("; ")}`,
                }
            }

            // Persist template
            await this.repository.save(template)

            return {
                success: true,
                template,
            }
        } catch (error) {
            return {
                success: false,
                errorMessage: error instanceof Error ? error.message : "Unknown error",
            }
        }
    }
}
