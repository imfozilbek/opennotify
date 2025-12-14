import { Channel } from "../value-objects/Channel"
import { canTransitionTemplate, TemplateStatus } from "../value-objects/TemplateStatus"
import {
    extractVariablesFromText,
    replaceVariable,
    TemplateVariable,
    TemplateVariableProps,
} from "../value-objects/TemplateVariable"

/**
 * Properties for creating a new Template.
 */
export interface CreateTemplateProps {
    /** Unique template identifier */
    id: string

    /** Merchant this template belongs to */
    merchantId: string

    /** Template name (unique per merchant) */
    name: string

    /** Channel this template is for (SMS, EMAIL, TELEGRAM, etc.) */
    channel: Channel

    /** Template body with {{variable}} placeholders */
    body: string

    /** Subject line (required for EMAIL channel) */
    subject?: string

    /** Variable definitions */
    variables?: TemplateVariableProps[]

    /** Human-readable description */
    description?: string

    /** Additional metadata */
    metadata?: Record<string, unknown>
}

/**
 * Properties for reconstructing a Template from persistence.
 */
export interface TemplateProps extends CreateTemplateProps {
    /** Template status */
    status: TemplateStatus

    /** Creation timestamp */
    createdAt: Date

    /** Last update timestamp */
    updatedAt: Date
}

/**
 * Result from rendering a template.
 */
export interface RenderResult {
    /** Whether rendering was successful */
    success: boolean

    /** Rendered body text */
    body?: string

    /** Rendered subject (for email templates) */
    subject?: string

    /** Error message if rendering failed */
    errorMessage?: string
}

/**
 * Result from validating a template.
 */
export interface ValidationResult {
    /** Whether the template is valid */
    valid: boolean

    /** List of validation errors */
    errors: string[]
}

/**
 * Template entity for reusable message templates.
 *
 * Templates allow merchants to define reusable message formats with
 * placeholder variables that can be substituted at send time.
 *
 * @example
 * ```typescript
 * // Create a new OTP template
 * const template = Template.create({
 *     id: "tpl_123",
 *     merchantId: "merchant_456",
 *     name: "otp_sms",
 *     channel: Channel.SMS,
 *     body: "Your verification code is {{code}}. Valid for {{minutes}} minutes.",
 *     variables: [
 *         { name: "code", required: true, description: "OTP code" },
 *         { name: "minutes", required: false, defaultValue: "5" },
 *     ],
 * })
 *
 * // Publish the template
 * template.publish()
 *
 * // Render with variables
 * const result = template.render({ code: "1234" })
 * // result.body = "Your verification code is 1234. Valid for 5 minutes."
 * ```
 */
export class Template {
    private readonly _id: string
    private readonly _merchantId: string
    private readonly _channel: Channel
    private readonly _createdAt: Date

    private _name: string
    private _body: string
    private _subject?: string
    private _variables: TemplateVariable[]
    private _description?: string
    private _metadata: Record<string, unknown>
    private _status: TemplateStatus
    private _updatedAt: Date

    private constructor(props: TemplateProps) {
        this._id = props.id
        this._merchantId = props.merchantId
        this._name = props.name
        this._channel = props.channel
        this._body = props.body
        this._subject = props.subject
        this._variables = (props.variables ?? []).map((v) => TemplateVariable.fromPersistence(v))
        this._description = props.description
        this._metadata = { ...props.metadata }
        this._status = props.status
        this._createdAt = props.createdAt
        this._updatedAt = props.updatedAt
    }

    /**
     * Create a new template in DRAFT status.
     *
     * @throws Error if variables in body are not declared
     */
    static create(props: CreateTemplateProps): Template {
        // Validate variables in body match declared variables
        const declaredVars = (props.variables ?? []).map((v) => v.name)

        // Check body for undeclared variables
        const bodyVars = extractVariablesFromText(props.body)
        const undeclaredBodyVars = bodyVars.filter((v) => !declaredVars.includes(v))
        if (undeclaredBodyVars.length > 0) {
            throw new Error(`Undeclared variables in body: ${undeclaredBodyVars.join(", ")}`)
        }

        // Check subject for undeclared variables (if provided)
        if (props.subject) {
            const subjectVars = extractVariablesFromText(props.subject)
            const undeclaredSubjectVars = subjectVars.filter((v) => !declaredVars.includes(v))
            if (undeclaredSubjectVars.length > 0) {
                throw new Error(
                    `Undeclared variables in subject: ${undeclaredSubjectVars.join(", ")}`,
                )
            }
        }

        const now = new Date()
        return new Template({
            ...props,
            variables: props.variables ?? [],
            metadata: props.metadata ?? {},
            status: TemplateStatus.DRAFT,
            createdAt: now,
            updatedAt: now,
        })
    }

    /**
     * Reconstruct a template from persistence.
     */
    static fromPersistence(props: TemplateProps): Template {
        return new Template(props)
    }

    // ===== Getters =====

    get id(): string {
        return this._id
    }

    get merchantId(): string {
        return this._merchantId
    }

    get name(): string {
        return this._name
    }

    get channel(): Channel {
        return this._channel
    }

    get body(): string {
        return this._body
    }

    get subject(): string | undefined {
        return this._subject
    }

    get variables(): TemplateVariable[] {
        return [...this._variables]
    }

    get description(): string | undefined {
        return this._description
    }

    get metadata(): Record<string, unknown> {
        return { ...this._metadata }
    }

    get status(): TemplateStatus {
        return this._status
    }

    get createdAt(): Date {
        return this._createdAt
    }

    get updatedAt(): Date {
        return this._updatedAt
    }

    // ===== Status Checks =====

    /**
     * Check if template is active and can be used for sending.
     */
    isActive(): boolean {
        return this._status === TemplateStatus.ACTIVE
    }

    /**
     * Check if template is in draft status.
     */
    isDraft(): boolean {
        return this._status === TemplateStatus.DRAFT
    }

    /**
     * Check if template is archived.
     */
    isArchived(): boolean {
        return this._status === TemplateStatus.ARCHIVED
    }

    // ===== Status Transitions =====

    /**
     * Publish template (DRAFT -> ACTIVE).
     *
     * @throws Error if transition is not allowed
     */
    publish(): void {
        this.transitionTo(TemplateStatus.ACTIVE)
    }

    /**
     * Archive template (DRAFT/ACTIVE -> ARCHIVED).
     *
     * @throws Error if transition is not allowed
     */
    archive(): void {
        this.transitionTo(TemplateStatus.ARCHIVED)
    }

    /**
     * Restore archived template to draft (ARCHIVED -> DRAFT).
     *
     * @throws Error if transition is not allowed
     */
    restore(): void {
        this.transitionTo(TemplateStatus.DRAFT)
    }

    /**
     * Unpublish template for editing (ACTIVE -> DRAFT).
     *
     * @throws Error if transition is not allowed
     */
    unpublish(): void {
        this.transitionTo(TemplateStatus.DRAFT)
    }

    private transitionTo(newStatus: TemplateStatus): void {
        if (!canTransitionTemplate(this._status, newStatus)) {
            throw new Error(`Invalid status transition: ${this._status} -> ${newStatus}`)
        }
        this._status = newStatus
        this._updatedAt = new Date()
    }

    // ===== Validation =====

    /**
     * Validate the template for consistency.
     *
     * Checks:
     * - Name is not empty
     * - Body is not empty
     * - All variables in body are declared
     * - All declared variables are used (warning)
     * - Email templates have subject
     */
    validate(): ValidationResult {
        const errors: string[] = []

        if (!this._name || this._name.trim() === "") {
            errors.push("Template name is required")
        }

        if (!this._body || this._body.trim() === "") {
            errors.push("Template body is required")
        }

        // Check all body variables are declared
        const bodyVars = extractVariablesFromText(this._body)
        const declaredVars = this._variables.map((v) => v.name)
        const undeclaredVars = bodyVars.filter((v) => !declaredVars.includes(v))
        if (undeclaredVars.length > 0) {
            errors.push(`Undeclared variables: ${undeclaredVars.join(", ")}`)
        }

        // Check subject variables (if present)
        if (this._subject) {
            const subjectVars = extractVariablesFromText(this._subject)
            const undeclaredSubjectVars = subjectVars.filter((v) => !declaredVars.includes(v))
            if (undeclaredSubjectVars.length > 0) {
                errors.push(`Undeclared variables in subject: ${undeclaredSubjectVars.join(", ")}`)
            }
        }

        // Check declared variables are used (combine body + subject)
        const allUsedVars = [...bodyVars]
        if (this._subject) {
            const subjectVars = extractVariablesFromText(this._subject)
            for (const v of subjectVars) {
                if (!allUsedVars.includes(v)) {
                    allUsedVars.push(v)
                }
            }
        }
        const unusedVars = declaredVars.filter((v) => !allUsedVars.includes(v))
        if (unusedVars.length > 0) {
            errors.push(`Declared but unused variables: ${unusedVars.join(", ")}`)
        }

        // Email templates should have subject
        if (this._channel === Channel.EMAIL && !this._subject) {
            errors.push("Email templates require a subject")
        }

        return {
            valid: errors.length === 0,
            errors,
        }
    }

    // ===== Rendering =====

    /**
     * Render template with provided variable values.
     *
     * @param values - Key-value pairs for variable substitution
     * @returns Rendered body and subject (for email)
     *
     * @example
     * ```typescript
     * const result = template.render({ code: "1234", name: "John" })
     * if (result.success) {
     *     console.log(result.body)
     * }
     * ```
     */
    render(values: Record<string, string>): RenderResult {
        // Check required variables are provided
        const missingRequired = this._variables
            .filter((v) => v.required)
            .filter((v) => values[v.name] === undefined || values[v.name] === "")
            .map((v) => v.name)

        if (missingRequired.length > 0) {
            return {
                success: false,
                errorMessage: `Missing required variables: ${missingRequired.join(", ")}`,
            }
        }

        // Build complete values with defaults
        const completeValues: Record<string, string> = {}
        for (const variable of this._variables) {
            if (values[variable.name] !== undefined && values[variable.name] !== "") {
                completeValues[variable.name] = values[variable.name]
            } else if (variable.defaultValue !== undefined) {
                completeValues[variable.name] = variable.defaultValue
            }
        }

        // Render body
        let renderedBody = this._body
        for (const [name, value] of Object.entries(completeValues)) {
            renderedBody = replaceVariable(renderedBody, name, value)
        }

        // Render subject if present
        let renderedSubject: string | undefined
        if (this._subject) {
            renderedSubject = this._subject
            for (const [name, value] of Object.entries(completeValues)) {
                renderedSubject = replaceVariable(renderedSubject, name, value)
            }
        }

        return {
            success: true,
            body: renderedBody,
            subject: renderedSubject,
        }
    }

    // ===== Mutations =====

    /**
     * Update template content (body and optionally subject).
     *
     * @throws Error if template is archived or variables are undeclared
     */
    updateContent(body: string, subject?: string): void {
        if (this._status === TemplateStatus.ARCHIVED) {
            throw new Error("Cannot update archived template")
        }

        // Validate new content against declared variables
        const declaredVars = this._variables.map((v) => v.name)

        const bodyVars = extractVariablesFromText(body)
        const undeclaredBodyVars = bodyVars.filter((v) => !declaredVars.includes(v))
        if (undeclaredBodyVars.length > 0) {
            throw new Error(`Undeclared variables in body: ${undeclaredBodyVars.join(", ")}`)
        }

        if (subject) {
            const subjectVars = extractVariablesFromText(subject)
            const undeclaredSubjectVars = subjectVars.filter((v) => !declaredVars.includes(v))
            if (undeclaredSubjectVars.length > 0) {
                throw new Error(
                    `Undeclared variables in subject: ${undeclaredSubjectVars.join(", ")}`,
                )
            }
        }

        this._body = body
        this._subject = subject
        this._updatedAt = new Date()
    }

    /**
     * Update template name.
     *
     * @throws Error if template is archived
     */
    updateName(name: string): void {
        if (this._status === TemplateStatus.ARCHIVED) {
            throw new Error("Cannot update archived template")
        }
        this._name = name
        this._updatedAt = new Date()
    }

    /**
     * Update template description.
     */
    updateDescription(description: string | undefined): void {
        this._description = description
        this._updatedAt = new Date()
    }

    /**
     * Update template metadata (merges with existing).
     */
    updateMetadata(metadata: Record<string, unknown>): void {
        this._metadata = { ...this._metadata, ...metadata }
        this._updatedAt = new Date()
    }

    /**
     * Update template variables.
     *
     * @throws Error if template is archived or variables don't match body
     */
    updateVariables(variables: TemplateVariableProps[]): void {
        if (this._status === TemplateStatus.ARCHIVED) {
            throw new Error("Cannot update archived template")
        }

        // Validate new variables cover body placeholders
        const declaredVars = variables.map((v) => v.name)
        const bodyVars = extractVariablesFromText(this._body)
        const undeclaredVars = bodyVars.filter((v) => !declaredVars.includes(v))
        if (undeclaredVars.length > 0) {
            throw new Error(`Variables in body not declared: ${undeclaredVars.join(", ")}`)
        }

        this._variables = variables.map((v) => TemplateVariable.fromPersistence(v))
        this._updatedAt = new Date()
    }

    // ===== Persistence =====

    /**
     * Convert to plain object for persistence.
     */
    toPersistence(): TemplateProps {
        return {
            id: this._id,
            merchantId: this._merchantId,
            name: this._name,
            channel: this._channel,
            body: this._body,
            subject: this._subject,
            variables: this._variables.map((v) => v.toPersistence()),
            description: this._description,
            metadata: { ...this._metadata },
            status: this._status,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        }
    }
}
