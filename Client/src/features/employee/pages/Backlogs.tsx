import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FolderKanban, Layout, ChevronDown, ChevronUp, Plus, Edit2, Eye, CheckCircle, GripVertical, MoreHorizontal, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { usePermission } from "@/features/employee/hooks/usePermission";
import { getProjectsApi, type Project } from "@/features/employee/api/projectApi";
import {
    getUserStoriesByProjectApi,
    createUserStoryApi,
    updateUserStoryApi,
    deleteUserStoryApi,
    type UserStory
} from "@/features/employee/api/userStoryApi";
import UserStoryModal, { type StoryFormData as ModalStoryFormData } from "../components/UserStoryModal";
import UserStoryDetailsModal from "../components/UserStoryDetailsModal";

interface DropdownPos { top: number; right: number }

interface StoryMenuProps {
    pos: DropdownPos;
    onClose: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    canEdit: boolean;
    canDelete: boolean;
}

function StoryMenu({ pos, onClose, onView, onEdit, onDelete, canEdit, canDelete }: StoryMenuProps) {
    return createPortal(
        <>
            <div className="fixed inset-0 z-[999]" onClick={onClose} />
            <div
                className="fixed z-[1000] w-40 bg-white border border-[#ebebeb] rounded-xl shadow-lg py-1"
                style={{ top: pos.top, right: pos.right }}
            >
                <button
                    onClick={() => { onClose(); onView(); }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] text-[#555] hover:bg-[#f7f7f7] transition-colors"
                >
                    <Eye size={13} className="text-[#888]" /> View Details
                </button>
                {canEdit && (
                    <>
                        <div className="border-t border-[#f5f5f5] my-1" />
                        <button
                            onClick={() => { onClose(); onEdit(); }}
                            className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] text-[#555] hover:bg-[#f7f7f7] transition-colors"
                        >
                            <Edit2 size={13} className="text-[#888]" /> Edit Story
                        </button>
                    </>
                )}
                {canDelete && (
                    <>
                        <div className="border-t border-[#f5f5f5] my-1" />
                        <button
                            onClick={() => { onClose(); onDelete(); }}
                            className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                        >
                            <Trash2 size={13} /> Delete Story
                        </button>
                    </>
                )}
            </div>
        </>,
        document.body
    );
}

export default function Backlogs() {
    const { can } = usePermission();

    const [projects, setProjects] = useState<Project[]>([]);
    const [fetchingProjects, setFetchingProjects] = useState(true);

    // key: projectId, value: array of stories
    const [storiesConfig, setStoriesConfig] = useState<Record<string, { data: UserStory[], loading: boolean }>>({});
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

    // Modals state
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);

    // Selected states
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Confirmation states
    const [storyToMarkReady, setStoryToMarkReady] = useState<UserStory | null>(null);
    const [storyToDelete, setStoryToDelete] = useState<UserStory | null>(null);

    // Dropdown state
    const [openMenuStoryId, setOpenMenuStoryId] = useState<string | null>(null);
    const [dropPos, setDropPos] = useState<DropdownPos>({ top: 0, right: 0 });
    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setFetchingProjects(true);
        try {
            const res = await getProjectsApi();
            setProjects(res.data || []);
        } catch (err: unknown) {
            toast.error("Failed to fetch projects");
            console.error(err);
        } finally {
            setFetchingProjects(false);
        }
    };

    const fetchStoriesForProject = async (projectId: string) => {
        setStoriesConfig(prev => ({ ...prev, [projectId]: { data: prev[projectId]?.data || [], loading: true } }));
        try {
            const res = await getUserStoriesByProjectApi(projectId);
            setStoriesConfig(prev => ({ ...prev, [projectId]: { data: res.data || [], loading: false } }));
        } catch {
            toast.error("Failed to load user stories");
            setStoriesConfig(prev => ({ ...prev, [projectId]: { data: [], loading: false } }));
        }
    };

    const toggleProject = (projectId: string) => {
        if (expandedProjectId === projectId) {
            setExpandedProjectId(null);
        } else {
            setExpandedProjectId(projectId);
            if (!storiesConfig[projectId]) {
                fetchStoriesForProject(projectId);
            }
        }
    };

    const handleOpenCreateModal = (projectId: string) => {
        setSelectedProjectId(projectId);
        setIsEditing(false);
        setSelectedStory(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (story: UserStory) => {
        setSelectedProjectId(story.project_id);
        setIsEditing(true);
        setSelectedStory(story);
        setFormModalOpen(true);
    };

    const handleOpenDetails = (story: UserStory) => {
        setSelectedStory(story);
        setDetailsModalOpen(true);
    };

    const openMenu = (storyId: string) => {
        const btn = btnRefs.current[storyId];
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        setDropPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        setOpenMenuStoryId(storyId);
    };

    const confirmMarkReady = async () => {
        if (!storyToMarkReady) return;
        try {
            await updateUserStoryApi(storyToMarkReady._id, { status: "ready" });
            toast.success("Story marked as ready!");
            setStoriesConfig(prev => {
                const pData = prev[storyToMarkReady.project_id].data.map(s => s._id === storyToMarkReady._id ? { ...s, status: "ready" } : s);
                return { ...prev, [storyToMarkReady.project_id]: { ...prev[storyToMarkReady.project_id], data: pData } };
            });
        } catch {
            toast.error("Failed to update status");
        } finally {
            setStoryToMarkReady(null);
        }
    };

    const confirmDeleteStory = async () => {
        if (!storyToDelete) return;
        try {
            await deleteUserStoryApi(storyToDelete._id);
            toast.success("User story deleted successfully.");
            fetchStoriesForProject(storyToDelete.project_id);
        } catch {
            toast.error("Failed to delete user story");
        } finally {
            setStoryToDelete(null);
        }
    };

    const handleFormSubmit = async (data: ModalStoryFormData) => {
        if (!selectedProjectId) return;
        setIsSubmitting(true);
        try {
            if (isEditing && selectedStory) {
                await updateUserStoryApi(selectedStory._id, data);
                toast.success("User story updated successfully");
            } else {
                await createUserStoryApi({ ...data, project_id: selectedProjectId });
                toast.success("User story created successfully");
            }
            setFormModalOpen(false);
            fetchStoriesForProject(selectedProjectId);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            toast.error(e.response?.data?.message || "Failed to save user story");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'ready': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'in sprint': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const renderStories = (projectId: string) => {
        const config = storiesConfig[projectId];
        if (!config) return null;

        if (config.loading) {
            return (
                <div className="p-8 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#fa8029] border-t-transparent rounded-full animate-spin" />
                </div>
            );
        }

        if (config.data.length === 0) {
            return (
                <div className="p-8 text-center text-[#888]">
                    <p className="text-[13px]">No user stories found for this project.</p>
                </div>
            );
        }

        const canEditStory = can('userStory:update') || can('userStory:update:all');
        const canDeleteStory = can('userStory:delete') || can('userStory:delete:all');

        return (
            <div className="p-3 bg-[#fdfdfd] border-t border-[#f0f0f0]">
                <div className="space-y-2">
                    {config.data.map((story) => (
                        <div key={story._id} className="flex items-center justify-between p-3 bg-white border border-[#eaeaea] rounded-xl hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-3">
                                <GripVertical size={16} className="text-[#ddd] cursor-move" />
                                <div>
                                    <h4 className="text-[13px] font-bold text-[#1f2124]">{story.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-[1px] rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(story.status)}`}>
                                            {story.status}
                                        </span>
                                        <span className="text-[10px] uppercase font-bold text-[#888] bg-[#f5f5f5] px-1.5 py-0.5 rounded">
                                            {story.story_points} points
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {story.status.toLowerCase() === 'new' && canEditStory && (
                                    <button
                                        onClick={() => setStoryToMarkReady(story)}
                                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <CheckCircle size={12} /> Mark Ready
                                    </button>
                                )}
                                <div className="relative">
                                    <button
                                        ref={(el) => { btnRefs.current[story._id] = el; }}
                                        onClick={() => openMenu(story._id)}
                                        className="p-1.5 text-[#bbb] hover:bg-[#f0f0f0] hover:text-[#555] rounded-lg transition-colors"
                                    >
                                        <MoreHorizontal size={15} />
                                    </button>

                                    {openMenuStoryId === story._id && (
                                        <StoryMenu
                                            pos={dropPos}
                                            onClose={() => setOpenMenuStoryId(null)}
                                            onView={() => handleOpenDetails(story)}
                                            onEdit={() => handleOpenEditModal(story)}
                                            onDelete={() => setStoryToDelete(story)}
                                            canEdit={canEditStory}
                                            canDelete={canDeleteStory}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#fdfdfd]">
            <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0f0f0] bg-white shrink-0">
                <div>
                    <h1 className="text-[20px] font-black text-[#1f2124] tracking-tight">Project Backlogs</h1>
                    <p className="text-[12px] text-[#888] mt-1 font-medium">Manage and refine user stories across your projects</p>
                </div>
            </div>

            <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                {fetchingProjects ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-6 h-6 border-2 border-[#fa8029] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-[#f7f7f7] rounded-full flex items-center justify-center text-[#ddd] mb-4">
                            <FolderKanban size={24} />
                        </div>
                        <h3 className="text-[14px] font-bold text-[#333]">No Projects Available</h3>
                        <p className="text-[12px] text-[#888] mt-1 max-w-sm">You need active projects to start creating user stories in the backlog.</p>
                    </div>
                ) : (
                    <div className="max-w-full mx-auto space-y-4">
                        {projects.map(project => {
                            const isExpanded = expandedProjectId === project._id;
                            return (
                                <div key={project._id} className="bg-white border border-[#ebebeb] rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                                    <div
                                        onClick={() => toggleProject(project._id)}
                                        className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#fafafa] transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#f9f9f9] border border-[#f0f0f0] flex items-center justify-center text-[#fa8029]">
                                                <Layout size={14} />
                                            </div>
                                            <div>
                                                <h3 className="text-[14px] font-bold text-[#1f2124]">{project.name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[11px] text-[#888] line-clamp-1">{project.description}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {can('userStory:create') && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenCreateModal(project._id); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-[#fff5ef] text-[#fa8029] hover:bg-[#fa8029] hover:text-white rounded-lg transition-all"
                                                >
                                                    <Plus size={12} /> Add Story
                                                </button>
                                            )}
                                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f0f0f0] text-[#888]">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                        <div className="overflow-hidden">
                                            {renderStories(project._id)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* View/Edit Modals */}
            <UserStoryModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedStory as ModalStoryFormData}
                isEditing={isEditing}
                isSubmitting={isSubmitting}
            />

            <UserStoryDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                story={selectedStory}
            />

            {/* Confirmation Modal - Mark Ready */}
            {storyToMarkReady && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-emerald-500" size={24} />
                            </div>
                            <h3 className="text-[16px] font-bold text-[#1f2124] mb-2">Mark as Ready</h3>
                            <p className="text-[13px] text-[#888] leading-relaxed">
                                Are you sure you want to change the status of <span className="font-bold text-[#555]">'{storyToMarkReady.title}'</span> to <span className="font-bold text-emerald-600">Ready</span>?
                            </p>
                        </div>
                        <div className="flex gap-2 p-4 pt-0">
                            <button
                                onClick={() => setStoryToMarkReady(null)}
                                className="flex-1 py-2.5 border border-[#ebebeb] rounded-lg text-[12px] font-semibold text-[#555] hover:bg-[#f7f7f7] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmMarkReady}
                                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[12px] font-semibold transition-all active:scale-95"
                            >
                                Confirm Ready
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal - Delete Story */}
            {storyToDelete && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-[16px] font-bold text-[#1f2124] mb-2">Delete Story</h3>
                            <p className="text-[13px] text-[#888] leading-relaxed">
                                Are you sure you want to permanently delete <span className="font-bold text-[#555]">'{storyToDelete.title}'</span>? <br />This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-2 p-4 pt-0">
                            <button
                                onClick={() => setStoryToDelete(null)}
                                className="flex-1 py-2.5 border border-[#ebebeb] rounded-lg text-[12px] font-semibold text-[#555] hover:bg-[#f7f7f7] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteStory}
                                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[12px] font-semibold transition-all active:scale-95"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}