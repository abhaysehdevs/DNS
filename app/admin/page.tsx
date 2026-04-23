'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Package, Truck, XCircle, ArrowRight, Activity, TrendingUp, Users, AlertTriangle, Zap, Plus, Grid } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
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
            <div className="flex-1 flex items-center justify-center p-12 bg-black min-h-screen">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-[1600px] mx-auto p-4 md:p-8">
            {/* Intelligence Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-blue-600/10 border border-blue-500/20 p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                    <Activity size={200} className="text-blue-500 -translate-y-20 translate-x-20" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Zap className="text-blue-500" fill="currentColor" /> Store Intelligence
                    </h2>
                    <p className="text-gray-400 text-sm mt-2 max-w-xl">
                        Your global store is synchronized and healthy. We've analyzed your latest orders to provide actionable insights below.
                    </p>
                </div>
                <div className="flex gap-3 relative z-10">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Global Storage Engine</span>
                        <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-blue-500/30">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-white uppercase tracking-tighter">Synced • Global CDN Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, color: 'text-green-400', sub: 'Revenue to date', icon: TrendingUp },
                    { label: 'Total Orders', value: stats.totalOrders, color: 'text-white', sub: 'Successful checkouts', icon: Package },
                    { label: 'Low Stock Items', value: lowStockProducts.length, color: 'text-red-400', sub: 'Urgent attention needed', icon: AlertTriangle },
                    { label: 'Active Customers', value: stats.customersCount, color: 'text-blue-400', sub: 'Global reach', icon: Users }
                ].map((item, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={item.label} 
                        className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-gray-700 transition-all"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <item.icon size={64} />
                        </div>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{item.label}</p>
                        <h3 className={`text-4xl font-black ${item.color}`}>{item.value}</h3>
                        <div className="mt-3 text-[10px] text-gray-600 uppercase tracking-wider font-bold">{item.sub}</div>
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
                        className="bg-gray-900/50 border border-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-blue-600 hover:border-blue-500 transition-all group"
                    >
                        <action.icon className="text-gray-500 group-hover:text-white transition-colors" size={24} />
                        <span className="text-[10px] font-black text-gray-400 group-hover:text-white uppercase tracking-widest">{action.label}</span>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart (SVG-based) */}
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Weekly Sales Performance</h3>
                        <div className="text-xs text-gray-500 px-3 py-1 bg-black rounded-full border border-gray-800">Last 7 Days</div>
                    </div>
                    <div className="h-64 w-full flex items-end justify-between gap-2 px-2 relative">
                        {stats.salesTrend.map((day, idx) => {
                            const maxVal = Math.max(...stats.salesTrend.map(d => d.amount), 1);
                            const height = (day.amount / maxVal) * 100;
                            return (
                                <div key={day.date} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    <div className="absolute bottom-full mb-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-bold whitespace-nowrap">
                                        ₹{day.amount.toLocaleString()}
                                    </div>
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(height, 5)}%` }}
                                        className="w-full max-w-[40px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg group-hover:from-blue-500 group-hover:to-blue-300 transition-all shadow-lg shadow-blue-900/20"
                                    />
                                    <span className="text-[10px] text-gray-500 mt-3 rotate-45 origin-left">{new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6">Top Performers</h3>
                    <div className="space-y-4">
                        {stats.topProducts.map((p, idx) => (
                            <div key={p.name} className="flex items-center justify-between p-3 rounded-xl bg-black border border-gray-800/50 hover:border-blue-500/30 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-600 w-4">{idx + 1}</span>
                                    <div>
                                        <div className="text-sm font-bold text-white truncate max-w-[120px] group-hover:text-blue-400 transition-colors">{p.name}</div>
                                        <div className="text-[10px] text-gray-500">{p.count} units sold</div>
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-green-400">₹{p.revenue.toLocaleString()}</div>
                            </div>
                        ))}
                        {stats.topProducts.length === 0 && (
                            <div className="text-center py-10 text-gray-600 italic text-sm border border-dashed border-gray-800 rounded-xl">No sales data yet</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Low Stock Alerts */}
                <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={20} /> Inventory Alerts
                    </h3>
                    <div className="space-y-3">
                        {lowStockProducts.length > 0 ? lowStockProducts.slice(0, 5).map(p => (
                            <div key={p.id} className="p-3 bg-red-900/10 border border-red-900/20 rounded-xl flex justify-between items-center">
                                <span className="text-sm text-gray-300 truncate max-w-[120px]">{p.name}</span>
                                <span className={`text-xs font-bold ${!p.in_stock ? 'text-red-500' : 'text-amber-500'}`}>
                                    {!p.in_stock ? 'OUT' : `${p.quantity} LEFT`}
                                </span>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <div className="bg-green-900/10 text-green-500 text-xs px-3 py-2 rounded-full inline-block border border-green-900/20">All stock levels healthy</div>
                            </div>
                        )}
                    </div>
                    {lowStockProducts.length > 5 && (
                        <Link href="/admin/products" className="block text-center mt-4 text-xs text-red-400 hover:text-red-300 underline underline-offset-4">View all {lowStockProducts.length} alerts</Link>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-3">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-xl font-bold text-white">Live Orders</h2>
                            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${filter === status
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                            : 'bg-black text-gray-500 hover:bg-gray-800 hover:text-white border border-gray-800'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-black/50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50 text-sm">
                                    {filteredOrders.slice(0, 10).map((order) => (
                                        <tr key={order.id} className="hover:bg-blue-900/5 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-[10px] text-gray-600">
                                                #{order.id.slice(0, 8)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{order.customer_name}</div>
                                                <div className="text-gray-600 text-[10px]">{new Date(order.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-white">
                                                ₹{order.total_amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${order.status === 'pending' ? 'bg-yellow-900/10 text-yellow-500 border-yellow-900/30' :
                                                    order.status === 'shipped' ? 'bg-blue-900/10 text-blue-500 border-blue-900/30' :
                                                        order.status === 'delivered' ? 'bg-green-900/10 text-green-500 border-green-900/30' :
                                                            order.status === 'cancelled' ? 'bg-red-900/10 text-red-500 border-red-900/30' :
                                                                'bg-gray-800 text-gray-400'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {order.status === 'pending' && (
                                                        <button onClick={() => updateStatus(order.id, 'processing')} className="p-2 bg-blue-900/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Truck size={14} /></button>
                                                    )}
                                                    {order.status === 'processing' && (
                                                        <button onClick={() => updateStatus(order.id, 'shipped')} className="p-2 bg-purple-900/20 text-purple-400 rounded-lg hover:bg-purple-600 hover:text-white transition-all"><Truck size={14} /></button>
                                                    )}
                                                    <Link href="/admin/orders" className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-white hover:text-black transition-all">
                                                        <ArrowRight size={14} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredOrders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-gray-500 italic">No orders found matching this filter.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
