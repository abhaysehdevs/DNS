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
import { decryptId } from '@/lib/url-crypto';

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#966E2E]/20 border-t-[#966E2E] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#966E2E]">Confirming Order</span>
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const rawRef = searchParams.get('ref') || searchParams.get('id');
    const id = decryptId(rawRef);
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
            <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#966E2E]/20 border-t-[#966E2E] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#966E2E]">Confirming Order</span>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] flex flex-col items-center justify-center p-6">
                <h1 className="text-3xl font-black text-red-600 uppercase tracking-tighter mb-8">Order Not Found</h1>
                <Link href="/">
                    <Button className="h-14 px-12 bg-white hover:bg-[#F3EFE6] text-[#18181B] font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] border border-[#E8E2D5]">Back to Home</Button>
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
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] pt-2 sm:pt-4 md:pt-6 pb-20 selection:bg-[#966E2E]/20 overflow-x-hidden">
            <div className="container mx-auto px-6 max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="bg-white rounded-[3rem] p-8 md:p-16 border border-[#E8E2D5] shadow-xl relative overflow-hidden"
                >
                    <div className="text-center mb-16">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
                            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-md relative ${
                                isEmail 
                                    ? 'bg-[#966E2E] text-white shadow-amber-900/10' 
                                    : 'bg-emerald-600 text-white shadow-emerald-900/10'
                            }`}
                        >
                            <div className="absolute inset-0 rounded-full animate-ping opacity-20 duration-[3000ms]" />
                            {isEmail ? <Mail size={40} className="text-white" /> : <MessageCircle size={44} className="text-white" />}
                        </motion.div>
                        
                        <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.3em] mb-6 ${
                            isEmail
                                ? 'bg-[#966E2E]/10 border-[#966E2E]/20 text-[#966E2E]'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                            <Sparkles size={12} /> {isEmail ? 'Email Order Placed' : 'WhatsApp Order Submitted'}
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight uppercase mb-6 leading-none text-[#18181B]">
                            Order <span className="text-[#966E2E]">Confirmed</span>
                        </h1>
                        
                        <p className="text-[#52525B] font-black uppercase text-[10px] tracking-[0.2em] mb-6">
                            Order Reference: <span className="text-[#966E2E] bg-[#966E2E]/10 px-3 py-1 rounded-full ml-2 border border-[#966E2E]/20">{order.id}</span>
                        </p>

                        {/* Channel Action Banner */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`max-w-2xl mx-auto p-6 md:p-8 bg-[#FAF9F5] border rounded-3xl text-left flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm ${
                                isEmail ? 'border-[#966E2E]/30' : 'border-emerald-500/30'
                            }`}
                        >
                            <div className="space-y-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-black uppercase tracking-wider text-[#18181B]">
                                    {isEmail ? <Mail size={16} className="text-[#966E2E]" /> : <MessageCircle size={16} className="text-emerald-700" />}
                                    <span>{isEmail ? 'Official Email: info@dinanathandsons.com' : `Official WhatsApp: ${WHATSAPP_DISPLAY_PHONE}`}</span>
                                </div>
                                <p className="text-[#52525B] text-xs">
                                    {isEmail 
                                        ? 'Your order manifest has been transmitted to our sales and accounts desk. We will send an invoice confirmation shortly.'
                                        : 'If WhatsApp did not open automatically, click the button below to send your order directly to our sales desk.'
                                    }
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                                {whatsappUrl && (
                                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                        <Button className="w-full h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2">
                                            <MessageCircle size={16} /> WhatsApp <ExternalLink size={12} />
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-[#FAF9F5] p-8 rounded-[2rem] border border-[#E8E2D5]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#71717A] mb-6 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#966E2E]" /> Shipping To
                            </h3>
                            <p className="text-sm font-black uppercase tracking-tight text-[#18181B] mb-2">{order.customer_name}</p>
                            <p className="text-xs text-[#52525B] leading-relaxed mb-4 font-medium uppercase tracking-wider">{order.shipping_address}</p>
                            <p className="text-[10px] font-black text-[#966E2E] tracking-[0.1em]">PH: {order.customer_phone}</p>
                        </div>
                        <div className="bg-[#FAF9F5] p-8 rounded-[2rem] border border-[#E8E2D5]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#71717A] mb-6 flex items-center gap-3">
                                <div className={`w-1.5 h-1.5 rounded-full ${isEmail ? 'bg-[#966E2E]' : 'bg-emerald-600'}`} /> Channel
                            </h3>
                            <p className="text-sm font-black uppercase tracking-tight text-[#18181B] mb-4">
                                {isEmail ? 'Email Processing (info@dinanathandsons.com)' : `WhatsApp Dispatch (${WHATSAPP_DISPLAY_PHONE})`}
                            </p>
                            <div className="inline-flex items-center gap-3 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                                <span className="text-emerald-800 uppercase font-black text-[9px] tracking-[0.2em]">Confirmed in Queue</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#FAF9F5] rounded-[2.5rem] p-8 md:p-12 border border-[#E8E2D5] mb-12 shadow-sm">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-4 text-[#18181B]">
                            <Package size={22} className="text-[#966E2E]" /> Items Ordered ({order.order_items?.length || 0})
                        </h3>
                        <div className="space-y-6">
                            {order.order_items?.map((item: any, idx: number) => (
                                <div key={item.id || idx} className="flex justify-between items-center group border-b border-[#E8E2D5] pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <div className="text-base font-black text-[#18181B] group-hover:text-[#966E2E] transition-colors uppercase tracking-tight">{item.product_name}</div>
                                        <div className="text-[10px] font-bold text-[#71717A] mt-1.5 uppercase tracking-widest flex items-center gap-3">
                                            Quantity: <span className="text-[#18181B]">{item.quantity}</span> 
                                            {item.variant_name && <span className="bg-white px-3 py-0.5 rounded-full text-[#52525B] border border-[#E8E2D5]">{item.variant_name}</span>}
                                        </div>
                                    </div>
                                    <div className="text-lg font-black text-[#18181B] tabular-nums"><Currency value={((item.price || 0) * (item.quantity || 1))} /></div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-8 mt-8 border-t border-[#E8E2D5] flex justify-between items-end">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#71717A] block mb-2">Grand Total</span>
                            </div>
                            <span className="text-4xl font-black text-[#966E2E] tabular-nums leading-none"><Currency value={(order.total_amount || 0)} /></span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="/" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto h-16 px-10 bg-white hover:bg-[#F3EFE6] text-[#18181B] font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all border border-[#E8E2D5] shadow-sm">
                                <Home size={18} className="mr-3 opacity-50" /> Back to Home
                            </Button>
                        </Link>
                        <Link href="/shop" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto h-16 px-10 bg-[#966E2E] hover:bg-[#7D5A25] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg hover:-translate-y-0.5">
                                Shop More <ArrowRight size={18} className="ml-3" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
