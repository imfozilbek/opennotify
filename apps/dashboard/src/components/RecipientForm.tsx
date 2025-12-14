import { useState, type FormEvent } from "react"
import type {
    ChannelType,
    CreateRecipientRequest,
    Recipient,
    RecipientPreferences,
    UpdateRecipientRequest,
} from "@/types/api"
import { CHANNEL_LABELS } from "@/types/api"

interface RecipientFormProps {
    initialData?: Recipient
    onSubmit: (data: CreateRecipientRequest | UpdateRecipientRequest) => Promise<void>
    onCancel: () => void
}

const CHANNELS: ChannelType[] = ["SMS", "TELEGRAM", "EMAIL", "PUSH", "WHATSAPP"]

const LANGUAGES = [
    { value: "", label: "Not set" },
    { value: "uz", label: "O'zbek" },
    { value: "ru", label: "Русский" },
    { value: "en", label: "English" },
]

const TIMEZONES = [
    { value: "Asia/Tashkent", label: "Tashkent (UTC+5)" },
    { value: "Asia/Almaty", label: "Almaty (UTC+6)" },
    { value: "Europe/Moscow", label: "Moscow (UTC+3)" },
]

export function RecipientForm({
    initialData,
    onSubmit,
    onCancel,
}: RecipientFormProps): JSX.Element {
    const [externalId, setExternalId] = useState(initialData?.externalId ?? "")
    const [phone, setPhone] = useState(initialData?.contacts.phone ?? "")
    const [email, setEmail] = useState(initialData?.contacts.email ?? "")
    const [telegramChatId, setTelegramChatId] = useState(
        initialData?.contacts.telegramChatId ?? "",
    )
    const [preferredChannel, setPreferredChannel] = useState<ChannelType | "">(
        initialData?.preferences.preferredChannel ?? "",
    )
    const [optedOutChannels, setOptedOutChannels] = useState<ChannelType[]>(
        initialData?.preferences.optedOutChannels ?? [],
    )
    const [language, setLanguage] = useState(initialData?.preferences.language ?? "")

    const [quietHoursEnabled, setQuietHoursEnabled] = useState(
        Boolean(initialData?.preferences.quietHours),
    )
    const [quietHoursStart, setQuietHoursStart] = useState(
        initialData?.preferences.quietHours?.start ?? "22:00",
    )
    const [quietHoursEnd, setQuietHoursEnd] = useState(
        initialData?.preferences.quietHours?.end ?? "08:00",
    )
    const [quietHoursTimezone, setQuietHoursTimezone] = useState(
        initialData?.preferences.quietHours?.timezone ?? "Asia/Tashkent",
    )

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    function toggleOptOut(channel: ChannelType): void {
        setOptedOutChannels((prev) =>
            prev.includes(channel)
                ? prev.filter((c) => c !== channel)
                : [...prev, channel],
        )
    }

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault()
        setError("")

        // Validation
        if (!phone && !email && !telegramChatId) {
            setError("At least one contact method is required")
            return
        }

        setIsSubmitting(true)

        try {
            const preferences: RecipientPreferences = {}
            if (preferredChannel) {
                preferences.preferredChannel = preferredChannel
            }
            if (optedOutChannels.length > 0) {
                preferences.optedOutChannels = optedOutChannels
            }
            if (language) {
                preferences.language = language
            }
            if (quietHoursEnabled) {
                preferences.quietHours = {
                    start: quietHoursStart,
                    end: quietHoursEnd,
                    timezone: quietHoursTimezone,
                }
            }

            const data: CreateRecipientRequest | UpdateRecipientRequest = {
                externalId: externalId || undefined,
                phone: phone || undefined,
                email: email || undefined,
                telegramChatId: telegramChatId || undefined,
                preferences: Object.keys(preferences).length > 0 ? preferences : undefined,
            }

            await onSubmit(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save recipient")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="card max-h-[90vh] w-full max-w-lg overflow-auto">
                <div className="border-b border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {initialData ? "Edit Recipient" : "Add Recipient"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-6 p-6">
                        {error && (
                            <div className="rounded-lg bg-red-50 p-4">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* External ID */}
                        <div>
                            <label htmlFor="externalId" className="label">
                                External ID (optional)
                            </label>
                            <input
                                id="externalId"
                                type="text"
                                value={externalId}
                                onChange={(e) => setExternalId(e.target.value)}
                                className="input"
                                placeholder="Your system's user ID"
                            />
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Contact Information</h3>

                            <div>
                                <label htmlFor="phone" className="label">
                                    Phone Number
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="input"
                                    placeholder="+998901234567"
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
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="telegramChatId" className="label">
                                    Telegram Chat ID
                                </label>
                                <input
                                    id="telegramChatId"
                                    type="text"
                                    value={telegramChatId}
                                    onChange={(e) => setTelegramChatId(e.target.value)}
                                    className="input"
                                    placeholder="123456789"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    User must start your Telegram bot first
                                </p>
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Preferences</h3>

                            <div>
                                <label htmlFor="preferredChannel" className="label">
                                    Preferred Channel
                                </label>
                                <select
                                    id="preferredChannel"
                                    value={preferredChannel}
                                    onChange={(e) =>
                                        setPreferredChannel(e.target.value as ChannelType | "")
                                    }
                                    className="input"
                                >
                                    <option value="">Not set</option>
                                    {CHANNELS.map((ch) => (
                                        <option key={ch} value={ch}>
                                            {CHANNEL_LABELS[ch]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Opted Out Channels</label>
                                <div className="flex flex-wrap gap-2">
                                    {CHANNELS.map((ch) => (
                                        <label
                                            key={ch}
                                            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                                                optedOutChannels.includes(ch)
                                                    ? "border-red-300 bg-red-50 text-red-700"
                                                    : "border-gray-200 hover:bg-gray-50"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={optedOutChannels.includes(ch)}
                                                onChange={() => toggleOptOut(ch)}
                                                className="sr-only"
                                            />
                                            {CHANNEL_LABELS[ch]}
                                            {optedOutChannels.includes(ch) && (
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
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="language" className="label">
                                    Language
                                </label>
                                <select
                                    id="language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="input"
                                >
                                    {LANGUAGES.map((lang) => (
                                        <option key={lang.value} value={lang.value}>
                                            {lang.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Quiet Hours */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={quietHoursEnabled}
                                    onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <span className="font-medium text-gray-900">Enable Quiet Hours</span>
                            </label>

                            {quietHoursEnabled && (
                                <div className="rounded-lg border border-gray-200 p-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="quietStart" className="label">
                                                Start Time
                                            </label>
                                            <input
                                                id="quietStart"
                                                type="time"
                                                value={quietHoursStart}
                                                onChange={(e) => setQuietHoursStart(e.target.value)}
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="quietEnd" className="label">
                                                End Time
                                            </label>
                                            <input
                                                id="quietEnd"
                                                type="time"
                                                value={quietHoursEnd}
                                                onChange={(e) => setQuietHoursEnd(e.target.value)}
                                                className="input"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="timezone" className="label">
                                            Timezone
                                        </label>
                                        <select
                                            id="timezone"
                                            value={quietHoursTimezone}
                                            onChange={(e) => setQuietHoursTimezone(e.target.value)}
                                            className="input"
                                        >
                                            {TIMEZONES.map((tz) => (
                                                <option key={tz.value} value={tz.value}>
                                                    {tz.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
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
                            {isSubmitting
                                ? "Saving..."
                                : initialData
                                  ? "Save Changes"
                                  : "Add Recipient"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
