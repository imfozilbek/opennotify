import { useEffect, useState } from "react"
import { getAnalyticsByChannel, getAnalyticsLogs, getAnalyticsSummary } from "@/api/analytics"
import { StatusBadge } from "@/components/StatusBadge"
import { ChannelBadge } from "@/components/ChannelBadge"
import {
    CHANNEL_LABELS,
    PERIOD_LABELS,
    type AnalyticsPeriod,
    type AnalyticsSummary,
    type ChannelStats,
    type ChannelType,
    type LogEntry,
    type NotificationStatus,
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
    value: number | string
    icon: React.ReactNode
    color: string
    subtext?: string
}

function StatCard({ label, value, icon, color, subtext }: StatCardProps): React.JSX.Element {
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

interface ChannelBarProps {
    channel: ChannelStats
    maxTotal: number
}

function ChannelBar({ channel, maxTotal }: ChannelBarProps): React.JSX.Element {
    const percentage = maxTotal > 0 ? (channel.total / maxTotal) * 100 : 0
    const deliveredPercentage = channel.total > 0 ? (channel.delivered / channel.total) * 100 : 0
    const failedPercentage = channel.total > 0 ? (channel.failed / channel.total) * 100 : 0

    return (
        <div className="py-3">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ChannelBadge channel={channel.channel} />
                    <span className="text-sm font-medium text-gray-900">
                        {CHANNEL_LABELS[channel.channel]}
                    </span>
                </div>
                <span className="text-sm text-gray-600">{channel.total} total</span>
            </div>
            <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                    className="flex h-full transition-all duration-300"
                    style={{ width: `${String(percentage)}%` }}
                >
                    <div
                        className="bg-green-500"
                        style={{ width: `${String(deliveredPercentage)}%` }}
                        title={`Delivered: ${String(channel.delivered)}`}
                    />
                    <div
                        className="bg-blue-500"
                        style={{ width: `${String(100 - deliveredPercentage - failedPercentage)}%` }}
                        title={`Sent/Pending: ${String(channel.sent + channel.pending)}`}
                    />
                    <div
                        className="bg-red-500"
                        style={{ width: `${String(failedPercentage)}%` }}
                        title={`Failed: ${String(channel.failed)}`}
                    />
                </div>
            </div>
            <div className="mt-1 flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {channel.delivered} delivered
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    {channel.sent + channel.pending} sent/pending
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    {channel.failed} failed
                </span>
            </div>
        </div>
    )
}

export function AnalyticsPage(): React.JSX.Element {
    const [period, setPeriod] = useState<AnalyticsPeriod>("last_7_days" as AnalyticsPeriod)
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
    const [channels, setChannels] = useState<ChannelStats[]>([])
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [logsPage, setLogsPage] = useState(1)
    const [logsTotalPages, setLogsTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<NotificationStatus | "">("")
    const [channelFilter, setChannelFilter] = useState<ChannelType | "">("")

    // Load summary and channels data
    useEffect(() => {
        async function loadAnalytics(): Promise<void> {
            setIsLoading(true)
            try {
                const [summaryRes, channelsRes] = await Promise.all([
                    getAnalyticsSummary({ period }),
                    getAnalyticsByChannel({ period }),
                ])

                if (summaryRes.success && summaryRes.data) {
                    setSummary(summaryRes.data.stats)
                }

                if (channelsRes.success && channelsRes.data) {
                    setChannels(channelsRes.data.channels)
                }
            } catch {
                // Handle error silently
            } finally {
                setIsLoading(false)
            }
        }

        void loadAnalytics()
    }, [period])

    // Load logs data
    useEffect(() => {
        async function loadLogs(): Promise<void> {
            try {
                const query: Record<string, unknown> = {
                    page: logsPage,
                    limit: 10,
                }

                if (statusFilter) {
                    query.status = [statusFilter]
                }

                if (channelFilter) {
                    query.channel = [channelFilter]
                }

                const logsRes = await getAnalyticsLogs(
                    query as Parameters<typeof getAnalyticsLogs>[0],
                )

                if (logsRes.success && logsRes.data) {
                    setLogs(logsRes.data.logs)
                    setLogsTotalPages(logsRes.data.pagination.totalPages)
                }
            } catch {
                // Handle error silently
            }
        }

        void loadLogs()
    }, [logsPage, statusFilter, channelFilter])

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
        )
    }

    const maxChannelTotal = Math.max(...channels.map((c) => c.total), 1)

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600">Notification delivery insights</p>
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
                    label="Total Notifications"
                    value={summary?.total ?? 0}
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
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
                        </svg>
                    }
                />
                <StatCard
                    label="Delivered"
                    value={summary?.delivered ?? 0}
                    subtext={`${((summary?.deliveryRate ?? 0) * 100).toFixed(1)}% delivery rate`}
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
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    }
                />
                <StatCard
                    label="Failed"
                    value={summary?.failed ?? 0}
                    subtext={`${((summary?.failureRate ?? 0) * 100).toFixed(1)}% failure rate`}
                    color="bg-red-100"
                    icon={
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
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    }
                />
                <StatCard
                    label="Pending"
                    value={summary?.pending ?? 0}
                    color="bg-yellow-100"
                    icon={
                        <svg
                            className="h-6 w-6 text-yellow-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    }
                />
            </div>

            {/* Channel Breakdown */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
                <div className="card p-6">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">Channel Breakdown</h2>
                    {channels.length === 0 ? (
                        <p className="py-8 text-center text-gray-500">No data available</p>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {channels.map((channel) => (
                                <ChannelBar
                                    key={channel.channel}
                                    channel={channel}
                                    maxTotal={maxChannelTotal}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Success Rate by Channel */}
                <div className="card p-6">
                    <h2 className="mb-4 text-lg font-medium text-gray-900">
                        Delivery Rate by Channel
                    </h2>
                    {channels.length === 0 ? (
                        <p className="py-8 text-center text-gray-500">No data available</p>
                    ) : (
                        <div className="space-y-4">
                            {channels.map((channel) => (
                                <div key={channel.channel} className="flex items-center gap-4">
                                    <div className="w-24">
                                        <ChannelBadge channel={channel.channel} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-green-500 transition-all duration-300"
                                                style={{
                                                    width: `${String((channel.deliveryRate ?? 0) * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-16 text-right text-sm font-medium text-gray-900">
                                        {((channel.deliveryRate ?? 0) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Logs */}
            <div className="card">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Notifications</h2>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value as NotificationStatus | "")
                                setLogsPage(1)
                            }}
                            className="input w-auto text-sm"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="SENT">Sent</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="FAILED">Failed</option>
                        </select>
                        <select
                            value={channelFilter}
                            onChange={(e) => {
                                setChannelFilter(e.target.value as ChannelType | "")
                                setLogsPage(1)
                            }}
                            className="input w-auto text-sm"
                        >
                            <option value="">All Channels</option>
                            <option value="SMS">SMS</option>
                            <option value="TELEGRAM">Telegram</option>
                            <option value="EMAIL">Email</option>
                            <option value="PUSH">Push</option>
                            <option value="WHATSAPP">WhatsApp</option>
                        </select>
                    </div>
                </div>

                {logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No notifications found</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Channel
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Provider
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Recipient
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Created
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <ChannelBadge channel={log.channel} />
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {log.provider}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {log.recipient}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <StatusBadge status={log.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {logsTotalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                                <button
                                    onClick={() => {
                                        setLogsPage((p) => Math.max(1, p - 1))
                                    }}
                                    disabled={logsPage === 1}
                                    className="btn-secondary disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {logsPage} of {logsTotalPages}
                                </span>
                                <button
                                    onClick={() => {
                                        setLogsPage((p) => Math.min(logsTotalPages, p + 1))
                                    }}
                                    disabled={logsPage === logsTotalPages}
                                    className="btn-secondary disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
