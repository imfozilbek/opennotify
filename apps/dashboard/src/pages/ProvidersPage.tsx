import { useCallback, useEffect, useState } from "react"
import { connectProvider, deleteProvider, listProviders } from "@/api/providers"
import { ProviderCard } from "@/components/ProviderCard"
import { ProviderForm } from "@/components/ProviderForm"
import type { ConnectedProvider, ProviderType } from "@/types/api"

export function ProvidersPage(): JSX.Element {
    const [providers, setProviders] = useState<ConnectedProvider[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [error, setError] = useState("")

    const loadProviders = useCallback(async () => {
        try {
            const response = await listProviders()
            if (response.success && response.data) {
                setProviders(response.data.providers)
            } else {
                setError(response.error?.message ?? "Failed to load providers")
            }
        } catch {
            setError("Failed to load providers")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadProviders()
    }, [loadProviders])

    async function handleConnect(
        provider: ProviderType,
        credentials: Record<string, unknown>,
    ): Promise<void> {
        const response = await connectProvider({ provider, credentials })

        if (response.success) {
            setShowForm(false)
            await loadProviders()
        } else {
            throw new Error(response.error?.message ?? "Failed to connect provider")
        }
    }

    async function handleDelete(id: string): Promise<void> {
        const response = await deleteProvider(id)

        if (response.success) {
            setProviders((prev) => prev.filter((p) => p.id !== id))
        } else {
            setError(response.error?.message ?? "Failed to delete provider")
        }
    }

    if (isLoading) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
                    <p className="text-gray-600">Manage your notification providers</p>
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
                    Connect Provider
                </button>
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

            {providers.length === 0 ? (
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
                            d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        No providers connected
                    </h3>
                    <p className="mt-2 text-gray-600">
                        Connect your first provider to start sending notifications.
                    </p>
                    <button
                        onClick={() => {
                            setShowForm(true)
                        }}
                        className="btn-primary mt-4"
                    >
                        Connect Provider
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {providers.map((provider) => (
                        <ProviderCard
                            key={provider.id}
                            provider={provider}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            {showForm && (
                <ProviderForm
                    onSubmit={handleConnect}
                    onCancel={() => {
                        setShowForm(false)
                    }}
                />
            )}
        </div>
    )
}
