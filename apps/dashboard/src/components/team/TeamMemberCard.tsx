import type { TeamMember, TeamRole } from "@/types/api"
import { RoleBadge } from "./RoleBadge"

interface TeamMemberCardProps {
    member: TeamMember
    currentUserRole: TeamRole
    onEditRole: (member: TeamMember) => void
    onRemove: (member: TeamMember) => void
}

function canManageMember(currentUserRole: TeamRole, targetRole: TeamRole): boolean {
    if (currentUserRole === "OWNER") {
        return targetRole !== "OWNER"
    }
    if (currentUserRole === "ADMIN") {
        return targetRole === "MEMBER" || targetRole === "VIEWER"
    }
    return false
}

export function TeamMemberCard({
    member,
    currentUserRole,
    onEditRole,
    onRemove,
}: TeamMemberCardProps): JSX.Element {
    const canManage = canManageMember(currentUserRole, member.role)
    const isOwner = member.role === "OWNER"

    return (
        <div className="card p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{member.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{member.email}</p>
                    <div className="mt-2">
                        <RoleBadge role={member.role} />
                    </div>
                    <p className="mt-2 text-xs text-gray-400">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                </div>
                {canManage && !isOwner && (
                    <div className="flex gap-1 ml-2">
                        <button
                            onClick={() => onEditRole(member)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Change role"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={() => onRemove(member)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Remove member"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
