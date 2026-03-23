import React, { useState } from "react";
import { forgotPasswordApi } from "../../api/authapi"
import { Link } from "react-router-dom";
import { Mail, Zap, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");
        try {
            const data = await forgotPasswordApi(email);
            toast.success(data.message || "A reset link has been sent to your email.");
            setMessage(data.message || "A reset link has been sent to your email.");
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Something went wrong";
            toast.error(msg);
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl mb-4 shadow-lg shadow-gray-200">
                        <Zap size={24} className="text-white fill-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reset password</h1>
                    <p className="text-gray-500 mt-2">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                    {!message ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-lg text-sm font-medium animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        placeholder="yourname@work.com"
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-[15px] focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-100 outline-none transition-all placeholder:text-gray-400"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-gray-200"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    "Send reset link"
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 text-gray-900 rounded-full mb-6">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h3>
                            <p className="text-gray-500 leading-relaxed mb-8">
                                We've sent password reset instructions to <br />
                                <span className="font-bold text-gray-900">{email}</span>
                            </p>
                                <button
                                    onClick={() => setMessage("")}
                                    className="text-sm font-bold text-gray-900 hover:text-gray-700 transition-colors"
                                >
                                    Didn't receive the email? Try again
                                </button>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-50 flex justify-center">
                        <Link
                            to="/login"
                            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

