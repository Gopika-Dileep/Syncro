import { useState } from "react";
import { 
    X, 
    Clock, 
    Calendar, 
    User, 
    CheckCircle2, 
    RotateCcw, 
    ExternalLink, 
    MessageSquare,
    MoreHorizontal,
    UserPlus,
    FileText,
    History
} from "lucide-react";
import { type SubTask, addSubTaskCommentApi } from "../api/subTaskApi";
import { toast } from "sonner";
import { usePermission } from "../hooks/usePermission";

interface SubTaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    subTask: SubTask;
    onStatusChange: (subTaskId: string, newStatus: string, extraData?: Record<string, any>) => Promise<void>;
    onReassign: (subTaskId: string) => void;
    onCommentAdded?: () => void;
    onSubmitRequest?: () => void;
}

export default function SubTaskDetailsModal({ isOpen, onClose, subTask, onStatusChange, onReassign, onCommentAdded, onSubmitRequest }: SubTaskDetailsModalProps) {
    const { can } = usePermission();
    const [comment, setComment] = useState("");
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [isReworkModalOpen, setIsReworkModalOpen] = useState(false);
    const [reworkReason, setReworkReason] = useState("");

    if (!isOpen || !subTask) return null;

    const isTodo = subTask.status === "To Do";
    const isInProgress = subTask.status === "In Progress";
    const isReview = subTask.status === "In Review";
    const isDone = subTask.status === "Done";

    // Determine module prefix for permission check
    const type = subTask.subtask_type?.toLowerCase() || 'task';
    const prefix = type === 'sub-task' ? 'task' : `issue:${type}`;

    const canWork = can(`${prefix}:status:work`);
    const canReview = can(`${prefix}:status:review`);
    const canAssign = can(`${prefix}:assign`);

    const handleAddComment = async () => {
        if (!comment.trim()) return;
        setIsAddingComment(true);
        try {
            const response = await addSubTaskCommentApi(subTask._id, comment);
            if (response.success) {
                setComment("");
                toast.success("Comment added");
                onCommentAdded?.();
            }
        } catch {
            toast.error("Failed to add comment");
        } finally {
            setIsAddingComment(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'low': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'To Do': return 'bg-gray-100 text-gray-600';
            case 'In Progress': return 'bg-amber-100 text-amber-700';
            case 'In Review': return 'bg-blue-100 text-blue-700';
            case 'Done': return 'bg-emerald-100 text-emerald-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm font-sans">
            <div className="bg-[#fcfcfc] rounded-[24px] w-full max-w-[900px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${getStatusColor(subTask.status)} bg-opacity-50`}>
                            <FileText size={18} />
                        </div>
                        <h2 className="text-[17px] font-bold text-[#1f2124]">{subTask.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <MoreHorizontal size={18} />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Column: Main Content */}
                        <div className="flex-1 space-y-6">
                            {/* Description */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <h3 className="text-[14px] font-bold text-[#1f2124] mb-3">Description</h3>
                                <p className="text-[13px] text-[#666] leading-relaxed">
                                    {subTask.description || "No description provided for this sub-task."}
                                </p>
                            </div>

                            {/* Work Submission - Only if submitted or in review/done */}
                            {(subTask.submission_link || subTask.branch_name || isReview || isDone) && (
                                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <History size={16} className="text-[#fa8029]" />
                                        <h3 className="text-[14px] font-bold text-[#1f2124]">Work Submission</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Branch</p>
                                            <code className="text-[11px] bg-gray-50 px-2 py-1 rounded border border-gray-100 text-[#fa8029] font-mono">
                                                {subTask.branch_name || "N/A"}
                                            </code>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Repository</p>
                                            {subTask.submission_link ? (
                                                <a 
                                                    href={subTask.submission_link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[12px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                                                >
                                                    View Repository <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <span className="text-[12px] text-gray-400">No link provided</span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                                        <p className="text-[12px] text-[#555] leading-snug">
                                            {subTask.submission_description || "No submission notes provided."}
                                        </p>
                                    </div>

                                    <p className="text-[10px] text-gray-400 mt-4 italic">
                                        Submitted {new Date(subTask.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                            {/* Actions Section */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <h3 className="text-[14px] font-bold text-[#1f2124] mb-4">Actions</h3>
                                <div className="flex flex-wrap gap-3">
                                    {isTodo && canWork && (
                                        <button 
                                            onClick={() => onStatusChange(subTask._id, "In Progress")}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#fa8029] text-white text-[12px] font-bold rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-200"
                                        >
                                            <RotateCcw size={16} className="rotate-90" /> Start Task
                                        </button>
                                    )}

                                    {isInProgress && canWork && (
                                        <button 
                                            onClick={() => {
                                                onClose();
                                                onSubmitRequest?.();
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-[12px] font-bold rounded-xl hover:bg-blue-600 transition-all shadow-md shadow-blue-200"
                                        >
                                            <ExternalLink size={16} /> Submit for Review
                                        </button>
                                    )}

                                    {isReview && canReview && (
                                        <>
                                            <button 
                                                onClick={async () => {
                                                    await onStatusChange(subTask._id, "Done");
                                                    onClose();
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-[12px] font-bold rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200"
                                            >
                                                <CheckCircle2 size={16} /> Approve & Complete
                                            </button>
                                            <button 
                                                onClick={() => setIsReworkModalOpen(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white text-[12px] font-bold rounded-xl hover:bg-rose-600 transition-all shadow-md shadow-rose-200"
                                            >
                                                <RotateCcw size={16} /> Reject & Redo
                                            </button>
                                        </>
                                    )}

                                    {isDone && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 text-[12px] font-bold rounded-xl border border-emerald-100">
                                            <CheckCircle2 size={16} /> Completed
                                        </div>
                                    )}

                                    {!canWork && !canReview && !isDone && (
                                        <p className="text-[12px] text-gray-400 italic">No actions available for current permissions.</p>
                                    )}
                                </div>
                            </div>

                            {/* Comments Section */}
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageSquare size={16} className="text-blue-500" />
                                    <h3 className="text-[14px] font-bold text-[#1f2124]">Comments & Feedback</h3>
                                </div>

                                <div className="space-y-4 mb-6">
                                    {/* System Comment: Rework Reason */}
                                    {subTask.rework_reason && (
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-[#fa8029] flex-shrink-0">
                                                {subTask.assigned_by?.name ? subTask.assigned_by.name[0].toUpperCase() : 'L'}
                                            </div>
                                            <div className="flex-1 bg-orange-50/30 rounded-2xl p-3 border-l-2 border-[#fa8029]">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[11px] font-bold text-[#1f2124]">
                                                        {subTask.assigned_by?.name || 'Lead/Reviewer'}
                                                    </span>
                                                    <span className="text-[9px] text-gray-400">Feedback</span>
                                                </div>
                                                <p className="text-[12px] text-[#555] italic">"{subTask.rework_reason}"</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Placeholder for future real comments data */}
                                    {!(subTask as any).comments?.length && !subTask.rework_reason && (
                                        <div className="py-8 text-center">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-300">
                                                <MessageSquare size={20} />
                                            </div>
                                            <p className="text-[11px] text-gray-400">No comments or feedback yet.</p>
                                        </div>
                                    )}
                                    
                                    {(subTask as any).comments?.map((c: any, index: number) => (
                                        <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                            <div className="w-8 h-8 rounded-full bg-[#fa8029] flex items-center justify-center text-[10px] font-black text-white uppercase flex-shrink-0 shadow-sm">
                                                {c.user?.name ? (
                                                    c.user.name.split(' ').length > 1 
                                                    ? c.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                                                    : c.user.name.substring(0, 2).toUpperCase()
                                                ) : 'U'}
                                            </div>
                                            <div className="flex-1 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm relative group">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[11px] font-bold text-[#1f2124]">{c.user?.name || 'User'}</span>
                                                    <span className="text-[9px] text-gray-400">
                                                        {new Date(c.created_at || c.time).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] text-[#555] leading-relaxed">{c.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 pt-2">
                                    <textarea 
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Add a comment or provide feedback..."
                                        className="w-full h-24 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[12px] focus:outline-none focus:ring-2 focus:ring-[#fa8029]/10 focus:border-[#fa8029]/30 transition-all resize-none font-medium"
                                    />
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={handleAddComment}
                                            disabled={!comment.trim() || isAddingComment}
                                            className="px-6 py-2.5 bg-[#fa8029] text-white text-[11px] font-bold rounded-xl hover:bg-orange-600 transition-all uppercase tracking-wider disabled:bg-gray-200 shadow-lg shadow-orange-900/10 active:scale-95"
                                        >
                                            {isAddingComment ? 'Posting...' : 'Add Comment'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details Sidebar */}
                        <div className="w-full lg:w-[280px] space-y-4">
                            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                                <h3 className="text-[14px] font-bold text-[#1f2124] mb-4">Details</h3>
                                
                                <div className="space-y-5">
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</p>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(subTask.status)}`}>
                                            {subTask.status.toLowerCase()}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Priority</p>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getPriorityColor(subTask.priority)}`}>
                                            {subTask.priority.toLowerCase()}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Assignee</p>
                                        {subTask.assignee_id ? (
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-[#fa8029] text-white flex items-center justify-center text-[11px] font-black border-2 border-white shadow-sm">
                                                    {subTask.assignee_id.name[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[12px] font-bold text-[#1f2124] truncate">{subTask.assignee_id.name}</p>
                                                    <p className="text-[10px] text-gray-400 truncate">{subTask.assignee_id.designation || "Team Member"}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[12px] text-gray-400 italic">Unassigned</p>
                                        )}
                                    </div>

                                    <div className="pt-2 border-t border-gray-50 flex items-center gap-3">
                                        <Clock size={16} className="text-gray-300" />
                                        <div>
                                            <p className="text-[11px] font-bold text-[#1f2124]">Estimate: {subTask.estimated_hours}h</p>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center gap-3">
                                        <Calendar size={16} className="text-gray-300" />
                                        <div>
                                            <p className="text-[11px] font-bold text-[#1f2124]">Created:</p>
                                            <p className="text-[10px] text-gray-400">
                                                {new Date(subTask.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reassign Button */}
                            {canAssign && (
                                <button 
                                    onClick={() => onReassign(subTask._id)}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-100 text-[#555] text-[12px] font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
                                >
                                    <UserPlus size={16} /> Reassign
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Rework Modal Overlay */}
            {isReworkModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-rose-50/30">
                            <h4 className="text-[15px] font-bold text-rose-600 flex items-center gap-2">
                                <RotateCcw size={16} /> Rework Feedback
                            </h4>
                            <button onClick={() => setIsReworkModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-[12px] text-gray-500 leading-relaxed">
                                Please specify what needs to be fixed or improved before this task can be approved.
                            </p>
                            <textarea 
                                autoFocus
                                value={reworkReason}
                                onChange={(e) => setReworkReason(e.target.value)}
                                placeholder="Explain the reasons for rejection..."
                                className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500/30 transition-all resize-none font-medium"
                            />
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setIsReworkModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-600 text-[12px] font-bold rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        if (reworkReason.trim()) {
                                            onStatusChange(subTask._id, "To Do", { rework_reason: reworkReason });
                                            setIsReworkModalOpen(false);
                                            setReworkReason("");
                                        }
                                    }}
                                    disabled={!reworkReason.trim()}
                                    className="flex-1 px-4 py-2.5 bg-rose-500 text-white text-[12px] font-bold rounded-xl hover:bg-rose-600 transition-all disabled:opacity-50 shadow-lg shadow-rose-200"
                                >
                                    Reject & Redo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
