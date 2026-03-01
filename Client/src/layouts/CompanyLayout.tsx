import { Outlet } from "react-router-dom"
import CompanySidebar from "../components/company/CompanySidebar"

export default function CompanyLayout() {
    return (
        <div style={{ display: "flex" }}>
            <CompanySidebar />
            <main style={{ flex: 1, padding: "16px" }}>
                <Outlet />     {/* child page renders here */}
            </main>
        </div>
    )
}
