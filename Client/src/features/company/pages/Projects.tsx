import { useEffect, useState, useMemo } from "react";
import { 
    Search, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    Circle,
    MoreVertical,
    Plus,
    X,
    Layout,
    ArrowLeft,
    ArrowRight
} from "lucide-react";
import { 
    getProjectsApi, 
    createProjectApi, 
    updateProjectApi, 
    deleteProjectApi, 
    type Project, 
    type ProjectFormData 
} from "@/features/company/api/projectApi";
import { toast } from "sonner";
import axios from "axios";

const STATUS_COLUMNS = [
    { id: "Active", label: "Active", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "On-Hold", label: "On Hold", icon: Circle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "Completed", label: "Completed", icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" }
];

const PRIORITIES = ["Low", "Medium", "High"];

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 50; // Kanban shows more

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState<ProjectFormData>({
        name: "",
        description: "",
        status: "Active",
        priority: "Medium",
        start_date: new Date().toISOString().split('T')[0],
        target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchProjects();
    }, [page, searchTerm]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await getProjectsApi(page, limit, searchTerm);
            setProjects(response.data || []);
            setTotal(response.total || 0);
        } catch (err: unknown) {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (project?: Project) => {
        if (project) {
            setIsEditing(true);
            setCurrentProject(project);
            setFormData({
                name: project.name,
                description: project.description,
                status: project.status,
                priority: project.priority,
                start_date: new Date(project.start_date).toISOString().split('T')[0],
                target_date: new Date(project.target_date).toISOString().split('T')[0]
            });
        } else {
            setIsEditing(false);
            setCurrentProject(null);
            setFormData({
                name: "",
                description: "",
                status: "Active",
                priority: "Medium",
                start_date: new Date().toISOString().split('T')[0],
                target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && currentProject) {
                const res = await updateProjectApi(currentProject._id, formData);
                toast.success(res.message || "Project updated");
            } else {
                const res = await createProjectApi(formData);
                toast.success(res.message || "Project created");
            }
            setIsModalOpen(false);
            fetchProjects();
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || "Operation failed");
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            const res = await deleteProjectApi(id);
            toast.success(res.message || "Project deleted");
            fetchProjects();
        } catch (err: unknown) {
            toast.error("Failed to delete project");
        }
    };

    const groupedProjects = useMemo(() => {
        const groups: Record<string, Project[]> = { "Active": [], "On-Hold": [], "Completed": [] };
        projects.forEach(p => {
            if (groups[p.status]) groups[p.status].push(p);
            else groups["Active"].push(p);
        });
        return groups;
    }, [projects]);

    const getPriorityStyles = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'low': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="p-6 space-y-6 max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Project Matrix</h1>
                    <p className="text-sm text-muted-foreground">Strategic overview of organizational initiatives</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search projects..." 
                            className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <Plus size={16} /> New Project
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            {loading && projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm text-muted-foreground animate-pulse font-medium">Synchronizing board...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {STATUS_COLUMNS.map((column) => (
                        <div key={column.id} className="flex flex-col gap-4 bg-secondary/10 rounded-2xl p-4 border border-border/40 min-h-[500px]">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${column.bg} ${column.color}`}>
                                        <column.icon size={16} />
                                    </div>
                                    <h3 className="font-bold text-[14px] text-foreground">{column.label}</h3>
                                    <span className="px-2 py-0.5 bg-background border border-border rounded-full text-[10px] font-bold text-muted-foreground">
                                        {groupedProjects[column.id].length}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {groupedProjects[column.id].map((project) => (
                                    <div 
                                        key={project._id}
                                        className="group bg-card border border-border hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 rounded-xl p-4 transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyles(project.priority)}`}>
                                                {project.priority}
                                            </div>
                                            <div className="relative group/menu">
                                                <button className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                                                    <MoreVertical size={14} />
                                                </button>
                                                <div className="absolute right-0 top-full mt-1 hidden group-hover/menu:block z-20 w-36 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
                                                    <button 
                                                        onClick={() => handleOpenModal(project)}
                                                        className="w-full text-left px-4 py-2.5 text-[12px] font-medium hover:bg-secondary transition-colors"
                                                    >
                                                        Edit Project
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(project._id)}
                                                        className="w-full text-left px-4 py-2.5 text-[12px] font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-foreground text-[13px] group-hover:text-primary transition-colors mb-2 line-clamp-1">
                                            {project.name}
                                        </h4>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                                            {project.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                                                <Calendar size={12} className="text-primary/60" />
                                                <span>{new Date(project.target_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-border">
                                                {project.name.charAt(0)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {groupedProjects[column.id].length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border/40 rounded-xl opacity-40">
                                        <p className="text-[10px] uppercase font-bold tracking-widest">Empty</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {total > limit && (
                <div className="flex items-center justify-center gap-4 mt-4">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2 border border-border rounded-xl hover:bg-secondary disabled:opacity-30 transition-all"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <span className="text-sm font-bold text-muted-foreground">Page {page} of {Math.ceil(total / limit)}</span>
                    <button 
                        disabled={page * limit >= total}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2 border border-border rounded-xl hover:bg-secondary disabled:opacity-30 transition-all"
                    >
                        <ArrowRight size={16} />
                    </button>
                </div>
            )}

            {/* Project Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-secondary/10">
                            <div>
                                <h2 className="text-lg font-black text-foreground uppercase tracking-tight">
                                    {isEditing ? "Project Configuration" : "New Initiative"}
                                </h2>
                                <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                                    {isEditing ? "Modify existing project scope" : "Define the scope of your new workspace"}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Project Name</label>
                                <input 
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/50 transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Project Catalyst"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Strategic Description</label>
                                <textarea 
                                    required
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] placeholder:text-muted-foreground/50 transition-all resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="Outline the primary objectives and key results..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Priority Label</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            value={formData.priority}
                                            onChange={e => setFormData({...formData, priority: e.target.value})}
                                        >
                                            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                            <Layout size={14} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Pipeline Status</label>
                                    <div className="relative">
                                        <select 
                                            className="w-full appearance-none bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            value={formData.status}
                                            onChange={e => setFormData({...formData, status: e.target.value})}
                                        >
                                            {STATUS_COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                            <Clock size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Commencement</label>
                                    <input 
                                        type="date"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={formData.start_date}
                                        onChange={e => setFormData({...formData, start_date: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Target Completion</label>
                                    <input 
                                        type="date"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        value={formData.target_date}
                                        onChange={e => setFormData({...formData, target_date: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[12px] transition-all active:scale-[0.98] shadow-xl shadow-primary/20"
                                >
                                    {isEditing ? "Synchronize Changes" : "Deploy Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
