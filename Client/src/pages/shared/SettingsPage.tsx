import { changePasswordAPi, getProfileApi, type UserProfile } from "@/api/userApi";
import { 
    User, 
    Lock, 
    Mail, 
    Building, 
    Briefcase, 
    Phone, 
    MapPin, 
    Loader2 
} from "lucide-react";
import { useEffect, useState } from "react"



const SettingsPage :React.FC =()=>{
    const [activeTab,setActiveTab] = useState<'profile' | 'security' >('profile');
    const [profile,setProfile] = useState<UserProfile | null>(null);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState('');

    useEffect(()=>{
        fetchProfile();
    }, []);

    const fetchProfile = async () =>{
        try{
            const data = await getProfileApi();
            setProfile(data);
        }catch (err) {
            setError("failed to load profile");
        }finally{
            setLoading (false);
        }
    };

    if(loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600"/>

        </div>
    );

        if (error) return (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 font-medium">
                {error}
            </div>
            <button 
                onClick={fetchProfile} 
                className="text-blue-600 hover:underline text-sm font-semibold"
            >
                Try Again
            </button>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
 <div className="flex gap-8">
                {/* Sidebar Navigation */}
                <div className="w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <User className="w-5 h-5" />
                            My Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                activeTab === 'security' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            <Lock className="w-5 h-5" />
                            Security
                        </button>
                    </nav>
                </div>
                {/* Content Area */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {activeTab === 'profile' ? (
                        <ProfileSection profile={profile} />
                    ) : (
                        <SecuritySection />
                    )}
                </div>
            </div>
        </div>
    );
};
/* --- Profile Section Component --- */
const ProfileSection: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
    if (!profile) return null;
    return (
        <div className="p-8">
            <div className="flex items-center gap-6 mb-8">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {profile.user.avatar ? (
                        <img src={profile.user.avatar} className="h-full w-full rounded-full object-cover" alt="Avatar" />
                    ) : profile.user.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{profile.user.name}</h2>
                    <p className="text-gray-500 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> {profile.user.email}
                    </p>
                    <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wider">
                        {profile.user.role}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-t border-gray-100">
                {/* Company Details */}
                {profile.company && (
                    <div className="col-span-2">
                        <h3 className="text-sm font-semibold uppercase text-gray-400 tracking-wider mb-4">Company Info</h3>
                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                            <Building className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">{profile.company.name}</p>
                                <p className="text-gray-600 mt-1">{profile.company.about_us || 'No description provided.'}</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Employee Details */}
                {profile.employee && (
                    <>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Designation</label>
                            <div className="flex items-center gap-2 mt-1 text-gray-700">
                                <Briefcase className="w-4 h-4" /> {profile.employee.designation || 'Not set'}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Phone</label>
                            <div className="flex items-center gap-2 mt-1 text-gray-700">
                                <Phone className="w-4 h-4" /> {profile.employee.phone || 'Not set'}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
                            <div className="flex items-center gap-2 mt-1 text-gray-700">
                                <MapPin className="w-4 h-4" /> {profile.employee.address || 'Not set'}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs font-bold text-gray-400 uppercase">Skills</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {profile.employee.skills?.length ? profile.employee.skills.map(skill => (
                                    <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">
                                        {skill}
                                    </span>
                                )) : 'No skills listed'}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
/* --- Security Section Component (Change Password) --- */
const SecuritySection: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'success' | 'error' | ''>('');
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage("Passwords don't match");
            setStatus('error');
            return;
        }
        
        setLoading(true);
        try {
            await changePasswordAPi({ currentPassword, newPassword });
            setMessage('Password updated successfully!');
            setStatus('success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Failed to update password');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Change Password</h3>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-sm">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input 
                        type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input 
                        type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input 
                        type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                {message && (
                    <div className={`p-3 rounded-lg text-sm ${status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message}
                    </div>
                )}
                <button
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Update Password
                </button>
            </form>
        </div>
    );
};

export default  SettingsPage