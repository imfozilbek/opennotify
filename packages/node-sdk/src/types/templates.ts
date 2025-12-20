import type { Channel, TemplateStatus } from "./common.js"

/**
 * Template variable definition.
 */
export interface TemplateVariable {
    /**
     * Variable name (used in template as {{name}}).
     */
    name: string

    /**
     * Whether the variable is required when rendering.
     */
    required: boolean

    /**
     * Default value if variable is not provided.
     */
    defaultValue?: string

    /**
     * Description of the variable.
     */
    description?: string
}

/**
 * Template object returned from API.
 */
export interface Template {
    /**
     * Unique template ID.
     */
    id: string

    /**
     * Template name.
     */
    name: string

    /**
     * Channel this template is for.
     */
    channel: Channel

    /**
     * Template body content with {{variable}} placeholders.
     */
    body: string

    /**
     * Subject line (for email templates).
     */
    subject?: string

    /**
     * Template variables.
     */
    variables: TemplateVariable[]

    /**
     * Template description.
     */
    description?: string

    /**
     * Template status.
     */
    status: TemplateStatus

    /**
     * When the template was created.
     */
    createdAt: string

    /**
     * When the template was last updated.
     */
    updatedAt: string
}

/**
 * Options for creating a template.
 */
export interface CreateTemplateOptions {
    /**
     * Template name.
     */
    name: string

    /**
     * Channel for this template.
     */
    channel: Channel

    /**
     * Template body with {{variable}} placeholders.
     */
    body: string

    /**
     * Subject line (for email templates).
     */
    subject?: string

    /**
     * Template variables.
     */
    variables?: TemplateVariable[]

    /**
     * Template description.
     */
    description?: string
}

/**
 * Options for updating a template.
 */
export interface UpdateTemplateOptions {
    /**
     * New template name.
     */
    name?: string

    /**
     * New template body.
     */
    body?: string

    /**
     * New subject line.
     */
    subject?: string

    /**
     * New template variables.
     */
    variables?: TemplateVariable[]

    /**
     * New description.
     */
    description?: string
}

/**
 * Options for listing templates.
 */
export interface ListTemplatesOptions {
    /**
     * Filter by status.
     */
    status?: TemplateStatus

    /**
     * Filter by channel.
     */
    channel?: Channel

    /**
     * Page number (1-based).
     * @default 1
     */
    page?: number

    /**
     * Number of items per page.
     * @default 20
     */
    limit?: number
}

/**
 * Paginated list of templates.
 */
export interface TemplateList {
    /**
     * Array of templates.
     */
    templates: Template[]

    /**
     * Total count of templates.
     */
    total: number

    /**
     * Current page number.
     */
    page: number

    /**
     * Items per page.
     */
    limit: number
}

/**
 * Options for rendering a template.
 */
export interface RenderTemplateOptions {
    /**
     * Template ID to render.
     */
    templateId: string

    /**
     * Variable values for substitution.
     */
    variables: Record<string, string>
}

/**
 * Result of template rendering.
 */
export interface RenderResult {
    /**
     * Rendered template body.
     */
    body: string

    /**
     * Rendered subject line (if applicable).
     */
    subject?: string
}
