import { useState, useEffect } from "react";
import { X, Sparkles, ChevronDown, Check, Loader2 } from "lucide-react";
import { getTeamDirectoryApi, type TeamMember } from "../api/teamApi";
import { toast } from "sonner";

interface AssignSubTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (memberId: string) => Promise<void>;
    subTaskTitle: string;
    teamId?: string;
}

export default function AssignSubTaskModal({ isOpen, onClose, onAssign, subTaskTitle, teamId }: AssignSubTaskModalProps) {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
            setSelectedMember(null);
            setIsDropdownOpen(false);
        }
    }, [isOpen]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await getTeamDirectoryApi();
            if (response.success) {
                // If teamId is provided, only show members of that team
                if (teamId) {
                    const team = response.data.find(t => t._id === teamId);
                    setMembers(team ? team.members : []);
                } else {
                    // Otherwise show all members from all teams (flattened)
                    const allMembers = response.data.flatMap(t => t.members);
                    // Remove duplicates
                    const uniqueMembers = Array.from(new Map(allMembers.map(m => [m._id, m])).values());
                    setMembers(uniqueMembers);
                }
            }
        } catch {
            toast.error("Failed to load team members");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedMember) return;
        setIsSubmitting(true);
        try {
            await onAssign(selectedMember);
            onClose();
        } catch {
            toast.error("Failed to assign sub-task");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const selectedMemberData = members.find(m => m._id === selectedMember);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] font-sans">
            <div className="bg-white rounded-3xl w-full max-w-[360px] overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-50">
                    <h3 className="text-[15px] font-bold text-[#1f2124]">Assignee</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-5">
                    <p className="text-[11px] text-gray-400 mb-4 px-1">
                        Select a team member to handle <span className="text-[#1f2124] font-bold">"{subTaskTitle}"</span>
                    </p>

                    {/* Custom Dropdown */}
                    <div className="relative mb-5">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            disabled={loading}
                            className={`w-full flex items-center justify-between px-4 py-3 bg-[#f9f9f9] border border-gray-100 rounded-2xl text-[13px] transition-all hover:bg-white hover:border-gray-200 group ${isDropdownOpen ? 'ring-2 ring-[#fa8029]/10 border-[#fa8029]/30 bg-white' : ''}`}
                        >
                            <span className={selectedMemberData ? 'text-[#1f2124] font-medium' : 'text-gray-400'}>
                                {loading ? (
                                    <span className="flex items-center gap-2 italic"><Loader2 size={12} className="animate-spin" /> Loading members...</span>
                                ) : (
                                    selectedMemberData?.name || "Select assignee"
                                )}
                            </span>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && !loading && (
                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl z-10 max-h-[200px] overflow-y-auto custom-scrollbar p-1.5 animate-in slide-in-from-top-2 duration-200">
                                {members.length > 0 ? (
                                    members.map(member => (
                                        <button
                                            key={member._id}
                                            onClick={() => {
                                                setSelectedMember(member._id);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[12px] transition-all ${selectedMember === member._id ? 'bg-orange-50 text-[#fa8029] font-bold' : 'text-[#555] hover:bg-gray-50'}`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-6 h-6 rounded-full bg-[#fa8029] text-white flex items-center justify-center text-[10px] font-black uppercase">
                                                    {member.name[0]}
                                                </div>
                                                <div className="text-left">
                                                    <p className="leading-none">{member.name}</p>
                                                    <p className="text-[9px] text-gray-400 mt-0.5 font-medium">{member.designation || 'Team Member'}</p>
                                                </div>
                                            </div>
                                            {selectedMember === member._id && <Check size={12} />}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-[11px] text-gray-400 py-3 text-center italic">No team members found</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* AI Tag - Visual Only */}
                    <div className="flex items-center gap-2 mb-6 px-1">
                        <Sparkles size={12} className="text-[#a855f7]" />
                        <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                            AI assignment based on skills & availability
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2.5">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-100 text-gray-500 text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={!selectedMember || isSubmitting}
                            className="flex-1 py-2.5 bg-[#fa8029] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-orange-900/10 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:shadow-none active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 size={12} className="animate-spin" /> : "Assign"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
