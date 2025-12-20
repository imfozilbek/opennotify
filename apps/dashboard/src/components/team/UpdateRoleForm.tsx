import { type FormEvent, useState } from "react"
import type { TeamMember, TeamRole } from "@/types/api"
import { ROLE_LABELS } from "@/types/api"
import { RoleBadge } from "./RoleBadge"

interface UpdateRoleFormProps {
    member: TeamMember
    currentUserRole: TeamRole
    onSubmit: (userId: string, role: TeamRole) => Promise<void>
    onCancel: () => void
}

function getAssignableRoles(currentUserRole: TeamRole): TeamRole[] {
    if (currentUserRole === "OWNER") {
        return ["ADMIN", "MEMBER", "VIEWER"]
    }
    if (currentUserRole === "ADMIN") {
        return ["MEMBER", "VIEWER"]
    }
    return []
}

export function UpdateRoleForm({
    member,
    currentUserRole,
    onSubmit,
    onCancel,
}: UpdateRoleFormProps): JSX.Element {
    const [role, setRole] = useState<TeamRole>(member.role)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const assignableRoles = getAssignableRoles(currentUserRole)

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault()
        setError("")

        if (role === member.role) {
            onCancel()
            return
        }

        setIsSubmitting(true)

        try {
            await onSubmit(member.userId, role)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update role")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="card w-full max-w-md">
                <div className="border-b border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900">Change Role</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 p-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm text-gray-500">Current role:</span>
                                <RoleBadge role={member.role} />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="role" className="label">
                                New Role
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as TeamRole)}
                                className="input"
                            >
                                {assignableRoles.map((r) => (
                                    <option key={r} value={r}>
                                        {ROLE_LABELS[r]}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                {role === "ADMIN" && "Can manage team members and settings"}
                                {role === "MEMBER" && "Can send notifications and manage templates"}
                                {role === "VIEWER" && "Read-only access to logs and analytics"}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || role === member.role}
                            className="btn-primary"
                        >
                            {isSubmitting ? "Updating..." : "Update Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
