/**
 * Properties for creating a template variable.
 */
export interface TemplateVariableProps {
    /** Variable name (alphanumeric, underscores allowed, must start with letter) */
    name: string

    /** Whether the variable is required when rendering */
    required: boolean

    /** Default value if not provided (only for optional variables) */
    defaultValue?: string

    /** Human-readable description */
    description?: string
}

/**
 * Regular expression for valid variable names.
 * Must start with a letter, followed by alphanumeric characters or underscores.
 */
const VARIABLE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/

/**
 * Template variable definition.
 * Represents a placeholder that can be substituted when rendering a template.
 *
 * @example
 * ```typescript
 * const codeVar = TemplateVariable.create({
 *     name: "code",
 *     required: true,
 *     description: "OTP verification code",
 * })
 *
 * const minutesVar = TemplateVariable.create({
 *     name: "expires_in",
 *     required: false,
 *     defaultValue: "5",
 *     description: "Expiration time in minutes",
 * })
 *
 * console.log(codeVar.placeholder) // "{{code}}"
 * ```
 */
export class TemplateVariable {
    private readonly _name: string
    private readonly _required: boolean
    private readonly _defaultValue?: string
    private readonly _description?: string

    private constructor(props: TemplateVariableProps) {
        this._name = props.name
        this._required = props.required
        this._defaultValue = props.defaultValue
        this._description = props.description
    }

    /**
     * Create a new template variable with validation.
     *
     * @throws Error if name is invalid or required variable has default value
     */
    static create(props: TemplateVariableProps): TemplateVariable {
        if (!props.name || props.name.trim() === "") {
            throw new Error("Variable name is required")
        }

        if (!VARIABLE_NAME_REGEX.test(props.name)) {
            throw new Error(
                `Invalid variable name: "${props.name}". ` +
                    "Must be alphanumeric with underscores, starting with a letter",
            )
        }

        if (props.required && props.defaultValue !== undefined) {
            throw new Error("Required variables should not have a default value")
        }

        return new TemplateVariable(props)
    }

    /**
     * Reconstruct from persistence without validation.
     */
    static fromPersistence(props: TemplateVariableProps): TemplateVariable {
        return new TemplateVariable(props)
    }

    get name(): string {
        return this._name
    }

    get required(): boolean {
        return this._required
    }

    get defaultValue(): string | undefined {
        return this._defaultValue
    }

    get description(): string | undefined {
        return this._description
    }

    /**
     * Get placeholder pattern for this variable: {{name}}
     */
    get placeholder(): string {
        return `{{${this._name}}}`
    }

    /**
     * Check if this variable matches a given name.
     */
    matches(name: string): boolean {
        return this._name === name
    }

    /**
     * Convert to plain object for persistence.
     */
    toPersistence(): TemplateVariableProps {
        return {
            name: this._name,
            required: this._required,
            defaultValue: this._defaultValue,
            description: this._description,
        }
    }
}

/**
 * Extract variable placeholders from template text.
 * Pattern: {{variable_name}}
 *
 * @param text - Template text to parse
 * @returns Array of unique variable names found
 *
 * @example
 * ```typescript
 * const text = "Hello {{name}}, your code is {{code}}. Code: {{code}}"
 * const vars = extractVariablesFromText(text)
 * // ["name", "code"]
 * ```
 */
export function extractVariablesFromText(text: string): string[] {
    const pattern = /\{\{([a-zA-Z][a-zA-Z0-9_]*)\}\}/g
    const matches: string[] = []
    let match: RegExpExecArray | null

    while ((match = pattern.exec(text)) !== null) {
        if (!matches.includes(match[1])) {
            matches.push(match[1])
        }
    }

    return matches
}

/**
 * Validate that a variable name is valid.
 *
 * @param name - Variable name to validate
 * @returns true if valid
 */
export function isValidVariableName(name: string): boolean {
    return VARIABLE_NAME_REGEX.test(name)
}

/**
 * Replace all occurrences of a variable placeholder in text.
 *
 * @param text - Template text
 * @param name - Variable name
 * @param value - Value to substitute
 * @returns Text with placeholder replaced
 */
export function replaceVariable(text: string, name: string, value: string): string {
    return text.replace(new RegExp(`\\{\\{${name}\\}\\}`, "g"), value)
}
