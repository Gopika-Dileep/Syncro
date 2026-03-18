import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
    LayoutDashboard,
    FolderKanban,
    ListTodo,
    Zap,
    Bell,
    Settings,
} from "lucide-react";

const navItems = [
    { label: "Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
    { label: "Projects", path: "/employee/projects", icon: FolderKanban },
    { label: "Backlog", path: "/employee/backlog", icon: ListTodo },
    { label: "Sprints", path: "/employee/sprints", icon: Zap },
    { label: "Notifications", path: "/employee/notification", icon: Bell },
    { label: "Settings", path: "/employee/settings", icon: Settings },
];

export default function EmployeeSidebar() {
    // ACCESS REAL USER DATA
    const user = useSelector((state: RootState) => state.auth.user);

    // DYNAMIC INITIALS FOR AVATAR
    const initials = user?.name 
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) 
        : "??";

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

            {/* Profile Footer (Dynamic) */}
            <div className="px-4 py-4 border-t border-gray-100">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition group">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 ring-2 ring-white">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate uppercase tracking-tight">
                            {user?.name || "Employee"}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                            {user?.companyName || "No Company"}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
