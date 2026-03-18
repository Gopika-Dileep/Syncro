import { loginApi } from "@/api/authapi";
import { setCredentials } from "@/store/slices/authSlice";
import type { AppDispatch } from "@/store/store";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Zap, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await loginApi(form.email, form.password);
            dispatch(setCredentials({ user: data.user, token: data.token }));
            navigate(data.role === "employee" ? '/employee/dashboard' : "/company/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl mb-4 shadow-lg shadow-gray-200">
                        <Zap size={24} className="text-white fill-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
                    <p className="text-gray-500 mt-2">Enter your details to access your dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    required
                                    placeholder="name@company.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[15px] focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
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
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[15px] focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
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

