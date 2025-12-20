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
import { ApiKeysPage } from "@/pages/ApiKeysPage"
import { WebhookLogsPage } from "@/pages/WebhookLogsPage"
import { SettingsPage } from "@/pages/SettingsPage"
import { RoutingPage } from "@/pages/RoutingPage"
import { CostAnalysisPage } from "@/pages/CostAnalysisPage"

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
                    <Route path="/api-keys" element={<ApiKeysPage />} />
                    <Route path="/webhook-logs" element={<WebhookLogsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/routing" element={<RoutingPage />} />
                    <Route path="/cost-analysis" element={<CostAnalysisPage />} />
                </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}
