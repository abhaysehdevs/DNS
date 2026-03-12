'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Package, Truck, XCircle } from 'lucide-react';

export default function AdminDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    async function fetchOrders() {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setOrders(data);
        setLoading(false);
    }

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            fetchOrders(); // Refresh list
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-amber-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                    <Package className="text-amber-500" /> Order Management
                </h1>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-gray-800 flex gap-4 overflow-x-auto">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${filter === status
                                ? 'bg-amber-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-800 text-gray-400 text-sm uppercase">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-sm">
                            {filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500 truncate max-w-[100px]" title={order.id}>
                                        {order.id.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{order.customer_name}</div>
                                        <div className="text-gray-500 text-xs">{order.customer_email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-amber-500">
                                        ₹{order.total_amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'pending' ? 'bg-yellow-900/40 text-yellow-400' :
                                            order.status === 'shipped' ? 'bg-blue-900/40 text-blue-400' :
                                                order.status === 'delivered' ? 'bg-green-900/40 text-green-400' :
                                                    order.status === 'cancelled' ? 'bg-red-900/40 text-red-400' :
                                                        'bg-gray-800 text-gray-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => updateStatus(order.id, 'processing')}
                                                    className="p-1 bg-blue-900/30 text-blue-400 rounded hover:bg-blue-900/50"
                                                    title="Mark Processing"
                                                >
                                                    <Truck size={16} />
                                                </button>
                                            )}
                                            {order.status === 'processing' && (
                                                <button
                                                    onClick={() => updateStatus(order.id, 'shipped')}
                                                    className="p-1 bg-purple-900/30 text-purple-400 rounded hover:bg-purple-900/50"
                                                    title="Mark Shipped"
                                                >
                                                    <Truck size={16} />
                                                </button>
                                            )}
                                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => updateStatus(order.id, 'cancelled')}
                                                    className="p-1 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50"
                                                    title="Cancel Order"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No orders found matching this filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
