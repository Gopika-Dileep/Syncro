import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Bell,
    Settings,
    Zap,
} from "lucide-react";

const navItems = [
    { label: "Dashboard", path: "/company/dashboard", icon: LayoutDashboard },
    { label: "Employees", path: "/company/employees", icon: Users },
    { label: "Projects", path: "/company/projects", icon: FolderKanban },
    { label: "Teams", path: "/company/teams", icon: Users },
    { label: "Notifications", path: "/company/notification", icon: Bell },
    { label: "Settings", path: "/company/settings", icon: Settings },
];

interface CompanySidebarProps {
    onClose?: () => void;
}

export default function CompanySidebar({ onClose }: CompanySidebarProps) {
    const user = useSelector((state: RootState) => state.auth.user);
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        : "??";

    return (
        <aside className="flex flex-col h-screen w-[220px] bg-[#1a1c1f] border-r border-white/[0.06] sticky top-0 overflow-y-auto">
            {/* Logo */}
            <div className="px-6 pt-7 pb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#fa8029] rounded-lg flex items-center justify-center shadow-lg shadow-orange-950/30">
                        <Zap size={16} className="text-white" fill="white" />
                    </div>
                    <span className="text-[17px] font-black tracking-tight text-white uppercase italic">Syncro</span>
                </div>
            </div>

            {/* Menu section */}
            <div className="px-4 mt-2">
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-2 mb-1.5">Menu</p>
                <nav className="space-y-0.5">
                    {navItems.map(({ label, path, icon: Icon }) => (
                        <NavLink
                            key={path}
                            to={path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={17} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                                    <span>{label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            {/* User profile */}
            <div className="mt-auto px-4 pb-5">
                <div className="border-t border-white/[0.06] mb-4" />
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/[0.06]">
                    <div className="w-8 h-8 rounded-lg bg-[#fa8029] flex items-center justify-center text-[11px] font-black text-white flex-shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[12px] font-bold text-white truncate">
                            {user?.name || "Admin User"}
                        </p>
                        <p className="text-[10px] text-white/40 truncate">
                            {user?.companyName || "Organization"}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
