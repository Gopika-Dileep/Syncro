import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
    getAssignedSubTasksApi,
    getTeamSubTasksApi,
    getAllSubTasksApi,
    updateSubTaskApi,
    assignSubTaskApi,
    deleteSubTaskApi,
    startSubTaskApi,
    submitSubTaskApi,
    reviewSubTaskApi,
    type SubTask
} from "../api/subTaskApi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import {
    Clock,
    MoreVertical,
    Search,
    Users,
    User,
    FileText,
    UserPlus,
    Edit2,
    Trash2,
    RotateCcw,
    X
} from "lucide-react";
import type { RootState } from "@/store/store";
import { usePermission } from "@/features/employee/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import ConfirmModal from "@/features/shared/components/ConfirmModal";
import SubTaskSubmissionModal from "../components/SubTaskSubmissionModal";
import AssignSubTaskModal from "../components/AssignSubTaskModal";
import SubTaskDetailsModal from "../components/SubTaskDetailsModal";
import SubTaskModal from "../components/SubTaskModal";

// const TypeIcon = ({ type, size = 12 }: { type: string; size?: number }) => {
//     switch (type?.toLowerCase()) {
//         case 'bug': return <Bug size={size} className="text-rose-500" />;
//         case 'story': return <BookOpen size={size} className="text-emerald-500" />;
//         default: return <CheckSquare size={size} className="text-blue-500" />;
//     }
// };

const COLUMNS = ["To Do", "In Progress", "In Review", "Done"];

export default function SubTasks() {
    const [subTasks, setSubTasks] = useState<SubTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchTerm = useDebounce(searchQuery, 500);
    const [activeTab, setActiveTab] = useState<'team' | 'assigned'>('team');
    const user = useSelector((state: RootState) => state.auth.user);
    const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>(user?.team?._id || user?.team_id || 'all');

    // Modal states
    const [showStartConfirm, setShowStartConfirm] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSubTask, setSelectedSubTask] = useState<SubTask | null>(null);
    const [members, setMembers] = useState<{ _id: string; name: string; email: string; designation?: string }[]>([]);
    const [showReworkModal, setShowReworkModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reworkReason, setReworkReason] = useState("");
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const { can } = usePermission();

    const isPM = can('task:view:all');
    const canViewTeam = can('task:view:team');
    const canViewAssigned = can('task:view:assigned');
    const hasTeam = !!(user?.team?._id || user?.team_id);

    useEffect(() => {
        fetchSubTasks();
        fetchMembers();
    }, [activeTab, isPM, debouncedSearchTerm]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchSubTasks = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            let response;
            if (isPM) {
                response = await getAllSubTasksApi(debouncedSearchTerm);
            } else if (canViewTeam && activeTab === 'team') {
                response = await getTeamSubTasksApi(debouncedSearchTerm);
            } else {
                response = await getAssignedSubTasksApi(debouncedSearchTerm);
            }
            if (response.success) {
                setSubTasks(response.data);
                if (selectedSubTask) {
                    const updated = (response.data as SubTask[]).find(s => s._id === selectedSubTask._id);
                    if (updated) setSelectedSubTask(updated);
                }
            }
        } catch {
            toast.error("Failed to load sub-tasks");
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const { getTeamDirectoryApi } = await import("../api/teamApi");
            const res = await getTeamDirectoryApi();
            const allMembers = res.data.flatMap(t => t.members);
            const unique = allMembers.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i);
            setMembers(unique);
        } catch (err) {
            console.error("Failed to fetch members", err);
        }
    };

    const handleStatusChange = async (subTaskId: string, newStatus: string, extraData: Record<string, unknown> = {}) => {
        try {
            const currentTask = subTasks.find(t => t._id === subTaskId);
            let response;

            // Use specialized workflow APIs based on target status
            if (newStatus === 'In Progress') {
                response = await startSubTaskApi(subTaskId);
            } else if (newStatus === 'In Review') {
                response = await submitSubTaskApi(subTaskId, {
                    submission_link: (extraData.submission_link as string) || '',
                    submission_description: (extraData.submission_description as string) || ''
                });
            } else if (newStatus === 'Done') {
                response = await reviewSubTaskApi(subTaskId, { action: 'approve' });
            } else if (newStatus === 'To Do' && currentTask?.status === 'In Review') {
                response = await reviewSubTaskApi(subTaskId, {
                    action: 'reject',
                    rework_reason: (extraData.rework_reason as string)
                });
            } else {
                // Fallback to generic update if they have permission
                response = await updateSubTaskApi(subTaskId, { status: newStatus, ...extraData });
            }

            if (response.success) {
                const updatedTask = { ...currentTask, ...response.data, status: newStatus };
                setSubTasks(prev => prev.map(t => t._id === subTaskId ? updatedTask : t));
                if (selectedSubTask?._id === subTaskId) {
                    setSelectedSubTask(updatedTask);
                }
                toast.success(`Sub-task moved to ${newStatus}`);
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to update status";
            toast.error(errorMsg);
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const subTask = subTasks.find(t => t._id === draggableId);
        if (!subTask) return;

        const newStatus = destination.droppableId;
        
        // Determine module prefix for permission check
        const type = subTask.subtask_type?.toLowerCase() || 'task';
        const prefix = type === 'sub-task' ? 'task' : `issue:${type}`;

        // Check permissions for status transitions
        if (newStatus === "In Progress" && subTask.status === "To Do") {
            if (!can(`${prefix}:status:work`)) {
                toast.error("You don't have permission to start this task");
                return;
            }
            setSelectedSubTask(subTask);
            setShowStartConfirm(true);
            return;
        }

        if (newStatus === "In Review" && subTask.status === "In Progress") {
            if (!can(`${prefix}:status:work`)) {
                toast.error("You don't have permission to submit this task");
                return;
            }
            setSelectedSubTask(subTask);
            setShowSubmissionModal(true);
            return;
        }

        if (newStatus === "Done" && subTask.status === "In Review") {
            if (!can(`${prefix}:status:review`)) {
                toast.error("You don't have permission to approve this task");
                return;
            }
            handleStatusChange(draggableId, "Done");
            return;
        }

        if (newStatus === "To Do" && subTask.status === "In Review") {
            if (!can(`${prefix}:status:review`)) {
                toast.error("You don't have permission to reject this task");
                return;
            }
            setSelectedSubTask(subTask);
            setShowReworkModal(true);
            return;
        }

        // Generic move if it doesn't fit specific transitions (e.g. PM moving freely)
        if (isPM) {
            handleStatusChange(draggableId, newStatus);
        } else {
            toast.error("Invalid status transition or insufficient permissions");
        }
    };

    const handleRework = async () => {
        if (!selectedSubTask || !reworkReason.trim()) return;
        setIsSubmitting(true);
        try {
            await handleStatusChange(selectedSubTask._id, "To Do", { rework_reason: reworkReason });
            setShowReworkModal(false);
            setReworkReason("");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStartSubTask = async () => {
        if (!selectedSubTask) return;
        setIsSubmitting(true);
        try {
            await handleStatusChange(selectedSubTask._id, "In Progress");
            setShowStartConfirm(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmissionSubmit = async (data: { description: string; branch_name: string; submission_link: string }) => {
        if (!selectedSubTask) return;
        setIsSubmitting(true);
        try {
            await handleStatusChange(selectedSubTask._id, "In Review", {
                submission_description: data.description,
                branch_name: data.branch_name,
                submission_link: data.submission_link
            });
            setShowSubmissionModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssignSubmit = async (memberId: string) => {
        if (!selectedSubTask) return;
        try {
            const response = await assignSubTaskApi(selectedSubTask._id, memberId);
            if (response.success) {
                setSubTasks(prev => prev.map(t => t._id === selectedSubTask._id ? { ...t, assignee_id: response.data.assignee_id } : t));
                toast.success("Sub-task assigned successfully");
            }
        } catch {
            toast.error("Failed to assign sub-task");
            throw new Error("Failed to assign");
        }
    };

    const filteredSubTasks = subTasks.filter(t => {
        if (isPM && selectedTeamFilter !== 'all') {
            return t.team_id?._id === selectedTeamFilter;
        }
        return true;
    });

    const teamList = isPM ? Array.from(
        new Map(subTasks.filter(t => t.team_id).map(t => [t.team_id!._id, t.team_id!])).values()
    ) : [];

    const getColumnStyle = (column: string) => {
        switch (column) {
            case "To Do": return { header: "bg-[#ececec] text-[#333]", accent: "bg-[#d0d0d0]" };
            case "In Progress": return { header: "bg-[#fef3c7] text-[#92400e]", accent: "bg-[#fcd34d]" };
            case "In Review": return { header: "bg-[#dbeafe] text-[#1e40af]", accent: "bg-[#93c5fd]" };
            case "Done": return { header: "bg-[#d1fae5] text-[#065f46]", accent: "bg-[#6ee7b7]" };
            default: return { header: "bg-gray-100 text-gray-700", accent: "bg-gray-300" };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#eee] border-t-[#fa8029] rounded-full animate-spin" />
                    <p className="text-[14px] font-medium text-[#aaa]">Loading workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-100px)] flex flex-col bg-[#f7f7f7] font-sans">
            <div className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-[15px] font-bold text-[#1f2124]">
                            {isPM ? 'Workspaces — All Teams' : (hasTeam && activeTab === 'team') ? 'Team Kanban Board' : 'Personal Kanban Board'}
                        </h1>
                        <p className="text-[11px] text-[#aaa] mt-0.5">
                            {isPM ? 'Cross-functional sub-task visibility' : (hasTeam && activeTab === 'team') ? 'Manage sprint velocity and team output' : 'Track and execute your daily sub-tasks'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {hasTeam && !isPM && (
                            <div className="flex bg-white border border-[#ebebeb] rounded-full p-0.5 shadow-sm">
                                {canViewTeam && (
                                    <button
                                        onClick={() => { setActiveTab('team'); setSelectedTeamFilter('all'); }}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${activeTab === 'team' ? 'bg-[#1f2124] text-white' : 'text-[#999] hover:bg-gray-50'}`}
                                    >
                                        <Users size={11} /> Team
                                    </button>
                                )}
                                {canViewAssigned && (
                                    <button
                                        onClick={() => { setActiveTab('assigned'); setSelectedTeamFilter('all'); }}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${activeTab === 'assigned' ? 'bg-[#1f2124] text-white' : 'text-[#999] hover:bg-gray-50'}`}
                                    >
                                        <User size={11} /> Mine
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-white border border-[#ebebeb] rounded-full px-3 py-1.5 w-[200px] shadow-sm">
                            <Search size={12} className="text-[#ccc] flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Filter sub-tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 text-[11px] text-[#1f2124] placeholder:text-[#ccc] bg-transparent outline-none min-w-0"
                            />
                        </div>
                    </div>
                </div>

                {isPM && teamList.length > 0 && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
                        <button
                            onClick={() => setSelectedTeamFilter('all')}
                            className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border transition-all whitespace-nowrap ${selectedTeamFilter === 'all' ? 'bg-[#1f2124] text-white border-[#1f2124]' : 'bg-white text-[#555] border-[#eee]'}`}
                        >
                            All Teams
                        </button>
                        {teamList.map(team => (
                            <button
                                key={team._id}
                                onClick={() => setSelectedTeamFilter(team._id)}
                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border transition-all whitespace-nowrap ${selectedTeamFilter === team._id ? 'bg-[#fa8029] text-white border-[#fa8029]' : 'bg-white text-[#555] border-[#eee]'}`}
                            >
                                {team.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-x-auto pt-0 pb-10">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-3 min-w-max h-fit">
                        {COLUMNS.map(column => {
                            const style = getColumnStyle(column);
                            const columnSubTasks = filteredSubTasks.filter(t => t.status === column);
                            return (
                                <div key={column} className="flex flex-col w-[250px] h-fit">
                                    <div className={`flex items-center justify-between px-3.5 py-2 rounded-t-xl ${style.header} shrink-0 sticky top-0 z-10 shadow-sm mb-2`}>
                                        <h3 className="text-[12px] font-bold">{column}</h3>
                                        <span className="text-[10px] font-bold bg-white/50 px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                            {columnSubTasks.length}
                                        </span>
                                    </div>

                                    <Droppable droppableId={column}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`flex flex-col gap-2 min-h-[150px] rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-gray-200/50' : ''}`}
                                            >
                                                {columnSubTasks.map((subTask, index) => (
                                                    <Draggable key={subTask._id} draggableId={subTask._id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => { setSelectedSubTask(subTask); setShowDetailsModal(true); }}
                                                                className={`bg-white rounded-xl p-3 shadow-sm border border-transparent hover:border-[#fa8029]/20 transition-all cursor-pointer relative ${snapshot.isDragging ? 'shadow-xl ring-2 ring-[#fa8029]/30 rotate-1' : ''} ${subTask.rework_reason && subTask.status === "In Progress" ? 'ring-1 ring-rose-100' : ''}`}
                                                            >
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${subTask.priority === 'High' ? 'text-rose-600 bg-rose-50' :
                                                                                subTask.priority === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50'
                                                                            }`}>
                                                                            {subTask.priority}
                                                                        </div>
                                                                        {subTask.team_id && (
                                                                            <div className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100">
                                                                                {subTask.team_id.name}
                                                                            </div>
                                                                        )}
                                                                        <div className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                                                                            subTask.subtask_type?.toLowerCase() === 'bug' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                                                                            subTask.subtask_type?.toLowerCase() === 'task' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                                                                            'text-emerald-600 bg-emerald-50 border-emerald-100'
                                                                        }`}>
                                                                            {subTask.subtask_type || 'Sub-Task'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="relative">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === subTask._id ? null : subTask._id); }}
                                                                            className="text-[#ddd] hover:text-[#555] p-0.5 transition-colors"
                                                                        >
                                                                            <MoreVertical size={12} />
                                                                        </button>

                                                                        {activeDropdown === subTask._id && (
                                                                            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setSelectedSubTask(subTask);
                                                                                        setShowDetailsModal(true);
                                                                                        setActiveDropdown(null);
                                                                                    }}
                                                                                    className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-[#555] hover:bg-gray-50 flex items-center gap-2"
                                                                                >
                                                                                    <FileText size={12} className="text-[#fa8029]" /> View Details
                                                                                </button>
                                                                                {can('task:assign') && (
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setSelectedSubTask(subTask);
                                                                                            setShowAssignModal(true);
                                                                                            setActiveDropdown(null);
                                                                                        }}
                                                                                        className="w-full text-left px-3 py-1.5 text-[11px] font-bold text-[#555] hover:bg-gray-50 flex items-center gap-2"
                                                                                    >
                                                                                        <UserPlus size={12} className="text-[#fa8029]" /> Reassign
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <h4 className="text-[12px] font-bold text-[#1f2124] mb-1 leading-snug">
                                                                    {subTask.title}
                                                                </h4>

                                                                <p className="text-[10px] text-[#999] line-clamp-1 mb-2">
                                                                    {subTask.description || "No additional details."}
                                                                </p>

                                                                {subTask.status === "In Progress" && subTask.rework_reason && (
                                                                    <div className="mb-2 p-2 bg-orange-50/50 border border-orange-100 rounded-lg relative">
                                                                        <div className="absolute -top-1.5 right-1.5 px-1.5 py-0.5 bg-rose-500 text-white text-[7px] font-black uppercase rounded shadow-sm">
                                                                            Rework
                                                                        </div>
                                                                        <p className="text-[9px] font-bold text-[#fa8029] mb-0.5">
                                                                            Feedback:
                                                                        </p>
                                                                        <p className="text-[10px] text-[#666] font-medium leading-tight italic truncate">
                                                                            "{subTask.rework_reason}"
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                                    <div className="flex items-center gap-2 text-[#ccc]">
                                                                        <div className="flex items-center gap-1">
                                                                            <Clock size={10} />
                                                                            <span className="text-[9px] font-bold text-[#aaa]">{subTask.estimated_hours}h</span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-1.5">
                                                                        {subTask.assignee_id?.name ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-[9px] font-bold text-[#888]">{subTask.assignee_id.name}</span>
                                                                                <div className="w-5 h-5 rounded-full bg-[#fa8029] text-white flex items-center justify-center text-[9px] font-black border border-white shadow-sm">
                                                                                    {subTask.assignee_id.name[0].toUpperCase()}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[9px] font-bold rounded border border-gray-200">
                                                                                Unassigned
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                                {columnSubTasks.length === 0 && (
                                                    <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-100 rounded-xl bg-white/30">
                                                        <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest text-center">Empty</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            </div>

            <ConfirmModal
                isOpen={showStartConfirm}
                onClose={() => setShowStartConfirm(false)}
                onConfirm={handleStartSubTask}
                title="Initialize Sub-Task?"
                message={`Are you sure you want to begin work on "${selectedSubTask?.title}"?`}
                confirmText="Start Working"
                type="info"
            />

            <SubTaskSubmissionModal
                isOpen={showSubmissionModal}
                onClose={() => setShowSubmissionModal(false)}
                onSubmit={handleSubmissionSubmit}
                subTaskTitle={selectedSubTask?.title || ""}
                isSubmitting={isSubmitting}
            />

            <AssignSubTaskModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onAssign={handleAssignSubmit}
                subTaskTitle={selectedSubTask?.title || ""}
                teamId={selectedSubTask?.team_id?._id}
            />

            {selectedSubTask && (
                <SubTaskDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    subTask={selectedSubTask}
                    onStatusChange={handleStatusChange}
                    onCommentAdded={() => fetchSubTasks(true)}
                    onSubmitRequest={() => setShowSubmissionModal(true)}
                    onReassign={() => {
                        setShowDetailsModal(false);
                        setShowAssignModal(true);
                    }}
                />
            )}



            {showReworkModal && createPortal(
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setShowReworkModal(false)} />
                    <div className="bg-white rounded-[24px] w-full max-w-md shadow-2xl relative z-[3010] animate-in fade-in zoom-in duration-200 overflow-hidden border border-white/20">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                                    <RotateCcw size={20} />
                                </div>
                                <button onClick={() => setShowReworkModal(false)} className="p-1 text-[#aaa] hover:text-[#555] transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <h3 className="text-[18px] font-black text-[#1f2124] mb-2">Rework Feedback</h3>
                            <p className="text-[14px] text-[#666] font-medium leading-relaxed mb-4">
                                Please specify what needs to be improved before this task can be approved.
                            </p>

                            <textarea
                                autoFocus
                                value={reworkReason}
                                onChange={(e) => setReworkReason(e.target.value)}
                                placeholder="Explain the reasons for rejection..."
                                className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500/30 transition-all resize-none font-medium"
                            />

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => setShowReworkModal(false)}
                                    className="flex-1 px-4 py-3 text-[13px] font-bold text-[#555] bg-white border border-[#e5e7eb] rounded-xl hover:bg-[#f9fafb] active:scale-[0.98] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRework}
                                    disabled={isSubmitting || !reworkReason.trim()}
                                    className="flex-1 px-4 py-3 text-[13px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-200 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? "Rejecting..." : "Reject & Rework"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}