import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"

export function Layout(): JSX.Element {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto bg-gray-50">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
