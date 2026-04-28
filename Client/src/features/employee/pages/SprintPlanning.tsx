import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Flag, Target, Layout, Calendar, ChevronLeft, Search, Plus, Trash2, Bug, BookOpen, CheckSquare } from "lucide-react";
import { usePermission } from "@/features/employee/hooks/usePermission";
import { getSprintByIdApi, type Sprint } from "../api/sprintApi";
import { getProjectsApi, type Project } from "../api/projectApi";
import { getIssuesByProjectApi, getIssuesBySprintApi, updateIssueApi, type Issue } from "../api/issueApi";

const TypeIcon = ({ type, size = 12 }: { type: string; size?: number }) => {
    switch (type?.toLowerCase()) {
        case 'bug': return <Bug size={size} className="text-rose-500" />;
        case 'story': return <BookOpen size={size} className="text-emerald-500" />;
        default: return <CheckSquare size={size} className="text-blue-500" />;
    }
};

export default function SprintPlanning() {
    const { sprintId } = useParams();
    const navigate = useNavigate();
    const { can } = usePermission();

    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
    const [sprintIssues, setSprintIssues] = useState<Issue[]>([]);

    const [loading, setLoading] = useState(true);
    const [backlogLoading, setBacklogLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (sprintId) {
            initPage();
        }
    }, [sprintId]);

    const initPage = async () => {
        setLoading(true);
        try {
            const [sprintRes, projectsRes] = await Promise.all([
                getSprintByIdApi(sprintId!),
                getProjectsApi()
            ]);
            
            const currentSprint = sprintRes.data;
            setSprint(currentSprint);
            setProjects(projectsRes.data || []);

            // Fetch sprint issues once and backlog for initial project
            if (sprintId) fetchSprintIssues(sprintId);
            
            if (currentSprint.project_id) {
                setSelectedProjectId(currentSprint.project_id);
                fetchBacklogIssues(currentSprint.project_id);
            } else if (projectsRes.data?.length > 0) {
                const firstProjectId = projectsRes.data[0]._id;
                setSelectedProjectId(firstProjectId);
                fetchBacklogIssues(firstProjectId);
            }
        } catch (err: unknown) {
            toast.error("Failed to load planning data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSprintIssues = async (currentSprintId: string) => {
        try {
            const res = await getIssuesBySprintApi(currentSprintId);
            setSprintIssues(res.data || []);
        } catch (err: unknown) {
            console.error("Failed to fetch sprint issues", err);
        }
    };

    const fetchBacklogIssues = async (projectId: string) => {
        setBacklogLoading(true);
        try {
            const res = await getIssuesByProjectApi(projectId);
            const allIssues = res.data || [];
            // Filter items not in any active sprint and in a 'plannable' status
            const plannableStatuses = ['to do', 'new', 'ready'];
            setBacklogIssues(allIssues.filter(i => 
                !i.sprint_id && 
                plannableStatuses.includes(i.status.toLowerCase())
            ));
        } catch (err: unknown) {
            toast.error("Failed to fetch backlog issues");
        } finally {
            setBacklogLoading(false);
        }
    };

    const handleProjectChange = (projectId: string) => {
        setSelectedProjectId(projectId);
        fetchBacklogIssues(projectId);
    };

    const addToSprint = async (issue: Issue) => {
        if (!sprintId) return;
        setActionLoading(issue._id);
        try {
            await updateIssueApi(issue._id, { 
                sprint_id: sprintId,
                status: 'To Do' 
            });
            toast.success("Issue added to sprint");
            setBacklogIssues(prev => prev.filter(i => i._id !== issue._id));
            setSprintIssues(prev => [...prev, { ...issue, sprint_id: sprintId, status: 'To Do' }]);
        } catch (err: unknown) {
            toast.error("Failed to assign issue");
        } finally {
            setActionLoading(null);
        }
    };

    const removeFromSprint = async (issue: Issue) => {
        setActionLoading(issue._id);
        try {
            await updateIssueApi(issue._id, { 
                sprint_id: null,
                status: 'Ready'
            }); 
            toast.success("Issue removed from sprint");
            setSprintIssues(prev => prev.filter(i => i._id !== issue._id));
            if (issue.project_id === selectedProjectId) {
                setBacklogIssues(prev => [...prev, { ...issue, sprint_id: null as unknown as string, status: 'Ready' }]);
            }
        } catch (err: unknown) {
            toast.error("Failed to unassign issue");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white">
                <div className="w-8 h-8 border-3 border-[#fa8029] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!sprint) return <div>Sprint not found</div>;

    return (
        <div className="h-full flex flex-col bg-[#fdfdfd] overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#f0f0f0] bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#f7f7f7] rounded-xl transition-colors">
                        <ChevronLeft size={20} className="text-[#888]" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-[18px] font-black text-[#1f2124]">Sprint Planning</h1>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase">{sprint.status}</span>
                        </div>
                        <p className="text-[12px] text-[#888] font-medium">{sprint.name} • {sprint.goal}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[11px] font-bold text-[#555]">Duration</span>
                        <span className="text-[11px] text-[#888]">{new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#fff5ef] border border-[#fa8029]/20 flex items-center justify-center text-[#fa8029]">
                        <Calendar size={20} />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden p-6 gap-6">
                {/* Column: Project Backlog */}
                <div className="flex-1 flex flex-col bg-[#f8f9fa] border border-[#eee] rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[#f0f0f0] bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[14px] font-bold text-[#1f2124] flex items-center gap-2">
                                <Layout size={16} className="text-[#aaa]" /> Project Backlog
                            </h3>
                            <span className="bg-[#f0f0f0] text-[#888] px-2 py-0.5 rounded-lg text-[11px] font-bold">
                                {backlogIssues.length} Items
                            </span>
                        </div>
                        <div className="space-y-3">
                            <label className="block text-[11px] font-bold text-[#888]">Filter by Project</label>
                            <select
                                value={selectedProjectId}
                                onChange={(e) => handleProjectChange(e.target.value)}
                                className="w-full px-3 py-2 text-[12px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029]"
                            >
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {backlogLoading ? (
                            <div className="flex py-10 justify-center">
                                <div className="w-5 h-5 border-2 border-[#fa8029] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : backlogIssues.length === 0 ? (
                            <div className="text-center py-20">
                                <Search size={24} className="mx-auto text-[#ddd] mb-2" />
                                <p className="text-[12px] text-[#aaa]">No items available</p>
                            </div>
                        ) : (
                            backlogIssues.map(issue => (
                                <div key={issue._id} className="bg-white border border-[#eee] p-3 rounded-xl hover:shadow-md transition-all group flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${
                                                issue.type === 'bug' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                issue.type === 'story' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                                'bg-blue-50 text-blue-500 border-blue-100'
                                            }`}>
                                                <TypeIcon type={issue.type} size={14} />
                                            </div>
                                            <h5 className="text-[13px] font-bold text-[#1f2124]">{issue.title}</h5>
                                         </div>
                                         <div className="flex items-center gap-3">
                                             <span className="text-[10px] bg-blue-50 text-blue-500 font-bold px-1.5 py-0.5 rounded-md border border-blue-100 uppercase">{issue.priority}</span>
                                             {issue.type === 'story' && issue.story_points > 0 && <span className="text-[10px] text-[#888] font-bold">{issue.story_points} Points</span>}
                                         </div>
                                     </div>
                                    {can('sprint:update') && (
                                        <button
                                            disabled={actionLoading === issue._id}
                                            onClick={() => addToSprint(issue)}
                                            className="p-2 bg-[#fff5ef] text-[#fa8029] hover:bg-[#fa8029] hover:text-white rounded-lg transition-all active:scale-90 flex items-center justify-center"
                                        >
                                            {actionLoading === issue._id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Plus size={16} />}
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Column: Sprint Backlog */}
                <div className="flex-1 flex flex-col bg-[#fffbf9]/50 border border-[#fa8029]/10 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[#fa8029]/5 bg-white">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[14px] font-bold text-[#fa8029] flex items-center gap-2">
                                <Target size={16} /> Sprint Backlog
                            </h3>
                            <span className="bg-[#fa8029] text-white px-2 py-0.5 rounded-lg text-[11px] font-bold shadow-sm shadow-[#fa8029]/20">
                                {sprintIssues.length} Items
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {sprintIssues.length === 0 ? (
                            <div className="text-center py-20 flex flex-col items-center">
                                <div className="w-12 h-12 bg-[#fff5ef] rounded-full flex items-center justify-center text-[#ffc6a3] mb-3">
                                    <Flag size={20} />
                                </div>
                                <p className="text-[12px] text-[#aaa]">Sprint is empty. Add work items from the project backlog.</p>
                            </div>
                        ) : (
                            sprintIssues.map(issue => (
                                <div key={issue._id} className="bg-white border border-[#fa8029]/10 p-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-3 group border-l-4 border-l-[#fa8029]">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${
                                                issue.type === 'bug' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                issue.type === 'story' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                                'bg-blue-50 text-blue-500 border-blue-100'
                                            }`}>
                                                <TypeIcon type={issue.type} size={14} />
                                            </div>
                                            <h5 className="text-[13px] font-bold text-[#1f2124]">{issue.title}</h5>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] bg-blue-50 text-blue-500 font-bold px-1.5 py-0.5 rounded-md border border-blue-100 uppercase">{issue.priority}</span>
                                            {issue.type === 'story' && issue.story_points > 0 && <span className="text-[10px] text-[#888] font-bold">{issue.story_points} Points</span>}
                                        </div>
                                    </div>
                                    {can('sprint:update') && (
                                        <button
                                            disabled={actionLoading === issue._id}
                                            onClick={() => removeFromSprint(issue)}
                                            className="p-2 text-[#aaa] hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all active:scale-90"
                                        >
                                            {actionLoading === issue._id ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Trash2 size={16} />}
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {sprintIssues.length > 0 && (
                        <div className="p-4 bg-white border-t border-[#fa8029]/10">
                            <div className="bg-[#fff5ef] p-4 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-[#fa8029] uppercase tracking-wider">Total Commit</p>
                                    <p className="text-[20px] font-black text-[#fa8029] leading-none mt-1">
                                        {sprintIssues.reduce((acc, i) => acc + (i.story_points || 0), 0)} <span className="text-[12px] font-bold opacity-60">Points</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate('/employee/sprints')}
                                    className="px-4 py-2 bg-[#fa8029] text-white rounded-lg text-[12px] font-bold hover:bg-[#e56b1f] shadow-lg shadow-[#fa8029]/20 transition-all active:scale-95"
                                >
                                    Finish Planning
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
