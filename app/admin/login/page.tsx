
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Lock, Loader2, ShieldAlert, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminLoginPage() {
    const router = useRouter();
    const { loginAdmin, user } = useAppStore();
    const [status, setStatus] = useState<'checking' | 'authorized' | 'unauthorized' | 'guest'>('checking');

    const ADMIN_EMAIL = 'abhaysehdevofficial@gmail.com';

    useEffect(() => {
        // Check authorization
        if (!user) {
            setStatus('guest');
        } else if (user.email === ADMIN_EMAIL) {
            setStatus('authorized');
            loginAdmin();
            setTimeout(() => {
                router.push('/admin');
            }, 1000); // Small delay for visual confirmation
        } else {
            setStatus('unauthorized');
        }
    }, [user, loginAdmin, router]);

    return (
        <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center p-4 relative overflow-hidden selection:bg-green-900 selection:text-white">

            {/* Matrix Background Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(0,255,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            </div>

            <div className="w-full max-w-md bg-black border border-green-900/50 shadow-[0_0_50px_rgba(0,255,0,0.1)] relative z-10 p-8">

                {/* Scanner Line */}
                <motion.div
                    className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_10px_#0f0]"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 border-2 border-green-500/50 rounded-full mx-auto flex items-center justify-center relative"
                    >
                        {status === 'checking' || status === 'authorized' ? (
                            <div className="absolute inset-0 border border-green-500/20 rounded-full animate-ping"></div>
                        ) : null}

                        {status === 'authorized' ? (
                            <Lock className="text-green-500" size={32} />
                        ) : status === 'unauthorized' ? (
                            <ShieldAlert className="text-red-500" size={32} />
                        ) : (
                            <User className="text-green-500" size={32} />
                        )}
                    </motion.div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-widest text-green-500 uppercase">System Access</h1>
                        <p className="text-green-500/60 text-xs mt-2">BIOMETRIC VERIFICATION PROTOCOL</p>
                    </div>

                    <div className="min-h-[100px] flex flex-col items-center justify-center border-t border-b border-green-900/30 py-4">
                        {status === 'checking' && (
                            <div className="flex items-center gap-2 text-green-500 animate-pulse">
                                <Loader2 className="animate-spin" size={16} />
                                <span>SCANNING CREDENTIALS...</span>
                            </div>
                        )}

                        {status === 'authorized' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center"
                            >
                                <p className="text-green-400 font-bold text-lg mb-1">ACCESS GRANTED</p>
                                <p className="text-green-600 text-xs">Welcome, Commander</p>
                            </motion.div>
                        )}

                        {status === 'unauthorized' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-red-500"
                            >
                                <p className="font-bold text-lg mb-1">ACCESS DENIED</p>
                                <p className="text-red-400/60 text-xs">Identity mismatch. Authorization required.</p>
                                <p className="text-xs mt-2 font-mono bg-red-900/10 p-2 border border-red-900/30">
                                    Current User: {user?.email}
                                </p>
                            </motion.div>
                        )}

                        {status === 'guest' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center"
                            >
                                <p className="text-green-600 mb-4 text-sm">No active session detected.</p>
                                <Link
                                    href="/login?next=/admin"
                                    className="inline-flex items-center gap-2 bg-green-900/20 hover:bg-green-900/40 border border-green-500/50 px-6 py-2 text-green-400 uppercase tracking-wider text-xs transition-all hover:scale-105"
                                >
                                    Login to Continue <ArrowRight size={14} />
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-[10px] text-green-900 text-center font-mono">
                    SECURE CONNECTION ESTABLISHED<br />
                    TERMINAL ID: {typeof window !== 'undefined' ? window.location.hostname.toUpperCase() : 'UNKNOWN'}
                </div>
            </div>
        </div>
    );
}
