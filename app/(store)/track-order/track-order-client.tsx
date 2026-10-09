'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Loader2, ArrowRight, Package, Truck, Calendar, CreditCard, ShieldCheck, MessageSquare, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function TrackOrderClient() {
    const [orderId, setOrderId] = useState('');
    const [identifier, setIdentifier] = useState(''); // Email or Phone
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [order, setOrder] = useState<any | null>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId || !identifier) return;

        setLoading(true);
        setError(null);
        setSearched(false);
        setOrder(null);
        setOrderItems([]);

        try {
            const cleanOrderId = orderId.trim();
            const cleanIdentifier = identifier.trim().toLowerCase();

            // Try query matching either customer_email OR customer_phone
            let query = supabase.from('orders').select('*');

            if (cleanOrderId.length >= 8) {
                // Check if full UUID or partial
                query = query.ilike('id', `${cleanOrderId}%`);
            } else {
                query = query.eq('id', cleanOrderId);
            }

            const { data: matchedOrders, error: orderErr } = await query;

            if (orderErr) throw orderErr;

            const foundOrder = (matchedOrders || []).find((o: any) => {
                const em = (o.customer_email || '').toLowerCase();
                const ph = (o.customer_phone || '').replace(/\D/g, '');
                const cleanPhone = cleanIdentifier.replace(/\D/g, '');
                return em === cleanIdentifier || (cleanPhone.length >= 10 && ph.includes(cleanPhone));
            });

            if (!foundOrder) {
                setError('No order was found matching the provided Order ID and Email/Phone. Please check your confirmation SMS or contact our workshop desk.');
                setLoading(false);
                return;
            }

            // Fetch order items
            const { data: itemsData } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', foundOrder.id);

            setOrder(foundOrder);
            setOrderItems(itemsData || []);
            setSearched(true);
        } catch (err: any) {
            console.error('Error tracking order:', err);
            setError('An error occurred while scanning order records. Please try again or reach our team on WhatsApp.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStepIndex = (status: string) => {
        switch ((status || '').toLowerCase()) {
            case 'pending': return 0;
            case 'processing': return 1;
            case 'shipped': return 2;
            case 'delivered': return 3;
            default: return 0;
        }
    };

    const steps = [
        { label: 'Order Confirmed', desc: 'Order logged and payment verified.' },
        { label: 'Processing & Inspection', desc: 'Workbench packing & quality verification.' },
        { label: 'Dispatched via Carrier', desc: 'Handed over to logistics carrier with AWB.' },
        { label: 'Delivered', desc: 'Package received by customer.' },
    ];

    const currentStep = order ? getStatusStepIndex(order.status) : 0;

    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] pt-4 sm:pt-6 md:pt-8 pb-20 selection:bg-[#966E2E]/20">
            <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl">
                
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] text-[9px] font-black uppercase tracking-[0.2em] shadow-xs">
                        <Truck size={12} /> Real-Time Dispatch Portal
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase leading-none font-display text-[#18181B]">
                        Track <span className="text-[#966E2E]">Your Order</span>
                    </h1>
                    <p className="text-[11px] sm:text-xs text-[#52525B] font-semibold leading-relaxed uppercase tracking-wider max-w-md mx-auto">
                        Enter your Order ID and the Email or Phone used during checkout to view dispatch & delivery progress.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:gap-8">
                    {/* Track Form */}
                    <div className="bg-white border border-[#E8E2D5] p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2rem] shadow-xs max-w-xl mx-auto w-full relative">
                        <form onSubmit={handleTrack} className="space-y-4">
                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest block">
                                    Order ID / Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. 8fa160c8... or invoice order number"
                                    required
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl px-4 py-3.5 text-xs font-mono tracking-wider text-[#18181B] focus:outline-none focus:border-[#966E2E] transition-all placeholder-[#A1A1AA]"
                                />
                                <span className="text-[8.5px] text-[#71717A] flex items-center gap-1 font-medium">
                                    <HelpCircle size={10} className="text-[#966E2E]" /> Found in your confirmation email, SMS, or tax invoice.
                                </span>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest block">
                                    Email Address or Phone Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. buyer@example.com or 9953435647"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl px-4 py-3.5 text-xs font-semibold tracking-wider text-[#18181B] focus:outline-none focus:border-[#966E2E] transition-all placeholder-[#A1A1AA]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-[#966E2E] hover:bg-[#7D5A25] disabled:opacity-50 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : (
                                    <><span>Track Shipment Status</span> <ArrowRight size={14} /></>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Results Area */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-2xl max-w-xl mx-auto text-xs font-medium space-y-2 text-left"
                            >
                                <p>{error}</p>
                                <p className="text-[11px] text-[#52525B]">
                                    Need assistance? Message our WhatsApp dispatch desk:{' '}
                                    <a 
                                        href={`https://wa.me/919953435647?text=${encodeURIComponent(`Hello Dinanath & Sons, I need help tracking my order (${orderId})`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#966E2E] font-bold underline"
                                    >
                                        +91 9953435647
                                    </a>
                                </p>
                            </motion.div>
                        )}

                        {searched && order && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white border border-[#E8E2D5] rounded-3xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto w-full space-y-6 text-left"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8E2D5] pb-4">
                                    <div>
                                        <span className="text-[9px] font-mono font-bold text-[#71717A] uppercase">Order ID</span>
                                        <h3 className="text-sm font-mono font-bold text-[#18181B]">{order.id}</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[9px] font-mono font-bold text-[#71717A] uppercase">Status</span>
                                        <div className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-0.5 inline-block">
                                            {order.status || 'Processing'}
                                        </div>
                                    </div>
                                </div>

                                {/* Stepper */}
                                <div className="space-y-4 pt-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#966E2E]">Fulfillment Pipeline</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                        {steps.map((st, idx) => {
                                            const isDone = idx <= currentStep;
                                            return (
                                                <div key={idx} className={`p-3 rounded-xl border text-left ${isDone ? 'bg-amber-50/60 border-[#966E2E]/40' : 'bg-[#FAF9F5] border-[#E8E2D5] opacity-60'}`}>
                                                    <span className={`text-[9px] font-mono font-bold uppercase block mb-1 ${isDone ? 'text-[#966E2E]' : 'text-[#71717A]'}`}>
                                                        Step {idx + 1}
                                                    </span>
                                                    <h5 className="text-[11px] font-bold text-[#18181B] leading-tight mb-0.5">{st.label}</h5>
                                                    <p className="text-[9px] text-[#71717A] leading-relaxed">{st.desc}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Order Items Summary */}
                                {orderItems.length > 0 && (
                                    <div className="pt-4 border-t border-[#E8E2D5] space-y-2">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#18181B]">Items in Parcel</h4>
                                        <div className="space-y-2">
                                            {orderItems.map((item: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5]">
                                                    <span className="font-semibold text-[#18181B]">{item.product_name || item.name || `Item ${i+1}`} (x{item.quantity || 1})</span>
                                                    <span className="font-mono font-bold text-[#966E2E]">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
