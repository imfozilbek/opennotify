import { type FormEvent, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { listProviders } from "@/api/providers"

export function LoginPage(): JSX.Element {
    const [apiKey, setApiKey] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e: FormEvent): Promise<void> {
        e.preventDefault()
        setError("")

        if (!apiKey.trim()) {
            setError("API key is required")
            return
        }

        setIsLoading(true)

        try {
            // Store the API key temporarily to test it
            localStorage.setItem("apiKey", apiKey.trim())

            // Try to fetch providers to validate the key
            const response = await listProviders()

            if (response.success) {
                login(apiKey.trim())
                navigate("/")
            } else {
                localStorage.removeItem("apiKey")
                setError(response.error?.message ?? "Invalid API key")
            }
        } catch {
            localStorage.removeItem("apiKey")
            setError("Invalid API key or server error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-primary-600">OpenNotify</h1>
                    <p className="mt-2 text-gray-600">Sign in to your dashboard</p>
                </div>

                <div className="card p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="apiKey" className="label">
                                API Key
                            </label>
                            <input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => {
                                    setApiKey(e.target.value)
                                }}
                                placeholder="Enter your API key"
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
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link
                            to="/register"
                            className="font-medium text-primary-600 hover:text-primary-500"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
