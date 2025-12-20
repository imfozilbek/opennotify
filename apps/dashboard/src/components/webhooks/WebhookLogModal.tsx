import type { WebhookLog } from "@/types/api"
import { PROVIDER_LABELS, ProviderType } from "@/types/api"

interface WebhookLogModalProps {
    log: WebhookLog
    onClose: () => void
}

export function WebhookLogModal({ log, onClose }: WebhookLogModalProps): JSX.Element {
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
        return new Date(dateStr).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
    }

    const getProviderLabel = (provider: string): string => {
        return PROVIDER_LABELS[provider as ProviderType] ?? provider
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="card w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between border-b border-gray-200 p-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Webhook Details</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {getProviderLabel(log.provider)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Status</span>
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(log.status)}`}
                            >
                                {formatStatus(log.status)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Received At</span>
                            <span className="text-sm text-gray-900">{formatDate(log.createdAt)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Processing Time</span>
                            <span className="text-sm text-gray-900">{log.processingTimeMs}ms</span>
                        </div>

                        {log.notificationId && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">
                                    Notification ID
                                </span>
                                <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                                    {log.notificationId}
                                </code>
                            </div>
                        )}

                        {log.externalId && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">
                                    External ID
                                </span>
                                <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                                    {log.externalId}
                                </code>
                            </div>
                        )}

                        {log.notificationStatus && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">
                                    Notification Status
                                </span>
                                <span className="text-sm text-gray-900">
                                    {log.notificationStatus}
                                </span>
                            </div>
                        )}

                        {log.ipAddress && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">
                                    IP Address
                                </span>
                                <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                                    {log.ipAddress}
                                </code>
                            </div>
                        )}

                        {log.errorMessage && (
                            <div>
                                <span className="text-sm font-medium text-gray-500">
                                    Error Message
                                </span>
                                <div className="mt-2 rounded-lg bg-red-50 p-3">
                                    <p className="text-sm text-red-700">{log.errorMessage}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <span className="text-sm font-medium text-gray-500">Webhook ID</span>
                            <code className="mt-1 block rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                                {log.id}
                            </code>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end border-t border-gray-200 p-6">
                    <button onClick={onClose} className="btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
