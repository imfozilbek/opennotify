import { useCallback, useEffect, useState } from "react"
import {
    archiveTemplate,
    createTemplate,
    deleteTemplate,
    listTemplates,
    publishTemplate,
    unpublishTemplate,
    updateTemplate,
} from "@/api/templates"
import { TemplateCard } from "@/components/TemplateCard"
import { TemplateForm } from "@/components/TemplateForm"
import type {
    ChannelType,
    CreateTemplateRequest,
    Template,
    TemplateStatus,
    UpdateTemplateRequest,
} from "@/types/api"
import { CHANNEL_LABELS } from "@/types/api"

const STATUS_OPTIONS: { value: TemplateStatus | ""; label: string }[] = [
    { value: "", label: "All Statuses" },
    { value: "DRAFT", label: "Draft" },
    { value: "ACTIVE", label: "Active" },
    { value: "ARCHIVED", label: "Archived" },
]

const CHANNEL_OPTIONS: { value: ChannelType | ""; label: string }[] = [
    { value: "", label: "All Channels" },
    { value: "SMS", label: CHANNEL_LABELS.SMS },
    { value: "TELEGRAM", label: CHANNEL_LABELS.TELEGRAM },
    { value: "EMAIL", label: CHANNEL_LABELS.EMAIL },
    { value: "PUSH", label: CHANNEL_LABELS.PUSH },
    { value: "WHATSAPP", label: CHANNEL_LABELS.WHATSAPP },
]

export function TemplatesPage(): JSX.Element {
    const [templates, setTemplates] = useState<Template[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const [showForm, setShowForm] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

    const [filterStatus, setFilterStatus] = useState<TemplateStatus | "">("")
    const [filterChannel, setFilterChannel] = useState<ChannelType | "">("")

    const limit = 20

    const loadTemplates = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await listTemplates(
                page,
                limit,
                filterStatus || undefined,
                filterChannel || undefined,
            )
            if (response.success && response.data) {
                setTemplates(response.data.templates)
                setTotal(response.data.total)
            } else {
                setError(response.error?.message ?? "Failed to load templates")
            }
        } catch {
            setError("Failed to load templates")
        } finally {
            setIsLoading(false)
        }
    }, [page, filterStatus, filterChannel])

    useEffect(() => {
        void loadTemplates()
    }, [loadTemplates])

    async function handleCreate(data: CreateTemplateRequest): Promise<void> {
        const response = await createTemplate(data)

        if (response.success) {
            setShowForm(false)
            await loadTemplates()
        } else {
            throw new Error(response.error?.message ?? "Failed to create template")
        }
    }

    async function handleUpdate(data: UpdateTemplateRequest): Promise<void> {
        if (!editingTemplate) {
            return
        }

        const response = await updateTemplate(editingTemplate.id, data)

        if (response.success) {
            setEditingTemplate(null)
            await loadTemplates()
        } else {
            throw new Error(response.error?.message ?? "Failed to update template")
        }
    }

    async function handleDelete(id: string): Promise<void> {
        const response = await deleteTemplate(id)

        if (response.success) {
            setTemplates((prev) => prev.filter((t) => t.id !== id))
            setTotal((prev) => prev - 1)
        } else {
            setError(response.error?.message ?? "Failed to delete template")
        }
    }

    async function handlePublish(id: string): Promise<void> {
        const response = await publishTemplate(id)

        if (response.success && response.data) {
            setTemplates((prev) => prev.map((t) => (t.id === id ? response.data!.template : t)))
        } else {
            setError(response.error?.message ?? "Failed to publish template")
        }
    }

    async function handleUnpublish(id: string): Promise<void> {
        const response = await unpublishTemplate(id)

        if (response.success && response.data) {
            setTemplates((prev) => prev.map((t) => (t.id === id ? response.data!.template : t)))
        } else {
            setError(response.error?.message ?? "Failed to unpublish template")
        }
    }

    async function handleArchive(id: string): Promise<void> {
        const response = await archiveTemplate(id)

        if (response.success && response.data) {
            setTemplates((prev) => prev.map((t) => (t.id === id ? response.data!.template : t)))
        } else {
            setError(response.error?.message ?? "Failed to archive template")
        }
    }

    function handleEdit(template: Template): void {
        setEditingTemplate(template)
    }

    const totalPages = Math.ceil(total / limit)

    if (isLoading && templates.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
                    <p className="text-gray-600">Create and manage message templates</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(true)
                    }}
                    className="btn-primary"
                >
                    <svg
                        className="-ml-1 mr-2 h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Create Template
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
                <select
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value as TemplateStatus | "")
                        setPage(1)
                    }}
                    className="input w-auto"
                >
                    {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <select
                    value={filterChannel}
                    onChange={(e) => {
                        setFilterChannel(e.target.value as ChannelType | "")
                        setPage(1)
                    }}
                    className="input w-auto"
                >
                    {CHANNEL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => {
                            setError("")
                        }}
                        className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {templates.length === 0 ? (
                <div className="card p-8 text-center">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No templates</h3>
                    <p className="mt-2 text-gray-600">
                        Create your first template to start sending notifications.
                    </p>
                    <button
                        onClick={() => {
                            setShowForm(true)
                        }}
                        className="btn-primary mt-4"
                    >
                        Create Template
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2">
                        {templates.map((template) => (
                            <TemplateCard
                                key={template.id}
                                template={template}
                                onEdit={handleEdit}
                                onPublish={handlePublish}
                                onUnpublish={handleUnpublish}
                                onArchive={handleArchive}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
                                of {total} templates
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setPage((p) => Math.max(1, p - 1))
                                    }}
                                    disabled={page === 1}
                                    className="btn-secondary text-sm disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => {
                                        setPage((p) => Math.min(totalPages, p + 1))
                                    }}
                                    disabled={page === totalPages}
                                    className="btn-secondary text-sm disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {showForm && (
                <TemplateForm
                    onSubmit={handleCreate}
                    onCancel={() => {
                        setShowForm(false)
                    }}
                />
            )}

            {editingTemplate && (
                <TemplateForm
                    initialData={editingTemplate}
                    onSubmit={handleUpdate}
                    onCancel={() => {
                        setEditingTemplate(null)
                    }}
                />
            )}
        </div>
    )
}
