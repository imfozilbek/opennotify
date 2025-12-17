import { type FormEvent, useEffect, useState } from "react"
import { sendNotification } from "@/api/notifications"
import { listTemplates, renderTemplate } from "@/api/templates"
import { listProviders } from "@/api/providers"
import type { ChannelType, ConnectedProvider, ProviderType, Template } from "@/types/api"
import { CHANNEL_LABELS, PROVIDER_CHANNELS, PROVIDER_LABELS } from "@/types/api"

interface SendNotificationModalProps {
    onClose: () => void
    onSuccess: () => void
}

type Mode = "direct" | "template"

const CHANNELS: ChannelType[] = ["SMS", "TELEGRAM", "EMAIL", "PUSH", "WHATSAPP"]

export function SendNotificationModal({
    onClose,
    onSuccess,
}: SendNotificationModalProps): JSX.Element {
    const [mode, setMode] = useState<Mode>("direct")

    // Direct mode state
    const [channel, setChannel] = useState<ChannelType>("SMS")
    const [provider, setProvider] = useState<ProviderType | "">("")
    const [recipient, setRecipient] = useState("")
    const [message, setMessage] = useState("")
    const [subject, setSubject] = useState("")

    // Template mode state
    const [templates, setTemplates] = useState<Template[]>([])
    const [selectedTemplateId, setSelectedTemplateId] = useState("")
    const [variableValues, setVariableValues] = useState<Record<string, string>>({})
    const [preview, setPreview] = useState<{ body: string; subject?: string } | null>(null)

    // Providers
    const [providers, setProviders] = useState<ConnectedProvider[]>([])

    // UI state
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    // Load providers and templates
    useEffect(() => {
        async function loadData(): Promise<void> {
            try {
                const [providersRes, templatesRes] = await Promise.all([
                    listProviders(),
                    listTemplates(1, 100, "ACTIVE"),
                ])

                if (providersRes.success && providersRes.data) {
                    setProviders(providersRes.data.providers)
                }

                if (templatesRes.success && templatesRes.data) {
                    setTemplates(templatesRes.data.templates)
                }
            } catch {
                setError("Failed to load data")
            } finally {
                setIsLoading(false)
            }
        }

        void loadData()
    }, [])

    // Filter providers by channel
    const availableProviders = providers.filter(
        (p) => PROVIDER_CHANNELS[p.provider] === CHANNEL_LABELS[channel],
    )

    // Get selected template
    const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

    // Update preview when template or variables change
    useEffect(() => {
        async function updatePreview(): Promise<void> {
            if (!selectedTemplateId) {
                setPreview(null)
                return
            }

            try {
                const response = await renderTemplate({
                    templateId: selectedTemplateId,
                    variables: variableValues,
                })

                if (response.success && response.data) {
                    setPreview({
                        body: response.data.body,
                        subject: response.data.subject,
                    })
                }
            } catch {
                // Ignore preview errors
            }
        }

        void updatePreview()
    }, [selectedTemplateId, variableValues])

    // Handle template selection
    function handleTemplateSelect(templateId: string): void {
        setSelectedTemplateId(templateId)
        const template = templates.find((t) => t.id === templateId)
        if (template) {
            // Initialize variable values with defaults
            const values: Record<string, string> = {}
            for (const variable of template.variables) {
                values[variable.name] = variable.defaultValue ?? ""
            }
            setVariableValues(values)

            // Set channel from template
            setChannel(template.channel)
        }
    }

    function getRecipientLabel(): string {
        switch (channel) {
            case "SMS":
            case "WHATSAPP":
                return "Phone Number"
            case "EMAIL":
                return "Email Address"
            case "TELEGRAM":
                return "Telegram Chat ID"
            case "PUSH":
                return "Device Token"
            default:
                return "Recipient"
        }
    }

    function getRecipientPlaceholder(): string {
        switch (channel) {
            case "SMS":
            case "WHATSAPP":
                return "+998901234567"
            case "EMAIL":
                return "user@example.com"
            case "TELEGRAM":
                return "123456789"
            case "PUSH":
                return "device_token_..."
            default:
                return ""
        }
    }

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault()
        setError("")

        // Validation
        if (!provider) {
            setError("Please select a provider")
            return
        }

        if (!recipient) {
            setError("Please enter a recipient")
            return
        }

        if (mode === "direct" && !message) {
            setError("Please enter a message")
            return
        }

        if (mode === "template" && !selectedTemplateId) {
            setError("Please select a template")
            return
        }

        setIsSubmitting(true)

        try {
            const recipientData: Record<string, string> = {}
            switch (channel) {
                case "SMS":
                case "WHATSAPP":
                    recipientData.phone = recipient
                    break
                case "EMAIL":
                    recipientData.email = recipient
                    break
                case "TELEGRAM":
                    recipientData.telegramChatId = recipient
                    break
                case "PUSH":
                    recipientData.deviceToken = recipient
                    break
            }

            const payload =
                mode === "template"
                    ? {
                          text: preview?.body ?? "",
                          subject: preview?.subject,
                          templateId: selectedTemplateId,
                          variables: variableValues,
                      }
                    : {
                          text: message,
                          subject: channel === "EMAIL" ? subject : undefined,
                      }

            const response = await sendNotification({
                provider: provider,
                recipient: recipientData,
                payload,
            })

            if (response.success) {
                onSuccess()
            } else {
                throw new Error(response.error?.message ?? "Failed to send notification")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send notification")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="card p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="card max-h-[90vh] w-full max-w-xl overflow-auto">
                <div className="border-b border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900">Send Notification</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 p-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Mode Selector */}
                        <div className="flex rounded-lg border border-gray-200 p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("direct")
                                }}
                                className={`flex-1 rounded-md py-2 text-sm font-medium ${
                                    mode === "direct"
                                        ? "bg-primary-600 text-white"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                Direct Message
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("template")
                                }}
                                className={`flex-1 rounded-md py-2 text-sm font-medium ${
                                    mode === "template"
                                        ? "bg-primary-600 text-white"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                Use Template
                            </button>
                        </div>

                        {/* Template Selection (Template Mode) */}
                        {mode === "template" && (
                            <div>
                                <label htmlFor="template" className="label">
                                    Template
                                </label>
                                <select
                                    id="template"
                                    value={selectedTemplateId}
                                    onChange={(e) => {
                                        handleTemplateSelect(e.target.value)
                                    }}
                                    className="input"
                                >
                                    <option value="">Select a template...</option>
                                    {templates.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name} ({CHANNEL_LABELS[t.channel]})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Channel Selection (Direct Mode only) */}
                        {mode === "direct" && (
                            <div>
                                <label htmlFor="channel" className="label">
                                    Channel
                                </label>
                                <select
                                    id="channel"
                                    value={channel}
                                    onChange={(e) => {
                                        setChannel(e.target.value as ChannelType)
                                        setProvider("")
                                    }}
                                    className="input"
                                >
                                    {CHANNELS.map((ch) => (
                                        <option key={ch} value={ch}>
                                            {CHANNEL_LABELS[ch]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Provider Selection */}
                        <div>
                            <label htmlFor="provider" className="label">
                                Provider
                            </label>
                            <select
                                id="provider"
                                value={provider}
                                onChange={(e) => {
                                    setProvider(e.target.value as ProviderType)
                                }}
                                className="input"
                            >
                                <option value="">Select a provider...</option>
                                {availableProviders.map((p) => (
                                    <option key={p.id} value={p.provider}>
                                        {PROVIDER_LABELS[p.provider]}
                                    </option>
                                ))}
                            </select>
                            {availableProviders.length === 0 && (
                                <p className="mt-1 text-xs text-amber-600">
                                    No providers connected for this channel
                                </p>
                            )}
                        </div>

                        {/* Recipient */}
                        <div>
                            <label htmlFor="recipient" className="label">
                                {getRecipientLabel()}
                            </label>
                            <input
                                id="recipient"
                                type="text"
                                value={recipient}
                                onChange={(e) => {
                                    setRecipient(e.target.value)
                                }}
                                className="input"
                                placeholder={getRecipientPlaceholder()}
                            />
                        </div>

                        {/* Message (Direct Mode) */}
                        {mode === "direct" && (
                            <>
                                {channel === "EMAIL" && (
                                    <div>
                                        <label htmlFor="subject" className="label">
                                            Subject
                                        </label>
                                        <input
                                            id="subject"
                                            type="text"
                                            value={subject}
                                            onChange={(e) => {
                                                setSubject(e.target.value)
                                            }}
                                            className="input"
                                            placeholder="Email subject"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="message" className="label">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        value={message}
                                        onChange={(e) => {
                                            setMessage(e.target.value)
                                        }}
                                        className="input min-h-[100px]"
                                        placeholder="Enter your message..."
                                    />
                                </div>
                            </>
                        )}

                        {/* Variable Inputs (Template Mode) */}
                        {mode === "template" &&
                            selectedTemplate &&
                            selectedTemplate.variables.length > 0 && (
                                <div className="space-y-4">
                                    <label className="label">Template Variables</label>
                                    {selectedTemplate.variables.map((variable) => (
                                        <div key={variable.name}>
                                            <label
                                                htmlFor={`var-${variable.name}`}
                                                className="text-sm font-medium text-gray-700"
                                            >
                                                {variable.name}
                                                {variable.required && (
                                                    <span className="ml-1 text-red-500">*</span>
                                                )}
                                            </label>
                                            <input
                                                id={`var-${variable.name}`}
                                                type="text"
                                                value={variableValues[variable.name] ?? ""}
                                                onChange={(e) => {
                                                    setVariableValues((prev) => ({
                                                        ...prev,
                                                        [variable.name]: e.target.value,
                                                    }))
                                                }}
                                                className="input mt-1"
                                                placeholder={
                                                    variable.description ?? variable.defaultValue
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                        {/* Preview (Template Mode) */}
                        {mode === "template" && preview && (
                            <div>
                                <label className="label">Preview</label>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    {preview.subject && (
                                        <p className="mb-2 font-medium text-gray-900">
                                            Subject: {preview.subject}
                                        </p>
                                    )}
                                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                                        {preview.body}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !provider || !recipient}
                            className="btn-primary"
                        >
                            {isSubmitting ? "Sending..." : "Send Notification"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
