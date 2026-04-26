import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
    getAssignedTasksApi,
    getTeamTasksApi,
    getAllTasksApi,
    updateTaskApi,
    assignTaskApi,
    type Task
} from "../api/taskApi";
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Calendar,
    ArrowRight,
    Search,
    Filter,
    FolderKanban,
    MoreHorizontal,
    Play,
    Send,
    RotateCcw,
    Users,
    User,
    Bug,
    BookOpen,
    CheckSquare,
    FileText,
    UserPlus
} from "lucide-react";
import type { RootState } from "@/store/store";
import { usePermission } from "@/features/employee/hooks/usePermission";
import ConfirmModal from "@/features/shared/components/ConfirmModal";
import TaskSubmissionModal from "../components/TaskSubmissionModal";
import AssignTaskModal from "../components/AssignTaskModal";
import TaskDetailsModal from "../components/TaskDetailsModal";

const TypeIcon = ({ type, size = 12 }: { type: string; size?: number }) => {
    switch (type?.toLowerCase()) {
        case 'bug': return <Bug size={size} className="text-rose-500" />;
        case 'story': return <BookOpen size={size} className="text-emerald-500" />;
        default: return <CheckSquare size={size} className="text-blue-500" />;
    }
};

const COLUMNS = ["To Do", "In Progress", "In Review", "Done"];

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'team' | 'assigned'>('team');
    const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');

    // Modal states
    const [showStartConfirm, setShowStartConfirm] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const user = useSelector((state: RootState) => state.auth.user);
    const { can } = usePermission();

    const isPM = can('task:view:all');
    const isLead = can('task:view:team') && !isPM;

    useEffect(() => {
        fetchTasks();
    }, [activeTab, isPM]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            let response;
            if (isPM) {
                response = await getAllTasksApi();
            } else if (isLead && activeTab === 'team') {
                response = await getTeamTasksApi();
            } else {
                response = await getAssignedTasksApi();
            }
            if (response.success) {
                setTasks(response.data);
            }
        } catch {
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId: string, newStatus: string, extraData: Record<string, unknown> = {}) => {
        try {
            const response = await updateTaskApi(taskId, { status: newStatus, ...extraData });
            if (response.success) {
                setTasks(prev => prev.map(t => t._id === taskId ? { ...t, ...response.data, status: newStatus } : t));
                toast.success(`Task moved to ${newStatus}`);
            }
        } catch {
            toast.error("Failed to update task status");
        }
    };

    const handleStartTask = async () => {
        if (!selectedTask) return;
        setIsSubmitting(true);
        try {
            await handleStatusChange(selectedTask._id, "In Progress");
            setShowStartConfirm(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmissionSubmit = async (data: { description: string; branch_name: string; submission_link: string }) => {
        if (!selectedTask) return;
        setIsSubmitting(true);
        try {
            await handleStatusChange(selectedTask._id, "In Review", {
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
        if (!selectedTask) return;
        try {
            const response = await assignTaskApi(selectedTask._id, memberId);
            if (response.success) {
                setTasks(prev => prev.map(t => t._id === selectedTask._id ? { ...t, assign_to: response.data.assign_to } : t));
                toast.success("Task assigned successfully");
            }
        } catch {
            toast.error("Failed to assign task");
            throw new Error("Failed to assign");
        }
    };

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (isPM && selectedTeamFilter !== 'all') {
            return matchesSearch && t.team_id?._id === selectedTeamFilter;
        }
        return matchesSearch;
    });

    const teamList = isPM ? Array.from(
        new Map(tasks.filter(t => t.team_id).map(t => [t.team_id!._id, t.team_id!])).values()
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
            {/* Header consistent with DataTable */}
            <div className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h1 className="text-[15px] font-bold text-[#1f2124]">
                            {isPM ? 'Workspaces — All Teams' : isLead ? 'Team Kanban Board' : 'Personal Kanban Board'}
                        </h1>
                        <p className="text-[11px] text-[#aaa] mt-0.5">
                            {isPM ? 'Cross-functional task visibility' : isLead ? 'Manage sprint velocity and team output' : 'Track and execute your daily tasks'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {isLead && (
                            <div className="flex bg-white border border-[#ebebeb] rounded-full p-0.5 shadow-sm">
                                <button
                                    onClick={() => { setActiveTab('team'); setSelectedTeamFilter('all'); }}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${activeTab === 'team' ? 'bg-[#1f2124] text-white' : 'text-[#999] hover:bg-gray-50'}`}
                                >
                                    <Users size={11} /> Team
                                </button>
                                {can('task:view:assigned') && (
                                    <button
                                        onClick={() => { setActiveTab('assigned'); }}
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
                                placeholder="Filter tasks..."
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

            {/* Kanban Board Container - Removed overflow-y-hidden to allow page scroll */}
            <div className="flex-1 overflow-x-auto pt-0 pb-10">
                <div className="flex gap-3 min-w-max h-fit">
                    {COLUMNS.map(column => {
                        const style = getColumnStyle(column);
                        const columnTasks = filteredTasks.filter(t => t.status === column);
                        return (
                            <div key={column} className="flex flex-col w-[250px] h-fit">
                                {/* Column Header - Sticky so it stays visible while scrolling page downwards */}
                                <div className={`flex items-center justify-between px-3.5 py-2 rounded-t-xl ${style.header} shrink-0 sticky top-0 z-10 shadow-sm mb-2`}>
                                    <h3 className="text-[12px] font-bold">{column}</h3>
                                    <span className="text-[10px] font-bold bg-white/50 px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {columnTasks.length}
                                    </span>
                                </div>

                                {/* Task List - Removed internal overflow to allow page-level vertical scroll */}
                                <div className="flex flex-col gap-2">
                                    {columnTasks.map(task => (
                                        <div
                                            key={task._id}
                                            className={`bg-white rounded-xl p-3 shadow-sm border border-transparent hover:border-[#fa8029]/20 transition-all cursor-pointer relative ${task.rework_reason && task.status === "In Progress" ? 'ring-1 ring-rose-100' : ''}`}
                                        >
                                            {/* Top Row: Type & Priority */}
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="p-0.5 bg-gray-50 rounded">
                                                        <TypeIcon type={task.task_type} size={12} />
                                                    </div>
                                                    <div className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${task.priority === 'High' ? 'text-rose-600 bg-rose-50' :
                                                            task.priority === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50'
                                                        }`}>
                                                        {task.priority}
                                                    </div>
                                                </div>
                                                    <div className="relative">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === task._id ? null : task._id); }}
                                                            className="text-[#ddd] hover:text-[#555] p-0.5 transition-colors"
                                                        >
                                                            <MoreVertical size={12} />
                                                        </button>
                                                        
                                                        {activeDropdown === task._id && (
                                                            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                                                                <button 
                                                                    onClick={(e) => { 
                                                                        e.stopPropagation(); 
                                                                        setSelectedTask(task); 
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
                                                                            setSelectedTask(task); 
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

                                            {/* Title */}
                                            <h4 className="text-[12px] font-bold text-[#1f2124] mb-1 leading-snug">
                                                {task.title}
                                            </h4>

                                            {/* Description Snippet */}
                                            <p className="text-[10px] text-[#999] line-clamp-1 mb-2">
                                                {task.description || "No additional details."}
                                            </p>

                                            {/* Rework / Feedback Section */}
                                            {task.status === "In Progress" && task.rework_reason && (
                                                <div className="mb-2 p-2 bg-orange-50/50 border border-orange-100 rounded-lg relative">
                                                    <div className="absolute -top-1.5 right-1.5 px-1.5 py-0.5 bg-rose-500 text-white text-[7px] font-black uppercase rounded shadow-sm">
                                                        Rework
                                                    </div>
                                                    <p className="text-[9px] font-bold text-[#fa8029] mb-0.5">
                                                        Feedback:
                                                    </p>
                                                    <p className="text-[10px] text-[#666] font-medium leading-tight italic truncate">
                                                        "{task.rework_reason}"
                                                    </p>
                                                </div>
                                            )}

                                            {/* Bottom Row: Meta & Assignee */}
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                    <div className="flex items-center gap-2 text-[#ccc]">
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={10} />
                                                            <span className="text-[9px] font-bold text-[#aaa]">{task.estimated_hours}h</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-1.5">
                                                        {task.assign_to?.name ? (
                                                            <div className="w-5 h-5 rounded-full bg-[#fa8029] text-white flex items-center justify-center text-[9px] font-black border border-white shadow-sm">
                                                                {task.assign_to.name[0].toUpperCase()}
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setShowAssignModal(true); }}
                                                                className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[9px] font-bold rounded border border-gray-200 hover:bg-white hover:text-[#fa8029] transition-all"
                                                            >
                                                                Assign
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                            {/* Compact Action Overlay */}
                                            <div className="mt-2.5 flex flex-col gap-1.5">
                                                {task.status === "To Do" && (can('task:start') || can('task:submit')) && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setShowStartConfirm(true); }}
                                                        className="w-full py-1.5 bg-orange-50 text-[#fa8029] text-[9px] font-bold uppercase tracking-wide rounded-lg border border-orange-100 hover:bg-[#fa8029] hover:text-white transition-all active:scale-[0.98]"
                                                    >
                                                        Start
                                                    </button>
                                                )}
                                                {task.status === "In Progress" && (can('task:submit') || can('task:start')) && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedTask(task); setShowSubmissionModal(true); }}
                                                        className="w-full py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wide rounded-lg border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all active:scale-[0.98]"
                                                    >
                                                        Submit
                                                    </button>
                                                )}
                                                {task.status === "In Review" && can('task:review') && (
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleStatusChange(task._id, "Done"); }}
                                                            className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wide rounded-lg border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={(e) => { 
                                                                    e.stopPropagation();
                                                                    const reason = window.prompt("Enter reason for rework:");
                                                                    if (reason) handleStatusChange(task._id, "In Progress", { rework_reason: reason });
                                                                }}
                                                            className="flex-1 py-1.5 bg-rose-50 text-rose-600 text-[9px] font-bold uppercase tracking-wide rounded-lg border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                                                        >
                                                            Redo
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty State */}
                                    {columnTasks.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-100 rounded-xl bg-white/30">
                                            <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest text-center">Empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <ConfirmModal
                isOpen={showStartConfirm}
                onClose={() => setShowStartConfirm(false)}
                onConfirm={handleStartTask}
                title="Initialize Task?"
                message={`Are you sure you want to begin work on "${selectedTask?.title}"?`}
                confirmText="Start Working"
                type="info"
            />

            <TaskSubmissionModal
                isOpen={showSubmissionModal}
                onClose={() => setShowSubmissionModal(false)}
                onSubmit={handleSubmissionSubmit}
                taskTitle={selectedTask?.title || ""}
                isSubmitting={isSubmitting}
            />

            <AssignTaskModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onAssign={handleAssignSubmit}
                taskTitle={selectedTask?.title || ""}
                teamId={selectedTask?.team_id?._id}
            />

            {selectedTask && (
                <TaskDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => setShowDetailsModal(false)}
                    task={selectedTask}
                    onStatusChange={handleStatusChange}
                    onReassign={(id) => {
                        setShowDetailsModal(false);
                        setShowAssignModal(true);
                    }}
                />
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