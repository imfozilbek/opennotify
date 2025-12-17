import type { Notification, NotificationStatus } from "@/types/api"
import { StatusBadge } from "./StatusBadge"
import { ChannelBadge } from "./ChannelBadge"
import { PROVIDER_LABELS, type ProviderType } from "@/types/api"

interface NotificationDetailModalProps {
    notification: Notification
    onClose: () => void
}

interface TimelineStep {
    status: NotificationStatus
    label: string
    timestamp?: string
    isActive: boolean
    isCurrent: boolean
    isError?: boolean
}

export function NotificationDetailModal({
    notification,
    onClose,
}: NotificationDetailModalProps): JSX.Element {
    function getTimeline(): TimelineStep[] {
        const steps: TimelineStep[] = [
            {
                status: "PENDING",
                label: "Created",
                timestamp: notification.createdAt,
                isActive: true,
                isCurrent: notification.status === "PENDING",
            },
        ]

        if (notification.status === "FAILED" && !notification.sentAt) {
            // Failed before sending
            steps.push({
                status: "FAILED",
                label: "Failed",
                timestamp: notification.failedAt,
                isActive: true,
                isCurrent: true,
                isError: true,
            })
        } else {
            // Sent step
            const sentActive = ["SENT", "DELIVERED", "FAILED"].includes(notification.status)
            steps.push({
                status: "SENT",
                label: "Sent",
                timestamp: notification.sentAt,
                isActive: sentActive,
                isCurrent: notification.status === "SENT",
            })

            // Final step
            if (notification.status === "DELIVERED") {
                steps.push({
                    status: "DELIVERED",
                    label: "Delivered",
                    timestamp: notification.deliveredAt,
                    isActive: true,
                    isCurrent: true,
                })
            } else if (notification.status === "FAILED" && notification.sentAt) {
                steps.push({
                    status: "FAILED",
                    label: "Failed",
                    timestamp: notification.failedAt,
                    isActive: true,
                    isCurrent: true,
                    isError: true,
                })
            } else {
                steps.push({
                    status: "DELIVERED",
                    label: "Delivered",
                    isActive: false,
                    isCurrent: false,
                })
            }
        }

        return steps
    }

    const timeline = getTimeline()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="card max-h-[90vh] w-full max-w-lg overflow-auto">
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Notification Details
                            </h2>
                            <p className="mt-1 font-mono text-sm text-gray-500">
                                {notification.id}
                            </p>
                        </div>
                        <StatusBadge status={notification.status} type="notification" />
                    </div>
                </div>

                <div className="space-y-6 p-6">
                    {/* Timeline */}
                    <div>
                        <h3 className="mb-4 font-medium text-gray-900">Delivery Timeline</h3>
                        <div className="relative">
                            {timeline.map((step, index) => (
                                <div key={step.status + String(index)} className="flex gap-4">
                                    {/* Line */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                                step.isError
                                                    ? "bg-red-100"
                                                    : step.isActive
                                                      ? "bg-green-100"
                                                      : "bg-gray-100"
                                            }`}
                                        >
                                            {step.isError ? (
                                                <svg
                                                    className="h-4 w-4 text-red-600"
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
                                            ) : step.isActive ? (
                                                <svg
                                                    className="h-4 w-4 text-green-600"
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
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-gray-300" />
                                            )}
                                        </div>
                                        {index < timeline.length - 1 && (
                                            <div
                                                className={`h-8 w-0.5 ${
                                                    step.isActive && timeline[index + 1]?.isActive
                                                        ? "bg-green-200"
                                                        : "bg-gray-200"
                                                }`}
                                            />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="pb-8">
                                        <p
                                            className={`font-medium ${
                                                step.isError
                                                    ? "text-red-700"
                                                    : step.isActive
                                                      ? "text-gray-900"
                                                      : "text-gray-400"
                                            }`}
                                        >
                                            {step.label}
                                        </p>
                                        {step.timestamp && (
                                            <p className="text-sm text-gray-500">
                                                {new Date(step.timestamp).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {notification.errorMessage && (
                        <div className="rounded-lg bg-red-50 p-4">
                            <h4 className="font-medium text-red-800">Error</h4>
                            <p className="mt-1 text-sm text-red-700">{notification.errorMessage}</p>
                        </div>
                    )}

                    {/* Details */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Details</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Channel</p>
                                <div className="mt-1">
                                    <ChannelBadge channel={notification.channel} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Provider</p>
                                <p className="mt-1 font-medium text-gray-900">
                                    {PROVIDER_LABELS[notification.provider as ProviderType] ??
                                        notification.provider}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Recipient</p>
                            <p className="mt-1 font-mono text-gray-900">{notification.recipient}</p>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div>
                        <h3 className="mb-2 font-medium text-gray-900">Message</h3>
                        <div className="rounded-lg bg-gray-50 p-4">
                            {notification.payload.subject && (
                                <p className="mb-2 font-medium text-gray-900">
                                    Subject: {notification.payload.subject}
                                </p>
                            )}
                            <p className="whitespace-pre-wrap text-sm text-gray-700">
                                {notification.payload.text}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end border-t border-gray-200 p-6">
                    <button onClick={onClose} className="btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
