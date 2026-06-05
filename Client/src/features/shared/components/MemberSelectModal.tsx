import { useState, useEffect, useRef } from "react";
import { X, Bot, Loader2, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

export interface Member {
    _id: string;
    name: string;
    designation?: string;
    email?: string;
    teamName?: string;
}

interface MemberSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
    members: Member[];
    title: string;
    description?: string;
    onAutoAssign?: () => Promise<void>;
}

export default function MemberSelectModal({ isOpen, onClose, onSelect, members, title, description, onAutoAssign }: MemberSelectModalProps) {
    const [selectedId, setSelectedId] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAutoAssigning, setIsAutoAssigning] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedId("");
            setIsDropdownOpen(false);
        }
    }, [isOpen]);

    // Close dropdown on clicking outside
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

    const selectedMember = members.find(m => m._id === selectedId);

    return createPortal(
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-[#f7f7f7] rounded-[24px] w-full max-w-sm shadow-2xl relative z-[3010] animate-in fade-in zoom-in duration-200 overflow-visible border border-gray-100">
                
                {/* Header */}
                <div className="p-6 pb-2 flex items-start justify-between">
                    <div className="flex-1 pr-4">
                        <h3 className="text-[18px] font-black text-[#1f2124] tracking-tight">{title}</h3>
                        {description && (
                            <p className="text-[13px] text-[#737373] mt-1 font-semibold leading-snug break-words">
                                {description}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg text-[#aaa] hover:bg-gray-200/50 hover:text-[#555] transition-colors shrink-0">
                        <X size={16} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 pt-4">
                    <label className="block text-[12px] font-black text-[#737373] uppercase tracking-wider mb-2">
                        Select Assignee
                    </label>

                    <div className="flex items-center gap-2 relative overflow-visible">
                        {/* Custom Dropdown */}
                        <div className="flex-1 relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full h-12 px-4 bg-white border-2 border-[#fa8029] rounded-[20px] text-[14px] text-[#1f2124] font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                            >
                                <span className="truncate">
                                     {selectedMember 
                                         ? (() => {
                                               const teamStr = selectedMember.teamName ? ` - ${selectedMember.teamName}` : "";
                                               const roleStr = selectedMember.designation ? `${selectedMember.designation}${teamStr}` : selectedMember.teamName || "";
                                               return roleStr ? `${selectedMember.name} (${roleStr})` : selectedMember.name;
                                           })()
                                         : "Select member"
                                     }
                                </span>
                                <ChevronDown size={18} className="text-[#fa8029] shrink-0" />
                            </button>

                            {/* Dropdown Options List */}
                            {isDropdownOpen && (
                                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#fa8029]/20 rounded-[20px] shadow-xl max-h-[220px] overflow-y-auto z-[3100] py-1.5 animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedId("");
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-[#737373] hover:bg-orange-50 hover:text-[#fa8029] transition-colors cursor-pointer"
                                    >
                                        Select member
                                    </button>
                                    {members.map(member => (
                                        <button
                                            key={member._id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedId(member._id);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-[13px] font-bold transition-colors cursor-pointer ${
                                                selectedId === member._id 
                                                    ? 'bg-[#fa8029] text-white' 
                                                    : 'text-[#1f2124] hover:bg-orange-50 hover:text-[#fa8029]'
                                            }`}
                                        >
                                             {(() => {
                                                 const teamStr = member.teamName ? ` - ${member.teamName}` : "";
                                                 const roleStr = member.designation ? `${member.designation}${teamStr}` : member.teamName || "";
                                                 return roleStr ? `${member.name} (${roleStr})` : member.name;
                                             })()}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* AI Auto Assign Button */}
                        {onAutoAssign && (
                            <button
                                type="button"
                                onClick={async () => {
                                    setIsAutoAssigning(true);
                                    try {
                                        await onAutoAssign();
                                        onClose();
                                    } catch (err) {
                                        console.error("Auto assign failed", err);
                                    } finally {
                                        setIsAutoAssigning(false);
                                    }
                                }}
                                disabled={isAutoAssigning}
                                title="Auto-assign using AI"
                                className="w-12 h-12 flex items-center justify-center bg-white hover:bg-purple-50 border border-[#e5e5e5] hover:border-purple-200 rounded-[20px] text-purple-600 transition-all active:scale-[0.96] disabled:opacity-50 shrink-0 cursor-pointer"
                            >
                                {isAutoAssigning ? (
                                    <Loader2 size={20} className="animate-spin text-purple-600" />
                                ) : (
                                    <Bot size={20} />
                                )}
                            </button>
                        )}
                    </div>

                    {/* Bottom Buttons */}
                    <div className="flex justify-end gap-2.5 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 h-11 text-[13px] font-bold text-[#555] bg-white border border-[#e5e5e5] rounded-[16px] hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (selectedId) {
                                    onSelect(selectedId);
                                    onClose();
                                }
                            }}
                            disabled={!selectedId}
                            className="px-6 h-11 text-[13px] font-bold text-white bg-[#fa8029] hover:bg-[#e56b1f] disabled:opacity-50 disabled:cursor-not-allowed rounded-[16px] active:scale-[0.98] transition-all cursor-pointer shadow-sm shadow-orange-500/10"
                        >
                            Assign
                        </button>
                    </div>

                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #fa8029/30; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fa8029/50; }
            `}</style>
        </div>,
        document.body
    );
}
