import { useState } from "react"
import type { Template } from "@/types/api"
import { StatusBadge } from "./StatusBadge"
import { ChannelBadge } from "./ChannelBadge"

interface TemplateCardProps {
    template: Template
    onEdit: (template: Template) => void
    onPublish: (id: string) => Promise<void>
    onUnpublish: (id: string) => Promise<void>
    onArchive: (id: string) => Promise<void>
    onDelete: (id: string) => Promise<void>
}

export function TemplateCard({
    template,
    onEdit,
    onPublish,
    onUnpublish,
    onArchive,
    onDelete,
}: TemplateCardProps): JSX.Element {
    const [isLoading, setIsLoading] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    async function handleAction(action: () => Promise<void>): Promise<void> {
        setIsLoading(true)
        try {
            await action()
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete(): Promise<void> {
        setIsLoading(true)
        try {
            await onDelete(template.id)
        } finally {
            setIsLoading(false)
            setShowConfirm(false)
        }
    }

    // Truncate body for preview
    const bodyPreview =
        template.body.length > 100 ? `${template.body.substring(0, 100)}...` : template.body

    return (
        <div className="card p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                            {template.name}
                        </h3>
                        <StatusBadge status={template.status} type="template" />
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <ChannelBadge channel={template.channel} />
                        {template.variables.length > 0 && (
                            <span className="text-xs text-gray-500">
                                {template.variables.length} variable
                                {template.variables.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>

                {!showConfirm ? (
                    <button
                        onClick={() => {
                            setShowConfirm(true)
                        }}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setShowConfirm(false)
                            }}
                            disabled={isLoading}
                            className="btn-secondary text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="btn-danger text-xs"
                        >
                            {isLoading ? "..." : "Delete"}
                        </button>
                    </div>
                )}
            </div>

            {/* Body Preview */}
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-600 whitespace-pre-wrap break-words">
                    {bodyPreview}
                </p>
            </div>

            {/* Variables */}
            {template.variables.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                        <span
                            key={variable.name}
                            className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${
                                variable.required
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-gray-50 text-gray-600"
                            }`}
                        >
                            {"{{"}
                            {variable.name}
                            {"}}"}
                            {variable.required && <span className="ml-0.5 text-red-500">*</span>}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs text-gray-500">
                    Updated {new Date(template.updatedAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                    {template.status === "DRAFT" && (
                        <button
                            onClick={async () => handleAction(async () => onPublish(template.id))}
                            disabled={isLoading}
                            className="btn-primary text-xs"
                        >
                            Publish
                        </button>
                    )}
                    {template.status === "ACTIVE" && (
                        <>
                            <button
                                onClick={async () =>
                                    handleAction(async () => onUnpublish(template.id))
                                }
                                disabled={isLoading}
                                className="btn-secondary text-xs"
                            >
                                Unpublish
                            </button>
                            <button
                                onClick={async () =>
                                    handleAction(async () => onArchive(template.id))
                                }
                                disabled={isLoading}
                                className="btn-secondary text-xs"
                            >
                                Archive
                            </button>
                        </>
                    )}
                    {template.status === "ARCHIVED" && (
                        <button
                            onClick={async () => handleAction(async () => onUnpublish(template.id))}
                            disabled={isLoading}
                            className="btn-secondary text-xs"
                        >
                            Restore
                        </button>
                    )}
                    <button
                        onClick={() => {
                            onEdit(template)
                        }}
                        disabled={isLoading}
                        className="btn-secondary text-xs"
                    >
                        Edit
                    </button>
                </div>
            </div>
        </div>
    )
}
