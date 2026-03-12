'use client';

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOrder() {
            if (!id) return;
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('id', id)
                .single();

            if (data) {
                setOrder(data);
            }
            setLoading(false);
        }
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={48} />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Order Not Found</h1>
                <Link href="/">
                    <Button>Return Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020202] text-white pt-24 md:pt-32 pb-24 overflow-hidden relative">
            {/* Elegant Background Accents */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-green-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 max-w-3xl relative z-10">
                <div className="bg-gray-900/40 border border-gray-800/60 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                    <div className="text-center mb-10">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.15)] relative">
                            <div className="absolute inset-0 rounded-full animate-ping bg-green-500/20 duration-1000" />
                            <CheckCircle size={48} className="text-green-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Order <span className="text-green-400">Confirmed!</span></h1>
                        <p className="text-gray-400 text-lg">Thank you for your purchase. Your order ID is <span className="font-mono text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">{order.id.slice(0, 18)}...</span></p>
                    </div>

                    <div className="bg-black/40 border border-gray-800/50 rounded-2xl p-6 mb-8">
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-6 pb-4 border-b border-gray-800/50">
                            <Package size={22} className="text-amber-500" /> Order Details
                        </h2>
                        <div className="space-y-5">
                            {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center text-sm md:text-base group">
                                    <div>
                                        <div className="font-medium text-white group-hover:text-amber-400 transition-colors">{item.product_name}</div>
                                        <div className="text-gray-500 mt-0.5">Qty: <span className="text-gray-300 font-medium">{item.quantity}</span> {item.variant_name && <span className="bg-gray-800 px-2 py-0.5 rounded ml-2 text-xs">{item.variant_name}</span>}</div>
                                    </div>
                                    <div className="text-gray-300 font-medium">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 mt-6 border-t border-gray-800/50 flex justify-between items-end">
                            <div>
                                <span className="text-base font-medium text-gray-400 block">Total Amount</span>
                                <span className="text-xs text-gray-600 block">Including taxes</span>
                            </div>
                            <span className="text-2xl font-bold text-amber-500">₹{(order.total_amount || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        <div className="bg-black/30 border border-gray-800/40 p-5 rounded-2xl">
                            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Shipping To</h3>
                            <p className="text-white font-medium mb-1">{order.customer_name}</p>
                            <p className="text-gray-400 text-sm mb-2 leading-relaxed">{order.shipping_address}</p>
                            <p className="text-gray-400 text-sm">Ph: <span className="text-gray-300">{order.customer_phone}</span></p>
                        </div>
                        <div className="bg-black/30 border border-gray-800/40 p-5 rounded-2xl">
                            <h3 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Payment Info</h3>
                            <p className="text-white font-medium capitalize mb-2">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</p>
                            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-amber-500 uppercase font-bold text-xs tracking-wider">{order.status}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 border-t border-gray-800/50">
                        <Link href="/" className="w-full sm:w-auto">
                            <Button className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-all rounded-xl">
                                <Home size={18} className="mr-2 opacity-70" /> Return Home
                            </Button>
                        </Link>
                        <Link href="/shop" className="w-full sm:w-auto">
                            <Button className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-black font-bold transition-all rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.2)]">
                                Continue Shopping <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    );
}
