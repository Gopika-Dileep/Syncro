import { toggleBlockEmployeeApi, getEmployeesApi } from "@/api/companyApi";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldAlert, CheckCircle, Edit2, Eye, MoreHorizontal, Users } from "lucide-react";
import DataTable, { type Column } from "@/components/DataTable";

interface Employee {
    _id: string;
    user_id: { _id: string; name: string; email: string; is_blocked: boolean };
    designation?: string;
    date_of_joining?: string;
    phone?: string;
    skills: string[];
}

const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "??";

const AVATAR_COLORS = ["#fa8029", "#60a5fa", "#34d399", "#a78bfa", "#f472b6", "#fbbf24"];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

// ─── Portal dropdown ──────────────────────────────────────────────────────────
interface DropdownPos { top: number; right: number }

interface ActionMenuProps {
    emp: Employee;
    pos: DropdownPos;
    onClose: () => void;
    onView: () => void;
    onEdit: () => void;
    onBlock: () => void;
}

function ActionMenu({ emp, pos, onClose, onView, onEdit, onBlock }: ActionMenuProps) {
    const blocked = emp.user_id?.is_blocked;

    return createPortal(
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[999]" onClick={onClose} />

            {/* Menu */}
            <div
                className="fixed z-[1000] w-44 bg-white border border-[#ebebeb] rounded-sm shadow-lg py-1 overflow-hidden"
                style={{ top: pos.top, right: pos.right }}
            >
                <button
                    onClick={() => { onClose(); onView(); }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] text-[#555] hover:bg-[#f7f7f7] transition-colors"
                >
                    <Eye size={13} className="text-[#bbb]" /> View Details
                </button>
                <button
                    onClick={() => { onClose(); onEdit(); }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] text-[#555] hover:bg-[#f7f7f7] transition-colors"
                >
                    <Edit2 size={13} className="text-[#bbb]" /> Edit Employee
                </button>
                <div className="border-t border-[#f5f5f5] my-1" />
                <button
                    onClick={() => { onClose(); onBlock(); }}
                    className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] font-medium transition-colors ${blocked
                        ? "text-emerald-600 hover:bg-emerald-50"
                        : "text-rose-500 hover:bg-rose-50"
                        }`}
                >
                    {blocked
                        ? <><CheckCircle size={13} /> Unblock</>
                        : <><ShieldAlert size={13} /> Block</>
                    }
                </button>
            </div>
        </>,
        document.body
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Employees() {
    const navigate = useNavigate();

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");

    // Dropdown state
    const [openId, setOpenId] = useState<string | null>(null);
    const [dropPos, setDropPos] = useState<DropdownPos>({ top: 0, right: 0 });
    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const limit = 8;

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await getEmployeesApi(page, limit, searchTerm);
                setEmployees(data.data);
                setTotal(data.total);
            } catch {
                setError("Failed to load employees");
            } finally {
                setLoading(false);
            }
        };
        const t = setTimeout(fetch, 400);
        return () => clearTimeout(t);
    }, [page, searchTerm]);

    const updateBlockStatus = (userId: string, is_blocked: boolean) =>
        setEmployees((prev) =>
            prev.map((emp) =>
                emp.user_id._id === userId
                    ? { ...emp, user_id: { ...emp.user_id, is_blocked } }
                    : emp
            )
        );

    const handleToggleBlock = async (userId: string) => {
        try {
            const data = await toggleBlockEmployeeApi(userId);
            updateBlockStatus(userId, data.isBlocked);
            toast.success(`Employee ${data.isBlocked ? "blocked" : "unblocked"} successfully`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update employee status");
        }
    };

    const openMenu = (empId: string) => {
        const btn = btnRefs.current[empId];
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        setDropPos({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right,
        });
        setOpenId(empId);
    };

    const columns: Column<Employee>[] = [
        {
            key: "employee",
            header: "Employee",
            render: (emp) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: avatarColor(emp.user_id?.name ?? "") }}
                    >
                        {getInitials(emp.user_id?.name ?? "")}
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold text-[#1f2124]">{emp.user_id?.name}</p>
                        <p className="text-[11px] text-[#bbb]">{emp.user_id?.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "designation",
            header: "Designation",
            render: (emp) => (
                <span className="text-[13px] text-[#555]">
                    {emp.designation || <span className="text-[#ddd]">—</span>}
                </span>
            ),
        },
        {
            key: "joined",
            header: "Joined",
            render: (emp) => (
                <span className="text-[12px] text-[#aaa]">{formatDate(emp.date_of_joining)}</span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (emp) => (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${emp.user_id?.is_blocked
                    ? "bg-rose-50 text-rose-500"
                    : "bg-emerald-50 text-emerald-600"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${emp.user_id?.is_blocked ? "bg-rose-400" : "bg-emerald-400"
                        }`} />
                    {emp.user_id?.is_blocked ? "Blocked" : "Active"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            align: "right",
            render: (emp) => (
                <div className="flex justify-end">
                    <button
                        ref={(el) => { btnRefs.current[emp._id] = el; }}
                        onClick={() => openMenu(emp._id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#bbb] hover:bg-[#f0f0f0] hover:text-[#555] transition-colors"
                    >
                        <MoreHorizontal size={15} />
                    </button>

                    {openId === emp._id && (
                        <ActionMenu
                            emp={emp}
                            pos={dropPos}
                            onClose={() => setOpenId(null)}
                            onView={() => navigate(`/company/employees/${emp.user_id._id}`)}
                            onEdit={() => navigate(`/company/employees/edit/${emp.user_id._id}`)}
                            onBlock={() => handleToggleBlock(emp.user_id._id)}
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <DataTable<Employee>
            rows={employees}
            columns={columns}
            keyExtractor={(emp) => emp._id}
            title="Employees"
            subtitle="Manage your company's team members"
            addLabel="Add Employee"
            onAdd={() => navigate("/company/employees/add")}
            searchValue={searchTerm}
            onSearchChange={(v) => { setSearchTerm(v); setPage(1); }}
            searchPlaceholder="Search employees…"
            loading={loading}
            error={error}
            page={page}
            totalRows={total}
            limit={limit}
            onPageChange={setPage}
            emptyIcon={<Users size={18} className="text-[#ddd]" />}
            emptyTitle="No employees yet"
            emptySubtitle="Add your first employee to get started."
            onEmptyAction={() => navigate("/company/employees/add")}
            emptyActionLabel="Add Employee"
        />
    );
}
