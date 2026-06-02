 
import React, { useState, useEffect, useRef } from "react";
import { X, ChevronDown, Sparkles, Loader2, Bot } from "lucide-react";
import { createPortal } from "react-dom";
import MentionTextArea from "@/features/shared/components/MentionTextArea";
import { usePermission } from "../hooks/usePermission";

interface SubTaskMember {
    _id: string;
    name: string;
    email: string;
    designation?: string;
}

export interface SubTaskFormData {
    title: string;
    description: string;
    priority: string;
    estimated_hours: number;
    assignee_id?: string;
    status?: string;
    mentions?: string[];
}

interface SubTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SubTaskFormData) => void;
    initialData?: SubTaskFormData;
    isEditing?: boolean;
    isSubmitting?: boolean;
    members?: SubTaskMember[];
    onAutoAssign?: () => Promise<void>;
}

export default function SubTaskModal({ isOpen, onClose, onSubmit, initialData, isEditing = false, isSubmitting = false, members = [], onAutoAssign }: SubTaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [estimatedHours, setEstimatedHours] = useState<string>("");
    const [assigneeId, setAssigneeId] = useState("");
    const [status, setStatus] = useState("To Do");
    const [mentions, setMentions] = useState<string[]>([]);
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { can } = usePermission();

    useEffect(() => {
        if (isOpen) {
            setIsDropdownOpen(false);
            if (initialData) {
                setTitle(initialData.title);
                setDescription(initialData.description || "");
                setPriority(initialData.priority);
                setEstimatedHours(initialData.estimated_hours?.toString() || "");
                setAssigneeId(typeof initialData.assignee_id === 'object' ? (initialData.assignee_id as { _id: string })?._id : initialData.assignee_id || "");
                setStatus(initialData.status || "To Do");
            } else {
                setTitle("");
                setDescription("");
                setPriority("Medium");
                setEstimatedHours("");
                setAssigneeId("");
                setStatus("To Do");
                setMentions([]);
            }
        }
    }, [isOpen, initialData]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ 
            title, 
            description,
            priority, 
            estimated_hours: Number(estimatedHours) || 0,
            assignee_id: can('task:assign') ? (assigneeId || undefined) : undefined,
            status: status,
            mentions: mentions
        });
    };

    const handleAutoAssign = async () => {
        if (!onAutoAssign) {
            import("sonner").then(m => m.toast.info("Please save the item first to use AI Auto-Assign"));
            return;
        }
        setIsAutoAssigning(true);
        try {
            await onAutoAssign();
        } catch (err) {
            console.error("Auto assign failed", err);
        } finally {
            setIsAutoAssigning(false);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
            <div className="bg-[#f8f9fa] rounded-[28px] w-full max-w-md shadow-2xl relative z-[1060] flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200 overflow-hidden border border-white/20">
                
                {/* Header */}
                <div className="flex items-center justify-between px-7 pt-6 pb-4 bg-white/40 border-b border-[#e5e7eb]/50">
                    <h2 className="text-[18px] font-black text-[#1f2124]">
                        {isEditing ? "Edit Sub-task" : "Create Sub-task"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-[#aaa] hover:text-[#1f2124] hover:bg-[#f3f4f6] rounded-full transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-7 py-5 overflow-y-auto flex-1 custom-scrollbar">
                    <form id="subtask-form" onSubmit={handleSubmit} className="space-y-4">
                        
                        {/* Title */}
                        <div>
                            <label className="block text-[12px] font-bold text-[#1f2124] uppercase tracking-wider mb-2 ml-1 opacity-60">Sub-task Title *</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 text-[14px] font-medium bg-white border border-[#e5e7eb] rounded-xl outline-none focus:border-[#fa8029] focus:ring-4 focus:ring-[#fa8029]/5 transition-all placeholder:text-[#9ca3af]"
                                placeholder="What needs to be done?"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-[12px] font-bold text-[#1f2124] uppercase tracking-wider mb-2 ml-1 opacity-60">Description</label>
                            <MentionTextArea
                                value={description}
                                onChange={(text, m) => {
                                    setDescription(text);
                                    setMentions(m);
                                }}
                                placeholder="Add details... (Type @ to mention)"
                                users={members}
                                className="min-h-[80px]"
                            />
                        </div>

                        {/* Priority & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[12px] font-bold text-[#1f2124] uppercase tracking-wider mb-2 ml-1 opacity-60">Priority</label>
                                <div className="relative">
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full px-4 py-2.5 text-[14px] font-medium bg-white border border-[#e5e7eb] rounded-xl outline-none focus:border-[#fa8029] focus:ring-4 focus:ring-[#fa8029]/5 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-[#1f2124] uppercase tracking-wider mb-2 ml-1 opacity-60">Est. Time (h)</label>
                                <input
                                    type="text"
                                    value={estimatedHours}
                                    onChange={(e) => setEstimatedHours(e.target.value.replace(/[^0-9]/g, ''))}
                                    className="w-full px-4 py-2.5 text-[14px] font-medium bg-white border border-[#e5e7eb] rounded-xl outline-none focus:border-[#fa8029] focus:ring-4 focus:ring-[#fa8029]/5 transition-all placeholder:text-[#9ca3af]"
                                    placeholder="e.g. 4"
                                />
                            </div>
                        </div>

                        {/* Status (Only when editing) */}
                        {isEditing && (
                            <div>
                                <label className="block text-[12px] font-bold text-[#1f2124] uppercase tracking-wider mb-2 ml-1 opacity-60">Status</label>
                                <div className="relative">
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-2.5 text-[14px] font-medium bg-white border border-[#e5e7eb] rounded-xl outline-none focus:border-[#fa8029] focus:ring-4 focus:ring-[#fa8029]/5 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="To Do">To Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="In Review">In Review</option>
                                        <option value="Done">Done</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
                                </div>
                            </div>
                        )}

                        {/* Assignee */}
                        {can('task:assign') && (
                            <div>
                                <label className="block text-[12px] font-bold text-[#1f2124] uppercase tracking-wider mb-2 ml-1 opacity-60">Assignee</label>
                                <div className="flex items-center gap-2 mb-1">
                                    {/* Custom Dropdown */}
                                    <div className="relative flex-1" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full px-4 h-11 text-[13px] font-bold text-[#1f2124] bg-white border-2 border-[#fa8029] hover:border-[#fa8029]/80 rounded-[20px] outline-none focus:ring-2 focus:ring-[#fa8029]/20 transition-all flex items-center justify-between cursor-pointer shadow-sm active:scale-[0.98]"
                                        >
                                            <span className="truncate">
                                                {assigneeId
                                                    ? (() => {
                                                        const m = members.find(m => m._id === assigneeId);
                                                        return m ? `${m.name}${m.designation ? ` (${m.designation})` : ''}` : 'Select assignee';
                                                      })()
                                                    : 'Select assignee'
                                                }
                                            </span>
                                            <ChevronDown size={16} className="text-[#fa8029] shrink-0" />
                                        </button>

                                        {/* Dropdown Options */}
                                        {isDropdownOpen && (
                                            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#fa8029]/20 rounded-[20px] shadow-xl max-h-[200px] overflow-y-auto z-[1200] py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
                                                <button
                                                    type="button"
                                                    onClick={() => { setAssigneeId(""); setIsDropdownOpen(false); }}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-[#737373] hover:bg-orange-50 hover:text-[#fa8029] transition-colors cursor-pointer"
                                                >
                                                    Select assignee
                                                </button>
                                                {members.map(member => (
                                                    <button
                                                        key={member._id}
                                                        type="button"
                                                        onClick={() => { setAssigneeId(member._id); setIsDropdownOpen(false); }}
                                                        className={`w-full text-left px-4 py-2.5 text-[13px] font-bold transition-colors cursor-pointer ${
                                                            assigneeId === member._id
                                                                ? 'bg-[#fa8029] text-white'
                                                                : 'text-[#1f2124] hover:bg-orange-50 hover:text-[#fa8029]'
                                                        }`}
                                                    >
                                                        {member.name}{member.designation ? ` (${member.designation})` : ''}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Auto Assign Button */}
                                    <button
                                        type="button"
                                        onClick={handleAutoAssign}
                                        disabled={isAutoAssigning}
                                        title="Auto-assign using AI"
                                        className="w-11 h-11 shrink-0 flex items-center justify-center bg-[#f9f9f9] border border-gray-100 rounded-xl text-[#a855f7] hover:bg-white hover:border-[#a855f7]/30 hover:shadow-sm hover:shadow-purple-500/10 transition-all active:scale-[0.96] disabled:opacity-50"
                                    >
                                        {isAutoAssigning ? <Loader2 size={16} className="animate-spin" /> : <Bot size={18} />}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 mt-2 ml-1">
                                    <Sparkles size={12} className="text-[#a855f7]" />
                                    <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                                        AI assignment based on skills & availability
                                    </span>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="px-7 py-5 bg-[#fcfcfc] border-t border-[#e5e7eb]/50 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 text-[13px] font-bold text-[#555] bg-white border border-[#e5e7eb] rounded-xl hover:bg-[#f9fafb] active:scale-[0.98] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        form="subtask-form"
                        type="submit"
                        disabled={isSubmitting || !title.trim()}
                        className="flex-1 px-6 py-3 text-[13px] font-bold text-white bg-[#1f2124] rounded-xl shadow-md hover:bg-black active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Sub-task"}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
