'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Package, User as UserIcon, LogOut, MapPin, Settings, Loader2, ChevronRight, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
    const { user, setUser } = useAppStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/login');
                return;
            }

            if (!user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata.name,
                    created_at: session.user.created_at
                });
            }
            setLoading(false);
        };

        checkUser();
    }, [router, setUser, user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/10 border-t-[#C9A84C] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">Accessing Personnel Database</span>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FFFFFF] text-[#1D1D1F] pt-40 md:pt-60 pb-24 noise-overlay selection:bg-[#C9A84C]/30 overflow-x-hidden">
            
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
                >
                    <div>
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-gold text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <ShieldCheck size={14} /> Account Overview
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9]">
                            My <span style={{ background: 'linear-gradient(135deg, #1D1D1F, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Account</span>
                        </h1>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

                    {/* Sidebar / Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 space-y-8"
                    >
                        <div className="glass-strong rounded-[3rem] p-10 border border-black/[0.04] relative overflow-hidden group shadow-xl bg-white">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <UserIcon size={160} className="text-[#C9A84C]" />
                            </div>

                            <div className="relative z-10 text-center">
                                <div className="w-32 h-32 mx-auto rounded-[2.5rem] overflow-hidden border-2 border-[#C9A84C]/30 mb-8 p-1 glass relative group/avatar">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A84C]/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=FFFFFF&color=C9A84C&size=256&bold=true&font-size=0.33`}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-[2.2rem]"
                                    />
                                </div>
                                <h2 className="text-2xl font-black text-[#1D1D1F] uppercase tracking-tight mb-2">{user.name || 'Customer'}</h2>
                                <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-10">{user.email}</p>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-3 h-14 glass rounded-2xl text-red-600 hover:bg-red-500/10 transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/10"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>

                        <div className="glass rounded-[2.5rem] border border-black/[0.04] overflow-hidden shadow-lg bg-white">
                            {[
                                { label: 'Order History', icon: Package, active: true, desc: 'Previous purchases' },
                                { label: 'Saved Addresses', icon: MapPin, active: false, desc: 'Shipping details' },
                                { label: 'Settings', icon: Settings, active: false, desc: 'Account management' },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    disabled={!item.active}
                                    className={`w-full flex items-center justify-between p-8 text-left border-b border-black/[0.04] last:border-0 transition-all group ${item.active ? 'bg-[#C9A84C]/5 text-[#C9A84C]' : 'text-[#86868B] opacity-40 grayscale'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${item.active ? 'glass-gold text-[#0A0A0F]' : 'glass text-[#86868B]'}`}>
                                            <item.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">{item.label}</p>
                                            <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-[0.1em] mt-1">{item.desc}</p>
                                        </div>
                                    </div>
                                    {item.active && <ChevronRight size={18} className="text-[#C9A84C] group-hover:translate-x-2 transition-transform" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Main Interface */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="lg:col-span-8"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                                <span className="w-12 h-px bg-[#C9A84C]/30" />
                                Order <span className="text-[#86868B]">History</span>
                            </h3>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#86868B] glass px-4 py-2 rounded-full border border-black/[0.04]">
                                Verified Transactions
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {orders.length === 0 ? (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-strong rounded-[3.5rem] p-16 md:p-24 border border-black/[0.04] text-center flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl bg-white"
                                >
                                    <div className="absolute top-0 left-0 p-12 opacity-[0.02]">
                                        <Zap size={200} className="text-[#C9A84C]" />
                                    </div>
                                    
                                    <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl relative">
                                        <Package className="text-[#1D1D1F]" size={48} />
                                        <div className="absolute inset-0 rounded-full border border-[#C9A84C]/10 animate-ping duration-[4000ms]" />
                                    </div>
                                    <h3 className="text-3xl font-black text-[#1D1D1F] mb-6 uppercase tracking-tight leading-none">No Orders <br /><span className="text-[#86868B]">Found</span></h3>
                                    <p className="text-[#6E6E73] mb-12 max-w-sm mx-auto font-medium leading-relaxed">
                                        Your order history is currently empty. Start shopping to see your previous purchases here.
                                    </p>
                                    <Link href="/shop">
                                        <Button className="h-16 px-12 glass-gold text-[#0A0A0F] font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all hover:-translate-y-1 group">
                                            Go Shopping <ArrowRight size={18} className="ml-4 group-hover:translate-x-2 transition-transform" />
                                        </Button>
                                    </Link>
                                </motion.div>
                            ) : (
                                <div className="space-y-6">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] text-center py-12 glass rounded-3xl border border-dashed border-black/[0.04]">Data stream processing...</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
