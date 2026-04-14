import { X, Flag, Hash, Calendar, CheckCircle2 } from "lucide-react";
import { createPortal } from "react-dom";
import { type UserStory } from "../api/userStoryApi";

interface UserStoryDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    story: UserStory | null;
}

export default function UserStoryDetailsModal({ isOpen, onClose, story }: UserStoryDetailsModalProps) {
    if (!isOpen || !story) return null;

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'ready': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'in sprint': return 'bg-purple-50 text-purple-600 border-purple-100';
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

    const modalContent = (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative z-[1060] flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
                <div className="flex items-start justify-between p-6 border-b border-[#f0f0f0]">
                    <div className="pr-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(story.status)}`}>
                                {story.status}
                            </span>
                            <span className="text-[11px] text-[#888] flex items-center gap-1">
                                <Calendar size={12} /> {new Date(story.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <h2 className="text-[20px] font-black text-[#1f2124] leading-tight">
                            {story.title}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-[#f9f9f9] rounded-xl text-[#aaa] hover:bg-[#f0f0f0] hover:text-[#555] transition-all shrink-0">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="flex gap-4 mb-8">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${getPriorityStyle(story.priority)}`}>
                            <Flag size={14} />
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold opacity-60 leading-none">Priority</span>
                                <span className="text-[12px] font-bold">{story.priority}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#ebebeb] bg-[#fcfcfc] text-[#555]">
                            <Hash size={14} className="text-[#888]" />
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-[#888] leading-none">Story Points</span>
                                <span className="text-[12px] font-bold">{story.story_points}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[13px] font-bold text-[#333] mb-3 uppercase tracking-wider flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-[#fa8029]" />
                            Acceptance Criteria
                        </h3>
                        {story.criteria && story.criteria.length > 0 ? (
                            <ul className="space-y-2 lg:pl-6 pl-2">
                                {story.criteria.map((crit, idx) => (
                                    <li key={idx} className="text-[13px] text-[#555] leading-relaxed flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#fa8029] shrink-0 mt-2" />
                                        <span>{crit}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-[13px] text-[#888] italic">No criteria specified.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
