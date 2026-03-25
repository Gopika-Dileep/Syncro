import { getEmployeeDetailsApi, type UserProfile, type EmployeePermissions } from "@/api/companyApi";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Mail, Phone, Calendar, 
    ArrowLeft, Users, Edit2, Shield,
    Layout, Layers, Zap, CheckCircle, Check
} from "lucide-react";

// Extend UserProfile locally to include permissions if it's not in the main types
interface ExtendedUserProfile extends UserProfile {
    permissions?: EmployeePermissions;
}

const AVATAR_COLORS = ["#fa8029", "#60a5fa", "#34d399", "#a78bfa", "#f472b6", "#fbbf24"];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "??";
};

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function GetEmployee() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!userId) return;
            try {
                const response = await getEmployeeDetailsApi(userId);
                if (response.success) {
                    setProfile(response.data as ExtendedUserProfile);
                } else {
                    setError(response.message || "Failed to fetch details");
                }
            } catch (err: unknown) {
                setError("An error occurred while fetching data");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [userId]);

    if (loading) return (
        <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[400px] gap-3 font-sans">
             <div className="w-5 h-5 border-2 border-[#ebebeb] border-t-[#1f2124] rounded-full animate-spin" />
             <p className="text-[12px] text-[#bbb]">Loading profile...</p>
        </div>
    );

    if (error || !profile) return (
        <div className="p-4 md:p-6 font-sans">
            <div className="bg-white p-8 rounded-sm border border-[#ebebeb] text-center max-w-sm mx-auto">
                <p className="text-[#1f2124] font-bold text-[13px] mb-4">{error || "Employee not found"}</p>
                <button 
                    onClick={() => navigate(-1)} 
                    className="px-6 py-2 bg-[#1f2124] text-white rounded-full text-[11px] font-bold hover:bg-black transition-all"
                >
                    Go Back
                </button>
            </div>
        </div>
    );

    const user = profile.user_id;

    return (
        <div className="p-4 md:p-6 font-sans flex flex-col gap-6">
            
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/company/employees')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#aaa] hover:bg-white hover:text-[#1f2124] border border-transparent hover:border-[#ebebeb] transition-all"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-[14px] md:text-[16px] font-bold text-[#1f2124]">Employee Profile</h1>
                    </div>
                </div>
                <button 
                    onClick={() => navigate(`/company/employees/edit/${user._id}`)}
                    className="flex items-center gap-1.5 bg-[#fa8029] hover:bg-[#e67320] text-white px-4 py-2 rounded-full font-bold text-[11px] md:text-[12px] transition-all active:scale-95 whitespace-nowrap shadow-sm shadow-orange-950/20"
                >
                    <Edit2 size={13} strokeWidth={2.5} />
                    Edit Profile
                </button>
            </div>

            <div className="flex flex-col gap-6">
                
                {/* ── Main Data Card ── */}
                <div className="bg-white border border-[#ebebeb] rounded-sm flex flex-col shadow-sm">
                    
                    {/* Identity (Smaller Header) */}
                    <div className="px-5 py-5 border-b border-[#f5f5f5] flex items-center gap-4 bg-[#fafafa]/30">
                        <div 
                            className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-black text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: avatarColor(user.name) }}
                        >
                            {getInitials(user.name)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-[15px] font-bold text-[#1f2124] tracking-tight">{user.name}</h2>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-wider border border-emerald-100">
                                    Active
                                </span>
                            </div>
                            <p className="text-[12px] text-[#aaa] font-semibold mt-0.5">
                                {profile.designation || "Staff Member"}
                            </p>
                        </div>
                    </div>

                    {/* Core Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#f5f5f5]">
                        <MiniField label="Email" value={user.email} icon={<Mail size={13}/>} />
                        <MiniField label="Phone" value={profile.phone || "N/A"} icon={<Phone size={13}/>} />
                        <MiniField label="Team" value={profile.team?.name || "N/A"} icon={<Users size={13}/>} />
                        <MiniField label="Join Date" value={formatDate(profile.date_of_joining)} icon={<Calendar size={13}/>} />
                    </div>

                    {/* Expertise */}
                    <div className="px-6 py-5 border-t border-[#f5f5f5]">
                        <p className="text-[10px] font-bold text-[#bbb] uppercase tracking-wider mb-2.5">Expertise</p>
                        <div className="flex flex-wrap gap-1.5">
                            {profile.skills && profile.skills.length > 0 ? (
                                profile.skills.map((skill, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-[#f7f7f7] border border-[#ebebeb] rounded-sm text-[11px] font-semibold text-[#555]">
                                        {skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-[11px] text-[#bbb] font-medium italic">No skills added</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Permissions List ── */}
                <div className="bg-white border border-[#ebebeb] rounded-sm p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield size={14} className="text-[#fa8029]" />
                        <h3 className="text-[12px] font-bold text-[#1f2124] uppercase tracking-wider">Access Permissions</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <PermissionModule 
                            title="Projects" icon={<Layout size={14}/>} 
                            active={getProjectPermissions(profile.permissions?.project)} 
                        />
                        <PermissionModule 
                            title="User Stories" icon={<Layers size={14}/>} 
                            active={getUserStoryPermissions(profile.permissions?.userStory)} 
                        />
                        <PermissionModule 
                            title="Sprints" icon={<Zap size={14}/>} 
                            active={getSprintPermissions(profile.permissions?.sprint)} 
                        />
                        <PermissionModule 
                            title="Tasks" icon={<CheckCircle size={14}/>} 
                            active={getTaskPermissions(profile.permissions?.task)} 
                        />
                        <PermissionModule 
                            title="Teams" icon={<Users size={14}/>} 
                            active={getTeamPermissions(profile.permissions?.team)} 
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

function MiniField({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="p-5 flex flex-col gap-1">
            <p className="text-[10px] font-bold text-[#bbb] uppercase tracking-tight leading-none">{label}</p>
            <div className="flex items-center gap-2">
                 <div className="text-[#fa8029]/70 shrink-0">
                    {icon}
                 </div>
                 <p className="text-[13px] font-bold text-[#1f2124] tracking-tight">{value}</p>
            </div>
        </div>
    );
}

function PermissionModule({ title, icon, active }: { title: string, icon: React.ReactNode, active: string[] }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#aaa]">
                {icon}
                <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
            </div>
            <div className="flex flex-col gap-2">
                {active.length > 0 ? active.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                            <Check size={8} strokeWidth={4} />
                        </div>
                        <span className="text-[11px] font-semibold text-[#555] group-hover:text-[#1f2124] transition-colors">{p}</span>
                    </div>
                )) : (
                    <span className="text-[10px] text-[#ddd] italic font-medium">No permissions granted</span>
                )}
            </div>
        </div>
    );
}

// Permission Helpers
function getProjectPermissions(p: any) {
    if (!p) return [];
    const res = [];
    if (p.create) res.push("Create");
    if (p.view?.team) res.push("View (Team)");
    if (p.view?.all) res.push("View (All)");
    if (p.update?.team) res.push("Update (Team)");
    if (p.update?.all) res.push("Update (All)");
    if (p.delete) res.push("Delete");
    return res;
}
function getUserStoryPermissions(p: any) {
    if (!p) return [];
    const res = [];
    if (p.create) res.push("Create");
    if (p.view?.all) res.push("View (All)");
    if (p.update) res.push("Update");
    if (p.assign) res.push("Assign");
    return res;
}
function getSprintPermissions(p: any) {
    if (!p) return [];
    const res = [];
    if (p.create) res.push("Create");
    if (p.view?.all) res.push("View (All)");
    if (p.update) res.push("Update");
    if (p.start) res.push("Start");
    if (p.complete) res.push("Complete");
    return res;
}
function getTaskPermissions(p: any) {
    if (!p) return [];
    const res = [];
    if (p.create) res.push("Create");
    if (p.view?.team) res.push("View (Team)");
    if (p.view?.all) res.push("View (All)");
    if (p.assign?.team) res.push("Assign (Team)");
    if (p.assign?.all) res.push("Assign (All)");
    if (p.update?.team) res.push("Update (Team)");
    if (p.update?.all) res.push("Update (All)");
    return res;
}
function getTeamPermissions(p: any) {
    if (!p) return [];
    const res = [];
    if (p.view?.team) res.push("View (Team)");
    if (p.view?.all) res.push("View (All)");
    if (p.performance?.team) res.push("Performance (Team)");
    if (p.performance?.all) res.push("Performance (All)");
    return res;
}