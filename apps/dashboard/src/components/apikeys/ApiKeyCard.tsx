import { useState } from "react"
import type { ApiKey } from "@/types/api"

interface ApiKeyCardProps {
    apiKey: ApiKey
    onRevoke: (keyId: string) => Promise<void>
}

export function ApiKeyCard({ apiKey, onRevoke }: ApiKeyCardProps): JSX.Element {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isRevoking, setIsRevoking] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopy = async (): Promise<void> => {
        await navigator.clipboard.writeText(apiKey.keyPrefix)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleRevoke = async (): Promise<void> => {
        setIsRevoking(true)
        try {
            await onRevoke(apiKey.id)
        } finally {
            setIsRevoking(false)
            setShowConfirm(false)
        }
    }

    const formatDate = (dateStr: string): string => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const getPermissionBadgeColor = (permission: string): string => {
        switch (permission) {
            case "admin":
                return "bg-purple-100 text-purple-800"
            case "write":
                return "bg-blue-100 text-blue-800"
            case "read":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="card p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900">{apiKey.name}</h3>
                        {!apiKey.isActive && (
                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                Revoked
                            </span>
                        )}
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-700">
                            {apiKey.keyPrefix}...
                        </code>
                        <button
                            onClick={handleCopy}
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            {copied ? "Copied!" : "Copy prefix"}
                        </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {apiKey.permissions.map((permission) => (
                            <span
                                key={permission}
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getPermissionBadgeColor(permission)}`}
                            >
                                {permission}
                            </span>
                        ))}
                    </div>

                    <div className="mt-3 text-sm text-gray-500">
                        <span>Created {formatDate(apiKey.createdAt)}</span>
                        {apiKey.lastUsedAt && (
                            <span className="ml-4">Last used {formatDate(apiKey.lastUsedAt)}</span>
                        )}
                        {apiKey.expiresAt && (
                            <span className="ml-4">Expires {formatDate(apiKey.expiresAt)}</span>
                        )}
                    </div>
                </div>

                {apiKey.isActive && (
                    <div>
                        {showConfirm ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRevoke}
                                    disabled={isRevoking}
                                    className="btn-danger text-sm disabled:opacity-50"
                                >
                                    {isRevoking ? "Revoking..." : "Confirm"}
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="btn-secondary text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="text-sm text-red-600 hover:text-red-700"
                            >
                                Revoke
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
