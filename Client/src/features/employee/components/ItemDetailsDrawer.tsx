import { useState, useEffect, useRef, useCallback } from "react";
import { X, Flag, Hash, Users as UsersIcon, User, Send, Paperclip, Clock, MessageSquare, History, CheckCircle, ExternalLink, BookOpen, GitBranch, Check, RotateCcw, Play } from "lucide-react";
import { createPortal } from "react-dom";
import { type Issue, getIssueByIdApi, addCommentToIssueApi, addIssueAttachmentApi, updateIssueApi } from "../api/issueApi";
import { type SubTask, getSubTaskByIdApi, addCommentToSubTaskApi, addAttachmentToSubTaskApi, getSubTasksByIssueApi, reviewSubTaskApi, updateSubTaskApi } from "../api/subTaskApi";
import { uploadFileApi } from "../api/fileApi";
import { getTeamDirectoryApi, type TeamMember } from "../api/teamApi";
import { toast } from "sonner";
import { usePermission } from "../hooks/usePermission";
import MentionTextArea from "@/features/shared/components/MentionTextArea";
import MentionText from "@/features/shared/components/MentionText";

interface ItemDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    item: Issue | SubTask | null;
    type: 'issue' | 'subtask';
    onUpdate?: () => void;
    onReassign?: () => void;
}

export default function ItemDetailsDrawer({ isOpen, onClose, item, type, onUpdate, onReassign }: ItemDetailsDrawerProps) {
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');
    const [isUploading, setIsUploading] = useState(false);
    const [pendingAttachments, setPendingAttachments] = useState<{ file_url: string; file_name: string }[]>([]);
    const [uploadMode, setUploadMode] = useState<'item' | 'comment'>('item');
    const [parentIssue, setParentIssue] = useState<Issue | null>(null);
    const [childSubTasks, setChildSubTasks] = useState<SubTask[]>([]);
    const [activityFilter, setActivityFilter] = useState<string>('all');
    const [fullItem, setFullItem] = useState<Issue | SubTask | null>(item);
    const [internalType, setInternalType] = useState<'issue' | 'subtask'>(type);
    const [isReviewing, setIsReviewing] = useState(false);
    const [reworkReason, setReworkReason] = useState("");
    const [showReworkInput, setShowReworkInput] = useState(false);
    const [blockReason, setBlockReason] = useState("");
    const [showBlockInput, setShowBlockInput] = useState(false);
    const [employees, setEmployees] = useState<TeamMember[]>([]);
    const [mentions, setMentions] = useState<string[]>([]);
    const { can, user: currentUser } = usePermission();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFullDetails = useCallback(async (id?: string, targetType?: 'issue' | 'subtask') => {
        const activeId = id || fullItem?._id;
        const activeType = targetType || internalType;
        if (!activeId) return;
        try {
            const res = activeType === 'issue'
                ? await getIssueByIdApi(activeId)
                : await getSubTaskByIdApi(activeId);

            if (res.success) {
                setFullItem(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch full details", err);
        }
    }, [fullItem?._id, internalType]);

    const fetchParentInfo = useCallback(async (id: string) => {
        try {
            const res = await getIssueByIdApi(id);
            if (res.success) setParentIssue(res.data);
        } catch (err) {
            console.error("Failed to fetch parent context", err);
        }
    }, []);

    const fetchChildSubTasks = useCallback(async (issueId: string) => {
        try {
            const res = await getSubTasksByIssueApi(issueId);
            if (res.success) setChildSubTasks(res.data);
        } catch (err) {
            console.error("Failed to fetch child sub-tasks", err);
        }
    }, []);

    const fetchEmployees = useCallback(async () => {
        try {
            const res = await getTeamDirectoryApi();
            if (res.success) {
                const allMembers = res.data.flatMap(team => team.members);
                const uniqueMembers = Array.from(new Map(allMembers.map(m => [m._id, m])).values());
                setEmployees(uniqueMembers);
            }
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    }, []);

    useEffect(() => {
        if (isOpen && item?._id) {
            setFullItem(item);
            setInternalType(type);
            fetchFullDetails();
            if (type === 'subtask') {
                const subtaskItem = item as SubTask;
                if (subtaskItem.issue_id) fetchParentInfo(subtaskItem.issue_id);
            } else if (type === 'issue') {
                const issueItem = item as Issue;
                if (issueItem.type === 'story') fetchChildSubTasks(item._id);
            }
            fetchEmployees();
        } else if (!isOpen) {
            setParentIssue(null);
            setChildSubTasks([]);
            setFullItem(null);
        }
    }, [isOpen, item, item?._id, item?.status, type, fetchFullDetails, fetchParentInfo, fetchChildSubTasks, fetchEmployees]);

    if (!fullItem) return null;

    const handleAddComment = async () => {
        if (!comment.trim() && pendingAttachments.length === 0) return;
        setIsSubmitting(true);
        try {
            const commentData = {
                text: comment,
                attachments: pendingAttachments,
                mentions: mentions
            };

            if (internalType === 'issue') {
                await addCommentToIssueApi(fullItem._id, commentData);
            } else {
                await addCommentToSubTaskApi(fullItem._id, commentData);
            }
            setComment("");
            setPendingAttachments([]);
            toast.success("Comment added");
            onUpdate?.();
        } catch {
            toast.error("Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            console.log(`Starting upload for: ${file.name} (${file.size} bytes)`);
            let uploadRes;
            try {
                uploadRes = await uploadFileApi(file);
            } catch (err: unknown) {
                const error = err as { message?: string };
                console.error("Upload network/server error:", error);
                toast.error(`Upload failed: ${error.message || 'Server error'}`);
                return;
            }

            if (uploadRes.success) {
                const attachment = {
                    file_url: uploadRes.data.file_url,
                    file_name: uploadRes.data.file_name
                };

                if (uploadMode === 'item' && fullItem?._id) {
                    try {
                        if (internalType === 'issue') {
                            await addIssueAttachmentApi(fullItem._id, [attachment]);
                        } else {
                            await addAttachmentToSubTaskApi(fullItem._id, [attachment]);
                        }
                        toast.success("File attached successfully");
                        onUpdate?.();
                    } catch (err) {
                        console.error("Attachment association error:", err);
                        toast.error("Failed to link file to task");
                    }
                } else {
                    setPendingAttachments(prev => [...prev, attachment]);
                    toast.success("File ready for comment");
                }
            } else {
                console.warn("Upload failed response:", uploadRes);
                toast.error(uploadRes.message || "Upload failed");
            }
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (uploadMode === 'comment') {
                const textarea = document.querySelector('textarea[placeholder*="comment"]') as HTMLTextAreaElement;
                textarea?.focus();
            }
        }
    };

    const triggerFileUpload = (mode: 'item' | 'comment') => {
        setUploadMode(mode);
        fileInputRef.current?.click();
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'ready': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'to do': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'blocked': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'done': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getPriorityStyle = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'low': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
            case 'medium': return 'text-amber-500 bg-amber-50 border-amber-100';
            case 'high': return 'text-rose-500 bg-rose-50 border-rose-100';
            case 'critical': return 'text-rose-600 bg-rose-100 border-rose-200';
            default: return 'text-slate-500 bg-slate-50 border-slate-100';
        }
    };

    const handleReview = async (action: 'approve' | 'reject') => {
        if (action === 'reject' && !reworkReason.trim()) {
            setShowReworkInput(true);
            return;
        }

        setIsReviewing(true);
        try {
            const res = await reviewSubTaskApi(fullItem._id, {
                action,
                rework_reason: action === 'reject' ? reworkReason : undefined
            });
            if (res.success) {
                toast.success(action === 'approve' ? "Task approved and completed!" : "Task sent back for rework");

                if (action === 'reject') {
                    await addCommentToSubTaskApi(fullItem._id, {
                        text: `🔄 REWORK REQUIRED: ${reworkReason}`
                    });
                }

                setReworkReason("");
                setShowReworkInput(false);
                onUpdate?.();
                onClose?.();
            }
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } }; message?: string };
            const errorMsg = error.response?.data?.message || error.message || "Failed to complete review";
            toast.error(errorMsg);
        } finally {
            setIsReviewing(false);
        }
    };

    const handleBlock = async (action: 'block' | 'unblock') => {
        if (action === 'block' && !blockReason.trim()) {
            setShowBlockInput(true);
            return;
        }

        setIsSubmitting(true);
        try {
            const data = action === 'block' 
                ? { status: 'Blocked', blocked_reason: blockReason }
                : { status: 'In Progress' };

            const res = internalType === 'issue'
                ? await updateIssueApi(fullItem._id, data)
                : await updateSubTaskApi(fullItem._id, data);

            if (res.success) {
                toast.success(action === 'block' ? "Item blocked" : "Item unblocked / resumed");
                setBlockReason("");
                setShowBlockInput(false);
                onUpdate?.();
                fetchFullDetails();
            }
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            toast.error(e.response?.data?.message || "Failed to update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isReadOnly = fullItem?.sprint_status?.toLowerCase() === 'completed';
    const isInReview = fullItem.status.toLowerCase() === 'in review' || fullItem.status.toLowerCase() === 'submitted';
    const isRework = (fullItem.status.toLowerCase() !== 'done' && fullItem.status.toLowerCase() !== 'completed') &&
        (fullItem.status.toLowerCase() === 'rework' || !!(internalType === 'subtask' ? (fullItem as SubTask).rework_reason : null));
    const isReviewer = can('task:view:all') || can('task:update') || can('task:status:review') || currentUser?.role === 'company';
    const canAssign = (can('task:assign') || can('task:view:all') || can('project:update') || currentUser?.role === 'company') && !isReadOnly;

    const rawTimeline = [
        ...(fullItem.comments || []).map(c => ({ ...c, type: 'comment', source: 'current', taskId: internalType === 'subtask' ? fullItem._id : undefined })),
        ...(parentIssue?.comments || []).map(c => ({ ...c, type: 'comment', source: 'story' })),
        ...(childSubTasks.flatMap(st => (st.comments || []).map(c => ({ ...c, type: 'comment', source: 'subtask', taskId: st._id, taskName: st.title })))),
        ...(fullItem.history || []).map((h) => ({ ...h, type: 'history', source: 'current', taskId: internalType === 'subtask' ? fullItem._id : undefined })),
        ...(parentIssue?.history || []).map((h) => ({ ...h, type: 'history', source: 'story' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const timeline = rawTimeline.filter(entry => {
        if (activityFilter === 'all') return true;
        if (activityFilter === 'story') {
            return entry.source === 'story' || (entry.source === 'current' && type === 'issue');
        }
        if (activityFilter === 'this_task') {
            return entry.source === 'current';
        }
        return (entry as { taskId?: string }).taskId === activityFilter;
    });

    const drawerContent = (
        <div className={`fixed inset-0 z-[1050] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

            <div className={`absolute top-0 right-0 h-full w-full max-w-[550px] bg-white shadow-2xl transition-transform duration-300 ease-out transform flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        {internalType === 'subtask' && type === 'issue' && (
                            <button
                                onClick={() => {
                                    setFullItem(item);
                                    setInternalType('issue');
                                }}
                                className="p-2 hover:bg-gray-50 rounded-full text-[#fa8029] transition-colors mr-1"
                                title="Back to Story"
                            >
                                <RotateCcw size={18} />
                            </button>
                        )}
                        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(fullItem.status)}`}>
                            {fullItem.status}
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium">#{fullItem._id.slice(-6)}</span>
                        <div className="flex items-center gap-1.5">
                            {internalType === 'subtask' ? (
                                <span className="text-[9px] font-black text-[#fa8029] bg-[#fff5ef] px-2.5 py-0.5 rounded-full uppercase border border-[#fa8029]/10 flex items-center gap-1">
                                    <Hash size={10} /> Sub-task
                                </span>
                            ) : (fullItem as Issue).type === 'bug' ? (
                                <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-2.5 py-0.5 rounded-full uppercase border border-rose-100 flex items-center gap-1">
                                    <Flag size={10} /> Bug
                                </span>
                            ) : (
                                <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase border border-blue-100 flex items-center gap-1">
                                    <CheckCircle size={10} /> Task
                                </span>
                            )}
                            {isRework && (
                                <span className="text-[9px] font-black text-white bg-rose-500 px-2.5 py-0.5 rounded-full uppercase border border-rose-600 flex items-center gap-1 animate-pulse">
                                    <RotateCcw size={10} /> Rework
                                </span>
                            )}
                        </div>
                    </div>
                    {fullItem.assignee_id && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-[#fff5ef] rounded-full border border-[#fa8029]/10">
                            <div className="w-5 h-5 rounded-full bg-[#fa8029] text-white flex items-center justify-center text-[10px] font-black uppercase">
                                {(fullItem.assignee_id as { name?: string }).name?.[0] || 'A'}
                            </div>
                            <span className="text-[11px] font-bold text-[#fa8029]">
                                {(fullItem.assignee_id as { name?: string }).name || (fullItem.assignee_id as { user_id?: { name: string } }).user_id?.name || 'Assignee'}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Completed Sprint Banner */}
                {isReadOnly && (
                    <div className="bg-amber-50 border-b border-amber-100 p-3 flex items-center gap-3 shrink-0">
                        <Clock size={16} className="text-amber-500" />
                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                            Sprint Completed - Activities Locked
                        </span>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#fcfcfc]">
                    <div className="p-6">
                        {parentIssue && (
                            <div className="flex items-center gap-2 mb-2 text-[#fa8029]">
                                <BookOpen size={14} />
                                <span className="text-[11px] font-black uppercase tracking-wider">Parent Story: {parentIssue.title}</span>
                            </div>
                        )}
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <h2 className="text-[22px] font-black text-gray-900 leading-tight">
                                {fullItem.title}
                            </h2>
                            {onReassign && canAssign && (
                                <button
                                    onClick={onReassign}
                                    className="px-4 py-1.5 bg-white border border-[#eee] rounded-xl text-[11px] font-black text-gray-400 hover:text-[#fa8029] hover:border-[#fa8029]/30 transition-all flex items-center gap-2 shadow-sm shrink-0"
                                >
                                    <UsersIcon size={14} />
                                    REASSIGN
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-6 border-b border-gray-100 mb-6">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`pb-3 text-[13px] font-bold transition-all relative ${activeTab === 'details' ? 'text-[#fa8029]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Details
                                {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#fa8029] rounded-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('activity')}
                                className={`pb-3 text-[13px] font-bold transition-all relative flex items-center gap-2 ${activeTab === 'activity' ? 'text-[#fa8029]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Activity
                                <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full">{timeline.length}</span>
                                {activeTab === 'activity' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#fa8029] rounded-full" />}
                            </button>
                        </div>

                        {activeTab === 'details' ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Grid Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Priority</span>
                                        <div className={`flex items-center gap-2 text-[13px] font-bold ${getPriorityStyle(fullItem.priority).split(' ')[0]}`}>
                                            <Flag size={14} />
                                            {fullItem.priority}
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                            {type === 'issue' && (fullItem as Issue).type === 'story' ? 'Story Points' : 'Est. Time'}
                                        </span>
                                        <div className="flex items-center gap-2 text-[13px] font-bold text-gray-700">
                                            {internalType === 'issue' && (fullItem as Issue).type === 'story' ? <Hash size={14} /> : <Clock size={14} />}
                                            {internalType === 'issue' && (fullItem as Issue).type === 'story' ? (fullItem as Issue).story_points : `${(fullItem as SubTask).estimated_hours || 0}h`}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-[14px] text-gray-600 leading-relaxed">
                                        {fullItem.description ? <MentionText text={fullItem.description} /> : <span className="text-gray-300 italic">No description provided</span>}
                                    </div>
                                </div>

                                {/* Bug Specifics */}
                                {type === 'issue' && (fullItem as Issue).type === 'bug' && (
                                    <>
                                        {(fullItem as Issue).reproduction_steps && (
                                            <div>
                                                <h3 className="text-[12px] font-bold text-rose-500 uppercase tracking-wider mb-3">Reproduction Steps</h3>
                                                <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-100 text-[14px] text-gray-700 leading-relaxed">
                                                    <MentionText text={(fullItem as Issue).reproduction_steps || ""} />
                                                </div>
                                            </div>
                                        )}
                                        {(fullItem as Issue).environment && (
                                            <div>
                                                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3">Environment</h3>
                                                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-[13px] text-gray-600">
                                                    {(fullItem as Issue).environment}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Acceptance Criteria for Stories */}
                                {type === 'issue' && (fullItem as Issue).type === 'story' && (fullItem as Issue).criteria && (fullItem as Issue).criteria.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="text-[12px] font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <CheckCircle size={14} /> Acceptance Criteria
                                        </h3>
                                        <div className="bg-emerald-50/10 rounded-2xl border border-emerald-100/50 overflow-hidden">
                                            {(fullItem as Issue).criteria.map((criterion, index) => (
                                                <div key={index} className="flex items-start gap-3 p-4 border-b border-emerald-100/20 last:border-0 hover:bg-emerald-50/20 transition-colors">
                                                    <div className="mt-1 w-4 h-4 rounded-full border-2 border-emerald-500/30 flex items-center justify-center shrink-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    </div>
                                                    <span className="text-[13px] text-gray-700 leading-relaxed font-medium">
                                                        <MentionText text={criterion} />
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Parent Context for Sub-tasks */}
                                {type === 'subtask' && parentIssue && (
                                    <div className="p-4 rounded-2xl bg-[#fff5ef]/50 border border-[#fa8029]/10 space-y-3">
                                        <div className="flex items-center gap-2 text-[#fa8029]">
                                            <BookOpen size={14} />
                                            <h3 className="text-[11px] font-bold uppercase tracking-wider">Parent Story</h3>
                                        </div>
                                        <h4 className="text-[14px] font-bold text-gray-800 leading-snug">{parentIssue.title}</h4>

                                        {parentIssue.criteria && parentIssue.criteria.length > 0 && (
                                            <div className="pt-3 border-t border-[#fa8029]/10 space-y-2">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Goal Criteria</span>
                                                <div className="space-y-1.5">
                                                    {parentIssue.criteria.map((c, i) => (
                                                        <div key={i} className="flex items-start gap-2">
                                                            <div className="mt-1.5 w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                                                            <span className="text-[12px] text-gray-600 leading-tight italic">{c}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SubTask Specifics */}
                                {(fullItem as SubTask).submission_link && (
                                    <div className="p-4 rounded-2xl bg-[#f9f9f9] border border-gray-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Submission Details</h3>
                                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">Submitted</span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <GitBranch size={14} />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Branch</span>
                                                    <span className="text-[12px] font-mono font-bold text-gray-700">{(fullItem as SubTask).branch_name || "Not Specified"}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Live Link</span>
                                                <a
                                                    href={(fullItem as SubTask).submission_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[13px] font-bold text-blue-500 hover:underline flex items-center gap-1.5 bg-white p-2 rounded-lg border border-gray-100 shadow-sm inline-flex"
                                                >
                                                    <ExternalLink size={14} />
                                                    View Implementation
                                                </a>
                                            </div>

                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Developer Notes</span>
                                                <div className="text-[14px] text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
                                                    <MentionText text={(fullItem as SubTask).submission_description || "No notes provided"} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {internalType === 'subtask' && (fullItem as SubTask).rework_reason && (
                                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
                                        <div className="flex items-center gap-2 mb-2 text-rose-500">
                                            <RotateCcw size={14} />
                                            <h3 className="text-[11px] font-bold uppercase tracking-wider">Rework Required</h3>
                                        </div>
                                        <div className="text-[13px] text-gray-700 italic">
                                            <MentionText text={(fullItem as SubTask).rework_reason || ""} />
                                        </div>
                                    </div>
                                )}

                                {fullItem.status === 'Blocked' && fullItem.blocked_reason && (
                                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                                        <div className="flex items-center gap-2 mb-2 text-amber-500">
                                            <Clock size={14} />
                                            <h3 className="text-[11px] font-bold uppercase tracking-wider">Blocking Reason</h3>
                                        </div>
                                        <div className="text-[13px] text-gray-700 italic">
                                            <MentionText text={fullItem.blocked_reason || ""} />
                                        </div>
                                    </div>
                                )}

                                {/* Child Sub-tasks Section for Stories */}
                                {type === 'issue' && (fullItem as Issue).type === 'story' && childSubTasks.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Sub-tasks Development ({childSubTasks.length})</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {childSubTasks.map((st) => (
                                                <div
                                                    key={st._id}
                                                    onClick={() => {
                                                        setFullItem(st);
                                                        setInternalType('subtask');
                                                        fetchFullDetails(st._id, 'subtask');
                                                    }}
                                                    className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm group hover:border-[#fa8029]/30 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                                                >
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className={`w-2 h-2 rounded-full shrink-0 ${st.status === 'Done' ? 'bg-emerald-500' : st.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                                                <span className="text-[14px] font-bold text-gray-800 truncate leading-tight">{st.title}</span>
                                                            </div>
                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${st.status === 'Done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                    st.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                        st.status === 'In Review' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                                            'bg-gray-50 text-gray-400 border-gray-100'
                                                                }`}>
                                                                {st.status}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                                                            {/* Team Info */}
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-5 h-5 rounded-md bg-[#fff5ef] flex items-center justify-center text-[#fa8029]">
                                                                    <UsersIcon size={10} />
                                                                </div>
                                                                <span className="text-[11px] font-bold text-gray-500">{(st.team_id as { name?: string })?.name || 'General'}</span>
                                                            </div>

                                                            {/* Creator Info */}
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-5 h-5 rounded-md bg-gray-50 flex items-center justify-center text-gray-400">
                                                                    <User size={10} />
                                                                </div>
                                                                <span className="text-[11px] text-gray-400">By <span className="font-bold text-gray-500">{(st.created_by as { name?: string })?.name || 'System'}</span></span>
                                                            </div>

                                                            {/* Assignee Info */}
                                                            <div className="flex items-center gap-1.5 ml-auto">
                                                                <span className="text-[11px] font-bold text-gray-400">Assignee:</span>
                                                                {st.assignee_id ? (
                                                                    <div className="flex items-center gap-1.5">
                                                                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-black border border-white shadow-sm">
                                                                            {(st.assignee_id as { name: string }).name?.[0].toUpperCase()}
                                                                        </div>
                                                                        <span className="text-[11px] font-bold text-gray-700">{(st.assignee_id as { name: string }).name}</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-[11px] font-bold text-rose-400 italic">Unassigned</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* People Section */}
                                <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
                                    <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">People</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-center gap-3 group/assignee">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                                <UsersIcon size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Assignee</span>
                                                </div>
                                                <span className="text-[13px] font-bold text-gray-800 truncate block">
                                                    {(fullItem.assignee_id as { name?: string })?.name ||
                                                        (fullItem.assignee_id as { user_id?: { name: string } })?.user_id?.name ||
                                                        (internalType === 'issue' ? (fullItem as Issue).assign_to?.name : null) ||
                                                        'Unassigned'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Reporter</span>
                                                <span className="text-[13px] font-bold text-gray-800">
                                                    {(fullItem.created_by as { name?: string })?.name || 'System'}
                                                </span>
                                            </div>
                                        </div>

                                        {internalType === 'issue' && (fullItem as Issue).assigned_by && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                                                    <Flag size={18} />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Assigned By</span>
                                                    <span className="text-[13px] font-bold text-gray-800">
                                                        {(fullItem as Issue).assigned_by?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Attachments Section */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Attachments</h3>
                                        {!isReadOnly && (
                                            <button
                                                onClick={() => triggerFileUpload('item')}
                                                disabled={isUploading}
                                                className="text-[11px] font-bold text-[#fa8029] hover:underline flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <Paperclip size={12} />
                                                {isUploading ? 'Uploading...' : 'Add'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(fullItem.attachments && fullItem.attachments.length > 0) ? (
                                            fullItem.attachments.map((file, idx) => (
                                                <a
                                                    key={idx}
                                                    href={file.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-lg hover:border-[#fa8029]/30 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-[#fa8029] transition-colors">
                                                        <Paperclip size={14} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[11px] font-bold text-gray-700 truncate">{file.file_name}</span>
                                                        <span className="text-[9px] text-gray-400">View File</span>
                                                    </div>
                                                </a>
                                            ))
                                        ) : (
                                            <div className="col-span-2 py-4 bg-white border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-300">
                                                <Paperclip size={20} className="mb-2 opacity-50" />
                                                <span className="text-[12px]">No attachments yet</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Activity Filter Bar */}
                                {(childSubTasks.length > 0 || parentIssue) && (
                                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                                        <button
                                            onClick={() => setActivityFilter('all')}
                                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 ${activityFilter === 'all' ? 'bg-[#fa8029] text-white shadow-md shadow-orange-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                        >
                                            All Activity
                                        </button>

                                        {/* For Stories: Show "Story Only" and each Sub-task */}
                                        {type === 'issue' && (
                                            <>
                                                <button
                                                    onClick={() => setActivityFilter('story')}
                                                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 ${activityFilter === 'story' ? 'bg-[#fa8029] text-white shadow-md shadow-orange-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                >
                                                    Story Only
                                                </button>
                                                {childSubTasks.map(st => (
                                                    <button
                                                        key={st._id}
                                                        onClick={() => setActivityFilter(st._id)}
                                                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 ${activityFilter === st._id ? 'bg-[#fa8029] text-white shadow-md shadow-orange-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                    >
                                                        {st.title}
                                                    </button>
                                                ))}
                                            </>
                                        )}

                                        {/* For Sub-tasks: Show "This Task" and "Parent Story" */}
                                        {type === 'subtask' && parentIssue && (
                                            <>
                                                <button
                                                    onClick={() => setActivityFilter('this_task')}
                                                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 ${activityFilter === 'this_task' ? 'bg-[#fa8029] text-white shadow-md shadow-orange-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                >
                                                    This Task
                                                </button>
                                                <button
                                                    onClick={() => setActivityFilter('story')}
                                                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all shrink-0 ${activityFilter === 'story' ? 'bg-[#fa8029] text-white shadow-md shadow-orange-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                >
                                                    Parent Story
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Timeline Feed */}
                                <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                                    {timeline.length > 0 ? (
                                        timeline.map((entry, idx) => {
                                            const e = entry as {
                                                type: string;
                                                user?: { name?: string; user_id?: { name: string }; _id: string } | string;
                                                created_at: string;
                                                source: string;
                                                text?: string;
                                                attachments?: { file_url: string; file_name: string }[];
                                                action?: string;
                                                from?: string;
                                                to?: string;
                                            };
                                            return (
                                                <div key={idx} className="relative pl-12">
                                                    {/* Icon Node */}
                                                    <div className={`absolute left-0 top-0 w-[34px] h-[34px] rounded-full border-4 border-[#fcfcfc] flex items-center justify-center z-10 ${e.type === 'comment' ? 'bg-[#fff5ef] text-[#fa8029]' : 'bg-gray-50 text-gray-400'
                                                        }`}>
                                                        {e.type === 'comment' ? <MessageSquare size={14} /> : <History size={14} />}
                                                    </div>

                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[13px] font-bold text-gray-800">
                                                                {typeof e.user === 'object' ? (e.user?.name || e.user?.user_id?.name || 'System') : (e.user === currentUser?._id ? currentUser?.name : 'System')}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400">
                                                                {new Date(e.created_at).toLocaleString()}
                                                            </span>
                                                            {e.source === 'story' && (
                                                                <span className="text-[8px] font-black text-[#fa8029] bg-[#fff5ef] px-1.5 py-0.5 rounded border border-[#fa8029]/10 uppercase">Story Context</span>
                                                            )}
                                                        </div>

                                                        {e.type === 'comment' ? (
                                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                                <div className="text-[13px] text-gray-600 leading-relaxed">
                                                                    <MentionText text={e.text || ""} />
                                                                </div>
                                                                {e.attachments && e.attachments.length > 0 && (
                                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                                        {e.attachments.map((att, aIdx) => (
                                                                            <a
                                                                                key={aIdx}
                                                                                href={att.file_url}
                                                                                className="text-[11px] text-[#fa8029] bg-[#fff5ef] px-2 py-1 rounded border border-[#fa8029]/10 flex items-center gap-1"
                                                                            >
                                                                                <Paperclip size={10} /> {att.file_name}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-[13px] text-gray-500 italic">
                                                                Changed <span className="font-bold text-gray-700">{(e.action || "").replace('_', ' ')}</span>
                                                                {e.from && <> from <span className="text-gray-400 line-through">
                                                                    {e.from === 'previously_assigned' ? 'Previous Assignee' : e.from}
                                                                </span></>}
                                                                {e.to && <> to <span className="font-bold text-[#fa8029]">
                                                                    {e.to === 'assigned_new_employee' ? (
                                                                        (fullItem.assignee_id as { name?: string })?.name ||
                                                                        (fullItem.assignee_id as { user_id?: { name: string } })?.user_id?.name ||
                                                                        (fullItem as unknown as { assign_to?: { name: string } }).assign_to?.name ||
                                                                        'Assignee'
                                                                    ) :
                                                                        e.to === 'new_sprint' ? 'New Sprint' :
                                                                            e.to}
                                                                </span></>}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12 text-gray-300">
                                            <History size={32} className="mx-auto mb-3 opacity-20" />
                                            <p className="text-[14px]">No activity history yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-white space-y-4">
                    {/* Review Actions Bar */}
                    {isInReview && isReviewer && !showReworkInput && !isReadOnly && (
                        <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                            <button
                                onClick={() => handleReview('approve')}
                                disabled={isReviewing}
                                className="flex-1 bg-emerald-500 text-white py-3 rounded-2xl text-[13px] font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={18} /> Approve & Complete
                            </button>
                            <button
                                onClick={() => setShowReworkInput(true)}
                                disabled={isReviewing}
                                className="flex-1 bg-rose-500 text-white py-3 rounded-2xl text-[13px] font-bold shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} /> Rework
                            </button>
                        </div>
                    )}

                    {fullItem.status === 'In Progress' && !showBlockInput && !isReadOnly && (
                        internalType === 'issue' ? (
                            (fullItem as Issue).type.toLowerCase() === 'story' ? can('issue:story:block' as any) :
                            (fullItem as Issue).type.toLowerCase() === 'bug' ? can('issue:bug:block' as any) :
                            can('issue:task:block' as any)
                        ) : (
                            (fullItem as SubTask).subtask_type === 'sub-task' ? can('task:block') :
                            (fullItem as SubTask).subtask_type === 'bug' ? can('issue:bug:block' as any) :
                            can('issue:task:block' as any)
                        )
                    ) && (
                        <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                            <button
                                onClick={() => setShowBlockInput(true)}
                                disabled={isSubmitting}
                                className="flex-1 bg-amber-500 text-white py-3 rounded-2xl text-[13px] font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                            >
                                <Clock size={18} /> Block {internalType === 'issue' ? 'Issue' : 'Task'}
                            </button>
                        </div>
                    )}

                    {fullItem.status === 'Blocked' && !showBlockInput && !isReadOnly && (
                        internalType === 'issue' ? (
                            (fullItem as Issue).type.toLowerCase() === 'story' ? can('issue:story:block' as any) :
                            (fullItem as Issue).type.toLowerCase() === 'bug' ? can('issue:bug:block' as any) :
                            can('issue:task:block' as any)
                        ) : (
                            (fullItem as SubTask).subtask_type === 'sub-task' ? can('task:block') :
                            (fullItem as SubTask).subtask_type === 'bug' ? can('issue:bug:block' as any) :
                            can('issue:task:block' as any)
                        )
                    ) && (
                        <div className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
                            <button
                                onClick={() => handleBlock('unblock')}
                                disabled={isSubmitting}
                                className="flex-1 bg-blue-500 text-white py-3 rounded-2xl text-[13px] font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                            >
                                <Play size={18} /> Unblock / Resume Work
                            </button>
                        </div>
                    )}

                    {showBlockInput && (
                        <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Blocking Reason</span>
                                <button onClick={() => setShowBlockInput(false)} className="text-[10px] font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                            </div>
                            <MentionTextArea
                                value={blockReason}
                                onChange={(text) => setBlockReason(text)}
                                placeholder="Explain why this item is blocked..."
                                users={employees}
                                className="bg-amber-50/30 border border-amber-100 min-h-[100px]"
                            />
                            <button
                                onClick={() => handleBlock('block')}
                                disabled={isSubmitting || !blockReason.trim()}
                                className="w-full bg-amber-500 text-white py-3 rounded-2xl text-[13px] font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all"
                            >
                                {isSubmitting ? 'Blocking...' : 'Confirm Block'}
                            </button>
                        </div>
                    )}

                    {/* Rework Reason Input */}
                    {showReworkInput && (
                        <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Rework Reason</span>
                                <button onClick={() => setShowReworkInput(false)} className="text-[10px] font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                            </div>
                            <MentionTextArea
                                value={reworkReason}
                                onChange={(text) => {
                                    setReworkReason(text);

                                }}
                                placeholder="Explain what needs to be fixed... (Type @ to mention)"
                                users={employees}
                                className="bg-rose-50/30 border border-rose-100 min-h-[100px]"
                            />
                            <button
                                onClick={() => handleReview('reject')}
                                disabled={isReviewing || !reworkReason.trim()}
                                className="w-full bg-rose-500 text-white py-3 rounded-2xl text-[13px] font-bold shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                            >
                                {isReviewing ? 'Sending...' : 'Confirm Rework Request'}
                            </button>
                        </div>
                    )}

                    {pendingAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {pendingAttachments.map((att, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-[#fff5ef] px-3 py-1.5 rounded-lg border border-[#fa8029]/10 group animate-in zoom-in-95 duration-200">
                                    <Paperclip size={12} className="text-[#fa8029]" />
                                    <span className="text-[11px] font-bold text-[#fa8029] max-w-[150px] truncate">{att.file_name}</span>
                                    <button
                                        onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))}
                                        className="text-gray-400 hover:text-rose-500 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {!isReadOnly ? (
                        <div className="relative group">
                            <MentionTextArea
                                value={comment}
                                onChange={(text, m) => {
                                    setComment(text);
                                    setMentions(m);
                                }}
                                placeholder="Add a comment or feedback... (Type @ to mention)"
                                users={employees}
                                className="bg-gray-50 border border-gray-100 pr-12 min-h-[100px]"
                            />
                            <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => triggerFileUpload('comment')}
                                    disabled={isUploading}
                                    className={`p-2 transition-colors rounded-lg disabled:opacity-50 ${isUploading && uploadMode === 'comment' ? 'text-[#fa8029] animate-pulse' : 'text-gray-400 hover:text-[#fa8029]'}`}
                                >
                                    <Paperclip size={18} />
                                </button>
                                <button
                                    onClick={handleAddComment}
                                    disabled={isSubmitting || !comment.trim()}
                                    className="p-2 bg-[#fa8029] text-white rounded-xl shadow-lg shadow-[#fa8029]/20 hover:bg-[#e67324] disabled:opacity-50 disabled:shadow-none transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                            <p className="text-[12px] text-gray-400 font-medium italic">Comments are disabled for completed sprints</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ddd; }
            `}</style>
        </div>
    );

    return createPortal(drawerContent, document.body);
}
