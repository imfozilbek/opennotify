import { type FormEvent, useState } from "react"
import type {
    ChannelType,
    CreateTemplateRequest,
    Template,
    TemplateVariable,
    UpdateTemplateRequest,
} from "@/types/api"
import { CHANNEL_LABELS } from "@/types/api"

interface TemplateFormCreateProps {
    initialData?: undefined
    onSubmit: (data: CreateTemplateRequest) => Promise<void>
    onCancel: () => void
}

interface TemplateFormUpdateProps {
    initialData: Template
    onSubmit: (data: UpdateTemplateRequest) => Promise<void>
    onCancel: () => void
}

type TemplateFormProps = TemplateFormCreateProps | TemplateFormUpdateProps

const CHANNELS: ChannelType[] = ["SMS", "TELEGRAM", "EMAIL", "PUSH", "WHATSAPP"]

export function TemplateForm({ initialData, onSubmit, onCancel }: TemplateFormProps): JSX.Element {
    const [name, setName] = useState(initialData?.name ?? "")
    const [channel, setChannel] = useState<ChannelType>(initialData?.channel ?? "SMS")
    const [body, setBody] = useState(initialData?.body ?? "")
    const [subject, setSubject] = useState(initialData?.subject ?? "")
    const [description, setDescription] = useState(initialData?.description ?? "")
    const [variables, setVariables] = useState<TemplateVariable[]>(initialData?.variables ?? [])

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Extract variables from body
    function extractVariables(text: string): string[] {
        const regex = /\{\{(\w+)\}\}/g
        const matches: string[] = []
        let match: RegExpExecArray | null
        while ((match = regex.exec(text)) !== null) {
            if (!matches.includes(match[1])) {
                matches.push(match[1])
            }
        }
        return matches
    }

    function handleBodyChange(newBody: string): void {
        setBody(newBody)

        // Auto-detect variables from body
        const detectedVars = extractVariables(newBody)
        const subjectVars = channel === "EMAIL" ? extractVariables(subject) : []
        const allVars = [...new Set([...detectedVars, ...subjectVars])]

        // Merge with existing variables
        const updatedVariables = allVars.map((varName) => {
            const existing = variables.find((v) => v.name === varName)
            return existing ?? { name: varName, required: true }
        })

        setVariables(updatedVariables)
    }

    function handleSubjectChange(newSubject: string): void {
        setSubject(newSubject)
        if (channel === "EMAIL") {
            handleBodyChange(body) // Recalculate variables
        }
    }

    function updateVariable(index: number, updates: Partial<TemplateVariable>): void {
        setVariables((prev) => prev.map((v, i) => (i === index ? { ...v, ...updates } : v)))
    }

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            if (initialData) {
                // Update mode
                const updateData: UpdateTemplateRequest = {
                    name: name !== initialData.name ? name : undefined,
                    body: body !== initialData.body ? body : undefined,
                    subject: channel === "EMAIL" ? subject : undefined,
                    variables: variables.length > 0 ? variables : undefined,
                    description: description || undefined,
                }
                await (onSubmit as (data: UpdateTemplateRequest) => Promise<void>)(updateData)
            } else {
                // Create mode
                const createData: CreateTemplateRequest = {
                    name,
                    channel,
                    body,
                    subject: channel === "EMAIL" ? subject : undefined,
                    variables: variables.length > 0 ? variables : undefined,
                    description: description || undefined,
                }
                await (onSubmit as (data: CreateTemplateRequest) => Promise<void>)(createData)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save template")
        } finally {
            setIsSubmitting(false)
        }
    }

    // Preview with sample values
    function renderPreview(): string {
        let preview = body
        for (const variable of variables) {
            const value = variable.defaultValue || `[${variable.name}]`
            preview = preview.replace(new RegExp(`\\{\\{${variable.name}\\}\\}`, "g"), value)
        }
        return preview
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="card max-h-[90vh] w-full max-w-2xl overflow-auto">
                <div className="border-b border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {initialData ? "Edit Template" : "Create Template"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 p-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="label">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                }}
                                className="input"
                                placeholder="e.g., OTP Verification"
                                required
                            />
                        </div>

                        {/* Channel (only for new templates) */}
                        {!initialData && (
                            <div>
                                <label htmlFor="channel" className="label">
                                    Channel
                                </label>
                                <select
                                    id="channel"
                                    value={channel}
                                    onChange={(e) => {
                                        setChannel(e.target.value as ChannelType)
                                    }}
                                    className="input"
                                >
                                    {CHANNELS.map((ch) => (
                                        <option key={ch} value={ch}>
                                            {CHANNEL_LABELS[ch]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Subject (for EMAIL only) */}
                        {channel === "EMAIL" && (
                            <div>
                                <label htmlFor="subject" className="label">
                                    Subject
                                </label>
                                <input
                                    id="subject"
                                    type="text"
                                    value={subject}
                                    onChange={(e) => {
                                        handleSubjectChange(e.target.value)
                                    }}
                                    className="input"
                                    placeholder="e.g., Your verification code"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Use {"{{variable}}"} for dynamic content
                                </p>
                            </div>
                        )}

                        {/* Body */}
                        <div>
                            <label htmlFor="body" className="label">
                                Message Body
                            </label>
                            <textarea
                                id="body"
                                value={body}
                                onChange={(e) => {
                                    handleBodyChange(e.target.value)
                                }}
                                className="input min-h-[120px]"
                                placeholder="Your verification code is {{code}}. Valid for {{minutes}} minutes."
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Use {"{{variable}}"} for dynamic content
                            </p>
                        </div>

                        {/* Variables */}
                        {variables.length > 0 && (
                            <div>
                                <label className="label">Variables</label>
                                <div className="space-y-3">
                                    {variables.map((variable, index) => (
                                        <div
                                            key={variable.name}
                                            className="rounded-lg border border-gray-200 p-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono text-sm text-blue-600">
                                                    {"{{"}
                                                    {variable.name}
                                                    {"}}"}
                                                </span>
                                                <label className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={variable.required}
                                                        onChange={(e) => {
                                                            updateVariable(index, {
                                                                required: e.target.checked,
                                                            })
                                                        }}
                                                        className="h-4 w-4 rounded border-gray-300"
                                                    />
                                                    Required
                                                </label>
                                            </div>
                                            <div className="mt-2 grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={variable.defaultValue ?? ""}
                                                    onChange={(e) => {
                                                        updateVariable(index, {
                                                            defaultValue:
                                                                e.target.value || undefined,
                                                        })
                                                    }}
                                                    className="input text-sm"
                                                    placeholder="Default value"
                                                />
                                                <input
                                                    type="text"
                                                    value={variable.description ?? ""}
                                                    onChange={(e) => {
                                                        updateVariable(index, {
                                                            description:
                                                                e.target.value || undefined,
                                                        })
                                                    }}
                                                    className="input text-sm"
                                                    placeholder="Description"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="label">
                                Description (optional)
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value)
                                }}
                                className="input"
                                rows={2}
                                placeholder="Internal notes about this template"
                            />
                        </div>

                        {/* Preview */}
                        {body && (
                            <div>
                                <label className="label">Preview</label>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    {channel === "EMAIL" && subject && (
                                        <p className="mb-2 font-medium text-gray-900">
                                            Subject: {subject}
                                        </p>
                                    )}
                                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                                        {renderPreview()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting
                                ? "Saving..."
                                : initialData
                                  ? "Save Changes"
                                  : "Create Template"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
