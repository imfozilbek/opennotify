import { type FormEvent, useState } from "react"
import type { AddMemberRequest, TeamRole } from "@/types/api"
import { ROLE_LABELS } from "@/types/api"

interface AddMemberFormProps {
    currentUserRole: TeamRole
    onSubmit: (data: AddMemberRequest) => Promise<void>
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

export function AddMemberForm({
    currentUserRole,
    onSubmit,
    onCancel,
}: AddMemberFormProps): JSX.Element {
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [role, setRole] = useState<TeamRole>("MEMBER")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const assignableRoles = getAssignableRoles(currentUserRole)

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault()
        setError("")

        if (!email.trim()) {
            setError("Email is required")
            return
        }
        if (!name.trim()) {
            setError("Name is required")
            return
        }

        setIsSubmitting(true)

        try {
            await onSubmit({
                email: email.trim(),
                name: name.trim(),
                role,
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add member")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="card w-full max-w-md">
                <div className="border-b border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900">Add Team Member</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 p-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="label">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="john@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="label">
                                Role
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
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
