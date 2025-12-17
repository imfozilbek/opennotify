import { useState } from "react"
import type { ConnectedProvider } from "@/types/api"
import { PROVIDER_CHANNELS, PROVIDER_LABELS } from "@/types/api"

interface ProviderCardProps {
    provider: ConnectedProvider
    onDelete: (id: string) => Promise<void>
}

export function ProviderCard({ provider, onDelete }: ProviderCardProps): JSX.Element {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    async function handleDelete(): Promise<void> {
        setIsDeleting(true)
        try {
            await onDelete(provider.id)
        } finally {
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    const channelColors: Record<string, string> = {
        SMS: "bg-blue-100 text-blue-800",
        Telegram: "bg-cyan-100 text-cyan-800",
        Email: "bg-purple-100 text-purple-800",
        Push: "bg-orange-100 text-orange-800",
        WhatsApp: "bg-green-100 text-green-800",
    }

    const channel = PROVIDER_CHANNELS[provider.provider]

    return (
        <div className="card p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">
                        {PROVIDER_LABELS[provider.provider]}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                        <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${channelColors[channel] ?? "bg-gray-100 text-gray-800"}`}
                        >
                            {channel}
                        </span>
                        <span className="text-sm text-gray-500">
                            Connected {new Date(provider.createdAt).toLocaleDateString()}
                        </span>
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
                            disabled={isDeleting}
                            className="btn-secondary text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="btn-danger text-xs"
                        >
                            {isDeleting ? "..." : "Delete"}
                        </button>
                    </div>
                )}
            </div>

            {provider.maskedCredentials && Object.keys(provider.maskedCredentials).length > 0 && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Configuration
                    </p>
                    <div className="space-y-1">
                        {Object.entries(provider.maskedCredentials).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                                <span className="text-gray-500">{key}</span>
                                <span className="font-mono text-gray-700">{String(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
