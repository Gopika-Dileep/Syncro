import { registerApi } from "@/api/authapi";
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { User, Mail, Lock, Building2, Zap, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getZodErrors, registerSchema } from "@/lib/schema";

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
            toast.success("Account created successfully!");
            navigate('/verify-otp', { state: { email: form.email } });
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Something went wrong";
            toast.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl mb-4 shadow-lg shadow-gray-200">
                        <Zap size={24} className="text-white fill-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create workspace</h1>
                    <p className="text-gray-500 mt-2">Start managing your teams and projects today</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 lg:p-10">
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-lg text-sm font-medium mb-2">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        name="name"
                                        placeholder="John Doe"
                                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${fieldErrors.name ? 'border-rose-400' : 'border-gray-100'} rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all cursor-text`}
                                        value={form.name}
                                        onChange={handleChange}
                                    />
                                </div>
                                {fieldErrors.name && <p className="text-[10px] text-rose-600 font-bold px-1">{fieldErrors.name}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Company</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        name="companyName"
                                        placeholder="Syncro Inc."
                                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${fieldErrors.companyName ? 'border-rose-400' : 'border-gray-100'} rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all cursor-text`}
                                        value={form.companyName}
                                        onChange={handleChange}
                                    />
                                </div>
                                {fieldErrors.companyName && <p className="text-[10px] text-rose-600 font-bold px-1">{fieldErrors.companyName}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="jdoe@company.com"
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border ${fieldErrors.email ? 'border-rose-400' : 'border-gray-100'} rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all`}
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                            {fieldErrors.email && <p className="text-[10px] text-rose-600 font-bold px-1">{fieldErrors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={16} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 6 chars (A-z, 0-9, !@#)"
                                    className={`w-full pl-10 pr-12 py-2.5 bg-gray-50 border ${fieldErrors.password ? 'border-rose-400 focus:ring-rose-50' : 'border-gray-100 focus:ring-gray-100'} rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all placeholder:text-gray-400`}
                                    value={form.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {fieldErrors.password && <p className="text-[10px] text-rose-600 font-bold px-1">{fieldErrors.password}</p>}
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-gray-200 mt-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                    <>
                                        Get Started
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Already have an account?{" "}
                            <Link to="/login" className="font-bold text-gray-900 hover:text-gray-700 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

