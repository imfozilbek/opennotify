import type { HttpClient } from "./http.js"
import type {
    CreateTemplateOptions,
    ListTemplatesOptions,
    RenderResult,
    RenderTemplateOptions,
    Template,
    TemplateList,
    UpdateTemplateOptions,
} from "./types/index.js"

/**
 * API response wrapper for template endpoints.
 */
interface TemplateResponse {
    template: Template
}

/**
 * Templates client for managing message templates.
 *
 * @example
 * ```typescript
 * const client = new OpenNotify({ apiKey: "your-api-key" })
 *
 * // Create a template
 * const template = await client.templates.create({
 *     name: "Welcome Message",
 *     channel: "sms",
 *     body: "Welcome {{name}}! Your code is {{code}}.",
 *     variables: [
 *         { name: "name", required: true },
 *         { name: "code", required: true },
 *     ],
 * })
 *
 * // Render template
 * const { body } = await client.templates.render({
 *     templateId: template.id,
 *     variables: { name: "John", code: "1234" },
 * })
 * ```
 */
export class TemplatesClient {
    private readonly http: HttpClient

    constructor(http: HttpClient) {
        this.http = http
    }

    /**
     * Create a new template.
     *
     * @param options - Template creation options
     * @returns The created template
     *
     * @example
     * ```typescript
     * const template = await client.templates.create({
     *     name: "OTP Template",
     *     channel: "sms",
     *     body: "Your verification code is {{code}}",
     *     variables: [
     *         { name: "code", required: true, description: "OTP code" },
     *     ],
     * })
     * ```
     */
    async create(options: CreateTemplateOptions): Promise<Template> {
        const response = await this.http.post<TemplateResponse>("/templates", {
            name: options.name,
            channel: this.toUpperChannel(options.channel),
            body: options.body,
            subject: options.subject,
            variables: options.variables,
            description: options.description,
        })
        return this.normalizeTemplate(response.template)
    }

    /**
     * List templates with pagination and filters.
     *
     * @param options - List options
     * @returns Paginated list of templates
     *
     * @example
     * ```typescript
     * // List all templates
     * const { templates, total } = await client.templates.list()
     *
     * // Filter by status and channel
     * const active = await client.templates.list({
     *     status: "active",
     *     channel: "sms",
     *     page: 1,
     *     limit: 10,
     * })
     * ```
     */
    async list(options?: ListTemplatesOptions): Promise<TemplateList> {
        const response = await this.http.get<TemplateList>("/templates", {
            status: options?.status ? this.toUpperStatus(options.status) : undefined,
            channel: options?.channel ? this.toUpperChannel(options.channel) : undefined,
            page: options?.page,
            limit: options?.limit,
        })
        return {
            ...response,
            templates: response.templates.map((t) => this.normalizeTemplate(t)),
        }
    }

    /**
     * Get a template by ID.
     *
     * @param id - Template ID
     * @returns The template
     *
     * @example
     * ```typescript
     * const template = await client.templates.get("tpl_123")
     * console.log(template.body)
     * ```
     */
    async get(id: string): Promise<Template> {
        const response = await this.http.get<TemplateResponse>(`/templates/${id}`)
        return this.normalizeTemplate(response.template)
    }

    /**
     * Update a template.
     *
     * @param id - Template ID
     * @param options - Update options
     * @returns The updated template
     *
     * @example
     * ```typescript
     * const template = await client.templates.update("tpl_123", {
     *     body: "Updated message: {{code}}",
     * })
     * ```
     */
    async update(id: string, options: UpdateTemplateOptions): Promise<Template> {
        const response = await this.http.put<TemplateResponse>(`/templates/${id}`, {
            name: options.name,
            body: options.body,
            subject: options.subject,
            variables: options.variables,
            description: options.description,
        })
        return this.normalizeTemplate(response.template)
    }

    /**
     * Delete a template.
     *
     * @param id - Template ID
     *
     * @example
     * ```typescript
     * await client.templates.delete("tpl_123")
     * ```
     */
    async delete(id: string): Promise<void> {
        await this.http.delete(`/templates/${id}`)
    }

    /**
     * Publish a template (DRAFT → ACTIVE).
     *
     * @param id - Template ID
     * @returns The published template
     *
     * @example
     * ```typescript
     * const template = await client.templates.publish("tpl_123")
     * console.log(template.status) // "active"
     * ```
     */
    async publish(id: string): Promise<Template> {
        const response = await this.http.post<TemplateResponse>(`/templates/${id}/publish`)
        return this.normalizeTemplate(response.template)
    }

    /**
     * Unpublish a template (ACTIVE → DRAFT).
     *
     * @param id - Template ID
     * @returns The unpublished template
     *
     * @example
     * ```typescript
     * const template = await client.templates.unpublish("tpl_123")
     * console.log(template.status) // "draft"
     * ```
     */
    async unpublish(id: string): Promise<Template> {
        const response = await this.http.post<TemplateResponse>(`/templates/${id}/unpublish`)
        return this.normalizeTemplate(response.template)
    }

    /**
     * Archive a template.
     *
     * @param id - Template ID
     * @returns The archived template
     *
     * @example
     * ```typescript
     * const template = await client.templates.archive("tpl_123")
     * console.log(template.status) // "archived"
     * ```
     */
    async archive(id: string): Promise<Template> {
        const response = await this.http.post<TemplateResponse>(`/templates/${id}/archive`)
        return this.normalizeTemplate(response.template)
    }

    /**
     * Render a template with variables.
     *
     * @param options - Render options
     * @returns Rendered body and subject
     *
     * @example
     * ```typescript
     * const { body, subject } = await client.templates.render({
     *     templateId: "tpl_123",
     *     variables: {
     *         name: "John",
     *         code: "1234",
     *     },
     * })
     *
     * console.log(body) // "Hello John! Your code is 1234."
     * ```
     */
    async render(options: RenderTemplateOptions): Promise<RenderResult> {
        return this.http.post<RenderResult>("/templates/render", {
            templateId: options.templateId,
            variables: options.variables,
        })
    }

    /**
     * Convert SDK channel to API format.
     */
    private toUpperChannel(channel: string): string {
        return channel.toUpperCase()
    }

    /**
     * Convert SDK status to API format.
     */
    private toUpperStatus(status: string): string {
        return status.toUpperCase()
    }

    /**
     * Normalize template from API response.
     */
    private normalizeTemplate(template: Template): Template {
        return {
            ...template,
            channel: template.channel.toLowerCase() as Template["channel"],
            status: template.status.toLowerCase() as Template["status"],
        }
    }
}
