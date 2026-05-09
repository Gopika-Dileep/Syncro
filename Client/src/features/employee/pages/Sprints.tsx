import { useState, useEffect, useCallback } from "react";
import { 
    Plus, Target, Calendar,
    ArrowRight, Eye, Play, CheckCircle2,
    TrendingUp, Rocket, Package, Search
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { usePermission } from "@/features/employee/hooks/usePermission";
import { getSprintsApi, createSprintApi, updateSprintApi, type Sprint } from "@/features/employee/api/sprintApi";
import AddSprintModal from "../components/AddSprintModal";
import CompleteSprintModal from "../components/CompleteSprintModal";
import { getSprintByIdApi } from "@/features/employee/api/sprintApi";
import { useDebounce } from "@/hooks/useDebounce";

export default function Sprints() {
    const { can } = usePermission();
    const navigate = useNavigate();

    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [fetching, setFetching] = useState(true);
    const [activeTab, setActiveTab] = useState<"All" | "Planned" | "Active" | "Completed">("All");
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Completion modal state
    const [isCompleteModalOpen, setCompleteModalOpen] = useState(false);
    const [sprintToComplete, setSprintToComplete] = useState<Sprint | null>(null);
    const [isFetchingCompleteData, setIsFetchingCompleteData] = useState(false);

    const handleCompleteClick = async (sprint: Sprint) => {
        setIsFetchingCompleteData(true);
        try {
            const res = await getSprintByIdApi(sprint._id);
            if (res.success) {
                setSprintToComplete(res.data);
                setCompleteModalOpen(true);
            }
        } catch {
            toast.error("Failed to prepare sprint completion");
        } finally {
            setIsFetchingCompleteData(false);
        }
    };

    const handleConfirmComplete = async (moveTarget: string) => {
        if (!sprintToComplete) return;
        setIsSubmitting(true);
        try {
            const res = await updateSprintApi(sprintToComplete._id, { 
                status: 'Completed',
                moveIssuesTo: moveTarget 
            } as unknown as Parameters<typeof updateSprintApi>[1]);
            if (res.success) {
                toast.success("Sprint completed successfully");
                setCompleteModalOpen(false);
                setSprintToComplete(null);
                fetchSprints();
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to complete sprint");
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchSprints = useCallback(async () => {
        setFetching(true);
        try {
            const res = await getSprintsApi({ search: debouncedSearchTerm });
            setSprints(res.data.sprints || []);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to fetch sprints");
        } finally {
            setFetching(false);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchSprints();
    }, [debouncedSearchTerm, fetchSprints]);

    const handleStatusUpdate = async (sprintId: string, newStatus: string) => {
        try {
            const res = await updateSprintApi(sprintId, { status: newStatus });
            if (res.success) {
                toast.success(`Sprint marked as ${newStatus}`);
                fetchSprints();
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || `Failed to update sprint to ${newStatus}`);
        }
    };

    const filteredSprints = sprints.filter(s => {
        if (activeTab === "All") return true;
        return s.status.toLowerCase() === activeTab.toLowerCase();
    });

    const completedSprints = sprints.filter(s => s.status.toLowerCase() === 'completed');
    const totalCompletedPoints = completedSprints.reduce((acc, s) => acc + (s.completed_points || 0), 0);
    const avgVelocity = completedSprints.length > 0 
        ? Math.round(totalCompletedPoints / completedSprints.length) 
        : 0;

    const stats = {
        active: sprints.filter(s => s.status.toLowerCase() === 'active').length,
        planned: sprints.filter(s => s.status.toLowerCase() === 'planned').length,
        completed: completedSprints.length,
        velocity: avgVelocity
    };

    const activeSprint = sprints.find(s => s.status.toLowerCase() === 'active');

    return (
        <div className="h-full flex flex-col bg-[#fdfdfd]">
            {/* Page Header */}
            <div className="px-5 py-4 md:px-6 border-b border-[#f0f0f0] bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-[20px] font-black text-[#1f2124] tracking-tight">Sprint Management</h1>
                        <p className="text-[11px] text-[#888] font-medium">Create sprints and plan story assignments</p>
                    </div>
                    {can('sprint:create') && (
                        <button
                            onClick={() => { setEditingSprint(null); setModalOpen(true); }}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#1f2124] text-white rounded-xl font-bold text-[12px] hover:bg-black transition-all shadow-md active:scale-95"
                        >
                            <Plus size={14} strokeWidth={3} /> New Sprint
                        </button>
                    )}
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 max-w-7xl mx-auto">
                    {[
                        { label: "Active Sprint", val: activeSprint ? activeSprint.name : "None", icon: Rocket, color: "text-[#fa8029]", bg: "bg-[#fff5ef]" },
                        { label: "Planned Sprints", val: stats.planned, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Completed Sprints", val: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                        { label: "Avg Velocity", val: `${stats.velocity}`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" }
                    ].map((card, i) => (
                        <div key={i} className="bg-white border border-[#f0f0f0] p-3.5 rounded-2xl flex items-center gap-3.5 shadow-sm">
                            <div className={`w-10 h-10 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                                <card.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#888] uppercase tracking-wide">{card.label}</p>
                                <p className="text-[16px] font-black text-[#1f2124] leading-tight mt-0.5">{card.val}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-5 md:p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-8">
                    
                    {/* Highlight: Active Sprint */}
                    {activeSprint && (
                        <div className="bg-white border-2 border-[#fa8029]/10 rounded-3xl p-5 shadow-xl shadow-[#fa8029]/5 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#fa8029]" />
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-[#fff5ef] flex items-center justify-center text-[#fa8029]">
                                        <Play size={24} fill="currentColor" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-[#fff5ef] text-[#fa8029] px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border border-[#fa8029]/10 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#fa8029] animate-pulse" /> Active
                                            </span>
                                            <h2 className="text-[18px] font-black text-[#1f2124]">{activeSprint.name}</h2>
                                        </div>
                                        <p className="text-[12px] text-[#888] mt-1 font-medium">{activeSprint.goal}</p>
                                        <div className="flex items-center gap-5 mt-3">
                                            <div className="text-[10px] font-bold text-[#666] flex items-center gap-1.5">
                                                <Calendar size={13} className="text-[#aaa]" />
                                                {new Date(activeSprint.start_date).toLocaleDateString()} → {new Date(activeSprint.end_date).toLocaleDateString()}
                                            </div>
                                            <div className="text-[10px] font-bold text-[#666] flex items-center gap-1.5">
                                                <TrendingUp size={13} className="text-[#aaa]" />
                                                {activeSprint.committed_points ?? 0} / {activeSprint.total_points || 40} pts committed
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <button 
                                        onClick={() => navigate(`/employee/sprints/${activeSprint._id}`)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#fdfdfd] border border-[#eee] text-[#555] rounded-xl font-bold text-[12px] hover:bg-white hover:shadow-sm transition-all shadow-sm"
                                    >
                                        <Eye size={15} /> View Details
                                    </button>
                                    {can('sprint:update') && (
                                        <button 
                                            disabled={isFetchingCompleteData}
                                            onClick={() => handleCompleteClick(activeSprint)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-[#1f2124] text-white rounded-xl font-bold text-[12px] hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                        >
                                            {isFetchingCompleteData ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : <CheckCircle2 size={15} />}
                                            Complete Sprint
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* All Sprints Section */}
                    <div>
                        {/* Tabs & Search */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                            <div className="flex items-center gap-1.5 bg-[#f0f0f0]/50 p-1 rounded-xl w-fit border border-[#eee]">
                                {["All", "Active", "Completed"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as "All" | "Planned" | "Active" | "Completed")}
                                        className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                                            activeTab === tab ? "bg-white text-[#1f2124] shadow-sm" : "text-[#888] hover:text-[#555]"
                                        }`}
                                    >
                                        {tab} {tab !== 'All' && `(${sprints.filter(s => s.status.toLowerCase() === tab.toLowerCase()).length})`}
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#aaa]" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search sprints..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-white border border-[#eee] rounded-xl text-[13px] outline-none focus:border-[#fa8029] w-64 shadow-sm"
                                />
                            </div>
                        </div>

                        {fetching ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="w-8 h-8 border-3 border-[#fa8029] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredSprints.length === 0 ? (
                            <div className="bg-white border border-[#f0f0f0] rounded-3xl p-20 text-center flex flex-col items-center">
                                <Package size={40} className="text-[#eee] mb-4" />
                                <h3 className="text-[16px] font-black text-[#1f2124]">No sprints found</h3>
                                <p className="text-[12px] text-[#888] mt-1 italic">Try changing the filter or create a new one.</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {filteredSprints.map((sprint) => (
                                    <div key={sprint._id} className="bg-white border border-[#f0f0f0] rounded-2xl p-4 hover:border-[#fa8029]/20 transition-all group shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 
                                                ${sprint.status.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {sprint.status.toLowerCase() === 'completed' ? <CheckCircle2 size={16} /> : <Target size={16} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border 
                                                        ${sprint.status.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                        {sprint.status}
                                                    </span>
                                                    <h4 className="text-[15px] font-black text-[#1f2124]">{sprint.name}</h4>
                                                </div>
                                                <p className="text-[12px] text-[#888] mt-1 line-clamp-1 font-medium">{sprint.goal}</p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#aaa]">
                                                        <Calendar size={13} />
                                                        {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#aaa]">
                                                        <Rocket size={13} />
                                                        {sprint.committed_points ?? 0} / {sprint.total_points || 40} pts
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 justify-end">
                                            {sprint.status.toLowerCase() === 'planned' && can('sprint:create') && (
                                                <>
                                                    {(sprint.item_count ?? 0) > 0 && (
                                                        <button 
                                                            onClick={() => handleStatusUpdate(sprint._id, 'Active')}
                                                            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-bold text-[12px] hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Play size={14} fill="currentColor" /> Start Sprint
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => navigate(`/employee/sprints/plan/${sprint._id}`)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-[#f9fafb] border border-[#eee] text-[#555] rounded-xl font-bold text-[12px] hover:bg-[#fff5ef] hover:text-[#fa8029] hover:border-[#fa8029]/30 transition-all font-inter"
                                                    >
                                                        <Rocket size={14} /> {(sprint.committed_points ?? 0) > 0 || (sprint.item_count ?? 0) > 0 ? "Modify Plan" : "Plan Sprint"}
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => navigate(`/employee/sprints/${sprint._id}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#eee] text-[#555] rounded-xl font-bold text-[12px] hover:bg-[#fcfcfc] transition-all"
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Workflow Guide */}
                    <div className="bg-gray-50 border border-[#eee] rounded-3xl p-6 mt-10">
                        <h4 className="text-[13px] font-black text-[#666] flex items-center gap-2 mb-4">
                            <ArrowRight size={16} /> Sprint Workflow:
                        </h4>
                        <ol className="space-y-2 text-[12px] text-[#888] font-medium leading-relaxed list-decimal list-inside">
                            <li>Create sprint with dates and capacity</li>
                            <li>Click "Plan Sprint" to assign Ready stories from Product Backlog</li>
                            <li>Start sprint when planning is complete (stories move to Sprint Backlog)</li>
                            <li>Team Lead breaks stories into tasks in Sprint Backlog</li>
                        </ol>
                    </div>
                </div>
            </div>

            <AddSprintModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={async (data) => {
                    setIsSubmitting(true);
                    try {
                        let response;
                        if (editingSprint) {
                            response = await updateSprintApi(editingSprint._id, data);
                        } else {
                            response = await createSprintApi(data);
                        }
                        
                        if (response.success) {
                            toast.success(editingSprint ? "Sprint updated" : "Sprint created!");
                            setModalOpen(false);
                            setEditingSprint(null);
                            await fetchSprints();
                        }
                    } catch (err: unknown) { 
                        const error = err as { response?: { data?: { message?: string } } };
                        toast.error(error.response?.data?.message || "Operation failed."); 
                    }
                    finally { setIsSubmitting(false); }
                }}
                initialData={editingSprint}
                isSubmitting={isSubmitting}
            />

            <CompleteSprintModal
                isOpen={isCompleteModalOpen}
                onClose={() => setCompleteModalOpen(false)}
                incompleteCount={sprintToComplete?.issues?.filter(i => i.status !== 'Done').length || 0}
                availableSprints={sprints.filter(s => 
                    s._id !== sprintToComplete?._id && 
                    s.status.toLowerCase() === 'planned' && 
                    s.project_id === sprintToComplete?.project_id
                )}
                onConfirm={handleConfirmComplete}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}