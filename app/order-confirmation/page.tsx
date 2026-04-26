'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
    CheckCircle, 
    Sparkles, 
    Package, 
    Truck, 
    Zap, 
    ShieldCheck, 
    Home, 
    ArrowRight 
} from 'lucide-react';
import { Currency } from '@/components/currency';

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/10 border-t-[#C9A84C] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">Confirming Order</span>
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            if (!id) return;
            try {
                const { data } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('id', id)
                    .single();

                if (data) {
                    setOrder(data);
                    setLoading(false);
                    return;
                }
            } catch (err) {}

            const localData = localStorage.getItem(`order_${id}`);
            if (localData) setOrder(JSON.parse(localData));
            setLoading(false);
        }
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/10 border-t-[#C9A84C] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">Confirming Order</span>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center noise-overlay">
                <h1 className="text-3xl font-black text-red-600 uppercase tracking-tighter mb-8">Order Not Found</h1>
                <Link href="/">
                    <Button className="h-14 px-12 glass text-[#1D1D1F] font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] border border-black/[0.04]">Back to Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFFFF] text-[#1D1D1F] pt-32 md:pt-48 pb-24 noise-overlay selection:bg-[#C9A84C]/30 overflow-x-hidden">
            
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="glass-strong rounded-[3rem] p-8 md:p-16 border border-black/[0.04] shadow-2xl relative overflow-hidden bg-white"
                >
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="text-center mb-16">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                            className="w-24 h-24 glass-gold rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl relative"
                            style={{ background: 'linear-gradient(135deg, #E8D48B, #C9A84C)' }}
                        >
                            <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/20 duration-[3000ms]" />
                            <CheckCircle size={48} className="text-[#0A0A0F]" />
                        </motion.div>
                        
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-gold text-[#C9A84C] text-[9px] font-black uppercase tracking-[0.3em] mb-6">
                            <Sparkles size={12} /> Order Successful
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase mb-6 leading-none text-[#1D1D1F]">
                            Order <span style={{ background: 'linear-gradient(135deg, #10B981, #059669)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Placed</span>
                        </h1>
                        
                        <p className="text-[#86868B] font-black uppercase text-[10px] tracking-[0.2em]">
                            Order Number: <span className="text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 rounded-full ml-2">{order.id.slice(0, 24)}</span>
                        </p>
                    </div>

                    <div className="mb-20 pt-12 border-t border-black/[0.04] relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F5F5F7] border border-black/[0.04] px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-[#86868B]">Delivery Status</div>
                        
                        <div className="relative flex justify-between items-center max-w-2xl mx-auto px-4 py-10">
                            <div className="absolute top-[40%] left-0 right-0 h-[2px] bg-black/[0.04] -translate-y-1/2 z-0 px-10">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '33%' }}
                                    transition={{ duration: 1.5, delay: 0.8 }}
                                    className="h-full bg-gradient-to-r from-emerald-500 to-[#C9A84C]"
                                />
                            </div>
                            
                            {[
                                { label: 'Processing', icon: Package, active: true, completed: true },
                                { label: 'Shipped', icon: Truck, active: true, completed: false },
                                { label: 'In Transit', icon: Zap, active: false, completed: false },
                                { label: 'Delivered', icon: ShieldCheck, active: false, completed: false },
                            ].map((step, idx) => (
                                <div key={idx} className="relative z-10 flex flex-col items-center gap-4">
                                    <motion.div 
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 1 + idx * 0.1 }}
                                        className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${step.completed ? 'bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0F] shadow-lg' : step.active ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-[#F5F5F7] border-black/[0.04] text-[#86868B]'}`}
                                    >
                                        <step.icon size={step.active ? 24 : 20} />
                                    </motion.div>
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${step.active ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>{step.label}</span>
                                </div>
                            ))}
                        </div>

                        {order?.shiprocket && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5 }}
                                className="max-w-3xl mx-auto mt-6 bg-[#F5F5F7] p-8 rounded-[2rem] border border-emerald-500/10 shadow-sm"
                            >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                    {[
                                        { label: "Courier", value: order.shiprocket.courier_name },
                                        { label: "Tracking Number", value: order.shiprocket.awb_code, mono: true },
                                        { label: "Reference ID", value: order.shiprocket.shiprocket_order_id, mono: true },
                                        { label: "Est. Delivery", value: order.shiprocket.estimated_delivery, highlight: true }
                                    ].map((stat, i) => (
                                        <div key={i}>
                                            <p className="text-[9px] font-black text-[#86868B] uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                            <p className={`text-xs font-black uppercase tracking-tight ${stat.highlight ? 'text-emerald-600' : 'text-[#1D1D1F]'} ${stat.mono ? 'font-mono' : ''}`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="bg-[#F5F5F7] p-8 rounded-[2rem] border border-black/[0.04]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" /> Shipping To
                            </h3>
                            <p className="text-sm font-black uppercase tracking-tight text-[#1D1D1F] mb-2">{order.customer_name}</p>
                            <p className="text-xs text-[#6E6E73] leading-relaxed mb-4 font-medium uppercase tracking-wider">{order.shipping_address}</p>
                            <p className="text-[10px] font-black text-[#C9A84C] tracking-[0.1em]">PH: {order.customer_phone}</p>
                        </div>
                        <div className="bg-[#F5F5F7] p-8 rounded-[2rem] border border-black/[0.04]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Payment Details
                            </h3>
                            <p className="text-sm font-black uppercase tracking-tight text-[#1D1D1F] mb-4">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</p>
                            <div className="inline-flex items-center gap-3 bg-[#C9A84C]/10 px-4 py-2 rounded-xl">
                                <div className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse" />
                                <span className="text-[#C9A84C] uppercase font-black text-[9px] tracking-[0.2em]">{order.status}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-black/[0.04] mb-16 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-10 flex items-center gap-4 text-[#1D1D1F]">
                            <Package size={22} className="text-[#C9A84C]" /> Items Ordered
                        </h3>
                        <div className="space-y-8">
                            {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center group">
                                    <div>
                                        <div className="text-base font-black text-[#1D1D1F] group-hover:text-[#C9A84C] transition-colors uppercase tracking-tight">{item.product_name}</div>
                                        <div className="text-[10px] font-black text-[#86868B] mt-2 uppercase tracking-widest flex items-center gap-3">
                                            Quantity: <span className="text-[#1D1D1F]">{item.quantity}</span> 
                                            {item.variant_name && <span className="bg-[#F5F5F7] px-3 py-0.5 rounded-full text-[#86868B] border border-black/[0.04]">{item.variant_name}</span>}
                                        </div>
                                    </div>
                                    <div className="text-lg font-black text-[#1D1D1F] tabular-nums"><Currency value={((item.price || 0) * (item.quantity || 1))} /></div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-10 mt-10 border-t border-black/[0.04] flex justify-between items-end">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] block mb-2">Grand Total</span>
                            </div>
                            <span className="text-4xl font-black text-[#C9A84C] tabular-nums leading-none"><Currency value={(order.total_amount || 0)} /></span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="/" className="w-full sm:w-auto">
                            <Button className="w-full h-16 px-10 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all border border-black/[0.04]">
                                <Home size={18} className="mr-3 opacity-50" /> Back to Home
                            </Button>
                        </Link>
                        <Link href="/shop" className="w-full sm:w-auto">
                            <Button className="w-full h-16 px-10 text-[#0A0A0F] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #E8D48B, #C9A84C)' }}>
                                Shop More <ArrowRight size={18} className="ml-3" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
