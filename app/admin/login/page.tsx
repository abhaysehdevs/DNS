'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AUTHORIZED_ADMIN_EMAIL = 'ajayabhay12872@gmail.com';

export default function AdminLoginPage() {
    const router = useRouter();
    const { loginAdmin, isAdminAuthenticated } = useAppStore();

    const [email, setEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // If already authenticated, redirect to admin
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const hasSession = sessionStorage.getItem('dns_admin_session_active') === 'true';
            const adminEmail = sessionStorage.getItem('dns_admin_email');
            if ((isAdminAuthenticated || hasSession) && adminEmail === AUTHORIZED_ADMIN_EMAIL) {
                router.replace('/admin');
            }
        }
    }, [isAdminAuthenticated, router]);

    // Check if user returned from Google OAuth
    useEffect(() => {
        const checkOAuthUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.email) {
                    const userEmail = session.user.email.trim().toLowerCase();
                    if (userEmail === AUTHORIZED_ADMIN_EMAIL) {
                        grantAccess(userEmail);
                    } else {
                        setErrorMsg(`Access Denied: ${userEmail} is not authorized for Admin access.`);
                    }
                }
            } catch (e) {}
        };
        checkOAuthUser();
    }, []);

    const grantAccess = (validEmail: string) => {
        sessionStorage.setItem('dns_admin_session_active', 'true');
        sessionStorage.setItem('dns_admin_email', validEmail);
        sessionStorage.setItem('dns_admin_session_time', Date.now().toString());

        loginAdmin();
        setSuccessMsg('Clearance Verified: Welcome Admin. Opening console...');
        setTimeout(() => {
            router.push('/admin');
        }, 500);
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        const cleanEmail = email.trim().toLowerCase();

        if (cleanEmail === AUTHORIZED_ADMIN_EMAIL) {
            grantAccess(cleanEmail);
        } else {
            setLoading(false);
            setErrorMsg('ACCESS DENIED: This email address is not authorized to access the Admin Panel.');
        }
    };

    const handleGoogleAdminLogin = async () => {
        setGoogleLoading(true);
        setErrorMsg('');
        try {
            const redirectUrl = `${window.location.origin}/admin/login`;
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl
                }
            });
            if (error) throw error;
        } catch (err: any) {
            setErrorMsg(err.message || 'Google authentication failed.');
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-[#F8F3E8] flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#C9A84C]/30">
            
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/10 blur-[140px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 blur-[140px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-md bg-[#151515] border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10 text-left"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#1E1E1E] border border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <ShieldCheck size={32} className="text-[#C9A84C]" />
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] text-[9px] font-black uppercase tracking-[0.3em] mb-3">
                        Dinanath & Sons Admin
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-[#F8F3E8]">
                        Admin <span className="bg-gradient-to-r from-[#F8F3E8] via-[#E8D48B] to-[#C9A84C] bg-clip-text text-transparent">Portal</span>
                    </h1>
                    <p className="text-[#86868B] text-xs font-bold uppercase tracking-wider mt-2">
                        Enter authorized admin email to proceed
                    </p>
                </div>

                {/* Error Banner */}
                <AnimatePresence mode="wait">
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-400 text-xs font-bold leading-relaxed"
                        >
                            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
                            <span>{errorMsg}</span>
                        </motion.div>
                    )}

                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-bold"
                        >
                            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
                            <span>{successMsg}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Direct Google Admin Login */}
                <button
                    type="button"
                    onClick={handleGoogleAdminLogin}
                    disabled={googleLoading || loading}
                    className="w-full h-14 bg-[#1E1E1E] hover:bg-[#252525] border border-white/10 hover:border-[#C9A84C]/40 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs uppercase tracking-wider text-[#F8F3E8] transition-all mb-6 shadow-sm disabled:opacity-50"
                >
                    {googleLoading ? (
                        <Loader2 className="animate-spin text-[#C9A84C]" size={18} />
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    <span>Sign in with Admin Google</span>
                </button>

                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em] text-[#86868B] my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-white/10" /></div>
                    <span className="bg-[#151515] px-3 relative z-10">Or Enter Admin Email</span>
                </div>

                {/* Email Direct Login Form */}
                <form onSubmit={handleEmailSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">
                            Admin Email Address
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#86868B] group-focus-within:text-[#C9A84C] transition-colors" size={18} />
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@domain.com"
                                autoComplete="off"
                                className="w-full h-14 bg-[#1E1E1E] border border-white/10 rounded-2xl pl-14 pr-5 text-[#F8F3E8] placeholder-[#555] focus:border-[#C9A84C] focus:outline-none transition-all font-bold text-xs"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-gradient-to-r from-[#E8D48B] via-[#C9A84C] to-[#A67C35] hover:opacity-95 text-[#0A0A0F] font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={18} />
                                <span>Verifying Clearance...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Open Admin Panel</span>
                                <ArrowRight size={16} />
                            </div>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center pt-4 border-t border-white/5">
                    <p className="text-[9px] font-mono text-[#86868B] uppercase tracking-widest">
                        Protected Zone • Dinanath & Sons Control System
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
