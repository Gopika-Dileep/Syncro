import { getEmployeeDetailsApi, type UserProfile } from "@/api/companyApi";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Mail, Phone, MapPin, Calendar, 
    ArrowLeft, MoreHorizontal, Users, Shield
} from "lucide-react";

export default function GetEmployee() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!userId) return;
            try {
                const response = await getEmployeeDetailsApi(userId);
                if (response.success) {
                    setProfile(response.data);
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
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
    );

    if (error || !profile) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] p-6 text-center">
            <div>
                <p className="text-slate-500 font-bold mb-4">{error || "Employee not found"}</p>
                <button onClick={() => navigate(-1)} className="text-sm font-bold underline">Go Back</button>
            </div>
        </div>
    );

    const user = profile.user_id;
    const employee = profile;

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "??";
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] text-slate-900 font-sans pb-20">
            {/* Top Navigation Bar */}
            <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/company/employees')}
                        className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">Employee Profile</h1>
                        <p className="text-xs text-slate-500">Overview of team member details</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
                    Actions <MoreHorizontal size={14} />
                </button>
            </div>

            <div className="max-w-6xl mx-auto px-6 space-y-6">
                
                {/* Hero Profile Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#f3f4f6] flex items-center justify-center text-2xl md:text-3xl font-bold text-slate-400 shrink-0 border border-slate-100">
                            {getInitials(user.name)}
                        </div>

                        {/* Identity & Tags */}
                        <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{user.name}</h2>
                                    <div className="flex gap-2 mt-2">
                                        <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                                            {employee?.designation || "Staff Member"}
                                        </span>
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100">
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                                Professional team member dedicated to achieving organizational goals through collaborative effort and technical expertise.
                            </p>

                            {/* Quick Info Row */}
                            <div className="pt-6 border-t border-slate-50 flex flex-wrap gap-x-10 gap-y-4">
                                <QuickInfo icon={<Mail size={14}/>} text={user.email} />
                                {employee?.phone && <QuickInfo icon={<Phone size={14}/>} text={employee.phone} />}
                                {employee?.address && <QuickInfo icon={<MapPin size={14}/>} text={employee.address} />}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* About & Skills Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                            <h3 className="text-sm font-bold mb-6">About</h3>
                            <p className="text-sm text-slate-600 leading-7 mb-8">
                                Specialized in {employee?.designation || 'their field'} with a focus on delivering high-quality results. 
                                Currently operating as a {user.role} within the organization, maintaining professional standards and efficiency.
                            </p>
                            
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Skills & Expertise</h4>
                            <div className="flex flex-wrap gap-2">
                                {employee?.skills && employee.skills.length > 0 ? (
                                    employee.skills.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-400 italic">No skills documented yet.</span>
                                )}
                            </div>
                        </section>

                        {/* Stat Boxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Team Card (Using optional chaining for future implementation) */}
                            <StatCard 
                                label="Assigned Team" 
                                value={employee?.team?.name || "N/A"} 
                                icon={<Users className="text-slate-400" size={18}/>} 
                            />
                            {/* Joining Date Card (Moved from sidebar) */}
                            <StatCard 
                                label="Date of Joining" 
                                value={employee?.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : "Not Set"} 
                                icon={<Calendar className="text-slate-400" size={18}/>} 
                            />
                        </div>
                    </div>

                    {/* Meta Sidebar (simplified) */}
                    <div className="space-y-6">
                        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                            <h3 className="text-sm font-bold mb-6">Quick Actions</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">System Role</p>
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-slate-400" />
                                        <p className="text-sm font-bold text-slate-900">{user.role}</p>
                                    </div>
                                </div>
                                <button className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all">
                                    Send Message
                                </button>
                                <button className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
                                    Edit Profile
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickInfo({ icon, text }: { icon: React.ReactNode, text: string }) {
    return (
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <span className="text-slate-400">{icon}</span>
            {text}
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
}