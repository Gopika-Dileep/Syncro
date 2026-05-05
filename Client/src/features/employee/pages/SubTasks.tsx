import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
    getAssignedSubTasksApi,
    getTeamSubTasksApi,
    getAllSubTasksApi,
    updateSubTaskApi,
    assignSubTaskApi,
    startSubTaskApi,
    submitSubTaskApi,
    reviewSubTaskApi,
    type SubTask
} from "../api/subTaskApi";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import {
    Clock,
    Search,
    Users,
    RotateCcw,
    X,
    BookOpen
} from "lucide-react";
import type { RootState } from "@/store/store";
import { usePermission } from "@/features/employee/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import ConfirmModal from "@/features/shared/components/ConfirmModal";
import SubTaskSubmissionModal from "../components/SubTaskSubmissionModal";
import AssignSubTaskModal from "../components/AssignSubTaskModal";
import ItemDetailsDrawer from "../components/ItemDetailsDrawer";

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
    const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
    const [selectedSubTask, setSelectedSubTask] = useState<SubTask | null>(null);
    const [showReworkModal, setShowReworkModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reworkReason, setReworkReason] = useState("");

    const { can } = usePermission();

    const isPM = can('task:view:all');
    const canViewTeam = can('task:view:team');
    const hasTeam = !!(user?.team?._id || user?.team_id);

    useEffect(() => {
        fetchSubTasks();
    }, [activeTab, isPM, debouncedSearchTerm]);

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
            }
        } catch {
            toast.error("Failed to load sub-tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (subTaskId: string, newStatus: string, extraData: any = {}) => {
        try {
            let response;
            if (newStatus === 'In Progress') {
                if (extraData.rework_reason) {
                    response = await reviewSubTaskApi(subTaskId, {
                        action: 'reject',
                        rework_reason: extraData.rework_reason
                    });
                } else {
                    response = await startSubTaskApi(subTaskId);
                }
            } else if (newStatus === 'In Review') {
                response = await submitSubTaskApi(subTaskId, {
                    submission_link: extraData.submission_link || '',
                    submission_description: extraData.description || '',
                    branch_name: extraData.branch_name || ''
                });
            } else if (newStatus === 'Done') {
                response = await reviewSubTaskApi(subTaskId, { action: 'approve' });
            } else {
                response = await updateSubTaskApi(subTaskId, { status: newStatus });
            }

            if (response.success) {
                fetchSubTasks(true);
                toast.success(`Status updated to ${newStatus}`);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Status update failed");
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, draggableId } = result;
        if (!destination) return;

        const subTask = subTasks.find(t => t._id === draggableId);
        if (!subTask) return;

        const newStatus = destination.droppableId;
        if (subTask.status === newStatus) return;

        const prefix = 'task';
        if (newStatus === "In Progress" && subTask.status === "To Do") {
            if (!can(`${prefix}:status:work`)) return toast.error("Permission denied");
            setSelectedSubTask(subTask);
            setShowStartConfirm(true);
            return;
        }
        if (newStatus === "In Review" && subTask.status === "In Progress") {
            if (!can(`${prefix}:status:work`)) return toast.error("Permission denied");
            setSelectedSubTask(subTask);
            setShowSubmissionModal(true);
            return;
        }
        if (newStatus === "Done" && subTask.status === "In Review") {
            if (!can(`${prefix}:status:review`)) return toast.error("Permission denied");
            handleStatusChange(draggableId, "Done");
            return;
        }
        if (newStatus === "In Progress" && subTask.status === "In Review") {
            if (!can(`${prefix}:status:review`)) return toast.error("Permission denied");
            setSelectedSubTask(subTask);
            setShowReworkModal(true);
            return;
        }

        handleStatusChange(draggableId, newStatus);
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

    const handleSubmissionSubmit = async (data: any) => {
        if (!selectedSubTask) return;
        setIsSubmitting(true);
        try {
            await handleStatusChange(selectedSubTask._id, "In Review", data);
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
                fetchSubTasks(true);
                toast.success("Assigned successfully");
                setShowAssignModal(false);
            }
        } catch {
            toast.error("Assignment failed");
        }
    };

    const handleRework = async () => {
        if (!selectedSubTask || !reworkReason.trim()) return;
        setIsSubmitting(true);
        try {
            await handleStatusChange(selectedSubTask._id, "In Progress", { rework_reason: reworkReason });
            setShowReworkModal(false);
            setReworkReason("");
        } finally {
            setIsSubmitting(false);
        }
    };

    const teamList = isPM ? Array.from(
        new Map(subTasks.filter(t => t.team_id).map(t => [typeof t.team_id === 'object' ? (t.team_id as any)._id : t.team_id, t.team_id])).values()
    ) : [];

    const filteredSubTasks = useMemo(() => {
        if (selectedTeamFilter === 'all') return subTasks;
        return subTasks.filter(t => {
            const teamId = typeof t.team_id === 'object' ? (t.team_id as any)?._id : t.team_id;
            return teamId === selectedTeamFilter;
        });
    }, [subTasks, selectedTeamFilter]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-4 border-[#eee] border-t-[#fa8029] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col bg-[#fcfcfc] overflow-hidden">
            {/* Header / Filter Bar */}
            <div className="px-8 py-5 bg-white border-b border-[#eee] flex items-center justify-between shadow-sm z-10">
                <div className="flex flex-col">
                    <h1 className="text-[18px] font-black text-[#1f2124] tracking-tight">Kanban Board</h1>
                    <p className="text-[9px] font-bold text-[#aaa] uppercase tracking-widest">Sprint Sub-tasks</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc]" />
                        <input 
                            type="text" 
                            placeholder="Search tasks..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-1.5 bg-gray-50 border border-[#eee] rounded-lg text-[11px] focus:outline-none focus:border-[#fa8029]/30 w-[200px] transition-all"
                        />
                    </div>

                    {hasTeam && !isPM && (
                        <div className="flex bg-[#f5f5f5] p-1 rounded-lg border border-[#eee]">
                            <button onClick={() => setActiveTab('team')} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${activeTab === 'team' ? 'bg-white text-[#fa8029] shadow-sm' : 'text-[#aaa] hover:text-[#555]'}`}>Team</button>
                            <button onClick={() => setActiveTab('assigned')} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${activeTab === 'assigned' ? 'bg-white text-[#fa8029] shadow-sm' : 'text-[#aaa] hover:text-[#555]'}`}>Mine</button>
                        </div>
                    )}

                    {isPM && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-[#eee]">
                            <select 
                                value={selectedTeamFilter}
                                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                                className="bg-transparent text-[10px] font-bold text-[#666] outline-none cursor-pointer"
                            >
                                <option value="all">All Teams</option>
                                {teamList.map((team: any) => (
                                    <option key={team._id} value={team._id}>{team.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Board View */}
            <div className="flex-1 overflow-hidden p-4 custom-scrollbar">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-3 w-full h-full">
                        {COLUMNS.map(col => {
                            const columnItems = filteredSubTasks.filter(t => t.status === col);

                            return (
                                <div key={col} className="flex-1 flex flex-col min-w-0 h-full">
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${col === 'To Do' ? 'bg-[#ccc]' : col === 'In Progress' ? 'bg-blue-500' : col === 'In Review' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                                            <h3 className="text-[10px] font-black text-[#aaa] uppercase tracking-[0.1em]">{col}</h3>
                                        </div>
                                        <span className="text-[9px] font-black text-[#ccc] bg-[#f9fafb] px-1.5 py-0.5 rounded border border-[#eee]">{columnItems.length}</span>
                                    </div>

                                    <Droppable droppableId={col}>
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`flex-1 rounded-xl transition-all duration-200 overflow-y-auto no-scrollbar ${snapshot.isDraggingOver ? 'bg-[#f0f2f5]/50' : ''}`}
                                            >
                                                {columnItems.map((item, index) => (
                                                    <Draggable key={item._id} draggableId={item._id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => { setSelectedSubTask(item); setShowDetailsDrawer(true); }}
                                                                className={`bg-white p-3 rounded-lg border border-[#eee] shadow-sm mb-3 hover:border-[#fa8029]/30 transition-all group relative ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-[#fa8029]/10 rotate-1' : ''}`}
                                                            >
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            {item.subtask_type === 'sub-task' ? (
                                                                                <span className="text-[8px] font-black text-[#fa8029] bg-[#fff5ef] px-1.5 py-0.5 rounded border border-[#fa8029]/10 uppercase tracking-wider shrink-0">Sub-task</span>
                                                                            ) : item.subtask_type === 'bug' ? (
                                                                                <span className="text-[8px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-wider shrink-0">Bug</span>
                                                                            ) : (
                                                                                <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase tracking-wider shrink-0">Task</span>
                                                                            )}
                                                                            {item.rework_reason && item.status !== 'Done' && (
                                                                                <span className="text-[8px] font-black text-white bg-rose-500 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 animate-pulse">Rework</span>
                                                                            )}
                                                                            {item.subtask_type === 'sub-task' && (item as any).parent_issue && (
                                                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider truncate">
                                                                                    Story: {(item as any).parent_issue.title}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-start justify-between gap-3">
                                                                            <h4 className="text-[12px] font-bold text-[#1f2124] leading-tight group-hover:text-[#fa8029] transition-colors">{item.title}</h4>
                                                                            <div className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider shrink-0 ${
                                                                                item.priority === 'High' ? 'bg-rose-50 text-rose-500 border border-rose-100' :
                                                                                item.priority === 'Medium' ? 'bg-amber-50 text-amber-500 border border-amber-100' :
                                                                                'bg-blue-50 text-blue-500 border border-blue-100'
                                                                            }`}>
                                                                                {item.priority}
                                                                            </div>
                                                                        </div>
                                                                        {item.rework_reason && item.status !== 'Done' && (
                                                                            <div className="mt-1.5 p-1.5 bg-rose-50 rounded border border-rose-100/50">
                                                                                <p className="text-[9px] text-rose-600 font-bold leading-tight line-clamp-2 italic">
                                                                                    "{item.rework_reason}"
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-[#fcfcfc]">
                                                                        <div className="flex items-center gap-1 text-[9px] text-[#aaa] font-bold">
                                                                            <Clock size={10} className="text-[#ddd]" />
                                                                            {item.estimated_hours}h
                                                                        </div>
                                                                        
                                                                        {item.assignee_id ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-[8px] font-bold text-[#aaa]">{item.assignee_id.name}</span>
                                                                                <div className="w-4 h-4 rounded-full bg-[#fa8029] text-white flex items-center justify-center text-[8px] font-black border border-white shadow-sm">
                                                                                    {item.assignee_id.name[0].toUpperCase()}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="px-1.5 py-0.5 bg-gray-50 text-gray-400 text-[8px] font-bold rounded border border-gray-100">
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
                message={`Are you sure?`}
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
                <ItemDetailsDrawer
                    isOpen={showDetailsDrawer}
                    onClose={() => setShowDetailsDrawer(false)}
                    item={selectedSubTask}
                    type="subtask"
                    onUpdate={() => fetchSubTasks(true)}
                    onReassign={() => {
                        setShowDetailsDrawer(false);
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
                                Please specify what needs to be improved.
                            </p>

                            <textarea
                                autoFocus
                                value={reworkReason}
                                onChange={(e) => setReworkReason(e.target.value)}
                                placeholder="Explain..."
                                className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] focus:outline-none focus:border-rose-500/30 transition-all resize-none font-medium"
                            />

                            <div className="mt-8 flex gap-3">
                                <button onClick={() => setShowReworkModal(false)} className="flex-1 px-4 py-3 text-[13px] font-bold text-[#555] bg-white border border-[#e5e7eb] rounded-xl transition-all">Cancel</button>
                                <button 
                                    onClick={handleRework}
                                    disabled={isSubmitting || !reworkReason.trim()}
                                    className="flex-1 px-4 py-3 text-[13px] font-bold text-white bg-rose-500 rounded-xl shadow-lg shadow-rose-200 transition-all"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
            `}</style>
        </div>
    );
}
