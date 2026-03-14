import EmployeeSidebar from "@/components/employee/EmployeeSidebar"
import { Outlet } from "react-router-dom"


export default function EmployeeLayout() {
    return (
        <div style={{ display: "flex" }}>
            <EmployeeSidebar />
            <main style={{ flex: 1, padding: "16px" }}>
                <Outlet />     {/* child page renders here */}
            </main>
        </div>
    )
}
