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
            <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#966E2E]/20 border-t-[#966E2E] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#966E2E]">Accessing Account</span>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] pt-4 sm:pt-6 md:pt-8 pb-16 selection:bg-[#966E2E]/20 overflow-x-hidden">
            
            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#966E2E]/10 border border-[#966E2E]/20 text-[#966E2E] text-[9px] font-black uppercase tracking-[0.2em] mb-3 shadow-xs">
                            <ShieldCheck size={13} /> Account Dashboard
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase leading-[0.9] text-[#18181B] font-display">
                            My <span className="text-[#966E2E]">Account</span>
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
                        <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-[#E8E2D5] relative overflow-hidden group shadow-md">
                            <div className="relative z-10 text-center">
                                <div className="w-28 h-28 mx-auto rounded-[2rem] overflow-hidden border-2 border-[#966E2E]/40 mb-6 p-1 bg-[#FAF9F5] relative group/avatar">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=FAF9F5&color=966E2E&size=256&bold=true&font-size=0.35`}
                                        alt="Profile"
                                        className="w-full h-full object-cover rounded-[1.8rem]"
                                    />
                                </div>
                                <h2 className="text-2xl font-black text-[#18181B] uppercase tracking-tight mb-1">{user.name || 'Member'}</h2>
                                <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-[0.2em] mb-8">{user.email}</p>

                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-3 h-14 bg-[#FAF9F5] hover:bg-red-50 rounded-2xl text-red-600 hover:text-red-700 transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-red-200"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-[#E8E2D5] overflow-hidden shadow-sm">
                            {[
                                { label: 'Order History', icon: Package, active: true, desc: 'Your past tool orders' },
                                { label: 'Saved Addresses', icon: MapPin, active: false, desc: 'Shipping profiles' },
                                { label: 'Settings', icon: Settings, active: false, desc: 'Preferences' },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    disabled={!item.active}
                                    className={`w-full flex items-center justify-between p-6 text-left border-b border-[#E8E2D5] last:border-0 transition-all group ${item.active ? 'bg-[#966E2E]/10 text-[#966E2E]' : 'text-[#71717A] opacity-40 grayscale cursor-not-allowed'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${item.active ? 'bg-[#966E2E] text-white' : 'bg-[#FAF9F5] text-[#71717A]'}`}>
                                            <item.icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">{item.label}</p>
                                            <p className="text-[8px] font-bold text-[#71717A] uppercase tracking-[0.1em] mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                    {item.active && <ChevronRight size={16} className="text-[#966E2E] group-hover:translate-x-1 transition-transform" />}
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
                            <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 text-[#18181B]">
                                <Package className="text-[#966E2E]" size={22} />
                                Order <span className="text-[#966E2E]">History</span>
                            </h3>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#71717A] bg-white px-4 py-2 rounded-full border border-[#E8E2D5] shadow-sm">
                                Verified Records
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {orders.length === 0 ? (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-[3rem] p-12 md:p-20 border border-[#E8E2D5] text-center flex flex-col items-center justify-center relative overflow-hidden group shadow-md"
                                >
                                    <div className="w-20 h-20 bg-[#FAF9F5] border border-[#E8E2D5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <ShoppingBag className="text-[#966E2E]" size={36} />
                                    </div>
                                    <h3 className="text-3xl font-black text-[#18181B] mb-3 uppercase tracking-tight leading-none">No Orders Placed Yet</h3>
                                    <p className="text-[#52525B] mb-8 max-w-sm mx-auto font-medium text-xs leading-relaxed">
                                        Browse our collection of precision goldsmith tools and equipment to place your first order.
                                    </p>
                                    <Link href="/shop">
                                        <Button className="h-14 px-10 bg-[#966E2E] hover:bg-[#7D5A25] text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all hover:-translate-y-0.5">
                                            Explore Shop <ArrowRight size={16} className="ml-3" />
                                        </Button>
                                    </Link>
                                </motion.div>
                            ) : (
                                <div className="space-y-5">
                                    {orders.map((order) => {
                                        return (
                                            <div key={order.id} className="bg-white rounded-[2rem] p-6 md:p-8 border border-[#E8E2D5] shadow-sm hover:border-[#966E2E]/30 transition-all">
                                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-5 border-b border-[#E8E2D5]">
                                                    <div>
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <span className="text-[9px] font-black uppercase text-[#71717A] tracking-wider">Order</span>
                                                            <span className="text-sm font-black font-mono text-[#18181B]">{order.id}</span>
                                                            <span className="px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border bg-[#966E2E]/10 text-[#966E2E] border-[#966E2E]/20">
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-[#71717A] block mt-1 uppercase tracking-wider font-bold">
                                                            {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                        </span>
                                                    </div>
                                                    <div className="text-left md:text-right">
                                                        <div className="text-2xl font-black text-[#966E2E] tabular-nums leading-none">
                                                            <Currency value={order.total_amount || 0} />
                                                        </div>
                                                        <span className="text-[9px] font-bold text-[#71717A] uppercase tracking-widest mt-1 block">{order.payment_method === 'whatsapp' ? 'WhatsApp Order' : order.payment_method}</span>
                                                    </div>
                                                </div>

                                                {/* Items in order */}
                                                <div className="py-5 space-y-3">
                                                    {order.order_items?.map((item: any, idx: number) => (
                                                        <div key={item.id || idx} className="flex justify-between items-center text-xs">
                                                            <div className="min-w-0">
                                                                <span className="font-black text-[#18181B] block truncate uppercase">{item.product_name}</span>
                                                                <span className="text-[10px] text-[#71717A] font-bold">Qty: {item.quantity} {item.variant_name ? `• ${item.variant_name}` : ''}</span>
                                                            </div>
                                                            <span className="font-black text-[#18181B] ml-4 tabular-nums">
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

