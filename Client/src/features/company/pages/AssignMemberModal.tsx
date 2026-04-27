import React, { useState, useEffect } from "react";
import { X, Search, UserPlus, Info } from "lucide-react";
import { toast } from "sonner";
import { getUnassignedEmployeesApi, assignTeamToEmployeeApi, type UserProfile } from "@/features/company/api/companyApi";
import { useDebounce } from "@/hooks/useDebounce";

interface AssignMemberModalProps {
    teamId: string;
    teamName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssignMemberModal({ teamId, teamName, onClose, onSuccess }: AssignMemberModalProps) {
    const [employees, setEmployees] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        fetchUnassigned(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const fetchUnassigned = async (search: string = "") => {
        setLoading(true);
        try {
            const response = await getUnassignedEmployeesApi(search);
            setEmployees(response.data);
        } catch (error) {
            toast.error("Failed to fetch unassigned employees");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (employee: UserProfile) => {
        // Validation: Cannot assign managers
        if (employee.designation?.toLowerCase().includes("manager")) {
            toast.error("Cannot assign managers to a team", {
                description: "Manager roles are organizational-level and cannot be restricted to a single team.",
                icon: <Info className="text-rose-500" size={16} />
            });
            return;
        }

        setAssigning(employee._id);
        try {
            await assignTeamToEmployeeApi(employee._id, teamId);
            toast.success(`Assigned ${employee.user_id.name} to ${teamName}`);
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to assign employee");
        } finally {
            setAssigning(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
                    <div>
                        <h2 className="text-[15px] font-bold text-[#1f2124]">Add Team Member</h2>
                        <p className="text-[11px] text-[#aaa] font-medium mt-0.5">Assigning to <span className="text-[#fa8029]">{teamName}</span></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-[#bbb] hover:bg-[#f5f5f5] hover:text-[#555] transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="relative mb-6">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ccc]" size={16} />
                        <input
                            type="text"
                            placeholder="Search unassigned employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f8f8] border border-transparent rounded-xl focus:bg-white focus:border-[#fa8029]/30 focus:ring-4 focus:ring-[#fa8029]/5 outline-none text-[13px] text-[#1f2124] placeholder:text-[#ccc] transition-all"
                        />
                    </div>

                    <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                        {loading ? (
                            <div className="py-10 text-center">
                                <div className="w-6 h-6 border-2 border-[#fa8029] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-[12px] text-[#aaa]">Loading employees...</p>
                            </div>
                        ) : employees.length > 0 ? (
                            employees.map((emp) => (
                                <div 
                                    key={emp._id}
                                    className="flex items-center justify-between p-3 rounded-xl border border-[#f5f5f5] hover:border-[#fa8029]/20 hover:bg-[#fa8029]/[0.02] transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-[#f0f0f0] flex items-center justify-center text-[12px] font-bold text-[#aaa] group-hover:bg-[#fa8029]/10 group-hover:text-[#fa8029] transition-colors">
                                            {emp.user_id.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-[#1f2124]">{emp.user_id.name}</p>
                                            <p className="text-[11px] text-[#aaa] font-medium">{emp.designation || "No Designation"}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAssign(emp)}
                                        disabled={assigning === emp._id}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f8f8f8] text-[#bbb] hover:bg-[#fa8029] hover:text-white disabled:opacity-50 transition-all active:scale-90"
                                    >
                                        {assigning === emp._id ? (
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <UserPlus size={16} />
                                        )}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 text-center bg-[#fcfcfc] rounded-2xl border border-dashed border-[#eee]">
                                <p className="text-[13px] font-bold text-[#aaa] mb-1">No employees found</p>
                                <p className="text-[11px] text-[#ccc]">All eligible employees are already assigned to teams.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-[#fcfcfc] border-t border-[#f0f0f0] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-[12px] font-bold text-[#888] hover:text-[#555] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
