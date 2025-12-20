import { useCallback, useEffect, useState } from "react"
import type {
    AddMemberRequest,
    AuditLog,
    Team,
    TeamMember,
    TeamRole,
} from "@/types/api"
import {
    addMember,
    getAuditLogs,
    getTeam,
    removeMember,
    updateMemberRole,
} from "@/api/teams"
import { TeamMemberCard } from "@/components/team/TeamMemberCard"
import { AddMemberForm } from "@/components/team/AddMemberForm"
import { UpdateRoleForm } from "@/components/team/UpdateRoleForm"
import { AuditLogTable } from "@/components/team/AuditLogTable"

type TabType = "members" | "audit"

export function TeamPage(): JSX.Element {
    const [team, setTeam] = useState<Team | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const [showAddMember, setShowAddMember] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)

    const [activeTab, setActiveTab] = useState<TabType>("members")

    // Audit logs state
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
    const [auditTotal, setAuditTotal] = useState(0)
    const [auditPage, setAuditPage] = useState(1)
    const [auditTotalPages, setAuditTotalPages] = useState(1)
    const [isLoadingAudit, setIsLoadingAudit] = useState(false)

    const loadTeam = useCallback(async (): Promise<void> => {
        setIsLoading(true)
        setError("")

        try {
            const response = await getTeam()
            if (response.success && response.data) {
                setTeam(response.data.team)
            } else {
                setError(response.error?.message ?? "Failed to load team")
            }
        } catch {
            setError("Failed to load team")
        } finally {
            setIsLoading(false)
        }
    }, [])

    const loadAuditLogs = useCallback(async (): Promise<void> => {
        setIsLoadingAudit(true)

        try {
            const response = await getAuditLogs({ page: auditPage, limit: 20 })
            if (response.success && response.data) {
                setAuditLogs(response.data.logs)
                setAuditTotal(response.data.total)
                setAuditTotalPages(response.data.totalPages)
            }
        } catch {
            // Silently fail for audit logs
        } finally {
            setIsLoadingAudit(false)
        }
    }, [auditPage])

    useEffect(() => {
        void loadTeam()
    }, [loadTeam])

    useEffect(() => {
        if (activeTab === "audit") {
            void loadAuditLogs()
        }
    }, [activeTab, loadAuditLogs])

    async function handleAddMember(data: AddMemberRequest): Promise<void> {
        const response = await addMember(data)
        if (response.success) {
            setShowAddMember(false)
            await loadTeam()
        } else {
            throw new Error(response.error?.message ?? "Failed to add member")
        }
    }

    async function handleUpdateRole(userId: string, role: TeamRole): Promise<void> {
        const response = await updateMemberRole(userId, role)
        if (response.success) {
            setEditingMember(null)
            await loadTeam()
        } else {
            throw new Error(response.error?.message ?? "Failed to update role")
        }
    }

    async function handleRemoveMember(): Promise<void> {
        if (!memberToRemove) {
            return
        }

        const response = await removeMember(memberToRemove.userId)
        if (response.success) {
            setMemberToRemove(null)
            await loadTeam()
        } else {
            setError(response.error?.message ?? "Failed to remove member")
        }
    }

    // Get current user's role (first member is usually owner, but we need to check)
    const currentUserRole: TeamRole = team?.members[0]?.role ?? "VIEWER"
    const canManageTeam = currentUserRole === "OWNER" || currentUserRole === "ADMIN"

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading team...</div>
            </div>
        )
    }

    if (error && !team) {
        return (
            <div className="rounded-lg bg-red-50 p-6">
                <p className="text-red-800">{error}</p>
                <button onClick={() => void loadTeam()} className="mt-4 btn-primary">
                    Retry
                </button>
            </div>
        )
    }

    if (!team) {
        return (
            <div className="text-center py-12">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                <p className="mt-2 text-gray-500">No team found</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Team</h1>
                    <p className="text-gray-500">
                        {team.name} • {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
                    </p>
                </div>
                {canManageTeam && (
                    <button onClick={() => setShowAddMember(true)} className="btn-primary">
                        <svg
                            className="mr-2 h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                        </svg>
                        Add Member
                    </button>
                )}
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-8">
                    <button
                        onClick={() => setActiveTab("members")}
                        className={`border-b-2 pb-4 text-sm font-medium ${
                            activeTab === "members"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        }`}
                    >
                        Members ({team.memberCount})
                    </button>
                    <button
                        onClick={() => setActiveTab("audit")}
                        className={`border-b-2 pb-4 text-sm font-medium ${
                            activeTab === "audit"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        }`}
                    >
                        Audit Logs
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === "members" && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {team.members.map((member) => (
                        <TeamMemberCard
                            key={member.userId}
                            member={member}
                            currentUserRole={currentUserRole}
                            onEditRole={setEditingMember}
                            onRemove={setMemberToRemove}
                        />
                    ))}
                </div>
            )}

            {activeTab === "audit" && (
                <div className="card p-6">
                    <AuditLogTable
                        logs={auditLogs}
                        total={auditTotal}
                        page={auditPage}
                        totalPages={auditTotalPages}
                        isLoading={isLoadingAudit}
                        onPageChange={setAuditPage}
                    />
                </div>
            )}

            {/* Modals */}
            {showAddMember && (
                <AddMemberForm
                    currentUserRole={currentUserRole}
                    onSubmit={handleAddMember}
                    onCancel={() => setShowAddMember(false)}
                />
            )}

            {editingMember && (
                <UpdateRoleForm
                    member={editingMember}
                    currentUserRole={currentUserRole}
                    onSubmit={handleUpdateRole}
                    onCancel={() => setEditingMember(null)}
                />
            )}

            {memberToRemove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="card w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900">Remove Member</h3>
                        <p className="mt-2 text-gray-600">
                            Are you sure you want to remove{" "}
                            <span className="font-medium">{memberToRemove.name}</span> from the
                            team? This action cannot be undone.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setMemberToRemove(null)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => void handleRemoveMember()}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
