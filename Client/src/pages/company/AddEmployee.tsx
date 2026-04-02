import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft, ShieldCheck, ChevronDown, Check,
    Layout, Layers, Zap, CheckCircle, Users as UsersIcon
} from "lucide-react";
import { toast } from "sonner";
import {
    addEmployeeApi,
    getEmployeeDetailsApi,
    updateEmployeeApi,
    type AddEmployeeForm,
    type EmployeePermissions
} from "../../api/companyApi";
import { employeeSchema, getZodErrors, type EmployeeformInput } from "@/lib/schema";

const initialPermissions: EmployeePermissions = {
    project: { create: false, view: { team: false, all: false }, update: { team: false, all: false }, delete: false },
    userStory: { create: false, view: { all: false }, update: false, assign: false },
    sprint: { create: false, view: { all: false }, update: false, start: false, complete: false },
    task: { create: false, view: { team: false, all: false }, assign: { team: false, all: false }, update: { team: false, all: false } },
    team: { view: { team: false, all: false }, performance: { team: false, all: false } }
};

export default function AddEmployee() {
    const { userId } = useParams<{ userId: string }>();
    const isEditMode = !!userId;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EmployeeformInput, string>>>({});

    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", designation: "", date_of_joining: ""
    });

    const [permissions, setPermissions] = useState<EmployeePermissions>(initialPermissions);

    useEffect(() => {
        if (isEditMode && userId) {
            const fetchEmployee = async () => {
                try {
                    const response = await getEmployeeDetailsApi(userId);
                    if (response.success) {
                        const emp = response.data;
                        setFormData({
                            name: emp.user_id.name,
                            email: emp.user_id.email,
                            phone: emp.phone || "",
                            designation: emp.designation || "",
                            date_of_joining: emp.date_of_joining ? new Date(emp.date_of_joining).toISOString().split('T')[0] : "",
                        });
                        if (emp.permissions) setPermissions(emp.permissions);
                    }
                } catch { toast.error("Failed to fetch profile"); } finally { setFetching(false); }
            };
            fetchEmployee();
        }
    }, [userId, isEditMode]);

    const handlePermissionToggle = (module: keyof EmployeePermissions, field: string, subField?: string) => {
        setPermissions((prev) => {
            const updatedModule = { ...prev[module] } as Record<string, boolean | Record<string, boolean>>;
            if (subField) {
                const currentField = updatedModule[field] as Record<string, boolean>;
                const newValue = !currentField[subField];
                updatedModule[field] = { ...currentField, [subField]: newValue };
                const updated = updatedModule[field] as Record<string, boolean>;
                if (newValue) {
                    if (subField === 'team' && 'all' in updated) updated.all = false;
                    if (subField === 'all' && 'team' in updated) updated.team = false;
                }
            } else {
                updatedModule[field] = !updatedModule[field] as boolean;
            }
            return { ...prev, [module]: updatedModule as EmployeePermissions[typeof module] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});
        try {
            const validation = employeeSchema.safeParse(formData);
            if (!validation.success) {
                setFieldErrors(getZodErrors(validation.error) as Partial<Record<keyof EmployeeformInput, string>>);
                setLoading(false);
                return;
            }
            const finalData: AddEmployeeForm = { ...formData, permissions };
            if (isEditMode && userId) {
                await updateEmployeeApi(userId, finalData);
                toast.success("Database synchronized.");
            } else {
                await addEmployeeApi(finalData);
                toast.success("New account provisioned.");
            }
            setTimeout(() => navigate("/company/employees"), 1000);
        } catch (err: unknown) {
            let backendMsg = "Something went wrong";
            if (axios.isAxiosError(err)) {
                backendMsg = err.response?.data?.message || err.message || backendMsg;
            } else if (err instanceof Error) {
                backendMsg = err.message;
            }

            if (backendMsg.toLowerCase().includes("email already exists")) {
                setFieldErrors(prev => ({ ...prev, email: "This email is already registered." }));
            } else {
                toast.error(backendMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[400px] gap-3 font-sans">
            <div className="w-5 h-5 border-2 border-[#ebebeb] border-t-[#1f2124] rounded-full animate-spin" />
            <p className="text-[12px] text-[#bbb]">Fetching details...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-6 font-sans flex flex-col gap-6 bg-[#f7f7f7] min-h-screen">

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/company/employees')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#aaa] hover:bg-white hover:text-[#1f2124] border border-transparent hover:border-[#ebebeb] transition-all"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-[14px] md:text-[16px] font-bold text-[#1f2124]">{isEditMode ? "Edit Employee" : "Add Employee"}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        type="button"
                        className="text-[12px] font-semibold text-[#888] hover:text-[#1f2124] transition-colors px-2"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#fa8029] hover:bg-[#e67320] text-white px-5 py-2.5 rounded-full font-bold text-[11px] md:text-[12px] transition-all active:scale-95 whitespace-nowrap shadow-sm shadow-orange-950/20"
                    >
                        {loading ? "Saving..." : (isEditMode ? "Save Changes" : "Commit Access")}
                    </button>
                </div>
            </header>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

                {/* 1. Identity Form Card */}
                <div className="bg-white border border-[#ebebeb] rounded-sm overflow-hidden flex flex-col shadow-sm">
                    <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center gap-2 bg-[#fafafa]/30 font-sans">
                        <UsersIcon size={14} className="text-[#fa8029]" />
                        <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1f2124]">Identity Details</h2>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 max-w-5xl">
                            <InputGroup
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={(v: string) => {
                                    setFormData({ ...formData, name: v });
                                    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                                }}
                                error={fieldErrors.name}
                            />
                            <InputGroup
                                label="Email Address"
                                name="email"
                                value={formData.email}
                                onChange={(v: string) => {
                                    setFormData({ ...formData, email: v });
                                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                                }}
                                error={fieldErrors.email}
                                isReadOnly={isEditMode}
                            />
                            <InputGroup
                                label="Phone Number"
                                name="phone"
                                value={formData.phone}
                                onChange={(v: string) => {
                                    setFormData({ ...formData, phone: v });
                                    if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: undefined }));
                                }}
                                error={fieldErrors.phone}
                            />
                            <InputGroup
                                label="Designation"
                                name="designation"
                                value={formData.designation}
                                onChange={(v: string) => {
                                    setFormData({ ...formData, designation: v });
                                    if (fieldErrors.designation) setFieldErrors(prev => ({ ...prev, designation: undefined }));
                                }}
                                error={fieldErrors.designation}
                            />
                            <InputGroup
                                label="Date of Joining"
                                name="date_of_joining"
                                value={formData.date_of_joining}
                                onChange={(v: string) => {
                                    setFormData({ ...formData, date_of_joining: v });
                                    if (fieldErrors.date_of_joining) setFieldErrors(prev => ({ ...prev, date_of_joining: undefined }));
                                }}
                                error={fieldErrors.date_of_joining}
                                type="date"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Access Card */}
                <div className="bg-white border border-[#ebebeb] rounded-sm flex flex-col shadow-sm">
                    <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center gap-2 bg-[#fafafa]/30">
                        <ShieldCheck size={14} className="text-[#fa8029]" />
                        <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1f2124]">Access Permissions</h2>
                    </div>

                    <div className="p-5 space-y-2">
                        <ModuleItem
                            icon={<Layout size={13} />} title="Project Management"
                            items={[
                                { label: "Create", checked: permissions.project.create, onClick: () => handlePermissionToggle('project', 'create') },
                                { label: "View Team", checked: permissions.project.view.team, onClick: () => handlePermissionToggle('project', 'view', 'team') },
                                { label: "View All", checked: permissions.project.view.all, onClick: () => handlePermissionToggle('project', 'view', 'all') },
                                { label: "Update Team", checked: permissions.project.update.team, onClick: () => handlePermissionToggle('project', 'update', 'team') },
                                { label: "Update All", checked: permissions.project.update.all, onClick: () => handlePermissionToggle('project', 'update', 'all') },
                                { label: "Delete", checked: permissions.project.delete, onClick: () => handlePermissionToggle('project', 'delete') },
                            ]}
                        />
                        <ModuleItem
                            icon={<Layers size={13} />} title="User Story (Backlog)"
                            items={[
                                { label: "Create", checked: permissions.userStory.create, onClick: () => handlePermissionToggle('userStory', 'create') },
                                { label: "View All", checked: permissions.userStory.view.all, onClick: () => handlePermissionToggle('userStory', 'view', 'all') },
                                { label: "Update", checked: permissions.userStory.update, onClick: () => handlePermissionToggle('userStory', 'update') },
                                { label: "Assign", checked: permissions.userStory.assign, onClick: () => handlePermissionToggle('userStory', 'assign') },
                            ]}
                        />
                        <ModuleItem
                            icon={<Zap size={13} />} title="Sprint Planning"
                            items={[
                                { label: "Create", checked: permissions.sprint.create, onClick: () => handlePermissionToggle('sprint', 'create') },
                                { label: "View All", checked: permissions.sprint.view.all, onClick: () => handlePermissionToggle('sprint', 'view', 'all') },
                                { label: "Update", checked: permissions.sprint.update, onClick: () => handlePermissionToggle('sprint', 'update') },
                                { label: "Start", checked: permissions.sprint.start, onClick: () => handlePermissionToggle('sprint', 'start') },
                                { label: "Complete", checked: permissions.sprint.complete, onClick: () => handlePermissionToggle('sprint', 'complete') },
                            ]}
                        />
                        <ModuleItem
                            icon={<CheckCircle size={13} />} title="Task Workflow"
                            items={[
                                { label: "Create", checked: permissions.task.create, onClick: () => handlePermissionToggle('task', 'create') },
                                { label: "View Team", checked: permissions.task.view.team, onClick: () => handlePermissionToggle('task', 'view', 'team') },
                                { label: "View All", checked: permissions.task.view.all, onClick: () => handlePermissionToggle('task', 'view', 'all') },
                                { label: "Assign Team", checked: permissions.task.assign.team, onClick: () => handlePermissionToggle('task', 'assign', 'team') },
                                { label: "Assign All", checked: permissions.task.assign.all, onClick: () => handlePermissionToggle('task', 'assign', 'all') },
                                { label: "Update Team", checked: permissions.task.update.team, onClick: () => handlePermissionToggle('task', 'update', 'team') },
                                { label: "Update All", checked: permissions.task.update.all, onClick: () => handlePermissionToggle('task', 'update', 'all') },
                            ]}
                        />
                        <ModuleItem
                            icon={<UsersIcon size={13} />} title="Team Dynamics"
                            items={[
                                { label: "View Team", checked: permissions.team.view.team, onClick: () => handlePermissionToggle('team', 'view', 'team') },
                                { label: "View All", checked: permissions.team.view.all, onClick: () => handlePermissionToggle('team', 'view', 'all') },
                                { label: "Performance (T)", checked: permissions.team.performance.team, onClick: () => handlePermissionToggle('team', 'performance', 'team') },
                                { label: "Performance (A)", checked: permissions.team.performance.all, onClick: () => handlePermissionToggle('team', 'performance', 'all') },
                            ]}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}

// ── UI HELPERS ────────────────────────────────────────────────────────────

interface ModuleItemProps {
    icon: React.ReactNode;
    title: string;
    items: { label: string; checked: boolean; onClick: () => void }[];
}

function ModuleItem({ icon, title, items }: ModuleItemProps) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-[#f5f5f5] last:border-0 overflow-hidden transition-all duration-300">
            <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-3 hover:bg-[#fafafa] px-2 rounded-sm transition-colors group">
                <div className="flex items-center gap-3">
                    <div className="text-[#bbb] group-hover:text-[#fa8029] transition-colors">{icon}</div>
                    <p className="text-[11px] font-semibold text-[#555] group-hover:text-[#1f2124] uppercase tracking-wide">{title}</p>
                </div>
                <ChevronDown size={14} className={`transition-transform text-[#bbb] ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="pb-5 pt-1 px-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {items.map((it, i) => (
                        <button key={i} type="button" onClick={it.onClick} className={`flex items-center gap-2 p-2 rounded-sm border transition-all ${it.checked ? 'bg-[#1f2124] border-[#1f2124] text-white shadow-sm' : 'bg-transparent border-[#f0f0f0] text-[#999] hover:border-[#fa8029]/30'}`}>
                            <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${it.checked ? 'bg-[#fa8029] border-[#fa8029]' : 'border-[#ddd]'}`}>
                                {it.checked && <Check size={8} strokeWidth={4} className="text-white" />}
                            </div>
                            <span className="text-[10px] font-medium tracking-tight truncate">{it.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

interface InputGroupProps {
    label: string;
    name: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    required?: boolean;
    isReadOnly?: boolean;
    error?: string;
}

function InputGroup({ label, name, value, onChange, type = "text", required, isReadOnly, error }: InputGroupProps) {
    return (
        <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[11px] font-medium text-[#bbb] tracking-wide uppercase px-0.5">{label}</label>
            <input
                name={name}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                readOnly={isReadOnly}
                className={`w-full px-3.5 py-2 rounded-sm border text-[13px] font-semibold outline-none transition-all duration-200 ${error
                    ? 'border-rose-300 bg-rose-50/20 focus:border-rose-500'
                    : isReadOnly
                        ? 'bg-[#f7f7f7] border-[#ebebeb] text-[#bbb] cursor-not-allowed'
                        : 'bg-[#fafafa] border-[#ebebeb] focus:bg-white focus:border-[#fa8029]/50 shadow-sm'
                    }`}
            />
            {error && <p className="text-[10px] font-bold text-rose-500 px-0.5">{error}</p>}
        </div>
    );
}
