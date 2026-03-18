import { resetPasswordApi } from "@/api/authapi";
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Zap, CheckCircle2, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") ?? "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setMessage("");
        setError("");
        
        try {
            const data = await resetPasswordApi(token, newPassword);
            setMessage(data.message || "Your password has been reset successfully.");
            // Redirect after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Reset failed. The link may be expired.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl mb-4 shadow-lg shadow-gray-200">
                        <Zap size={24} className="text-white fill-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Set new password</h1>
                    <p className="text-gray-500 mt-2">Your new password must be different from previous passwords.</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                    {!token ? (
                        <div className="text-center py-4">
                            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-sm font-medium">
                                Invalid or missing reset token. Please request a new link.
                            </div>
                           <Link to="/forgot-password" className="inline-flex items-center gap-2 text-gray-900 font-bold hover:text-gray-700 transition-colors">
                                <ArrowLeft size={16} />
                                Request new link
                            </Link>
                        </div>
                    ) : !message ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-lg text-sm font-medium animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        placeholder="Min. 8 characters"
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[15px] focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        placeholder="Repeat new password"
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[15px] focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !newPassword}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-gray-200 mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Reset password
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-2xl mb-6 rotate-3 shadow-xl">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Password reset!</h3>
                            <p className="text-gray-500 leading-relaxed mb-6">
                                Your password has been successfully updated. <br />
                                Redirecting you to login...
                            </p>
                            <Loader2 className="animate-spin mx-auto text-gray-400" size={24} />
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors inline-flex items-center gap-2">
                        <ArrowLeft size={16} />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
