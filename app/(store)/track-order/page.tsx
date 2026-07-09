'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Loader2, ArrowRight, Package, Truck, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [order, setOrder] = useState<any | null>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId || !email) return;

        setLoading(true);
        setError(null);
        setSearched(false);
        setOrder(null);
        setOrderItems([]);

        try {
            // Trim spaces and clean orderId
            const cleanOrderId = orderId.trim();
            const cleanEmail = email.trim().toLowerCase();

            // Fetch order matching ID and customer email
            const { data: orderData, error: orderErr } = await supabase
                .from('orders')
                .select('*')
                .eq('id', cleanOrderId)
                .eq('customer_email', cleanEmail)
                .maybeSingle();

            if (orderErr) throw orderErr;

            if (!orderData) {
                setError('No order was found matching the provided Order ID and Email Address. Please check details and try again.');
                setLoading(false);
                return;
            }

            // Fetch order items
            const { data: itemsData, error: itemsErr } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', cleanOrderId);

            if (itemsErr) throw itemsErr;

            setOrder(orderData);
            setOrderItems(itemsData || []);
            setSearched(true);
        } catch (err: any) {
            console.error('Error tracking order:', err);
            setError(err.message || 'An error occurred while scanning database logs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStepIndex = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 0;
            case 'processing': return 1;
            case 'shipped': return 2;
            case 'delivered': return 3;
            default: return 0;
        }
    };

    const steps = [
        { label: 'Order Placed', desc: 'Fulfillment protocol initialized.' },
        { label: 'Processing', desc: 'Manifest curating & technical inspection.' },
        { label: 'Shipped', desc: 'Dispatched via regional express carrier.' },
        { label: 'Delivered', desc: 'Secure package dropped at destination.' }
    ];

    return (
        <div className="min-h-screen bg-[#151515] text-[#F8F3E8] pt-36 pb-24 px-6 selection:bg-[#A67C35]/30 relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-[#A67C35]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#1E1E1E] border border-[#343434] text-[#A67C35] text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow">
                        <Truck size={12} /> Logistics Node
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase leading-none font-display">Track <span className="bg-gradient-to-r from-text-primary to-[#A67C35] bg-clip-text text-transparent">Order</span></h1>
                    <p className="text-xs text-[#CFCFCF] font-semibold leading-relaxed uppercase tracking-wider">
                        Enter your credentials to scan the active shipment logs.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {/* Track Form */}
                    <div className="bg-[#1C1C1E] border border-[#343434] p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-xl mx-auto w-full relative">
                        <form onSubmit={handleTrack} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Order Identifier (UUID)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 8fa160c8-da92-4933..."
                                    required
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full bg-[#151515] border border-[#343434] rounded-xl px-4 py-4 text-xs font-mono tracking-wider text-[#F8F3E8] focus:outline-none focus:border-[#A67C35] transition-all placeholder-[#5A5A6A]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Account Email Address</label>
                                <input
                                    type="email"
                                    placeholder="e.g. buyer@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#151515] border border-[#343434] rounded-xl px-4 py-4 text-xs font-semibold tracking-wider text-[#F8F3E8] focus:outline-none focus:border-[#A67C35] transition-all placeholder-[#5A5A6A]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-[#A67C35] hover:bg-[#8A6232] disabled:opacity-50 text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : (
                                    <>Scan Database <ArrowRight size={14} /></>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Results Area */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-3xl text-center text-xs font-bold uppercase tracking-wider max-w-xl mx-auto"
                            >
                                {error}
                            </motion.div>
                        )}

                        {searched && order && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="space-y-10"
                            >
                                {/* Order Metadata Card */}
                                <div className="bg-[#1C1C1E] border border-[#343434] rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                                        <Package size={160} className="text-[#A67C35]" />
                                    </div>

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-[#343434]/40 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Manifest Code</span>
                                                <span className="text-sm font-black font-mono text-white">#{order.id}</span>
                                                {order.status === 'cancelled' ? (
                                                    <span className="px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border bg-red-900/10 text-red-500 border-red-900/30">
                                                        Cancelled
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border bg-emerald-900/10 text-emerald-500 border-emerald-900/30">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-400 block mt-1 uppercase tracking-widest font-mono">
                                                LOGGED ON: {new Date(order.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <div className="text-2xl font-black text-[#A67C35]">₹{order.total_amount?.toLocaleString('en-IN')}</div>
                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{order.payment_method}</span>
                                        </div>
                                    </div>

                                    {/* Visual Step Tracker */}
                                    {order.status !== 'cancelled' && (
                                        <div className="py-12 border-b border-[#343434]/40">
                                            <div className="relative flex flex-col md:flex-row justify-between gap-8 md:gap-4 md:items-center">
                                                {/* Connecting line */}
                                                <div className="absolute left-[15px] top-[15px] bottom-[15px] md:bottom-auto md:left-0 md:right-0 md:top-[15px] h-full md:h-1 bg-[#343434] -z-10" />
                                                <div 
                                                    className="absolute left-[15px] top-[15px] bottom-auto md:bottom-auto md:left-0 md:top-[15px] h-auto md:h-1 bg-[#A67C35] -z-10 transition-all duration-500" 
                                                    style={{
                                                        width: typeof window !== 'undefined' && window.innerWidth >= 768 
                                                            ? `${(getStatusStepIndex(order.status) / 3) * 100}%` 
                                                            : '4px',
                                                        height: typeof window !== 'undefined' && window.innerWidth < 768
                                                            ? `${(getStatusStepIndex(order.status) / 3) * 100}%`
                                                            : 'auto'
                                                    }}
                                                />

                                                {steps.map((step, idx) => {
                                                    const stepIndex = getStatusStepIndex(order.status);
                                                    const isActive = idx <= stepIndex;
                                                    const isCurrent = idx === stepIndex;

                                                    return (
                                                        <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center relative gap-4 md:gap-3 flex-1">
                                                            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-black relative transition-all ${
                                                                isCurrent ? 'bg-[#A67C35] text-black border-black shadow-[0_0_15px_rgba(166,124,53,0.3)] scale-110' :
                                                                isActive ? 'bg-[#1E1E1E] text-[#A67C35] border-[#A67C35]' :
                                                                'bg-[#151515] text-gray-700 border-[#343434]'
                                                            }`}>
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <p className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-gray-600'}`}>{step.label}</p>
                                                                <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5 max-w-[150px]">{step.desc}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Dispatch and Carrier Details */}
                                    <div className="py-8 border-b border-[#343434]/40 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Shipment Diagnostics</h4>
                                            {order.awb_code ? (
                                                <div className="grid grid-cols-2 gap-4 text-[10px]">
                                                    <div>
                                                        <span className="text-gray-500 uppercase tracking-wider font-bold">Carrier</span>
                                                        <p className="font-black text-white mt-0.5">{order.payment_method === 'cod' ? 'Speed Post' : 'BlueDart Express'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 uppercase tracking-wider font-bold">AWB Code</span>
                                                        <p className="font-black text-white font-mono mt-0.5">{order.awb_code}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-gray-500 uppercase tracking-wider font-bold">Logistics Tracker</span>
                                                        <a 
                                                            href={`https://delhivery.com/track/package/${order.awb_code}`} 
                                                            target="_blank" 
                                                            className="text-[#A67C35] hover:underline font-black block mt-0.5"
                                                        >
                                                            OPEN SHIPROCKET AIRWAYBILL →
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                                                    Order payload logged. Awaiting dispatch clearance from factory logistics node. Live carrier coordinates will display here upon handover.
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Delivery Destination</h4>
                                            <div className="text-[10px] text-gray-400 space-y-1 font-semibold uppercase leading-relaxed">
                                                <p className="font-bold text-white">{order.customer_name}</p>
                                                <p>{order.shipping_address}</p>
                                                <p className="font-mono text-gray-500">Contact: {order.customer_phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Itemized Manifest */}
                                    <div className="pt-8 space-y-4">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Itemized Manifest</h4>
                                        <div className="divide-y divide-[#343434]/40">
                                            {orderItems.map((item) => (
                                                <div key={item.id} className="py-4 flex justify-between items-center text-xs first:pt-0 last:pb-0">
                                                    <div>
                                                        <p className="font-bold text-white uppercase tracking-wider">{item.product_name}</p>
                                                        <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Quantity: x{item.quantity} {item.variant_name ? `• ${item.variant_name}` : ''}</p>
                                                    </div>
                                                    <span className="font-black text-[#A67C35] font-mono">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
