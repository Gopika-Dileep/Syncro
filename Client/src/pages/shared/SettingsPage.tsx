import { changePasswordAPi, getProfileApi, updateProfileApi, type UserProfile } from "@/api/userApi";
import {
    Mail, Building, Briefcase, Loader2,
    ShieldCheck, Eye, EyeOff, Calendar, Users, Edit3, X, ArrowLeft, Shield,
    Smartphone, Check, Save
} from "lucide-react";
import { useEffect, useState } from "react";
import { getZodErrors, updateProfileSchema, changePasswordSchema } from "@/lib/schema";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AVATAR_COLORS = ["#fa8029", "#60a5fa", "#34d399", "#a78bfa", "#f472b6", "#fbbf24"];
const avatarColor = (name: string) => AVATAR_COLORS[(name || "A").charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "??";
};

const SettingsPage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getProfileApi();
            setProfile(data);
        } catch (err) {
            setError("Failed to load profile settings");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[400px] gap-3 font-sans">
             <div className="w-5 h-5 border-2 border-[#ebebeb] border-t-[#1f2124] rounded-full animate-spin" />
             <p className="text-[12px] text-[#bbb]">Opening settings...</p>
        </div>
    );

    if (error || !profile) return (
        <div className="p-4 md:p-6 font-sans">
            <div className="bg-white p-10 rounded-sm border border-[#ebebeb] text-center max-w-sm mx-auto shadow-sm">
                <p className="text-[#1f2124] font-bold text-[14px] mb-4">{error || "Account not found"}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="px-8 py-2.5 bg-[#1f2124] text-white rounded-full text-[11px] font-bold hover:bg-black transition-all"
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 font-sans flex flex-col gap-6 bg-[#f7f7f7] min-h-screen">
            
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-[#aaa] hover:bg-white hover:text-[#1f2124] border border-transparent hover:border-[#ebebeb] transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-[18px] font-black text-[#1f2124] tracking-tight">Account Settings</h1>
                        <p className="text-[11px] text-[#aaa] font-semibold uppercase tracking-wider">Control Panel</p>
                    </div>
                </div>
                {profile?.user.role !== "company" && (
                    <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 bg-[#fa8029] hover:bg-[#e67320] text-white px-5 py-2.5 rounded-full font-bold text-[12px] transition-all active:scale-95 shadow-sm shadow-orange-950/20"
                    >
                        <Edit3 size={14} strokeWidth={2.5} />
                        Update Profile
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto w-full">
                
                {/* ── Personal Information Card ── */}
                <div className="bg-white border border-[#ebebeb] rounded-sm flex flex-col shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-[#f5f5f5] flex items-center gap-2 bg-[#fafafa]/50">
                        <Users size={15} className="text-[#fa8029]" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1f2124]">Identity Details</h2>
                    </div>
                    
                    <div className="p-8">
                        <div className="flex items-center gap-6 mb-10">
                            <div 
                                className="h-20 w-20 rounded-2xl flex items-center justify-center text-[24px] font-black text-white shadow-lg border-[4px] border-white ring-1 ring-[#f0f0f0]"
                                style={{ backgroundColor: avatarColor(profile.user.name) }}
                            >
                                {profile.user.avatar ? (
                                    <img src={profile.user.avatar} className="h-full w-full object-cover rounded-xl" alt="avatar" />
                                ) : (
                                    getInitials(profile.user.name)
                                )}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-[20px] font-black text-[#1f2124] tracking-tight leading-none mb-2">{profile.user.name}</h2>
                                <div className="flex flex-wrap gap-3 items-center">
                                    <p className="text-[13px] text-[#aaa] font-bold flex items-center gap-1.5"><Mail size={13} className="text-[#fa8029]/60"/> {profile.user.email}</p>
                                    <span className="px-2.5 py-0.5 bg-[#1f2124] text-white text-[9px] font-black uppercase tracking-widest rounded-sm border border-[#1f2124]">
                                        {profile.user.role}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8 border-t border-[#f8f8f8] pt-10">
                            {profile.company && (
                                <SettingsField icon={<Building size={14}/>} label="Organization" value={profile.company.name} />
                            )}
                            {profile.employee && (
                                <>
                                    <SettingsField icon={<Briefcase size={14}/>} label="Professional Role" value={profile.employee.designation || "Senior Member"} />
                                    <SettingsField icon={<Calendar size={14}/>} label="Joining Date" value={profile.employee.date_of_joining ? new Date(profile.employee.date_of_joining).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Recently"} />
                                    <SettingsField icon={<Users size={14}/>} label="Allocated Team" value={profile.employee.team?.name || "Unassigned"} />
                                    <SettingsField icon={<Smartphone size={14}/>} label="Direct Contact" value={profile.employee.phone || "Not linked"} />
                                </>
                            )}
                        </div>

                        {profile.employee?.skills && profile.employee.skills.length > 0 && (
                            <div className="mt-10 pt-10 border-t border-[#f8f8f8]">
                                <p className="text-[10px] font-black text-[#bbb] uppercase tracking-widest mb-4">Technical Expertise</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.employee.skills.map((skill) => (
                                        <span key={skill} className="px-3 py-1.5 bg-white border border-[#ebebeb] rounded-sm text-[11px] font-bold text-[#555] shadow-sm hover:border-[#fa8029] transition-all cursor-default">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Security Card ── */}
                <div className="bg-white border border-[#ebebeb] rounded-sm flex flex-col shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-[#f5f5f5] flex items-center gap-2 bg-[#fafafa]/50">
                        <Shield size={15} className="text-[#fa8029]" />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#1f2124]">Change Password</h2>
                    </div>
                    <div className="p-8">
                         <SecuritySection />
                    </div>
                </div>
            </div>

            {isEditModalOpen && profile && (
                <EditProfileModal 
                    profile={profile} 
                    onClose={() => setIsEditModalOpen(false)} 
                    onUpdate={fetchProfile} 
                />
            )}
        </div>
    );
};

const SettingsField = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="group">
        <p className="text-[10px] font-bold text-[#bbb] uppercase tracking-tight mb-1">{label}</p>
        <div className="flex items-center gap-2 text-[#1f2124]">
            <div className="w-8 h-8 rounded-lg bg-[#fcfcfc] border border-[#f5f5f5] flex items-center justify-center text-[#fa8029]/70 group-hover:bg-orange-50 transition-all">
                {icon}
            </div>
            <p className="text-[14px] font-bold tracking-tight">{value}</p>
        </div>
    </div>
);

const SecuritySection: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleFieldChange = (setter: (v: string) => void, field: string, value: string) => {
        setter(value);
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        const validation = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
        if (!validation.success) {
            setFieldErrors(getZodErrors(validation.error));
            return;
        }
        setLoading(true);
        try {
            await changePasswordAPi({ currentPassword, newPassword });
            toast.success("Security keys updated!", {
                icon: <ShieldCheck className="text-emerald-500" />
            });
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <PasswordField
                label="Current Password"
                value={currentPassword}
                show={showCurrent}
                error={fieldErrors.currentPassword}
                onToggle={() => setShowCurrent((v: boolean) => !v)}
                onChange={(v: string) => handleFieldChange(setCurrentPassword, "currentPassword", v)}
            />
            <PasswordField
                label="New Password"
                value={newPassword}
                show={showNew}
                error={fieldErrors.newPassword}
                onToggle={() => setShowNew((v: boolean) => !v)}
                onChange={(v: string) => handleFieldChange(setNewPassword, "newPassword", v)}
            />
            <PasswordField
                label="Confirm Password"
                value={confirmPassword}
                show={showConfirm}
                error={fieldErrors.confirmPassword}
                onToggle={() => setShowConfirm((v: boolean) => !v)}
                onChange={(v: string) => handleFieldChange(setConfirmPassword, "confirmPassword", v)}
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 bg-[#1f2124] text-white rounded-xl text-[13px] font-black hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-black/10 active:scale-95 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {loading ? "Processing..." : "Change Password"}
            </button>
        </form>
    );
};

const PasswordField = ({ label, value, show, error, onToggle, onChange }: any) => (
    <div className="space-y-2">
        <label className="text-[11px] font-bold text-[#bbb] uppercase tracking-wider px-1">{label}</label>
        <div className="relative group">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-5 py-3.5 pr-12 rounded-xl border text-[14px] font-bold outline-none transition-all ${
                    error 
                    ? 'border-rose-200 bg-rose-50/10 focus:border-rose-500' 
                    : 'bg-[#fcfcfc] border-[#ebebeb] focus:bg-white focus:border-[#fa8029] focus:ring-4 focus:ring-orange-500/5'
                }`}
                placeholder="••••••••"
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ddd] hover:text-[#fa8029] transition-colors"
            >
                {show ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
        </div>
        {error && <p className="text-[10px] text-rose-500 font-bold px-2">{error}</p>}
    </div>
);

const EditProfileModal: React.FC<{ 
    profile: UserProfile; 
    onClose: () => void; 
    onUpdate: () => void 
}> = ({ profile, onClose, onUpdate }) => {
    const [name, setName] = useState(profile.user.name);
    const [email, setEmail] = useState(profile.user.email);
    const [phone, setPhone] = useState(profile.employee?.phone || "");
    const [skillsText, setSkillsText] = useState(profile.employee?.skills?.join(", ") || "");
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        const skills = skillsText.split(",").map(s => s.trim()).filter(s => s !== "");
        const validation = updateProfileSchema.safeParse({ name, email, phone, skills });
        if (!validation.success) {
            setFieldErrors(getZodErrors(validation.error));
            return;
        }
        setLoading(true);
        try {
            await updateProfileApi({ name, email, phone, skills });
            toast.success("Profile sync completed!", {
                icon: <Check className="text-emerald-500" />
            });
            onUpdate(); onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Sync failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1f2124]/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in slide-in-from-bottom-4 duration-300">
                <div className="px-8 py-6 border-b flex justify-between items-center bg-[#fafafa]/50">
                    <div>
                        <h2 className="text-[14px] font-black uppercase tracking-widest text-[#1f2124]">Modify Profile Details</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl text-[#bbb] hover:bg-[#f0f0f0] hover:text-[#1f2124] transition-all"><X size={20}/></button>
                </div>
                
                <form onSubmit={handleSubmit} noValidate className="p-8 overflow-y-auto max-h-[85vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputGroup label="Full Name" value={name} error={fieldErrors.name} onChange={(v: string) => setName(v)} />
                        <InputGroup label="Official Email" value={email} error={fieldErrors.email} onChange={(v: string) => setEmail(v)} />
                        <InputGroup label="Direct Contact" value={phone} error={fieldErrors.phone} onChange={(v: string) => setPhone(v)} />
                        
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[11px] font-bold text-[#bbb] uppercase tracking-wider px-1">Technical Skills <span className="text-[#ddd] normal-case font-medium">(comma separated)</span></label>
                            <textarea 
                                value={skillsText} 
                                onChange={(e) => setSkillsText(e.target.value)}
                                className={`w-full px-5 py-4 bg-[#fcfcfc] border ${fieldErrors.skills ? 'border-rose-200 bg-rose-50/10' : 'border-[#ebebeb]'} rounded-xl text-[14px] font-bold h-24 outline-none resize-none focus:bg-white focus:border-[#fa8029] focus:ring-4 focus:ring-orange-500/5 shadow-sm transition-all`}
                            />
                        </div>
                    </div>
                    
                    <div className="pt-8 flex items-center justify-end gap-3 border-t border-gray-50 mt-8">
                         <button type="button" onClick={onClose} className="px-6 py-3 text-[13px] font-bold text-[#888] hover:text-[#1f2124] transition-colors">Discard</button>
                         <button 
                            type="submit" 
                            disabled={loading}
                            className="px-10 py-3 bg-[#1f2124] text-white rounded-xl text-[13px] font-black hover:bg-black transition-all disabled:opacity-50 shadow-lg active:scale-95"
                        >
                            {loading ? "Processing..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputGroup = ({ label, value, error, onChange }: { label: string, value: string, error?: string, onChange: (v: string) => void }) => (
    <div className="space-y-2 flex-1">
        <label className="text-[11px] font-bold text-[#bbb] uppercase tracking-wider px-1">{label}</label>
        <input 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-5 py-3.5 rounded-xl border text-[14px] font-bold outline-none transition-all ${
                error 
                    ? 'border-rose-200 bg-rose-50/10 focus:border-rose-500' 
                    : 'bg-[#fcfcfc] border-[#ebebeb] focus:bg-white focus:border-[#fa8029] focus:ring-4 focus:ring-orange-500/5'
            }`} 
        />
        {error && <p className="text-[10px] text-rose-500 font-bold px-2">{error}</p>}
    </div>
);

export default SettingsPage;


