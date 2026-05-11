import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
    ChevronRight, ChevronDown, Clock, Target,
    MoreHorizontal, Plus, Calendar, AlertCircle,
    Layout, Users,
    Pencil, Trash2, UserPlus, Eye,
    Bug, BookOpen, CheckSquare, X, Activity,
    ListTodo, Package, Flag, CheckCircle2, MessageSquare, ArrowRight, Play
} from "lucide-react";
import { getSprintByIdApi, updateSprintApi, getSprintsApi, type Sprint, type SprintFormData } from "../api/sprintApi";
import {
    getSubTasksByIssueApi, type SubTask,
    createSubTaskApi, updateSubTaskApi, deleteSubTaskApi, assignSubTaskApi
} from "../api/subTaskApi";
import { getIssuesByProjectApi, type Issue, updateIssueApi } from "../api/issueApi";
import { getProjectsApi, type Project } from "../api/projectApi";
import { getTeamDirectoryApi, type TeamMember } from "../api/teamApi";
import { usePermission } from "@/features/employee/hooks/usePermission";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { type RootState } from "@/store/store";
import { getSprintVelocityApi, type VelocityAnalytics } from "../api/sprintApi";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import SubTaskModal, { type SubTaskFormData } from "../components/SubTaskModal";
import ItemDetailsDrawer from "../components/ItemDetailsDrawer";
import CompleteSprintModal from "../components/CompleteSprintModal";
import ConfirmModal from "@/features/shared/components/ConfirmModal";
import MentionText from "@/features/shared/components/MentionText";

const TypeIcon = ({ type, size = 16 }: { type: string; size?: number }) => {
    switch (type.toLowerCase()) {
        case 'bug': return <Bug size={size} />;
        case 'story': return <BookOpen size={size} />;
        default: return <CheckSquare size={size} />;
    }
};

const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case 'critical': return 'text-rose-600 bg-rose-50 border-rose-100';
        case 'high': return 'text-orange-600 bg-orange-50 border-orange-100';
        case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
        default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
};

export default function SprintDetails() {
    const { sprintId } = useParams<{ sprintId: string }>();
    const [activeTab, setActiveTab] = useState<'issues' | 'multiple_team' | 'sprint_wise'>('issues');
    const [sprint, setSprint] = useState<Sprint | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [velocityData, setVelocityData] = useState<VelocityAnalytics | null>(null);
    const [velocityLoading, setVelocityLoading] = useState(false);
    const [expandedIssues, setExpandedIssues] = useState<Set<string>>(new Set());
    const [subTasksByIssue, setSubTasksByIssue] = useState<Record<string, { data: SubTask[], loading: boolean }>>({});
    const { can } = usePermission();
    const user = useSelector((state: RootState) => state.auth.user);

    // Modal state
    const [isSubTaskModalOpen, setSubTaskModalOpen] = useState(false);
    const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
    const [editingSubTask, setEditingSubTask] = useState<SubTask | null>(null);
    const [isSubmittingSubTask, setIsSubmittingSubTask] = useState(false);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [subTaskToDelete, setSubTaskToDelete] = useState<{ issueId: string, subTaskId: string } | null>(null);
    const [issueToAssign, setIssueToAssign] = useState<Issue | null>(null);
    const [subTaskToAssign, setSubTaskToAssign] = useState<{ issueId: string, subTask: SubTask } | null>(null);
    const [itemToView, setItemToView] = useState<{ item: Issue | SubTask, type: 'issue' | 'subtask' } | null>(null);
    const [isDetailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

    // Completion state
    const [isCompleteModalOpen, setCompleteModalOpen] = useState(false);
    const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);
    const [availableSprints, setAvailableSprints] = useState<Sprint[]>([]);

    const handleCompleteClick = async () => {
        if (!sprint) return;
        try {
            const res = await getSprintsApi({ status: 'Planned' });
            if (res.success) {
                setAvailableSprints(res.data.sprints);
                setCompleteModalOpen(true);
            }
        } catch {
            toast.error("Failed to fetch available sprints");
        }
    };

    const handleConfirmComplete = async (moveTarget: string) => {
        if (!sprintId) return;
        setIsSubmittingComplete(true);
        interface SprintUpdateBody extends Partial<SprintFormData> {
            moveIssuesTo?: string;
        }
        try {
            const updateData: SprintUpdateBody = {
                status: 'Completed',
                moveIssuesTo: moveTarget
            };
            const response = await updateSprintApi(sprintId, updateData);

            if (response.success) {
                toast.success("Sprint completed successfully");
                setCompleteModalOpen(false);
                fetchSprintDetails();
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(error.response?.data?.message || "Failed to complete sprint");
        } finally {
            setIsSubmittingComplete(false);
        }
    };

    // Add Item state
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
    const [backlogProjects, setBacklogProjects] = useState<Project[]>([]);
    const [selectedBacklogProjectId, setSelectedBacklogProjectId] = useState<string>("");
    const [isFetchingBacklog, setIsFetchingBacklog] = useState(false);
    const [isConfirmingScopeChange, setIsConfirmingScopeChange] = useState<Issue | null>(null);

    const fetchSprintDetails = useCallback(async () => {
        if (!sprintId) return;
        try {
            const response = await getSprintByIdApi(sprintId);
            if (response.success) {
                setSprint(response.data);
                setIssues(response.data.issues || []);
            }
        } catch {
            toast.error("Failed to load sprint details");
        } finally {
            setLoading(false);
        }
    }, [sprintId]);

    const fetchVelocityData = useCallback(async () => {
        if (!sprintId) return;
        setVelocityLoading(true);
        try {
            const response = await getSprintVelocityApi(sprintId);
            if (response.success) {
                setVelocityData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch velocity data", error);
        } finally {
            setVelocityLoading(false);
        }
    }, [sprintId]);

    const fetchTeamMembers = useCallback(async () => {
        try {
            const response = await getTeamDirectoryApi();
            if (response.success) {
                // setTeams(response.data || []); // teams was unused
                const allMembers = (response.data || []).flatMap(team => team.members || []);
                const uniqueMembers = allMembers.filter((v, i, a) => a.findIndex(t => t?._id === v?._id) === i);
                setMembers(uniqueMembers);
            }
        } catch {
            console.error("Failed to load members");
        }
    }, []);

    const fetchBacklogForProject = useCallback(async (projectId: string) => {
        setIsFetchingBacklog(true);
        try {
            const response = await getIssuesByProjectApi(projectId);
            if (response.success) {
                // Filter out issues already in the current sprint and completed issues
                const available = response.data.filter(issue =>
                    (!issue.sprint_id || issue.sprint_id !== sprintId) &&
                    issue.status !== 'Completed'
                );
                setBacklogIssues(available);
            }
        } catch {
            toast.error("Failed to load backlog");
        } finally {
            setIsFetchingBacklog(false);
        }
    }, [sprintId]);

    const fetchProjects = useCallback(async () => {
        try {
            const response = await getProjectsApi();
            if (response.success) {
                setBacklogProjects(response.data);
                if (response.data.length > 0) {
                    setSelectedBacklogProjectId(response.data[0]._id);
                    fetchBacklogForProject(response.data[0]._id);
                }
            }
        } catch {
            console.error("Failed to load projects");
        }
    }, [fetchBacklogForProject]);

    useEffect(() => {
        if (sprintId) {
            fetchSprintDetails();
            fetchTeamMembers();
            fetchProjects();
        }
    }, [sprintId, fetchSprintDetails, fetchTeamMembers, fetchProjects]);

    useEffect(() => {
        if (activeTab !== 'issues' && !velocityData) {
            fetchVelocityData();
        }
    }, [activeTab, velocityData, fetchVelocityData]);


    const fetchSubTasks = useCallback(async (issueId: string) => {
        setSubTasksByIssue(prev => ({ ...prev, [issueId]: { data: prev[issueId]?.data || [], loading: true } }));
        try {
            const response = await getSubTasksByIssueApi(issueId);
            if (response.success) {
                setSubTasksByIssue(prev => ({ ...prev, [issueId]: { data: response.data, loading: false } }));
            }
        } catch {
            setSubTasksByIssue(prev => ({ ...prev, [issueId]: { data: [], loading: false } }));
        }
    }, []);

    const toggleIssue = (issueId: string) => {
        const next = new Set(expandedIssues);
        if (next.has(issueId)) {
            next.delete(issueId);
        } else {
            next.add(issueId);
            if (!subTasksByIssue[issueId]) {
                fetchSubTasks(issueId);
            }
        }
        setExpandedIssues(next);
    };

    const handleOpenSubTaskModal = (e: React.MouseEvent, issueId: string) => {
        e.stopPropagation();
        setActiveIssueId(String(issueId));
        setEditingSubTask(null);
        setSubTaskModalOpen(true);
    };

    const handleOpenEditModal = (e: React.MouseEvent, issueId: string, subTask: SubTask) => {
        e.stopPropagation();
        setActiveIssueId(issueId);
        setEditingSubTask(subTask);
        setSubTaskModalOpen(true);
    };

    const handleSubTaskSubmit = async (data: SubTaskFormData) => {
        if (!activeIssueId || !sprintId) return;
        setIsSubmittingSubTask(true);
        try {
            if (editingSubTask) {
                const response = await updateSubTaskApi(editingSubTask._id, { ...data });
                if (response.success) {
                    toast.success("Sub-task updated");
                    fetchSubTasks(activeIssueId);
                    setSubTaskModalOpen(false);
                }
            } else {
                const response = await createSubTaskApi({
                    ...data,
                    issue_id: String(activeIssueId),
                    sprint_id: String(sprintId)
                });
                if (response.success) {
                    toast.success("Sub-task created");
                    fetchSubTasks(activeIssueId);
                    setSubTaskModalOpen(false);
                }
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const errorMsg = error.response?.data?.message || (editingSubTask ? "Failed to update" : "Failed to create");
            toast.error(errorMsg);
        } finally {
            setIsSubmittingSubTask(false);
        }
    };

    const handleDeleteSubTask = async (e: React.MouseEvent, issueId: string, subTaskId: string) => {
        e.stopPropagation();
        setSubTaskToDelete({ issueId, subTaskId });
    };

    const confirmDeleteSubTask = async () => {
        if (!subTaskToDelete) return;
        try {
            const response = await deleteSubTaskApi(subTaskToDelete.subTaskId);
            if (response.success) {
                toast.success("Sub-task deleted");
                fetchSubTasks(subTaskToDelete.issueId);
            }
        } catch {
            toast.error("Failed to delete");
        } finally {
            setSubTaskToDelete(null);
        }
    };

    const handleAssignEmployee = async (employeeId: string) => {
        if (!issueToAssign) return;
        try {
            const response = await updateIssueApi(issueToAssign._id, { assignee_id: employeeId });
            if (response.success) {
                toast.success("Employee assigned successfully");
                fetchSprintDetails();
                setIssueToAssign(null);
            }
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleAssignSubTaskEmployee = async (employeeId: string) => {
        if (!subTaskToAssign) return;
        try {
            const response = await assignSubTaskApi(subTaskToAssign.subTask._id, employeeId);
            if (response.success) {
                toast.success("Sub-task assigned");
                fetchSubTasks(subTaskToAssign.issueId);
                setSubTaskToAssign(null);
            }
        } catch {
            toast.error("Failed to assign sub-task");
        }
    };

    const handleAddIssueToSprint = (issue: Issue) => {
        setIsConfirmingScopeChange(issue);
    };

    const executeAddIssue = async (issue: Issue) => {
        if (!sprintId) return;
        try {
            const response = await updateIssueApi(issue._id, {
                sprint_id: sprintId,
                status: 'To Do'
            });
            if (response.success) {
                toast.success(`${issue.type} added to sprint`);
                fetchSprintDetails();
                setIsConfirmingScopeChange(null);
                setBacklogIssues(prev => prev.filter(i => i._id !== issue._id));
            }
        } catch {
            toast.error("Failed to add issue to sprint");
        }
    };

    const onModalDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        if (source.droppableId === 'modal-backlog' && destination.droppableId === 'sprint-target') {
            const issue = backlogIssues.find(i => i._id === draggableId);
            if (issue) handleAddIssueToSprint(issue);
        } else if (source.droppableId === 'sprint-target' && destination.droppableId === 'modal-backlog') {
            const issue = issues.find(i => i._id === draggableId);
            if (issue) handleRemoveFromSprint(issue);
        }
    };

    const handleRemoveFromSprint = async (issue: Issue) => {
        if (!sprintId) return;
        try {
            const response = await updateIssueApi(issue._id, {
                sprint_id: null,
                status: 'New'
            });
            if (response.success) {
                toast.success(`${issue.type} removed from sprint`);
                fetchSprintDetails();
                if (issue.project_id === selectedBacklogProjectId) {
                    fetchBacklogForProject(selectedBacklogProjectId);
                }
            }
        } catch {
            toast.error("Failed to remove issue");
        }
    };

    const [activeSubTaskDropdown, setActiveSubTaskDropdown] = useState<string | null>(null);

    const renderSubTask = (subTask: SubTask, issueId: string) => (
        <div key={subTask._id} className="group/subTask bg-white border border-[#f0f0f0] rounded-[14px] p-3 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-visible">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center shrink-0">
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${subTask.status === 'Done' ? 'bg-emerald-500 ring-4 ring-emerald-50' :
                                subTask.status === 'In Progress' ? 'bg-[#fa8029] ring-4 ring-orange-50' :
                                    subTask.status === 'Blocked' ? 'bg-amber-500 ring-4 ring-amber-50' :
                                        'bg-indigo-400 ring-4 ring-indigo-50'
                            }`} />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <h4 className="text-[13px] font-bold text-[#1f2124] group-hover/subTask:text-indigo-600 transition-colors leading-normal truncate">
                            {subTask.title}
                        </h4>
                        <div className="flex items-center gap-3 flex-wrap mt-1">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${getPriorityColor(subTask.priority)}`}>
                                {subTask.priority}
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-[#aaa] font-bold shrink-0">
                                <Clock size={11} className="text-[#ccc]" /> {subTask.estimated_hours} hrs
                            </div>
                            {subTask.team_id && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50/50 text-indigo-500 rounded-md border border-indigo-100/50 shrink-0">
                                    <Users size={10} />
                                    <span className="text-[9px] font-black uppercase tracking-wider">{subTask.team_id.name}</span>
                                </div>
                            )}
                            {subTask.status === 'Blocked' && (
                                <span className="text-[9px] font-black text-white bg-amber-500 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">Blocked</span>
                            )}
                        </div>
                        {subTask.status === 'Blocked' && subTask.blocked_reason && (
                            <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-100/50">
                                <p className="text-[10px] text-amber-700 font-bold leading-relaxed italic">
                                    <MentionText text={subTask.blocked_reason || ""} />
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                        {subTask.assignee_id ? (
                            <button
                                onClick={(e) => {
                                    if (can('task:assign')) {
                                        e.stopPropagation();
                                        setSubTaskToAssign({ issueId, subTask });
                                    }
                                }}
                                className={`w-8 h-8 rounded-full bg-[#fa8029] flex items-center justify-center text-[10px] font-black text-white uppercase shadow-md transition-all ${can('task:assign') ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                                title={subTask.assignee_id.name}
                            >
                                {(() => {
                                    const assignee = subTask.assignee_id as { name: string; user_id?: { name: string } } | null;
                                    const name = assignee?.name || assignee?.user_id?.name;
                                    if (!name) return '??';
                                    return name.split(' ').length > 1
                                        ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                                        : name.substring(0, 2).toUpperCase();
                                })()}
                            </button>
                        ) : can('task:assign') && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setSubTaskToAssign({ issueId, subTask }); }}
                                className="w-8 h-8 rounded-full bg-white border border-[#eee] flex items-center justify-center text-[#aaa] hover:border-[#fa8029] hover:text-[#fa8029] transition-all shadow-sm"
                                title="Assign Employee"
                            >
                                <UserPlus size={14} />
                            </button>
                        )}
                    </div>
                    <div className="relative overflow-visible">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveSubTaskDropdown(activeSubTaskDropdown === subTask._id ? null : subTask._id);
                            }}
                            className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-all text-[#ccc] hover:text-[#555] bg-[#fafafa]/50"
                            title="Actions"
                        >
                            <MoreHorizontal size={18} />
                        </button>

                        {activeSubTaskDropdown === subTask._id && (
                            <>
                                <div
                                    className="fixed inset-0 z-[100]"
                                    onClick={(e) => { e.stopPropagation(); setActiveSubTaskDropdown(null); }}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[110] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 pb-2 mb-2 border-b border-gray-50">
                                        <p className="text-[9px] font-black text-[#ccc] uppercase tracking-widest">Action Menu</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setItemToView({ item: subTask, type: 'subtask' });
                                            setDetailsDrawerOpen(true);
                                            setActiveSubTaskDropdown(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-[12px] font-bold text-[#555] hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
                                    >
                                        <Eye size={15} /> View Details
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setItemToView({ item: subTask, type: 'subtask' });
                                            setDetailsDrawerOpen(true);
                                            setActiveSubTaskDropdown(null);
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-[12px] font-bold text-[#555] hover:bg-orange-50 hover:text-[#fa8029] transition-colors flex items-center gap-2"
                                    >
                                        <MessageSquare size={15} /> Comments
                                    </button>

                                    {can('task:update') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenEditModal(e, issueId, subTask);
                                                setActiveSubTaskDropdown(null);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-[12px] font-bold text-[#555] hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center gap-2"
                                        >
                                            <Pencil size={15} /> Edit Task
                                        </button>
                                    )}

                                    {subTask.status === 'In Progress' && (
                                        subTask.subtask_type === 'sub-task' ? can('task:block') :
                                        subTask.subtask_type === 'bug' ? can('issue:bug:block' as any) :
                                        subTask.subtask_type === 'task' ? can('issue:task:block' as any) :
                                        can('task:block')
                                    ) && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setItemToView({ item: subTask, type: 'subtask' });
                                                setDetailsDrawerOpen(true);
                                                setActiveSubTaskDropdown(null);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-[12px] font-bold text-amber-600 hover:bg-amber-50 transition-colors flex items-center gap-2"
                                        >
                                            <Clock size={15} /> Block Task
                                        </button>
                                    )}

                                    {subTask.status === 'Blocked' && (
                                        subTask.subtask_type === 'sub-task' ? can('task:block') :
                                        subTask.subtask_type === 'bug' ? can('issue:bug:block' as any) :
                                        subTask.subtask_type === 'task' ? can('issue:task:block' as any) :
                                        can('task:block')
                                    ) && (
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                const res = await updateSubTaskApi(subTask._id, { status: 'In Progress' });
                                                if (res.success) {
                                                    toast.success("Task unblocked");
                                                    fetchSprintDetails();
                                                }
                                                setActiveSubTaskDropdown(null);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-[12px] font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                                        >
                                            <Play size={15} /> Unblock / Resume
                                        </button>
                                    )}

                                    {can('task:delete') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSubTask(e, issueId, subTask._id);
                                                setActiveSubTaskDropdown(null);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-[12px] font-bold text-rose-500 hover:bg-rose-50 transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 size={15} /> Delete
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm shrink-0 min-w-[70px] text-center ${subTask.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            subTask.status === 'Blocked' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                        {subTask.status}
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#eee] border-t-[#fa8029] rounded-full animate-spin" />
                    <p className="text-[14px] font-medium text-[#aaa]">Loading sprint details...</p>
                </div>
            </div>
        );
    }

    if (!sprint) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Sprint not found</h2>
                <Link to="/employee/sprints" className="text-blue-500 hover:underline mt-4 inline-block">Back to Sprints</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-20">
            {/* Header section */}
            <div className="bg-white border-b border-[#f0f0f0] sticky top-0 z-20">
                <div className="max-w-[1400px] mx-auto px-6 py-6">
                    <div className="flex items-center gap-2 text-[12px] text-[#aaa] font-bold mb-4">
                        <Link to="/employee/sprints" className="hover:text-[#fa8029] transition-colors">Sprints</Link>
                        <ChevronRight size={14} />
                        <span className="text-[#555]">{sprint.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-[28px] font-black text-[#1f2124] tracking-tight">{sprint.name}</h1>
                                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${sprint.status?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        sprint.status?.toLowerCase() === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-gray-50 text-gray-500 border-gray-100'
                                    } shadow-sm`}>
                                    {sprint.status || "Planned"}
                                </span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-[13px] text-[#888] font-medium">
                                    <Calendar size={14} className="text-[#aaa]" />
                                    {new Date(sprint.start_date).toLocaleDateString()} — {new Date(sprint.end_date).toLocaleDateString()}
                                </div>
                                <div className="w-1 h-1 rounded-full bg-[#ddd]" />
                                <div className="text-[13px] text-[#888] font-medium">
                                    Goal: <span className="text-[#555]">{sprint.goal || "No goal set"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {sprint.status?.toLowerCase() === 'active' && can('sprint:update') && (
                                <button
                                    onClick={handleCompleteClick}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[13px] font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                                >
                                    <CheckCircle2 size={18} /> Complete Sprint
                                </button>
                            )}
                            <button
                                onClick={() => setIsAddItemModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#1f2124] text-white rounded-xl text-[13px] font-bold hover:bg-[#fa8029] transition-all shadow-lg shadow-black/5 active:scale-95"
                            >
                                <Plus size={18} /> Add Item
                            </button>
                            <button className="p-2.5 bg-white border border-[#eee] text-[#aaa] rounded-xl hover:text-[#fa8029] hover:border-[#fa8029]/30 transition-all">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-[#f9fafb] p-5 rounded-2xl border border-[#f0f0f0]">
                            <p className="text-[11px] font-black text-[#aaa] uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-2 text-[14px] font-bold text-[#1f2124]">
                                <Flag size={14} className="text-[#fa8029]" />
                                {sprint.status}
                            </div>
                        </div>
                        <div className="bg-[#f9fafb] p-5 rounded-2xl border border-[#f0f0f0]">
                            <p className="text-[11px] font-black text-[#aaa] uppercase tracking-widest mb-1">Velocity</p>
                            <div className="flex items-center gap-2 text-[14px] font-bold text-[#1f2124]">
                                <Target size={14} className="text-[#fa8029]" />
                                {issues.reduce((acc, curr) => acc + (curr.story_points || 0), 0)} / {sprint.total_points} Points
                            </div>
                        </div>
                        <div className="bg-[#f9fafb] p-5 rounded-2xl border border-[#f0f0f0]">
                            <p className="text-[11px] font-black text-[#aaa] uppercase tracking-widest mb-1">Progress</p>
                            <div className="flex items-center gap-2 text-[14px] font-bold text-[#1f2124]">
                                <div className="flex-1 h-1.5 bg-[#eee] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#fa8029]"
                                        style={{ width: `${Math.round((issues.filter(i => i.status === 'Done').length / (issues.length || 1)) * 100)}%` }}
                                    />
                                </div>
                                <span className="text-[12px]">{Math.round((issues.filter(i => i.status === 'Done').length / (issues.length || 1)) * 100)}%</span>
                            </div>
                        </div>
                        <div className="bg-[#f9fafb] p-5 rounded-2xl border border-[#f0f0f0]">
                            <p className="text-[11px] font-black text-[#aaa] uppercase tracking-widest mb-1">Issues</p>
                            <div className="flex items-center gap-2 text-[14px] font-bold text-[#1f2124]">
                                <Package size={14} className="text-[#fa8029]" />
                                {issues.length} Total Items
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 py-8">
                <div className="mb-8 border-b border-[#f0f0f0]">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setActiveTab('issues')}
                            className={`pb-4 text-[14px] font-black uppercase tracking-wider transition-all relative ${activeTab === 'issues' ? 'text-[#fa8029]' : 'text-[#aaa] hover:text-[#555]'}`}
                        >
                            <div className="flex items-center gap-2">
                                <ListTodo size={18} /> Issues
                            </div>
                            {activeTab === 'issues' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#fa8029] rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('multiple_team')}
                            className={`pb-4 text-[14px] font-black uppercase tracking-wider transition-all relative ${activeTab === 'multiple_team' ? 'text-[#fa8029]' : 'text-[#aaa] hover:text-[#555]'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Users size={18} /> Velocity - Multiple Team
                            </div>
                            {activeTab === 'multiple_team' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#fa8029] rounded-t-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('sprint_wise')}
                            className={`pb-4 text-[14px] font-black uppercase tracking-wider transition-all relative ${activeTab === 'sprint_wise' ? 'text-[#fa8029]' : 'text-[#aaa] hover:text-[#555]'}`}
                        >
                            <div className="flex items-center gap-2">
                                <CheckSquare size={18} /> Velocity - Sprint Wise
                            </div>
                            {activeTab === 'sprint_wise' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#fa8029] rounded-t-full" />}
                        </button>
                    </div>
                </div>

                {activeTab === 'issues' ? (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-[18px] font-black text-[#1f2124] flex items-center gap-2">
                                <ListTodo size={20} className="text-[#fa8029]" /> Issues
                            </h2>
                        </div>

                        {issues.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-[#eee] rounded-[32px] p-20 text-center flex flex-col items-center">
                                <Layout size={40} className="text-[#ddd] mb-4" />
                                <h4 className="text-[16px] font-bold text-[#888]">Your sprint backlog is empty</h4>
                                <button onClick={() => setIsAddItemModalOpen(true)} className="mt-4 text-[#fa8029] font-bold hover:underline">Add items to get started</button>
                            </div>
                        ) : (
                            <div className="space-y-3 pb-20">
                                {issues.map((issue) => {
                                    const isExpanded = expandedIssues.has(issue._id);
                                    const subTaskConfig = subTasksByIssue[issue._id];

                                    return (
                                        <div key={issue._id} className="bg-white border border-[#f0f0f0] rounded-2xl shadow-sm overflow-visible transition-all hover:border-[#fa8029]/20">
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
                                                            {issue.type === 'story' ? (
                                                                <p className="text-[11px] text-[#aaa] font-medium uppercase tracking-tighter">
                                                                    {issue.type} • {issue.priority} • {issue.story_points} pts
                                                                </p>
                                                            ) : (
                                                                <p className="text-[11px] text-[#aaa] font-medium uppercase tracking-tighter">
                                                                    {issue.type} • {issue.priority} • {issue.estimated_hours || 0} hrs
                                                                </p>
                                                            )}
                                                            {(issue.type === 'bug' || issue.type === 'task') && issue.assignee_id && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-[#eee]" />
                                                                    <p className="text-[11px] font-bold text-orange-500/70">
                                                                        {(() => {
                                                                            const assignee = issue.assignee_id as { name: string; user_id?: { name: string } } | null;
                                                                            const assignTo = issue.assign_to;
                                                                            return assignee?.name || assignee?.user_id?.name || assignTo?.name;
                                                                        })()}
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 shrink-0">
                                                    <div className="flex items-center gap-2">
                                                        {issue.assignee_id ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    if (can(`issue:${issue.type}:assign` as Parameters<typeof can>[0])) {
                                                                        e.stopPropagation();
                                                                        setIssueToAssign(issue);
                                                                    }
                                                                }}
                                                                className={`w-8 h-8 rounded-full bg-[#fa8029] flex items-center justify-center text-[10px] font-black text-white uppercase shadow-md transition-all ${can(`issue:${issue.type}:assign` as "issue:story:assign" | "issue:bug:assign" | "issue:task:assign") ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                                                                title={issue.assignee_id.name}
                                                            >
                                                                {(() => {
                                                                    const assignee = issue.assignee_id as { name: string; user_id?: { name: string } } | null;
                                                                    const assignTo = (issue as unknown as { assign_to?: { name: string } }).assign_to;
                                                                    const name = assignee?.name || assignee?.user_id?.name || assignTo?.name;
                                                                    if (!name) return '??';
                                                                    return name.split(' ').length > 1
                                                                        ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                                                                        : name.substring(0, 2).toUpperCase();
                                                                })()}
                                                            </button>
                                                        ) : can(`issue:${issue.type}:assign` as "issue:story:assign" | "issue:bug:assign" | "issue:task:assign") && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setIssueToAssign(issue); }}
                                                                className="w-8 h-8 rounded-full bg-white border border-[#eee] flex items-center justify-center text-[#aaa] hover:border-[#fa8029] hover:text-[#fa8029] transition-all shadow-sm"
                                                                title="Assign Employee"
                                                            >
                                                                <UserPlus size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setItemToView({ item: issue, type: 'issue' });
                                                            setDetailsDrawerOpen(true);
                                                        }}
                                                        className="p-2 text-[#aaa] hover:text-[#fa8029] hover:bg-[#fff5ef] rounded-xl transition-all"
                                                        title="Comments & Details"
                                                    >
                                                        <MessageSquare size={18} />
                                                    </button>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                                                                issue.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                                issue.status === 'Blocked' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                {issue.status}
                                                            </span>
                                                            {issue.status === 'Blocked' && issue.blocked_reason && (
                                                                <p className="text-[9px] text-amber-600 font-bold italic max-w-[150px] truncate" title={issue.blocked_reason}>
                                                                    {issue.blocked_reason}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {can('task:create') && (
                                                            <button
                                                                onClick={(e) => handleOpenSubTaskModal(e, issue._id)}
                                                                className="p-2 bg-[#f9fafb] text-[#aaa] rounded-xl hover:text-[#fa8029] hover:bg-[#fff5ef] transition-all border border-transparent hover:border-[#fa8029]/20"
                                                                title="Add Sub-task"
                                                            >
                                                                <Plus size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="px-6 pb-6 pt-0 border-t border-[#fcfcfc] bg-[#fafafa]/50 overflow-visible">
                                                    <div className="h-4" />
                                                    <div className="flex items-center gap-2 mb-4 px-2">
                                                        <ListTodo size={14} className="text-[#aaa]" />
                                                        <h4 className="text-[12px] font-black text-[#888] uppercase tracking-wider">Sub-Tasks Breakdown</h4>
                                                    </div>

                                                    {!subTaskConfig || subTaskConfig.loading ? (
                                                        <div className="py-8 flex flex-col items-center gap-3">
                                                            <div className="w-5 h-5 border-2 border-[#eee] border-t-[#fa8029] rounded-full animate-spin" />
                                                            <p className="text-[11px] text-[#aaa] font-medium italic">Assembling task tree...</p>
                                                        </div>
                                                    ) : subTaskConfig.data.length === 0 ? (
                                                        <div className="py-12 bg-white rounded-3xl border border-[#f0f0f0] border-dashed text-center flex flex-col items-center">
                                                            <AlertCircle size={24} className="text-[#eee] mb-2" />
                                                            <p className="text-[12px] text-[#aaa] font-medium">No sub-tasks defined yet.</p>
                                                            {can('task:create') && (
                                                                <button
                                                                    onClick={(e) => handleOpenSubTaskModal(e, issue._id)}
                                                                    className="mt-3 text-[11px] font-bold text-[#fa8029] hover:underline"
                                                                >
                                                                    Create the first one
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-4">
                                                            {(() => {
                                                                const userTeamId = user?.team?._id || user?.team_id;
                                                                const isPM = can('task:view:all');

                                                                // Filter subtasks
                                                                const filtered = subTaskConfig.data.filter(st => {
                                                                    const stTeamId = typeof st.team_id === 'object' ? st.team_id?._id : st.team_id;

                                                                    // If user is PM or has no team (unassigned), show everything
                                                                    if (isPM || !userTeamId) return true;

                                                                    // If user has a team, only show their team's subtasks
                                                                    return stTeamId === userTeamId;
                                                                });

                                                                // If PM/Unassigned, group by team
                                                                if ((isPM || !userTeamId) && filtered.length > 0) {
                                                                    const grouped = filtered.reduce((acc, st) => {
                                                                        const teamName = st.team_id?.name || "Unassigned";
                                                                        if (!acc[teamName]) acc[teamName] = [];
                                                                        acc[teamName].push(st);
                                                                        return acc;
                                                                    }, {} as Record<string, SubTask[]>);

                                                                    return Object.entries(grouped).map(([teamName, tasks]) => (
                                                                        <div key={teamName} className="mb-6 last:mb-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                                                            <div className="flex items-center justify-between mb-3 px-2">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50 shadow-sm">
                                                                                        <Users size={14} />
                                                                                    </div>
                                                                                    <div>
                                                                                        <h5 className="text-[13px] font-black text-[#1f2124] tracking-tight">{teamName}</h5>
                                                                                        <p className="text-[10px] text-[#aaa] font-bold uppercase tracking-wider">{tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="h-[1px] flex-1 bg-gradient-to-r from-indigo-100/50 to-transparent ml-4" />
                                                                            </div>
                                                                            <div className="space-y-1.5 pl-4 border-l-2 border-indigo-50/50 ml-4">
                                                                                {tasks.map(subTask => renderSubTask(subTask, issue._id))}
                                                                            </div>
                                                                        </div>
                                                                    ));
                                                                }

                                                                // Otherwise just show the list
                                                                return (
                                                                    <div className="space-y-1">
                                                                        {filtered.map(subTask => renderSubTask(subTask, issue._id))}
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : null}

                {activeTab === 'multiple_team' && (
                    <div className="bg-white border border-[#f0f0f0] rounded-[32px] p-10 shadow-sm">
                        <h3 className="text-[20px] font-black text-[#1f2124] mb-8 flex items-center gap-3">
                            <Users size={24} className="text-[#fa8029]" /> Team Performance Comparison
                        </h3>
                        {velocityLoading ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-[#eee] border-t-[#fa8029] rounded-full animate-spin" />
                            </div>
                        ) : velocityData?.multipleTeam.length === 0 ? (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center">
                                <Users size={48} className="text-[#eee] mb-4" />
                                <p className="text-[#aaa] font-medium">No team velocity data available for this sprint.</p>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                <div className="h-[400px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={velocityData?.multipleTeam} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis dataKey="teamName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#888' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#888' }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                                cursor={{ fill: '#fafafa' }}
                                            />
                                            <Bar dataKey="completed" name="Completed Points" fill="#fa8029" radius={[10, 10, 0, 0]} barSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {velocityData?.multipleTeam.map((team, idx) => (
                                        <div key={idx} className="bg-[#fafafa] rounded-2xl p-6 border border-[#f0f0f0] flex items-center justify-between group hover:border-[#fa8029]/30 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-[#eee] flex items-center justify-center text-[#fa8029] font-black text-xl">
                                                    {team.teamName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-[15px] font-black text-[#1f2124]">{team.teamName}</h4>
                                                    <p className="text-[11px] text-[#aaa] font-bold uppercase tracking-wider">Team Velocity</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[24px] font-black text-[#fa8029]">{team.completed}</span>
                                                <p className="text-[10px] text-[#aaa] font-bold uppercase">Points</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'sprint_wise' && (
                    <div className="bg-white border border-[#f0f0f0] rounded-[32px] p-10 shadow-sm">
                        <h3 className="text-[20px] font-black text-[#1f2124] mb-8 flex items-center gap-3">
                            <CheckSquare size={24} className="text-[#fa8029]" /> Team Capacity Trend
                        </h3>
                        {velocityLoading ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-[#eee] border-t-[#fa8029] rounded-full animate-spin" />
                            </div>
                        ) : !velocityData || velocityData.sprintWise.length === 0 ? (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center">
                                <Activity size={48} className="text-[#eee] mb-4" />
                                <p className="text-[#aaa] font-medium">No historical velocity data available.</p>
                            </div>
                        ) : (
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={velocityData.sprintWise} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="sprintName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#888' }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#888' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                            cursor={{ fill: '#fafafa' }}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                        <Bar dataKey="committed" name="Committed" fill="#ddd" radius={[6, 6, 0, 0]} barSize={40} />
                                        <Bar dataKey="completed" name="Completed (Velocity)" fill="#fa8029" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                )}
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


            <ItemDetailsDrawer
                isOpen={isDetailsDrawerOpen}
                onClose={() => setDetailsDrawerOpen(false)}
                item={itemToView?.item || null}
                type={itemToView?.type || 'issue'}
                onUpdate={() => {
                    fetchSprintDetails();
                    if (itemToView?.type === 'subtask') {
                        fetchSubTasks((itemToView.item as SubTask).issue_id);
                    }
                }}
            />



            <ConfirmModal
                isOpen={!!isConfirmingScopeChange}
                onClose={() => setIsConfirmingScopeChange(null)}
                onConfirm={() => isConfirmingScopeChange && executeAddIssue(isConfirmingScopeChange)}
                title="Add to Sprint?"
                message={sprint?.status?.toLowerCase() === 'active'
                    ? "This sprint has already started. Adding this issue will change the sprint scope and may affect the sprint goal. Do you want to continue?"
                    : "Are you sure you want to add this issue to the sprint? This will move it from the backlog and set its status to 'To Do'."}
                confirmText="Confirm"
                type="warning"
            />

            <AddIssueToSprintModal
                isOpen={isAddItemModalOpen}
                onClose={() => setIsAddItemModalOpen(false)}
                onAdd={handleAddIssueToSprint}
                issues={backlogIssues}
                loading={isFetchingBacklog}
                projects={backlogProjects}
                selectedProjectId={selectedBacklogProjectId}
                onProjectChange={(pid) => {
                    setSelectedBacklogProjectId(pid);
                    fetchBacklogForProject(pid);
                }}
                onDragEnd={onModalDragEnd}
                sprintIssues={issues}
            />

            <CompleteSprintModal
                isOpen={isCompleteModalOpen}
                onClose={() => setCompleteModalOpen(false)}
                incompleteCount={issues.filter(i => i.status !== 'Done').length}
                availableSprints={availableSprints}
                onConfirm={handleConfirmComplete}
                isSubmitting={isSubmittingComplete}
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
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl relative z-[2010] animate-in fade-in zoom-in duration-200 overflow-hidden">
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
                                    {member.name?.substring(0, 2) || '??'}
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

function AddIssueToSprintModal({ isOpen, onClose, onAdd, issues, loading, projects, selectedProjectId, onProjectChange, onDragEnd, sprintIssues }: {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (issue: Issue) => void;
    issues: Issue[];
    loading: boolean;
    projects: Project[];
    selectedProjectId: string;
    onProjectChange: (id: string) => void;
    onDragEnd: (result: DropResult) => void;
    sprintIssues: Issue[];
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-[24px] w-full max-w-5xl shadow-2xl relative z-[2010] animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col h-[85vh]">
                <div className="p-6 border-b border-[#f0f0f0] flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-[18px] font-black text-[#1f2124]">Sprint Planning Modal</h3>
                        <p className="text-[12px] text-[#888] font-medium">Drag items from backlog into the sprint column</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f9fafb] border border-[#eee] rounded-xl">
                            <span className="text-[11px] font-bold text-[#888]">Project:</span>
                            <select
                                value={selectedProjectId}
                                onChange={(e) => onProjectChange(e.target.value)}
                                className="bg-transparent text-[11px] font-bold outline-none text-[#fa8029]"
                            >
                                {projects.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl text-[#aaa] hover:bg-[#f5f5f5] transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex-1 flex overflow-hidden p-6 gap-6 bg-[#fdfdfd]">
                        {/* Backlog Column */}
                        <div className="flex-1 flex flex-col bg-[#f8f9fa] border border-[#eee] rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-[#f0f0f0] bg-white flex items-center justify-between">
                                <h4 className="text-[13px] font-bold text-[#1f2124] flex items-center gap-2">
                                    <ListTodo size={14} className="text-[#aaa]" /> Project Backlog
                                </h4>
                                <span className="bg-[#f0f0f0] text-[#888] px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                    {issues.length} Items
                                </span>
                            </div>

                            <Droppable droppableId="modal-backlog">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-gray-100/50' : ''}`}
                                    >
                                        {loading ? (
                                            <div className="py-10 flex flex-col items-center gap-3">
                                                <div className="w-6 h-6 border-2 border-[#fa8029] border-t-transparent rounded-full animate-spin" />
                                                <p className="text-[12px] text-[#aaa]">Loading backlog...</p>
                                            </div>
                                        ) : issues.length === 0 ? (
                                            <div className="py-20 text-center">
                                                <p className="text-[12px] text-[#aaa] italic">No items available</p>
                                            </div>
                                        ) : (
                                            issues.map((issue, index) => (
                                                <Draggable key={issue._id} draggableId={issue._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white border border-[#eee] p-3 rounded-xl hover:shadow-md transition-all group flex items-start justify-between gap-3 ${snapshot.isDragging ? 'shadow-xl ring-2 ring-[#fa8029]/30 rotate-1' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${issue.type === 'bug' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                                        issue.type === 'story' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                                                            'bg-blue-50 text-blue-500 border-blue-100'
                                                                    }`}>
                                                                    <TypeIcon type={issue.type} size={14} />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-[13px] font-bold text-[#1f2124]">{issue.title}</h5>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <span className="text-[10px] bg-blue-50 text-blue-500 font-bold px-1.5 py-0.5 rounded-md border border-blue-100 uppercase">{issue.priority}</span>
                                                                        {issue.type === 'story' && issue.story_points > 0 && <span className="text-[10px] text-[#888] font-bold">{issue.story_points} Points</span>}
                                                                        {(issue.type === 'bug' || issue.type === 'task') && <span className="text-[10px] text-[#888] font-bold">{issue.estimated_hours || 0} hrs</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => onAdd(issue)}
                                                                className="p-1.5 bg-[#fff5ef] text-[#fa8029] hover:bg-[#fa8029] hover:text-white rounded-lg transition-all"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>

                        {/* Sprint Column */}
                        <div className="flex-1 flex flex-col bg-[#fffbf9]/50 border border-[#fa8029]/10 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-[#fa8029]/5 bg-white flex items-center justify-between">
                                <h4 className="text-[13px] font-bold text-[#fa8029] flex items-center gap-2">
                                    <Target size={14} /> Sprint Items
                                </h4>
                                <span className="bg-[#fa8029] text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                    {sprintIssues.length} Items
                                </span>
                            </div>

                            <Droppable droppableId="sprint-target">
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar transition-colors ${snapshot.isDraggingOver ? 'bg-[#fa8029]/5 border-2 border-dashed border-[#fa8029]/20' : ''}`}
                                    >
                                        {sprintIssues.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                                <Target size={32} className="text-[#fa8029] mb-2" />
                                                <p className="text-[12px] font-medium text-[#fa8029]">Drag here to add</p>
                                            </div>
                                        ) : (
                                            sprintIssues.map((issue, index) => (
                                                <Draggable key={issue._id} draggableId={issue._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white border border-[#fa8029]/10 p-3 rounded-xl shadow-sm flex items-start justify-between gap-3 border-l-4 border-l-[#fa8029] ${snapshot.isDragging ? 'shadow-xl ring-2 ring-[#fa8029]/30 -rotate-1' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${issue.type === 'bug' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                                        issue.type === 'story' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' :
                                                                            'bg-blue-50 text-blue-500 border-blue-100'
                                                                    }`}>
                                                                    <TypeIcon type={issue.type} size={14} />
                                                                </div>
                                                                <div>
                                                                    <h5 className="text-[13px] font-bold text-[#1f2124]">{issue.title}</h5>
                                                                    <div className="flex items-center gap-3 mt-1">
                                                                        <span className="text-[10px] bg-blue-50 text-blue-500 font-bold px-1.5 py-0.5 rounded-md border border-blue-100 uppercase">{issue.priority}</span>
                                                                        {issue.type === 'story' ? (
                                                                            <span className="text-[10px] text-[#888] font-bold">{issue.story_points || 0} Points</span>
                                                                        ) : (
                                                                            <span className="text-[10px] text-[#888] font-bold">{issue.estimated_hours || 0} hrs</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))
                                        )}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    </div>
                </DragDropContext>
            </div>
        </div>
    );
}

