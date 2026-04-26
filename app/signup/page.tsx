'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore, User } from '@/lib/store';
import { ArrowRight, Loader2, Lock, Mail, User as UserIcon, AlertCircle, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignupPage() {
    const router = useRouter();
    const { setUser } = useAppStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: signupError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name: name } }
            });

            if (signupError) throw signupError;

            if (data.session) {
                const user: User = {
                    id: data.user!.id,
                    email: data.user!.email!,
                    name: name,
                    created_at: data.user!.created_at
                };
                setUser(user);
                router.push('/shop');
            } else if (data.user) {
                setError('Protocol initialized. Check your digital address for verification.');
                setLoading(false);
                return;
            }
        } catch (err: any) {
            setError(err.message || 'Signup sequence failed');
        } finally {
            if (!error) setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setLoading(true);
        setError(null);
        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: { redirectTo: `${location.origin}/auth/callback` },
            });
            if (oauthError) throw oauthError;
        } catch (err: any) {
            setError(err.message || `Failed to establish ${provider} connection`);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] flex items-center justify-center p-6 noise-overlay selection:bg-[#C9A84C]/30 relative overflow-hidden">
            
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-lg glass-strong rounded-[3rem] p-10 md:p-14 border border-white/[0.04] shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative z-10 perspective-2000"
            >
                {/* Header Decoration */}
                <div className="absolute -top-12 -right-12 opacity-5 pointer-events-none">
                    <Sparkles size={200} className="text-blue-400" />
                </div>

                <div className="mb-12 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass px-4 py-1.5 rounded-full glass border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-8"
                    >
                        <Zap size={14} /> Initialize Nexus Profile
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
                        Create <span style={{ background: 'linear-gradient(135deg, #F5F5F7, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Account</span>
                    </h1>
                    <p className="text-[#5A5A6A] text-xs font-bold uppercase tracking-[0.2em]">Join the elite jewelry engineering network</p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mb-8 p-4 border rounded-2xl flex items-center gap-4 text-xs font-bold uppercase tracking-wider ${error.includes('Check') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                        >
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSignup} className="space-y-6 relative z-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5A6A] ml-2">Operator Name</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3A3A3A] group-focus-within:text-blue-400 transition-colors duration-500" size={18} />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-16 glass rounded-2xl pl-16 pr-6 text-[#F5F5F7] placeholder-[#3A3A3A] focus:border-blue-500/30 focus:outline-none transition-all font-semibold uppercase text-xs"
                                placeholder="FULL OPERATOR NAME"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5A6A] ml-2">Digital Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3A3A3A] group-focus-within:text-blue-400 transition-colors duration-500" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-16 glass rounded-2xl pl-16 pr-6 text-[#F5F5F7] placeholder-[#3A3A3A] focus:border-blue-500/30 focus:outline-none transition-all font-semibold uppercase text-xs"
                                placeholder="EMAIL@DOMAIN.COM"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5A6A] ml-2">Secure Access Code</label>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#3A3A3A] group-focus-within:text-blue-400 transition-colors duration-500" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-16 glass rounded-2xl pl-16 pr-6 text-[#F5F5F7] placeholder-[#3A3A3A] focus:border-blue-500/30 focus:outline-none transition-all font-semibold"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-18 text-[#F5F5F7] font-black text-xs uppercase tracking-[0.3em] rounded-2xl relative overflow-hidden group/btn disabled:opacity-50 transition-all shadow-[0_20px_40px_rgba(59,130,246,0.1)] hover:shadow-[0_20px_60px_rgba(59,130,246,0.2)] mt-4"
                        style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6, #1D4ED8)' }}
                    >
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-[20deg]" />
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <Loader2 className="animate-spin" size={20} />
                                Initializing...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-4 relative z-10">
                                Create Account <ArrowRight size={18} />
                            </div>
                        )}
                    </button>
                </form>

                <div className="mt-12 relative z-10">
                    <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em] text-[#3A3A4A] mb-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-white/[0.04]" /></div>
                        <span className="bg-[#0A0A0F] px-6 relative z-10">Federated Identity</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="flex items-center justify-center h-14 glass rounded-2xl hover:bg-white/[0.05] transition-all group"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            className="flex items-center justify-center h-14 glass rounded-2xl hover:bg-[#1877F2]/10 transition-all group"
                        >
                            <svg className="w-5 h-5 fill-current text-[#1877F2] group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-center relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#5A5A6A]">
                        Existing Operator?{' '}
                        <Link href="/login" className="text-blue-400 hover:opacity-70 transition-opacity ml-2">Authenticate Protocol</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
