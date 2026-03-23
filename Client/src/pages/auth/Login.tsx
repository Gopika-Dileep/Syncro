import { loginApi } from "@/api/authapi";
import { setCredentials } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store/store";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getZodErrors, loginSchema } from "@/lib/schema";

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
            toast.success("Welcome back! Login successful.");
            navigate(data.user.role === "company" ? "/company/dashboard" : "/employee/dashboard");
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Invalid credentials";
            toast.error(msg);
            setError(msg);
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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
                    <p className="text-gray-500 mt-2">Enter your details to access your dashboard</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        {error && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-lg text-sm font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border ${fieldErrors.email ? 'border-rose-400 focus:ring-rose-50' : 'border-gray-100 focus:ring-gray-100'} rounded-xl text-[15px] focus:bg-white focus:border-gray-900 focus:ring-4 outline-none transition-all placeholder:text-gray-400`}
                                />
                            </div>
                            {fieldErrors.email && <p className="text-[11px] text-rose-600 font-bold px-1">{fieldErrors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <button
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-12 py-3 bg-gray-50 border ${fieldErrors.password ? 'border-rose-400 focus:ring-rose-50' : 'border-gray-100 focus:ring-gray-100'} rounded-xl text-[15px] focus:bg-white focus:border-gray-900 focus:ring-4 outline-none transition-all placeholder:text-gray-400`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {fieldErrors.password && <p className="text-[11px] text-rose-600 font-bold px-1">{fieldErrors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-gray-200"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                    <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{" "}
                            <Link to="/register" className="font-bold text-gray-900 hover:text-gray-700 transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-xs mt-8">
                    &copy; 2026 Syncro Technologies Inc. All rights reserved.
                </p>
            </div>
        </div>
    );
}

