import { useEffect, useState } from "react"
import { getCostAnalytics } from "@/api/analytics"
import { ChannelBadge } from "@/components/ChannelBadge"
import {
    CHANNEL_LABELS,
    PERIOD_LABELS,
    type AnalyticsPeriod,
    type ChannelCostBreakdown,
    type ChannelType,
    type CostAnalysis,
} from "@/types/api"

const PERIODS: AnalyticsPeriod[] = [
    "today" as AnalyticsPeriod,
    "this_week" as AnalyticsPeriod,
    "this_month" as AnalyticsPeriod,
    "last_7_days" as AnalyticsPeriod,
    "last_30_days" as AnalyticsPeriod,
]

interface StatCardProps {
    label: string
    value: string
    subtext?: string
    icon: React.ReactNode
    color: string
}

function StatCard({ label, value, subtext, icon, color }: StatCardProps): React.JSX.Element {
    return (
        <div className="card p-6">
            <div className="flex items-center">
                <div className={`rounded-lg ${color} p-3`}>{icon}</div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
                </div>
            </div>
        </div>
    )
}

interface SavingsCardProps {
    totalSavings: number
    savingsPercent: number
    potentialSmsCost: number
    actualCost: number
    currency: string
}

function SavingsCard({
    totalSavings,
    savingsPercent,
    potentialSmsCost,
    actualCost,
    currency,
}: SavingsCardProps): React.JSX.Element {
    return (
        <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-green-100">Total Savings</p>
                        <p className="text-3xl font-bold">
                            {formatCurrency(totalSavings, currency)}
                        </p>
                        <p className="mt-1 text-sm text-green-100">
                            {savingsPercent.toFixed(1)}% saved vs SMS-only
                        </p>
                    </div>
                    <div className="rounded-full bg-white/20 p-4">
                        <svg
                            className="h-8 w-8 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-gray-200 bg-gray-50 p-4">
                <div className="text-center">
                    <p className="text-xs font-medium uppercase text-gray-500">If All SMS</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                        {formatCurrency(potentialSmsCost, currency)}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs font-medium uppercase text-gray-500">Actual Cost</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                        {formatCurrency(actualCost, currency)}
                    </p>
                </div>
            </div>
        </div>
    )
}

interface ChannelCostBarProps {
    channel: ChannelCostBreakdown
    maxCost: number
    currency: string
}

function ChannelCostBar({ channel, maxCost, currency }: ChannelCostBarProps): React.JSX.Element {
    const percentage = maxCost > 0 ? (channel.actualCost / maxCost) * 100 : 0
    const channelType = channel.channel as ChannelType

    return (
        <div className="py-4">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ChannelBadge channel={channelType} />
                    <span className="text-sm font-medium text-gray-900">
                        {CHANNEL_LABELS[channelType] ?? channel.channel}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(channel.actualCost, currency)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">({channel.count} msgs)</span>
                </div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                    className="h-full rounded-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${String(percentage)}%` }}
                />
            </div>
            {channel.savings > 0 && (
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    </svg>
                    <span>
                        Saved {formatCurrency(channel.savings, currency)} (
                        {channel.savingsPercent.toFixed(0)}%)
                    </span>
                </div>
            )}
        </div>
    )
}

function formatCurrency(amount: number, currency: string): string {
    if (currency === "UZS") {
        return `${amount.toLocaleString()} UZS`
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount)
}

export function CostAnalysisPage(): React.JSX.Element {
    const [period, setPeriod] = useState<AnalyticsPeriod>("last_30_days" as AnalyticsPeriod)
    const [costs, setCosts] = useState<CostAnalysis | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function loadCosts(): Promise<void> {
            setIsLoading(true)
            setError("")
            try {
                const response = await getCostAnalytics({ period })
                if (response.success && response.data) {
                    setCosts(response.data.costs)
                } else {
                    setError(response.error?.message ?? "Failed to load cost analytics")
                }
            } catch {
                setError("Failed to load cost analytics")
            } finally {
                setIsLoading(false)
            }
        }

        void loadCosts()
    }, [period])

    if (isLoading) {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Cost Analysis</h1>
                    <p className="text-gray-600">Analyze your notification costs and savings</p>
                </div>
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Cost Analysis</h1>
                    <p className="text-gray-600">Analyze your notification costs and savings</p>
                </div>
                <div className="card p-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Error loading data</h3>
                    <p className="mt-1 text-gray-500">{error}</p>
                </div>
            </div>
        )
    }

    if (!costs || costs.totalNotifications === 0) {
        return (
            <div>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Cost Analysis</h1>
                        <p className="text-gray-600">Analyze your notification costs and savings</p>
                    </div>
                    <select
                        value={period}
                        onChange={(e) => {
                            setPeriod(e.target.value as AnalyticsPeriod)
                        }}
                        className="input w-auto"
                    >
                        {PERIODS.map((p) => (
                            <option key={p} value={p}>
                                {PERIOD_LABELS[p]}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="card p-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <svg
                            className="h-6 w-6 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No data available</h3>
                    <p className="mt-1 text-gray-500">
                        Send some notifications to see cost analytics
                    </p>
                </div>
            </div>
        )
    }

    const maxChannelCost = Math.max(...costs.byChannel.map((c) => c.actualCost), 1)

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cost Analysis</h1>
                    <p className="text-gray-600">Analyze your notification costs and savings</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => {
                        setPeriod(e.target.value as AnalyticsPeriod)
                    }}
                    className="input w-auto"
                >
                    {PERIODS.map((p) => (
                        <option key={p} value={p}>
                            {PERIOD_LABELS[p]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Summary Stats */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Cost"
                    value={formatCurrency(costs.totalCost, costs.currency)}
                    subtext={`${costs.totalNotifications.toLocaleString()} notifications`}
                    color="bg-primary-100"
                    icon={
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
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    }
                />
                <StatCard
                    label="Avg Cost / Message"
                    value={formatCurrency(costs.averageCostPerNotification, costs.currency)}
                    color="bg-blue-100"
                    icon={
                        <svg
                            className="h-6 w-6 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                            />
                        </svg>
                    }
                />
                <StatCard
                    label="Total Savings"
                    value={formatCurrency(costs.totalSavings, costs.currency)}
                    subtext={`${costs.savingsPercent.toFixed(1)}% saved`}
                    color="bg-green-100"
                    icon={
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
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                        </svg>
                    }
                />
                <StatCard
                    label="If All SMS"
                    value={formatCurrency(costs.potentialSmsCost, costs.currency)}
                    subtext="Potential cost"
                    color="bg-orange-100"
                    icon={
                        <svg
                            className="h-6 w-6 text-orange-600"
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
                    }
                />
            </div>

            {/* Savings Card + Channel Breakdown */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                {/* Savings Card */}
                <SavingsCard
                    totalSavings={costs.totalSavings}
                    savingsPercent={costs.savingsPercent}
                    potentialSmsCost={costs.potentialSmsCost}
                    actualCost={costs.totalCost}
                    currency={costs.currency}
                />

                {/* Channel Breakdown */}
                <div className="card p-6">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">Cost by Channel</h2>
                    {costs.byChannel.length === 0 ? (
                        <p className="py-8 text-center text-gray-500">No data available</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {costs.byChannel.map((channel) => (
                                <ChannelCostBar
                                    key={channel.channel}
                                    channel={channel}
                                    maxCost={maxChannelCost}
                                    currency={costs.currency}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Provider Cost Table */}
            <div className="card">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900">Provider Breakdown</h2>
                </div>
                {costs.byChannel.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No data available</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Provider
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Channel
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Messages
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Cost/Message
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Total Cost
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {costs.byChannel.flatMap((channel) =>
                                    channel.providers.map((provider) => (
                                        <tr
                                            key={`${channel.channel}-${provider.provider}`}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {provider.provider}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <ChannelBadge
                                                    channel={channel.channel as ChannelType}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                                {provider.count.toLocaleString()}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                                                {formatCurrency(
                                                    provider.pricePerMessage,
                                                    costs.currency,
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                {formatCurrency(provider.cost, costs.currency)}
                                            </td>
                                        </tr>
                                    )),
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-4 text-sm font-medium text-gray-900"
                                    >
                                        Total
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-900">
                                        {formatCurrency(costs.totalCost, costs.currency)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
