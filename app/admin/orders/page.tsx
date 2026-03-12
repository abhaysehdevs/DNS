
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Filter, Eye, Truck, CheckCircle, XCircle, Clock, Save, X, Package } from 'lucide-react';

interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    total_amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_method: string;
    shipping_address: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error);
        else setOrders(data || []);
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('Error updating status');
            console.error(error);
        } else {
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus as any });
            }
        }
    };

    const handleShiprocketPush = async (orderId: string) => {
        if (!confirm('This will send the order to Shiprocket. Ensure your Edge Function is deployed. Continue?')) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('shiprocket-order', {
                body: { order_id: orderId }
            });

            if (error) throw error;
            alert('Order successfully sent to Shiprocket! Tracking ID: ' + (data.shipment_id || 'Pending'));
            fetchOrders(); // Refresh to see new status
        } catch (error: any) {
            console.error('Shiprocket Error:', error);
            alert('Failed to send order: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = async (order: Order) => {
        setSelectedOrder(order);
        setItemsLoading(true);
        // Fetch items logic would go here
        // const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
        // setOrderItems(data || []);

        // Simulating delay for effect since we might strictly not have items yet
        setTimeout(() => {
            setOrderItems([]);
            setItemsLoading(false);
        }, 500);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-900/20 text-yellow-500 border-yellow-900/30';
            case 'processing': return 'bg-blue-900/20 text-blue-500 border-blue-900/30';
            case 'shipped': return 'bg-purple-900/20 text-purple-500 border-purple-900/30';
            case 'delivered': return 'bg-green-900/20 text-green-500 border-green-900/30';
            case 'cancelled': return 'bg-red-900/20 text-red-500 border-red-900/30';
            default: return 'bg-gray-800 text-gray-400';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen text-gray-100 p-4">
            {/* Header / Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 z-10 shadow-lg">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
                        />
                    </div>
                    <div className="relative w-full md:w-48">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-8 py-2 text-sm appearance-none outline-none cursor-pointer hover:bg-gray-750"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="text-sm text-gray-400 font-medium">
                    Showing <span className="text-white">{filteredOrders.length}</span> orders
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Order ID</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Customer</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Total</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin text-blue-500" size={24} />
                                            <span className="text-lg">Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-12 h-12 opacity-20" />
                                            <p className="text-lg font-medium">No orders found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-gray-800/40 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            {new Date(order.created_at).toLocaleDateString()} <br />
                                            <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{order.customer_name || 'Guest'}</div>
                                            <div className="text-xs text-gray-500">{order.customer_email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-white">
                                            ₹{order.total_amount?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer outline-none appearance-none font-medium text-center w-28 uppercase tracking-wider ${getStatusColor(order.status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleViewOrder(order)}
                                                className="text-blue-400 hover:bg-blue-900/20 p-2 rounded-lg transition-colors group-hover:bg-gray-800"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-6 flex justify-between items-center z-10">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-white">Order Details</h2>
                                    <span className={`px-2 py-0.5 rounded-full text-xs uppercase border ${getStatusColor(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 font-mono mt-1">ID: {selectedOrder.id}</p>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleShiprocketPush(selectedOrder.id)}
                                    className="mr-2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors flex items-center gap-2"
                                    title="Send to Shiprocket"
                                >
                                    <Truck size={20} />
                                </button>
                                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Customer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer</h3>
                                    <p className="font-medium text-white text-lg">{selectedOrder.customer_name || 'Guest'}</p>
                                    <p className="text-sm text-gray-400">{selectedOrder.customer_email}</p>
                                    <p className="text-sm text-gray-400">{selectedOrder.customer_phone}</p>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Information</h3>
                                    <p className="text-sm text-gray-300 leading-relaxed bg-gray-800/50 p-3 rounded-lg border border-gray-800">
                                        {selectedOrder.shipping_address || 'No address provided'}
                                    </p>
                                </div>
                            </div>

                            {/* Items List (Placeholder/Future Proof) */}
                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h3>
                                <div className="bg-gray-800/30 rounded-lg border border-gray-800 overflow-hidden">
                                    {itemsLoading ? (
                                        <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
                                            <Loader2 className="animate-spin" size={16} /> Loading items...
                                        </div>
                                    ) : orderItems.length > 0 ? (
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-2">Product</th>
                                                    <th className="px-4 py-2 text-right">Qty</th>
                                                    <th className="px-4 py-2 text-right">Price</th>
                                                    <th className="px-4 py-2 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderItems.map((item, idx) => (
                                                    <tr key={idx} className="border-b border-gray-800 last:border-0">
                                                        <td className="px-4 py-3">{item.product_name || 'Product'}</td>
                                                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right">₹{item.price}</td>
                                                        <td className="px-4 py-3 text-right">₹{item.price * item.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                                            <Package className="opacity-20" size={32} />
                                            <p>No item details available for this order.</p>
                                            <p className="text-xs">(Items might not have been recorded correctly during beta)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="border-t border-gray-800 pt-4 flex justify-end">
                                <div className="w-full md:w-1/2 space-y-2">
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Subtotal</span>
                                        <span>₹{selectedOrder.total_amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-400">
                                        <span>Shipping</span>
                                        <span>₹0.00</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-800 mt-2">
                                        <span>Total</span>
                                        <span className="text-green-400">₹{selectedOrder.total_amount?.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-800 bg-gray-900 sticky bottom-0 flex justify-end gap-3 z-10">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Close
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                onClick={() => alert('Download Invoice feature coming soon!')}
                            >
                                <Save size={16} /> Download Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
