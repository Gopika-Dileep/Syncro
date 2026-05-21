import { useState } from "react";
import { X, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { createPortal } from "react-dom";

export interface Member {
    _id: string;
    name: string;
    designation?: string;
    email?: string;
}

interface MemberSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
    members: Member[];
    title: string;
    onAutoAssign?: () => Promise<void>;
}

export default function MemberSelectModal({ isOpen, onClose, onSelect, members, title, onAutoAssign }: MemberSelectModalProps) {
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-[24px] w-full max-w-sm shadow-2xl relative z-[3010] animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="p-6 border-b border-[#f0f0f0] flex items-center justify-between">
                    <h3 className="text-[16px] font-black text-[#1f2124]">{title}</h3>
                    <button onClick={onClose} className="p-2 rounded-xl text-[#aaa] hover:bg-[#f5f5f5] transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                    {onAutoAssign && (
                        <button
                            onClick={async () => {
                                setIsAutoAssigning(true);
                                try {
                                    await onAutoAssign();
                                    onClose();
                                } catch {
                                    // Caller handles errors/toast
                                } finally {
                                    setIsAutoAssigning(false);
                                }
                            }}
                            disabled={isAutoAssigning}
                            className="w-full flex items-center gap-4 p-4 mb-2 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-100/50 rounded-[20px] transition-all group active:scale-[0.98] disabled:opacity-50 text-left"
                        >
                            <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                                {isAutoAssigning ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Sparkles size={18} className="animate-pulse" />
                                )}
                            </div>
                            <div className="text-left flex-1">
                                <p className="text-[14px] font-extrabold text-purple-950 group-hover:text-purple-700 transition-colors leading-tight">
                                    Auto-Assign with AI
                                </p>
                                <p className="text-[11px] text-purple-600 font-bold uppercase tracking-wider mt-0.5">
                                    Matches skills & availability
                                </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 shrink-0">
                                <ArrowRight size={18} className="text-purple-600" />
                            </div>
                        </button>
                    )}

                    {members.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                                <X size={24} />
                            </div>
                            <p className="text-[13px] font-medium text-[#888]">No team members available</p>
                        </div>
                    ) : (
                        members.map(member => (
                            <button
                                key={member._id}
                                onClick={() => {
                                    onSelect(member._id);
                                    onClose();
                                }}
                                className="w-full flex items-center gap-4 p-4 hover:bg-[#fafafa] rounded-[20px] transition-all group active:scale-[0.98]"
                            >
                                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-[13px] font-black uppercase shadow-sm border border-orange-100/50">
                                    {member.name?.substring(0, 2) || '??'}
                                </div>
                                <div className="text-left flex-1">
                                    <p className="text-[14px] font-bold text-[#1f2124] group-hover:text-orange-600 transition-colors leading-tight">{member.name}</p>
                                    <p className="text-[11px] text-[#aaa] font-bold uppercase tracking-wider mt-0.5">{member.designation || 'Team Member'}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                    <ArrowRight size={18} className="text-orange-500" />
                                </div>
                            </button>
                        ))
                    )}
                </div>
                <div className="p-6 bg-[#fcfcfc] border-t border-[#f0f0f0]">
                    <button onClick={onClose} className="w-full py-3.5 text-[13px] font-bold text-[#555] bg-white border border-[#e5e7eb] rounded-2xl hover:bg-gray-50 active:scale-[0.98] transition-all">
                        Cancel
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
