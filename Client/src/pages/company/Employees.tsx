import { toggleBlockEmployeeApi, getEmployeesApi } from "@/api/companyApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Search, Plus, Users, MoreVertical, ShieldAlert, CheckCircle,
    Edit2, Eye
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
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const limit = 5;
    const [error, setError] = useState("");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                const data = await getEmployeesApi(page, limit, searchTerm);
                setEmployees(data.data);
                setTotal(data.total);
            } catch {
                setError("failed to load employees");
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchEmployees();
        }, 500);

        return () => clearTimeout(timer);
    }, [page, searchTerm]);

    const updateBlockStatus = (userId: string, is_blocked: boolean) => {
        setEmployees((prev: Employee[]) =>
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
            toast.success(`Employee ${data.isBlocked ? 'blocked' : 'unblocked'} successfully`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update employee status");
        } finally {
            setOpenMenuId(null);
        }
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "??";
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
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
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 mb-8 shadow-sm">
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search employees by name, role or email..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-slate-50 border-none focus:ring-2 focus:ring-slate-200 transition-all text-sm outline-none placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm relative">
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
                    <div className="overflow-visible">
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
                                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${emp.user_id?.is_blocked
                                                ? 'bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100'
                                                : 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${emp.user_id?.is_blocked ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
                                                {emp.user_id?.is_blocked ? "Blocked" : "Active"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === emp._id ? null : emp._id);
                                                }}
                                                className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-900 border border-transparent"
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            {openMenuId === emp._id && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />

                                                    <div className="absolute right-6 top-12 w-48 bg-white border border-slate-200 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] z-50 p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                                                        <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 mb-1">
                                                            Actions
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                navigate(`/company/employees/${emp.user_id._id}`);
                                                            }}
                                                            className="flex items-center gap-3 w-full px-3 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                                                            <Eye size={14} className="text-slate-400" />
                                                            View Details
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setOpenMenuId(null);
                                                                navigate(`/company/employees/edit/${emp.user_id._id}`);
                                                            }}
                                                            className="flex items-center gap-3 w-full px-3 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-50 mb-1">
                                                            <Edit2 size={13} className="text-slate-400" />
                                                            Edit Employee
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                handleToggleBlock(emp.user_id._id);
                                                            }}
                                                            className={`flex items-center gap-3 w-full px-3 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-colors ${emp.user_id?.is_blocked
                                                                ? 'text-emerald-600 hover:bg-emerald-50'
                                                                : 'text-rose-600 hover:bg-rose-50'
                                                                }`}
                                                        >
                                                            {emp.user_id?.is_blocked ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                                                            {emp.user_id?.is_blocked ? "Unblock" : "Block"}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {employees.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 bg-slate-50/20">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} Members
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(prev => prev - 1)}
                                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold uppercase transition-all hover:bg-slate-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page * limit >= total}
                                onClick={() => setPage(prev => prev + 1)}
                                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[11px] font-bold uppercase transition-all hover:bg-black disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


