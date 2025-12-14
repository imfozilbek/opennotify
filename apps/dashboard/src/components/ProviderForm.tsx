import { useState, type FormEvent, type ChangeEvent } from "react"
import {
    ProviderType,
    PROVIDER_FIELDS,
    PROVIDER_LABELS,
    PROVIDER_CHANNELS,
    type ProviderFieldConfig,
} from "@/types/api"

interface ProviderFormProps {
    onSubmit: (provider: ProviderType, credentials: Record<string, unknown>) => Promise<void>
    onCancel: () => void
}

const CHANNEL_PROVIDERS: Record<string, ProviderType[]> = {
    SMS: [ProviderType.ESKIZ, ProviderType.PLAYMOBILE, ProviderType.GETSMS],
    Telegram: [ProviderType.TELEGRAM_BOT],
    Email: [ProviderType.SMTP, ProviderType.SENDGRID, ProviderType.MAILGUN],
    Push: [ProviderType.FCM, ProviderType.APNS],
    WhatsApp: [ProviderType.WHATSAPP_BUSINESS],
}

export function ProviderForm({ onSubmit, onCancel }: ProviderFormProps): JSX.Element {
    const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(null)
    const [credentials, setCredentials] = useState<Record<string, unknown>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    function handleProviderSelect(provider: ProviderType): void {
        setSelectedProvider(provider)
        setCredentials({})
        setError("")
    }

    function handleFieldChange(
        field: ProviderFieldConfig,
        e: ChangeEvent<HTMLInputElement>,
    ): void {
        const value = field.type === "checkbox"
            ? e.target.checked
            : field.type === "number"
                ? Number(e.target.value)
                : e.target.value

        setCredentials((prev) => ({ ...prev, [field.name]: value }))
    }

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault()
        if (!selectedProvider) {
            return
        }

        const fields = PROVIDER_FIELDS[selectedProvider]
        const missingRequired = fields
            .filter((f) => f.required)
            .find((f) => !credentials[f.name])

        if (missingRequired) {
            setError(`${missingRequired.label} is required`)
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            await onSubmit(selectedProvider, credentials)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to connect provider")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="card max-h-[90vh] w-full max-w-lg overflow-auto">
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Connect Provider</h2>
                        <button
                            onClick={onCancel}
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
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
                </div>

                {!selectedProvider ? (
                    <div className="p-6">
                        <p className="mb-4 text-sm text-gray-600">
                            Select a provider to connect:
                        </p>
                        <div className="space-y-4">
                            {Object.entries(CHANNEL_PROVIDERS).map(([channel, providers]) => (
                                <div key={channel}>
                                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                                        {channel}
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {providers.map((provider) => (
                                            <button
                                                key={provider}
                                                onClick={() => handleProviderSelect(provider)}
                                                className="rounded-lg border border-gray-200 p-3 text-left hover:border-primary-300 hover:bg-primary-50"
                                            >
                                                <p className="font-medium text-gray-900">
                                                    {PROVIDER_LABELS[provider]}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {PROVIDER_CHANNELS[provider]}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6">
                        <button
                            type="button"
                            onClick={() => setSelectedProvider(null)}
                            className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900"
                        >
                            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                            Back to providers
                        </button>

                        <h3 className="mb-4 text-lg font-medium text-gray-900">
                            {PROVIDER_LABELS[selectedProvider]}
                        </h3>

                        <div className="space-y-4">
                            {PROVIDER_FIELDS[selectedProvider].map((field) => (
                                <div key={field.name}>
                                    <label htmlFor={field.name} className="label">
                                        {field.label}
                                        {field.required && <span className="text-red-500"> *</span>}
                                    </label>
                                    {field.type === "checkbox" ? (
                                        <label className="flex items-center">
                                            <input
                                                id={field.name}
                                                type="checkbox"
                                                checked={Boolean(credentials[field.name])}
                                                onChange={(e) => handleFieldChange(field, e)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">
                                                {field.placeholder ?? field.label}
                                            </span>
                                        </label>
                                    ) : (
                                        <input
                                            id={field.name}
                                            type={field.type}
                                            value={String(credentials[field.name] ?? "")}
                                            onChange={(e) => handleFieldChange(field, e)}
                                            placeholder={field.placeholder}
                                            className="input"
                                            disabled={isSubmitting}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isSubmitting}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="btn-primary">
                                {isSubmitting ? "Connecting..." : "Connect Provider"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
