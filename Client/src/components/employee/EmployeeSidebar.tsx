import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { LayoutDashboard, FolderKanban, ListTodo, Zap, Settings, Users } from "lucide-react";
import { usePermission } from "@/hooks/usePermission";

export default function EmployeeSidebar() {
    const user = useSelector((state: RootState) => state.auth.user);
    const { can } = usePermission();

    const navItems = [
        { label: "Dashboard", path: "/employee/dashboard", icon: LayoutDashboard },
        { label: "My Projects", path: "/employee/projects", icon: FolderKanban },
        { label: "Tasks", path: "/employee/tasks", icon: ListTodo },
        { 
            label: "Backlog", 
            path: "/employee/backlogs", 
            icon: ListTodo,
            visible: can('userStory:view:all') 
        },
        { 
            label: "Sprints", 
            path: "/employee/sprints", 
            icon: Zap,
            visible: can('sprint:create') 
        },
        { 
            label: "My Team", 
            path: "/employee/teams", 
            icon: Users,
            visible: can('team:view:team')
        },
        { label: "Settings", path: "/employee/settings", icon: Settings },
    ];

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || "??";

    return (
        <aside className="flex flex-col h-screen w-64 bg-white border-r border-slate-100 sticky top-0">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                        <Zap size={16} className="text-white" fill="white" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-slate-900 uppercase">Syncro</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (item.visible !== false && (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }`
                        }
                    >
                        <item.icon size={18} />
                        {item.label}
                    </NavLink>
                )))}
            </nav>

            <div className="p-4 mt-auto">
                <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xs font-black text-slate-900 shadow-sm border border-slate-100">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate uppercase">{user?.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate">{user?.designation}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
