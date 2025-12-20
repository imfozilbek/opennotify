import { useCallback, useEffect, useState } from "react"
import { listApiKeys, createApiKey, revokeApiKey } from "@/api/apikeys"
import { ApiKeyCard } from "@/components/apikeys/ApiKeyCard"
import { CreateApiKeyForm } from "@/components/apikeys/CreateApiKeyForm"
import { ApiKeyCreatedModal } from "@/components/apikeys/ApiKeyCreatedModal"
import type { ApiKey, CreateApiKeyRequest } from "@/types/api"

export function ApiKeysPage(): JSX.Element {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [createdKey, setCreatedKey] = useState<{ name: string; rawKey: string } | null>(null)

    const loadApiKeys = useCallback(async (): Promise<void> => {
        setIsLoading(true)
        setError("")
        try {
            const response = await listApiKeys()
            if (response.success && response.data) {
                setApiKeys(response.data.apiKeys)
            } else {
                setError(response.error?.message ?? "Failed to load API keys")
            }
        } catch {
            setError("Failed to load API keys")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadApiKeys()
    }, [loadApiKeys])

    const handleCreate = async (data: CreateApiKeyRequest): Promise<void> => {
        const response = await createApiKey(data)
        if (response.success && response.data) {
            setCreatedKey({
                name: response.data.apiKey.name,
                rawKey: response.data.rawKey,
            })
            setShowCreateForm(false)
            await loadApiKeys()
        } else {
            throw new Error(response.error?.message ?? "Failed to create API key")
        }
    }

    const handleRevoke = async (keyId: string): Promise<void> => {
        const response = await revokeApiKey(keyId)
        if (response.success) {
            await loadApiKeys()
        } else {
            setError(response.error?.message ?? "Failed to revoke API key")
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
                    <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
                    <p className="text-gray-600">
                        Manage your API keys for accessing the OpenNotify API
                    </p>
                </div>
                <button onClick={() => setShowCreateForm(true)} className="btn-primary">
                    Create API Key
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                    <p>{error}</p>
                    <button
                        onClick={() => setError("")}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {apiKeys.length === 0 ? (
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
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No API keys</h3>
                    <p className="mt-2 text-gray-500">
                        Create an API key to start using the OpenNotify API
                    </p>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-primary mt-4"
                    >
                        Create API Key
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {apiKeys.map((apiKey) => (
                        <ApiKeyCard key={apiKey.id} apiKey={apiKey} onRevoke={handleRevoke} />
                    ))}
                </div>
            )}

            {showCreateForm && (
                <CreateApiKeyForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            {createdKey && (
                <ApiKeyCreatedModal
                    apiKeyName={createdKey.name}
                    rawKey={createdKey.rawKey}
                    onClose={() => setCreatedKey(null)}
                />
            )}
        </div>
    )
}
