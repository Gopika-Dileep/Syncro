import { registerApi } from "@/features/auth/api/authapi";
import axios from "axios";
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { User, Mail, Building2, Zap, Loader2, ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getZodErrors, registerSchema } from "@/lib/schema";
import authBanner from "@/assets/auth_banner.png";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", companyName: "" });
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

        const validation = registerSchema.safeParse(form);

        if (!validation.success) {
            setFieldErrors(getZodErrors(validation.error));
            return;
        }
        setLoading(true);
        try {
            await registerApi(form.name, form.email, form.password, form.companyName);
            toast.success("Registration initiated.");
            navigate('/verify-otp', { state: { email: form.email } });
        } catch (err) {
            let msg = "Something went wrong";
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
                            <h2 className="text-[14px] font-black text-[#1f2124] tracking-tight uppercase leading-none">Sign Up</h2>
                            <p className="text-[#bbb] mt-1.5 text-[11px] font-medium leading-relaxed italic">Create your corporate synchronization node</p>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
                            {error && (
                                <div className="bg-rose-50 border border-rose-100/50 text-rose-600 px-4 py-2.5 rounded-2xl text-[11px] font-bold flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-lg shadow-rose-500/20"></div>
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[#999] uppercase tracking-wider px-1">Full Name</label>
                                    <div className="relative group">
                                        <input
                                            name="name"
                                            placeholder="John Doe"
                                            className={`w-full px-4 py-2 bg-white border-2 ${fieldErrors.name ? 'border-rose-200' : 'border-[#f0f0f0] hover:border-[#ebebeb] focus:border-[#fa8029]'} rounded-xl text-[12px] font-bold outline-none transition-all placeholder:text-[#ccc] text-[#1f2124]`}
                                            value={form.name}
                                            onChange={handleChange}
                                        />
                                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ddd] group-focus-within:text-[#fa8029] transition-colors" size={14} />
                                    </div>
                                    {fieldErrors.name && <p className="text-[9px] text-rose-600 font-bold px-2">{fieldErrors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[#999] uppercase tracking-wider px-1">Company</label>
                                    <div className="relative group">
                                        <input
                                            name="companyName"
                                            placeholder="Syncro Inc"
                                            className={`w-full px-4 py-2 bg-white border-2 ${fieldErrors.companyName ? 'border-rose-200' : 'border-[#f0f0f0] hover:border-[#ebebeb] focus:border-[#fa8029]'} rounded-xl text-[12px] font-bold outline-none transition-all placeholder:text-[#ccc] text-[#1f2124]`}
                                            value={form.companyName}
                                            onChange={handleChange}
                                        />
                                        <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ddd] group-focus-within:text-[#fa8029] transition-colors" size={14} />
                                    </div>
                                    {fieldErrors.companyName && <p className="text-[9px] text-rose-600 font-bold px-2">{fieldErrors.companyName}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#999] uppercase tracking-wider px-1">Work Email</label>
                                <div className="relative group">
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="operator@syncro.com"
                                        className={`w-full px-4 py-2 bg-white border-2 ${fieldErrors.email ? 'border-rose-200' : 'border-[#f0f0f0] hover:border-[#ebebeb] focus:border-[#fa8029]'} rounded-xl text-[12px] font-bold outline-none transition-all placeholder:text-[#ccc] text-[#1f2124]`}
                                        value={form.email}
                                        onChange={handleChange}
                                    />
                                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ddd] group-focus-within:text-[#fa8029] transition-colors" size={14} />
                                </div>
                                {fieldErrors.email && <p className="text-[9px] text-rose-600 font-bold px-2">{fieldErrors.email}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[#969696] uppercase tracking-wider px-1">Password</label>
                                <div className="relative group">
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`w-full px-4 py-2 bg-white border-2 ${fieldErrors.password ? 'border-rose-200' : 'border-[#f0f0f0] hover:border-[#ebebeb] focus:border-[#fa8029]'} rounded-xl text-[12px] font-bold outline-none transition-all placeholder:text-[#ccc] text-[#1f2124]`}
                                        value={form.password}
                                        onChange={handleChange}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-4">
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
                                className="w-full bg-[#1f2124] text-white py-3 rounded-xl font-black text-[12px] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 shadow-2xl shadow-black/15 uppercase tracking-[0.2em] mt-3 group"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin text-[#fa8029]" size={16} />
                                ) : (
                                    <>
                                        Sign Up
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-[#fa8029]" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center pt-6 border-t border-[#f2f2f2]">
                            <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest leading-loose">
                                Already have an account? <br />
                                <Link to="/login" className="text-[#fa8029] font-black hover:underline underline-offset-8 decoration-2 text-[12px]">Login Now</Link>
                            </p>
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
            <div className="hidden lg:flex flex-1 bg-white relative items-center justify-center overflow-hidden border-l border-[#f5f5f5]">
                {/* Generated Light Mode Background Image */}
                <img
                    src={authBanner}
                    alt="Network Asset"
                    className="absolute inset-0 w-full h-full object-cover opacity-80 animate-in fade-in duration-1000"
                />

                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/60 z-10"></div>

                <div className="relative z-20 p-12 max-w-[600px] animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
                    <div className="inline-block px-8 py-[1px] bg-[#fa8029] mb-8 shadow-2xl shadow-orange-500/30"></div>
                    <h2 className="text-[42px] font-black text-[#1f2124] leading-[0.95] tracking-tighter uppercase mb-6 italic">
                        Architecting <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fa8029] to-orange-400">Total Symmetry</span> <br />
                        across teams.
                    </h2>
                    <p className="text-[#666] text-[15px] font-medium leading-relaxed max-w-[400px] italic">
                        The ultimate infrastructure for enterprise synchronization. Visualize your entire organizational flow.
                    </p>
                </div>
            </div>
        </div>
    );
}
