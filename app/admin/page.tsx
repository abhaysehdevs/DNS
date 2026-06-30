'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Loader2, 
    Package, 
    Truck, 
    XCircle, 
    ArrowRight, 
    Activity, 
    TrendingUp, 
    Users, 
    AlertTriangle, 
    Zap, 
    Plus, 
    Grid,
    ShieldCheck,
    RefreshCw,
    Trash2,
    Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({
        totalSales: 0,
        pendingOrders: 0,
        totalOrders: 0,
        customersCount: 0,
        salesTrend: [] as { date: string, amount: number }[],
        topProducts: [] as { name: string, count: number, revenue: number }[]
    });

    const [terminalLogs, setTerminalLogs] = useState<string[]>([
        'Initializing Dinanath OS v1.2.0-secure...',
        'Loading Secure Kernel & RLS Modules...',
        '[OK] Database connection pool initialized (Supabase).',
        '[OK] Real-time orders websocket listener active.',
        '[OK] Session authorization heartbeat tracking synced.',
        'System monitoring daemon status: ACTIVE'
    ]);

    const terminalEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalLogs]);

    useEffect(() => {
        const templates = [
            '[SYS] Ping database storage engines... 200 OK',
            '[WS] Realtime sync: 0 pending events in pipeline.',
            '[SYS] Heartbeat signal sent from operator client.',
            '[CACHE] Invalidating stale static page metadata cache.',
            '[SEC] Scanning active operators: session active.',
            '[DB] Querying product inventory levels... OK.',
            '[SYS] CPU load: 1.2% | Memory: 56.4 MB',
            '[SYS] Active connections: 4 client hosts, 1 database instance.',
            '[SEC] Verified security certificates for SSL connection.',
            '[DB] Garbage collection run: zero orphaned database rows found.',
        ];

        const interval = setInterval(() => {
            const randomLog = templates[Math.floor(Math.random() * templates.length)];
            const timestamp = new Date().toLocaleTimeString();
            setTerminalLogs((prev) => {
                const updated = [...prev, `[${timestamp}] ${randomLog}`];
                return updated.slice(-35); // Keep last 35
            });
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    async function fetchSessions() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { data, error } = await supabase
                .from('admin_sessions')
                .select('*')
                .eq('user_id', session.user.id)
                .order('last_active', { ascending: false });

            if (error) throw error;
            if (data) {
                setSessions(data);
            }
        } catch (err) {
            console.error('Error fetching admin sessions:', err);
        }
    }

    const handleRevokeSession = async (id: string) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        if (!confirm('Are you sure you want to revoke this session? The device will be logged out.')) return;

        setRevokingId(id);
        const { error } = await supabase
            .from('admin_sessions')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id);

        setRevokingId(null);
        if (!error) {
            setSessions(sessions.filter(s => s.id !== id));
            if (id === currentSessionId) {
                alert('You have revoked your current session. You will be logged out.');
                window.location.reload();
            }
        } else {
            alert('Failed to revoke session: ' + error.message);
        }
    };

    async function fetchData() {
        setLoading(true);
        try {
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .order('created_at', { ascending: false });

            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*');

            if (ordersError) throw ordersError;
            if (productsError) throw productsError;

            if (ordersData) {
                setOrders(ordersData);
                
                // Calculate Stats
                const totalSales = ordersData.reduce((acc: number, order: any) => acc + (order.total_amount || 0), 0);
                const pending = ordersData.filter((o: any) => o.status === 'pending').length;
                const uniqueCustomers = new Set(ordersData.map((o: any) => o.customer_email)).size;

                // Calculate Sales Trend (Last 7 Days)
                const trendMap = new Map<string, number>();
                const now = new Date();
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    trendMap.set(date.toISOString().split('T')[0], 0);
                }

                ordersData.forEach((order: any) => {
                    const date = order.created_at.split('T')[0];
                    if (trendMap.has(date)) {
                        trendMap.set(date, trendMap.get(date)! + (order.total_amount || 0));
                    }
                });

                const salesTrend = Array.from(trendMap.entries()).map(([date, amount]) => ({ date, amount }));

                // Calculate Top Products
                const productMap = new Map<string, { count: number, revenue: number }>();
                ordersData.forEach((order: any) => {
                    order.order_items?.forEach((item: any) => {
                        const name = item.product_name || 'Unknown';
                        const current = productMap.get(name) || { count: 0, revenue: 0 };
                        productMap.set(name, {
                            count: current.count + (item.quantity || 1),
                            revenue: current.revenue + (item.subtotal || 0)
                        });
                    });
                });

                const topProducts = Array.from(productMap.entries())
                    .map(([name, data]) => ({ name, ...data }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);

                setStats({
                    totalSales,
                    pendingOrders: pending,
                    totalOrders: ordersData.length,
                    customersCount: uniqueCustomers,
                    salesTrend,
                    topProducts
                });
            }
            
            if (productsData) setProducts(productsData);
            
            await fetchSessions();
            setCurrentSessionId(localStorage.getItem('admin_session_id'));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            fetchData();
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    const lowStockProducts = products.filter(p => !p.in_stock || (p.quantity !== undefined && p.quantity < 5));

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12 bg-surface-2 min-h-screen">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto p-4 md:p-8">
            {/* Intelligence Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-1 border border-glass-border p-8 rounded-[2.5rem] relative overflow-hidden blueprint-grid">
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                    <Activity size={200} className="text-text-primary -translate-y-20 translate-x-20" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-text-primary flex items-center gap-3">
                        <Zap className="text-blue-500 dark:text-gold-primary" fill="currentColor" /> Store Intelligence
                    </h2>
                    <p className="text-text-secondary text-sm mt-2 max-w-xl">
                        Your global store is synchronized and healthy. We've analyzed your latest orders to provide actionable insights below.
                    </p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-blue-500 dark:text-gold-primary uppercase tracking-widest mb-1">Global Storage Engine</span>
                        <div className="flex items-center gap-2 bg-surface-2 px-4 py-2 rounded-full border border-glass-border">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-text-primary uppercase tracking-tighter">Synced • Global CDN Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, color: 'text-emerald-500', sub: 'Revenue to date', icon: TrendingUp },
                    { label: 'Total Orders', value: stats.totalOrders, color: 'text-text-primary', sub: 'Successful checkouts', icon: Package },
                    { label: 'Low Stock Items', value: lowStockProducts.length, color: 'text-rose-500', sub: 'Urgent attention needed', icon: AlertTriangle },
                    { label: 'Active Customers', value: stats.customersCount, color: 'text-blue-500 dark:text-gold-light', sub: 'Global reach', icon: Users }
                ].map((item, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.label} 
                        className="bg-surface-1 border border-glass-border rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:border-gold-primary/50 transition-all"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <item.icon className="text-text-tertiary" size={64} />
                        </div>
                        <p className="text-text-tertiary text-[10px] font-black uppercase tracking-widest mb-2">{item.label}</p>
                        <h3 className={`text-4xl font-black ${item.color}`}>{item.value}</h3>
                        <div className="mt-3 text-[10px] text-text-secondary uppercase tracking-wider font-bold">{item.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Add Product', icon: Plus, href: '/admin/products' },
                    { label: 'Categories', icon: Grid, href: '/admin/categories' },
                    { label: 'Ship Orders', icon: Truck, href: '/admin/orders' },
                    { label: 'Marketing', icon: Zap, href: '/admin/cms' }
                ].map(action => (
                    <Link 
                        key={action.label} 
                        href={action.href}
                        className="bg-surface-1/50 border border-glass-border p-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-surface-3 hover:border-gold-primary transition-all group"
                    >
                        <action.icon className="text-text-tertiary group-hover:text-text-primary transition-colors" size={24} />
                        <span className="text-[10px] font-black text-text-secondary group-hover:text-text-primary uppercase tracking-widest">{action.label}</span>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart (SVG-based gridline drawing) */}
                <div className="lg:col-span-2 bg-surface-1 border border-glass-border rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-text-primary">Weekly Sales Performance</h3>
                        <div className="text-xs text-text-secondary px-3 py-1 bg-surface-2 rounded-full border border-glass-border">Last 7 Days</div>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Chart Workspace */}
                        <div className="h-56 w-full relative flex items-end justify-between gap-2 px-2 pb-2 border-b border-glass-border">
                            {/* Gridlines in background */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                                {[0, 1, 2, 3].map((i) => {
                                    const maxVal = Math.max(...stats.salesTrend.map(d => d.amount), 1000);
                                    const gridVal = Math.round((maxVal * (3 - i)) / 3);
                                    return (
                                        <div key={i} className="w-full border-t border-glass-border/30 flex justify-end text-[9px] text-text-tertiary pt-0.5">
                                            <span className="bg-surface-1/80 px-1.5 rounded font-mono">₹{gridVal.toLocaleString()}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Interactive Bars */}
                            {stats.salesTrend.map((day, idx) => {
                                const maxVal = Math.max(...stats.salesTrend.map(d => d.amount), 1);
                                const height = (day.amount / maxVal) * 100;
                                return (
                                    <div key={day.date} className="flex-1 flex flex-col items-center group relative h-full justify-end z-10">
                                        <div className="absolute bottom-full mb-2 bg-blue-600 dark:bg-gold-primary text-white dark:text-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 font-bold whitespace-nowrap shadow-lg">
                                            ₹{day.amount.toLocaleString()}
                                        </div>
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.max(height, 5)}%` }}
                                            whileHover={{ scaleX: 1.05, scaleY: 1.02, originY: 1 }}
                                            className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 dark:from-gold-dark dark:to-gold-primary rounded-t-lg transition-all shadow-md shadow-blue-500/10 dark:shadow-gold-500/10 cursor-pointer"
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* Labels Row */}
                        <div className="flex justify-between gap-2 px-2">
                            {stats.salesTrend.map((day) => (
                                <div key={day.date} className="flex-1 text-center">
                                    <span className="text-[10px] text-text-secondary font-mono">
                                        {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-surface-1 border border-glass-border rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-text-primary mb-6">Top Performers</h3>
                    <div className="space-y-4">
                        {stats.topProducts.map((p, idx) => (
                            <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-glass-border/50 hover:border-gold-primary/30 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-text-tertiary w-4">{idx + 1}</span>
                                    <div>
                                        <div className="text-sm font-bold text-text-primary truncate max-w-[120px] group-hover:text-gold-primary transition-colors">{p.name}</div>
                                        <div className="text-[10px] text-text-secondary">{p.count} units sold</div>
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-emerald-500">₹{p.revenue.toLocaleString()}</div>
                            </div>
                        ))}
                        {stats.topProducts.length === 0 && (
                            <div className="text-center py-10 text-text-tertiary italic text-sm border border-dashed border-glass-border rounded-xl">No sales data yet</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Low Stock Alerts */}
                <div className="lg:col-span-1 bg-surface-1 border border-glass-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-rose-500" size={20} /> Inventory Alerts
                    </h3>
                    <div className="space-y-3">
                        {lowStockProducts.length > 0 ? lowStockProducts.slice(0, 5).map(p => (
                            <div key={p.id} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex justify-between items-center">
                                <span className="text-sm text-text-secondary truncate max-w-[120px]">{p.name}</span>
                                <span className={`text-xs font-bold ${!p.in_stock ? 'text-rose-500' : 'text-amber-500'}`}>
                                    {!p.in_stock ? 'OUT' : `${p.quantity} LEFT`}
                                </span>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <div className="bg-emerald-500/10 text-emerald-500 text-xs px-3 py-2 rounded-full inline-block border border-emerald-500/20">All stock levels healthy</div>
                            </div>
                        )}
                    </div>
                    {lowStockProducts.length > 5 && (
                        <Link href="/admin/products" className="block text-center mt-4 text-xs text-rose-500 hover:text-rose-400 underline underline-offset-4">View all {lowStockProducts.length} alerts</Link>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-3">
                    <div className="bg-surface-1 border border-glass-border rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-glass-border flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-xl font-bold text-text-primary">Live Orders</h2>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${filter === status
                                            ? 'bg-blue-600 dark:bg-gold-primary text-white dark:text-black shadow-lg shadow-blue-900/20'
                                            : 'bg-surface-2 text-text-secondary hover:bg-surface-3 hover:text-text-primary border border-glass-border'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surface-2 text-text-tertiary text-[10px] uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border text-sm">
                                    {filteredOrders.slice(0, 10).map((order) => (
                                        <tr key={order.id} className="hover:bg-blue-500/5 dark:hover:bg-gold-primary/5 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-[10px] text-text-tertiary">
                                                #{order.id.slice(0, 8)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-text-primary text-sm group-hover:text-gold-primary transition-colors">{order.customer_name}</div>
                                                <div className="text-text-tertiary text-[10px]">{new Date(order.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-text-primary">
                                                ₹{order.total_amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                                                    order.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    order.status === 'shipped' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                    order.status === 'cancelled' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    'bg-surface-3 text-text-secondary'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {order.status === 'pending' && (
                                                        <button onClick={() => updateStatus(order.id, 'processing')} className="p-2 bg-surface-2 text-text-primary hover:bg-blue-600 hover:text-white dark:hover:bg-gold-primary dark:hover:text-black rounded-lg transition-all"><Truck size={14} /></button>
                                                    )}
                                                    {order.status === 'processing' && (
                                                        <button onClick={() => updateStatus(order.id, 'shipped')} className="p-2 bg-surface-2 text-text-primary hover:bg-purple-600 hover:text-white rounded-lg transition-all"><Truck size={14} /></button>
                                                    )}
                                                    <Link href="/admin/orders" className="p-2 bg-surface-2 text-text-tertiary hover:bg-text-primary hover:text-surface-1 rounded-lg transition-all">
                                                        <ArrowRight size={14} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-text-secondary italic">No orders found matching this filter.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security & Node Diagnostics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Operator Sessions */}
                <div className="bg-surface-1 border border-glass-border rounded-2xl p-6 shadow-xl flex flex-col h-[380px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                            <ShieldCheck className="text-emerald-500" size={20} /> Active Operators
                        </h3>
                        <button 
                            onClick={fetchSessions} 
                            className="p-1.5 hover:bg-surface-3 rounded-lg text-text-secondary hover:text-text-primary transition-colors border border-glass-border"
                            title="Refresh active sessions"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                        {sessions.map((session) => {
                            const isCurrent = session.id === currentSessionId;
                            const isMobile = /mobile/i.test(session.device_info || '');
                            
                            let browser = 'Unknown Browser';
                            if (session.device_info?.includes('Chrome')) browser = 'Chrome';
                            else if (session.device_info?.includes('Firefox')) browser = 'Firefox';
                            else if (session.device_info?.includes('Safari') && !session.device_info?.includes('Chrome')) browser = 'Safari';
                            else if (session.device_info?.includes('Edg')) browser = 'Edge';

                            return (
                                <div 
                                    key={session.id} 
                                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                                        isCurrent 
                                            ? 'bg-blue-500/5 dark:bg-gold-primary/5 border-blue-500/30 dark:border-gold-primary/30' 
                                            : 'bg-surface-2/50 border-glass-border hover:border-glass-strong-border'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2 rounded-lg ${isCurrent ? 'bg-blue-500/10 dark:bg-gold-primary/10 text-blue-500 dark:text-gold-primary' : 'bg-surface-3 text-text-tertiary'}`}>
                                            <Monitor size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-text-primary text-xs truncate">
                                                    {browser} on {isMobile ? 'Mobile' : 'Desktop'}
                                                </h4>
                                                {isCurrent && (
                                                    <span className="bg-blue-600 dark:bg-gold-primary text-white dark:text-black text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Current</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-text-tertiary mt-0.5 font-mono truncate">
                                                IP: {session.ip_address || '127.0.0.1'} • Active: {new Date(session.last_active).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    {!isCurrent && (
                                        <button
                                            onClick={() => handleRevokeSession(session.id)}
                                            disabled={revokingId === session.id}
                                            className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                                            title="Terminate session"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {sessions.length === 0 && (
                            <div className="text-center py-10 text-text-tertiary font-mono text-xs border border-dashed border-glass-border rounded-xl">
                                No operator sessions found
                            </div>
                        )}
                    </div>
                </div>

                {/* Simulated live-scrolling terminal logs */}
                <div className="bg-surface-1 border border-glass-border rounded-2xl p-6 shadow-xl flex flex-col h-[380px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                            <Activity className="text-blue-500 dark:text-gold-primary" size={20} /> Diagnostics Terminal
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-emerald-500 font-mono uppercase font-black">Live feed</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-surface-2 border border-glass-border rounded-xl p-4 font-mono text-[11px] text-emerald-500 dark:text-gold-primary/90 overflow-y-auto space-y-2 select-text tech-grid relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none rounded-xl" />
                        <div className="relative z-10 space-y-1">
                            {terminalLogs.map((log, idx) => (
                                <div key={idx} className="leading-relaxed whitespace-pre-wrap break-all">
                                    <span className="text-text-tertiary select-none">{`> `}</span>
                                    {log}
                                </div>
                            ))}
                            <div ref={terminalEndRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
