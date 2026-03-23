import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { resendOtpApi, verifyOtpApi } from "@/api/authapi";
import { setCredentials } from "@/store/slices/authSlice"; 
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Fingerprint, Zap, Clock, Loader2, ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { toast } from "sonner";

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
            dispatch(setCredentials({ user: data.user, token: data.token, permissions: data.permissions }));
            toast.success("Identity verified! Welcome back.");
            navigate(data.user.role === 'employee' ? '/employee/dashboard' : '/company/dashboard');
        } catch (err: any) {
            const msg = err.response?.data?.message || "Verification failed. Please check your code.";
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
            toast.success("A new code has been sent!");
            setTimeLeft(60);
            setCanResend(false);
            setOtp("");
            setError("");
        } catch (err: any) {
            toast.error("Failed to resend OTP. Please try again.");
            setError("Failed to resend OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl mb-4 shadow-lg shadow-gray-200">
                        <Zap size={24} className="text-white fill-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Security check</h1>
                    <p className="text-gray-500 mt-2">
                        We've sent a 6-digit code to <br />
                        <span className="font-bold text-gray-900">{email}</span>
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-lg text-sm font-medium animate-shake text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={20} />
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter 6-digit OTP"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl text-xl font-bold tracking-[0.3em] text-center focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all placeholder:text-sm placeholder:tracking-normal placeholder:font-normal placeholder:text-gray-400"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-center gap-2 py-2">
                                {timeLeft > 0 ? (
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                                        <Clock size={14} />
                                        <span>Code expires in {timeLeft}s</span>
                                    </div>
                                ) : (
                                    <div className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full">
                                        Code expired
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-gray-200"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Verify & Sign in
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>

                            {canResend && (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={loading}
                                    className="w-full bg-white text-gray-900 py-4 rounded-xl font-bold border border-gray-100 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-70"
                                >
                                    <RotateCw size={18} className={loading ? "animate-spin" : ""} />
                                    Resend code
                                </button>
                            )}
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-50 flex justify-center">
                        <Link
                            to="/register"
                            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to registration
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

