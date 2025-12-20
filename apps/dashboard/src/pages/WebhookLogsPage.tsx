import { useCallback, useEffect, useState } from "react"
import { getWebhookLogs } from "@/api/webhookLogs"
import { WebhookLogTable } from "@/components/webhooks/WebhookLogTable"
import { WebhookLogFilters } from "@/components/webhooks/WebhookLogFilters"
import { WebhookLogModal } from "@/components/webhooks/WebhookLogModal"
import type { WebhookLog, ProviderType, WebhookStatus } from "@/types/api"

export function WebhookLogsPage(): JSX.Element {
    const [logs, setLogs] = useState<WebhookLog[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null)

    // Filters
    const [providers, setProviders] = useState<ProviderType[]>([])
    const [statuses, setStatuses] = useState<WebhookStatus[]>([])
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    const loadLogs = useCallback(async (): Promise<void> => {
        setIsLoading(true)
        setError("")
        try {
            const response = await getWebhookLogs({
                provider: providers.length > 0 ? providers : undefined,
                status: statuses.length > 0 ? statuses : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                page,
                limit: 20,
            })

            if (response.success && response.data) {
                setLogs(response.data.logs)
                setTotal(response.data.pagination.total)
                setTotalPages(response.data.pagination.totalPages)
            } else {
                setError(response.error?.message ?? "Failed to load webhook logs")
            }
        } catch {
            setError("Failed to load webhook logs")
        } finally {
            setIsLoading(false)
        }
    }, [page, providers, statuses, startDate, endDate])

    useEffect(() => {
        void loadLogs()
    }, [loadLogs])

    const handleClearFilters = (): void => {
        setProviders([])
        setStatuses([])
        setStartDate("")
        setEndDate("")
        setPage(1)
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Webhook Logs</h1>
                <p className="text-gray-600">
                    View incoming webhook events from notification providers
                </p>
            </div>

            <div className="mb-6">
                <WebhookLogFilters
                    providers={providers}
                    statuses={statuses}
                    startDate={startDate}
                    endDate={endDate}
                    onProvidersChange={(p) => {
                        setProviders(p)
                        setPage(1)
                    }}
                    onStatusesChange={(s) => {
                        setStatuses(s)
                        setPage(1)
                    }}
                    onStartDateChange={(d) => {
                        setStartDate(d)
                        setPage(1)
                    }}
                    onEndDateChange={(d) => {
                        setEndDate(d)
                        setPage(1)
                    }}
                    onClear={handleClearFilters}
                />
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
                    <p>{error}</p>
                    <button
                        onClick={() => setError("")}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
                </div>
            ) : (
                <div className="card">
                    <WebhookLogTable logs={logs} onViewDetails={setSelectedLog} />

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                            <div className="text-sm text-gray-500">
                                Showing {logs.length} of {total} logs
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-secondary text-sm disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn-secondary text-sm disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {selectedLog && (
                <WebhookLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />
            )}
        </div>
    )
}
