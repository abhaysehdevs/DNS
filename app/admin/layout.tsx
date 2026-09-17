
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, ShoppingCart, Users, Settings, Home, LayoutDashboard, Database, Bell, Check, Trash2, LogOut, X, Menu, Grid, Layout, Tag, Mail, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import AdminAiAssistant from '@/components/admin/admin-ai-assistant';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAdminAuthenticated, logoutAdmin, notifications, markNotificationAsRead, clearNotifications, addNotification, adminSettings, updateAdminSettings } = useAppStore();

    const [showNotifications, setShowNotifications] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;
    const [ordersCount, setOrdersCount] = useState(0);
    const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

    // Fetch actual pending/processing orders from database
    useEffect(() => {
        if (!isAdminAuthenticated) return;

        const fetchPendingOrdersCount = async () => {
            try {
                const { count, error } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .in('status', ['pending', 'processing']);
                if (!error && count !== null) {
                    setOrdersCount(count);
                }
            } catch (err) {
                console.error('Error fetching orders count:', err);
            }
        };

        fetchPendingOrdersCount();

        // Subscribe to changes on orders table to update count
        const channel = supabase
            .channel('realtime-orders-count')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders'
                },
                () => {
                    fetchPendingOrdersCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isAdminAuthenticated]);

    // Load global settings from database
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('site_settings')
                    .select('settings')
                    .eq('key', 'global')
                    .single();
                if (!error && data?.settings) {
                    updateAdminSettings(data.settings);
                }
            } catch (err) {
                console.error('Error loading settings from DB:', err);
            }
        };
        loadSettings();
    }, []);

    // Strict Authorized Email & Session Check
    useEffect(() => {
        if (pathname === '/admin/login') return;

        const hasActiveSession = typeof window !== 'undefined' && sessionStorage.getItem('dns_admin_session_active') === 'true';
        const adminEmail = typeof window !== 'undefined' ? sessionStorage.getItem('dns_admin_email') : null;

        if (!hasActiveSession || adminEmail !== 'ajayabhay12872@gmail.com') {
            router.push('/admin/login');
        }
    }, [isAdminAuthenticated, pathname, router]);

    // ADMIN SESSION TRACKING
    useEffect(() => {
        if (!isAdminAuthenticated) return;

        const trackSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return;

                const sessionId = localStorage.getItem('admin_session_id');
                const deviceInfo = navigator.userAgent;

                if (sessionId) {
                    // Update heartbeat
                    const { error } = await supabase
                        .from('admin_sessions')
                        .update({ last_active: new Date().toISOString() })
                        .eq('id', sessionId)
                        .eq('user_id', session.user.id); // Security check

                    if (error) {
                        // If session not found (maybe deleted remotely), create new
                        localStorage.removeItem('admin_session_id');
                    }
                } else {
                    // Create new session
                    const { data, error } = await supabase
                        .from('admin_sessions')
                        .insert({
                            user_id: session.user.id,
                            device_info: deviceInfo,
                            last_active: new Date().toISOString()
                        })
                        .select()
                        .single();

                    if (data && !error) {
                        localStorage.setItem('admin_session_id', data.id);
                    }
                }
            } catch (err) {
                console.error('Session tracking error:', err);
            }
        };

        trackSession();
        // Heartbeat every 5 minutes
        const interval = setInterval(trackSession, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [isAdminAuthenticated, logoutAdmin, router]);

    // REALTIME NOTIFICATIONS: Listen for ACTUAL new orders
    useEffect(() => {
        if (!isAdminAuthenticated || !adminSettings.emailNotifications) return;

        const channel = supabase
            .channel('realtime-orders')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders'
                },
                (payload) => {
                    const newOrder = payload.new;
                    // Format amount safely
                    const amount = newOrder.total_amount
                        ? Number(newOrder.total_amount).toLocaleString('en-IN')
                        : '0';

                    addNotification({
                        title: 'New Order Received',
                        message: `Order placed for ₹${amount}`,
                        type: 'success'
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isAdminAuthenticated, adminSettings.emailNotifications, addNotification]);

    // If on login page, just render children without layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (!isAdminAuthenticated) {
        return null; // or a loading spinner while redirecting
    }



    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'AI Assistant', href: '/admin/ai', icon: Sparkles, isAi: true },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Categories', href: '/admin/categories', icon: Grid },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Subscribers', href: '/admin/subscribers', icon: Mail },
        { name: 'Blog CMS', href: '/admin/blog', icon: Layout },
        { name: 'Coupons', href: '/admin/coupons', icon: Tag },
        { name: 'Customers', href: '/admin/customers', icon: Users },
        { name: 'Store CMS', href: '/admin/cms', icon: Layout },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-[#FAF9F5] text-[#18181B] font-sans">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-white border-r border-[#E8E2D5] z-50 flex flex-col md:hidden shadow-xl"
                        >
                            <div className="p-6 border-b border-[#E8E2D5] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#966E2E] text-white rounded-lg shadow-sm">
                                        <Database size={20} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-lg text-[#18181B] tracking-tight block leading-none">Admin Panel</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#71717A] hover:text-[#18181B]">
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${isActive
                                                ? 'bg-[#966E2E] text-white shadow-sm'
                                                : 'text-[#52525B] hover:bg-[#FAF9F5] hover:text-[#18181B]'
                                                }`}
                                        >
                                            <Icon size={20} className={isActive ? 'text-white' : 'text-[#71717A]'} />
                                            <span className="font-medium text-base">{item.name}</span>
                                            {item.isAi && (
                                                <span className="ml-auto bg-[#966E2E]/10 text-[#966E2E] border border-[#966E2E]/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    Active
                                                </span>
                                            )}
                                            {item.name === 'Orders' && ordersCount > 0 && (
                                                <span className="ml-auto bg-[#966E2E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                    {ordersCount}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-[#E8E2D5]">
                                <button
                                    onClick={() => logoutAdmin()}
                                    className="w-full flex items-center gap-2 px-3 py-3 text-base text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                    <LogOut size={20} /> Logout
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-[#E8E2D5] bg-white hidden md:flex flex-col z-20">
                <div className="p-6 border-b border-[#E8E2D5] flex items-center gap-3">
                    <div className="p-2 bg-[#966E2E] text-white rounded-lg shadow-sm">
                        <Database size={20} />
                    </div>
                    <div>
                        <span className="font-bold text-lg text-[#18181B] tracking-tight block leading-none">Admin Panel</span>
                        <span className="text-[10px] text-[#71717A] font-mono uppercase tracking-wider">{adminSettings.storeName}</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${isActive
                                    ? 'bg-[#966E2E] text-white shadow-sm'
                                    : 'text-[#52525B] hover:bg-[#FAF9F5] hover:text-[#18181B]'
                                    }`}
                            >
                                <Icon size={18} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#71717A] group-hover:text-[#18181B]'}`} />
                                <span className="font-medium text-sm">{item.name}</span>
                                {item.isAi && (
                                    <span className={`ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isActive ? 'bg-white/20 text-white' : 'bg-[#966E2E]/10 text-[#966E2E]'}`}>
                                        Active
                                    </span>
                                )}
                                {item.name === 'Orders' && ordersCount > 0 && (
                                    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white text-[#966E2E]' : 'bg-[#966E2E] text-white'}`}>
                                        {ordersCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-[#E8E2D5] space-y-2">
                    <button
                        onClick={() => logoutAdmin()}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#71717A] hover:text-[#18181B] transition-colors"
                    >
                        <Home size={16} /> Back to Store
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#FAF9F5] relative">
                <header className="h-16 border-b border-[#E8E2D5] bg-white/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="mr-2 text-[#71717A] hover:text-[#18181B] md:hidden p-1 rounded-lg hover:bg-[#FAF9F5]"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold capitalize text-[#18181B]">
                            {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            System Live
                        </div>

                        {/* AI Assistant Trigger Button */}
                        <button
                            onClick={() => setIsAiDrawerOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#966E2E]/10 hover:bg-[#966E2E]/20 border border-[#966E2E]/30 text-[#966E2E] text-xs font-semibold shadow-sm transition-all cursor-pointer group"
                            title="Open DNS Admin AI Assistant (Ctrl+K)"
                        >
                            <Sparkles size={14} className="text-[#966E2E] group-hover:rotate-12 transition-transform" />
                            <span className="hidden sm:inline">AI Copilot</span>
                            <span className="hidden md:inline-block px-1.5 py-0.5 bg-[#966E2E]/20 text-[10px] rounded font-mono">⌘K</span>
                        </button>

                        {/* Notifications Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF9F5] rounded-full transition-colors cursor-pointer"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-80 bg-white border border-[#E8E2D5] rounded-xl shadow-xl overflow-hidden z-50 origin-top-right"
                                    >
                                        <div className="p-3 border-b border-[#E8E2D5] flex justify-between items-center bg-[#FAF9F5]">
                                            <h3 className="text-sm font-semibold text-[#18181B]">Notifications</h3>
                                            {notifications.length > 0 && (
                                                <button onClick={clearNotifications} className="text-xs text-[#71717A] hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer">
                                                    <Trash2 size={12} /> Clear all
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-[#71717A]">
                                                    <Bell className="mx-auto mb-2 opacity-30" size={24} />
                                                    <p className="text-sm">No new notifications</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-[#E8E2D5]">
                                                    {notifications.map((notification) => (
                                                        <div
                                                            key={notification.id}
                                                            className={`p-3 hover:bg-[#FAF9F5] transition-colors flex gap-3 cursor-pointer ${notification.read ? 'opacity-60' : 'bg-amber-50/40'}`}
                                                            onClick={() => markNotificationAsRead(notification.id)}
                                                        >
                                                            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notification.read ? 'bg-[#A1A1AA]' : 'bg-[#966E2E]'}`}></div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm font-medium truncate ${notification.read ? 'text-[#52525B]' : 'text-[#18181B]'}`}>{notification.title}</p>
                                                                <p className="text-xs text-[#71717A] mt-0.5 line-clamp-2">{notification.message}</p>
                                                                <p className="text-[10px] text-[#A1A1AA] mt-1">{new Date(notification.timestamp).toLocaleTimeString()}</p>
                                                            </div>
                                                            {!notification.read && (
                                                                <button onClick={(e) => { e.stopPropagation(); markNotificationAsRead(notification.id); }} className="text-[#966E2E] hover:text-[#7D5A25] self-center">
                                                                    <Check size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* User Avatar */}
                        <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#E8E2D5] flex items-center justify-center cursor-pointer hover:border-[#966E2E] transition-all">
                            <span className="font-bold text-xs text-[#18181B]">AD</span>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-8 flex-1 overflow-y-auto overflow-x-hidden">
                    {children}
                </div>
            </main>

            {/* Backdrop for mobile notifications */}
            {showNotifications && (
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowNotifications(false)}></div>
            )}

            {/* Global Admin AI Assistant Floating Drawer & Trigger */}
            <AdminAiAssistant
                isOpenExternal={isAiDrawerOpen}
                onToggleExternal={setIsAiDrawerOpen}
            />
        </div>
    );
}
