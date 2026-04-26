import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Search, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    Circle,
    ArrowLeft,
    ArrowRight,
    FolderKanban
} from "lucide-react";
import { 
    getProjectsApi, 
    type Project
} from "@/features/company/api/projectApi";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

const STATUS_COLUMNS = [
    { id: "Active", label: "Active", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "On-Hold", label: "On Hold", icon: Circle, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "Completed", label: "Completed", icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50" }
];

export default function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 50;

    useEffect(() => {
        fetchProjects();
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
        <div className="h-full flex flex-col bg-[#fdfdfd]">
            {/* Header */}
            <div className="px-6 py-6 md:px-8 border-b border-[#f0f0f0] bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-[#fff5ef] flex items-center justify-center text-[#fa8029]">
                                <FolderKanban size={18} />
                            </div>
                            <h1 className="text-[22px] font-black text-[#1f2124] tracking-tight">Project Matrix</h1>
                        </div>
                        <p className="text-[12px] text-[#888] font-medium ml-11">Strategic overview of organizational initiatives</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search projects..." 
                                className="pl-10 pr-4 py-2.5 bg-white border border-[#eee] rounded-full text-[13px] outline-none focus:border-[#fa8029] w-64 shadow-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Board Area */}
            <div className="p-6 md:p-8 flex-1 overflow-x-auto custom-scrollbar">
                {loading && projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-10 h-10 border-3 border-[#fa8029] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[13px] text-[#888] mt-4 font-bold animate-pulse">Syncing Initiatives...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full pb-4">
                        {STATUS_COLUMNS.map((column) => (
                            <div key={column.id} className="flex flex-col gap-4 min-w-0">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${column.bg} ${column.color}`}>
                                            <column.icon size={16} strokeWidth={2.5} />
                                        </div>
                                        <h3 className="font-black text-[14px] text-[#1f2124]">{column.label}</h3>
                                        <span className="px-2 py-0.5 bg-white border border-[#eee] rounded-full text-[10px] font-black text-[#aaa]">
                                            {groupedProjects[column.id].length}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1">
                                    {groupedProjects[column.id].map((project) => (
                                        <div 
                                            key={project._id}
                                            onClick={() => navigate(`/company/projects/${project._id}`)}
                                            className="group bg-white border border-[#f0f0f0] hover:border-[#fa8029]/30 hover:shadow-xl hover:shadow-[#fa8029]/5 rounded-2xl p-4 transition-all duration-300 cursor-pointer relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#fa8029] text-white rounded-bl-xl shadow-sm">
                                                <FolderKanban size={12} />
                                            </div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getPriorityStyles(project.priority)}`}>
                                                    {project.priority}
                                                </div>
                                            </div>

                                            <h4 className="font-black text-[#1f2124] text-[14px] group-hover:text-[#fa8029] transition-colors mb-2 line-clamp-1">
                                                {project.name}
                                            </h4>
                                            <p className="text-[12px] text-[#888] font-medium line-clamp-2 mb-4 leading-relaxed">
                                                {project.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-3 border-t border-[#f8f8f8]">
                                                <div className="flex items-center gap-1.5 text-[10px] text-[#aaa] font-bold">
                                                    <Calendar size={13} className="text-[#ccc]" />
                                                    <span>{new Date(project.target_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="w-7 h-7 rounded-lg bg-[#fcfcfc] flex items-center justify-center text-[11px] font-black text-[#aaa] border border-[#eee] uppercase overflow-hidden shadow-sm">
                                                    {project.created_by?.avatar ? (
                                                        <img src={project.created_by.avatar} alt={project.created_by.name} className="w-full h-full object-cover" title={`Created by ${project.created_by.name}`} />
                                                    ) : (
                                                        <span title={`Created by ${project.created_by?.name || 'Unknown'}`}>
                                                            {project.created_by?.name?.charAt(0) || project.name.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {groupedProjects[column.id].length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#f0f0f0] rounded-2xl opacity-40">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-[#aaa]">No {column.label} Projects</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {total > limit && (
                <div className="px-8 py-4 border-t border-[#f0f0f0] bg-white flex items-center justify-center gap-6">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2.5 border border-[#eee] rounded-xl hover:bg-[#f9fafb] disabled:opacity-30 transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <span className="text-[13px] font-black text-[#1f2124]">
                        Page <span className="text-[#fa8029]">{page}</span> of {Math.ceil(total / limit)}
                    </span>
                    <button 
                        disabled={page * limit >= total}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2.5 border border-[#eee] rounded-xl hover:bg-[#f9fafb] disabled:opacity-30 transition-all shadow-sm"
                    >
                        <ArrowRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
}
