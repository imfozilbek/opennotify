import { type FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { register } from "@/api/auth"

export function RegisterPage(): JSX.Element {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [generatedKey, setGeneratedKey] = useState<{
        merchantId: string
        apiKey: string
    } | null>(null)
    const [copied, setCopied] = useState(false)
    const { setCredentials } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault()
        setError("")

        if (!name.trim() || !email.trim()) {
            setError("Name and email are required")
            return
        }

        setIsLoading(true)

        try {
            const response = await register({ name: name.trim(), email: email.trim() })

            if (response.success && response.data) {
                setGeneratedKey(response.data)
            } else {
                setError(response.error?.message ?? "Registration failed")
            }
        } catch {
            setError("Registration failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCopyKey(): Promise<void> {
        if (!generatedKey) {
            return
        }

        try {
            await navigator.clipboard.writeText(generatedKey.apiKey)
            setCopied(true)
            setTimeout(() => {
                setCopied(false)
            }, 2000)
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement("textarea")
            textArea.value = generatedKey.apiKey
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand("copy")
            document.body.removeChild(textArea)
            setCopied(true)
            setTimeout(() => {
                setCopied(false)
            }, 2000)
        }
    }

    function handleContinue(): void {
        if (generatedKey) {
            setCredentials(generatedKey.merchantId, generatedKey.apiKey)
            navigate("/")
        }
    }

    if (generatedKey) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-md">
                    <div className="card p-6">
                        <div className="mb-4 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
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
                            <h2 className="text-xl font-semibold text-gray-900">
                                Registration Successful!
                            </h2>
                        </div>

                        <div className="mb-4 rounded-lg bg-yellow-50 p-4">
                            <div className="flex">
                                <svg
                                    className="h-5 w-5 text-yellow-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Save your API Key
                                    </h3>
                                    <p className="mt-1 text-sm text-yellow-700">
                                        This key will only be shown once. Store it securely!
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="label">Your API Key</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={generatedKey.apiKey}
                                    className="input pr-20 font-mono text-sm"
                                />
                                <button
                                    onClick={handleCopyKey}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
                                >
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="label">Merchant ID</label>
                            <input
                                type="text"
                                readOnly
                                value={generatedKey.merchantId}
                                className="input font-mono text-sm"
                            />
                        </div>

                        <button onClick={handleContinue} className="btn-primary w-full">
                            Continue to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-primary-600">OpenNotify</h1>
                    <p className="mt-2 text-gray-600">Create your merchant account</p>
                </div>

                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="label">
                                Company Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                }}
                                placeholder="My Company"
                                className="input"
                                disabled={isLoading}
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
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                }}
                                placeholder="you@company.com"
                                className="input"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={isLoading} className="btn-primary w-full">
                            {isLoading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an API key?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
