import { useState } from "react"
import EmployeeSidebar from "@/components/employee/EmployeeSidebar"
import Header from "@/components/Header"
import { Outlet } from "react-router-dom"

export default function EmployeeLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="flex bg-[#f7f7f7] min-h-screen">

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed lg:sticky top-0 z-30 h-screen transition-transform duration-300 ease-in-out
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <EmployeeSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header onMenuToggle={() => setSidebarOpen(prev => !prev)} />
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
