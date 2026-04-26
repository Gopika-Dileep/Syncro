import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { 
    getAssignedTasksApi, 
    getTeamTasksApi,
    getAllTasksApi,
    updateTaskApi, 
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
    CheckSquare
} from "lucide-react";
import type { RootState } from "@/store/store";
import { usePermission } from "@/features/employee/hooks/usePermission";
import ConfirmModal from "@/features/shared/components/ConfirmModal";
import TaskSubmissionModal from "../components/TaskSubmissionModal";

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
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const user = useSelector((state: RootState) => state.auth.user);
    const { can } = usePermission();
    
    const isPM = can('task:view:all');
    const isLead = can('task:view:team') && !isPM;

    useEffect(() => {
        fetchTasks();
    }, [activeTab, isPM]);

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

    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (isPM && selectedTeamFilter !== 'all') {
            return matchesSearch && t.team_id?._id === selectedTeamFilter;
        }
        return matchesSearch;
    });
    
    // Build unique team list from tasks (for PM filter sidebar)
    const teamList = isPM ? Array.from(
        new Map(tasks.filter(t => t.team_id).map(t => [t.team_id!._id, t.team_id!])).values()
    ) : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#eee] border-t-[#fa8029] rounded-full animate-spin" />
                    <p className="text-[14px] font-medium text-[#aaa]">Loading your workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-60px)] flex flex-col bg-[#fcfcfc] font-sans overflow-hidden -m-4 md:-m-6">
            {/* Header Area */}
            <div className="px-6 py-3 border-b border-[#eee] bg-white shrink-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-50 rounded-xl text-[#fa8029]">
                            <FolderKanban size={20} />
                        </div>
                        <div>
                            <h1 className="text-[18px] font-black text-[#1f2124] tracking-tight leading-none mb-1">
                                {isPM ? 'All Tasks — By Team' : isLead ? 'Team Task Board' : 'My Task Board'}
                            </h1>
                            <p className="text-[12px] text-[#888] font-medium leading-none">
                                {isPM ? 'View all tasks across teams' : isLead ? 'Manage and review your team\'s tasks' : 'Manage and track your assigned tasks'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Lead: two-tab toggle */}
                        {isLead && (
                            <div className="flex bg-[#f5f5f5] rounded-xl p-0.5 border border-[#eee]">
                                <button
                                    onClick={() => { setActiveTab('team'); setSelectedTeamFilter('all'); }}
                                    className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 ${
                                        activeTab === 'team' ? 'bg-white text-[#1f2124] shadow-sm' : 'text-[#999] hover:text-[#555]'
                                    }`}
                                >
                                    <Users size={12} /> My Team's Tasks
                                </button>
                                <button
                                    onClick={() => { setActiveTab('assigned'); }}
                                    className={`px-4 py-1.5 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 ${
                                        activeTab === 'assigned' ? 'bg-white text-[#1f2124] shadow-sm' : 'text-[#999] hover:text-[#555]'
                                    }`}
                                >
                                    <User size={12} /> My Assigned Tasks
                                </button>
                            </div>
                        )}
                        <div className="relative group">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ccc] group-focus-within:text-[#fa8029] transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search tasks..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-1.5 bg-white border border-[#eee] rounded-full text-[12px] font-medium outline-none focus:border-[#fa8029] focus:ring-4 focus:ring-[#fa8029]/5 transition-all w-60 shadow-sm"
                            />
                        </div>
                        <button className="p-2 bg-white border border-[#eee] rounded-full text-[#666] hover:bg-[#fafafa] transition-all shadow-sm">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#f9fafb] p-4 md:p-6">
                {/* PM: Team filter sidebar + board */}
                {isPM && teamList.length > 0 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                        <button
                            onClick={() => setSelectedTeamFilter('all')}
                            className={`px-3 py-1 rounded-full text-[11px] font-black border transition-all ${
                                selectedTeamFilter === 'all' ? 'bg-[#1f2124] text-white border-[#1f2124]' : 'bg-white text-[#555] border-[#eee] hover:border-[#fa8029]'
                            }`}
                        >
                            All Teams
                        </button>
                        {teamList.map(team => (
                            <button
                                key={team._id}
                                onClick={() => setSelectedTeamFilter(team._id)}
                                className={`px-3 py-1 rounded-full text-[11px] font-black border transition-all ${
                                    selectedTeamFilter === team._id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-[#555] border-[#eee] hover:border-indigo-400'
                                }`}
                            >
                                {team.name}
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex gap-5 h-full min-w-max">
                    {COLUMNS.map(column => (
                        <div key={column} className="flex flex-col w-[300px] bg-[#f1f2f4] rounded-xl h-full shadow-sm border border-[#e2e4e9]">
                            {/* Column Header */}
                            <div className="flex items-center justify-between px-3 py-2.5 shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                        column === 'Done' ? 'bg-emerald-500' :
                                        column === 'In Progress' ? 'bg-orange-500' :
                                        column === 'In Review' ? 'bg-purple-500' : 'bg-blue-500'
                                    } shadow-sm`} />
                                    <h3 className="text-[11px] font-bold text-[#555] uppercase tracking-wider">{column}</h3>
                                    <span className="text-[10px] font-bold text-[#777] bg-[#e2e4e9] px-1.5 py-0.5 rounded-full">
                                        {filteredTasks.filter(t => t.status === column).length}
                                    </span>
                                </div>
                                <button className="text-[#888] hover:text-[#444] p-1 rounded-lg hover:bg-white/50 transition-colors">
                                    <MoreHorizontal size={14} />
                                </button>
                            </div>

                            {/* Task List - Scrollable */}
                            <div className="flex-1 overflow-y-auto px-2 pb-3 custom-scrollbar">
                                <div className="flex flex-col gap-2">
                                    {filteredTasks.filter(t => t.status === column).map(task => (
                                        <div 
                                            key={task._id}
                                            className="group bg-white border border-[#e2e4e9] rounded-lg p-3 shadow-sm hover:shadow-md hover:border-[#fa8029]/40 transition-all cursor-pointer relative"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                                                        task.priority === 'High' ? 'text-rose-600 bg-rose-50' :
                                                        task.priority === 'Medium' ? 'text-orange-600 bg-orange-50' : 'text-blue-600 bg-blue-50'
                                                    }`}>
                                                        {task.priority}
                                                    </div>
                                                    <div className="p-1 bg-gray-50 rounded" title={task.task_type}>
                                                        <TypeIcon type={task.task_type} />
                                                    </div>
                                                    {task.status === "In Progress" && task.rework_reason && (
                                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 text-[8px] font-black uppercase tracking-tighter animate-pulse">
                                                            <RotateCcw size={8} />
                                                            Rework
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="relative group/actions">
                                                    <button className="p-1 text-[#ccc] hover:text-[#fa8029] transition-colors rounded hover:bg-gray-50">
                                                        <MoreVertical size={12} />
                                                    </button>
                                                </div>
                                            </div>

                                            <h4 className="text-[12.5px] font-bold text-[#1f2124] mb-1 leading-snug group-hover:text-[#fa8029] transition-colors">
                                                {task.title}
                                            </h4>

                                            <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                                {/* Assigner/Lead - Always show if available */}
                                                {(task.assigned_by?.name || task.created_by?.name) && (
                                                    <p className="text-[9px] font-bold text-blue-500/70">
                                                        {(task.assigned_by || task.created_by)?.designation || 'Assigner'}: {task.assigned_by?.name || task.created_by?.name}
                                                    </p>
                                                )}
                                                
                                                {/* Developer - Hide on 'My Tasks' tab since it's redundant */}
                                                {activeTab !== 'assigned' && task.assign_to?.name && (
                                                    <>
                                                        <span className="w-0.5 h-0.5 rounded-full bg-[#ccc]" />
                                                        <p className="text-[9px] font-bold text-orange-500/70">
                                                            {task.assign_to.designation || 'Dev'}: {task.assign_to.name}
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {task.status === "In Progress" && task.rework_reason && (
                                                <div className="mb-3 p-2 bg-rose-50 border border-rose-100 rounded-lg">
                                                    <p className="text-[9px] font-black text-rose-600 uppercase mb-0.5 flex items-center gap-1">
                                                        <AlertCircle size={10} />
                                                        Rework Reason:
                                                    </p>
                                                    <p className="text-[11px] text-[#555] font-medium leading-tight italic">
                                                        "{task.rework_reason}"
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Contextual Buttons */}
                                            <div className="mt-1 mb-3">
                                                {/* Dev / Lead-as-dev: Start button */}
                                                {task.status === "To Do" && (can('task:start') || can('task:submit')) && (
                                                    <button 
                                                        onClick={() => { setSelectedTask(task); setShowStartConfirm(true); }}
                                                        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-orange-50 text-[#fa8029] text-[10px] font-black uppercase tracking-widest rounded-lg border border-orange-100 hover:bg-[#fa8029] hover:text-white transition-all shadow-sm active:scale-95"
                                                    >
                                                        <Play size={10} fill="currentColor" />
                                                        Start Task
                                                    </button>
                                                )}
                                                {/* Dev / Lead-as-dev: Submit button */}
                                                {task.status === "In Progress" && (can('task:submit') || can('task:start')) && (
                                                    <button 
                                                        onClick={() => { setSelectedTask(task); setShowSubmissionModal(true); }}
                                                        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95"
                                                    >
                                                        <Send size={10} />
                                                        Submit Work
                                                    </button>
                                                )}
                                                {/* Lead / PM: Review buttons */}
                                                {task.status === "In Review" && (
                                                    <div className="flex flex-col gap-2">
                                                        {can('task:review') ? (
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => handleStatusChange(task._id, "Done")}
                                                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-95"
                                                                >
                                                                    <CheckCircle2 size={10} />
                                                                    Approve
                                                                </button>
                                                                <button 
                                                                    onClick={() => {
                                                                        const reason = window.prompt("Enter reason for rework:");
                                                                        if (reason) handleStatusChange(task._id, "In Progress", { rework_reason: reason });
                                                                    }}
                                                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                                                                >
                                                                    <RotateCcw size={10} />
                                                                    Redo
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-100 opacity-80">
                                                                <Clock size={10} />
                                                                Pending Review
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {task.status === "Done" && (
                                                    <div className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100 opacity-80">
                                                        <CheckCircle2 size={10} />
                                                        Completed
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f8f8f8]">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <div className="flex items-center gap-1 text-[#999]">
                                                        <Clock size={10} />
                                                        <span className="text-[9px] font-bold">{task.estimated_hours}h</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[#999]">
                                                        <Calendar size={10} />
                                                        <span className="text-[9px] font-bold">
                                                            {new Date(task.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {task.team_id && isPM && (
                                                        <div className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter bg-indigo-50 text-indigo-600 border border-indigo-100 mr-1" title="Team">
                                                            {task.team_id.name}
                                                        </div>
                                                    )}
                                                    {task.created_by?.name && (
                                                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[9px] font-black border border-white" title={`Creator: ${task.created_by.name}`}>
                                                            {task.created_by.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    {task.assign_to?.name ? (
                                                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-[#fa8029] text-[9px] font-black border border-white -ml-1.5" title={`Dev: ${task.assign_to.name}`}>
                                                            {task.assign_to.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-[9px] font-black border border-white -ml-1.5" title="Unassigned">
                                                            ?
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Empty State for Column */}
                                    {filteredTasks.filter(t => t.status === column).length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#d1d5db] rounded-lg opacity-50 bg-white/30">
                                            <AlertCircle size={16} className="text-[#9ca3af] mb-1" />
                                            <p className="text-[9px] font-bold text-[#9ca3af] uppercase">Empty</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal 
                isOpen={showStartConfirm}
                onClose={() => setShowStartConfirm(false)}
                onConfirm={handleStartTask}
                title="Start Task?"
                message={`Are you sure you want to start "${selectedTask?.title}"? This will move the task to In Progress.`}
                confirmText="Start Now"
                type="info"
            />

            <TaskSubmissionModal 
                isOpen={showSubmissionModal}
                onClose={() => setShowSubmissionModal(false)}
                onSubmit={handleSubmissionSubmit}
                taskTitle={selectedTask?.title || ""}
                isSubmitting={isSubmitting}
            />

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </div>
    );
} 