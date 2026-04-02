import { loginApi } from "@/api/authapi";
import axios from "axios";
import { setCredentials } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store/store";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Mail, Eye, EyeOff, Loader2, ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getZodErrors, loginSchema } from "@/lib/schema";
import authBannerDark from "@/assets/auth_banner_dark.png";

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[e.target.name];
                return updated;
            });
        }
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});

        const validation = loginSchema.safeParse(form);
        if (!validation.success) {
            setFieldErrors(getZodErrors(validation.error));
            return;
        }

        setLoading(true);
        try {
            const data = await loginApi(form.email, form.password);
            dispatch(setCredentials({ user: data.user, token: data.token, permissions: data.permissions }));
            toast.success("Welcome back.");
            navigate(data.user.role === "company" ? "/company/dashboard" : "/employee/dashboard");
        } catch (err) {
            let msg = "Invalid credentials";
            if (axios.isAxiosError(err)) {
                msg = err.response?.data?.message || err.message || msg;
            } else if (err instanceof Error) {
                msg = err.message;
            }
            toast.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-[#fcfcfc] flex font-sans overflow-hidden">

            {/* ── Left Side: Auth Form area (Light UI) ── */}
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
                            <h2 className="text-[14px] font-black text-[#1f2124] tracking-tight uppercase leading-none">Login</h2>
                            <p className="text-[#bbb] mt-1.5 text-[11px] font-medium leading-relaxed italic">Access your unified project dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            {error && (
                                <div className="bg-rose-50 border border-rose-100/50 text-rose-600 px-4 py-2.5 rounded-2xl text-[11px] font-bold flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-lg shadow-rose-500/20"></div>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#969696] uppercase tracking-wider px-1">Email</label>
                                <div className="relative group">
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="operator@syncro.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className={`w-full px-5 py-3 bg-white border-2 ${fieldErrors.email ? 'border-rose-200 shadow-[inset_0_2px_4px_rgba(225,29,72,0.02)]' : 'border-[#f0f0f0] hover:border-[#ebebeb] focus:border-[#fa8029] focus:shadow-[0_0_20px_rgba(250,128,41,0.06)] shadow-sm'} rounded-2xl text-[12px] font-bold outline-none transition-all placeholder:text-[#ccc] text-[#1f2124]`}
                                    />
                                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-[#ddd] group-focus-within:text-[#fa8029] transition-colors" size={16} />
                                </div>
                                {fieldErrors.email && <p className="text-[9px] text-rose-600 font-bold px-2">{fieldErrors.email}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black text-[#969696] uppercase tracking-wider">Password</label>
                                    <Link to="/forgot-password" title="Forgot Password?" className="text-[10px] font-bold text-[#fa8029] hover:underline underline-offset-4 decoration-2">Forgot Password?</Link>
                                </div>
                                <div className="relative group">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        className={`w-full px-5 py-3 bg-white border-2 ${fieldErrors.password ? 'border-rose-200 shadow-[inset_0_2_4px_rgba(225,29,72,0.02)]' : 'border-[#f0f0f0] hover:border-[#ebebeb] focus:border-[#fa8029] focus:shadow-[0_0_20px_rgba(250,128,41,0.06)] shadow-sm'} rounded-2xl text-[12px] font-bold outline-none transition-all placeholder:text-[#ccc] text-[#1f2124]`}
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-[#ddd] hover:text-[#fa8029] transition-colors"
                                        >
                                            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                        <div className="w-[1px] h-4 bg-[#f0f0f0]"></div>
                                        <Lock size={16} className="text-[#ddd] group-focus-within:text-[#fa8029] transition-colors" />
                                    </div>
                                </div>
                                {fieldErrors.password && <p className="text-[9px] text-rose-600 font-bold px-2">{fieldErrors.password}</p>}
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
                                        Login
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-[#fa8029]" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center pt-6 border-t border-[#f2f2f2]">
                            <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest leading-loose">
                                Don't have an account? <br />
                                <Link to="/register" className="text-[#fa8029] font-black hover:underline underline-offset-8 decoration-2 text-[12px]">Sign Up Now</Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Meta area */}
                <div className="absolute bottom-10 left-0 w-full text-center px-12 flex justify-between items-center opacity-40 select-none hidden lg:flex">
                    <p className="text-[9px] font-black text-[#969696] uppercase tracking-widest flex items-center gap-3">
                        <ShieldCheck size={12} className="text-[#fa8029]" />
                        Secure Session
                    </p>
                    <p className="text-[9px] font-black text-[#969696] uppercase tracking-widest leading-none">
                        &copy; 2026 Syncro
                    </p>
                </div>
            </div>

            {/* ── Right Side: Design Content Panel Area (Dark-Mode Variation) ── */}
            <div className="hidden lg:flex flex-1 bg-[#1a1c1f] relative items-center justify-center overflow-hidden border-l border-white/5">
                <img
                    src={authBannerDark}
                    alt="Network Asset"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 animate-in fade-in duration-1000"
                />

                {/* Dark Overlays */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/80 z-10"></div>
                <div className="absolute inset-0 bg-black/20 z-10"></div>

                <div className="relative z-20 p-20 max-w-[700px] animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
                    <div className="inline-block px-10 py-[1.5px] bg-[#fa8029] mb-12 shadow-2xl shadow-orange-500/30"></div>
                    <h2 className="text-[54px] font-black text-white leading-[0.95] tracking-tighter uppercase mb-10 italic">
                        The ultimate <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fa8029] to-orange-400">Project Flow</span> <br />
                        infrastructure.
                    </h2>
                    <p className="text-white/60 text-[18px] font-medium leading-relaxed max-w-[500px] italic">
                        Building the next generation of team synchronization. Modern workflows, real-time collaboration, and enterprise performance.
                    </p>

                    {/* Visual accent */}
                    <div className="mt-16 flex items-center gap-10 opacity-60">
                        <div className="flex flex-col">
                            <span className="text-white text-[24px] font-black leading-none">99.9%</span>
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Uptime Node</span>
                        </div>
                        <div className="w-[1px] h-10 bg-white/10"></div>
                        <div className="flex flex-col">
                            <span className="text-white text-[24px] font-black leading-none">Global</span>
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Scalability</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}