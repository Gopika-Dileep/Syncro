/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Bug, BookOpen, CheckSquare, Users as UsersIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { usePermission } from "@/features/employee/hooks/usePermission";

export interface IssueFormData {
    title: string;
    type: string;
    criteria: string[];
    story_points: number;
    estimated_hours: number;
    priority: string;
    description?: string;
    reproduction_steps?: string;
    environment?: string;
    status?: string;
    mentions?: string[];
    assignee_id?: string | any;
}

interface IssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: IssueFormData) => void;
    initialData?: IssueFormData;
    isEditing?: boolean;
    isSubmitting?: boolean;
    members?: { _id: string; name: string; designation?: string }[];
}

const ISSUE_TYPES = [
    { id: 'story', label: 'Story', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 'bug', label: 'Bug', icon: Bug, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 'task', label: 'Task', icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
];

export default function IssueModal({ isOpen, onClose, onSubmit, initialData, isEditing = false, isSubmitting = false, members = [] }: IssueModalProps) {
    const { can } = usePermission();
    
    const availableTypes = ISSUE_TYPES.filter(it => 
        isEditing ? true : can(`issue:${it.id}:create`)
    );

    const [title, setTitle] = useState("");
    const [type, setType] = useState(availableTypes[0]?.id || "story");
    const [points, setPoints] = useState<number>(1);
    const [estHours, setEstHours] = useState<number>(0);
    const [priority, setPriority] = useState("Medium");
    const [criteria, setCriteria] = useState<string[]>([""]);
    const [description, setDescription] = useState("");
    const [reproSteps, setReproSteps] = useState("");
    const [environment, setEnvironment] = useState("");
    const [mentions, setMentions] = useState<string[]>([]);
    const [assigneeId, setAssigneeId] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setType(initialData.type || "story");
                setPoints(initialData.story_points || 0);
                setEstHours(initialData.estimated_hours || 0);
                setPriority(initialData.priority);
                setCriteria(initialData.criteria?.length ? initialData.criteria : [""]);
                setDescription(initialData.description || "");
                setReproSteps(initialData.reproduction_steps || "");
                setEnvironment(initialData.environment || "");
                const initialMentions = ((initialData.mentions || []) as any[]).map(m => typeof m === 'string' ? m : m._id);
                setMentions(initialMentions);
                setAssigneeId(typeof initialData.assignee_id === 'object' ? initialData.assignee_id?._id : initialData.assignee_id || "");

            } else {
                setTitle("");
                setType(availableTypes[0]?.id || "story");
                setPoints(1);
                setEstHours(0);
                setPriority("Medium");
                setCriteria([""]);
                setDescription("");
                setReproSteps("");
                setEnvironment("");
                setMentions([]);
                setAssigneeId("");
            }
        }
    }, [isOpen, initialData, availableTypes.length]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validCriteria = criteria.filter(c => c.trim().length > 0);
        onSubmit({ 
            title, 
            type,
            story_points: type === 'story' ? points : 0, 
            estimated_hours: (type === 'task' || type === 'bug') ? estHours : 0,
            priority, 
            description,
            reproduction_steps: type === 'bug' ? reproSteps : undefined,
            environment: type === 'bug' ? environment : undefined,
            criteria: type === 'story' ? (validCriteria.length ? validCriteria : ["Standard acceptance criteria met"]) : [],
            status: isEditing && initialData?.status ? initialData.status : "New",
            mentions: mentions,
            assignee_id: (type === 'task' || (type === 'bug' && can('issue:bug:assign'))) ? (assigneeId || undefined) : undefined
        });
    };

    const toggleMention = (memberId: string) => {
        setMentions(prev => 
            prev.includes(memberId) 
                ? prev.filter(id => id !== memberId) 
                : [...prev, memberId]
        );
    };

    const updateCriterion = (index: number, val: string) => {
        const newC = [...criteria];
        newC[index] = val;
        setCriteria(newC);
    };

    const addCriterion = () => setCriteria([...criteria, ""]);
    const removeCriterion = (index: number) => {
        if (criteria.length === 1) return;
        const newC = criteria.filter((_, i) => i !== index);
        setCriteria(newC);
    };

    const modalContent = (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-[1060] flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0]">
                    <h2 className="text-[16px] font-bold text-[#1f2124]">
                        {isEditing ? `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}` : "Create New Issue"}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-[#aaa] hover:bg-[#f5f5f5] hover:text-[#555] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                    <form id="issue-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Issue Type Selector */}
                        {!isEditing && (
                            <div>
                                <label className="block text-[12px] font-bold text-[#555] mb-2">Issue Type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {availableTypes.map((it) => (
                                        <button
                                             key={it.id}
                                             type="button"
                                             onClick={() => setType(it.id)}
                                             className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all ${
                                                 type === it.id 
                                                     ? `border-[#fa8029] ${it.bg} ${it.color}` 
                                                     : 'border-[#f0f0f0] bg-white text-[#999] hover:border-gray-200'
                                             }`}
                                         >
                                             <it.icon size={16} />
                                             <span className="text-[12px] font-bold">{it.label}</span>
                                         </button>
                                     ))}
                                 </div>
                            </div>
                         )}
 
                         <div>
                             <label className="block text-[12px] font-bold text-[#555] mb-1.5">Title</label>
                             <input
                                 type="text"
                                 required
                                 value={title}
                                 onChange={(e) => setTitle(e.target.value)}
                                 className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] focus:ring-1 focus:ring-[#fa8029] transition-all"
                                 placeholder={type === 'bug' ? "E.g., Login fails on Safari..." : "E.g., As a user, I want to..."}
                             />
                         </div>
 
                         <div>
                             <label className="block text-[12px] font-bold text-[#555] mb-1.5">Description</label>
                             <textarea
                                 value={description}
                                 onChange={(e) => setDescription(e.target.value)}
                                 rows={3}
                                 className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] focus:ring-1 focus:ring-[#fa8029] transition-all resize-none"
                                 placeholder="Describe the issue in detail..."
                             />
                         </div>
 
                         {type === 'bug' && (
                             <>
                                 <div>
                                     <label className="block text-[12px] font-bold text-[#555] mb-1.5">Steps to Reproduce</label>
                                     <textarea
                                         value={reproSteps}
                                         onChange={(e) => setReproSteps(e.target.value)}
                                         rows={3}
                                         className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] focus:ring-1 focus:ring-[#fa8029] transition-all resize-none"
                                         placeholder="1. Go to... 2. Click on... 3. Observe..."
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-[12px] font-bold text-[#555] mb-1.5">Environment</label>
                                     <input
                                         type="text"
                                         value={environment}
                                         onChange={(e) => setEnvironment(e.target.value)}
                                         className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] focus:ring-1 focus:ring-[#fa8029] transition-all"
                                         placeholder="E.g., Production, Staging, Safari 15.0"
                                     />
                                 </div>
                             </>
                         )}
 
  
                         <div className="flex gap-4">
                             {type === 'story' ? (
                                 <div className="flex-1">
                                     <label className="block text-[12px] font-bold text-[#555] mb-1.5">Story Points</label>
                                     <input
                                         type="number"
                                         min="0"
                                         required
                                         value={points}
                                         onChange={(e) => setPoints(Number(e.target.value))}
                                         className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] focus:ring-1 focus:ring-[#fa8029] transition-all"
                                     />
                                 </div>
                             ) : (
                                 <div className="flex-1">
                                     <label className="block text-[12px] font-bold text-[#555] mb-1.5">Est. Time (Hours)</label>
                                     <input
                                         type="number"
                                         min="0"
                                         required
                                         value={estHours}
                                         onChange={(e) => setEstHours(Number(e.target.value))}
                                         className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] focus:ring-1 focus:ring-[#fa8029] transition-all"
                                         placeholder="Hours..."
                                     />
                                 </div>
                             )}
                             <div className="flex-1">
                                 <label className="block text-[12px] font-bold text-[#555] mb-1.5">Priority</label>
                                 <select
                                     value={priority}
                                     onChange={(e) => setPriority(e.target.value)}
                                     className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] focus:ring-1 focus:ring-[#fa8029] transition-all"
                                 >
                                     <option value="Low">Low</option>
                                     <option value="Medium">Medium</option>
                                     <option value="High">High</option>
                                     <option value="Critical">Critical</option>
                                 </select>
                             </div>
                         </div>
 
                         <div>
                             <label className="block text-[12px] font-bold text-[#555] mb-2">Mention Employees</label>
                             <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-100 custom-scrollbar">
                                 {members.length > 0 ? (
                                     members.map((member) => (
                                         <button
                                             key={member._id}
                                             type="button"
                                             onClick={() => toggleMention(member._id)}
                                             className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                                                 mentions.includes(member._id)
                                                     ? 'bg-[#fa8029] text-white border-[#fa8029]'
                                                     : 'bg-white text-[#666] border-gray-200 hover:border-[#fa8029]'
                                             }`}
                                         >
                                             {member.name}
                                         </button>
                                     ))
                                 ) : (
                                     <p className="text-[11px] text-gray-400 italic">No members available to mention</p>
                                 )}
                             </div>
                         </div>

                         {(type === 'task' || (type === 'bug' && can('issue:bug:assign'))) && (
                             <div>
                                 <label className="block text-[12px] font-bold text-[#555] mb-1.5">Assign To</label>
                                 <select
                                     value={assigneeId}
                                     onChange={(e) => setAssigneeId(e.target.value)}
                                     className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] focus:ring-1 focus:ring-[#fa8029] transition-all"
                                 >
                                     <option value="">Select Assignee</option>
                                     {members.map(member => (
                                         <option key={member._id} value={member._id}>{member.name}</option>
                                     ))}
                                 </select>
                             </div>
                         )}
 
                         {type === 'story' && (
                             <div>
                                 <div className="flex items-center justify-between mb-2">
                                     <label className="block text-[12px] font-bold text-[#555]">Acceptance Criteria</label>
                                 </div>
                                 <div className="space-y-2">
                                     {criteria.map((crt, idx) => (
                                         <div key={idx} className="flex gap-2 items-start">
                                             <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#fa8029] shrink-0" />
                                             <input
                                                 type="text"
                                                 value={crt}
                                                 onChange={(e) => updateCriterion(idx, e.target.value)}
                                                 placeholder="Criterion description..."
                                                 className="flex-1 px-3 py-2 text-[13px] bg-transparent border-b border-[#eee] focus:border-[#fa8029] outline-none transition-colors"
                                             />
                                             {criteria.length > 1 && (
                                                 <button 
                                                     type="button" 
                                                     onClick={() => removeCriterion(idx)}
                                                     className="mt-1 p-1.5 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
                                                 >
                                                     <Trash2 size={14} />
                                                 </button>
                                             )}
                                         </div>
                                     ))}
                                 </div>
                                 <button
                                     type="button"
                                     onClick={addCriterion}
                                     className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-[#fa8029] hover:text-[#e56b1f] active:scale-95 transition-all"
                                 >
                                     <Plus size={14} /> Add Criterion
                                 </button>
                             </div>
                         )}
                     </form>
                </div>

                <div className="p-4 border-t border-[#f0f0f0] bg-[#fdfdfd] flex justify-end gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-[12px] font-bold text-[#555] bg-white border border-[#ddd] rounded-xl hover:bg-[#f7f7f7] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="issue-form"
                        type="submit"
                        disabled={isSubmitting || !title.trim()}
                        className="px-4 py-2 text-[12px] font-bold text-white bg-[#fa8029] rounded-xl shadow-sm hover:bg-[#e56b1f] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                    </button>
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

    return createPortal(modalContent, document.body);
}
