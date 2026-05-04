/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

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
}

interface SubTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SubTaskFormData) => void;
    initialData?: SubTaskFormData;
    isEditing?: boolean;
    isSubmitting?: boolean;
    members?: SubTaskMember[];
}

export default function SubTaskModal({ isOpen, onClose, onSubmit, initialData, isEditing = false, isSubmitting = false, members = [] }: SubTaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [estimatedHours, setEstimatedHours] = useState<string>("");
    const [assigneeId, setAssigneeId] = useState("");
    const [status, setStatus] = useState("To Do");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setDescription(initialData.description || "");
                setPriority(initialData.priority);
                setEstimatedHours(initialData.estimated_hours?.toString() || "");
                setAssigneeId(typeof initialData.assignee_id === 'object' ? (initialData.assignee_id as any)?._id : initialData.assignee_id || "");
                setStatus(initialData.status || "To Do");
            } else {
                setTitle("");
                setDescription("");
                setPriority("Medium");
                setEstimatedHours("");
                setAssigneeId("");
                setStatus("To Do");
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ 
            title, 
            description,
            priority, 
            estimated_hours: Number(estimatedHours) || 0,
            assignee_id: assigneeId || undefined,
            status: status
        });
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
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2.5 text-[14px] font-medium bg-white border border-[#e5e7eb] rounded-xl outline-none focus:border-[#fa8029] focus:ring-4 focus:ring-[#fa8029]/5 transition-all resize-none placeholder:text-[#9ca3af]"
                                placeholder="Add details..."
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
                        <div>
                            <label className="block text-[12px] font-bold text-[#1f2124] uppercase tracking-wider mb-2 ml-1 opacity-60">Assignee</label>
                            <div className="relative">
                                <select
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className="w-full px-4 py-2.5 text-[14px] font-medium bg-white border border-[#e5e7eb] rounded-xl outline-none focus:border-[#fa8029] focus:ring-4 focus:ring-[#fa8029]/5 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select assignee</option>
                                    {members.map(member => (
                                        <option key={member._id} value={member._id}>{member.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none" />
                            </div>
                        </div>
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
