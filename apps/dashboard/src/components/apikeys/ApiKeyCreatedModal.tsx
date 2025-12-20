import { useState } from "react"

interface ApiKeyCreatedModalProps {
    apiKeyName: string
    rawKey: string
    onClose: () => void
}

export function ApiKeyCreatedModal({
    apiKeyName,
    rawKey,
    onClose,
}: ApiKeyCreatedModalProps): JSX.Element {
    const [copied, setCopied] = useState(false)

    const handleCopy = async (): Promise<void> => {
        await navigator.clipboard.writeText(rawKey)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="card w-full max-w-lg">
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <svg
                                className="h-6 w-6 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                API Key Created
                            </h2>
                            <p className="text-sm text-gray-500">{apiKeyName}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="rounded-lg bg-yellow-50 p-4">
                        <div className="flex items-start gap-3">
                            <svg
                                className="h-5 w-5 text-yellow-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            <div>
                                <p className="font-medium text-yellow-800">
                                    Save this key now!
                                </p>
                                <p className="mt-1 text-sm text-yellow-700">
                                    This is the only time you will see this key. Copy it and store
                                    it securely.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="label">Your API Key</label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 overflow-x-auto rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-sm">
                                {rawKey}
                            </code>
                            <button
                                onClick={handleCopy}
                                className={`btn-secondary flex-shrink-0 ${copied ? "bg-green-50 text-green-700" : ""}`}
                            >
                                {copied ? (
                                    <>
                                        <svg
                                            className="mr-1 h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="mr-1 h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                            />
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">
                            <strong>Usage:</strong> Include this key in the{" "}
                            <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">
                                X-API-Key
                            </code>{" "}
                            header of your API requests.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end border-t border-gray-200 p-6">
                    <button onClick={onClose} className="btn-primary">
                        Done
                    </button>
                </div>
            </div>
        </div>
    )
}
