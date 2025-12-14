import { TemplateStatus } from "../../domain/value-objects/TemplateStatus"
import { TemplateRepositoryPort } from "../ports/TemplateRepositoryPort"

/**
 * Input for rendering a template.
 */
export interface RenderTemplateInput {
    /** Template ID to render */
    templateId: string

    /** Variable values to substitute */
    variables: Record<string, string>
}

/**
 * Output from rendering a template.
 */
export interface RenderTemplateOutput {
    /** Whether rendering was successful */
    success: boolean

    /** Rendered body text */
    body?: string

    /** Rendered subject (for email templates) */
    subject?: string

    /** Error message if failed */
    errorMessage?: string
}

/**
 * Use case for rendering templates with variable substitution.
 *
 * Fetches a template by ID and renders it with the provided variable values.
 * Only active templates can be rendered.
 *
 * @example
 * ```typescript
 * const useCase = new RenderTemplateUseCase(repository)
 *
 * const result = await useCase.execute({
 *     templateId: "tpl_123",
 *     variables: { code: "1234", name: "John" },
 * })
 *
 * if (result.success) {
 *     console.log("Body:", result.body)
 *     console.log("Subject:", result.subject)
 * } else {
 *     console.error("Failed:", result.errorMessage)
 * }
 * ```
 */
export class RenderTemplateUseCase {
    constructor(private readonly repository: TemplateRepositoryPort) {}

    async execute(input: RenderTemplateInput): Promise<RenderTemplateOutput> {
        // Find template
        const template = await this.repository.findById(input.templateId)

        if (!template) {
            return {
                success: false,
                errorMessage: `Template not found: ${input.templateId}`,
            }
        }

        // Check template is active
        if (template.status !== TemplateStatus.ACTIVE) {
            return {
                success: false,
                errorMessage: `Template is not active (current status: ${template.status})`,
            }
        }

        // Render template
        const renderResult = template.render(input.variables)

        if (!renderResult.success) {
            return {
                success: false,
                errorMessage: renderResult.errorMessage,
            }
        }

        return {
            success: true,
            body: renderResult.body,
            subject: renderResult.subject,
        }
    }

    /**
     * Render a template by name within a merchant.
     *
     * @param merchantId - Merchant ID
     * @param templateName - Template name
     * @param variables - Variable values
     * @returns Rendered output
     */
    async executeByName(
        merchantId: string,
        templateName: string,
        variables: Record<string, string>,
    ): Promise<RenderTemplateOutput> {
        // Find template by name
        const template = await this.repository.findByName(merchantId, templateName)

        if (!template) {
            return {
                success: false,
                errorMessage: `Template "${templateName}" not found for merchant`,
            }
        }

        // Delegate to main execute
        return this.execute({
            templateId: template.id,
            variables,
        })
    }
}
