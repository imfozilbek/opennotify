import { TIMEZONE_OPTIONS } from "@/types/api"
import type { TimeWindow } from "@/types/api"

interface TimeWindowInputProps {
    value: TimeWindow | undefined
    onChange: (value: TimeWindow | undefined) => void
    label: string
    disabled?: boolean
}

export function TimeWindowInput({
    value,
    onChange,
    label,
    disabled = false,
}: TimeWindowInputProps): JSX.Element {
    const isEnabled = value !== undefined

    const handleToggle = (): void => {
        if (disabled) {
            return
        }
        if (isEnabled) {
            onChange(undefined)
        } else {
            onChange({
                start: "09:00",
                end: "18:00",
                timezone: "Asia/Tashkent",
            })
        }
    }

    const handleChange = (field: keyof TimeWindow, fieldValue: string): void => {
        if (!value) {
            return
        }
        onChange({
            ...value,
            [field]: fieldValue,
        })
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="label">{label}</label>
                <button
                    type="button"
                    onClick={handleToggle}
                    disabled={disabled}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isEnabled ? "bg-blue-600" : "bg-gray-200"
                    } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                            isEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                </button>
            </div>

            {isEnabled && value && (
                <div className="grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Start
                        </label>
                        <input
                            type="time"
                            value={value.start}
                            onChange={(e) => handleChange("start", e.target.value)}
                            disabled={disabled}
                            className="input w-full text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">End</label>
                        <input
                            type="time"
                            value={value.end}
                            onChange={(e) => handleChange("end", e.target.value)}
                            disabled={disabled}
                            className="input w-full text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                            Timezone
                        </label>
                        <select
                            value={value.timezone}
                            onChange={(e) => handleChange("timezone", e.target.value)}
                            disabled={disabled}
                            className="input w-full text-sm"
                        >
                            {TIMEZONE_OPTIONS.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                    {tz.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    )
}
