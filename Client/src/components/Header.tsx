import { Bell, LogOut, Menu } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "@/store/slices/authSlice";
import { logoutApi } from "@/features/auth/api/authapi";
import type { RootState } from "@/store/store";

// Map route segments to readable page titles
const pageTitles: Record<string, string> = {
    dashboard: "Dashboard",
    projects:  "Projects",
    employees: "Employees",
    tasks:     "Tasks",
    backlogs:  "Backlog",
    sprints:   "Sprints",
    teams:     "Teams",
    settings:  "Settings",
    profile:   "Profile",
    notification: "Notifications",
};

interface HeaderProps {
    onMenuToggle?: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const location   = useLocation();
    const user       = useSelector((state: RootState) => state.auth.user);

    // Derive page title from URL
    const segment    = location.pathname.split("/").filter(Boolean).pop() ?? "";
    const pageTitle  = pageTitles[segment] ?? "Syncro";

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch (err) {
            console.log("Logout API failed", err);
        } finally {
            dispatch(logout());
            navigate("/login");
        }
    };

    return (
        <header className="h-[60px] bg-white border-b border-[#f0f0f0] px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">

            {/* Left — Hamburger (mobile) + Page title */}
            <div className="flex items-center gap-3">
                {/* Hamburger — only on mobile */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-[#888] hover:bg-[#f7f7f7] hover:text-[#1f2124] transition-colors"
                >
                    <Menu size={18} />
                </button>

                {/* Page title */}
                <h1 className="text-[15px] font-bold text-[#1f2124] tracking-tight">{pageTitle}</h1>
            </div>

            {/* Right — actions */}
            <div className="flex items-center gap-2">

                {/* Bell */}
                <button className="relative w-9 h-9 flex items-center justify-center rounded-xl text-[#888] hover:bg-[#f7f7f7] hover:text-[#1f2124] transition-colors">
                    <Bell size={17} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#fa8029] rounded-full border-2 border-white" />
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-[#e5e5e5] mx-1 hidden sm:block" />

                {/* User info — hidden on mobile */}
                <div className="hidden sm:flex flex-col items-end mr-1">
                    <p className="text-[12px] font-bold text-[#1f2124] leading-tight">
                        {user?.name || "Loading..."}
                    </p>
                    <p className="text-[10px] text-[#aaa] leading-tight">
                        {user?.role === "company" ? "Administrator" : user?.designation || "Team Member"}
                    </p>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="flex items-center gap-1.5 bg-[#1f2124] hover:bg-[#fa8029] text-white text-[11px] font-bold px-3 md:px-3.5 py-2 rounded-xl transition-all active:scale-95 group"
                >
                    <LogOut size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
