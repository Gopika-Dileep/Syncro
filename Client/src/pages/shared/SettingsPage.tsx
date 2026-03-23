import { changePasswordAPi, getProfileApi, updateProfileApi, type UserProfile } from "@/api/userApi";
import {
    Mail,
    Building,
    Briefcase,
    Phone,
    MapPin,
    Loader2,
    ShieldCheck,
    Eye,
    EyeOff,
    Calendar,
    Users,
    Edit3,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getZodErrors, updateProfileSchema, changePasswordSchema } from "@/lib/schema";
import { toast } from "sonner";

/* --- 1. REUSABLE ATOMS (Atoms available globally in the file) --- */

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: "oklch(0.556 0 0)" }}>
        {children}
    </p>
);

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "oklch(0.556 0 0)" }}>
        {children}
    </p>
);

const FieldRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}> = ({ icon, label, children }) => (
    <div>
        <FieldLabel>{label}</FieldLabel>
        <div className="flex items-center gap-2 mt-1 text-sm font-bold" style={{ color: "oklch(0.205 0 0)" }}>
            <span style={{ color: "oklch(0.556 0 0)" }}>{icon}</span>
            {children}
        </div>
    </div>
);

const PasswordField: React.FC<{
    label: string;
    value: string;
    show: boolean;
    error?: string;
    onToggle: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, value, show, error, onToggle, onChange }) => (
    <div className="space-y-1.5">
        <label className="block text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: "oklch(0.556 0 0)" }}>
            {label}
        </label>
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-bold outline-none transition-all ${error ? 'border-red-400 bg-red-50/20' : ''}`}
                style={{
                    border: error ? "1px solid #f87171" : "1px solid oklch(0.922 0 0)",
                    background: error ? "rgba(254, 242, 242, 0.2)" : "oklch(1 0 0)",
                    color: "oklch(0.145 0 0)",
                }}
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "oklch(0.556 0 0)" }}
            >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
        </div>
        {error && <p className="text-[10px] text-red-500 font-bold px-1">{error}</p>}
    </div>
);

const InputGroup = ({ label, value, onChange, error }: { label: string, value: string, onChange: (v: string) => void, error?: string }) => (
    <div className="space-y-1.5 flex-1 min-w-[200px]">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
        <input 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className={`w-full px-4 py-2.5 bg-slate-50 border ${error ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-bold outline-none focus:border-slate-800 transition-all`}
        />
        {error && <p className="text-[10px] text-red-500 font-bold px-1">{error}</p>}
    </div>
);


/* --- 2. MAIN PAGE COMPONENT --- */

const SettingsPage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getProfileApi();
            setProfile(data);
        } catch (err) {
            setError("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    if (loading)
        return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" style={{ color: "oklch(0.556 0 0)" }} /></div>;

    if (error)
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4 text-center">
                <div className="p-4 rounded-xl border border-red-100 bg-red-50 text-red-600 font-bold text-sm">{error}</div>
                <button onClick={fetchProfile} className="text-sm font-semibold hover:underline">Try again</button>
            </div>
        );

    if (!profile) return null;

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left Card — Profile */}
                <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <SectionLabel>My Profile</SectionLabel>
                        {profile?.user.role !== "company" && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center gap-2 text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-all"
                            >
                                <Edit3 size={12} /> Edit
                            </button>
                        )}
                    </div>
                    <ProfileSection profile={profile} />
                </div>

                {/* Right Card — Security */}
                <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
                    <SectionLabel>Authentication & Security</SectionLabel>
                    <SecuritySection />
                </div>
            </div>

            {/* EDIT MODAL */}
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


/* --- 3. SUB-COMPONENTS --- */

const EditProfileModal: React.FC<{ 
    profile: UserProfile; 
    onClose: () => void; 
    onUpdate: () => void 
}> = ({ profile, onClose, onUpdate }) => {
    const [name, setName] = useState(profile.user.name);
    const [email, setEmail] = useState(profile.user.email);
    const [phone, setPhone] = useState(profile.employee?.phone || "");
    const [address, setAddress] = useState(profile.employee?.address || "");
    const [skillsText, setSkillsText] = useState(profile.employee?.skills?.join(", ") || "");
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});
        
        const skills = skillsText.split(",").map(s => s.trim()).filter(s => s !== "");
        const validation = updateProfileSchema.safeParse({ name, email, phone, address, skills });

        if (!validation.success) {
            setFieldErrors(getZodErrors(validation.error));
            return;
        }

        setLoading(true);
        try {
            await updateProfileApi({ name, email, phone, address, skills });
            toast.success("Profile updated successfully!");
            onUpdate();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
                    <h2 className="text-xs font-black uppercase tracking-widest italic">Update Contact Information</h2>
                    <button onClick={onClose}><X size={18}/></button>
                </div>
                <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
                    <InputGroup label="Full Name" value={name} error={fieldErrors.name} onChange={(v) => handleFieldChange(setName, "name", v)} />
                    <InputGroup label="Email Address" value={email} error={fieldErrors.email} onChange={(v) => handleFieldChange(setEmail, "email", v)} />
                    <InputGroup label="Phone Number" value={phone} error={fieldErrors.phone} onChange={(v) => handleFieldChange(setPhone, "phone", v)} />
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Skills (comma separated)</label>
                        <textarea 
                            value={skillsText} 
                            onChange={(e) => handleFieldChange(setSkillsText, "skills", e.target.value)}
                            className={`w-full px-4 py-2.5 bg-slate-50 border ${fieldErrors.skills ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-bold h-20 outline-none resize-none focus:border-slate-800`}
                        />
                        {fieldErrors.skills && <p className="text-[10px] text-red-500 font-bold px-1">{fieldErrors.skills}</p>}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Home Address</label>
                        <textarea 
                            value={address} 
                            onChange={(e) => handleFieldChange(setAddress, "address", e.target.value)}
                            className={`w-full px-4 py-2.5 bg-slate-50 border ${fieldErrors.address ? 'border-red-400' : 'border-slate-200'} rounded-xl text-sm font-bold outline-none resize-none focus:border-slate-800`}
                            rows={2}
                        />
                        {fieldErrors.address && <p className="text-[10px] text-red-500 font-bold px-1">{fieldErrors.address}</p>}
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-black disabled:opacity-50"
                    >
                        {loading ? "Saving Changes..." : "Save My Profile"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ProfileSection: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
    if (!profile) return null;

    return (
        <div>
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold bg-slate-100 overflow-hidden border border-slate-100">
                    {profile.user.avatar ? (
                        <img src={profile.user.avatar} className="h-full w-full object-cover" />
                    ) : (
                        profile.user.name.charAt(0).toUpperCase()
                    )}
                </div>
                <div>
                    <h2 className="text-lg font-bold">{profile.user.name}</h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5"><Mail size={12}/> {profile.user.email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded">
                        {profile.user.role}
                    </span>
                </div>
            </div>

            <div className="mb-6 border-t pt-6 space-y-5">
                {profile.company && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <FieldLabel>Organization</FieldLabel>
                        <div className="flex items-center gap-3 mt-1 text-sm font-bold">
                            <Building size={14} className="text-slate-400" />
                            {profile.company.name}
                        </div>
                    </div>
                )}

                {profile.employee && (
                    <div className="grid grid-cols-1 gap-5">
                        <FieldRow icon={<Briefcase size={14} />} label="Professional Role">
                            {profile.employee.designation || "Not specified"}
                        </FieldRow>
                        <FieldRow icon={<Calendar size={14} />} label="Date of Joining">
                            {profile.employee.date_of_joining ? new Date(profile.employee.date_of_joining).toLocaleDateString() : "TBD"}
                        </FieldRow>
                        <FieldRow icon={<Users size={14} />} label="Internal Team">
                            {profile.employee.team?.name || "Unassigned"}
                        </FieldRow>
                        <FieldRow icon={<Phone size={14} />} label="Contact phone">
                            {profile.employee.phone || "Not provided"}
                        </FieldRow>
                        <FieldRow icon={<MapPin size={14} />} label="Residence Address">
                            {profile.employee.address || "Not documented"}
                        </FieldRow>

                        {profile.employee.skills && profile.employee.skills.length > 0 && (
                            <div className="mt-2">
                                <FieldLabel>Technical Expertise</FieldLabel>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profile.employee.skills.map((skill) => (
                                        <span key={skill} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-700">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

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
            toast.success("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-black uppercase tracking-widest text-slate-800">
                    Change Password
                </span>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <PasswordField
                    label="Current Password"
                    value={currentPassword}
                    show={showCurrent}
                    error={fieldErrors.currentPassword}
                    onToggle={() => setShowCurrent((v) => !v)}
                    onChange={(e) => handleFieldChange(setCurrentPassword, "currentPassword", e.target.value)}
                />
                <PasswordField
                    label="New Password"
                    value={newPassword}
                    show={showNew}
                    error={fieldErrors.newPassword}
                    onToggle={() => setShowNew((v) => !v)}
                    onChange={(e) => handleFieldChange(setNewPassword, "newPassword", e.target.value)}
                />
                <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    show={showConfirm}
                    error={fieldErrors.confirmPassword}
                    onToggle={() => setShowConfirm((v) => !v)}
                    onChange={(e) => handleFieldChange(setConfirmPassword, "confirmPassword", e.target.value)}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 mt-2"
                >
                    {loading ? "Updating..." : "Confirm Update"}
                </button>
            </form>
        </div>
    );
};

export default SettingsPage;
