'use client';

import { useEffect, useState } from 'react';
import { useAppStore, User } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Package, User as UserIcon, LogOut, MapPin, Settings, Loader2, ChevronRight, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Currency } from '@/components/currency';

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
                const userName = session.user.user_metadata?.full_name || 
                                 session.user.user_metadata?.name || 
                                 session.user.email?.split('@')[0];
                const userObj: User = {
                    id: session.user.id,
                    email: session.user.email!,
                    name: userName,
                    created_at: session.user.created_at
                };
                setUser(userObj);
            }
            setLoading(false);
        };

        checkUser();
    }, [router, setUser, user]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.email) return;
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('customer_email', user.email)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setOrders(data || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
            }
        };

        fetchOrders();
    }, [user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#151515] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">Accessing Account</span>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#151515] text-[#F8F3E8] pt-40 md:pt-52 pb-24 noise-overlay selection:bg-[#C9A84C]/30 overflow-x-hidden">
            
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div>
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <ShieldCheck size={14} /> Account Dashboard
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9]">
                            My <span className="bg-gradient-to-r from-[#F8F3E8] via-[#E8D48B] to-[#C9A84C] bg-clip-text text-transparent">Account</span>
                        </h1>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

                    {/* Sidebar / Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        <div className="bg-[#1E1E1E] rounded-[2.5rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                <UserIcon size={160} className="text-[#C9A84C]" />
                            </div>

                            <div className="relative z-10 text-center">
                                <div className="w-28 h-28 mx-auto rounded-[2rem] overflow-hidden border-2 border-[#C9A84C]/40 mb-6 p-1 bg-[#151515] relative group/avatar">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=151515&color=C9A84C&size=256&bold=true&font-size=0.35`}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-[1.8rem]"
                                    />
                                </div>
                                <h2 className="text-2xl font-black text-[#F8F3E8] uppercase tracking-tight mb-1">{user.name || 'Member'}</h2>
                                <p className="text-[10px] font-bold text-[#86868B] uppercase tracking-[0.2em] mb-8">{user.email}</p>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-3 h-14 bg-[#151515] hover:bg-red-500/10 rounded-2xl text-red-400 hover:text-red-300 transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#1E1E1E] rounded-[2rem] border border-white/5 overflow-hidden shadow-xl">
                            {[
                                { label: 'Order History', icon: Package, active: true, desc: 'Your past tool orders' },
                                { label: 'Saved Addresses', icon: MapPin, active: false, desc: 'Shipping profiles' },
                                { label: 'Settings', icon: Settings, active: false, desc: 'Preferences' },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    disabled={!item.active}
                                    className={`w-full flex items-center justify-between p-6 text-left border-b border-white/5 last:border-0 transition-all group ${item.active ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-[#86868B] opacity-40 grayscale cursor-not-allowed'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.active ? 'bg-[#C9A84C] text-[#0A0A0F]' : 'bg-[#151515] text-[#86868B]'}`}>
                                            <item.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">{item.label}</p>
                                            <p className="text-[8px] font-bold text-[#86868B] uppercase tracking-[0.1em] mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                    {item.active && <ChevronRight size={16} className="text-[#C9A84C] group-hover:translate-x-1 transition-transform" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Main Interface / Orders */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="lg:col-span-8"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-[#F8F3E8]">
                                <Package className="text-[#C9A84C]" size={22} />
                                Order <span className="text-[#C9A84C]">History</span>
                            </h3>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#86868B] bg-[#1E1E1E] px-4 py-2 rounded-full border border-white/5">
                                Verified Records
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {orders.length === 0 ? (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[#1E1E1E] rounded-[3rem] p-12 md:p-20 border border-white/5 text-center flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl"
                                >
                                    <div className="w-20 h-20 bg-[#151515] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                        <ShoppingBag className="text-[#86868B]" size={36} />
                                    </div>
                                    <h3 className="text-3xl font-black text-[#F8F3E8] mb-3 uppercase tracking-tight leading-none">No Orders Placed Yet</h3>
                                    <p className="text-[#86868B] mb-8 max-w-sm mx-auto font-medium text-xs leading-relaxed">
                                        Browse our collection of precision goldsmith tools and equipment to place your first order.
                                    </p>
                                    <Link href="/shop">
                                        <Button className="h-14 px-10 bg-gradient-to-r from-[#E8D48B] to-[#C9A84C] text-[#0A0A0F] font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all hover:-translate-y-0.5">
                                            Explore Shop <ArrowRight size={16} className="ml-3" />
                                        </Button>
                                    </Link>
                                </motion.div>
                            ) : (
                                <div className="space-y-5">
                                    {orders.map((order) => {
                                        return (
                                            <div key={order.id} className="bg-[#1E1E1E] rounded-[2rem] p-6 md:p-8 border border-white/5 shadow-xl hover:border-[#C9A84C]/30 transition-all">
                                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-5 border-b border-white/5">
                                                    <div>
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <span className="text-[9px] font-black uppercase text-[#86868B] tracking-wider">Order</span>
                                                            <span className="text-sm font-black font-mono text-[#F8F3E8]">{order.id}</span>
                                                            <span className="px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20">
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-[#86868B] block mt-1 uppercase tracking-wider font-bold">
                                                            {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                        </span>
                                                    </div>
                                                    <div className="text-left md:text-right">
                                                        <div className="text-2xl font-black text-[#C9A84C] tabular-nums leading-none">
                                                            <Currency value={order.total_amount || 0} />
                                                        </div>
                                                        <span className="text-[9px] font-bold text-[#86868B] uppercase tracking-widest mt-1 block">{order.payment_method === 'whatsapp' ? 'WhatsApp Order' : order.payment_method}</span>
                                                    </div>
                                                </div>

                                                {/* Items in order */}
                                                <div className="py-5 space-y-3">
                                                    {order.order_items?.map((item: any, idx: number) => (
                                                        <div key={item.id || idx} className="flex justify-between items-center text-xs">
                                                            <div className="min-w-0">
                                                                <span className="font-black text-[#F8F3E8] block truncate uppercase">{item.product_name}</span>
                                                                <span className="text-[10px] text-[#86868B] font-bold">Qty: {item.quantity} {item.variant_name ? `• ${item.variant_name}` : ''}</span>
                                                            </div>
                                                            <span className="font-black text-[#F8F3E8] ml-4 tabular-nums">
                                                                <Currency value={(item.price || 0) * (item.quantity || 1)} />
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}

