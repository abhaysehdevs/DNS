'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Loader2, 
    Package, 
    Truck, 
    XCircle, 
    ArrowRight, 
    TrendingUp, 
    Users, 
    AlertTriangle, 
    Zap, 
    Plus, 
    Grid,
    ShieldCheck,
    RefreshCw,
    Monitor,
    Activity,
    Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [quotes, setQuotes] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
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

    useEffect(() => {
        fetchData();
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

            // Fetch quotes and activities from database
            try {
                const { data: quotesData } = await supabase
                    .from('customer_quotes')
                    .select('*')
                    .order('date', { ascending: false })
                    .limit(5);
                if (quotesData) setQuotes(quotesData);
            } catch (err) {
                console.error('Error fetching quotes:', err);
            }

            try {
                const { data: activitiesData } = await supabase
                    .from('customer_activities')
                    .select('*')
                    .order('date', { ascending: false })
                    .limit(5);
                if (activitiesData) setActivities(activitiesData);
            } catch (err) {
                console.error('Error fetching activities:', err);
            }
            
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
            <div className="flex-1 flex items-center justify-center p-12 bg-[#FAF9F5] min-h-screen">
                <Loader2 className="animate-spin text-[#966E2E]" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto p-4 md:p-8 bg-[#FAF9F5] min-h-screen text-[#18181B]">
            {/* Intelligence Header */}
            <div className="flex flex-col gap-4 bg-white border border-[#E8E2D5] p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] relative overflow-hidden shadow-sm">
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                    <Activity size={200} className="text-[#18181B] -translate-y-20 translate-x-20" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] flex items-center gap-3">
                        <Zap className="text-[#966E2E]" fill="currentColor" /> Store Intelligence
                    </h2>
                    <p className="text-[#71717A] text-sm mt-2 max-w-xl">
                        Your global store is synchronized and healthy. We've analyzed your latest orders to provide actionable insights below.
                    </p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <div className="flex flex-col sm:items-end">
                        <span className="text-[10px] font-black text-[#966E2E] uppercase tracking-widest mb-1">Global Storage Engine</span>
                        <div className="flex items-center gap-2 bg-[#FAF9F5] px-4 py-2 rounded-full border border-[#E8E2D5]">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-[#18181B] uppercase tracking-tighter">Synced • Global CDN Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {[
                    { label: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, color: 'text-emerald-600', sub: 'Revenue to date', icon: TrendingUp },
                    { label: 'Total Orders', value: stats.totalOrders, color: 'text-[#18181B]', sub: 'Successful checkouts', icon: Package },
                    { label: 'Low Stock Items', value: lowStockProducts.length, color: 'text-rose-600', sub: 'Urgent attention needed', icon: AlertTriangle },
                    { label: 'Active Customers', value: stats.customersCount, color: 'text-[#966E2E]', sub: 'Global reach', icon: Users }
                ].map((item, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.label} 
                        className="bg-white border border-[#E8E2D5] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm relative overflow-hidden group hover:border-[#966E2E]/50 transition-all"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <item.icon className="text-[#71717A]" size={64} />
                        </div>
                        <p className="text-[#71717A] text-[10px] font-black uppercase tracking-widest mb-1 sm:mb-2">{item.label}</p>
                        <h3 className={`text-2xl sm:text-4xl font-black ${item.color}`}>{item.value}</h3>
                        <div className="mt-2 sm:mt-3 text-[10px] text-[#71717A] uppercase tracking-wider font-bold hidden sm:block">{item.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                    { label: 'Add Product', icon: Plus, href: '/admin/products' },
                    { label: 'Categories', icon: Grid, href: '/admin/categories' },
                    { label: 'Ship Orders', icon: Truck, href: '/admin/orders' },
                    { label: 'Marketing', icon: Zap, href: '/admin/cms' }
                ].map(action => (
                    <Link 
                        key={action.label} 
                        href={action.href}
                        className="bg-white border border-[#E8E2D5] p-4 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-2 sm:gap-3 hover:bg-[#FAF9F5] hover:border-[#966E2E] transition-all group shadow-sm"
                    >
                        <action.icon className="text-[#71717A] group-hover:text-[#966E2E] transition-colors" size={20} />
                        <span className="text-[10px] font-black text-[#52525B] group-hover:text-[#18181B] uppercase tracking-widest text-center">{action.label}</span>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Real-time Sales & Operations Analytics */}
                <div className="lg:col-span-2 bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-[#18181B] flex items-center gap-2">
                                <Activity className="text-emerald-600" size={18} /> Real-Time Analytics
                            </h3>
                            <p className="text-xs text-[#71717A] mt-1">Live metrics from your backend database</p>
                        </div>
                        <div className="text-xs text-[#52525B] px-3 py-1 bg-[#FAF9F5] rounded-full border border-[#E8E2D5] flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Updates
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-[#FAF9F5] border border-[#E8E2D5] p-4 rounded-xl">
                            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mb-1">Average Order Value (AOV)</span>
                            <span className="text-2xl font-black text-[#18181B]">
                                ₹{Math.round(stats.totalSales / (stats.totalOrders || 1)).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#71717A] block mt-1">Across all checkouts</span>
                        </div>
                        <div className="bg-[#FAF9F5] border border-[#E8E2D5] p-4 rounded-xl">
                            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mb-1">Active Staff Sessions</span>
                            <span className="text-2xl font-black text-[#18181B]">
                                {sessions.length}
                            </span>
                            <span className="text-[10px] text-[#71717A] block mt-1">Authorized terminals</span>
                        </div>
                        <div className="bg-[#FAF9F5] border border-[#E8E2D5] p-4 rounded-xl">
                            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mb-1">Sales (Last 24 Hours)</span>
                            <span className="text-2xl font-black text-emerald-600">
                                ₹{orders
                                    .filter(o => new Date(o.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000)
                                    .reduce((acc, o) => acc + (o.total_amount || 0), 0)
                                    .toLocaleString()}
                            </span>
                            <span className="text-[10px] text-[#71717A] block mt-1">Recent conversion value</span>
                        </div>
                        <div className="bg-[#FAF9F5] border border-[#E8E2D5] p-4 rounded-xl">
                            <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block mb-1">Orders (Last 24 Hours)</span>
                            <span className="text-2xl font-black text-[#966E2E]">
                                {orders.filter(o => new Date(o.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000).length}
                            </span>
                            <span className="text-[10px] text-[#71717A] block mt-1">Order velocity</span>
                        </div>
                    </div>

                    <div className="border-t border-[#E8E2D5] pt-4">
                        <h4 className="text-xs font-black text-[#71717A] uppercase tracking-wider mb-3">Recent Conversion Stream</h4>
                        <div className="space-y-3">
                            {orders.slice(0, 3).map((order) => (
                                <div key={order.id} className="flex justify-between items-center text-xs p-3 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5]">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[#18181B] truncate">{order.customer_name || 'Guest User'}</span>
                                            <span className="text-[9px] text-[#71717A] font-mono">#{order.id.slice(0, 8)}</span>
                                        </div>
                                        <div className="text-[10px] text-[#52525B] mt-0.5">
                                            {order.customer_email || order.customer_phone || 'No contact info'} • {order.order_items?.length || 0} items
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <div className="font-black text-emerald-600 font-mono">₹{order.total_amount.toLocaleString()}</div>
                                        <div className="text-[9px] text-[#71717A] mt-0.5">
                                            {(() => {
                                                const seconds = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 1000);
                                                if (seconds < 60) return 'just now';
                                                const minutes = Math.floor(seconds / 60);
                                                if (minutes < 60) return `${minutes}m ago`;
                                                const hours = Math.floor(minutes / 60);
                                                if (hours < 24) return `${hours}h ago`;
                                                const days = Math.floor(hours / 24);
                                                return `${days}d ago`;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {orders.length === 0 && (
                                <div className="text-center py-4 text-[#71717A] italic text-xs">No conversions recorded yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[#18181B] mb-6">Top Performers</h3>
                    <div className="space-y-4">
                        {stats.topProducts.map((p, idx) => (
                            <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5] hover:border-[#966E2E]/50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-[#71717A] w-4">{idx + 1}</span>
                                    <div>
                                        <div className="text-sm font-bold text-[#18181B] truncate max-w-[120px] group-hover:text-[#966E2E] transition-colors">{p.name}</div>
                                        <div className="text-[10px] text-[#52525B]">{p.count} units sold</div>
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-emerald-600">₹{p.revenue.toLocaleString()}</div>
                            </div>
                        ))}
                        {stats.topProducts.length === 0 && (
                            <div className="text-center py-10 text-[#71717A] italic text-sm border border-dashed border-[#E8E2D5] rounded-xl">No sales data yet</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Low Stock Alerts */}
                <div className="lg:col-span-1 bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <h3 className="text-lg font-bold text-[#18181B] mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-rose-500" size={20} /> Inventory Alerts
                    </h3>
                    <div className="space-y-3">
                        {lowStockProducts.length > 0 ? lowStockProducts.slice(0, 5).map(p => (
                            <div key={p.id} className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex justify-between items-center">
                                <span className="text-sm text-[#52525B] truncate max-w-[120px]">{p.name}</span>
                                <span className={`text-xs font-bold ${!p.in_stock ? 'text-rose-600' : 'text-amber-600'}`}>
                                    {!p.in_stock ? 'OUT' : `${p.quantity} LEFT`}
                                </span>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <div className="bg-emerald-50 text-emerald-700 text-xs px-3 py-2 rounded-full inline-block border border-emerald-200 font-bold">All stock levels healthy</div>
                            </div>
                        )}
                    </div>
                    {lowStockProducts.length > 5 && (
                        <Link href="/admin/products" className="block text-center mt-4 text-xs text-rose-600 hover:underline">View all {lowStockProducts.length} alerts</Link>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-3">
                    <div className="bg-white border border-[#E8E2D5] rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-[#E8E2D5] flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-xl font-bold text-[#18181B]">Live Orders</h2>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all cursor-pointer ${filter === status
                                            ? 'bg-[#966E2E] text-white shadow-sm'
                                            : 'bg-[#FAF9F5] text-[#71717A] hover:bg-[#F3EFE6] hover:text-[#18181B] border border-[#E8E2D5]'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-[#E8E2D5]">
                            {filteredOrders.slice(0, 10).map((order) => (
                                <div key={order.id} className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="min-w-0">
                                            <div className="font-bold text-[#18181B] text-sm truncate">{order.customer_name}</div>
                                            <div className="text-[10px] text-[#71717A] font-mono">#{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <div className="font-bold text-[#18181B]">₹{order.total_amount.toLocaleString()}</div>
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                                order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                'bg-[#FAF9F5] text-[#71717A] border-[#E8E2D5]'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        {order.status === 'pending' && (
                                            <button onClick={() => updateStatus(order.id, 'processing')} className="p-2 bg-[#FAF9F5] border border-[#E8E2D5] text-[#18181B] hover:bg-[#966E2E] hover:text-white rounded-lg transition-all cursor-pointer"><Truck size={14} /></button>
                                        )}
                                        {order.status === 'processing' && (
                                            <button onClick={() => updateStatus(order.id, 'shipped')} className="p-2 bg-[#FAF9F5] border border-[#E8E2D5] text-[#18181B] hover:bg-[#966E2E] hover:text-white rounded-lg transition-all cursor-pointer"><Truck size={14} /></button>
                                        )}
                                        <Link href="/admin/orders" className="p-2 bg-[#FAF9F5] border border-[#E8E2D5] text-[#71717A] hover:bg-[#18181B] hover:text-white rounded-lg transition-all">
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                            {filteredOrders.length === 0 && (
                                <div className="px-4 py-16 text-center text-[#71717A] italic">No orders found matching this filter.</div>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#FAF9F5] text-[#71717A] text-[10px] uppercase tracking-widest font-bold border-b border-[#E8E2D5]">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8E2D5] text-sm">
                                    {filteredOrders.slice(0, 10).map((order) => (
                                        <tr key={order.id} className="hover:bg-[#FAF9F5]/80 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-[10px] text-[#71717A]">
                                                #{order.id.slice(0, 8)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[#18181B] text-sm group-hover:text-[#966E2E] transition-colors">{order.customer_name}</div>
                                                <div className="text-[#71717A] text-[10px]">{new Date(order.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-[#18181B]">
                                                ₹{order.total_amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                                                    order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                    'bg-[#FAF9F5] text-[#71717A] border-[#E8E2D5]'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-2 justify-end md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    {order.status === 'pending' && (
                                                        <button onClick={() => updateStatus(order.id, 'processing')} className="p-2 bg-[#FAF9F5] border border-[#E8E2D5] text-[#18181B] hover:bg-[#966E2E] hover:text-white rounded-lg transition-all cursor-pointer"><Truck size={14} /></button>
                                                    )}
                                                    {order.status === 'processing' && (
                                                        <button onClick={() => updateStatus(order.id, 'shipped')} className="p-2 bg-[#FAF9F5] border border-[#E8E2D5] text-[#18181B] hover:bg-[#966E2E] hover:text-white rounded-lg transition-all cursor-pointer"><Truck size={14} /></button>
                                                    )}
                                                    <Link href="/admin/orders" className="p-2 bg-[#FAF9F5] border border-[#E8E2D5] text-[#71717A] hover:bg-[#18181B] hover:text-white rounded-lg transition-all">
                                                        <ArrowRight size={14} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-[#71717A] italic">No orders found matching this filter.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* CRM & Node Diagnostics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                {/* CRM quotes & interactions */}
                <div className="lg:col-span-2 bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
                    <h3 className="text-lg font-bold text-[#18181B] flex items-center gap-2 mb-6">
                        <Users className="text-[#966E2E]" size={20} /> Customer Relations (CRM)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                        {/* Quotes */}
                        <div className="flex flex-col min-h-0">
                            <h4 className="text-xs font-black text-[#71717A] uppercase tracking-wider mb-3">Active B2B Quotes</h4>
                            <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                                {quotes.map((q) => (
                                    <div key={q.id} className="p-3 bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl flex justify-between items-center text-xs">
                                        <div className="min-w-0">
                                            <p className="font-bold text-[#18181B] truncate">{q.customer_name}</p>
                                            <p className="text-[10px] text-[#52525B] truncate mt-0.5">{q.product_name}</p>
                                        </div>
                                        <div className="text-right shrink-0 ml-3">
                                            <span className="font-bold text-emerald-600">₹{Number(q.quoted_price).toLocaleString()}</span>
                                            <span className="text-[9px] text-[#71717A] block mt-0.5">{new Date(q.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {quotes.length === 0 && (
                                    <div className="text-center py-10 text-[#71717A] italic text-xs border border-dashed border-[#E8E2D5] rounded-xl">No active quotes yet</div>
                                )}
                            </div>
                        </div>

                        {/* Activities */}
                        <div className="flex flex-col min-h-0">
                            <h4 className="text-xs font-black text-[#71717A] uppercase tracking-wider mb-3">CRM Interaction Log</h4>
                            <div className="space-y-2 flex-1 overflow-y-auto pr-2">
                                {activities.map((act) => (
                                    <div key={act.id} className="p-3 bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl flex justify-between items-start text-xs gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                                    act.type === 'Call' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                    act.type === 'Order' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    act.type === 'Meeting' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                    'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>{act.type}</span>
                                                <span className="font-bold text-[#18181B] truncate">{act.summary}</span>
                                            </div>
                                            <p className="text-[10px] text-[#52525B] mt-1 line-clamp-1">{act.details || 'No details provided'}</p>
                                        </div>
                                        <span className="text-[9px] text-[#71717A] shrink-0">{new Date(act.date).toLocaleDateString()}</span>
                                    </div>
                                ))}
                                {activities.length === 0 && (
                                    <div className="text-center py-10 text-[#71717A] italic text-xs border border-dashed border-[#E8E2D5] rounded-xl">No recent activities</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Operator Sessions */}
                <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[#18181B] flex items-center gap-2">
                            <ShieldCheck className="text-emerald-600" size={20} /> Active Operators
                        </h3>
                        <button 
                            onClick={fetchSessions} 
                            className="p-1.5 hover:bg-[#FAF9F5] rounded-lg text-[#52525B] hover:text-[#18181B] transition-colors border border-[#E8E2D5]"
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
                                            ? 'bg-amber-50/60 border-[#966E2E]/40' 
                                            : 'bg-[#FAF9F5] border-[#E8E2D5] hover:border-[#966E2E]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`p-2 rounded-lg ${isCurrent ? 'bg-[#966E2E]/10 text-[#966E2E]' : 'bg-white border border-[#E8E2D5] text-[#71717A]'}`}>
                                            <Monitor size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-[#18181B] text-xs truncate">
                                                    {browser} on {isMobile ? 'Mobile' : 'Desktop'}
                                                </h4>
                                                {isCurrent && (
                                                    <span className="bg-[#966E2E] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Current</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-[#71717A] mt-0.5 font-mono truncate max-w-[140px] sm:max-w-none">
                                                <span className="hidden sm:inline">IP: {session.ip_address || '127.0.0.1'} • </span>Active: {new Date(session.last_active).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    {!isCurrent && (
                                        <button
                                            onClick={() => handleRevokeSession(session.id)}
                                            disabled={revokingId === session.id}
                                            className="p-1.5 text-[#71717A] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                            title="Terminate session"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                        {sessions.length === 0 && (
                            <div className="text-center py-10 text-[#71717A] font-mono text-xs border border-dashed border-[#E8E2D5] rounded-xl">
                                No operator sessions found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
