import type { NotificationStatus, TemplateStatus } from "@/types/api"

type StatusType = NotificationStatus | TemplateStatus

interface StatusBadgeProps {
    status: StatusType
    type?: "notification" | "template"
}

const NOTIFICATION_COLORS: Record<NotificationStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    SENT: "bg-blue-100 text-blue-800",
    DELIVERED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
}

const TEMPLATE_COLORS: Record<TemplateStatus, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    ACTIVE: "bg-green-100 text-green-800",
    ARCHIVED: "bg-yellow-100 text-yellow-800",
}

const STATUS_LABELS: Record<string, string> = {
    PENDING: "Pending",
    SENT: "Sent",
    DELIVERED: "Delivered",
    FAILED: "Failed",
    DRAFT: "Draft",
    ACTIVE: "Active",
    ARCHIVED: "Archived",
}

export function StatusBadge({ status, type = "notification" }: StatusBadgeProps): JSX.Element {
    const colors =
        type === "template"
            ? TEMPLATE_COLORS[status as TemplateStatus]
            : NOTIFICATION_COLORS[status as NotificationStatus]

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors ?? "bg-gray-100 text-gray-800"}`}
        >
            {STATUS_LABELS[status] ?? status}
        </span>
    )
}
