import { useState } from "react"
import { ChannelSelector } from "./ChannelSelector"
import { TimeWindowInput } from "./TimeWindowInput"
import {
    MESSAGE_TYPE_LABELS,
    RETRYABLE_ERROR_LABELS,
    ROUTING_STRATEGY_LABELS,
} from "@/types/api"
import type {
    ChannelType,
    CreateRoutingRuleRequest,
    MessageType,
    RetryableErrorType,
    RoutingRule,
    RoutingStrategyType,
    TimeWindow,
    UpdateRoutingRuleRequest,
} from "@/types/api"

interface RoutingRuleFormPropsCreate {
    rule?: undefined
    onSubmit: (data: CreateRoutingRuleRequest) => Promise<void>
    onCancel: () => void
}

interface RoutingRuleFormPropsEdit {
    rule: RoutingRule
    onSubmit: (data: UpdateRoutingRuleRequest) => Promise<void>
    onCancel: () => void
}

type RoutingRuleFormProps = RoutingRuleFormPropsCreate | RoutingRuleFormPropsEdit

const ALL_MESSAGE_TYPES: MessageType[] = ["OTP", "TRANSACTIONAL", "MARKETING", "ALERT"]
const ALL_STRATEGIES: RoutingStrategyType[] = [
    "cost_optimized",
    "reliability_first",
    "recipient_preference",
    "channel_preference",
]
const ALL_RETRYABLE_ERRORS: RetryableErrorType[] = [
    "timeout",
    "rate_limit",
    "server_error",
    "connection_error",
]

export function RoutingRuleForm({ rule, onSubmit, onCancel }: RoutingRuleFormProps): JSX.Element {
    const isEditing = !!rule

    // Form state
    const [name, setName] = useState(rule?.name ?? "")
    const [priority, setPriority] = useState(rule?.priority ?? 100)
    const [enabled, setEnabled] = useState(rule?.enabled ?? true)
    const [maxAttempts, setMaxAttempts] = useState(rule?.maxAttempts ?? 2)

    // Conditions
    const [messageTypes, setMessageTypes] = useState<MessageType[]>(
        rule?.conditions.messageTypes ?? [],
    )
    const [allowedChannels, setAllowedChannels] = useState<ChannelType[]>(
        rule?.conditions.allowedChannels ?? [],
    )
    const [excludedChannels, setExcludedChannels] = useState<ChannelType[]>(
        rule?.conditions.excludedChannels ?? [],
    )
    const [activeTimeWindow, setActiveTimeWindow] = useState<TimeWindow | undefined>(
        rule?.conditions.activeTimeWindow,
    )
    const [quietHours, setQuietHours] = useState<TimeWindow | undefined>(
        rule?.conditions.quietHours,
    )

    // Strategy
    const [strategyType, setStrategyType] = useState<RoutingStrategyType>(
        rule?.strategy.type ?? "cost_optimized",
    )
    const [channelOrder, setChannelOrder] = useState<ChannelType[]>(
        rule?.strategy.channels ?? ["TELEGRAM", "SMS"],
    )

    // Retry policy
    const [useRetryPolicy, setUseRetryPolicy] = useState(!!rule?.retryPolicy)
    const [maxRetries, setMaxRetries] = useState(rule?.retryPolicy?.maxRetries ?? 1)
    const [baseDelayMs, setBaseDelayMs] = useState(rule?.retryPolicy?.baseDelayMs ?? 1000)
    const [maxDelayMs, setMaxDelayMs] = useState(rule?.retryPolicy?.maxDelayMs ?? 10000)
    const [retryableErrors, setRetryableErrors] = useState<RetryableErrorType[]>(
        rule?.retryPolicy?.retryableErrors ?? ["timeout", "server_error"],
    )

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setError("")

        // Validation
        if (!name.trim()) {
            setError("Name is required")
            return
        }
        if (priority < 1 || priority > 999) {
            setError("Priority must be between 1 and 999")
            return
        }
        if (maxAttempts < 1 || maxAttempts > 10) {
            setError("Max attempts must be between 1 and 10")
            return
        }
        if (strategyType === "channel_preference" && channelOrder.length === 0) {
            setError("Select at least one channel for channel preference strategy")
            return
        }

        const baseData = {
            name: name.trim(),
            priority,
            enabled,
            maxAttempts,
            conditions: {
                messageTypes: messageTypes.length > 0 ? messageTypes : undefined,
                allowedChannels: allowedChannels.length > 0 ? allowedChannels : undefined,
                excludedChannels: excludedChannels.length > 0 ? excludedChannels : undefined,
                activeTimeWindow,
                quietHours,
            },
            strategy: {
                type: strategyType,
                channels: strategyType === "channel_preference" ? channelOrder : undefined,
            },
            retryPolicy: useRetryPolicy
                ? {
                      maxRetries,
                      baseDelayMs,
                      maxDelayMs,
                      retryableErrors: retryableErrors.length > 0 ? retryableErrors : undefined,
                  }
                : undefined,
        }

        setIsSubmitting(true)
        try {
            if (isEditing) {
                await (onSubmit as (data: UpdateRoutingRuleRequest) => Promise<void>)(baseData)
            } else {
                await (onSubmit as (data: CreateRoutingRuleRequest) => Promise<void>)(
                    baseData as CreateRoutingRuleRequest,
                )
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save rule")
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleMessageType = (type: MessageType): void => {
        if (messageTypes.includes(type)) {
            setMessageTypes(messageTypes.filter((t) => t !== type))
        } else {
            setMessageTypes([...messageTypes, type])
        }
    }

    const toggleRetryableError = (errorType: RetryableErrorType): void => {
        if (retryableErrors.includes(errorType)) {
            setRetryableErrors(retryableErrors.filter((e) => e !== errorType))
        } else {
            setRetryableErrors([...retryableErrors, errorType])
        }
    }

    const moveChannel = (index: number, direction: "up" | "down"): void => {
        const newOrder = [...channelOrder]
        const newIndex = direction === "up" ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= newOrder.length) {
            return
        }
        ;[newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]]
        setChannelOrder(newOrder)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isEditing ? "Edit Routing Rule" : "Create Routing Rule"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Configure when and how to route notifications
                    </p>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)}>
                    <div className="space-y-6 p-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Basic Information</h3>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="label">Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input w-full"
                                        placeholder="e.g., VIP Customer Priority"
                                    />
                                </div>
                                <div>
                                    <label className="label">Priority (1-999)</label>
                                    <input
                                        type="number"
                                        value={priority}
                                        onChange={(e) => setPriority(Number(e.target.value))}
                                        min={1}
                                        max={999}
                                        className="input w-full"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Lower number = higher priority
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="label">Enabled</label>
                                <button
                                    type="button"
                                    onClick={() => setEnabled(!enabled)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                        enabled ? "bg-blue-600" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                                            enabled ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Conditions */}
                        <div className="space-y-4 border-t border-gray-200 pt-6">
                            <h3 className="font-medium text-gray-900">Conditions</h3>
                            <p className="text-sm text-gray-500">
                                Define when this rule should apply. Leave empty to match all
                                notifications.
                            </p>

                            {/* Message Types */}
                            <div>
                                <label className="label mb-2">Message Types</label>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_MESSAGE_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleMessageType(type)}
                                            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                                                messageTypes.includes(type)
                                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            {MESSAGE_TYPE_LABELS[type]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Allowed Channels */}
                            <ChannelSelector
                                label="Allowed Channels (whitelist)"
                                selected={allowedChannels}
                                onChange={setAllowedChannels}
                            />

                            {/* Excluded Channels */}
                            <ChannelSelector
                                label="Excluded Channels (blacklist)"
                                selected={excludedChannels}
                                onChange={setExcludedChannels}
                            />

                            {/* Time Windows */}
                            <TimeWindowInput
                                label="Active Time Window"
                                value={activeTimeWindow}
                                onChange={setActiveTimeWindow}
                            />

                            <TimeWindowInput
                                label="Quiet Hours"
                                value={quietHours}
                                onChange={setQuietHours}
                            />
                        </div>

                        {/* Strategy */}
                        <div className="space-y-4 border-t border-gray-200 pt-6">
                            <h3 className="font-medium text-gray-900">Routing Strategy</h3>

                            <div className="space-y-2">
                                {ALL_STRATEGIES.map((strategy) => (
                                    <label
                                        key={strategy}
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                                            strategyType === strategy
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="strategy"
                                            checked={strategyType === strategy}
                                            onChange={() => setStrategyType(strategy)}
                                            className="mt-0.5"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {ROUTING_STRATEGY_LABELS[strategy]}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {strategy === "cost_optimized" &&
                                                    "Choose the cheapest available channel"}
                                                {strategy === "reliability_first" &&
                                                    "Prefer reliable channels (SMS > Telegram)"}
                                                {strategy === "recipient_preference" &&
                                                    "Use recipient's preferred channel"}
                                                {strategy === "channel_preference" &&
                                                    "Use custom channel order"}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Channel Order for channel_preference */}
                            {strategyType === "channel_preference" && (
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <label className="label mb-2">Channel Priority Order</label>
                                    <div className="space-y-2">
                                        {channelOrder.map((channel, index) => (
                                            <div
                                                key={channel}
                                                className="flex items-center gap-2 rounded bg-white p-2"
                                            >
                                                <span className="w-6 text-center text-sm font-medium text-gray-400">
                                                    {index + 1}
                                                </span>
                                                <span className="flex-1 text-sm font-medium">
                                                    {channel}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => moveChannel(index, "up")}
                                                    disabled={index === 0}
                                                    className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
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
                                                            d="M5 15l7-7 7 7"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveChannel(index, "down")}
                                                    disabled={index === channelOrder.length - 1}
                                                    className="rounded p-1 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
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
                                                            d="M19 9l-7 7-7-7"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setChannelOrder(
                                                            channelOrder.filter(
                                                                (c) => c !== channel,
                                                            ),
                                                        )
                                                    }
                                                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
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
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add channel */}
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {(["SMS", "TELEGRAM", "EMAIL", "PUSH", "WHATSAPP"] as ChannelType[])
                                            .filter((c) => !channelOrder.includes(c))
                                            .map((channel) => (
                                                <button
                                                    key={channel}
                                                    type="button"
                                                    onClick={() =>
                                                        setChannelOrder([...channelOrder, channel])
                                                    }
                                                    className="rounded border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600"
                                                >
                                                    + {channel}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Max Attempts */}
                            <div>
                                <label className="label">Max Fallback Attempts (1-10)</label>
                                <input
                                    type="number"
                                    value={maxAttempts}
                                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                                    min={1}
                                    max={10}
                                    className="input w-32"
                                />
                            </div>
                        </div>

                        {/* Retry Policy */}
                        <div className="space-y-4 border-t border-gray-200 pt-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">Retry Policy</h3>
                                <button
                                    type="button"
                                    onClick={() => setUseRetryPolicy(!useRetryPolicy)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                        useRetryPolicy ? "bg-blue-600" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                                            useRetryPolicy ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {useRetryPolicy && (
                                <div className="space-y-4 rounded-lg bg-gray-50 p-4">
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <label className="label">Max Retries</label>
                                            <input
                                                type="number"
                                                value={maxRetries}
                                                onChange={(e) =>
                                                    setMaxRetries(Number(e.target.value))
                                                }
                                                min={0}
                                                max={10}
                                                className="input w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Base Delay (ms)</label>
                                            <input
                                                type="number"
                                                value={baseDelayMs}
                                                onChange={(e) =>
                                                    setBaseDelayMs(Number(e.target.value))
                                                }
                                                min={100}
                                                className="input w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Max Delay (ms)</label>
                                            <input
                                                type="number"
                                                value={maxDelayMs}
                                                onChange={(e) =>
                                                    setMaxDelayMs(Number(e.target.value))
                                                }
                                                min={100}
                                                className="input w-full"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label mb-2">Retryable Errors</label>
                                        <div className="flex flex-wrap gap-2">
                                            {ALL_RETRYABLE_ERRORS.map((errType) => (
                                                <button
                                                    key={errType}
                                                    type="button"
                                                    onClick={() => toggleRetryableError(errType)}
                                                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                                                        retryableErrors.includes(errType)
                                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {RETRYABLE_ERROR_LABELS[errType]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
                        <button type="button" onClick={onCancel} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting
                                ? "Saving..."
                                : isEditing
                                  ? "Save Changes"
                                  : "Create Rule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
