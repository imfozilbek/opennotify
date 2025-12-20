import { useState } from "react"
import { StrategyBadge } from "./StrategyBadge"
import {
    CHANNEL_LABELS,
    MESSAGE_TYPE_COLORS,
    MESSAGE_TYPE_LABELS,
} from "@/types/api"
import type { RoutingRule } from "@/types/api"

interface RoutingRuleCardProps {
    rule: RoutingRule
    onEdit?: (rule: RoutingRule) => void
    onDelete?: (ruleId: string) => Promise<void>
    onToggle?: (ruleId: string, enabled: boolean) => Promise<void>
}

const messageTypeColorClasses: Record<string, string> = {
    purple: "bg-purple-100 text-purple-800",
    pink: "bg-pink-100 text-pink-800",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
}

export function RoutingRuleCard({
    rule,
    onEdit,
    onDelete,
    onToggle,
}: RoutingRuleCardProps): JSX.Element {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isToggling, setIsToggling] = useState(false)

    const handleDelete = async (): Promise<void> => {
        if (!onDelete) {
            return
        }
        setIsDeleting(true)
        try {
            await onDelete(rule.id)
        } finally {
            setIsDeleting(false)
            setShowDeleteConfirm(false)
        }
    }

    const handleToggle = async (): Promise<void> => {
        if (!onToggle || rule.isSystemDefault) {
            return
        }
        setIsToggling(true)
        try {
            await onToggle(rule.id, !rule.enabled)
        } finally {
            setIsToggling(false)
        }
    }

    const renderConditionsSummary = (): JSX.Element => {
        const parts: JSX.Element[] = []

        // Message types
        if (rule.conditions.messageTypes && rule.conditions.messageTypes.length > 0) {
            parts.push(
                <div key="types" className="flex flex-wrap items-center gap-1">
                    <span className="text-xs text-gray-500">Types:</span>
                    {rule.conditions.messageTypes.map((type) => (
                        <span
                            key={type}
                            className={`rounded px-1.5 py-0.5 text-xs font-medium ${messageTypeColorClasses[MESSAGE_TYPE_COLORS[type]]}`}
                        >
                            {MESSAGE_TYPE_LABELS[type]}
                        </span>
                    ))}
                </div>,
            )
        }

        // Channels
        if (rule.strategy.type === "channel_preference" && rule.strategy.channels) {
            parts.push(
                <div key="channels" className="flex items-center gap-1 text-xs text-gray-600">
                    <span className="text-gray-500">Channels:</span>
                    {rule.strategy.channels.map((ch, i) => (
                        <span key={ch}>
                            {CHANNEL_LABELS[ch]}
                            {i < (rule.strategy.channels?.length ?? 0) - 1 && (
                                <span className="mx-0.5 text-gray-400">&rarr;</span>
                            )}
                        </span>
                    ))}
                </div>,
            )
        }

        // Allowed channels
        if (rule.conditions.allowedChannels && rule.conditions.allowedChannels.length > 0) {
            parts.push(
                <div key="allowed" className="text-xs text-gray-600">
                    <span className="text-gray-500">Only:</span>{" "}
                    {rule.conditions.allowedChannels.map((c) => CHANNEL_LABELS[c]).join(", ")}
                </div>,
            )
        }

        // Excluded channels
        if (rule.conditions.excludedChannels && rule.conditions.excludedChannels.length > 0) {
            parts.push(
                <div key="excluded" className="text-xs text-gray-600">
                    <span className="text-gray-500">Exclude:</span>{" "}
                    {rule.conditions.excludedChannels.map((c) => CHANNEL_LABELS[c]).join(", ")}
                </div>,
            )
        }

        // Time windows
        if (rule.conditions.activeTimeWindow) {
            const tw = rule.conditions.activeTimeWindow
            parts.push(
                <div key="active" className="text-xs text-gray-600">
                    <span className="text-gray-500">Active:</span> {tw.start} - {tw.end} (
                    {tw.timezone})
                </div>,
            )
        }

        if (rule.conditions.quietHours) {
            const qh = rule.conditions.quietHours
            parts.push(
                <div key="quiet" className="text-xs text-gray-600">
                    <span className="text-gray-500">Quiet hours:</span> {qh.start} - {qh.end} (
                    {qh.timezone})
                </div>,
            )
        }

        if (parts.length === 0) {
            parts.push(
                <div key="all" className="text-xs text-gray-500">
                    Matches all notifications
                </div>,
            )
        }

        return <div className="mt-2 space-y-1">{parts}</div>
    }

    return (
        <div
            className={`card p-4 ${!rule.enabled && !rule.isSystemDefault ? "opacity-60" : ""}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Header row */}
                    <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{rule.name}</h3>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                            Priority: {rule.priority}
                        </span>
                        {rule.isSystemDefault && (
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                                System Default
                            </span>
                        )}
                        {!rule.enabled && !rule.isSystemDefault && (
                            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                                Disabled
                            </span>
                        )}
                    </div>

                    {/* Strategy and max attempts */}
                    <div className="mt-2 flex items-center gap-3">
                        <StrategyBadge strategy={rule.strategy.type} />
                        <span className="text-xs text-gray-500">
                            Max {rule.maxAttempts} attempt{rule.maxAttempts > 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* Conditions summary */}
                    {renderConditionsSummary()}
                </div>

                {/* Actions */}
                {!rule.isSystemDefault && (
                    <div className="ml-4 flex items-center gap-2">
                        {/* Toggle switch */}
                        {onToggle && (
                            <button
                                type="button"
                                onClick={() => void handleToggle()}
                                disabled={isToggling}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    rule.enabled ? "bg-blue-600" : "bg-gray-200"
                                } ${isToggling ? "cursor-wait opacity-50" : "cursor-pointer"}`}
                                title={rule.enabled ? "Disable rule" : "Enable rule"}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                                        rule.enabled ? "translate-x-5" : "translate-x-0"
                                    }`}
                                />
                            </button>
                        )}

                        {/* Edit button */}
                        {onEdit && (
                            <button
                                type="button"
                                onClick={() => onEdit(rule)}
                                className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                title="Edit rule"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            </button>
                        )}

                        {/* Delete button */}
                        {onDelete && (
                            <>
                                {showDeleteConfirm ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => void handleDelete()}
                                            disabled={isDeleting}
                                            className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {isDeleting ? "..." : "Confirm"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                        title="Delete rule"
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
