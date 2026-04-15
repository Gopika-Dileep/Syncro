import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FolderKanban, Edit2, Trash2, MoreHorizontal, Layout, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getProjectsApi, deleteProjectApi, type Project } from "@/features/employee/api/projectApi";
import DataTable, { type Column } from "@/components/DataTable";
import { usePermission } from "@/features/employee/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";

// ─── Portal dropdown ─────────────────────────────────────────────────────────
interface DropdownPos { top: number; right: number }

interface ActionMenuProps {
    pos: DropdownPos;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

function ProjectMenu({ pos, onClose, onEdit, onDelete }: ActionMenuProps) {
    return createPortal(
        <>
            <div className="fixed inset-0 z-[999]" onClick={onClose} />
            <div
                className="fixed z-[1000] w-40 bg-white border border-[#ebebeb] rounded-xl shadow-lg py-1"
                style={{ top: pos.top, right: pos.right }}
            >
                <button
                    onClick={() => { onClose(); onEdit(); }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] text-[#555] hover:bg-[#f7f7f7] transition-colors"
                >
                    <Edit2 size={13} className="text-[#bbb]" /> Edit Project
                </button>
                <div className="border-t border-[#f5f5f5] my-1" />
                <button
                    onClick={() => { onClose(); onDelete(); }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[12px] font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                >
                    <Trash2 size={13} /> Delete
                </button>
            </div>
        </>,
        document.body
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Projects() {
    const navigate = useNavigate();
    const { can } = usePermission();
    const [projects, setProjects] = useState<Project[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [openId, setOpenId] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [dropPos, setDropPos] = useState<DropdownPos>({ top: 0, right: 0 });
    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const limit = 8;

    useEffect(() => { fetchProjects(); }, [page, debouncedSearchTerm]);

    const fetchProjects = async () => {
        setFetching(true);
        setError(""); 
        try {
            const response = await getProjectsApi(page, limit, debouncedSearchTerm);
            setProjects(response.data || []);
            setTotal(response.total || 0);
            setError(""); // Ensure error is cleared on success
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 403) {
                    setError("Access Denied: You don't have the required permissions to view projects.");
                } else if (err.response?.status === 500) {
                    setError("Server Error: There was a problem retrieving project data. Please ensure your account is correctly set up.");
                } else {
                    setError("Sync Failure: Unable to reach the server. Please check your connection.");
                }
            } else {
                setError("An unexpected error occurred while loading projects.");
            }
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            await deleteProjectApi(projectToDelete._id);
            toast.success("Project archive purged.");
            fetchProjects();
        } catch (err: unknown) {
            let msg = "Failed to delete project";
            if (axios.isAxiosError(err)) {
                msg = err.response?.data?.message || err.message || msg;
            }
            toast.error(msg);
        } finally {
            setProjectToDelete(null);
        }
    };

    const openMenu = (projectId: string) => {
        const btn = btnRefs.current[projectId];
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        setDropPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        setOpenId(projectId);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'on-hold': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'completed': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high': return 'text-rose-500';
            case 'medium': return 'text-amber-500';
            case 'low': return 'text-emerald-500';
            default: return 'text-[#bbb]';
        }
    };


    const columns: Column<Project>[] = [
        {
            key: "project",
            header: "Project Name",
            render: (project) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#f7f7f7] border border-[#ebebeb] flex items-center justify-center text-[#fa8029]">
                        <Layout size={14} />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-[#1f2124]">{project.name}</p>
                        <p className="text-[11px] text-[#aaa] truncate max-w-[200px]">{project.description}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (project) => (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(project.status)}`}>
                    {project.status}
                </span>
            ),
        },
        {
            key: "priority",
            header: "Priority",
            render: (project) => (
                <div className="flex items-center gap-1.5">
                    <AlertCircle size={10} className={getPriorityColor(project.priority)} />
                    <span className={`text-[11px] font-bold uppercase tracking-tighter ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                    </span>
                </div>
            ),
        },
        {
            key: "timeline",
            header: "Timeline",
            render: (project) => (
                <div className="flex items-center gap-2 text-[11px] text-[#888]">
                    <Calendar size={12} className="text-[#ccc]" />
                    <span>{new Date(project.start_date).toLocaleDateString()}</span>
                    <span className="text-[#ddd]">→</span>
                    <span>{new Date(project.target_date).toLocaleDateString()}</span>
                </div>
            ),
        },
        {
            key: "actions",
            header: "",
            align: "right",
            render: (project) => (
                <div className="flex justify-end">
                    <button
                        ref={(el) => { btnRefs.current[project._id] = el; }}
                        onClick={() => openMenu(project._id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#bbb] hover:bg-[#f0f0f0] hover:text-[#555] transition-colors"
                    >
                        <MoreHorizontal size={15} />
                    </button>

                    {openId === project._id && (
                        <ProjectMenu
                            pos={dropPos}
                            onClose={() => setOpenId(null)}
                            onEdit={() => navigate(`/employee/projects/edit/${project._id}`)}
                            onDelete={() => setProjectToDelete(project)}
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <DataTable<Project>
                rows={projects}
                columns={columns}
                keyExtractor={(p) => p._id}
                title="Projects"
                subtitle="Manage and track your collective initiatives"
                addLabel="Add Project"
                onAdd={can('project:create') ? () => navigate("/employee/projects/add") : undefined}
                searchValue={searchTerm}
                onSearchChange={(v) => { setSearchTerm(v); setPage(1); }}
                searchPlaceholder="Search projects…"
                loading={fetching}
                error={error}
                page={page}
                totalRows={total}
                limit={limit}
                onPageChange={setPage}
                emptyIcon={<FolderKanban size={18} className="text-[#ddd]" />}
                emptyTitle="Project list is currently empty"
                emptySubtitle="You haven't added any projects yet. Click the button below to start your first one!"
                onEmptyAction={can('project:create') ? () => navigate("/employee/projects/add") : undefined}
                emptyActionLabel="Add Your Project"
            />

            {/* ── Delete Confirmation Modal ── */}
            {projectToDelete && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-[16px] font-bold text-[#1f2124] mb-2">Delete Project</h3>
                            <p className="text-[13px] text-[#888] leading-relaxed">
                                Are you sure you want to delete <span className="font-bold text-[#555]">'{projectToDelete.name}'</span>? 
                                <br />This action will permanently remove all associated data.
                            </p>
                        </div>
                        <div className="flex gap-2 p-4 pt-0">
                            <button
                                onClick={() => setProjectToDelete(null)}
                                className="flex-1 py-2.5 border border-[#ebebeb] rounded-lg text-[12px] font-semibold text-[#555] hover:bg-[#f7f7f7] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[12px] font-semibold transition-all active:scale-95"
                            >
                                Delete Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}