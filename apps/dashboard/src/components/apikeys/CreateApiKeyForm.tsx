import { useState } from "react"
import type { ApiKeyPermission, CreateApiKeyRequest } from "@/types/api"

interface CreateApiKeyFormProps {
    onSubmit: (data: CreateApiKeyRequest) => Promise<void>
    onCancel: () => void
}

const PERMISSIONS: { value: ApiKeyPermission; label: string; description: string }[] = [
    { value: "read", label: "Read", description: "View notifications and status" },
    { value: "write", label: "Write", description: "Send notifications" },
    { value: "admin", label: "Admin", description: "Full access including settings" },
]

export function CreateApiKeyForm({ onSubmit, onCancel }: CreateApiKeyFormProps): JSX.Element {
    const [name, setName] = useState("")
    const [permissions, setPermissions] = useState<ApiKeyPermission[]>([])
    const [expiresAt, setExpiresAt] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const handleTogglePermission = (permission: ApiKeyPermission): void => {
        setPermissions((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission],
        )
    }

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setError("")

        if (!name.trim()) {
            setError("Name is required")
            return
        }

        if (permissions.length === 0) {
            setError("Select at least one permission")
            return
        }

        setIsSubmitting(true)
        try {
            await onSubmit({
                name: name.trim(),
                permissions,
                expiresAt: expiresAt || undefined,
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create API key")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="card w-full max-w-md">
                <div className="border-b border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900">Create API Key</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Create a new API key for accessing the OpenNotify API
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 p-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="label">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input"
                                placeholder="e.g., Production API Key"
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Permissions</label>
                            <div className="space-y-2">
                                {PERMISSIONS.map((perm) => (
                                    <label
                                        key={perm.value}
                                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={permissions.includes(perm.value)}
                                            onChange={() => handleTogglePermission(perm.value)}
                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {perm.label}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {perm.description}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="expiresAt" className="label">
                                Expiration (optional)
                            </label>
                            <input
                                id="expiresAt"
                                type="date"
                                value={expiresAt}
                                onChange={(e) => setExpiresAt(e.target.value)}
                                className="input"
                                min={new Date().toISOString().split("T")[0]}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Leave empty for a non-expiring key
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
                        <button type="button" onClick={onCancel} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting ? "Creating..." : "Create API Key"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
