import { changePasswordAPi, getProfileApi, type UserProfile } from "@/api/userApi";
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
} from "lucide-react";
import { useEffect, useState } from "react";

const SettingsPage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "oklch(0.556 0 0)" }} />
            </div>
        );

    if (error)
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div
                    className="p-4 rounded-lg border font-medium text-sm"
                    style={{
                        background: "oklch(0.97 0 0)",
                        color: "oklch(0.577 0.245 27.325)",
                        borderColor: "oklch(0.922 0 0)",
                    }}
                >
                    {error}
                </div>
                <button
                    onClick={fetchProfile}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: "oklch(0.205 0 0)" }}
                >
                    Try again
                </button>
            </div>
        );

    return (
        <div className="max-w-5xl mx-auto py-12 px-6">
            <h1 className="text-2xl font-semibold mb-8" style={{ color: "oklch(0.145 0 0)" }}>
                Settings
            </h1>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left — Profile */}
                <div
                    className="rounded-xl p-6"
                    style={{
                        background: "oklch(1 0 0)",
                        border: "1px solid oklch(0.922 0 0)",
                    }}
                >
                    <SectionLabel>Profile</SectionLabel>
                    <ProfileSection profile={profile} />
                </div>

                {/* Right — Security */}
                <div
                    className="rounded-xl p-6"
                    style={{
                        background: "oklch(1 0 0)",
                        border: "1px solid oklch(0.922 0 0)",
                    }}
                >
                    <SectionLabel>Security</SectionLabel>
                    <SecuritySection />
                </div>
            </div>
        </div>
    );
};

/* --- Profile Section --- */
const ProfileSection: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
    if (!profile) return null;

    return (
        <div>
            {/* Avatar + Name */}
            <div className="flex items-center gap-4 mb-6">
                <div
                    className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 overflow-hidden"
                    style={{ background: "oklch(0.922 0 0)", color: "oklch(0.205 0 0)" }}
                >
                    {profile.user.avatar ? (
                        <img src={profile.user.avatar} className="h-full w-full object-cover" alt="Avatar" />
                    ) : (
                        profile.user.name.charAt(0).toUpperCase()
                    )}
                </div>
                <div>
                    <h2 className="text-base font-semibold" style={{ color: "oklch(0.145 0 0)" }}>
                        {profile.user.name}
                    </h2>
                    <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: "oklch(0.556 0 0)" }}>
                        <Mail className="w-3.5 h-3.5" />
                        {profile.user.email}
                    </p>
                    <span
                        className="inline-block mt-1.5 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide"
                        style={{
                            background: "oklch(0.97 0 0)",
                            color: "oklch(0.205 0 0)",
                            border: "1px solid oklch(0.922 0 0)",
                        }}
                    >
                        {profile.user.role}
                    </span>
                </div>
            </div>

            {/* Divider */}
            <div className="mb-5" style={{ height: "1px", background: "oklch(0.922 0 0)" }} />

            {/* Company */}
            {profile.company && (
                <div className="mb-5">
                    <FieldLabel>Company</FieldLabel>
                    <div
                        className="flex items-start gap-3 p-3 rounded-lg mt-1.5"
                        style={{
                            background: "oklch(0.985 0 0)",
                            border: "1px solid oklch(0.922 0 0)",
                        }}
                    >
                        <Building className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "oklch(0.556 0 0)" }} />
                        <div>
                            <p className="text-sm font-medium" style={{ color: "oklch(0.145 0 0)" }}>
                                {profile.company.name}
                            </p>
                            {profile.company.about_us && (
                                <p className="text-xs mt-0.5" style={{ color: "oklch(0.556 0 0)" }}>
                                    {profile.company.about_us}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Employee Fields */}
            {profile.employee && (
                <div className="space-y-4">
                    <FieldRow icon={<Briefcase className="w-3.5 h-3.5" />} label="Designation">
                        {profile.employee.designation || "Not set"}
                    </FieldRow>
                    <FieldRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone">
                        {profile.employee.phone || "Not set"}
                    </FieldRow>
                    <FieldRow icon={<MapPin className="w-3.5 h-3.5" />} label="Address">
                        {profile.employee.address || "Not set"}
                    </FieldRow>
                    {profile.employee.skills && profile.employee.skills.length > 0 && (
                        <div className="sm:col-span-2">
                            <FieldLabel>Skills</FieldLabel>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {profile.employee.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-3 py-1 rounded text-xs font-medium"
                                        style={{
                                            background: "oklch(0.97 0 0)",
                                            color: "oklch(0.205 0 0)",
                                            border: "1px solid oklch(0.922 0 0)",
                                        }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

/* --- Security Section --- */
const SecuritySection: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"success" | "error" | "">("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Passwords don't match");
            setStatus("error");
            return;
        }
        setLoading(true);
        try {
            await changePasswordAPi({ currentPassword, newPassword });
            setMessage("Password updated successfully");
            setStatus("success");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setMessage(err.response?.data?.message || "Failed to update password");
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="w-4 h-4" style={{ color: "oklch(0.205 0 0)" }} />
                <span className="text-sm font-semibold" style={{ color: "oklch(0.145 0 0)" }}>
                    Change Password
                </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordField
                    label="Current Password"
                    value={currentPassword}
                    show={showCurrent}
                    onToggle={() => setShowCurrent((v) => !v)}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <PasswordField
                    label="New Password"
                    value={newPassword}
                    show={showNew}
                    onToggle={() => setShowNew((v) => !v)}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    show={showConfirm}
                    onToggle={() => setShowConfirm((v) => !v)}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {message && (
                    <p
                        className="text-sm py-2.5 px-3 rounded-lg"
                        style={{
                            background: "oklch(0.97 0 0)",
                            color:
                                status === "success"
                                    ? "oklch(0.4 0.12 150)"
                                    : "oklch(0.577 0.245 27.325)",
                            border: `1px solid ${
                                status === "success"
                                    ? "oklch(0.85 0.08 150)"
                                    : "oklch(0.85 0.1 27)"
                            }`,
                        }}
                    >
                        {message}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    style={{
                        background: "oklch(0.205 0 0)",
                        color: "oklch(0.985 0 0)",
                    }}
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update Password
                </button>
            </form>
        </div>
    );
};

/* --- Reusable atoms --- */
const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p
        className="text-xs font-semibold uppercase tracking-widest mb-5"
        style={{ color: "oklch(0.556 0 0)" }}
    >
        {children}
    </p>
);

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "oklch(0.556 0 0)" }}>
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
        <div className="flex items-center gap-2 mt-1 text-sm" style={{ color: "oklch(0.205 0 0)" }}>
            <span style={{ color: "oklch(0.556 0 0)" }}>{icon}</span>
            {children}
        </div>
    </div>
);

const PasswordField: React.FC<{
    label: string;
    value: string;
    show: boolean;
    onToggle: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, value, show, onToggle, onChange }) => (
    <div>
        <label className="block text-sm font-medium mb-1" style={{ color: "oklch(0.205 0 0)" }}>
            {label}
        </label>
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                required
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 pr-10 rounded-lg text-sm outline-none transition-all"
                style={{
                    border: "1px solid oklch(0.922 0 0)",
                    background: "oklch(1 0 0)",
                    color: "oklch(0.145 0 0)",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "oklch(0.708 0 0)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "oklch(0.922 0 0)")}
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
    </div>
);

export default SettingsPage;