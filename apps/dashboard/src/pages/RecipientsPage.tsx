import { useState, useEffect, useCallback } from "react"
import {
    listRecipients,
    createRecipient,
    updateRecipient,
    deleteRecipient,
} from "@/api/recipients"
import { RecipientForm } from "@/components/RecipientForm"
import { ChannelBadge } from "@/components/ChannelBadge"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import type {
    Recipient,
    ChannelType,
    CreateRecipientRequest,
    UpdateRecipientRequest,
} from "@/types/api"
import { CHANNEL_LABELS } from "@/types/api"

export function RecipientsPage(): JSX.Element {
    const [recipients, setRecipients] = useState<Recipient[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const [showForm, setShowForm] = useState(false)
    const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const limit = 20

    const loadRecipients = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await listRecipients(page, limit)
            if (response.success && response.data) {
                setRecipients(response.data.recipients)
                setTotal(response.data.total)
            } else {
                setError(response.error?.message ?? "Failed to load recipients")
            }
        } catch {
            setError("Failed to load recipients")
        } finally {
            setIsLoading(false)
        }
    }, [page])

    useEffect(() => {
        void loadRecipients()
    }, [loadRecipients])

    async function handleCreate(data: CreateRecipientRequest): Promise<void> {
        const response = await createRecipient(data)

        if (response.success) {
            setShowForm(false)
            await loadRecipients()
        } else {
            throw new Error(response.error?.message ?? "Failed to create recipient")
        }
    }

    async function handleUpdate(data: UpdateRecipientRequest): Promise<void> {
        if (!editingRecipient) {
            return
        }

        const response = await updateRecipient(editingRecipient.id, data)

        if (response.success) {
            setEditingRecipient(null)
            await loadRecipients()
        } else {
            throw new Error(response.error?.message ?? "Failed to update recipient")
        }
    }

    async function handleDelete(): Promise<void> {
        if (!deletingId) {
            return
        }

        setIsDeleting(true)
        const response = await deleteRecipient(deletingId)

        if (response.success) {
            setRecipients((prev) => prev.filter((r) => r.id !== deletingId))
            setTotal((prev) => prev - 1)
        } else {
            setError(response.error?.message ?? "Failed to delete recipient")
        }

        setIsDeleting(false)
        setDeletingId(null)
    }

    function getAvailableChannels(recipient: Recipient): ChannelType[] {
        const channels: ChannelType[] = []
        if (recipient.contacts.phone) {
            channels.push("SMS")
            channels.push("WHATSAPP")
        }
        if (recipient.contacts.email) {
            channels.push("EMAIL")
        }
        if (recipient.contacts.telegramChatId) {
            channels.push("TELEGRAM")
        }
        if (recipient.contacts.deviceTokens && recipient.contacts.deviceTokens.length > 0) {
            channels.push("PUSH")
        }
        return channels
    }

    function getContactSummary(recipient: Recipient): string {
        const parts: string[] = []
        if (recipient.contacts.phone) {
            parts.push(recipient.contacts.phone)
        }
        if (recipient.contacts.email) {
            parts.push(recipient.contacts.email)
        }
        if (recipient.contacts.telegramChatId) {
            parts.push(`TG: ${recipient.contacts.telegramChatId}`)
        }
        return parts.join(" | ")
    }

    const totalPages = Math.ceil(total / limit)

    if (isLoading && recipients.length === 0) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Recipients</h1>
                    <p className="text-gray-600">Manage notification recipients</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn-primary">
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
                    Add Recipient
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => setError("")}
                        className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {recipients.length === 0 ? (
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No recipients</h3>
                    <p className="mt-2 text-gray-600">
                        Add your first recipient to start sending notifications.
                    </p>
                    <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
                        Add Recipient
                    </button>
                </div>
            ) : (
                <>
                    <div className="card overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Channels
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Preferred
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {recipients.map((recipient) => (
                                    <tr key={recipient.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {recipient.externalId || recipient.id.slice(0, 12)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {getContactSummary(recipient)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {getAvailableChannels(recipient).map((ch) => (
                                                    <ChannelBadge key={ch} channel={ch} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {recipient.preferences.preferredChannel
                                                ? CHANNEL_LABELS[
                                                      recipient.preferences.preferredChannel
                                                  ]
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(recipient.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingRecipient(recipient)}
                                                    className="text-gray-600 hover:text-gray-900"
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
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(recipient.id)}
                                                    className="text-gray-600 hover:text-red-600"
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {(page - 1) * limit + 1} to{" "}
                                {Math.min(page * limit, total)} of {total} recipients
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-secondary text-sm disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
                <RecipientForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {editingRecipient && (
                <RecipientForm
                    initialData={editingRecipient}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingRecipient(null)}
                />
            )}

            {deletingId && (
                <ConfirmDialog
                    title="Delete Recipient"
                    message="Are you sure you want to delete this recipient? This action cannot be undone."
                    confirmLabel="Delete"
                    isLoading={isDeleting}
                    onConfirm={handleDelete}
                    onCancel={() => setDeletingId(null)}
                />
            )}
        </div>
    )
}
