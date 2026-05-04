import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FolderKanban, Layout, ChevronDown, ChevronUp, Plus, Edit2, Eye, CheckCircle, GripVertical, MoreHorizontal, Trash2, AlertCircle, Bug, BookOpen, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { usePermission } from "@/features/employee/hooks/usePermission";
import { getProjectsApi, type Project } from "@/features/employee/api/projectApi";
import { getIssuesByProjectApi, createIssueApi, updateIssueApi, deleteIssueApi, type Issue } from "@/features/employee/api/issueApi";
import IssueModal, { type IssueFormData as ModalIssueFormData } from "../components/IssueModal";
import IssueDetailsModal from "../components/IssueDetailsModal";

const TypeIcon = ({ type, size = 12 }: { type: string; size?: number }) => {
    switch (type?.toLowerCase()) {
        case 'bug': return <Bug size={size} className="text-rose-500" />;
        case 'story': return <BookOpen size={size} className="text-emerald-500" />;
        default: return <CheckSquare size={size} className="text-blue-500" />;
    }
};

interface DropdownPos { top: number; right: number }

interface IssueMenuProps {
    pos: DropdownPos;
    onClose: () => void;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
    canEdit: boolean;
    canDelete: boolean;
}

function IssueMenu({ pos, onClose, onView, onEdit, onDelete, canEdit, canDelete }: IssueMenuProps) {
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
                            <Edit2 size={13} className="text-[#888]" /> Edit Issue
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
                            <Trash2 size={13} /> Delete Issue
                        </button>
                    </>
                )}
            </div>
        </>,
        document.body
    );
}

export default function Backlogs() {
    const { can, user } = usePermission();

    const [projects, setProjects] = useState<Project[]>([]);
    const [fetchingProjects, setFetchingProjects] = useState(true);
    const [members, setMembers] = useState<{ _id: string; name: string; designation?: string }[]>([]);

    // key: projectId, value: array of issues
    const [issuesConfig, setIssuesConfig] = useState<Record<string, { data: Issue[], loading: boolean }>>({});
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

    // Modals state
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);

    // Selected states
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Confirmation states
    const [issueToMarkReady, setIssueToMarkReady] = useState<Issue | null>(null);
    const [issueToDelete, setIssueToDelete] = useState<Issue | null>(null);

    // Dropdown state
    const [openMenuIssueId, setOpenMenuIssueId] = useState<string | null>(null);
    const [dropPos, setDropPos] = useState<DropdownPos>({ top: 0, right: 0 });
    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    useEffect(() => {
        fetchProjects();
        fetchMembers();
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

    const fetchMembers = async () => {
        try {
            const { getTeamDirectoryApi } = await import("../api/teamApi");
            const res = await getTeamDirectoryApi();
            const allMembers = res.data.flatMap(t => t.members);
            const unique = allMembers.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i);
            setMembers(unique);
        } catch (err) {
            console.error("Failed to fetch members", err);
        }
    };

    const fetchIssuesForProject = async (projectId: string) => {
        setIssuesConfig(prev => ({ ...prev, [projectId]: { data: prev[projectId]?.data || [], loading: true } }));
        try {
            const res = await getIssuesByProjectApi(projectId);
            setIssuesConfig(prev => ({ ...prev, [projectId]: { data: res.data || [], loading: false } }));
        } catch {
            toast.error("Failed to load issues");
            setIssuesConfig(prev => ({ ...prev, [projectId]: { data: [], loading: false } }));
        }
    };

    const toggleProject = (projectId: string) => {
        if (expandedProjectId === projectId) {
            setExpandedProjectId(null);
        } else {
            setExpandedProjectId(projectId);
            if (!issuesConfig[projectId]) {
                fetchIssuesForProject(projectId);
            }
        }
    };

    const handleOpenCreateModal = (projectId: string) => {
        setSelectedProjectId(projectId);
        setIsEditing(false);
        setSelectedIssue(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (issue: Issue) => {
        setSelectedProjectId(issue.project_id);
        setIsEditing(true);
        setSelectedIssue(issue);
        setFormModalOpen(true);
    };

    const handleOpenDetails = (issue: Issue) => {
        setSelectedIssue(issue);
        setDetailsModalOpen(true);
    };

    const openMenu = (issueId: string) => {
        const btn = btnRefs.current[issueId];
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        setDropPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        setOpenMenuIssueId(issueId);
    };

    const confirmMarkReady = async () => {
        if (!issueToMarkReady) return;
        try {
            await updateIssueApi(issueToMarkReady._id, { status: "Ready" });
            toast.success("Issue marked as ready!");
            setIssuesConfig(prev => {
                const pData = prev[issueToMarkReady.project_id].data.map(i => i._id === issueToMarkReady._id ? { ...i, status: "Ready" } : i);
                return { ...prev, [issueToMarkReady.project_id]: { ...prev[issueToMarkReady.project_id], data: pData } };
            });
        } catch {
            toast.error("Failed to update status");
        } finally {
            setIssueToMarkReady(null);
        }
    };

    const confirmDeleteIssue = async () => {
        if (!issueToDelete) return;
        try {
            await deleteIssueApi(issueToDelete._id);
            toast.success("Issue deleted successfully.");
            fetchIssuesForProject(issueToDelete.project_id);
        } catch {
            toast.error("Failed to delete issue");
        } finally {
            setIssueToDelete(null);
        }
    };

    const handleFormSubmit = async (data: ModalIssueFormData) => {
        if (!selectedProjectId) return;
        setIsSubmitting(true);
        try {
            if (isEditing && selectedIssue) {
                await updateIssueApi(selectedIssue._id, data);
                toast.success("Issue updated successfully");
            } else {
                await createIssueApi({ ...data, project_id: selectedProjectId });
                toast.success("Issue created successfully");
            }
            setFormModalOpen(false);
            fetchIssuesForProject(selectedProjectId);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            toast.error(e.response?.data?.message || "Failed to save issue");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'new': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'ready': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'to do': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'done': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const renderIssues = (projectId: string) => {
        const config = issuesConfig[projectId];
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
                    <p className="text-[13px]">No issues found for this project.</p>
                </div>
            );
        }

        return (
            <div className="p-3 bg-[#fdfdfd] border-t border-[#f0f0f0]">
                <div className="space-y-2">
                    {config.data.map((issue) => {
                        const isOwner = (issue.created_by as any)?._id === user?._id || user?.role === 'company';
                        const canEditIssue = can(`issue:${issue.type.toLowerCase()}:update`) || isOwner;
                        const canDeleteIssue = can(`issue:${issue.type.toLowerCase()}:delete`) || isOwner;

                        return (
                            <div key={issue._id} className="flex items-center justify-between p-3 bg-white border border-[#eaeaea] rounded-xl hover:shadow-sm transition-all group">
                            <div className="flex items-center gap-3">
                                <GripVertical size={16} className="text-[#ddd] cursor-move" />
                                <div className="p-1.5 bg-gray-50 rounded border border-gray-100">
                                    <TypeIcon type={issue.type} size={14} />
                                </div>
                                <div>
                                    <h4 className="text-[13px] font-bold text-[#1f2124]">{issue.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-[1px] rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(issue.status)}`}>
                                            {issue.status}
                                        </span>
                                        {issue.type === 'story' && (
                                            <span className="text-[10px] uppercase font-bold text-[#888] bg-[#f5f5f5] px-1.5 py-0.5 rounded">
                                                {issue.story_points} points
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {issue.status.toLowerCase() === 'new' && canEditIssue && (
                                    <button
                                        onClick={() => setIssueToMarkReady(issue)}
                                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <CheckCircle size={12} /> Mark Ready
                                    </button>
                                )}
                                <div className="relative">
                                    <button
                                        ref={(el) => { btnRefs.current[issue._id] = el; }}
                                        onClick={() => openMenu(issue._id)}
                                        className="p-1.5 text-[#bbb] hover:bg-[#f0f0f0] hover:text-[#555] rounded-lg transition-colors"
                                    >
                                        <MoreHorizontal size={15} />
                                    </button>

                                    {openMenuIssueId === issue._id && (
                                        <IssueMenu
                                            pos={dropPos}
                                            onClose={() => setOpenMenuIssueId(null)}
                                            onView={() => handleOpenDetails(issue)}
                                            onEdit={() => handleOpenEditModal(issue)}
                                            onDelete={() => setIssueToDelete(issue)}
                                            canEdit={canEditIssue}
                                            canDelete={canDeleteIssue}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}


                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#fdfdfd]">
            <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f0f0f0] bg-white shrink-0">
                <div>
                    <h1 className="text-[20px] font-black text-[#1f2124] tracking-tight">Project Backlogs</h1>
                    <p className="text-[12px] text-[#888] mt-1 font-medium">Manage and refine issues across your projects</p>
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
                        <p className="text-[12px] text-[#888] mt-1 max-w-sm">You need active projects to start creating issues in the backlog.</p>
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
                                            {(can('issue:story:create') || can('issue:task:create') || can('issue:bug:create')) && (

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleOpenCreateModal(project._id); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-[#fff5ef] text-[#fa8029] hover:bg-[#fa8029] hover:text-white rounded-lg transition-all"
                                                >
                                                    <Plus size={12} /> Add Issue
                                                </button>
                                            )}
                                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f0f0f0] text-[#888]">
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                        <div className="overflow-hidden">
                                            {renderIssues(project._id)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* View/Edit Modals */}
            <IssueModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedIssue as ModalIssueFormData}
                isEditing={isEditing}
                isSubmitting={isSubmitting}
                members={members}
            />

            <IssueDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                issue={selectedIssue}
            />

            {/* Confirmation Modal - Mark Ready */}
            {issueToMarkReady && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-emerald-500" size={24} />
                            </div>
                            <h3 className="text-[16px] font-bold text-[#1f2124] mb-2">Mark as Ready</h3>
                            <p className="text-[13px] text-[#888] leading-relaxed">
                                Are you sure you want to change the status of <span className="font-bold text-[#555]">'{issueToMarkReady.title}'</span> to <span className="font-bold text-emerald-600">Ready</span>?
                            </p>
                        </div>
                        <div className="flex gap-2 p-4 pt-0">
                            <button
                                onClick={() => setIssueToMarkReady(null)}
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

            {/* Confirmation Modal - Delete Issue */}
            {issueToDelete && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-[16px] font-bold text-[#1f2124] mb-2">Delete Issue</h3>
                            <p className="text-[13px] text-[#888] leading-relaxed">
                                Are you sure you want to permanently delete <span className="font-bold text-[#555]">'{issueToDelete.title}'</span>? <br />This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-2 p-4 pt-0">
                            <button
                                onClick={() => setIssueToDelete(null)}
                                className="flex-1 py-2.5 border border-[#ebebeb] rounded-lg text-[12px] font-semibold text-[#555] hover:bg-[#f7f7f7] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteIssue}
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