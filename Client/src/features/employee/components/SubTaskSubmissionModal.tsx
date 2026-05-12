import React, { useState } from "react";
import { X, Send } from "lucide-react";
import { createPortal } from "react-dom";
import MentionTextArea from "@/features/shared/components/MentionTextArea";

interface SubTaskSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { description: string; branch_name: string; submission_link: string; mentions?: string[] }) => void;
    isSubmitting?: boolean;
    subTaskTitle: string;
    members?: { _id: string; name: string; designation?: string }[];
}

export default function SubTaskSubmissionModal({ isOpen, onClose, onSubmit, isSubmitting = false, subTaskTitle, members = [] }: SubTaskSubmissionModalProps) {
    const [description, setDescription] = useState("");
    const [branchName, setBranchName] = useState("");
    const [link, setLink] = useState("");
    const [mentions, setMentions] = useState<string[]>([]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ 
            description, 
            branch_name: branchName, 
            submission_link: link,
            mentions: mentions
        });
    };

    const modalContent = (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-[#1a1c1e] text-white rounded-2xl w-full max-w-lg shadow-2xl relative z-[1060] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden border border-white/10">
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <div>
                        <h2 className="text-[18px] font-bold">Submit Your Work</h2>
                        <p className="text-[12px] text-white/50 mt-0.5">{subTaskTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-white/40 hover:bg-white/5 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <form id="submission-form" onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[12px] font-bold text-white/60 mb-2 uppercase tracking-wider">What did you implement? *</label>
                            <MentionTextArea
                                value={description}
                                onChange={(text, m) => {
                                    setDescription(text);
                                    setMentions(m);
                                }}
                                placeholder="Describe what you've implemented... (Type @ to mention)"
                                users={members}
                                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[12px] font-bold text-white/60 mb-2 uppercase tracking-wider">Branch Name</label>
                                <input
                                    type="text"
                                    value={branchName}
                                    onChange={(e) => setBranchName(e.target.value)}
                                    className="w-full px-4 py-3 text-[14px] bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#fa8029] transition-all placeholder:text-white/20"
                                    placeholder="feature/task-1-desc"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-white/60 mb-2 uppercase tracking-wider">Link</label>
                                <input
                                    type="url"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="w-full px-4 py-3 text-[14px] bg-white/5 border border-white/10 rounded-xl outline-none focus:border-[#fa8029] transition-all placeholder:text-white/20"
                                    placeholder="https://github.com/..."
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-[13px] font-bold text-white/60 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        form="submission-form"
                        type="submit"
                        disabled={isSubmitting || !description.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-bold text-white bg-[#fa8029] rounded-xl shadow-lg shadow-orange-950/20 hover:bg-[#e56b1f] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Submitting..." : <><Send size={16} /> Submit for Review</>}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
