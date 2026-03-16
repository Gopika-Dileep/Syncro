import { NavLink } from "react-router-dom"
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Bell,
    Settings,
    Zap,
} from "lucide-react"

const navItems = [
    {label: "Dashboard", path: "/company/dashboard", icon: LayoutDashboard },
    {label: "Employees", path: "/company/employees", icon: Users },
    {label: "Projects", path: "/company/projects", icon: FolderKanban },
    {label:"Teams" ,path:"/company/teams" , icon:Users},
    {label: "Notifications", path: "/company/notification", icon: Bell },
    {label: "Settings", path: "/company/settings", icon: Settings },
]

export default function CompanySidebar() {
    return (
        <aside className="flex flex-col h-screen w-60 bg-white border-r border-gray-100 sticky top-0">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Zap size={14} className="text-white" fill="white" />
                    </div>
                    <span className="text-[17px] font-bold tracking-tight text-gray-900">Syncro</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                {navItems.map(({ label, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                                isActive
                                    ? "bg-gray-900 text-white font-medium"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon
                                    size={16}
                                    className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-700"}
                                />
                                {label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="px-4 py-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                        AC
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">Admin User</p>
                        <p className="text-[11px] text-gray-400 truncate">admin@syncro.com</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}