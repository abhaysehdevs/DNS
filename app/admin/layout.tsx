
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Package, ShoppingCart, Users, Settings, Home, LayoutDashboard, Database, Bell, Check, Trash2, LogOut, X, Menu } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAdminAuthenticated, logoutAdmin, notifications, markNotificationAsRead, clearNotifications, addNotification, adminSettings } = useAppStore();

    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Authentication Check
    useEffect(() => {
        // Allow login page access without auth
        if (pathname === '/admin/login') return;

        if (!isAdminAuthenticated) {
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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Products', href: '/admin/products', icon: Package },
        { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Customers', href: '/admin/customers', icon: Users },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-black text-gray-100 font-sans">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-gray-900 border-r border-gray-800 z-50 flex flex-col md:hidden"
                        >
                            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
                                        <Database className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-lg text-white tracking-tight block leading-none">Admin Panel</span>
                                    </div>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
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
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500'} />
                                            <span className="font-medium text-base">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-gray-800">
                                <button
                                    onClick={() => logoutAdmin()}
                                    className="w-full flex items-center gap-2 px-3 py-3 text-base text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                                >
                                    <LogOut size={20} /> Logout
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <aside className="w-64 border-r border-gray-800 bg-gray-900/50 hidden md:flex flex-col z-20">
                <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
                        <Database className="text-white" size={20} />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block leading-none">Admin Panel</span>
                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">{adminSettings.storeName}</span>
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
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={18} className={`transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                <span className="font-medium">{item.name}</span>
                                {item.name === 'Orders' && notifications.filter(n => !n.read && n.type === 'success').length > 0 && (
                                    <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {notifications.filter(n => !n.read && n.type === 'success').length}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800 space-y-2">
                    <button
                        onClick={() => logoutAdmin()}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-white transition-colors"
                    >
                        <Home size={16} /> Back to Store
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-black relative">
                <header className="h-16 border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="mr-2 text-gray-400 hover:text-white md:hidden p-1 rounded-lg hover:bg-gray-800"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold capitalize bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-xs text-green-400 bg-green-900/10 border border-green-900/30 px-3 py-1.5 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            System Live
                        </div>

                        {/* Notifications Bell */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-900"></span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right"
                                    >
                                        <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                                            <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                            {notifications.length > 0 && (
                                                <button onClick={clearNotifications} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                                                    <Trash2 size={12} /> Clear all
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500">
                                                    <Bell className="mx-auto mb-2 opacity-20" size={24} />
                                                    <p className="text-sm">No new notifications</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-800">
                                                    {notifications.map((notification) => (
                                                        <div
                                                            key={notification.id}
                                                            className={`p-3 hover:bg-gray-800/50 transition-colors flex gap-3 ${notification.read ? 'opacity-60' : 'bg-blue-900/5'}`}
                                                            onClick={() => markNotificationAsRead(notification.id)}
                                                        >
                                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${notification.read ? 'bg-gray-600' : 'bg-blue-500'}`}></div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`text-sm font-medium truncate ${notification.read ? 'text-gray-400' : 'text-white'}`}>{notification.title}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                                                                <p className="text-[10px] text-gray-600 mt-1">{new Date(notification.timestamp).toLocaleTimeString()}</p>
                                                            </div>
                                                            {!notification.read && (
                                                                <button onClick={(e) => { e.stopPropagation(); markNotificationAsRead(notification.id); }} className="text-blue-500 hover:text-blue-400 self-center">
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
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-[1px] cursor-pointer hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                                <span className="font-bold text-xs text-white">AD</span>
                            </div>
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
        </div>
    );
}
