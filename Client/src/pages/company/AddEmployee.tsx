import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, ShieldCheck, Search, Filter, ChevronDown, Check } from "lucide-react";
import { addEmployeeApi, type AddEmployeeForm, type EmployeePermissions, type PermissionScopes } from "../../api/companyApi";

type ModuleKey = keyof EmployeePermissions;

interface PermissionItem {
    label: string;
    checked: boolean;
    onClick: () => void;
}

interface PermissionModuleProps {
    title: string;
    description: string;
    perms: PermissionItem[];
    defaultOpen?: boolean;
}

const initialPermissions: EmployeePermissions = {
    project: {
        view: { own: true, team: true, all: false },
        create: false,
        update: { own: true, team: true, all: false },
        delete: false,
        archive: false,
        assign: false,
        unassign: false,
    },
    userStory: {
        view: { own: true, team: true, all: false },
        create: false,
        update: { own: true, team: true, all: false },
        delete: false,
        assign: false,
        addToSprint: false,
        removeFromSprint: false,
        changeStatus: false,
    },
    sprint: {
        view: { own: true, all: false },
        create: false,
        update: false,
        delete: false,
        addItems: false,
        removeItems: false,
        start: false,
        complete: false,
    },
    task: {
        view: { own: true, team: true, all: false },
        create: true,
        update: { own: true, team: true, all: false },
        delete: { own: true, team: false, all: false },
        assign: true,
        changeStatus: true,
        addSubtask: true,
        addComment: true,
    }
};

export default function AddEmployee() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        designation: "",
        date_of_joining: "",
        date_of_birth: "",
        address: "",
        skills: ""
    });

    const [permissions, setPermissions] = useState<EmployeePermissions>(initialPermissions);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePermissionToggle = (module: ModuleKey, action: string, scope?: keyof PermissionScopes) => {
        setPermissions((prev) => {
            const updatedModule = { ...prev[module] };
            if (scope) {
                const actionKey = action as keyof typeof updatedModule;
                const currentActionValue = updatedModule[actionKey] as PermissionScopes;
                (updatedModule[actionKey] as PermissionScopes) = {
                    ...currentActionValue,
                    [scope]: !currentActionValue[scope]
                };
            } else {
                const actionKey = action as keyof typeof updatedModule;
                (updatedModule[actionKey] as boolean) = !updatedModule[actionKey];
            }
            return { ...prev, [module]: updatedModule };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const finalData: AddEmployeeForm = { ...formData, permissions };
            await addEmployeeApi(finalData);
            setSuccess("Employee added successfully! Invitation email sent.");
            setTimeout(() => navigate("/company/employees"), 2000);
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded-lg transition text-gray-500"
                >
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Add New Employee</h1>
                    <p className="text-gray-400 text-xs mt-0.5">Create employee account with granular permission controls</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
                            <User size={13} className="text-blue-600" />
                        </div>
                        <h2 className="text-sm font-semibold text-gray-800">Basic Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: "Full Name", name: "name", placeholder: "Enter name", required: true },
                            { label: "Email Address", name: "email", placeholder: "mail@syncro.com", required: true, type: "email" },
                            { label: "Phone Number", name: "phone", placeholder: "+1 (555) 000-0000" },
                            { label: "Designation", name: "designation", placeholder: "e.g. Senior Developer", required: true },
                        ].map((field) => (
                            <div key={field.name}>
                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    {field.label} {field.required && <span className="text-red-400">*</span>}
                                </label>
                                <input
                                    name={field.name}
                                    type={field.type || "text"}
                                    value={(formData as never)[field.name]}
                                    onChange={handleInputChange}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 placeholder-gray-400 transition"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Access Permissions */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 bg-violet-50 rounded-md flex items-center justify-center">
                            <ShieldCheck size={13} className="text-violet-600" />
                        </div>
                        <h2 className="text-sm font-semibold text-gray-800">Access Permissions</h2>
                    </div>
                    <p className="text-xs text-gray-400 mb-5 ml-8">Configure detailed module and action-level permissions</p>

                    <div className="flex gap-3 mb-5">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                placeholder="Search permissions..."
                                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none text-gray-700 placeholder-gray-400"
                            />
                        </div>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-gray-500 text-xs hover:bg-gray-50 transition"
                        >
                            <Filter size={13} />
                            All Categories
                            <ChevronDown size={13} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <PermissionModule
                            title="Projects"
                            description="Create and manage projects"
                            defaultOpen
                            perms={[
                                { label: "View Own", checked: permissions.project.view.own, onClick: () => handlePermissionToggle('project', 'view', 'own') },
                                { label: "View Team", checked: permissions.project.view.team ?? false, onClick: () => handlePermissionToggle('project', 'view', 'team') },
                                { label: "View All", checked: permissions.project.view.all, onClick: () => handlePermissionToggle('project', 'view', 'all') },
                                { label: "Create", checked: permissions.project.create, onClick: () => handlePermissionToggle('project', 'create') },
                                { label: "Update Own", checked: permissions.project.update.own, onClick: () => handlePermissionToggle('project', 'update', 'own') },
                                { label: "Update Team", checked: permissions.project.update.team ?? false, onClick: () => handlePermissionToggle('project', 'update', 'team') },
                                { label: "Update All", checked: permissions.project.update.all, onClick: () => handlePermissionToggle('project', 'update', 'all') },
                                { label: "Delete", checked: permissions.project.delete, onClick: () => handlePermissionToggle('project', 'delete') },
                            ]}
                        />
                        <PermissionModule
                            title="User Stories"
                            description="Create and manage user stories"
                            perms={[
                                { label: "View Own", checked: permissions.userStory.view.own, onClick: () => handlePermissionToggle('userStory', 'view', 'own') },
                                { label: "View Team", checked: permissions.userStory.view.team ?? false, onClick: () => handlePermissionToggle('userStory', 'view', 'team') },
                                { label: "View All", checked: permissions.userStory.view.all, onClick: () => handlePermissionToggle('userStory', 'view', 'all') },
                                { label: "Create", checked: permissions.userStory.create, onClick: () => handlePermissionToggle('userStory', 'create') },
                                { label: "Update All", checked: permissions.userStory.update.all, onClick: () => handlePermissionToggle('userStory', 'update', 'all') },
                                { label: "Assign", checked: permissions.userStory.assign, onClick: () => handlePermissionToggle('userStory', 'assign') },
                                { label: "Change Status", checked: permissions.userStory.changeStatus, onClick: () => handlePermissionToggle('userStory', 'changeStatus') },
                            ]}
                        />
                        <PermissionModule
                            title="Sprints"
                            description="Plan and manage sprints"
                            perms={[
                                { label: "View Own", checked: permissions.sprint.view.own, onClick: () => handlePermissionToggle('sprint', 'view', 'own') },
                                { label: "View All", checked: permissions.sprint.view.all, onClick: () => handlePermissionToggle('sprint', 'view', 'all') },
                                { label: "Create", checked: permissions.sprint.create, onClick: () => handlePermissionToggle('sprint', 'create') },
                                { label: "Update", checked: permissions.sprint.update, onClick: () => handlePermissionToggle('sprint', 'update') },
                                { label: "Add Items", checked: permissions.sprint.addItems, onClick: () => handlePermissionToggle('sprint', 'addItems') },
                                { label: "Start Sprint", checked: permissions.sprint.start, onClick: () => handlePermissionToggle('sprint', 'start') },
                                { label: "Complete Sprint", checked: permissions.sprint.complete, onClick: () => handlePermissionToggle('sprint', 'complete') },
                            ]}
                        />
                        <PermissionModule
                            title="Tasks"
                            description="Create, assign, and track tasks"
                            perms={[
                                { label: "View Own", checked: permissions.task.view.own, onClick: () => handlePermissionToggle('task', 'view', 'own') },
                                { label: "View Team", checked: permissions.task.view.team ?? false, onClick: () => handlePermissionToggle('task', 'view', 'team') },
                                { label: "View All", checked: permissions.task.view.all, onClick: () => handlePermissionToggle('task', 'view', 'all') },
                                { label: "Create", checked: permissions.task.create, onClick: () => handlePermissionToggle('task', 'create') },
                                { label: "Update Own", checked: permissions.task.update.own, onClick: () => handlePermissionToggle('task', 'update', 'own') },
                                { label: "Delete Own", checked: permissions.task.delete.own, onClick: () => handlePermissionToggle('task', 'delete', 'own') },
                                { label: "Change Status", checked: permissions.task.changeStatus, onClick: () => handlePermissionToggle('task', 'changeStatus') },
                                { label: "Add Comment", checked: permissions.task.addComment, onClick: () => handlePermissionToggle('task', 'addComment') },
                            ]}
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pb-10">
                    {error && <p className="text-red-500 text-xs mr-auto">{error}</p>}
                    {success && <p className="text-green-600 text-xs mr-auto font-medium">{success}</p>}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-black disabled:opacity-50 transition font-medium"
                    >
                        {loading ? "Adding..." : "Add Employee"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function PermissionModule({ title, description, perms, defaultOpen = false }: PermissionModuleProps) {
    const [open, setOpen] = useState(defaultOpen);
    const checkedCount = perms.filter(p => p.checked).length;

    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            {/* Header */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
                <div className="flex items-center gap-3">
                    <ChevronDown
                        size={15}
                        className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
                    />
                    <div>
                        <p className="text-sm font-medium text-gray-800">{title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{description}</p>
                    </div>
                </div>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                    checkedCount > 0
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                }`}>
                    {checkedCount}/{perms.length}
                </span>
            </button>

            {/* Permission Grid */}
            {open && (
                <div className="px-5 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white">
                    {perms.map((p, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={p.onClick}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all duration-150 ${
                                p.checked
                                    ? "bg-gray-900 border-gray-900 text-white"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                        >
                            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                                p.checked
                                    ? "bg-white/20"
                                    : "border border-gray-300"
                            }`}>
                                {p.checked && <Check size={10} strokeWidth={3} className="text-white" />}
                            </div>
                            <span className="text-xs font-medium leading-tight">{p.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}