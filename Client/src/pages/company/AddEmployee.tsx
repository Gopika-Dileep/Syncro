import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    ArrowLeft, ShieldCheck, ChevronDown, Check, Loader2, 
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
    // const [error, setError] = useState(""); // Removed
    // const [success, setSuccess] = useState(""); // Removed

    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EmployeeformInput, string>>>({})

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
                } catch (err) { toast.error("Failed to fetch profile"); } finally { setFetching(false); }
            };
            fetchEmployee();
        }
    }, [userId, isEditMode]);

    const handlePermissionToggle = (module: keyof EmployeePermissions, field: string, subField?: string) => {
        setPermissions((prev) => {
            const updatedModule = { ...prev[module] } as any;
            if (subField) {
                const newValue = !updatedModule[field][subField];
                updatedModule[field] = { ...updatedModule[field], [subField]: newValue };
                
                // Mutually exclusive logic: if scope 'team' is enabled, disable 'all', and vice-versa.
                if (newValue) {
                    if (subField === 'team') updatedModule[field].all = false;
                    if (subField === 'all') updatedModule[field].team = false;
                }
            } else {
                updatedModule[field] = !updatedModule[field];
            }
            return { ...prev, [module]: updatedModule };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // setError(""); // Removed
        setFieldErrors({});
        try {
            const validation = employeeSchema.safeParse(formData);

            if (!validation.success) {
                setFieldErrors(getZodErrors(validation.error) as any);
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
        } catch (err: any) {
            const backendMsg = err.response?.data?.message || err.message || "Something went wrong";
            if (backendMsg.toLowerCase().includes("email already exists")) {
                setFieldErrors(prev => ({ ...prev, email: "This email is already registered." }));
            } else {
                toast.error(backendMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 bg-[#fbfcfd] min-h-screen">
            <header className="flex items-center gap-4 mb-10">
                <button onClick={() => navigate(-1)} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-slate-900">{isEditMode ? "Modify Staff Access" : "Provision New Access"}</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Syncro Internal Identity Manager</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} noValidate className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <UsersIcon size={16} className="text-slate-400" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">Identity Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Permissions In Specified Order */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheck size={16} className="text-slate-400" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-slate-800">RBAC Permission Matrix</h2>
                    </div>

                    <div className="space-y-4">
                        {/* 1. PROJECT */}
                        <ModuleItem 
                            icon={<Layout size={16}/>} title="Project Management" description="Create, view, and update company projects"
                            items={[
                                { label: "+ Create", checked: permissions.project.create, onClick: () => handlePermissionToggle('project', 'create') },
                                { label: "View Team", scope: "team", checked: permissions.project.view.team, onClick: () => handlePermissionToggle('project', 'view', 'team') },
                                { label: "View All", scope: "all", checked: permissions.project.view.all, onClick: () => handlePermissionToggle('project', 'view', 'all') },
                                { label: "Update Team", scope: "team", checked: permissions.project.update.team, onClick: () => handlePermissionToggle('project', 'update', 'team') },
                                { label: "Update All", scope: "all", checked: permissions.project.update.all, onClick: () => handlePermissionToggle('project', 'update', 'all') },
                                { label: "Delete", action: "x", checked: permissions.project.delete, onClick: () => handlePermissionToggle('project', 'delete') },
                            ]}
                        />

                        {/* 2. USER STORY */}
                        <ModuleItem 
                            icon={<Layers size={16}/>} title="User Story (Backlog)" description="Manage product backlog and story assignments"
                            items={[
                                { label: "+ Create", checked: permissions.userStory.create, onClick: () => handlePermissionToggle('userStory', 'create') },
                                { label: "View All", scope: "all", checked: permissions.userStory.view.all, onClick: () => handlePermissionToggle('userStory', 'view', 'all') },
                                { label: "Update Any", checked: permissions.userStory.update, onClick: () => handlePermissionToggle('userStory', 'update') },
                                { label: "Assign/Move", checked: permissions.userStory.assign, onClick: () => handlePermissionToggle('userStory', 'assign') },
                            ]}
                        />

                        {/* 3. SPRINT */}
                        <ModuleItem 
                            icon={<Zap size={16}/>} title="Sprint Planning" description="Create and manage development sprints"
                            items={[
                                { label: "+ Create", checked: permissions.sprint.create, onClick: () => handlePermissionToggle('sprint', 'create') },
                                { label: "View All", scope: "all", checked: permissions.sprint.view.all, onClick: () => handlePermissionToggle('sprint', 'view', 'all') },
                                { label: "Update Details", checked: permissions.sprint.update, onClick: () => handlePermissionToggle('sprint', 'update') },
                                { label: "Start Sprint", checked: permissions.sprint.start, onClick: () => handlePermissionToggle('sprint', 'start') },
                                { label: "Complete Sprint", checked: permissions.sprint.complete, onClick: () => handlePermissionToggle('sprint', 'complete') },
                            ]}
                        />

                        {/* 4. TASK */}
                        <ModuleItem 
                            icon={<CheckCircle size={16}/>} title="Task & Workflow" description="Granular task assignments and state updates"
                            items={[
                                { label: "+ Create", checked: permissions.task.create, onClick: () => handlePermissionToggle('task', 'create') },
                                { label: "View Team", scope: "team", checked: permissions.task.view.team, onClick: () => handlePermissionToggle('task', 'view', 'team') },
                                { label: "View All", scope: "all", checked: permissions.task.view.all, onClick: () => handlePermissionToggle('task', 'view', 'all') },
                                { label: "Assign Team", scope: "team", checked: permissions.task.assign.team, onClick: () => handlePermissionToggle('task', 'assign', 'team') },
                                { label: "Assign All", scope: "all", checked: permissions.task.assign.all, onClick: () => handlePermissionToggle('task', 'assign', 'all') },
                                { label: "Update Team", scope: "team", checked: permissions.task.update.team, onClick: () => handlePermissionToggle('task', 'update', 'team') },
                                { label: "Update All", scope: "all", checked: permissions.task.update.all, onClick: () => handlePermissionToggle('task', 'update', 'all') },
                            ]}
                        />

                        {/* 5. TEAM */}
                        <ModuleItem 
                            icon={<UsersIcon size={16}/>} title="Team Dynamics" description="Manage team roster and monitor performance"
                            items={[
                                { label: "View Team", scope: "team", checked: permissions.team.view.team, onClick: () => handlePermissionToggle('team', 'view', 'team') },
                                { label: "View All Teams", scope: "all", checked: permissions.team.view.all, onClick: () => handlePermissionToggle('team', 'view', 'all') },
                                { label: "Performance (Team)", checked: permissions.team.performance.team, onClick: () => handlePermissionToggle('team', 'performance', 'team') },
                                { label: "Performance (All)", checked: permissions.team.performance.all, onClick: () => handlePermissionToggle('team', 'performance', 'all') },
                            ]}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pb-10">
                    <button type="submit" disabled={loading} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all disabled:opacity-50">
                        {loading ? "Synchronizing..." : (isEditMode ? "Save Synchronization" : "Commit Access")}
                    </button>
                </div>
            </form>
        </div>
    );
}

// ----------------------------------------------------
// UI HELPERS
// ----------------------------------------------------

function ModuleItem({ icon, title, description, items }: any) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-slate-100 rounded-3xl overflow-hidden transition-all duration-300">
            <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 bg-slate-50/50 hover:bg-slate-50">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">{icon}</div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-900">{title}</p>
                        <p className="text-[10px] font-medium text-slate-400">{description}</p>
                    </div>
                </div>
                <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white border-t border-slate-100">
                    {items.map((it: any, i: number) => (
                        <div key={i} className="flex flex-col gap-1">
                            <button type="button" onClick={it.onClick} className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${it.checked ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border-2 ${it.checked ? 'bg-white/20 border-white/20' : 'border-slate-100'}`}>
                                    {it.checked && <Check size={8} strokeWidth={4} />}
                                </div>
                                <span className="text-xs font-bold">{it.label}</span>
                            </button>
                            {it.scope && <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-4 italic">{it.scope}</span>}
                        </div>
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
            <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
            </div>
            
            <input 
                name={name} 
                type={type} 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                required={required} 
                readOnly={isReadOnly}
                className={`w-full px-5 py-3.5 rounded-2xl border text-sm font-bold outline-none transition-all duration-200 ${
                    error 
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500' 
                        : isReadOnly 
                            ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-white border-slate-200 focus:border-slate-900 group-hover:border-slate-300'
                }`} 
            />
            {error && <p className="text-[10px] font-bold text-rose-500 px-2 animate-in fade-in slide-in-from-top-1">{error}</p>}
        </div>
    );
}
