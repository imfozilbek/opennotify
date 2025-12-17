import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react"

interface AuthState {
    apiKey: string | null
    merchantId: string | null
    isAuthenticated: boolean
    isLoading: boolean
}

interface AuthContextType extends AuthState {
    login: (apiKey: string) => void
    logout: () => void
    setCredentials: (merchantId: string, apiKey: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY_API = "apiKey"
const STORAGE_KEY_MERCHANT = "merchantId"

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
    const [state, setState] = useState<AuthState>({
        apiKey: null,
        merchantId: null,
        isAuthenticated: false,
        isLoading: true,
    })

    useEffect(() => {
        const storedApiKey = localStorage.getItem(STORAGE_KEY_API)
        const storedMerchantId = localStorage.getItem(STORAGE_KEY_MERCHANT)

        setState({
            apiKey: storedApiKey,
            merchantId: storedMerchantId,
            isAuthenticated: Boolean(storedApiKey),
            isLoading: false,
        })
    }, [])

    const login = useCallback((apiKey: string) => {
        localStorage.setItem(STORAGE_KEY_API, apiKey)
        setState((prev) => ({
            ...prev,
            apiKey,
            isAuthenticated: true,
        }))
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY_API)
        localStorage.removeItem(STORAGE_KEY_MERCHANT)
        setState({
            apiKey: null,
            merchantId: null,
            isAuthenticated: false,
            isLoading: false,
        })
    }, [])

    const setCredentials = useCallback((merchantId: string, apiKey: string) => {
        localStorage.setItem(STORAGE_KEY_API, apiKey)
        localStorage.setItem(STORAGE_KEY_MERCHANT, merchantId)
        setState({
            apiKey,
            merchantId,
            isAuthenticated: true,
            isLoading: false,
        })
    }, [])

    const value: AuthContextType = {
        ...state,
        login,
        logout,
        setCredentials,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
