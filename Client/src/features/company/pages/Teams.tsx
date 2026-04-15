import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Users, Edit2, Trash2, MoreHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { getTeamsApi, createTeamApi, updateTeamApi, deleteTeamApi, type Team } from "@/features/company/api/companyApi";
import DataTable, { type Column } from "@/components/DataTable";
import { useDebounce } from "@/hooks/useDebounce";

const AVATAR_COLORS = ["#fa8029", "#60a5fa", "#34d399", "#a78bfa", "#f472b6", "#fbbf24"];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Portal dropdown ─────────────────────────────────────────────────────────
interface DropdownPos { top: number; right: number }

interface ActionMenuProps {
    pos: DropdownPos;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

function TeamMenu({ pos, onClose, onEdit, onDelete }: ActionMenuProps) {
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
                    <Edit2 size={13} className="text-[#bbb]" /> Edit
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
export default function Teams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    const [editingTeam, setEditingTeam] = useState<Team | null>(null);

    const [formError, setFormError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [page, setPage] = useState(1);
    const [openId, setOpenId] = useState<string | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
    const [dropPos, setDropPos] = useState<DropdownPos>({ top: 0, right: 0 });
    const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const limit = 8;

    useEffect(() => { fetchTeams(); }, []);

    const fetchTeams = async () => {
        setFetching(true);
        try {
            const response = await getTeamsApi();
            setTeams(response.data);
        } catch (err: unknown) {
            setError("Failed to load teams");
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleSaveTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;
        setLoading(true);
        setFormError("");
        try {
            if (editingTeam) {
                await updateTeamApi(editingTeam._id, newTeamName);
                toast.success("Team updated successfully");
            } else {
                await createTeamApi(newTeamName);
                toast.success("Team created successfully");
            }
            setNewTeamName("");
            setEditingTeam(null);
            setShowModal(false);
            fetchTeams();
        } catch (err: unknown) {
            let msg = "Operation failed";
            if (axios.isAxiosError(err)) {
                msg = err.response?.data?.message || err.message || msg;
            }
            setFormError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeam = async (team: Team) => {
        setTeamToDelete(team);
    };

    const confirmDelete = async () => {
        if (!teamToDelete) return;
        try {
            await deleteTeamApi(teamToDelete._id);
            toast.success("Team deleted successfully");
            fetchTeams();
        } catch (err: unknown) {
            let msg = "Failed to delete team";
            if (axios.isAxiosError(err)) {
                msg = err.response?.data?.message || err.message || msg;
            }
            toast.error(msg);
        } finally {
            setTeamToDelete(null);
        }
    };

    const openMenu = (teamId: string) => {
        const btn = btnRefs.current[teamId];
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        setDropPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        setOpenId(teamId);
    };

    const filtered = teams.filter((t) => t.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    const columns: Column<Team>[] = [
        {
            key: "team",
            header: "Team",
            render: (team) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: avatarColor(team.name) }}
                    >
                        {team.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[13px] font-semibold text-[#1f2124]">{team.name}</span>
                </div>
            ),
        },
        {
            key: "created",
            header: "Created",
            render: (team) => (
                <span className="text-[12px] text-[#aaa]">
                    {team.created_at
                        ? new Date(team.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                        : "—"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            align: "right",
            render: (team) => (
                <div className="flex justify-end">
                    <button
                        ref={(el) => { btnRefs.current[team._id] = el; }}
                        onClick={() => openMenu(team._id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#bbb] hover:bg-[#f0f0f0] hover:text-[#555] transition-colors"
                    >
                        <MoreHorizontal size={15} />
                    </button>

                    {openId === team._id && (
                        <TeamMenu
                            pos={dropPos}
                            onClose={() => setOpenId(null)}
                            onEdit={() => {
                                setEditingTeam(team);
                                setNewTeamName(team.name);
                                setShowModal(true);
                            }}
                            onDelete={() => handleDeleteTeam(team)}
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <DataTable<Team>
                rows={paginated}
                columns={columns}
                keyExtractor={(t) => t._id}
                title="Teams"
                subtitle="Organize your employees into functional units"
                addLabel="Create Team"
                onAdd={() => setShowModal(true)}
                searchValue={searchTerm}
                onSearchChange={(v) => { setSearchTerm(v); setPage(1); }}
                searchPlaceholder="Search teams…"
                loading={fetching}
                error={error}
                page={page}
                totalRows={filtered.length}
                limit={limit}
                onPageChange={setPage}
                emptyIcon={<Users size={18} className="text-[#ddd]" />}
                emptyTitle="No teams yet"
                emptySubtitle="Create your first team to get started."
                onEmptyAction={() => setShowModal(true)}
                emptyActionLabel="Create Team"
            />

            {/* ── Create Team Modal ── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
                            <h2 className="text-[14px] font-bold text-[#1f2124]">
                                {editingTeam ? "Update Team" : "Create New Team"}
                            </h2>
                            <button
                                onClick={() => { setShowModal(false); setEditingTeam(null); setNewTeamName(""); setFormError(""); }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#bbb] hover:bg-[#f5f5f5] transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTeam} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-[#bbb] uppercase tracking-widest mb-2">
                                    Team Name
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="e.g. Frontend Team"
                                    className="w-full px-4 py-2.5 bg-[#f7f7f7] border border-transparent rounded-lg focus:bg-white focus:border-[#fa8029]/30 focus:ring-2 focus:ring-[#fa8029]/10 outline-none text-[13px] text-[#1f2124] placeholder:text-[#ccc] transition-all"
                                />
                                {formError && (
                                    <p className="text-rose-500 text-[11px] font-medium mt-1.5">{formError}</p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setFormError(""); }}
                                    className="flex-1 py-2.5 border border-[#ebebeb] rounded-lg text-[12px] font-semibold text-[#555] hover:bg-[#f7f7f7] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2.5 bg-[#fa8029] hover:bg-[#e67320] text-white rounded-lg text-[12px] font-semibold transition-all disabled:opacity-50 active:scale-95"
                                >
                                    {loading ? "Processing…" : (editingTeam ? "Save Changes" : "Create Team")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ── */}
            {teamToDelete && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-[16px] font-bold text-[#1f2124] mb-2">Delete Team</h3>
                            <p className="text-[13px] text-[#888] leading-relaxed">
                                Are you sure you want to delete <span className="font-bold text-[#555]">'{teamToDelete.name}'</span>? 
                                <br />All employees in this team will be unassigned.
                            </p>
                        </div>
                        <div className="flex gap-2 p-4 pt-0">
                            <button
                                onClick={() => setTeamToDelete(null)}
                                className="flex-1 py-2.5 border border-[#ebebeb] rounded-lg text-[12px] font-semibold text-[#555] hover:bg-[#f7f7f7] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[12px] font-semibold transition-all active:scale-95"
                            >
                                Delete Team
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
