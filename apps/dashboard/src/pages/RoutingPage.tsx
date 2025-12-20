import { useCallback, useEffect, useState } from "react"
import { RoutingRuleCard } from "@/components/routing/RoutingRuleCard"
import { RoutingRuleForm } from "@/components/routing/RoutingRuleForm"
import {
    createRoutingRule,
    deleteRoutingRule,
    listRoutingRules,
    toggleRoutingRule,
    updateRoutingRule,
} from "@/api/routingRules"
import type { CreateRoutingRuleRequest, RoutingRule, UpdateRoutingRuleRequest } from "@/types/api"

export function RoutingPage(): JSX.Element {
    const [rules, setRules] = useState<RoutingRule[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingRule, setEditingRule] = useState<RoutingRule | null>(null)

    const merchantRules = rules.filter((r) => !r.isSystemDefault)
    const systemRules = rules.filter((r) => r.isSystemDefault)

    const loadRules = useCallback(async (): Promise<void> => {
        setIsLoading(true)
        setError("")
        try {
            const response = await listRoutingRules(true)
            if (response.success && response.data) {
                setRules(response.data.rules)
            } else {
                setError(response.error?.message ?? "Failed to load routing rules")
            }
        } catch {
            setError("Failed to load routing rules")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadRules()
    }, [loadRules])

    const handleCreate = async (data: CreateRoutingRuleRequest): Promise<void> => {
        const response = await createRoutingRule(data)
        if (response.success) {
            setShowCreateForm(false)
            await loadRules()
        } else {
            throw new Error(response.error?.message ?? "Failed to create rule")
        }
    }

    const handleUpdate = async (data: UpdateRoutingRuleRequest): Promise<void> => {
        if (!editingRule) {
            return
        }
        const response = await updateRoutingRule(editingRule.id, data)
        if (response.success) {
            setEditingRule(null)
            await loadRules()
        } else {
            throw new Error(response.error?.message ?? "Failed to update rule")
        }
    }

    const handleDelete = async (ruleId: string): Promise<void> => {
        const response = await deleteRoutingRule(ruleId)
        if (response.success) {
            await loadRules()
        } else {
            setError(response.error?.message ?? "Failed to delete rule")
        }
    }

    const handleToggle = async (ruleId: string, enabled: boolean): Promise<void> => {
        const response = await toggleRoutingRule(ruleId, enabled)
        if (response.success) {
            await loadRules()
        } else {
            setError(response.error?.message ?? "Failed to toggle rule")
        }
    }

    if (isLoading) {
        return (
            <div>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Routing Rules</h1>
                    <p className="text-gray-600">Configure smart routing for your notifications</p>
                </div>
                <div className="card p-8 text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="mt-2 text-gray-500">Loading routing rules...</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Routing Rules</h1>
                    <p className="text-gray-600">Configure smart routing for your notifications</p>
                </div>
                <button onClick={() => setShowCreateForm(true)} className="btn-primary">
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
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Create Rule
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 flex items-center justify-between rounded-lg bg-red-50 p-4 text-red-700">
                    <span>{error}</span>
                    <button
                        onClick={() => setError("")}
                        className="text-red-500 hover:text-red-700"
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
            )}

            {/* Your Rules */}
            <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Your Rules ({merchantRules.length})
                </h2>

                {merchantRules.length === 0 ? (
                    <div className="card p-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <svg
                                className="h-6 w-6 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No custom rules yet</h3>
                        <p className="mt-1 text-gray-500">
                            Create your first routing rule to customize how notifications are
                            delivered.
                        </p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="btn-primary mt-4"
                        >
                            Create Your First Rule
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {merchantRules.map((rule) => (
                            <RoutingRuleCard
                                key={rule.id}
                                rule={rule}
                                onEdit={setEditingRule}
                                onDelete={handleDelete}
                                onToggle={handleToggle}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* System Defaults */}
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                        System Defaults ({systemRules.length})
                    </h2>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Read-only
                    </span>
                </div>
                <p className="mb-4 text-sm text-gray-500">
                    These are platform-wide default rules. Your custom rules take priority over
                    system defaults.
                </p>

                <div className="space-y-3">
                    {systemRules.map((rule) => (
                        <RoutingRuleCard key={rule.id} rule={rule} />
                    ))}
                </div>
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
                <RoutingRuleForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            {/* Edit Form Modal */}
            {editingRule && (
                <RoutingRuleForm
                    rule={editingRule}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingRule(null)}
                />
            )}
        </div>
    )
}
