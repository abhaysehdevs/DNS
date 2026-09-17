'use client';

import { Suspense, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppStore, User } from '@/lib/store';
import { ArrowRight, Loader2, Lock, Mail, AlertCircle, ShieldCheck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#966E2E]/20 border-t-[#966E2E] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#966E2E]">Loading Portal</span>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, setUser } = useAppStore();

    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Email & Password state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const nextPath = searchParams.get('next') || '/account';
    const queryError = searchParams.get('error');

    useEffect(() => {
        if (queryError) {
            setError(decodeURIComponent(queryError));
        }
    }, [queryError]);

    useEffect(() => {
        if (user) {
            router.replace(nextPath);
        }
    }, [user, nextPath, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const { data, error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (loginError) throw loginError;

            if (data.session && data.user) {
                let userName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0];

                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();

                    if (profile?.full_name) userName = profile.full_name;
                } catch (e) {}

                const userObj: User = {
                    id: data.user.id,
                    email: data.user.email!,
                    name: userName,
                    created_at: data.user.created_at
                };
                setUser(userObj);

                router.push(nextPath);
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
        setSocialLoading(provider);
        setError(null);
        try {
            const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
            
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: redirectUrl
                }
            });

            if (oauthError) throw oauthError;
        } catch (err: any) {
            setError(err.message || `Failed to establish ${provider} connection`);
            setSocialLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] flex items-center justify-center p-6 selection:bg-[#966E2E]/20 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-[3rem] p-8 md:p-14 border border-[#E8E2D5] shadow-xl relative z-10"
            >
                {/* Header */}
                <div className="mb-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#966E2E]/10 border border-[#966E2E]/20 text-[#966E2E] text-[9px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm"
                    >
                        <ShieldCheck size={14} /> Client Portal
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-[0.9] mb-3 text-[#18181B]">
                        Account <span className="text-[#966E2E]">Login</span>
                    </h1>
                    <p className="text-[#52525B] text-xs font-bold uppercase tracking-[0.2em]">Sign in with Google or Email</p>
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold uppercase tracking-wider"
                        >
                            <AlertCircle size={18} className="shrink-0 text-red-600" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-700 text-xs font-bold uppercase tracking-wider"
                        >
                            <CheckCircle size={18} className="shrink-0 text-emerald-700" />
                            <span>{successMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Google One-Click Login */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        disabled={!!socialLoading || loading}
                        className="w-full h-14 bg-[#FAF9F5] hover:bg-[#F4EFE6] border border-[#E8E2D5] hover:border-[#966E2E]/40 rounded-2xl flex items-center justify-center gap-4 transition-all group font-bold text-xs uppercase tracking-wider text-[#18181B] disabled:opacity-50 shadow-sm"
                    >
                        {socialLoading === 'google' ? (
                            <Loader2 className="animate-spin text-[#966E2E]" size={18} />
                        ) : (
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        )}
                        <span>Continue with Google</span>
                    </button>
                </div>

                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em] text-[#71717A] my-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-[#E8E2D5]" /></div>
                    <span className="bg-white px-4 relative z-10">Or email & password</span>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#52525B] ml-2">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-[#71717A] group-focus-within:text-[#966E2E] transition-colors" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-16 bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl pl-16 pr-6 text-[#18181B] placeholder-[#A1A1AA] focus:border-[#966E2E] focus:outline-none transition-all font-medium text-xs uppercase"
                                placeholder="name@domain.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#52525B]">Password</label>
                            <Link href="/forgot-password" className="text-[10px] font-bold text-[#966E2E] uppercase tracking-[0.2em] hover:underline">Forgot?</Link>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#71717A] group-focus-within:text-[#966E2E] transition-colors" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-16 bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl pl-16 pr-6 text-[#18181B] placeholder-[#A1A1AA] focus:border-[#966E2E] focus:outline-none transition-all font-medium text-xs"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!socialLoading}
                        className="w-full h-16 bg-[#966E2E] hover:bg-[#7D5A25] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl relative overflow-hidden transition-all shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <Loader2 className="animate-spin" size={20} />
                                Signing In...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-3">
                                Sign In <ArrowRight size={18} />
                            </div>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center relative z-10 pt-6 border-t border-[#E8E2D5]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#52525B]">
                        Don&apos;t have an account?{' '}
                        <Link href={`/signup${nextPath !== '/account' ? `?next=${encodeURIComponent(nextPath)}` : ''}`} className="text-[#966E2E] hover:underline ml-2 font-black">Register Now</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
