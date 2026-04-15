import { useEffect, useState, useMemo } from "react";
import { 
    Search, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    Circle,
    ArrowLeft,
    ArrowRight
} from "lucide-react";
import { 
    getProjectsApi, 
    type Project
} from "@/features/company/api/projectApi";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

const STATUS_COLUMNS = [
    { id: "Active", label: "Active", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "On-Hold", label: "On Hold", icon: Circle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "Completed", label: "Completed", icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" }
];

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 50; // Kanban shows more

    useEffect(() => {
        fetchProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearchTerm]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await getProjectsApi(page, limit, debouncedSearchTerm);
            setProjects(response.data || []);
            setTotal(response.total || 0);
        } catch {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
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
        </div>
    );
}
