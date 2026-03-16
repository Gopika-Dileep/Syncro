import EmployeeSidebar from "@/components/employee/EmployeeSidebar"
import Header from "@/components/Header"
import { Outlet } from "react-router-dom"


export default function EmployeeLayout() {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <EmployeeSidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />     {/* child page renders here */}
                </main>
            </div>
        </div>
    )
}
