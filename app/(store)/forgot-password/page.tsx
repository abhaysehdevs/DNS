'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Mail, AlertCircle, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/update-password`,
            });
            if (resetError) throw resetError;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Recovery sequence failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] flex items-center justify-center p-6 selection:bg-[#966E2E]/20 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-[3rem] p-10 md:p-14 border border-[#E8E2D5] shadow-xl relative z-10"
            >
                <Link href="/login" className="inline-flex items-center gap-3 text-[#71717A] hover:text-[#966E2E] transition-all font-black uppercase tracking-[0.3em] text-[9px] mb-12 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Authentication
                </Link>

                <div className="mb-12 text-center relative z-10">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#966E2E]/10 border border-[#966E2E]/20 text-[#966E2E] text-[9px] font-black uppercase tracking-[0.3em] mb-8 shadow-sm">
                        <ShieldCheck size={14} /> Security Access
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-[0.9] mb-6 text-[#18181B]">
                        Recover <span className="text-[#966E2E]">Access</span>
                    </h1>
                    <p className="text-[#52525B] text-xs font-bold uppercase tracking-[0.2em]">Enter your email address to receive a password reset link.</p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4 text-red-600 text-xs font-bold uppercase tracking-wider"
                        >
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 p-6 bg-emerald-50 border border-emerald-200 rounded-[2rem] flex flex-col items-center gap-4 text-emerald-700 text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                                <CheckCircle size={24} />
                            </div>
                            <div className="text-xs font-black uppercase tracking-widest leading-relaxed">
                                Reset Email Sent. <br /> Check your inbox.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!success && (
                    <form onSubmit={handleReset} className="space-y-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#52525B] ml-2">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-[#71717A] group-focus-within:text-[#966E2E] transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-16 bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl pl-16 pr-6 text-[#18181B] placeholder-[#A1A1AA] focus:border-[#966E2E] focus:outline-none transition-all font-semibold uppercase text-xs"
                                    placeholder="EMAIL@DOMAIN.COM"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-[#966E2E] hover:bg-[#7D5A25] text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl relative overflow-hidden transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Loader2 className="animate-spin" size={20} />
                                    Sending...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-4 relative z-10">
                                    Send Reset Link <Zap size={18} />
                                </div>
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
