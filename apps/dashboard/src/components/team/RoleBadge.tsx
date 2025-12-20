import type { TeamRole } from "@/types/api"
import { ROLE_LABELS } from "@/types/api"

interface RoleBadgeProps {
    role: TeamRole
}

const ROLE_BADGE_COLORS: Record<TeamRole, string> = {
    OWNER: "bg-purple-100 text-purple-800",
    ADMIN: "bg-blue-100 text-blue-800",
    MEMBER: "bg-green-100 text-green-800",
    VIEWER: "bg-gray-100 text-gray-800",
}

export function RoleBadge({ role }: RoleBadgeProps): JSX.Element {
    const colors = ROLE_BADGE_COLORS[role] ?? "bg-gray-100 text-gray-800"

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors}`}
        >
            {ROLE_LABELS[role] ?? role}
        </span>
    )
}
