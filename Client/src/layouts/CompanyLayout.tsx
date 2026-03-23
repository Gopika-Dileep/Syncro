import { Outlet } from "react-router-dom"
import CompanySidebar from "../components/company/CompanySidebar"
import Header from "../components/Header"

export default function CompanyLayout() {
    return (
        <div className="flex bg-gray-50 min-h-screen">
            <CompanySidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />   
                </main>
            </div>
        </div>
    )
}
