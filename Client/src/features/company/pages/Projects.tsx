import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    Calendar,
    Clock,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    FolderKanban,
    Briefcase,
    AlertCircle,
    Layers
} from "lucide-react";
import {
    getProjectsApi,
    type Project
} from "@/features/company/api/projectApi";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    glowClass: string;
    isActive: boolean;
    onClick: () => void;
}

const StatCard = ({
    title,
    value,
    icon: Icon,
    colorClass,
    bgClass,
    borderClass,
    glowClass,
    isActive,
    onClick
}: StatCardProps) => (
    <div
        onClick={onClick}
        className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 ${
            isActive
                ? `${bgClass} ${borderClass} ${glowClass} shadow-lg ring-1 ring-black/5`
                : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
        }`}
    >
        <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${isActive ? 'bg-white/90 shadow-sm' : 'bg-[#fafafa]'}`}>
                <Icon size={18} className={colorClass} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? colorClass : 'text-gray-400'}`}>
                {title}
            </span>
        </div>
        <div className="text-3xl font-black tracking-tight text-[#1a1c1f]">{value}</div>
        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tight">
            {isActive ? 'Active Filter' : 'Click to filter'}
        </p>
    </div>
);

const ProjectCardSkeleton = () => (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 h-[230px] flex flex-col justify-between animate-pulse shadow-sm">
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="h-5 w-16 bg-gray-100 rounded-lg" />
                <div className="h-5 w-20 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-5 w-2/3 bg-gray-100 rounded-lg mb-2" />
            <div className="space-y-1.5">
                <div className="h-3.5 w-full bg-gray-100 rounded-md" />
                <div className="h-3.5 w-5/6 bg-gray-100 rounded-md" />
            </div>
        </div>
        <div>
            <div className="h-10 w-full bg-gray-50 rounded-xl mb-4" />
            <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-100" />
                    <div className="h-3.5 w-16 bg-gray-100 rounded-md" />
                </div>
                <div className="w-8 h-8 rounded-xl bg-gray-100" />
            </div>
        </div>
    </div>
);

export default function Projects() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 9;

        const [statusFilter, setStatusFilter] = useState<string>("");

    const [stats, setStats] = useState({ total: 0, active: 0, onHold: 0, completed: 0 });

    // Fetch stats matching search string
    const fetchStats = useCallback(async () => {
        try {
            const response = await getProjectsApi(1, 1000, debouncedSearchTerm, "");
            const allProjects = response.data || [];
            const active = allProjects.filter(p => p.status === "Active").length;
            const onHold = allProjects.filter(p => p.status === "On-Hold").length;
            const completed = allProjects.filter(p => p.status === "Completed").length;
            setStats({
                total: allProjects.length,
                active,
                onHold,
                completed
            });
        } catch (err) {
            console.error("Failed to load project stats", err);
        }
    }, [debouncedSearchTerm]);

    // Fetch projects paginated with active filters
    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getProjectsApi(page, limit, debouncedSearchTerm, statusFilter);
            setProjects(response.data || []);
            setTotal(response.total || 0);
        } catch {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearchTerm, statusFilter]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm, statusFilter]);

    // In-memory sorting of projects by target date (newest first)
    const sortedProjects = useMemo(() => {
        return [...projects].sort((a, b) => {
            return new Date(b.target_date).getTime() - new Date(a.target_date).getTime();
        });
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
        <div className="min-h-screen bg-[#fafafa] p-6 max-w-[1400px] mx-auto space-y-6 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#1a1c1f] tracking-tight flex items-center gap-2.5">
                        <FolderKanban size={22} className="text-[#fa8029]" />
                        Project Workspace
                    </h1>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Strategic Overview & Monitoring</p>
                </div>
                <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 self-start md:self-auto">
                    <Calendar size={14} className="text-[#fa8029]" />
                    <span className="text-[11px] font-black text-[#1a1c1f] uppercase tracking-tighter">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="All Projects"
                    value={stats.total}
                    icon={Layers}
                    colorClass="text-[#fa8029]"
                    bgClass="bg-[#fff5ef]/30"
                    borderClass="border-[#fa8029]/20"
                    glowClass="shadow-[#fa8029]/5"
                    isActive={statusFilter === ""}
                    onClick={() => setStatusFilter("")}
                />
                <StatCard
                    title="Active"
                    value={stats.active}
                    icon={Clock}
                    colorClass="text-emerald-600"
                    bgClass="bg-emerald-50/20"
                    borderClass="border-emerald-500/20"
                    glowClass="shadow-emerald-500/5"
                    isActive={statusFilter === "Active"}
                    onClick={() => setStatusFilter("Active")}
                />
                <StatCard
                    title="On Hold"
                    value={stats.onHold}
                    icon={AlertCircle}
                    colorClass="text-amber-600"
                    bgClass="bg-amber-50/20"
                    borderClass="border-amber-500/20"
                    glowClass="shadow-amber-500/5"
                    isActive={statusFilter === "On-Hold"}
                    onClick={() => setStatusFilter("On-Hold")}
                />
                <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle2}
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50/20"
                    borderClass="border-blue-500/20"
                    glowClass="shadow-blue-500/5"
                    isActive={statusFilter === "Completed"}
                    onClick={() => setStatusFilter("Completed")}
                />
            </div>

            {/* Filter and Control Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aaa]" size={16} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="pl-10 pr-4 py-2.5 bg-[#fafafa] border border-gray-100 rounded-xl text-[13px] outline-none focus:bg-white focus:border-[#fa8029] focus:ring-2 focus:ring-[#fa8029]/10 w-full transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Project Grid */}
            <div className="min-h-[400px]">
                {loading && projects.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <ProjectCardSkeleton key={i} />
                        ))}
                    </div>
                ) : sortedProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-[#fff5ef] flex items-center justify-center text-[#fa8029] mb-4">
                            <Briefcase size={24} />
                        </div>
                        <h3 className="text-[15px] font-black text-[#1f2124] mb-1">No Projects Found</h3>
                        <p className="text-[12px] text-gray-400 max-w-[280px] text-center leading-relaxed font-medium">
                            No projects match the current search filters. Try selecting a different category or clearing the search.
                        </p>
                        {(searchTerm || statusFilter) && (
                            <button
                                onClick={() => { setSearchTerm(""); setStatusFilter(""); }}
                                className="mt-4 px-4 py-2 bg-[#fa8029] hover:bg-[#e07020] text-white text-[12px] font-black rounded-xl transition-all shadow-md shadow-orange-500/10 active:scale-95"
                            >
                                Reset All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedProjects.map((project) => (
                            <div
                                key={project._id}
                                onClick={() => navigate(`/company/projects/${project._id}`)}
                                className="group bg-white border border-gray-100 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] hover:border-[#fa8029]/20 cursor-pointer relative flex flex-col justify-between h-[230px] overflow-hidden"
                            >
                                {/* Top colored border indicator */}
                                <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
                                    project.status === "Active" ? "bg-emerald-500" :
                                    project.status === "On-Hold" ? "bg-amber-500" : "bg-blue-500"
                                }`} />

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getPriorityStyles(project.priority)}`}>
                                            {project.priority}
                                        </span>

                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                            project.status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                            project.status === "On-Hold" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                            "bg-blue-50 text-blue-600 border border-blue-100"
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                project.status === "Active" ? "bg-emerald-500 animate-pulse" :
                                                project.status === "On-Hold" ? "bg-amber-500" : "bg-blue-500"
                                            }`} />
                                            {project.status}
                                        </span>
                                    </div>

                                    <h4 className="font-black text-[#1f2124] text-[15px] group-hover:text-[#fa8029] transition-colors mb-1.5 line-clamp-1">
                                        {project.name}
                                    </h4>
                                    <p className="text-[12px] text-gray-400 font-medium line-clamp-2 leading-relaxed mb-4">
                                        {project.description}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 bg-[#fdfdfd] border border-gray-100/50 rounded-xl px-3 py-2 mb-4 text-[10px] text-gray-500 font-bold">
                                        <Calendar size={12} className="text-gray-400" />
                                        <span>{new Date(project.start_date).toLocaleDateString()}</span>
                                        <span className="text-gray-300 font-normal">→</span>
                                        <span>{new Date(project.target_date).toLocaleDateString()}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-7 h-7 rounded-lg bg-[#fff5ef] border border-[#fa8029]/10 flex items-center justify-center text-[10px] font-black text-[#fa8029] uppercase overflow-hidden shadow-sm shrink-0">
                                                {project.created_by?.avatar ? (
                                                    <img src={project.created_by.avatar} alt={project.created_by.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>
                                                        {project.created_by?.name?.charAt(0) || project.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-bold text-[#1f2124] truncate leading-tight">
                                                    {project.created_by?.name || "Unknown"}
                                                </p>
                                                <p className="text-[9px] text-gray-400 font-medium truncate">
                                                    Owner
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-8 h-8 rounded-xl bg-[#fff5ef] text-[#fa8029] flex items-center justify-center transition-all duration-300 group-hover:bg-[#fa8029] group-hover:text-white shadow-sm shrink-0">
                                            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {total > limit && (
                <div className="pt-6 border-t border-gray-100 flex items-center justify-center gap-6">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm flex items-center justify-center"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <span className="text-[13px] font-black text-[#1f2124]">
                        Page <span className="text-[#fa8029]">{page}</span> of {Math.ceil(total / limit)}
                    </span>
                    <button
                        disabled={page * limit >= total}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm flex items-center justify-center"
                    >
                        <ArrowRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
