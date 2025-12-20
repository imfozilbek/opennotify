import type { AuditAction, AuditLog } from "@/types/api"
import { AUDIT_ACTION_LABELS } from "@/types/api"

interface AuditLogTableProps {
    logs: AuditLog[]
    total: number
    page: number
    totalPages: number
    isLoading: boolean
    onPageChange: (page: number) => void
}

const ACTION_COLORS: Record<AuditAction, string> = {
    TEAM_CREATED: "bg-green-100 text-green-800",
    TEAM_UPDATED: "bg-blue-100 text-blue-800",
    TEAM_DELETED: "bg-red-100 text-red-800",
    MEMBER_ADDED: "bg-green-100 text-green-800",
    MEMBER_REMOVED: "bg-red-100 text-red-800",
    MEMBER_ROLE_CHANGED: "bg-yellow-100 text-yellow-800",
    OWNERSHIP_TRANSFERRED: "bg-purple-100 text-purple-800",
    PROVIDER_CONNECTED: "bg-green-100 text-green-800",
    PROVIDER_DISCONNECTED: "bg-red-100 text-red-800",
    API_KEY_CREATED: "bg-green-100 text-green-800",
    API_KEY_REVOKED: "bg-red-100 text-red-800",
    SETTINGS_UPDATED: "bg-blue-100 text-blue-800",
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) {
        return "Just now"
    }
    if (diffMins < 60) {
        return `${String(diffMins)}m ago`
    }
    if (diffHours < 24) {
        return `${String(diffHours)}h ago`
    }
    if (diffDays < 7) {
        return `${String(diffDays)}d ago`
    }
    return date.toLocaleDateString()
}

export function AuditLogTable({
    logs,
    total,
    page,
    totalPages,
    isLoading,
    onPageChange,
}: AuditLogTableProps): JSX.Element {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading audit logs...</div>
            </div>
        )
    }

    if (logs.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="mt-2 text-gray-500">No audit logs yet</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                            <th className="pb-3 font-medium">Action</th>
                            <th className="pb-3 font-medium">Actor</th>
                            <th className="pb-3 font-medium">Description</th>
                            <th className="pb-3 font-medium text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <tr key={log.id} className="text-sm">
                                <td className="py-3">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-800"}`}
                                    >
                                        {AUDIT_ACTION_LABELS[log.action] ?? log.action}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <span className="text-gray-900">{log.actorEmail}</span>
                                </td>
                                <td className="py-3">
                                    <span className="text-gray-600">{log.description}</span>
                                </td>
                                <td className="py-3 text-right">
                                    <span className="text-gray-500" title={log.createdAt}>
                                        {formatTimeAgo(log.createdAt)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-500">
                        Showing {logs.length} of {total} logs
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="flex items-center px-3 text-sm text-gray-500">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
