import { useCallback, useEffect, useState } from "react"
import type { MerchantSettings, UpdateSettingsRequest } from "@/types/api"
import {
    COUNTRY_OPTIONS,
    LANGUAGE_OPTIONS,
    TIMEZONE_OPTIONS,
} from "@/types/api"
import { getSettings, updateSettings } from "@/api/settings"

type TabType = "general" | "notifications" | "security" | "branding"

const TABS: { id: TabType; label: string; icon: JSX.Element }[] = [
    {
        id: "general",
        label: "General",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
            </svg>
        ),
    },
    {
        id: "notifications",
        label: "Notifications",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
            </svg>
        ),
    },
    {
        id: "security",
        label: "Security",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
            </svg>
        ),
    },
    {
        id: "branding",
        label: "Branding",
        icon: (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
            </svg>
        ),
    },
]

export function SettingsPage(): JSX.Element {
    const [_settings, setSettings] = useState<MerchantSettings | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [activeTab, setActiveTab] = useState<TabType>("general")

    // Form state for each section
    const [formData, setFormData] = useState<UpdateSettingsRequest>({})

    const loadSettings = useCallback(async (): Promise<void> => {
        setIsLoading(true)
        setError("")

        try {
            const response = await getSettings()
            if (response.success && response.data) {
                setSettings(response.data)
                // Initialize form data with current settings
                setFormData({
                    companyName: response.data.companyName ?? undefined,
                    country: response.data.country ?? undefined,
                    timezone: response.data.timezone ?? undefined,
                    defaultLanguage: response.data.defaultLanguage ?? undefined,
                    defaultSmsSender: response.data.defaultSmsSender ?? undefined,
                    defaultEmailFrom: response.data.defaultEmailFrom ?? undefined,
                    webhookUrl: response.data.webhookUrl ?? undefined,
                    webhookSecret: response.data.webhookSecret ?? undefined,
                    rateLimitPerMinute: response.data.rateLimitPerMinute ?? undefined,
                    rateLimitPerDay: response.data.rateLimitPerDay ?? undefined,
                    retryAttempts: response.data.retryAttempts ?? undefined,
                    retryDelaySeconds: response.data.retryDelaySeconds ?? undefined,
                    twoFactorEnabled: response.data.twoFactorEnabled,
                    sessionTimeoutMinutes: response.data.sessionTimeoutMinutes ?? undefined,
                    ipWhitelist: response.data.ipWhitelist,
                    logoUrl: response.data.logoUrl ?? undefined,
                    primaryColor: response.data.primaryColor ?? undefined,
                    accentColor: response.data.accentColor ?? undefined,
                })
            } else {
                setError(response.error?.message ?? "Failed to load settings")
            }
        } catch {
            setError("Failed to load settings")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void loadSettings()
    }, [loadSettings])

    async function handleSave(): Promise<void> {
        setIsSaving(true)
        setError("")
        setSuccess("")

        try {
            const response = await updateSettings(formData)
            if (response.success && response.data) {
                setSettings(response.data)
                setSuccess("Settings saved successfully")
                setTimeout(() => setSuccess(""), 3000)
            } else {
                setError(response.error?.message ?? "Failed to save settings")
            }
        } catch {
            setError("Failed to save settings")
        } finally {
            setIsSaving(false)
        }
    }

    function handleInputChange(field: keyof UpdateSettingsRequest, value: unknown): void {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">Loading settings...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500">
                        Configure your account and notification preferences
                    </p>
                </div>
                <button
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                    className="btn-primary"
                >
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {success && (
                <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-sm text-green-800">{success}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex gap-8">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 border-b-2 pb-4 text-sm font-medium ${
                                activeTab === tab.id
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="card p-6">
                {activeTab === "general" && (
                    <GeneralTab formData={formData} onChange={handleInputChange} />
                )}
                {activeTab === "notifications" && (
                    <NotificationsTab formData={formData} onChange={handleInputChange} />
                )}
                {activeTab === "security" && (
                    <SecurityTab formData={formData} onChange={handleInputChange} />
                )}
                {activeTab === "branding" && (
                    <BrandingTab formData={formData} onChange={handleInputChange} />
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// General Tab
// ─────────────────────────────────────────────────────────────
interface TabProps {
    formData: UpdateSettingsRequest
    onChange: (field: keyof UpdateSettingsRequest, value: unknown) => void
}

function GeneralTab({ formData, onChange }: TabProps): JSX.Element {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Basic information about your organization
                </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                {/* Company Name */}
                <div className="sm:col-span-2">
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                        Company Name
                    </label>
                    <input
                        type="text"
                        id="companyName"
                        value={formData.companyName ?? ""}
                        onChange={(e) => onChange("companyName", e.target.value || undefined)}
                        placeholder="Your Company Name"
                        className="input mt-1"
                        maxLength={100}
                    />
                </div>

                {/* Country */}
                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                        Country
                    </label>
                    <select
                        id="country"
                        value={formData.country ?? ""}
                        onChange={(e) => onChange("country", e.target.value || undefined)}
                        className="input mt-1"
                    >
                        <option value="">Select country</option>
                        {COUNTRY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Timezone */}
                <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                        Timezone
                    </label>
                    <select
                        id="timezone"
                        value={formData.timezone ?? ""}
                        onChange={(e) => onChange("timezone", e.target.value || undefined)}
                        className="input mt-1"
                    >
                        <option value="">Select timezone</option>
                        {TIMEZONE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Default Language */}
                <div>
                    <label
                        htmlFor="defaultLanguage"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Default Language
                    </label>
                    <select
                        id="defaultLanguage"
                        value={formData.defaultLanguage ?? ""}
                        onChange={(e) => onChange("defaultLanguage", e.target.value || undefined)}
                        className="input mt-1"
                    >
                        <option value="">Select language</option>
                        {LANGUAGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Notifications Tab
// ─────────────────────────────────────────────────────────────
function NotificationsTab({ formData, onChange }: TabProps): JSX.Element {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Configure default senders, webhooks, and rate limits
                </p>
            </div>

            {/* Default Senders */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Default Senders</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="defaultSmsSender"
                            className="block text-sm font-medium text-gray-700"
                        >
                            SMS Sender Name
                        </label>
                        <input
                            type="text"
                            id="defaultSmsSender"
                            value={formData.defaultSmsSender ?? ""}
                            onChange={(e) =>
                                onChange("defaultSmsSender", e.target.value || undefined)
                            }
                            placeholder="MyCompany"
                            className="input mt-1"
                            maxLength={20}
                        />
                        <p className="mt-1 text-xs text-gray-500">Max 20 characters</p>
                    </div>
                    <div>
                        <label
                            htmlFor="defaultEmailFrom"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email From Address
                        </label>
                        <input
                            type="email"
                            id="defaultEmailFrom"
                            value={formData.defaultEmailFrom ?? ""}
                            onChange={(e) =>
                                onChange("defaultEmailFrom", e.target.value || undefined)
                            }
                            placeholder="noreply@example.com"
                            className="input mt-1"
                        />
                    </div>
                </div>
            </div>

            {/* Webhook Settings */}
            <div className="space-y-4 border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900">Webhook Settings</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label
                            htmlFor="webhookUrl"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Webhook URL
                        </label>
                        <input
                            type="url"
                            id="webhookUrl"
                            value={formData.webhookUrl ?? ""}
                            onChange={(e) => onChange("webhookUrl", e.target.value || undefined)}
                            placeholder="https://your-server.com/webhooks/opennotify"
                            className="input mt-1"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            We will send delivery status updates to this URL
                        </p>
                    </div>
                    <div className="sm:col-span-2">
                        <label
                            htmlFor="webhookSecret"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Webhook Secret
                        </label>
                        <input
                            type="password"
                            id="webhookSecret"
                            value={formData.webhookSecret ?? ""}
                            onChange={(e) => onChange("webhookSecret", e.target.value || undefined)}
                            placeholder="Enter webhook secret"
                            className="input mt-1"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Used to sign webhook payloads for verification
                        </p>
                    </div>
                </div>
            </div>

            {/* Rate Limits */}
            <div className="space-y-4 border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900">Rate Limits</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="rateLimitPerMinute"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Requests per Minute
                        </label>
                        <input
                            type="number"
                            id="rateLimitPerMinute"
                            value={formData.rateLimitPerMinute ?? ""}
                            onChange={(e) =>
                                onChange(
                                    "rateLimitPerMinute",
                                    e.target.value ? parseInt(e.target.value, 10) : undefined,
                                )
                            }
                            placeholder="60"
                            min={1}
                            max={1000}
                            className="input mt-1"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="rateLimitPerDay"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Requests per Day
                        </label>
                        <input
                            type="number"
                            id="rateLimitPerDay"
                            value={formData.rateLimitPerDay ?? ""}
                            onChange={(e) =>
                                onChange(
                                    "rateLimitPerDay",
                                    e.target.value ? parseInt(e.target.value, 10) : undefined,
                                )
                            }
                            placeholder="10000"
                            min={1}
                            max={100000}
                            className="input mt-1"
                        />
                    </div>
                </div>
            </div>

            {/* Retry Settings */}
            <div className="space-y-4 border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900">Retry Settings</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="retryAttempts"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Retry Attempts
                        </label>
                        <input
                            type="number"
                            id="retryAttempts"
                            value={formData.retryAttempts ?? ""}
                            onChange={(e) =>
                                onChange(
                                    "retryAttempts",
                                    e.target.value ? parseInt(e.target.value, 10) : undefined,
                                )
                            }
                            placeholder="3"
                            min={0}
                            max={5}
                            className="input mt-1"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Number of retry attempts on failure (0-5)
                        </p>
                    </div>
                    <div>
                        <label
                            htmlFor="retryDelaySeconds"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Retry Delay (seconds)
                        </label>
                        <input
                            type="number"
                            id="retryDelaySeconds"
                            value={formData.retryDelaySeconds ?? ""}
                            onChange={(e) =>
                                onChange(
                                    "retryDelaySeconds",
                                    e.target.value ? parseInt(e.target.value, 10) : undefined,
                                )
                            }
                            placeholder="30"
                            min={1}
                            max={3600}
                            className="input mt-1"
                        />
                        <p className="mt-1 text-xs text-gray-500">Delay between retry attempts</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Security Tab
// ─────────────────────────────────────────────────────────────
function SecurityTab({ formData, onChange }: TabProps): JSX.Element {
    const [newIp, setNewIp] = useState("")

    function addIpAddress(): void {
        if (!newIp.trim()) {
            return
        }
        const currentList = formData.ipWhitelist ?? []
        if (!currentList.includes(newIp.trim())) {
            onChange("ipWhitelist", [...currentList, newIp.trim()])
        }
        setNewIp("")
    }

    function removeIpAddress(ip: string): void {
        const currentList = formData.ipWhitelist ?? []
        onChange(
            "ipWhitelist",
            currentList.filter((item) => item !== ip),
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Configure authentication and access controls
                </p>
            </div>

            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                    </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                    <input
                        type="checkbox"
                        checked={formData.twoFactorEnabled ?? false}
                        onChange={(e) => onChange("twoFactorEnabled", e.target.checked)}
                        className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                </label>
            </div>

            {/* Session Timeout */}
            <div className="space-y-4 border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900">Session Settings</h4>
                <div>
                    <label
                        htmlFor="sessionTimeoutMinutes"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Session Timeout (minutes)
                    </label>
                    <input
                        type="number"
                        id="sessionTimeoutMinutes"
                        value={formData.sessionTimeoutMinutes ?? ""}
                        onChange={(e) =>
                            onChange(
                                "sessionTimeoutMinutes",
                                e.target.value ? parseInt(e.target.value, 10) : undefined,
                            )
                        }
                        placeholder="60"
                        min={5}
                        max={1440}
                        className="input mt-1 max-w-xs"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Automatically log out after this period of inactivity (5-1440 minutes)
                    </p>
                </div>
            </div>

            {/* IP Whitelist */}
            <div className="space-y-4 border-t pt-6">
                <div>
                    <h4 className="text-sm font-medium text-gray-900">IP Whitelist</h4>
                    <p className="text-sm text-gray-500">
                        Only allow API requests from these IP addresses
                    </p>
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newIp}
                        onChange={(e) => setNewIp(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                addIpAddress()
                            }
                        }}
                        placeholder="Enter IP address (e.g., 192.168.1.1)"
                        className="input flex-1"
                    />
                    <button onClick={addIpAddress} className="btn-secondary">
                        Add
                    </button>
                </div>

                {formData.ipWhitelist && formData.ipWhitelist.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {formData.ipWhitelist.map((ip) => (
                            <span
                                key={ip}
                                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                            >
                                {ip}
                                <button
                                    onClick={() => removeIpAddress(ip)}
                                    className="ml-1 text-gray-400 hover:text-gray-600"
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
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">
                        No IP addresses whitelisted. All IP addresses are allowed.
                    </p>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Branding Tab
// ─────────────────────────────────────────────────────────────
function BrandingTab({ formData, onChange }: TabProps): JSX.Element {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-gray-900">Branding Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Customize the appearance of your notifications
                </p>
            </div>

            {/* Logo */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
                        Logo URL
                    </label>
                    <input
                        type="url"
                        id="logoUrl"
                        value={formData.logoUrl ?? ""}
                        onChange={(e) => onChange("logoUrl", e.target.value || undefined)}
                        placeholder="https://example.com/logo.png"
                        className="input mt-1"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        URL to your company logo (recommended: 200x200px)
                    </p>
                </div>

                {formData.logoUrl && (
                    <div className="rounded-lg border p-4">
                        <p className="mb-2 text-sm text-gray-500">Preview:</p>
                        <img
                            src={formData.logoUrl}
                            alt="Logo preview"
                            className="h-16 w-16 rounded object-contain"
                            onError={(e) => {
                                ;(e.target as HTMLImageElement).style.display = "none"
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Colors */}
            <div className="space-y-4 border-t pt-6">
                <h4 className="text-sm font-medium text-gray-900">Brand Colors</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label
                            htmlFor="primaryColor"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Primary Color
                        </label>
                        <div className="mt-1 flex items-center gap-3">
                            <input
                                type="color"
                                id="primaryColorPicker"
                                value={formData.primaryColor ?? "#3B82F6"}
                                onChange={(e) => onChange("primaryColor", e.target.value)}
                                className="h-10 w-14 cursor-pointer rounded border"
                            />
                            <input
                                type="text"
                                id="primaryColor"
                                value={formData.primaryColor ?? ""}
                                onChange={(e) =>
                                    onChange("primaryColor", e.target.value || undefined)
                                }
                                placeholder="#3B82F6"
                                pattern="^#[0-9A-Fa-f]{6}$"
                                className="input flex-1"
                            />
                        </div>
                    </div>
                    <div>
                        <label
                            htmlFor="accentColor"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Accent Color
                        </label>
                        <div className="mt-1 flex items-center gap-3">
                            <input
                                type="color"
                                id="accentColorPicker"
                                value={formData.accentColor ?? "#10B981"}
                                onChange={(e) => onChange("accentColor", e.target.value)}
                                className="h-10 w-14 cursor-pointer rounded border"
                            />
                            <input
                                type="text"
                                id="accentColor"
                                value={formData.accentColor ?? ""}
                                onChange={(e) =>
                                    onChange("accentColor", e.target.value || undefined)
                                }
                                placeholder="#10B981"
                                pattern="^#[0-9A-Fa-f]{6}$"
                                className="input flex-1"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Color Preview */}
            {(formData.primaryColor ?? formData.accentColor) && (
                <div className="space-y-4 border-t pt-6">
                    <h4 className="text-sm font-medium text-gray-900">Color Preview</h4>
                    <div className="flex gap-4">
                        {formData.primaryColor && (
                            <div className="text-center">
                                <div
                                    className="h-16 w-16 rounded-lg"
                                    style={{ backgroundColor: formData.primaryColor }}
                                ></div>
                                <p className="mt-1 text-xs text-gray-500">Primary</p>
                            </div>
                        )}
                        {formData.accentColor && (
                            <div className="text-center">
                                <div
                                    className="h-16 w-16 rounded-lg"
                                    style={{ backgroundColor: formData.accentColor }}
                                ></div>
                                <p className="mt-1 text-xs text-gray-500">Accent</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
