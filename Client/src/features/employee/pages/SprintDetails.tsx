import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    ChevronLeft, Calendar, Flag, Target,
    CheckCircle2, Clock, Play, Package,
    Layout, ArrowRight, User, Hash, FileText,
    Plus, ChevronDown, ChevronRight, ListTodo,
    Pencil, Trash2, UserPlus, MoreVertical,
    Bug, BookOpen, CheckSquare, X
} from "lucide-react";
import { getSprintByIdApi, updateSprintApi, type Sprint } from "../api/sprintApi";
import { getIssuesBySprintApi, updateIssueApi, assignIssueApi, type Issue } from "../api/issueApi";
import { getSubTasksByIssueApi, createSubTaskApi, updateSubTaskApi, deleteSubTaskApi, assignSubTaskApi, type SubTask } from "../api/subTaskApi";
import { getTeamDirectoryApi, type TeamMember } from "../api/teamApi";
import { usePermission } from "@/features/employee/hooks/usePermission";
import SubTaskModal, { type SubTaskFormData } from "../components/SubTaskModal";
import ConfirmModal from "@/features/shared/components/ConfirmModal";

const TypeIcon = ({ type, size = 12 }: { type: string; size?: number }) => {
    switch (type?.toLowerCase()) {
        case 'bug': return <Bug size={size} className="text-rose-500" />;
        case 'story': return <BookOpen size={size} className="text-emerald-500" />;
        default: return <CheckSquare size={size} className="text-blue-500" />;
    }
};

export default function SprintDetails() {
    const { sprintId } = useParams();
    const navigate = useNavigate();
    const { can } = usePermission();

    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [subTasksByIssue, setSubTasksByIssue] = useState<Record<string, { data: SubTask[], loading: boolean }>>({});
    const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isSubTaskModalOpen, setSubTaskModalOpen] = useState(false);
    const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
    const [editingSubTask, setEditingSubTask] = useState<SubTask | null>(null);
    const [isSubmittingSubTask, setIsSubmittingSubTask] = useState(false);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [subTaskToDelete, setSubTaskToDelete] = useState<{ issueId: string, subTaskId: string } | null>(null);
    const [issueToAssign, setIssueToAssign] = useState<Issue | null>(null);
    const [subTaskToAssign, setSubTaskToAssign] = useState<{ issueId: string, subTask: SubTask } | null>(null);

    useEffect(() => {
        if (sprintId) {
            fetchData();
        }
    }, [sprintId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const sprintRes = await getSprintByIdApi(sprintId!);
            const currentSprint = sprintRes.data;
            setSprint(currentSprint);

            const res = await getIssuesBySprintApi(sprintId!);
            setIssues(res.data || []);

            const teamRes = await getTeamDirectoryApi();
            const allMembers = teamRes.data.flatMap(team => team.members);
            // Remove duplicates just in case
            const uniqueMembers = allMembers.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i);
            setMembers(uniqueMembers);
        } catch (err: unknown) {
            toast.error("Failed to load sprint data");
        } finally {
            setLoading(false);
        }
    };

    const fetchSubTasks = async (issueId: string) => {
        setSubTasksByIssue(prev => ({ ...prev, [issueId]: { data: prev[issueId]?.data || [], loading: true } }));
        try {
            const res = await getSubTasksByIssueApi(issueId);
            setSubTasksByIssue(prev => ({ ...prev, [issueId]: { data: res.data || [], loading: false } }));
        } catch {
            toast.error("Failed to load sub-tasks");
            setSubTasksByIssue(prev => ({ ...prev, [issueId]: { data: [], loading: false } }));
        }
    };

    const toggleIssue = (issueId: string) => {
        const newExpanded = new Set(expandedIssues);
        if (newExpanded.has(issueId)) {
            newExpanded.delete(issueId);
        } else {
            newExpanded.add(issueId);
            if (!subTasksByIssue[issueId]) {
                fetchSubTasks(issueId);
            }
        }
        setExpandedIssues(newExpanded);
    };

    const handleOpenSubTaskModal = (e: React.MouseEvent, issueId: string) => {
        e.stopPropagation();
        setActiveIssueId(issueId);
        setEditingSubTask(null);
        setSubTaskModalOpen(true);
    };

    const handleOpenEditModal = (e: React.MouseEvent, issueId: string, subTask: SubTask) => {
        e.stopPropagation();
        setActiveIssueId(issueId);
        setEditingSubTask(subTask);
        setSubTaskModalOpen(true);
    };

    const handleDeleteSubTask = async (e: React.MouseEvent, issueId: string, subTaskId: string) => {
        e.stopPropagation();
        setSubTaskToDelete({ issueId, subTaskId });
    };

    const confirmDeleteSubTask = async () => {
        if (!subTaskToDelete) return;
        const { issueId, subTaskId } = subTaskToDelete;

        try {
            await deleteSubTaskApi(subTaskId);
            toast.success("Sub-task deleted");
            fetchSubTasks(issueId);
        } catch {
            toast.error("Failed to delete sub-task");
        } finally {
            setSubTaskToDelete(null);
        }
    };

    const handleSubTaskSubmit = async (data: SubTaskFormData) => {
        if (!activeIssueId || !sprintId) return;
        setIsSubmittingSubTask(true);
        try {
            if (editingSubTask) {
                await updateSubTaskApi(editingSubTask._id, data);
                toast.success("Sub-task updated successfully");
            } else {
                await createSubTaskApi({
                    ...data,
                    issue_id: activeIssueId,
                    sprint_id: sprintId
                });
                toast.success("Sub-task created successfully");
            }
            setSubTaskModalOpen(false);
            fetchSubTasks(activeIssueId);

            // Ensure issue is expanded
            const newExpanded = new Set(expandedIssues);
            newExpanded.add(activeIssueId);
            setExpandedIssues(newExpanded);
        } catch (err: unknown) {
            toast.error(editingSubTask ? "Failed to update sub-task" : "Failed to create sub-task");
        } finally {
            setIsSubmittingSubTask(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            await updateSprintApi(sprintId!, { status: newStatus });
            toast.success(`Sprint marked as ${newStatus}`);
            fetchData();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const msg = error.response?.data?.message || "Failed to update status";
            toast.error(msg);
        }
    };

    const handleAssignEmployee = async (employeeId: string) => {
        if (!issueToAssign) return;
        try {
            await assignIssueApi(issueToAssign._id, { assignee_id: employeeId });
            toast.success("Employee assigned successfully");
            setIssueToAssign(null);
            fetchData();
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const msg = error.response?.data?.message || "Failed to assign employee";
            toast.error(msg);
        }
    };

    const handleAssignSubTaskEmployee = async (employeeId: string) => {
        if (!subTaskToAssign) return;
        try {
            await assignSubTaskApi(subTaskToAssign.subTask._id, employeeId);
            toast.success("Employee assigned to sub-task successfully");
            const sid = subTaskToAssign.issueId;
            setSubTaskToAssign(null);
            fetchSubTasks(sid);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const msg = error.response?.data?.message || "Failed to assign sub-task";
            toast.error(msg);
        }
    };

    if (loading) return (
        <div className="h-full flex items-center justify-center bg-[#fdfdfd]">
            <div className="w-8 h-8 border-3 border-[#fa8029] border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!sprint) return <div className="p-10 text-center font-bold text-[#888]">Sprint not found</div>;

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'critical':
            case 'high': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'medium': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'low': return 'bg-green-50 text-green-600 border-green-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#fdfdfd] overflow-hidden">
            {/* Minimal Pro Header */}
            <div className="px-8 py-5 bg-white border-b border-[#f0f0f0] shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#f7f7f7] rounded-xl transition-colors">
                            <ChevronLeft size={20} className="text-[#888]" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-[18px] font-black text-[#1f2124]">{sprint.name}</h1>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border 
                                    ${sprint.status.toLowerCase() === 'active' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                        sprint.status.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                    {sprint.status}
                                </span>
                            </div>
                            <p className="text-[12px] text-[#888] font-medium mt-0.5">{sprint.goal}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {sprint.status.toLowerCase() === 'planned' && can('sprint:start') && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/employee/sprints/plan/${sprint._id}`)}
                                    className="px-5 py-2.5 bg-white border border-[#eee] text-[#555] rounded-xl font-bold text-[13px] hover:bg-[#fafafa]"
                                >
                                    Modify Plan
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus("Active")}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1f2124] text-white rounded-xl font-bold text-[13px] hover:bg-black transition-all shadow-md active:scale-95"
                                >
                                    <Play size={14} fill="currentColor" /> Start Sprint
                                </button>
                            </div>
                        )}
                        {sprint.status.toLowerCase() === 'active' && can('sprint:complete') && (
                            <button
                                onClick={() => handleUpdateStatus("Completed")}
                                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-[13px] hover:bg-emerald-700 transition-all shadow-md active:scale-95"
                            >
                                <CheckCircle2 size={15} /> Complete Sprint
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-5 rounded-2xl border border-[#f0f0f0] shadow-sm">
                            <p className="text-[11px] font-black text-[#aaa] uppercase tracking-widest mb-1">Timeline</p>
                            <div className="flex items-center gap-2 text-[13px] font-bold text-[#333]">
                                <Calendar size={14} className="text-[#fa8029]" />
                                {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-[#f0f0f0] shadow-sm">
                            <p className="text-[11px] font-black text-[#aaa] uppercase tracking-widest mb-1">Points Committed</p>
                            <div className="flex items-center gap-2 text-[13px] font-bold text-[#333]">
                                <Target size={14} className="text-[#fa8029]" />
                                {issues.reduce((acc, i) => acc + (i.story_points || 0), 0)} / {sprint.total_points} Points
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-[#f0f0f0] shadow-sm">
                            <p className="text-[11px] font-black text-[#aaa] uppercase tracking-widest mb-1">Items</p>
                            <div className="flex items-center gap-2 text-[13px] font-bold text-[#333]">
                                <Package size={14} className="text-[#fa8029]" />
                                {issues.length} Total Items
                            </div>
                        </div>
                    </div>

                    {/* Pro Issue List */}
                    <div className="space-y-4">
                        <h2 className="text-[15px] font-black text-[#1f2124] flex items-center gap-2 px-1">
                            <Layout size={18} className="text-[#fa8029]" /> Sprint Backlog
                        </h2>

                        {issues.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-[#eee] rounded-[32px] p-20 text-center flex flex-col items-center">
                                <Layout size={40} className="text-[#ddd] mb-4" />
                                <h4 className="text-[16px] font-bold text-[#888]">Your sprint backlog is empty</h4>
                            </div>
                        ) : (
                            <div className="space-y-3 pb-20">
                                {issues.map((issue) => {
                                    const isExpanded = expandedIssues.has(issue._id);
                                    const subTaskConfig = subTasksByIssue[issue._id];

                                    return (
                                        <div key={issue._id} className="bg-white border border-[#f0f0f0] rounded-2xl shadow-sm overflow-hidden transition-all hover:border-[#fa8029]/20">
                                            <div
                                                onClick={() => toggleIssue(issue._id)}
                                                className="p-5 flex items-center justify-between group cursor-pointer hover:bg-[#fafafa] transition-colors"
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="text-[#aaa] group-hover:text-[#fa8029] transition-colors">
                                                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                    </div>
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${issue.type === 'bug' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                        issue.type === 'story' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                                            'bg-blue-50 text-blue-500 border-blue-100'
                                                        }`}>
                                                        <TypeIcon type={issue.type} size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-[14px] font-bold text-[#1f2124]">{issue.title}</h3>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <p className="text-[11px] text-[#aaa] font-medium uppercase tracking-tighter">
                                                                {issue.type} • {issue.priority}
                                                            </p>
                                                            {(issue.type === 'bug' || issue.type === 'task') && issue.assignee_id && (
                                                                <>
                                                                    {(issue.assigned_by || issue.created_by)?.name && (
                                                                        <>
                                                                            <span className="w-1 h-1 rounded-full bg-[#eee]" />
                                                                            <p className="text-[11px] font-bold text-blue-500/70">
                                                                                {(issue.assigned_by || issue.created_by)?.designation || 'Assigner'}: {(issue.assigned_by || issue.created_by)?.name}
                                                                            </p>
                                                                        </>
                                                                    )}
                                                                    <span className="w-1 h-1 rounded-full bg-[#eee]" />
                                                                    <p className="text-[11px] font-bold text-orange-500/70">
                                                                        {issue.assignee_id.designation || 'Developer'}: {issue.assignee_id.name}
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                    {(issue.type === 'bug' || issue.type === 'task') && can('issue:assignEmployee') && (
                                                        <div className="flex items-center gap-2">
                                                            {issue.assignee_id ? (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setIssueToAssign(issue); }}
                                                                    className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-[11px] font-black text-white uppercase shadow-md hover:scale-105 transition-all"
                                                                    title={issue.assignee_id.name}
                                                                >
                                                                    {issue.assignee_id.name.substring(0, 2)}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setIssueToAssign(issue); }}
                                                                    className="w-8 h-8 rounded-xl bg-white border border-[#eee] flex items-center justify-center text-[#aaa] hover:border-orange-500 hover:text-orange-500 transition-all shadow-sm"
                                                                    title="Assign Employee"
                                                                >
                                                                    <UserPlus size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {can('task:create') && issue.type === 'story' && (
                                                        <button
                                                            onClick={(e) => handleOpenSubTaskModal(e, issue._id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fff5ef] text-[#fa8029] hover:bg-[#fa8029] hover:text-white rounded-lg text-[11px] font-bold transition-all active:scale-95"
                                                        >
                                                            <Plus size={14} /> Add Sub-Task
                                                        </button>
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${getPriorityColor(issue.priority)}`}>
                                                        {issue.priority}
                                                    </span>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tight border ${
                                                            issue.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                            'bg-orange-50 text-orange-600 border-orange-100'
                                                        }`}>
                                                            {issue.status}
                                                        </span>
                                                    </div>
                                                    {issue.type === 'story' && issue.story_points > 0 && (
                                                        <div className="bg-[#f9fafb] px-3 py-1 rounded-xl border border-[#eee] text-[11px] font-black text-[#555]">
                                                            {issue.story_points} pts
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sub-Tasks Section */}
                                            {isExpanded && (
                                                <div className="px-5 pb-5 pt-2 bg-[#fdfdfd] border-t border-[#f7f7f7]">
                                                    <div className="ml-10 space-y-2">
                                                        <div className="flex items-center gap-2 mb-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">
                                                            <ListTodo size={14} /> Sub-Tasks
                                                        </div>

                                                        {subTaskConfig?.loading ? (
                                                            <div className="py-4 flex justify-center">
                                                                <div className="w-4 h-4 border-2 border-[#fa8029] border-t-transparent rounded-full animate-spin" />
                                                            </div>
                                                        ) : subTaskConfig?.data.length === 0 ? (
                                                            <div className="py-6 text-center border-2 border-dashed border-[#f0f0f0] rounded-xl">
                                                                <p className="text-[12px] text-[#aaa] italic">No sub-tasks created yet</p>
                                                            </div>
                                                        ) : can('task:view:all') ? (
                                                            // PM VIEW: Group sub-tasks by team
                                                            (() => {
                                                                const grouped: Record<string, { teamName: string; subTasks: typeof subTaskConfig.data }> = {};
                                                                subTaskConfig.data.forEach(subTask => {
                                                                    const teamKey = subTask.team_id?._id || 'unassigned';
                                                                    const teamName = subTask.team_id?.name || 'Unassigned Team';
                                                                    if (!grouped[teamKey]) grouped[teamKey] = { teamName, subTasks: [] };
                                                                    grouped[teamKey].subTasks.push(subTask);
                                                                });
                                                                return Object.entries(grouped).map(([teamKey, group]) => (
                                                                    <div key={teamKey} className="mb-4">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                                                {group.teamName}
                                                                            </span>
                                                                        </div>
                                                                        {group.subTasks.map((subTask) => (
                                                                            <div key={subTask._id} className="flex items-center justify-between p-3 bg-white border border-[#eee] rounded-xl hover:shadow-sm transition-all group/subTask mb-1">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className={`w-1.5 h-1.5 rounded-full ${subTask.status === 'Done' ? 'bg-emerald-500' : subTask.status === 'In Progress' ? 'bg-[#fa8029]' : subTask.status === 'In Review' ? 'bg-purple-500' : 'bg-blue-400'}`} />
                                                                                    <div>
                                                                                        <h4 className="text-[13px] font-bold text-[#333]">{subTask.title}</h4>
                                                                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                                            <span className={`text-[9px] font-black uppercase tracking-wider ${getPriorityColor(subTask.priority)} px-1.5 py-0.5 rounded border`}>{subTask.priority}</span>
                                                                                            <span className="text-[10px] text-[#aaa] font-medium">• {subTask.estimated_hours} hrs</span>
                                                                                            {subTask.created_by && (
                                                                                                <span className="text-[9px] text-indigo-500 font-bold flex items-center gap-1">
                                                                                                    <User size={9} /> Lead: {subTask.created_by.name}
                                                                                                </span>
                                                                                            )}
                                                                                            {subTask.assignee_id && (
                                                                                                <span className="text-[9px] text-[#fa8029] font-bold flex items-center gap-1">
                                                                                                    <User size={9} /> Dev: {subTask.assignee_id.name}
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${subTask.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                                    subTask.status === 'In Progress' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                                                        subTask.status === 'In Review' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                                                            'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                                    {subTask.status}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ));
                                                            })()
                                                        ) : (
                                                            // LEAD VIEW: Flat list — only their team's sub-tasks
                                                            subTaskConfig?.data.map((subTask) => (
                                                                <div key={subTask._id} className="flex items-center justify-between p-3 bg-white border border-[#eee] rounded-xl hover:shadow-sm transition-all group/subTask">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={`w-1.5 h-1.5 rounded-full ${subTask.status === 'Done' ? 'bg-emerald-500' : subTask.status === 'In Progress' ? 'bg-[#fa8029]' : subTask.status === 'In Review' ? 'bg-purple-500' : 'bg-blue-400'}`} />
                                                                        <div>
                                                                            <h4 className="text-[13px] font-bold text-[#333]">{subTask.title}</h4>
                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                <span className={`text-[9px] font-black uppercase tracking-wider ${getPriorityColor(subTask.priority)} px-1.5 py-0.5 rounded border`}>{subTask.priority}</span>
                                                                                <span className="text-[10px] text-[#aaa] font-medium">• {subTask.estimated_hours} hrs</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {(can('task:update') || can('task:delete')) && (
                                                                            <div className="flex items-center bg-[#f9fafb] border border-[#eee] rounded-lg p-0.5 opacity-0 group-hover/subTask:opacity-100 transition-opacity">
                                                                                {can('task:update') && (
                                                                                    <button
                                                                                        onClick={(e) => handleOpenEditModal(e, issue._id, subTask)}
                                                                                        className="p-1.5 hover:bg-white hover:text-[#fa8029] rounded-md transition-all text-[#aaa]"
                                                                                        title="Edit/Assign"
                                                                                    >
                                                                                        <Pencil size={12} />
                                                                                    </button>
                                                                                )}
                                                                                {can('task:delete') && (
                                                                                    <button
                                                                                        onClick={(e) => handleDeleteSubTask(e, issue._id, subTask._id)}
                                                                                        className="p-1.5 hover:bg-white hover:text-red-500 rounded-md transition-all text-[#aaa]"
                                                                                        title="Delete"
                                                                                    >
                                                                                        <Trash2 size={12} />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${subTask.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                            subTask.status === 'In Progress' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                                                subTask.status === 'In Review' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                                                    'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                            {subTask.status}
                                                                        </span>
                                                                        {subTask.assignee_id ? (
                                                                            <div className="w-7 h-7 rounded-lg bg-[#fa8029] flex items-center justify-center text-[10px] font-black text-white uppercase shadow-sm" title={subTask.assignee_id.name}>
                                                                                {subTask.assignee_id.name.substring(0, 2)}
                                                                            </div>
                                                                        ) : can('task:assign') ? (
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); setSubTaskToAssign({ issueId: issue._id, subTask }); }}
                                                                                className="w-7 h-7 rounded-lg bg-[#f5f5f5] flex items-center justify-center text-[#ccc] border border-[#eee] hover:border-[#fa8029] hover:text-[#fa8029] transition-all"
                                                                                title="Assign Employee"
                                                                            >
                                                                                <UserPlus size={14} />
                                                                            </button>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SubTaskModal
                isOpen={isSubTaskModalOpen}
                onClose={() => setSubTaskModalOpen(false)}
                onSubmit={handleSubTaskSubmit}
                isSubmitting={isSubmittingSubTask}
                members={members}
                isEditing={!!editingSubTask}
                initialData={editingSubTask ? {
                    title: editingSubTask.title,
                    description: editingSubTask.description || "",
                    priority: editingSubTask.priority,
                    estimated_hours: editingSubTask.estimated_hours,
                    assignee_id: editingSubTask.assignee_id?._id || "",
                    status: editingSubTask.status,
                } : undefined}
            />

            <ConfirmModal
                isOpen={!!subTaskToDelete}
                onClose={() => setSubTaskToDelete(null)}
                onConfirm={confirmDeleteSubTask}
                title="Delete Sub-Task"
                message="Are you sure you want to delete this sub-task? This action cannot be undone."
                confirmText="Delete Sub-Task"
            />

            <MemberSelectModal
                isOpen={!!issueToAssign}
                onClose={() => setIssueToAssign(null)}
                onSelect={handleAssignEmployee}
                members={members}
                title={`Assign to ${issueToAssign?.type === 'bug' ? 'Bug' : 'Issue'}`}
            />

            <MemberSelectModal
                isOpen={!!subTaskToAssign}
                onClose={() => setSubTaskToAssign(null)}
                onSelect={handleAssignSubTaskEmployee}
                members={members}
                title="Assign Sub-Task"
            />
        </div>
    );
}

// Simple Member Select Modal Component
function MemberSelectModal({ isOpen, onClose, onSelect, members, title }: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
    members: TeamMember[];
    title: string;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-2xl w-full max-sm shadow-2xl relative z-[2010] animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="p-5 border-b border-[#f0f0f0] flex items-center justify-between">
                    <h3 className="text-[15px] font-bold text-[#1f2124]">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-[#aaa] hover:bg-[#f5f5f5] transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {members.length === 0 ? (
                        <p className="p-4 text-center text-[12px] text-[#888]">No team members available</p>
                    ) : (
                        members.map(member => (
                            <button
                                key={member._id}
                                onClick={() => onSelect(member._id)}
                                className="w-full flex items-center gap-3 p-3 hover:bg-[#f9fafb] rounded-xl transition-colors group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-[11px] font-black uppercase">
                                    {member.name.substring(0, 2)}
                                </div>
                                <div className="text-left">
                                    <p className="text-[13px] font-bold text-[#333] group-hover:text-orange-600 transition-colors">{member.name}</p>
                                    <p className="text-[10px] text-[#888] font-medium">{member.designation}</p>
                                </div>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight size={14} className="text-orange-500" />
                                </div>
                            </button>
                        ))
                    )}
                </div>
                <div className="p-4 bg-[#fdfdfd] border-t border-[#f0f0f0]">
                    <button onClick={onClose} className="w-full py-2.5 text-[12px] font-bold text-[#555] bg-white border border-[#ddd] rounded-xl hover:bg-[#f7f7f7] transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
