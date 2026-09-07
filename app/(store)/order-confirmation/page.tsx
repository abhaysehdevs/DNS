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
    ArrowRight,
    MessageCircle,
    Mail,
    ExternalLink
} from 'lucide-react';
import { Currency } from '@/components/currency';
import { WHATSAPP_DISPLAY_PHONE, getWhatsAppOrderUrl, WhatsAppOrderData } from '@/lib/whatsapp-order';

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#151515] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
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
    const channelParam = searchParams.get('channel');
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
            <div className="min-h-screen bg-[#151515] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">Confirming Order</span>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#151515] text-[#F8F3E8] flex flex-col items-center justify-center noise-overlay p-6">
                <h1 className="text-3xl font-black text-red-500 uppercase tracking-tighter mb-8">Order Not Found</h1>
                <Link href="/">
                    <Button className="h-14 px-12 bg-[#1E1E1E] hover:bg-[#242424] text-[#F8F3E8] font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] border border-white/5">Back to Home</Button>
                </Link>
            </div>
        );
    }

    const isEmail = channelParam === 'email' || order.payment_method === 'email';

    // Prepare WhatsApp URL if not already stored
    let whatsappUrl = order.whatsapp_url;
    if (!whatsappUrl && order.order_items) {
        const orderData: WhatsAppOrderData = {
            orderId: order.id,
            mode: order.type || 'retail',
            customer: {
                name: order.customer_name || 'Customer',
                phone: order.customer_phone || '',
                email: order.customer_email || '',
                address: order.shipping_address || '',
                pincode: 'N/A'
            },
            items: order.order_items.map((item: any) => ({
                productId: item.product_id || '',
                productName: item.product_name || 'Product',
                variantName: item.variant_name || undefined,
                quantity: item.quantity || 1,
                price: item.price || 0,
                productSlug: item.product_slug
            })),
            subtotal: order.total_amount || 0,
            shippingCost: 0,
            discountAmount: order.discount_amount || 0,
            couponCode: order.coupon_code || undefined,
            totalAmount: order.total_amount || 0
        };
        whatsappUrl = getWhatsAppOrderUrl(orderData);
    }

    return (
        <div className="min-h-screen bg-[#151515] text-[#F8F3E8] pt-32 md:pt-48 pb-24 noise-overlay selection:bg-[#C9A84C]/30 overflow-x-hidden">
            
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="bg-[#1E1E1E] rounded-[3rem] p-8 md:p-16 border border-white/5 shadow-2xl relative overflow-hidden"
                >
                    <div className="text-center mb-16">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl relative ${
                                isEmail 
                                    ? 'bg-gradient-to-r from-[#E8D48B] to-[#C9A84C] text-[#0A0A0F] shadow-amber-500/20' 
                                    : 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-emerald-500/20'
                            }`}
                        >
                            <div className="absolute inset-0 rounded-full animate-ping opacity-20 duration-[3000ms]" />
                            {isEmail ? <Mail size={40} className="text-[#0A0A0F]" /> : <MessageCircle size={44} className="text-white" />}
                        </motion.div>
                        
                        <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.3em] mb-6 ${
                            isEmail
                                ? 'bg-[#C9A84C]/10 border-[#C9A84C]/20 text-[#C9A84C]'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                            <Sparkles size={12} /> {isEmail ? 'Email Order Placed' : 'WhatsApp Order Submitted'}
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase mb-6 leading-none text-[#F8F3E8]">
                            Order <span className="bg-gradient-to-r from-[#F8F3E8] via-[#E8D48B] to-[#C9A84C] bg-clip-text text-transparent">Confirmed</span>
                        </h1>
                        
                        <p className="text-[#86868B] font-black uppercase text-[10px] tracking-[0.2em] mb-6">
                            Order Reference: <span className="text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 rounded-full ml-2 border border-[#C9A84C]/20">{order.id}</span>
                        </p>

                        {/* Channel Action Banner */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`max-w-2xl mx-auto p-6 md:p-8 bg-[#151515] border rounded-3xl text-left flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl ${
                                isEmail ? 'border-[#C9A84C]/30' : 'border-emerald-500/30'
                            }`}
                        >
                            <div className="space-y-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-black uppercase tracking-wider text-[#F8F3E8]">
                                    {isEmail ? <Mail size={16} className="text-[#C9A84C]" /> : <MessageCircle size={16} className="text-emerald-400" />}
                                    <span>{isEmail ? 'Official Email: info@dinanathandsons.com' : `Official WhatsApp: ${WHATSAPP_DISPLAY_PHONE}`}</span>
                                </div>
                                <p className="text-[#86868B] text-xs">
                                    {isEmail 
                                        ? 'Your order manifest has been transmitted to our sales and accounts desk. We will send an invoice confirmation shortly.'
                                        : 'If WhatsApp did not open automatically, click the button below to send your order directly to our sales desk.'
                                    }
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                                {whatsappUrl && (
                                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                        <Button className="w-full h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2">
                                            <MessageCircle size={16} /> WhatsApp <ExternalLink size={12} />
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-[#151515] p-8 rounded-[2rem] border border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]" /> Shipping To
                            </h3>
                            <p className="text-sm font-black uppercase tracking-tight text-[#F8F3E8] mb-2">{order.customer_name}</p>
                            <p className="text-xs text-[#86868B] leading-relaxed mb-4 font-medium uppercase tracking-wider">{order.shipping_address}</p>
                            <p className="text-[10px] font-black text-[#C9A84C] tracking-[0.1em]">PH: {order.customer_phone}</p>
                        </div>
                        <div className="bg-[#151515] p-8 rounded-[2rem] border border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] mb-6 flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${isEmail ? 'bg-[#C9A84C]' : 'bg-emerald-500'}`} /> Channel
                            </h3>
                            <p className="text-sm font-black uppercase tracking-tight text-[#F8F3E8] mb-4">
                                {isEmail ? 'Email Processing (info@dinanathandsons.com)' : `WhatsApp Dispatch (${WHATSAPP_DISPLAY_PHONE})`}
                            </p>
                            <div className="inline-flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[#F8F3E8] uppercase font-black text-[9px] tracking-[0.2em]">Confirmed in Queue</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#151515] rounded-[2.5rem] p-8 md:p-12 border border-white/5 mb-12 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-4 text-[#F8F3E8]">
                            <Package size={22} className="text-[#C9A84C]" /> Items Ordered ({order.order_items?.length || 0})
                        </h3>
                        <div className="space-y-6">
                            {order.order_items?.map((item: any, idx: number) => (
                                <div key={item.id || idx} className="flex justify-between items-center group border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <div className="text-base font-black text-[#F8F3E8] group-hover:text-[#C9A84C] transition-colors uppercase tracking-tight">{item.product_name}</div>
                                        <div className="text-[10px] font-bold text-[#86868B] mt-1.5 uppercase tracking-widest flex items-center gap-3">
                                            Quantity: <span className="text-[#F8F3E8]">{item.quantity}</span> 
                                            {item.variant_name && <span className="bg-[#1E1E1E] px-3 py-0.5 rounded-full text-[#86868B] border border-white/5">{item.variant_name}</span>}
                                        </div>
                                    </div>
                                    <div className="text-lg font-black text-[#F8F3E8] tabular-nums"><Currency value={((item.price || 0) * (item.quantity || 1))} /></div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-8 mt-8 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] block mb-2">Grand Total</span>
                            </div>
                            <span className="text-4xl font-black text-[#C9A84C] tabular-nums leading-none"><Currency value={(order.total_amount || 0)} /></span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="/" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto h-16 px-10 bg-[#151515] hover:bg-[#242424] text-[#F8F3E8] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all border border-white/10">
                                <Home size={18} className="mr-3 opacity-50" /> Back to Home
                            </Button>
                        </Link>
                        <Link href="/shop" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto h-16 px-10 bg-gradient-to-r from-[#E8D48B] to-[#C9A84C] text-[#0A0A0F] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl hover:-translate-y-1">
                                Shop More <ArrowRight size={18} className="ml-3" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
