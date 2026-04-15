import { useState, useEffect } from "react";
import { Users, Mail, User, Search } from "lucide-react";
import { getTeamDirectoryApi, type TeamDirectory } from "../api/teamApi";
import { useDebounce } from "@/hooks/useDebounce";

export default function Team() {
    const [directory, setDirectory] = useState<TeamDirectory[]>([]);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    useEffect(() => {
        fetchDirectory();
    }, [debouncedSearch]);

    const fetchDirectory = async () => {
        setFetching(true);
        try {
            const res = await getTeamDirectoryApi(debouncedSearch);
            setDirectory(res.data || []);
        } catch (err) {
            setError("Failed to load team data");
            console.error(err);
        } finally {
            setFetching(false);
        }
    };


    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-6 h-6 border-2 border-[#fa8029] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-medium">
                {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto p-4 md:p-0">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[22px] font-black text-[#1f2124] tracking-tight">Team Directory</h1>
                    <p className="text-[13px] text-[#888] font-medium mt-1">Connect and collaborate with your colleagues</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb]" size={15} />
                    <input
                        type="text"
                        placeholder="Search colleagues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#ebebeb] rounded-xl text-[13px] outline-none focus:border-[#fa8029]/30 focus:ring-4 focus:ring-[#fa8029]/5 transition-all shadow-sm shadow-black/[0.02]"
                    />
                </div>
            </div>

            {/* Directory Lists */}
            <div className="flex flex-col gap-8">
                {directory.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-white border border-[#ebebeb] rounded-3xl border-dashed">
                        <div className="w-16 h-16 bg-[#f7f7f7] rounded-full flex items-center justify-center text-[#ddd] mb-4">
                            <Users size={24} />
                        </div>
                        <h3 className="text-[15px] font-bold text-[#333]">No colleagues found</h3>
                        <p className="text-[13px] text-[#888] mt-1">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    directory.map((team) => (
                        <div key={team._id} className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 px-2">
                                <span className="w-1.5 h-6 bg-[#fa8029] rounded-full" />
                                <h2 className="text-[15px] font-bold text-[#1f2124] tracking-tight flex items-center gap-2 uppercase">
                                    {team.name}
                                    <span className="text-[11px] font-bold text-[#fa8029] bg-[#fff5ef] px-2 py-0.5 rounded-full lowercase">
                                        {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
                                    </span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {team.members.map((member) => (
                                    <div
                                        key={member._id}
                                        className="group bg-white border border-[#ebebeb] rounded-2xl p-4 hover:shadow-xl hover:shadow-black/[0.03] hover:border-[#fa8029]/20 transition-all cursor-default"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#f9f9f9] border border-[#f0f0f0] flex items-center justify-center text-[#fa8029] group-hover:scale-105 transition-transform duration-300">
                                                <User size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[14px] font-bold text-[#1f2124] truncate">{member.name}</h4>
                                                <p className="text-[11px] font-bold text-[#fa8029] uppercase tracking-wide mt-0.5">{member.designation || 'Team Member'}</p>

                                                <div className="mt-4 flex flex-col gap-2">
                                                    <div className="flex items-center gap-2.5 text-[#888] hover:text-[#fa8029] transition-colors group/mail">
                                                        <Mail size={13} className="shrink-0" />
                                                        <a href={`mailto:${member.email}`} className="text-[12px] font-medium truncate underline-offset-4 group-hover/mail:underline">
                                                            {member.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}