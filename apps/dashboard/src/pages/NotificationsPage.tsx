import { useCallback, useEffect, useState } from "react"
import { listNotifications } from "@/api/notifications"
import { StatusBadge } from "@/components/StatusBadge"
import { ChannelBadge } from "@/components/ChannelBadge"
import { NotificationDetailModal } from "@/components/NotificationDetailModal"
import { SendNotificationModal } from "@/components/SendNotificationModal"
import type { Notification } from "@/types/api"
import { PROVIDER_LABELS, type ProviderType } from "@/types/api"

export function NotificationsPage(): JSX.Element {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 20

    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
    const [showSendModal, setShowSendModal] = useState(false)

    const loadNotifications = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await listNotifications(page, limit)
            if (response.success && response.data) {
                setNotifications(response.data.notifications)
                setTotal(response.data.total)
            } else {
                setError(response.error?.message ?? "Failed to load notifications")
            }
        } catch {
            setError("Failed to load notifications")
        } finally {
            setIsLoading(false)
        }
    }, [page])

    useEffect(() => {
        void loadNotifications()
    }, [loadNotifications])

    function handleSendSuccess(): void {
        setShowSendModal(false)
        void loadNotifications()
    }

    const totalPages = Math.ceil(total / limit)

    if (isLoading && notifications.length === 0) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600">View your notification history</p>
                </div>
                <button
                    onClick={() => {
                        setShowSendModal(true)
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
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                    </svg>
                    Send Notification
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => {
                            setError("")
                            void loadNotifications()
                        }}
                        className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
                    >
                        Try again
                    </button>
                </div>
            )}

            {notifications.length === 0 && !error ? (
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
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No notifications yet</h3>
                    <p className="mt-2 text-gray-600">
                        Send your first notification to see it here.
                    </p>
                    <button
                        onClick={() => {
                            setShowSendModal(true)
                        }}
                        className="btn-primary mt-4"
                    >
                        Send Notification
                    </button>
                </div>
            ) : (
                <>
                    <div className="card overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
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
                                {notifications.map((notification) => (
                                    <tr
                                        key={notification.id}
                                        onClick={() => {
                                            setSelectedNotification(notification)
                                        }}
                                        className="cursor-pointer hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <ChannelBadge channel={notification.channel} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                            {PROVIDER_LABELS[
                                                notification.provider as ProviderType
                                            ] ?? notification.provider}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                            {notification.recipient}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <StatusBadge
                                                status={notification.status}
                                                type="notification"
                                            />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-gray-700">
                                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
                                of {total} results
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setPage((p) => Math.max(1, p - 1))
                                    }}
                                    disabled={page === 1}
                                    className="btn-secondary"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => {
                                        setPage((p) => Math.min(totalPages, p + 1))
                                    }}
                                    disabled={page === totalPages}
                                    className="btn-secondary"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {selectedNotification && (
                <NotificationDetailModal
                    notification={selectedNotification}
                    onClose={() => {
                        setSelectedNotification(null)
                    }}
                />
            )}

            {showSendModal && (
                <SendNotificationModal
                    onClose={() => {
                        setShowSendModal(false)
                    }}
                    onSuccess={handleSendSuccess}
                />
            )}
        </div>
    )
}
