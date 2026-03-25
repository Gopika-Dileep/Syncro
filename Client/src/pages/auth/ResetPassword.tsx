import { resetPasswordApi } from "@/api/authapi";
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Zap, CheckCircle2, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getZodErrors, resetPasswordSchema } from "@/lib/schema";
import authBannerDark from "@/assets/auth_banner_dark.png";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") ?? "";

    const [form, setForm] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");
        setFieldErrors({});

        const validation = resetPasswordSchema.safeParse(form);
        if (!validation.success) {
            setFieldErrors(getZodErrors(validation.error));
            setLoading(false);
            return;
        }

        try {
            const data = await resetPasswordApi(token, form.newPassword);
            toast.success("Password reset successfully!");
            setMessage(data.message || "Your password has been reset successfully.");
            setTimeout(() => navigate('/login'), 1500);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Reset failed. The link may be expired.";
            toast.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-[#fcfcfc] flex font-sans overflow-hidden">

            {/* ── Left Side: Auth Form area ── */}
            <div className="w-full lg:w-[480px] flex flex-col justify-center items-center p-6 bg-white relative z-10 shadow-xl overflow-hidden animate-in fade-in slide-in-from-left-6 duration-700">
                <div className="w-full max-w-[340px]">

                    {/* Brand Identity */}
                    <div className="mb-5 text-center lg:text-left flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/10 group">
                            <Zap size={16} className="text-[#fa8029] fill-[#fa8029] transition-transform group-hover:rotate-12" />
                        </div>
                        <div>
                            <h1 className="text-[17px] font-black text-[#1f2124] tracking-tight uppercase italic leading-none">Syncro</h1>
                            <p className="text-[#999] mt-1 text-[9px] font-bold uppercase tracking-[0.2em] leading-none">Infrastructure Hub</p>
                        </div>
                    </div>

                    {/* Auth Area */}
                    <div className="relative pt-4 border-t border-[#f2f2f2]">
                        <div className="mb-5 text-center lg:text-left">
                            <h2 className="text-[14px] font-black text-[#1f2124] tracking-tight uppercase leading-none">New Password</h2>
                            <p className="text-[#bbb] mt-1.5 text-[11px] font-medium leading-relaxed italic">Secure your account with a new password</p>
                        </div>

                        {!token ? (
                            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
                                <div className="bg-rose-50 border border-rose-100/50 text-rose-600 px-5 py-4 rounded-2xl text-[11px] font-bold mb-8">
                                    This recovery link is invalid or has expired.
                                </div>
                                <Link to="/forgot-password" title="Request New Link" className="inline-flex items-center gap-3 text-[11px] font-black text-[#969696] hover:text-[#fa8029] transition-colors uppercase tracking-[0.2em] group">
                                    <ArrowLeft size={16} className="text-[#fa8029] group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                                    Request New Link
                                </Link>
                            </div>
                        ) : !message ? (
                            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                                {error && (
                                    <div className="bg-rose-50 border border-rose-100/50 text-rose-600 px-4 py-2.5 rounded-2xl text-[11px] font-bold flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-lg shadow-rose-500/20"></div>
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[#969696] uppercase tracking-wider px-1">New Password</label>
                                    <div className="relative group">
                                        <input
                                            name="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min. 6 characters"
                                            className={`w-full px-5 py-3 bg-white border-2 ${fieldErrors.newPassword ? 'border-rose-200' : 'border-[#f0f0f0] hover:border-[#ebebeb] focus:border-[#fa8029]'} rounded-2xl text-[12px] font-bold outline-none transition-all placeholder:text-[#ccc] text-[#1f2124] shadow-sm`}
                                            value={form.newPassword}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#ddd] hover:text-[#fa8029] transition-colors"
                                        >
                                            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                    </div>
                                    {fieldErrors.newPassword && <p className="text-[9px] text-rose-600 font-bold px-2">{fieldErrors.newPassword}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[#969696] uppercase tracking-wider px-1">Confirm Password</label>
                                    <div className="relative group">
                                        <input
                                            name="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Repeat new password"
                                            className={`w-full px-5 py-3 bg-white border-2 ${fieldErrors.confirmPassword ? 'border-rose-200' : 'border-[#f0f0f0] hover:border-[#ebebeb] focus:border-[#fa8029]'} rounded-2xl text-[12px] font-bold outline-none transition-all placeholder:text-[#ccc] text-[#1f2124] shadow-sm`}
                                            value={form.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-[#ddd] group-focus-within:text-[#fa8029] transition-colors" size={16} />
                                    </div>
                                    {fieldErrors.confirmPassword && <p className="text-[9px] text-rose-600 font-bold px-2">{fieldErrors.confirmPassword}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#1f2124] text-white py-3.5 rounded-2xl font-black text-[12px] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 shadow-2xl shadow-black/15 uppercase tracking-[0.2em] mt-3 group"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin text-[#fa8029]" size={18} />
                                    ) : (
                                        <>
                                            Change Password
                                            <ShieldCheck size={16} className="text-[#fa8029]" />
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl mb-4">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h3 className="text-[15px] font-black text-[#1f2124] mb-2 uppercase italic tracking-tight">Access Restored</h3>
                                <p className="text-[12px] text-[#888] font-medium leading-relaxed mb-6">
                                    Your password has been successfully updated. <br />
                                    Redirecting to secure login...
                                </p>
                                <Loader2 className="animate-spin mx-auto text-[#fa8029]" size={20} />
                            </div>
                        )}

                        <div className="mt-8 text-center pt-6 border-t border-[#f2f2f2]">
                            <Link
                                to="/login"
                                className="flex items-center justify-center gap-3 text-[11px] font-black text-[#969696] hover:text-[#fa8029] transition-colors uppercase tracking-[0.2em] group"
                            >
                                <ArrowLeft size={16} strokeWidth={2.5} className="text-[#fa8029] group-hover:-translate-x-1 transition-transform" />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Meta area */}
                <div className="absolute bottom-10 left-0 w-full text-center px-12 flex justify-between items-center opacity-40 select-none hidden lg:flex">
                    <p className="text-[9px] font-black text-[#969696] uppercase tracking-widest flex items-center gap-3">
                        <ShieldCheck size={12} className="text-[#fa8029]" />
                        Secure Node
                    </p>
                    <p className="text-[9px] font-black text-[#969696] uppercase tracking-widest leading-none">
                        &copy; 2026 Syncro
                    </p>
                </div>
            </div>

            {/* ── Right Side: Design Content Panel Area ── */}
            <div className="hidden lg:flex flex-1 bg-[#1a1c1f] relative items-center justify-center overflow-hidden border-l border-white/5">
                <img
                    src={authBannerDark}
                    alt="Network Asset"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 animate-in fade-in duration-1000"
                />

                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/80 z-10"></div>
                <div className="absolute inset-0 bg-black/20 z-10"></div>

                <div className="relative z-20 p-20 max-w-[700px] animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
                    <div className="inline-block px-10 py-[1.5px] bg-[#fa8029] mb-12 shadow-2xl shadow-orange-500/30"></div>
                    <h2 className="text-[54px] font-black text-white leading-[0.95] tracking-tighter uppercase mb-10 italic">
                        Security <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fa8029] to-orange-400">Reconfiguration</span> <br />
                        Protocol.
                    </h2>
                    <p className="text-white/60 text-[18px] font-medium leading-relaxed max-w-[500px] italic">
                        Establishing new security credentials for your organizational synchronization node.
                    </p>
                </div>
            </div>
        </div>
    );
}
