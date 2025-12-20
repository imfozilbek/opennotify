import { Navigate, Route, Routes } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Layout } from "@/components/Layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { ProvidersPage } from "@/pages/ProvidersPage"
import { TemplatesPage } from "@/pages/TemplatesPage"
import { RecipientsPage } from "@/pages/RecipientsPage"
import { NotificationsPage } from "@/pages/NotificationsPage"
import { AnalyticsPage } from "@/pages/AnalyticsPage"
import { TeamPage } from "@/pages/TeamPage"

export default function App(): JSX.Element {
    const { isAuthenticated } = useAuth()

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
            />
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/providers" element={<ProvidersPage />} />
                    <Route path="/templates" element={<TemplatesPage />} />
                    <Route path="/recipients" element={<RecipientsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/team" element={<TeamPage />} />
                </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
