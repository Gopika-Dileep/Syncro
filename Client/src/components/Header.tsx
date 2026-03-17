import { Search, Bell, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "@/store/slices/authSlice";
import { logoutApi } from "@/api/authapi";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    <header className="h-16 bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors group">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-100 mx-2"></div>

        {/* Profile Dropdown (Simplified) */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-none">User Profile</p>
            <p className="text-[11px] text-gray-400 mt-1">Manage Account</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-sm active:scale-95 ml-2"
          >
            <LogOut size={16} />
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
