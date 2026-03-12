
'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Package, User, LogOut, MapPin, Settings, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AccountPage() {
    const { user, setUser } = useAppStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]); // Placeholder for Order History

    useEffect(() => {
        // Protect Route
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/login');
                return;
            }

            // Sync store if needed (e.g. on page refresh)
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

        // Fetch Orders (Mock/Real)
        // const fetchOrders = async () => { ... }
    }, [router, setUser, user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen fx-center bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={40} />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 space-y-4"
                    >
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
                            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-amber-500/50 mb-4 cursor-pointer hover:opacity-80 transition-opacity">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user.name || 'User'}&background=random&size=128`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h2 className="text-xl font-bold">{user.name || 'Valued Customer'}</h2>
                            <p className="text-gray-400 text-sm mb-4">{user.email}</p>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2.5 rounded-lg transition-colors text-sm font-medium"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>

                        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                            {[
                                { label: 'My Orders', icon: Package, active: true },
                                { label: 'Addresses', icon: MapPin, active: false },
                                { label: 'Settings', icon: Settings, active: false },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    disabled={!item.active}
                                    className={`w-full flex items-center justify-between p-4 text-left border-b border-gray-800 last:border-0 transition-colors ${item.active ? 'bg-amber-500/10 text-amber-500' : 'hover:bg-gray-800 text-gray-400 opacity-50 cursor-not-allowed'}`}
                                >
                                    <span className="flex items-center gap-3">
                                        <item.icon size={18} /> {item.label}
                                    </span>
                                    {item.active && <ChevronRight size={16} />}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-3"
                    >
                        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <span className="bg-amber-500 w-1 h-8 rounded-full" />
                            Order History
                        </h1>

                        {orders.length === 0 ? (
                            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                                <Package className="text-gray-700 mb-4" size={64} />
                                <h3 className="text-xl font-bold text-gray-300 mb-2">No orders yet</h3>
                                <p className="text-gray-500 mb-6 max-w-sm">Looks like you haven't placed any orders yet. Start shopping to fill this page with amazing products.</p>
                                <Link href="/shop" className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-amber-900/20">
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Order List Implementation needed later */}
                                <p>Orders will appear here.</p>
                            </div>
                        )}
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
