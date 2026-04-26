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
        <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex items-center justify-center p-6 noise-overlay selection:bg-[#C9A84C]/30 relative overflow-hidden">
            
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/10 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-lg glass-strong rounded-[3rem] p-10 md:p-14 border border-white/[0.04] shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 perspective-2000"
            >
                <Link href="/login" className="inline-flex items-center gap-3 text-[#5A5A6A] hover:text-[#C9A84C] transition-all font-black uppercase tracking-[0.3em] text-[9px] mb-12 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Authentication
                </Link>

                <div className="mb-12 text-center relative z-10">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-gold text-[#C9A84C] text-[9px] font-black uppercase tracking-[0.3em] mb-8">
                        <ShieldCheck size={14} /> Security Protocol
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
                        Recover <span style={{ background: 'linear-gradient(135deg, #F5F5F7, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Access</span>
                    </h1>
                    <p className="text-[#5A5A6A] text-xs font-bold uppercase tracking-[0.2em]">Enter your digital address to receive a recovery uplink.</p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400 text-xs font-bold uppercase tracking-wider"
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
                            className="mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex flex-col items-center gap-4 text-emerald-400 text-center"
                        >
                            <div className="w-12 h-12 rounded-full glass border border-emerald-500/20 flex items-center justify-center">
                                <CheckCircle size={24} />
                            </div>
                            <div className="text-xs font-black uppercase tracking-widest leading-relaxed">
                                Recovery Transmission Sent. <br /> Check your digital address.
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!success && (
                    <form onSubmit={handleReset} className="space-y-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5A6A] ml-2">Digital Identification</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3A3A4A] group-focus-within:text-[#C9A84C] transition-colors duration-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-16 glass rounded-2xl pl-16 pr-6 text-[#F5F5F7] placeholder-[#3A3A4A] focus:border-[#C9A84C]/30 focus:outline-none transition-all font-semibold uppercase text-xs"
                                    placeholder="EMAIL@DOMAIN.COM"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-18 text-[#0A0A0F] font-black text-xs uppercase tracking-[0.3em] rounded-2xl relative overflow-hidden group/btn disabled:opacity-50 transition-all shadow-[0_20px_40px_rgba(201,168,76,0.1)] hover:shadow-[0_20px_60px_rgba(201,168,76,0.2)]"
                            style={{ background: 'linear-gradient(135deg, #E8D48B, #C9A84C, #8B6914)' }}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-[20deg]" />
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Loader2 className="animate-spin" size={20} />
                                    Transmitting...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-4 relative z-10">
                                    Send Uplink <Zap size={18} />
                                </div>
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
