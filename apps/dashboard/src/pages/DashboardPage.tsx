import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { listProviders } from "@/api/providers"
import type { ConnectedProvider } from "@/types/api"
import { PROVIDER_CHANNELS, PROVIDER_LABELS } from "@/types/api"

interface DashboardStats {
    providersCount: number
    channelsCount: number
}

export function DashboardPage(): JSX.Element {
    const [stats, setStats] = useState<DashboardStats>({ providersCount: 0, channelsCount: 0 })
    const [providers, setProviders] = useState<ConnectedProvider[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadData(): Promise<void> {
            try {
                const response = await listProviders()
                if (response.success && response.data) {
                    const providerList = response.data.providers
                    setProviders(providerList)

                    const uniqueChannels = new Set(
                        providerList.map((p) => PROVIDER_CHANNELS[p.provider]),
                    )

                    setStats({
                        providersCount: providerList.length,
                        channelsCount: uniqueChannels.size,
                    })
                }
            } catch {
                // Silently handle error
            } finally {
                setIsLoading(false)
            }
        }

        void loadData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
        )
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome to OpenNotify</p>
            </div>

            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="card p-6">
                    <div className="flex items-center">
                        <div className="rounded-lg bg-primary-100 p-3">
                            <svg
                                className="h-6 w-6 text-primary-600"
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
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Connected Providers</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stats.providersCount}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center">
                        <div className="rounded-lg bg-green-100 p-3">
                            <svg
                                className="h-6 w-6 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Channels</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stats.channelsCount}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center">
                        <div className="rounded-lg bg-purple-100 p-3">
                            <svg
                                className="h-6 w-6 text-purple-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Notifications</p>
                            <p className="text-2xl font-semibold text-gray-900">—</p>
                        </div>
                    </div>
                </div>
            </div>

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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        No providers connected
                    </h3>
                    <p className="mt-2 text-gray-600">
                        Connect your first provider to start sending notifications.
                    </p>
                    <Link to="/providers" className="btn-primary mt-4 inline-block">
                        Connect Provider
                    </Link>
                </div>
            ) : (
                <div className="card">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <h2 className="text-lg font-medium text-gray-900">Connected Providers</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {providers.slice(0, 5).map((provider) => (
                            <div
                                key={provider.id}
                                className="flex items-center justify-between px-6 py-4"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {PROVIDER_LABELS[provider.provider]}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {PROVIDER_CHANNELS[provider.provider]} •{" "}
                                        {new Date(provider.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    Active
                                </span>
                            </div>
                        ))}
                    </div>
                    {providers.length > 5 && (
                        <div className="border-t border-gray-200 px-6 py-3">
                            <Link
                                to="/providers"
                                className="text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                                View all providers →
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
