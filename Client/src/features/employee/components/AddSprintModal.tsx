/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import { X, Calendar, Flag, Target } from "lucide-react";
import { createPortal } from "react-dom";
import { type SprintFormData, type Sprint } from "../api/sprintApi";
import { getProjectsApi, type Project } from "../api/projectApi";

interface AddSprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SprintFormData) => Promise<void> | void;
    isSubmitting?: boolean;
    initialData?: Sprint | null;
}

export default function AddSprintModal({ isOpen, onClose, onSubmit, isSubmitting = false, initialData = null }: AddSprintModalProps) {
    const [name, setName] = useState("");
    const [projectId, setProjectId] = useState("");
    const [sprintNumber, setSprintNumber] = useState<number>(1);
    const [goal, setGoal] = useState("");
    const [totalPoints, setTotalPoints] = useState<number>(40);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectsLoading, setProjectsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
            try {
                if (initialData) {
                    setName(initialData.name || "");
                    setProjectId(initialData.project_id || "");
                    setSprintNumber(initialData.sprint_number || 1);
                    setGoal(initialData.goal || "");
                    setTotalPoints(initialData.total_points || 0);
                    
                    if (initialData.start_date) {
                        setStartDate(new Date(initialData.start_date).toISOString().split('T')[0]);
                    }
                    if (initialData.end_date) {
                        setEndDate(new Date(initialData.end_date).toISOString().split('T')[0]);
                    }
                } else {
                    setName("");
                    setProjectId("");
                    setSprintNumber(1);
                    setGoal("");
                    setTotalPoints(40);
                    setStartDate("");
                    setEndDate("");
                }
            } catch (err) {
                console.error("Error hydrating sprint modal:", err);
            }
        }
    }, [isOpen, initialData]);

    const fetchProjects = async () => {
        setProjectsLoading(true);
        try {
            const res = await getProjectsApi();
            setProjects(res.data || []);
            // Set first project as default if creating new
            if (!initialData && res.data && res.data.length > 0) {
                setProjectId(res.data[0]._id);
            }
        } catch (err) {
            console.error("Failed to fetch projects");
        } finally {
            setProjectsLoading(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload: SprintFormData = {
            project_id: projectId,
            name: name.trim(),
            sprint_number: Number(sprintNumber),
            goal: goal.trim(),
            total_points: Number(totalPoints),
            start_date: startDate,
            end_date: endDate,
        };

        try {
            await onSubmit(payload);
        } catch (err) {
            console.error("Submit handler failed:", err);
        }
    };

    const isFormValid = name.trim().length >= 2 && goal.trim().length >= 2 && projectId && startDate && endDate;

    return createPortal(
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-[1060] flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#fff5ef] flex items-center justify-center text-[#fa8029]">
                            <Flag size={14} />
                        </div>
                        <h2 className="text-[16px] font-bold text-[#1f2124]">
                            {initialData ? "Edit Sprint" : "Create New Sprint"}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-[#aaa] hover:bg-[#f5f5f5] hover:text-[#555] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
                    <form id="sprint-form" onSubmit={handleSubmit} className="space-y-4">


                        <div className="flex gap-4">
                            <div className="flex-[3]">
                                <label className="block text-[12px] font-bold text-[#555] mb-1.5">Sprint Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] transition-all"
                                    placeholder="E.g., Core API Development"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[12px] font-bold text-[#555] mb-1.5">No.</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={sprintNumber}
                                    onChange={(e) => setSprintNumber(Number(e.target.value))}
                                    className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-bold text-[#555] mb-1.5">Sprint Goal</label>
                            <textarea
                                required
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                rows={2}
                                className="w-full px-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] transition-all resize-none"
                                placeholder="What do we want to achieve?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[12px] font-bold text-[#555] mb-1.5">Start Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-10 pr-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] transition-all"
                                    />
                                    <Calendar className="absolute left-3.5 top-3 text-[#aaa]" size={14} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-[#555] mb-1.5">End Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-10 pr-3.5 py-2.5 text-[13px] bg-white border border-[#e5e5e5] rounded-xl outline-none focus:border-[#fa8029] transition-all"
                                    />
                                    <Calendar className="absolute left-3.5 top-3 text-[#aaa]" size={14} />
                                </div>
                            </div>
                        </div>

                        <div className="w-full pt-1">
                            <label className="block text-[12px] font-bold text-[#555] mb-1.5 flex items-center gap-1.5">
                                <Target size={12} className="text-[#fa8029]" /> Capacity Target (Points)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={totalPoints}
                                    onChange={(e) => setTotalPoints(Number(e.target.value))}
                                    className="w-full pr-10 pl-3.5 py-2.5 text-[13px] bg-[#f9fafb] border border-[#e5e5e5] rounded-xl outline-none focus:bg-white focus:border-[#fa8029] transition-all font-bold"
                                />
                                <span className="absolute right-3.5 top-3 text-[10px] font-black text-[#aaa] uppercase">Pts</span>
                            </div>
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
                        form="sprint-form"
                        type="submit"
                        disabled={isSubmitting || !isFormValid}
                        className="px-4 py-2 text-[12px] font-bold text-white bg-[#fa8029] rounded-xl shadow-sm hover:bg-[#e56b1f] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Saving..." : initialData ? "Update Sprint" : "Create Sprint"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
