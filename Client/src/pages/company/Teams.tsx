import React, { useState, useEffect } from "react";
import { Users, Plus, X, MoreVertical, Trash2, Edit2, Search } from "lucide-react";
import { getTeamsApi, createTeamApi, type Team } from "../../api/companyApi";

export default function Teams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [newTeamName, setNewTeamName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");


    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await getTeamsApi();
            setTeams(response.data);
        } catch (err: unknown) {
            console.error("Failed to fetch teams", err);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        setLoading(true);
        setError("");
        try {
            await createTeamApi(newTeamName);
            setNewTeamName("");
            setShowModal(false);
            fetchTeams(); 
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to create team";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Teams</h1>
                    <p className="text-gray-500">Organize your employees into functional units</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition shadow-sm"
                >
                    <Plus size={20} />
                    <span>Create New Team</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between mb-6 shadow-sm">
                <div className="relative w-1/3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search teams..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-gray-200 outline-none text-sm"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <Users className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500">No teams found. Create your first team to get started.</p>
                    </div>
                ) : (
                    teams.map((team) => (
                        <div key={team._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
                                    {team.name.charAt(0).toUpperCase()}
                                </div>
                                <button className="p-1.5 text-gray-400 hover:text-black rounded-lg">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{team.name}</h3>
                            <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider font-semibold">{team.created_at ? ` created ${new Date(team.created_at).toLocaleDateString()}`: `Date unknown`}</p>
                            
                            <div className="flex gap-2 border-t border-gray-50 pt-4 mt-auto">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition font-medium">
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition font-medium">
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

           
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-all scale-100">
                        <div className="flex items-center justify-between p-6 border-b border-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Create New Team</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateTeam} className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Team Name</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    value={newTeamName} 
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="e.g. Frontend Squad, HR Team"
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-black/5 outline-none transition"
                                />
                                {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-50 transition shadow-lg shadow-black/10"
                                >
                                    {loading ? "Creating..." : "Create Team"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
