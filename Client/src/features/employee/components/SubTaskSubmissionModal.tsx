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
    const [errors, setErrors] = useState<{ description?: string; link?: string }>({});

    React.useEffect(() => {
        if (isOpen) {
            setDescription("");
            setBranchName("");
            setLink("");
            setMentions([]);
            setErrors({});
        }
    }, [isOpen]);

    const validate = () => {
        const newErrors: { description?: string; link?: string } = {};

        if (!description.trim()) {
            newErrors.description = "Description of what you implemented is required";
        }

        if (link.trim()) {
            try {
                const parsed = new URL(link.trim());
                if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
                    newErrors.link = "Link must start with http:// or https://";
                }
            } catch {
                newErrors.link = "Please enter a valid URL (e.g., https://github.com/...)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDescriptionChange = (text: string, m: string[]) => {
        setDescription(text);
        setMentions(m);
        if (errors.description) {
            setErrors(prev => ({ ...prev, description: undefined }));
        }
    };

    const handleLinkChange = (val: string) => {
        setLink(val);
        if (errors.link) {
            setErrors(prev => ({ ...prev, link: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit({ 
                description: description.trim(), 
                branch_name: branchName.trim(), 
                submission_link: link.trim(),
                mentions: mentions
            });
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
            <div className="bg-white rounded-[24px] w-full max-w-lg shadow-2xl relative z-[3010] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden border border-gray-100/50">
                <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-[18px] font-black text-[#1f2124]">Submit Your Work</h2>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{subTaskTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    <form id="submission-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-[#aaa] uppercase tracking-[0.1em] mb-2">What did you implement? *</label>
                            <MentionTextArea
                                value={description}
                                onChange={handleDescriptionChange}
                                placeholder="Describe what you've implemented... (Type @ to mention)"
                                users={members}
                                className={`bg-gray-50/50 border-gray-200/60 text-[#1f2124] min-h-[110px] rounded-xl focus:border-[#fa8029]/50 ${
                                    errors.description ? "border-rose-500/50 focus:border-rose-500" : ""
                                }`}
                            />
                            {errors.description && (
                                <p className="text-rose-500 text-[10px] mt-1.5 font-bold px-1">{errors.description}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-[#aaa] uppercase tracking-[0.1em] mb-2">Branch Name</label>
                                <input
                                    type="text"
                                    value={branchName}
                                    onChange={(e) => setBranchName(e.target.value)}
                                    className="w-full px-4 py-3 text-[13px] bg-gray-50/50 border border-gray-200/60 rounded-xl outline-none focus:border-[#fa8029] transition-all placeholder:text-gray-400 text-[#1f2124] font-medium"
                                    placeholder="feature/task-1-desc"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[#aaa] uppercase tracking-[0.1em] mb-2">Link</label>
                                <input
                                    type="text"
                                    value={link}
                                    onChange={(e) => handleLinkChange(e.target.value)}
                                    className={`w-full px-4 py-3 text-[13px] bg-gray-50/50 border rounded-xl outline-none focus:border-[#fa8029] transition-all placeholder:text-gray-400 text-[#1f2124] font-medium ${
                                        errors.link ? "border-rose-500/50 focus:border-rose-500" : "border-gray-200/60"
                                    }`}
                                    placeholder="https://github.com/..."
                                />
                                {errors.link && (
                                    <p className="text-rose-500 text-[10px] mt-1.5 font-bold px-1">{errors.link}</p>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 bg-gray-50/30 border-t border-gray-100/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-[13px] font-bold text-[#555] bg-white border border-[#e5e7eb] rounded-xl hover:bg-[#f9fafb] active:scale-[0.98] transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        form="submission-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2.5 text-[13px] font-bold text-white bg-[#fa8029] hover:bg-[#e56b1f] shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all rounded-xl disabled:opacity-50"
                    >
                        {isSubmitting ? "Submitting..." : <><Send size={14} /> Submit for Review</>}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
