import { ProviderType, PROVIDER_LABELS, WebhookStatus, WEBHOOK_STATUS_LABELS } from "@/types/api"

interface WebhookLogFiltersProps {
    providers: ProviderType[]
    statuses: WebhookStatus[]
    startDate: string
    endDate: string
    onProvidersChange: (providers: ProviderType[]) => void
    onStatusesChange: (statuses: WebhookStatus[]) => void
    onStartDateChange: (date: string) => void
    onEndDateChange: (date: string) => void
    onClear: () => void
}

const AVAILABLE_PROVIDERS: ProviderType[] = [
    ProviderType.ESKIZ,
    ProviderType.PLAYMOBILE,
    ProviderType.GETSMS,
    ProviderType.TELEGRAM_BOT,
    ProviderType.SENDGRID,
    ProviderType.MAILGUN,
    ProviderType.WHATSAPP_BUSINESS,
]

const AVAILABLE_STATUSES: WebhookStatus[] = ["SUCCESS", "INVALID_SIGNATURE", "PENDING", "FAILED"]

export function WebhookLogFilters({
    providers,
    statuses,
    startDate,
    endDate,
    onProvidersChange,
    onStatusesChange,
    onStartDateChange,
    onEndDateChange,
    onClear,
}: WebhookLogFiltersProps): JSX.Element {
    const handleProviderToggle = (provider: ProviderType): void => {
        if (providers.includes(provider)) {
            onProvidersChange(providers.filter((p) => p !== provider))
        } else {
            onProvidersChange([...providers, provider])
        }
    }

    const handleStatusToggle = (status: WebhookStatus): void => {
        if (statuses.includes(status)) {
            onStatusesChange(statuses.filter((s) => s !== status))
        } else {
            onStatusesChange([...statuses, status])
        }
    }

    const hasFilters =
        providers.length > 0 || statuses.length > 0 || startDate !== "" || endDate !== ""

    return (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Filters</h3>
                {hasFilters && (
                    <button onClick={onClear} className="text-sm text-primary-600 hover:text-primary-700">
                        Clear all
                    </button>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label className="label text-xs">Provider</label>
                    <div className="flex flex-wrap gap-1">
                        {AVAILABLE_PROVIDERS.map((provider) => (
                            <button
                                key={provider}
                                onClick={() => handleProviderToggle(provider)}
                                className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                                    providers.includes(provider)
                                        ? "bg-primary-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                {PROVIDER_LABELS[provider].split(" ")[0]}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="label text-xs">Status</label>
                    <div className="flex flex-wrap gap-1">
                        {AVAILABLE_STATUSES.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusToggle(status)}
                                className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                                    statuses.includes(status)
                                        ? "bg-primary-600 text-white"
                                        : "bg-white text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                {WEBHOOK_STATUS_LABELS[status]}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="label text-xs">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onStartDateChange(e.target.value)}
                        className="input text-sm"
                    />
                </div>

                <div>
                    <label className="label text-xs">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => onEndDateChange(e.target.value)}
                        className="input text-sm"
                    />
                </div>
            </div>
        </div>
    )
}
