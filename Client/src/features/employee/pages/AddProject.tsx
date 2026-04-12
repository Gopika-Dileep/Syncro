import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Layout, Calendar, Info, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { createProjectApi, updateProjectApi, getProjectByIdApi, type ProjectFormData } from "@/features/employee/api/projectApi";
import { z } from "zod";

const projectSchema = z.object({
    name: z.string()
        .min(2, "Project name must be at least 2 characters")
        .regex(/^[^0-9]/, "Project name cannot start with a number"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    status: z.string(),
    priority: z.string(),
    start_date: z.string().min(1, "Start date is required"),
    target_date: z.string().min(1, "Target date is required"),
}).refine((data) => {
    const start = new Date(data.start_date);
    const target = new Date(data.target_date);
    return target > start;
}, {
    message: "Target date must be after the start date",
    path: ["target_date"]
});

export default function AddProject() {
    const { projectId } = useParams<{ projectId: string }>();
    const isEditMode = !!projectId;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<ProjectFormData>({
        name: "",
        description: "",
        status: "Active",
        priority: "Medium",
        start_date: "",
        target_date: ""
    });

    useEffect(() => {
        if (isEditMode && projectId) {
            const fetchProject = async () => {
                try {
                    const response = await getProjectByIdApi(projectId);
                    if (response.success && response.data) {
                        const p = response.data;
                        setFormData({
                            name: p.name || "",
                            description: p.description || "",
                            status: p.status || "Active",
                            priority: p.priority || "Medium",
                            start_date: p.start_date ? String(p.start_date).split('T')[0] : "",
                            target_date: p.target_date ? String(p.target_date).split('T')[0] : ""
                        });
                    }
                } catch (err) {
                    console.error("Fetch Project Error:", err);
                    toast.error("Failed to retrieve project details");
                } finally {
                    setFetching(false);
                }
            };
            fetchProject();
        }
    }, [projectId, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        
        try {
            projectSchema.parse(formData);
        } catch (err) {
            if (err instanceof z.ZodError) {
                const fieldErrors: Record<string, string> = {};
                err.issues.forEach(issue => {
                    if (issue.path.length > 0) {
                        fieldErrors[issue.path[0] as string] = issue.message;
                    }
                });
                setErrors(fieldErrors);
                return;
            }
        }

        setLoading(true);
        try {
            if (isEditMode && projectId) {
                await updateProjectApi(projectId, formData);
                toast.success("Project updated successfully");
            } else {
                await createProjectApi(formData);
                toast.success("New project initialized.");
            }
            setTimeout(() => navigate("/employee/projects"), 1000);
        } catch (err: unknown) {
            let backendMsg = "Something went wrong";
            if (axios.isAxiosError(err)) {
                backendMsg = err.response?.data?.message || err.message || backendMsg;
            }
            toast.error(backendMsg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[400px] gap-3 font-sans">
            <div className="w-5 h-5 border-2 border-[#ebebeb] border-t-[#1f2124] rounded-full animate-spin" />
            <p className="text-[12px] text-[#bbb]">Syncing project data...</p>
        </div>
    );

    return (
        <div className="p-4 md:p-6 font-sans flex flex-col gap-6 bg-[#f7f7f7] min-h-screen">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/employee/projects')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#aaa] hover:bg-white hover:text-[#1f2124] border border-transparent hover:border-[#ebebeb] transition-all"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-[14px] md:text-[16px] font-bold text-[#1f2124]">{isEditMode ? "Update Project" : "Initialize Project"}</h1>
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
                        {loading ? "Processing..." : (isEditMode ? "Save Changes" : "Create Project")}
                    </button>
                </div>
            </header>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                {/* 1. Core Details */}
                <div className="bg-white border border-[#ebebeb] rounded-sm flex flex-col shadow-sm">
                    <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center gap-2 bg-[#fafafa]/30">
                        <Layout size={14} className="text-[#fa8029]" />
                        <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1f2124]">Core Details</h2>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 gap-5 max-w-4xl">
                            <InputGroup
                                label="Project Name"
                                value={formData.name}
                                onChange={(v: string) => setFormData({ ...formData, name: v })}
                                placeholder="e.g. Q4 Website Redesign"
                                error={errors.name}
                            />
                            <div className="space-y-1.5 flex flex-col">
                                <label className="text-[11px] font-medium text-[#bbb] tracking-wide uppercase px-0.5">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    placeholder="Briefly describe the project goals and scope..."
                                    className={`w-full px-3.5 py-2.5 bg-[#fafafa] border ${errors.description ? 'border-rose-500/50' : 'border-[#ebebeb]'} rounded-sm text-[13px] font-semibold outline-none transition-all duration-200 focus:bg-white focus:border-[#fa8029]/50 shadow-sm`}
                                />
                                {errors.description && <span className="text-[10px] text-rose-500 font-medium px-0.5">{errors.description}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Configuration & Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status & Priority */}
                    <div className="bg-white border border-[#ebebeb] rounded-sm flex flex-col shadow-sm h-full">
                        <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center gap-2 bg-[#fafafa]/30">
                            <Info size={14} className="text-[#fa8029]" />
                            <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1f2124]">Configuration</h2>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <SelectGroup
                                label="Status"
                                value={formData.status}
                                options={[
                                    { label: 'Active', value: 'Active' },
                                    { label: 'On-Hold', value: 'On-Hold' },
                                    { label: 'Completed', value: 'Completed' }
                                ]}
                                onChange={(v: string) => setFormData({ ...formData, status: v })}
                                error={errors.status}
                            />
                            <SelectGroup
                                label="Priority"
                                value={formData.priority}
                                options={[
                                    { label: 'Low', value: 'Low' },
                                    { label: 'Medium', value: 'Medium' },
                                    { label: 'High', value: 'High' }
                                ]}
                                onChange={(v: string) => setFormData({ ...formData, priority: v })}
                                error={errors.priority}
                            />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white border border-[#ebebeb] rounded-sm flex flex-col shadow-sm h-full">
                        <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center gap-2 bg-[#fafafa]/30">
                            <Calendar size={14} className="text-[#fa8029]" />
                            <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#1f2124]">Timeline</h2>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <InputGroup
                                label="Start Date"
                                type="date"
                                value={formData.start_date}
                                onChange={(v: string) => setFormData({ ...formData, start_date: v })}
                                error={errors.start_date}
                            />
                            <InputGroup
                                label="Target Date"
                                type="date"
                                value={formData.target_date}
                                onChange={(v: string) => setFormData({ ...formData, target_date: v })}
                                error={errors.target_date}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

// ── UI HELPERS ────────────────────────────────────────────────────────────

interface InputGroupProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    error?: string;
}

function InputGroup({ label, value, onChange, type = "text", placeholder, error }: InputGroupProps) {
    return (
        <div className="space-y-1.5 flex-1 flex flex-col">
            <label className="text-[11px] font-medium text-[#bbb] tracking-wide uppercase px-0.5">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full px-3.5 py-2 rounded-sm border ${error ? 'border-rose-500/50' : 'border-[#ebebeb]'} bg-[#fafafa] text-[13px] font-semibold outline-none transition-all duration-200 focus:bg-white focus:border-[#fa8029]/50 shadow-sm`}
            />
            {error && <span className="text-[10px] text-rose-500 font-medium px-0.5">{error}</span>}
        </div>
    );
}

interface SelectGroupProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
    error?: string;
}

function SelectGroup({ label, value, onChange, options, placeholder, error }: SelectGroupProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className="relative space-y-1.5 flex-1 flex flex-col" ref={containerRef}>
            <label className="text-[11px] font-medium text-[#bbb] tracking-wide uppercase px-0.5">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-sm border ${error ? 'border-rose-500/50' : 'border-[#ebebeb]'} bg-[#fafafa] text-[13px] font-semibold outline-none transition-all duration-200 focus:bg-white focus:border-[#fa8029]/50 shadow-sm`}
            >
                <span className={selectedOption ? "text-[#1f2124]" : "text-[#bbb]"}>
                    {selectedOption ? selectedOption.label : (placeholder || "Select...")}
                </span>
                <ChevronDown size={14} className={`text-[#bbb] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {error && <span className="text-[10px] text-rose-500 font-medium px-0.5">{error}</span>}

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[#ebebeb] rounded-lg shadow-xl py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${value === opt.value
                                ? 'bg-[#fa8029]/10 text-[#fa8029] font-bold'
                                : 'text-[#555] hover:bg-[#f7f7f7]'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
