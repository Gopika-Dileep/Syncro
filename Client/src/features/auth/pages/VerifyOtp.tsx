import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { resendOtpApi, verifyOtpApi } from "@/features/auth/api/authapi";
import { setAuth } from "@/store/slices/authSlice";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Zap, Clock, Loader2, ArrowLeft, ArrowRight, RotateCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import authBanner from "@/assets/auth_banner.png";

export default function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const email = location.state?.email || "";
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }

        if (timeLeft > 0) {
            const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timerId);
        } else {
            setCanResend(true);
        }
    }, [timeLeft, email, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await verifyOtpApi(email, otp);
            dispatch(setAuth({ user: data.user, token: data.token, permissions: data.permissions }));
            toast.success("Identity verified!");
            navigate(data.user.role === 'employee' ? '/employee/dashboard' : '/company/dashboard');
        } catch (err) {
            let msg = "Verification failed. Check your code.";
            if (axios.isAxiosError(err)) {
                msg = err.response?.data?.message || msg;
            } else if (err instanceof Error) {
                msg = err.message;
            }
            toast.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await resendOtpApi(email);
            toast.success("Security code resent.");
            setTimeLeft(60);
            setCanResend(false);
            setOtp("");
            setError("");
        } catch {
            toast.error("Failed to resend. Retry shortly.");
            setError("Failed to resend. Retry shortly.");
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
                            <h2 className="text-[14px] font-black text-[#1f2124] tracking-tight uppercase leading-none">Verify Email</h2>
                            <p className="text-[#bbb] mt-1.5 text-[11px] font-medium leading-relaxed italic">Enter the 6-digit code</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            {error && (
                                <div className="bg-rose-50 border border-rose-100/50 text-rose-600 px-4 py-2.5 rounded-2xl text-[11px] font-bold flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-lg shadow-rose-500/20"></div>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4 text-center">
                                <label className="text-[10px] font-black text-[#969696] uppercase tracking-wider px-1">Security Code</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        className="w-full px-5 py-3 bg-white border-2 border-[#f0f0f0] rounded-2xl text-[20px] font-black tracking-[0.4em] text-center focus:border-[#fa8029] shadow-sm outline-none transition-all placeholder:text-[#ddd] text-[#1f2124]"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-center">
                                    {timeLeft > 0 ? (
                                        <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#969696] bg-[#fcfcfc] border border-[#f5f5f5] px-4 py-2 rounded-full">
                                            <Clock size={12} className="text-[#fa8029]" />
                                            <span>Expires in {timeLeft}s</span>
                                        </div>
                                    ) : (
                                        <div className="text-[10px] font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-full border border-rose-100/50 animate-pulse">
                                            OTP expired
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-full bg-[#1f2124] text-white py-3.5 rounded-2xl font-black text-[12px] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 shadow-2xl shadow-black/15 uppercase tracking-[0.2em] mt-3 group"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin text-[#fa8029]" size={18} />
                                    ) : (
                                        <>
                                            Verify OTP
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-[#fa8029]" />
                                        </>
                                    )}
                                </button>

                                {canResend && (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="w-full bg-white text-[#1f2124] py-3 rounded-2xl font-black text-[10px] border-2 border-[#f0f0f0] flex items-center justify-center gap-3 hover:bg-[#fafafa] transition-all active:scale-[0.98] disabled:opacity-70 uppercase tracking-widest shadow-sm"
                                    >
                                        <RotateCw size={14} className={loading ? "animate-spin text-[#fa8029]" : "text-[#fa8029]"} strokeWidth={3} />
                                        Resend Code
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="mt-8 text-center pt-6 border-t border-[#f2f2f2]">
                            <Link
                                to="/register"
                                className="flex items-center justify-center gap-3 text-[11px] font-black text-[#969696] hover:text-[#fa8029] transition-colors uppercase tracking-[0.2em] group"
                            >
                                <ArrowLeft size={16} strokeWidth={2.5} className="text-[#fa8029] group-hover:-translate-x-1 transition-transform" />
                                Return to Sign Up
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

            {/* ── Right Side: Design Content Panel Area (Light Mode to match Register) ── */}
            <div className="hidden lg:flex flex-1 bg-white relative items-center justify-center overflow-hidden border-l border-[#f5f5f5]">
                <img
                    src={authBanner}
                    alt="Network Asset"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 animate-in fade-in duration-1000"
                />

                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/60 z-10"></div>

                <div className="relative z-20 p-20 max-w-[700px] animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
                    <div className="inline-block px-10 py-[1.5px] bg-[#fa8029] mb-12 shadow-2xl shadow-orange-500/30"></div>
                    <h2 className="text-[54px] font-black text-[#1f2124] leading-[0.95] tracking-tighter uppercase mb-10 italic">
                        Identity <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fa8029] to-orange-400">Authentication</span> <br />
                        Flow.
                    </h2>
                    <p className="text-[#666] text-[18px] font-medium leading-relaxed max-w-[500px] italic">
                        Validating node access through secure, multi-factor synchronization protocols. Enter your verification code to continue.
                    </p>
                </div>
            </div>
        </div>
    );
}
