import { toggleBlockEmployeeApi, getEmployeesApi } from "@/api/companyApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Search, Plus, Users, UserCheck, Briefcase, 
    LayoutGrid, MoreHorizontal, ShieldAlert, CheckCircle, Filter
} from "lucide-react";

interface Employee {
    _id: string;
    user_id: { _id: string; name: string; email: string; is_blocked: boolean };
    designation?: string;
    date_of_joining?: string;
    phone?: string;
    skills: string[];
}

export default function Employees() {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string|null>(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getEmployeesApi();
                setEmployees(data.data);
            } catch {
                setError("failed to load employees");
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const updateBlockStatus = (userId: string, is_blocked: boolean) => {
        setEmployees((prev) =>
            prev.map((emp) =>
                emp.user_id._id === userId
                    ? { ...emp, user_id: { ...emp.user_id, is_blocked } }
                    : emp
            )
        );
    };

    const handleToggleBlock = async (userId: string) => {
        try {
            const data = await toggleBlockEmployeeApi(userId);
            updateBlockStatus(userId, data.isBlocked);
        } catch {
            alert("Failed to update employee status");
        } finally {
            setOpenMenuId(null);
        }
    };

    // Derived statistics for the premium dashboard look
    const stats = {
        total: employees.length,
        active: employees.filter(e => !e.user_id.is_blocked).length,
        leads: Math.ceil(employees.length * 0.2), // Aesthetic placeholder
        depts: new Set(employees.filter(e => e.designation).map(e => e.designation)).size || 0
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0, 2) : "??";
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
            {/* Header section as seen in the image */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Employee Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and monitor your company's team members.</p>
                </div>
                <button 
                    onClick={() => navigate('/company/employees/add')}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md active:scale-95"
                >
                    <Plus size={18} />
                    Add Employee
                </button>
            </div>

            {/* Statistics Row from the image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatBox label="Total Employees" value={stats.total} icon={<Users size={20}/>} color="bg-blue-50 text-blue-600" />
                <StatBox label="Active" value={stats.active} icon={<UserCheck size={20}/>} color="bg-emerald-50 text-emerald-600" />
                <StatBox label="Team Leads" value={stats.leads} icon={<Briefcase size={20}/>} color="bg-orange-50 text-orange-600" />
                <StatBox label="Departments" value={stats.depts} icon={<LayoutGrid size={20}/>} color="bg-pink-50 text-pink-600" />
            </div>

            {/* Search and Filters as per image */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 mb-8 shadow-sm">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search employees by name, role or email..." 
                        className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-slate-50 border-none focus:ring-2 focus:ring-slate-200 transition-all text-sm outline-none placeholder:text-slate-400"
                    />
                </div>
                <div className="flex gap-3 shrink-0">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                        All Roles <Filter size={14} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                        All Status <Filter size={14} />
                    </button>
                </div>
            </div>

            {/* Main Listing Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-medium tracking-wide text-sm">LOADING TEAM DATA...</p>
                    </div>
                ) : error ? (
                    <div className="p-20 text-center text-rose-500 font-bold tracking-tight">
                        <ShieldAlert size={48} className="mx-auto mb-4 opacity-20" />
                        {error}
                    </div>
                ) : employees.length === 0 ? (
                    <div className="p-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No employees found</h3>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">Get started by adding your first employee to the system.</p>
                        <button 
                            onClick={() => navigate('/company/employees/add')}
                            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                        >
                            Add Your First Employee
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 bg-slate-50/50">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Name</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Email</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Designation</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {employees.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[13px] font-bold text-slate-600 ring-2 ring-white">
                                                    {getInitials(emp.user_id?.name)}
                                                </div>
                                                <div className="text-sm font-bold text-slate-900">{emp.user_id?.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-slate-500">{emp.user_id?.email}</td>
                                        <td className="px-6 py-5">
                                            <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                                                {emp.designation || "NOT ASSIGNED"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                                                emp.user_id?.is_blocked 
                                                ? 'bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100' 
                                                : 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${emp.user_id?.is_blocked ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
                                                {emp.user_id?.is_blocked ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right relative">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === emp._id ? null : emp._id)}
                                                className="p-2 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-900"
                                            >
                                                <MoreHorizontal size={20} />
                                            </button>

                                            {openMenuId === emp._id && (
                                                <div className="absolute right-6 top-16 w-48 bg-white border border-slate-200 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <button
                                                        onClick={() => handleToggleBlock(emp.user_id._id)}
                                                        className={`flex items-center gap-3 w-full px-4 py-3 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors ${
                                                            emp.user_id?.is_blocked 
                                                            ? 'text-emerald-600 hover:bg-emerald-50' 
                                                            : 'text-rose-600 hover:bg-rose-50'
                                                        }`}
                                                    >
                                                        {emp.user_id?.is_blocked ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                                                        {emp.user_id?.is_blocked ? "✓ Unblock" : "🚫 Block"}
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBox({ label, value, icon, color }: { label: string, value: number | string, icon: React.ReactNode, color: string }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                {icon}
            </div>
            <div>
                <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{label}</div>
            </div>
        </div>
    );
}
