import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { createPortal } from "react-dom";

export interface StoryFormData {
    title: string;
    criteria: string[];
    story_points: number;
    priority: string;
    status?: string;
}

interface UserStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: StoryFormData) => void;
    initialData?: StoryFormData;
    isEditing?: boolean;
    isSubmitting?: boolean;
}

export default function UserStoryModal({ isOpen, onClose, onSubmit, initialData, isEditing = false, isSubmitting = false }: UserStoryModalProps) {
    const [title, setTitle] = useState("");
    const [points, setPoints] = useState<number>(1);
    const [priority, setPriority] = useState("Medium");
    const [criteria, setCriteria] = useState<string[]>([""]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setPoints(initialData.story_points);
                setPriority(initialData.priority);
                setCriteria(initialData.criteria?.length ? initialData.criteria : [""]);
            } else {
                setTitle("");
                setPoints(1);
                setPriority("Medium");
                setCriteria([""]);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validCriteria = criteria.filter(c => c.trim().length > 0);
        onSubmit({ 
            title, 
            story_points: points, 
            priority, 
            criteria: validCriteria.length ? validCriteria : ["Standard acceptance criteria met"],
            status: isEditing && initialData?.status ? initialData.status : "new"
        });
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
                        {isEditing ? "Edit User Story" : "Create User Story"}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-[#aaa] hover:bg-[#f5f5f5] hover:text-[#555] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                    <form id="story-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[12px] font-bold text-[#555] mb-1.5">Story Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] focus:ring-1 focus:ring-[#fa8029] transition-all"
                                placeholder="E.g., As a user, I want to..."
                            />
                        </div>

                        <div className="flex gap-4">
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
                        form="story-form"
                        type="submit"
                        disabled={isSubmitting || !title.trim()}
                        className="px-4 py-2 text-[12px] font-bold text-white bg-[#fa8029] rounded-xl shadow-sm hover:bg-[#e56b1f] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Story"}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
