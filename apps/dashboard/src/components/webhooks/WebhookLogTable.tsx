import type { WebhookLog } from "@/types/api"
import { PROVIDER_LABELS, ProviderType } from "@/types/api"

interface WebhookLogTableProps {
    logs: WebhookLog[]
    onViewDetails: (log: WebhookLog) => void
}

export function WebhookLogTable({ logs, onViewDetails }: WebhookLogTableProps): JSX.Element {
    const getStatusBadgeColor = (status: string): string => {
        switch (status) {
            case "SUCCESS":
                return "bg-green-100 text-green-800"
            case "INVALID_SIGNATURE":
                return "bg-orange-100 text-orange-800"
            case "INVALID_PAYLOAD":
                return "bg-yellow-100 text-yellow-800"
            case "NOTIFICATION_NOT_FOUND":
                return "bg-gray-100 text-gray-800"
            case "PROCESSING_ERROR":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const formatStatus = (status: string): string => {
        return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr)
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getProviderLabel = (provider: string): string => {
        return PROVIDER_LABELS[provider as ProviderType] ?? provider
    }

    if (logs.length === 0) {
        return (
            <div className="p-8 text-center">
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No webhook logs</h3>
                <p className="mt-2 text-gray-500">
                    Webhook logs will appear here when providers send delivery updates
                </p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Notification
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Processing Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Received
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                {getProviderLabel(log.provider)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(log.status)}`}
                                >
                                    {formatStatus(log.status)}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {log.notificationId ? (
                                    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs">
                                        {log.notificationId.substring(0, 12)}...
                                    </code>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {log.processingTimeMs}ms
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                {formatDate(log.createdAt)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                <button
                                    onClick={() => onViewDetails(log)}
                                    className="text-primary-600 hover:text-primary-700"
                                >
                                    Details
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
