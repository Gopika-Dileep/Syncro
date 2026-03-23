import { getEmployeeDetailsApi, updateEmployeeDetailsApi, type UserProfile } from "@/api/companyApi";
import { useEffect, useState } from "react";
import { useParams, useNavigate , useLocation } from "react-router-dom";
import { 
    Mail, Phone, MapPin, Calendar, 
    ArrowLeft, Users, Save, X, Edit2
} from "lucide-react";

export default function GetEmployee() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const location = useLocation()
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    
    // States for Inline Edit
    const [isEditMode, setIsEditMode] = useState<boolean>(location.state?.edit || false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<UserProfile>>({});

    const fetchDetails = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const response = await getEmployeeDetailsApi(userId);
            if (response.success) {
                setProfile(response.data);
                setFormData({
                    designation: response.data.designation || '',
                    phone: response.data.phone || '',
                    address: response.data.address || '',
                    skills: response.data.skills || []
                });
            } else {
                setError(response.message || "Failed to fetch details");
            }
        } catch (err: unknown) {
            setError("An error occurred while fetching data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [userId]);

    const handleSave = async () => {
        if (!userId) return;
        setIsUpdating(true);
        try {
            const response = await updateEmployeeDetailsApi(userId, formData);
            if (response.success) {
                await fetchDetails();
                setIsEditMode(false);
            } else {
                alert(response.message || "Failed to save changes");
            }
        } catch (err: unknown) {
            alert("An error occurred while saving");
        } finally {
            setIsUpdating(false);
        }
    };

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

    return (
        <div className="min-h-screen bg-[#f9fafb] text-slate-900 font-sans pb-20">
            {/* Top Navigation Bar */}
            <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/company/employees')} className="p-2 hover:bg-white rounded-lg border border-slate-200 font-bold">
                        <ArrowLeft size={18} />
                    </button>
                    <h1 className="text-lg font-bold">Employee Profile</h1>
                </div>
                
                <div className="flex gap-3">
                    {isEditMode ? (
                        <>
                            <button 
                                onClick={() => setIsEditMode(false)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                            >
                                <X size={14} /> Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all disabled:opacity-50"
                            >
                                <Save size={14} /> {isUpdating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsEditMode(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                        >
                            <Edit2 size={14} /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 space-y-6">
                
                {/* Hero Profile Card */}
                <div className={`bg-white border rounded-2xl p-8 shadow-sm transition-all ${isEditMode ? 'border-slate-900 ring-4 ring-slate-900/5' : 'border-slate-200'}`}>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#f3f4f6] flex items-center justify-center text-2xl md:text-3xl font-bold text-slate-400 shrink-0 border border-slate-100">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </div>

                        <div className="flex-1 space-y-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{user.name}</h2>
                                <div className="mt-3">
                                    {isEditMode ? (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400">Designation</label>
                                            <input 
                                                type="text" 
                                                value={formData.designation}
                                                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                                                className="w-full max-w-sm px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none border-b-2 border-b-slate-900"
                                                placeholder="Enter designation"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                                                {profile?.designation || "Staff Member"}
                                            </span>
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100 italic">
                                                Active Status
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl font-medium">
                                Professional team member dedicated to achieving organizational goals through collaborative effort and technical expertise.
                            </p>

                            <div className="pt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <DetailField 
                                    icon={<Mail size={14}/>} 
                                    label="Email" 
                                    value={user.email} 
                                    isReadOnly={true} 
                                />
                                <DetailField 
                                    icon={<Phone size={14}/>} 
                                    label="Phone" 
                                    value={profile?.phone || ''}
                                    isEditMode={isEditMode}
                                    onChange={(val) => setFormData({...formData, phone: val})}
                                />
                                <DetailField 
                                    icon={<MapPin size={14}/>} 
                                    label="Address" 
                                    value={profile?.address || ''}
                                    isEditMode={isEditMode}
                                    onChange={(val) => setFormData({...formData, address: val})}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Skills Section */}
                    <section className={`bg-white border rounded-2xl p-8 shadow-sm transition-all ${isEditMode ? 'border-slate-400' : 'border-slate-200'}`}>
                        <h3 className="text-sm font-bold mb-6 italic">Technical Skills</h3>
                        {isEditMode ? (
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400"></label>
                                <textarea 
                                    value={formData.skills?.join(', ')}
                                    onChange={(e) => setFormData({...formData, skills: e.target.value.split(',').map(s => s.trim())})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                                    rows={3}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {profile?.skills && profile.skills.length > 0 ? (
                                    profile.skills.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 uppercase">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-xs text-slate-400 italic">No skills documented yet.</span>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Meta Stats */}
                    <div className="grid grid-cols-1 gap-6">
                        <StatCard 
                            label="Assigned Team" 
                            value={profile?.team?.name || "N/A"} 
                            icon={<Users size={18}/>} 
                        />
                        <StatCard 
                            label="Date of Joining" 
                            value={profile?.date_of_joining ? new Date(profile.date_of_joining).toLocaleDateString() : "Not Set"} 
                            icon={<Calendar size={18}/>} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailField({ icon, label, value, isEditMode, isReadOnly, onChange }: { 
    icon: React.ReactNode, 
    label: string, 
    value: string, 
    isEditMode?: boolean,
    isReadOnly?: boolean,
    onChange?: (val: string) => void
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {icon} {label}
            </div>
            {isEditMode && !isReadOnly ? (
                <input 
                    type="text" 
                    defaultValue={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-50 border-b-2 border-slate-900 text-sm font-bold outline-none"
                />
            ) : (
                <p className={`text-sm font-bold ${isReadOnly ? 'text-slate-400' : 'text-slate-900'}`}>{value || (isReadOnly ? 'N/A' : 'Not Provided')}</p>
            )}
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-400">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-black text-slate-900">{value}</p>
            </div>
        </div>
    );
}
