'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Filter, Eye, Truck, CheckCircle, XCircle, Clock, Save, X, Package, ChevronDown, CheckSquare, Square, Download, Printer, Phone, Mail, MapPin, Receipt, CreditCard, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    payment_status?: string;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
        } else {
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus as any });
            }
        }
    };

    const handleBulkStatusUpdate = async (newStatus: string) => {
        if (!confirm(`Update ${selectedIds.length} orders to ${newStatus}?`)) return;

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .in('id', selectedIds);

        if (error) {
            alert('Bulk update failed: ' + error.message);
        } else {
            setSelectedIds([]);
            fetchOrders();
        }
    };

    const handleShiprocketPush = async (orderId: string) => {
        if (!confirm('This will send the order to Shiprocket for fulfillment. Continue?')) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('shiprocket-order', {
                body: { order_id: orderId }
            });

            if (error) throw error;
            alert('Order successfully sent to Shiprocket! Tracking ID: ' + (data.shipment_id || 'Generating...'));
            fetchOrders();
        } catch (error: any) {
            alert('Failed to send order: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOrder = async (order: Order) => {
        setSelectedOrder(order);
        setItemsLoading(true);
        
        try {
            const { data, error } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);
                
            if (error) throw error;
            setOrderItems(data || []);
        } catch (error) {
            setOrderItems([]);
        } finally {
            setItemsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-900/10 text-amber-500 border-amber-900/30';
            case 'processing': return 'bg-blue-900/10 text-blue-500 border-blue-900/30';
            case 'shipped': return 'bg-purple-900/10 text-purple-500 border-purple-900/30';
            case 'delivered': return 'bg-green-900/10 text-green-500 border-green-900/30';
            case 'cancelled': return 'bg-red-900/10 text-red-500 border-red-900/30';
            default: return 'bg-gray-800 text-gray-400';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_phone?.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen text-gray-100 p-4 md:p-8 max-w-[1600px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Receipt className="text-blue-500" /> Order Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Process transactions, update fulfillment status, and manage shipments.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold border border-gray-800 flex items-center gap-2 transition-all shadow-xl">
                        <Download size={16} /> Export Logs
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 z-30 backdrop-blur shadow-xl">
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="relative min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search ID, Customer, Email or Phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:border-blue-500 outline-none transition-all placeholder-gray-600"
                        />
                    </div>
                    <div className="relative min-w-[180px]">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded-xl pl-11 pr-8 py-2.5 text-sm appearance-none outline-none cursor-pointer hover:border-gray-700 transition-all"
                        >
                            <option value="all">All Channels</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={14} />
                    </div>
                </div>

                {/* Bulk Actions */}
                <AnimatePresence>
                    {selectedIds.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-3 bg-blue-900/10 border border-blue-900/20 px-4 py-1.5 rounded-xl"
                        >
                            <span className="text-xs font-bold text-blue-400">{selectedIds.length} orders selected</span>
                            <div className="h-4 w-px bg-blue-900/30 mx-1" />
                            <select 
                                onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                                className="bg-transparent text-[10px] font-black uppercase text-white outline-none cursor-pointer"
                                defaultValue=""
                            >
                                <option value="" disabled>Update Status</option>
                                <option value="processing">Set Processing</option>
                                <option value="shipped">Set Shipped</option>
                                <option value="delivered">Set Delivered</option>
                                <option value="cancelled">Set Cancelled</option>
                            </select>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Orders Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/50 text-gray-500 uppercase text-[10px] tracking-widest font-black border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <button onClick={() => setSelectedIds(selectedIds.length === filteredOrders.length ? [] : filteredOrders.map(o => o.id))} className="text-gray-600 hover:text-white transition-colors">
                                        {selectedIds.length === filteredOrders.length && filteredOrders.length > 0 ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} />}
                                    </button>
                                </th>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Customer Details</th>
                                <th className="px-6 py-4 text-right">Total Amount</th>
                                <th className="px-6 py-4">Fulfillment Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-32 text-center">
                                        <Loader2 className="animate-spin text-blue-500 mx-auto" size={48} />
                                        <p className="mt-4 text-gray-500 font-medium">Syncing live orders...</p>
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-32 text-center text-gray-600 italic">
                                        No active orders found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className={`group hover:bg-blue-900/5 transition-colors ${selectedIds.includes(order.id) ? 'bg-blue-900/10' : ''}`}>
                                        <td className="px-6 py-4">
                                            <button onClick={() => setSelectedIds(prev => prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id])} className="text-gray-700 group-hover:text-gray-400 transition-colors">
                                                {selectedIds.includes(order.id) ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-mono text-[10px] text-gray-500">#{order.id.slice(0, 8)}</div>
                                            <div className="text-[10px] text-gray-600 mt-1">{new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{order.customer_name || 'Guest User'}</div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] text-gray-500 flex items-center gap-1"><Mail size={10} /> {order.customer_email}</span>
                                                {order.customer_phone && <span className="text-[10px] text-gray-500 flex items-center gap-1"><Phone size={10} /> {order.customer_phone}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-lg font-black text-white">₹{order.total_amount?.toLocaleString() || 0}</div>
                                            <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{order.payment_method || 'Prepaid'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative w-fit">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                                    className={`text-[10px] px-4 py-1.5 rounded-full border cursor-pointer outline-none appearance-none font-black uppercase tracking-widest text-center w-32 ${getStatusColor(order.status)} transition-all hover:border-white/50`}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={12} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleViewOrder(order)}
                                                    className="p-2.5 bg-gray-800 text-gray-400 hover:bg-white hover:text-black rounded-xl transition-all shadow-lg"
                                                    title="View Full manifest"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                {order.status === 'processing' && (
                                                    <button onClick={() => handleShiprocketPush(order.id)} className="p-2.5 bg-purple-900/20 text-purple-400 hover:bg-purple-600 hover:text-white rounded-xl transition-all shadow-lg">
                                                        <Truck size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Enhanced Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-black/95 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-gray-800 flex justify-between items-start bg-gray-900 shrink-0">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-3xl font-black text-white">Order Invoice</h2>
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 font-mono">Reference: {selectedOrder.id}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => alert('Printing...')} className="w-12 h-12 bg-black border border-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:border-white transition-all"><Printer size={20} /></button>
                                    <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 bg-black border border-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:border-white transition-all"><X size={24} /></button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-12">
                                {/* Grid: Customer & Shipping */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                            <span className="w-8 h-px bg-gray-800" /> Customer Information
                                        </h3>
                                        <div className="bg-black border border-gray-800 rounded-3xl p-6 space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0"><Users size={20} /></div>
                                                <div>
                                                    <p className="text-white font-bold text-lg">{selectedOrder.customer_name || 'Guest User'}</p>
                                                    <p className="text-gray-500 text-sm">{selectedOrder.customer_email}</p>
                                                    <p className="text-gray-500 text-sm">{selectedOrder.customer_phone}</p>
                                                </div>
                                            </div>
                                            <div className="h-px bg-gray-800/50" />
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-green-600/10 text-green-500 flex items-center justify-center shrink-0"><CreditCard size={20} /></div>
                                                <div>
                                                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Payment Method</p>
                                                    <p className="text-white font-bold">{selectedOrder.payment_method || 'Razorpay / Prepaid'}</p>
                                                    <p className="text-green-500 text-[10px] font-black uppercase">Transaction Secured</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                            <span className="w-8 h-px bg-gray-800" /> Logistics Details
                                        </h3>
                                        <div className="bg-black border border-gray-800 rounded-3xl p-6 space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-600/10 text-amber-500 flex items-center justify-center shrink-0"><MapPin size={20} /></div>
                                                <div>
                                                    <p className="text-gray-400 text-xs font-bold uppercase mb-1">Shipping Address</p>
                                                    <p className="text-white text-sm leading-relaxed">{selectedOrder.shipping_address || 'Address information not provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items Table */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                                        <span className="w-8 h-px bg-gray-800" /> Itemized Manifest
                                    </h3>
                                    <div className="bg-black border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-900/50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                                <tr>
                                                    <th className="px-6 py-4">Line Item</th>
                                                    <th className="px-6 py-4 text-center">Qty</th>
                                                    <th className="px-6 py-4 text-right">Unit Price</th>
                                                    <th className="px-6 py-4 text-right">Extended</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-800/50">
                                                {itemsLoading ? (
                                                    <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500"><Loader2 className="animate-spin mx-auto mb-2" /> Loading manifest...</td></tr>
                                                ) : orderItems.length > 0 ? orderItems.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-blue-900/5 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-white">{item.product_name}</div>
                                                            <div className="text-[10px] text-gray-600 font-mono">{item.variant_name || 'Standard Unit'}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center font-bold text-gray-400">x{item.quantity}</td>
                                                        <td className="px-6 py-4 text-right text-gray-300 font-mono">₹{item.price?.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right text-white font-black font-mono">₹{(item.price * item.quantity).toLocaleString()}</td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-20 text-center">
                                                            <Package className="mx-auto text-gray-800 mb-2" size={40} />
                                                            <p className="text-gray-600 italic">No item data recorded for this beta session.</p>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        
                                        {/* Totals Section */}
                                        <div className="p-8 bg-gray-900/30 border-t border-gray-800 flex justify-end">
                                            <div className="w-full max-w-xs space-y-4">
                                                <div className="flex justify-between items-center text-gray-400">
                                                    <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                                                    <span className="font-mono">₹{selectedOrder.total_amount?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-gray-400">
                                                    <span className="text-xs font-bold uppercase tracking-widest">Processing Fee</span>
                                                    <span className="font-mono">₹0.00</span>
                                                </div>
                                                <div className="h-px bg-gray-800" />
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-black text-white uppercase tracking-[0.2em]">Total</span>
                                                    <span className="text-2xl font-black text-green-400 font-mono">₹{selectedOrder.total_amount?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer Actions */}
                            <div className="p-8 border-t border-gray-800 bg-gray-900 flex justify-between items-center z-10 shrink-0">
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => updateStatus(selectedOrder.id, 'cancelled')}
                                        className="px-6 py-3 rounded-2xl border border-red-900/30 text-red-500 font-bold text-xs uppercase hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        Void Order
                                    </button>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setSelectedOrder(null)}
                                        className="px-8 py-3 rounded-2xl bg-gray-800 text-white font-bold transition-all"
                                    >
                                        Close
                                    </button>
                                    <button 
                                        onClick={() => handleShiprocketPush(selectedOrder.id)}
                                        className="px-8 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-purple-900/40 transition-all flex items-center gap-2"
                                    >
                                        <Truck size={20} /> Deploy Shipment
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
