'use client';

import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/translations';
import { getDeliveryOptions } from '@/lib/delivery';
import { Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Trash2, Truck, ArrowRight, ShoppingBag, Loader2, Minus, Plus, CheckCircle, ShieldCheck, Tag, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Currency } from '@/components/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { generateShiprocketDetails } from '@/lib/shiprocket';
import { getWhatsAppOrderUrl, WHATSAPP_DISPLAY_PHONE, WhatsAppOrderData } from '@/lib/whatsapp-order';

export default function CartPage() {
    const { cart, mode, language, removeFromCart, clearCart, updateQuantity, user } = useAppStore();
    const t = translations[language];
    const router = useRouter();

    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState<any>(null);
    const [step, setStep] = useState<'cart' | 'details'>('cart');

    const [formData, setFormData] = useState({ name: '', email: '', address: '', phone: '', notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email
            }));
        }
    }, [user]);

    const [cartProducts, setCartProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCartProducts() {
            setLoading(true);
            if (cart.length === 0) {
                setCartProducts([]);
                setLoading(false);
                return;
            }

            const ids = Array.from(new Set(cart.map(item => item.productId)));
            try {
                const { data } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', ids);

                if (data && data.length > 0) {
                    const mappedProducts: Product[] = data.map((p: any) => {
                        const image = p.image || p.image_url || '/placeholder.jpg';
                        return {
                            id: p.id,
                            name: p.name,
                            description: p.description,
                            retailPrice: p.retail_price,
                            wholesalePrice: p.wholesale_price,
                            wholesaleMOQ: p.wholesale_moq,
                            primaryImage: image,
                            image: image,
                            gallery: (p.gallery && p.gallery.length > 0) ? p.gallery : [{ id: '1', type: 'image', url: image }],
                            category: p.category,
                            inStock: p.in_stock,
                            reviews: p.reviews || [],
                            variants: p.variants || [],
                            slug: p.slug
                        };
                    });
                    setCartProducts(mappedProducts);
                } else {
                    // Try local fallback
                    import('@/lib/data').then((module) => {
                        const localMatches = module.products.filter(p => ids.includes(p.id));
                        setCartProducts(localMatches);
                    });
                }
            } catch (err) {
                console.error("Cart products query failed, loading fallbacks", err);
                import('@/lib/data').then((module) => {
                    const localMatches = module.products.filter(p => ids.includes(p.id));
                    setCartProducts(localMatches);
                });
            } finally {
                setLoading(false);
            }
        }
        fetchCartProducts();
    }, [cart.length, cart]);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = deliveryStatus ? (deliveryStatus.shippingCost || 0) : 0;
    
    const discountAmount = appliedCoupon ? (
        appliedCoupon.discount_type === 'percentage' 
            ? (total * appliedCoupon.discount_value / 100)
            : appliedCoupon.discount_value
    ) : 0;

    const finalTotal = total + shippingCost - discountAmount;

    const handleApplyCoupon = async () => {
        setCouponError('');
        if (!couponCode) return;

        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase())
            .eq('active', true)
            .single();

        if (error || !data) {
            setCouponError('INVALID CODE');
            return;
        }

        if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
            setCouponError('CODE EXPIRED');
            return;
        }

        if (data.usage_limit && data.usage_count >= data.usage_limit) {
            setCouponError('LIMIT REACHED');
            return;
        }

        if (total < data.min_order_amount) {
            setCouponError(`MIN ₹${data.min_order_amount} REQ.`);
            return;
        }

        setAppliedCoupon(data);
        setCouponCode('');
    };

    const checkDelivery = () => {
        const result = getDeliveryOptions(pincode);
        setDeliveryStatus(result);
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const orderId = 'ORD-' + Math.floor(10000000 + Math.random() * 90000000);
        const isBulk = mode === 'wholesale';
        const shiprocketData = generateShiprocketDetails(pincode, isBulk);

        const orderItemsPayload = cart.map(item => {
            const product = cartProducts.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                productName: product?.name || 'Unknown Product',
                variantName: item.variantName || undefined,
                quantity: item.quantity,
                price: item.price,
                productSlug: product?.slug,
                image: product?.primaryImage || product?.image
            };
        });

        const whatsappOrderData: WhatsAppOrderData = {
            orderId,
            date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            mode,
            customer: {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                pincode: pincode || 'N/A',
                notes: formData.notes
            },
            items: orderItemsPayload,
            subtotal: total,
            shippingCost,
            discountAmount,
            couponCode: appliedCoupon?.code,
            totalAmount: finalTotal
        };

        const whatsappUrl = getWhatsAppOrderUrl(whatsappOrderData);

        try {
            await supabase.from('orders').insert({
                id: orderId,
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: `${formData.address}${pincode ? ` (Pincode: ${pincode})` : ''}`,
                total_amount: finalTotal,
                discount_amount: discountAmount,
                coupon_code: appliedCoupon?.code || null,
                status: 'pending',
                payment_status: 'pending',
                payment_method: 'whatsapp',
                type: mode
            });

            const dbOrderItems = cart.map(item => {
                const product = cartProducts.find(p => p.id === item.productId);
                return {
                    order_id: orderId,
                    product_id: item.productId,
                    product_name: product?.name || 'Unknown Product',
                    variant_name: item.variantName || null,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                };
            });
            await supabase.from('order_items').insert(dbOrderItems);

            if (appliedCoupon) {
                await supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id });
            }
            
            // Trigger Email Notification in background
            fetch('/api/notifications/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'order',
                    orderId: orderId,
                    customerName: formData.name,
                    customerEmail: formData.email,
                    customerPhone: formData.phone,
                    shippingAddress: `${formData.address} (Pincode: ${pincode})`,
                    totalAmount: finalTotal,
                    paymentMethod: 'whatsapp',
                    items: cart.map(item => ({
                        product_name: cartProducts.find(p => p.id === item.productId)?.name || 'Unknown Product',
                        variant_name: item.variantName || null,
                        quantity: item.quantity,
                        price: item.price
                    }))
                })
            }).catch(e => console.error('Notification error', e));
        } catch (error) {
            console.error('Checkout error:', error);
        }

        // Save order data locally for confirmation page and re-sending
        localStorage.setItem(`order_${orderId}`, JSON.stringify({
            id: orderId,
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_email: formData.email,
            shipping_address: `${formData.address}${pincode ? ` (Pincode: ${pincode})` : ''}`,
            total_amount: finalTotal,
            discount_amount: discountAmount,
            coupon_code: appliedCoupon?.code || null,
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'whatsapp',
            shiprocket: shiprocketData,
            whatsapp_url: whatsappUrl,
            order_items: cart.map(item => {
                const product = cartProducts.find(p => p.id === item.productId);
                return {
                    product_id: item.productId,
                    product_name: product?.name || 'Unknown Product',
                    variant_name: item.variantName || null,
                    quantity: item.quantity,
                    price: item.price,
                    product_slug: product?.slug,
                    image: product?.primaryImage || product?.image
                };
            })
        }));

        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');

        clearCart();
        router.push(`/order-confirmation?id=${orderId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#151515] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/20 border-t-[#C9A84C] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">Loading Items</span>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#151515] text-[#F8F3E8] flex flex-col items-center justify-center p-6 noise-overlay">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    <div className="w-24 h-24 bg-[#1E1E1E] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <ShoppingBag size={40} className="text-[#86868B]" />
                    </div>
                    <h1 className="text-4xl font-black mb-4 uppercase tracking-tight text-[#F8F3E8]">Your Cart is <span className="text-[#C9A84C]">Empty</span></h1>
                    <p className="text-[#86868B] mb-10 max-w-md mx-auto font-medium text-sm">Add some premium tools and hardware to your cart to continue.</p>
                    <Link href="/shop">
                        <Button className="h-14 px-12 bg-gradient-to-r from-[#E8D48B] to-[#C9A84C] text-[#0A0A0F] font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all hover:-translate-y-1">
                            Explore Products
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#151515] text-[#F8F3E8] pt-40 md:pt-60 pb-24 noise-overlay selection:bg-[#C9A84C]/30 overflow-x-hidden">
            
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
                    <div>
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
                            <ShieldCheck size={14} /> Direct WhatsApp Ordering
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9]">
                            Order <span className="bg-gradient-to-r from-[#F8F3E8] via-[#E8D48B] to-[#C9A84C] bg-clip-text text-transparent">Review</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className={`flex flex-col items-center gap-3 transition-all ${step === 'cart' ? 'text-[#C9A84C]' : 'text-[#86868B]'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step === 'cart' ? 'bg-gradient-to-r from-[#E8D48B] to-[#C9A84C] text-[#0A0A0F]' : 'bg-[#1E1E1E] border border-white/5'}`}>01</div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cart</span>
                        </div>
                        <div className="w-12 h-px bg-white/10" />
                        <div className={`flex flex-col items-center gap-3 transition-all ${step === 'details' ? 'text-emerald-400' : 'text-[#86868B]'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step === 'details' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-[#1E1E1E] border border-white/5'}`}>02</div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">WhatsApp Order</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                    
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {step === 'cart' ? (
                                <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    {cart.map((item) => {
                                        const product = cartProducts.find(p => p.id === item.productId);
                                        if (!product) return null;
                                        const displayImage = product.primaryImage || '/placeholder.jpg';

                                        return (
                                            <motion.div 
                                                layout
                                                key={`${item.productId}-${item.variantId}`} 
                                                className="bg-[#1E1E1E] rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row gap-8 relative border border-white/5 hover:border-[#C9A84C]/30 hover:shadow-2xl transition-all group overflow-hidden"
                                            >
                                                <div className="w-full md:w-48 h-48 bg-[#151515] rounded-2xl overflow-hidden shrink-0 relative p-4 flex items-center justify-center border border-white/5">
                                                    <img src={displayImage} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                                                </div>

                                                <div className="flex-1 flex flex-col justify-center">
                                                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-6">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 rounded-full">{product.category}</span>
                                                                {product.inStock && <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> In Stock</span>}
                                                            </div>
                                                            <h3 className="text-xl md:text-2xl font-black text-[#F8F3E8] uppercase tracking-tight group-hover:text-[#C9A84C] transition-colors">{product.name}</h3>
                                                            {item.variantName && <p className="text-[10px] font-bold text-[#86868B] mt-2 uppercase tracking-widest">Variant: <span className="text-[#F8F3E8]">{item.variantName}</span></p>}
                                                        </div>
                                                        <div className="text-left md:text-right">
                                                            <span className="text-2xl font-black text-[#F8F3E8] tabular-nums"><Currency value={item.price * item.quantity} /></span>
                                                            <p className="text-[10px] font-bold text-[#86868B] mt-1 uppercase tracking-widest">Unit: <Currency value={item.price} /></p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                        <div className="flex items-center bg-[#151515] rounded-xl h-10 p-1 border border-white/10">
                                                            <button onClick={() => updateQuantity(item.productId, item.variantId, item.mode, item.quantity - 1)} className="w-8 h-full flex items-center justify-center text-[#86868B] hover:text-[#F8F3E8] transition-all"><Minus size={14} /></button>
                                                            <div className="w-10 flex items-center justify-center text-xs font-black text-[#F8F3E8] tabular-nums">{item.quantity}</div>
                                                            <button onClick={() => updateQuantity(item.productId, item.variantId, item.mode, item.quantity + 1)} className="w-8 h-full flex items-center justify-center text-[#86868B] hover:text-[#F8F3E8] transition-all"><Plus size={14} /></button>
                                                        </div>
                                                        <button onClick={() => removeFromCart(item.productId, item.variantId)} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] hover:text-red-400 transition-all flex items-center gap-2">
                                                            <Trash2 size={14} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-[#1E1E1E] rounded-[3rem] p-8 md:p-14 border border-white/5 shadow-2xl">
                                    <div className="mb-10">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                <MessageCircle size={18} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Official WhatsApp Dispatch: {WHATSAPP_DISPLAY_PHONE}</span>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#F8F3E8] leading-none">
                                            Delivery & <span className="text-[#C9A84C]">Contact Details</span>
                                        </h2>
                                        <p className="text-[#86868B] text-xs font-medium mt-3 uppercase tracking-wider">
                                            Fill in your delivery address below. Your order will open directly on WhatsApp on {WHATSAPP_DISPLAY_PHONE} with product photos, canonical links, and quantities.
                                        </p>
                                    </div>

                                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Full Name *</label>
                                                <input required className="w-full h-16 bg-[#151515] border border-white/10 rounded-2xl px-6 text-[#F8F3E8] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-bold uppercase text-xs tracking-wider" placeholder="Your Name or Business" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">WhatsApp / Phone *</label>
                                                <input required className="w-full h-16 bg-[#151515] border border-white/10 rounded-2xl px-6 text-[#F8F3E8] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-bold uppercase text-xs tracking-wider" placeholder="+91 000 000 0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Email Address (Optional)</label>
                                                <input type="email" className="w-full h-16 bg-[#151515] border border-white/10 rounded-2xl px-6 text-[#F8F3E8] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-bold text-xs tracking-wider" placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">PIN Code</label>
                                                <input className="w-full h-16 bg-[#151515] border border-white/10 rounded-2xl px-6 text-[#F8F3E8] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-bold uppercase text-xs tracking-wider" placeholder="6-Digit PIN" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6} />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Shipping Address *</label>
                                            <textarea required rows={3} className="w-full bg-[#151515] border border-white/10 rounded-2xl p-6 text-[#F8F3E8] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-bold uppercase text-xs tracking-wider resize-none" placeholder="Shop/House No., Street, City, State" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                        </div>

                                        <div className="bg-[#151515] p-6 rounded-2xl border border-emerald-500/20 flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                <MessageCircle size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-1">How WhatsApp Ordering Works</h4>
                                                <p className="text-[11px] text-[#86868B] leading-relaxed">
                                                    Submitting this order directly opens WhatsApp with your pre-filled cart invoice, product links, and photos addressed to <strong className="text-[#F8F3E8]">{WHATSAPP_DISPLAY_PHONE}</strong>. Our team will verify dispatch stock and confirm payment/transportation mode instantly.
                                                </p>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="sticky top-40 space-y-6">
                            <div className="bg-[#1E1E1E] rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl">
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-8 leading-none text-[#F8F3E8]">Order <span className="text-[#C9A84C]">Summary</span></h3>

                                <div className="space-y-5 mb-8">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">
                                        <span>Subtotal</span>
                                        <span className="text-[#F8F3E8] tabular-nums font-black"><Currency value={total} /></span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">
                                         <span>Shipping</span>
                                         <span className={shippingCost === 0 ? 'text-emerald-400 font-black' : 'text-[#F8F3E8] tabular-nums font-black'}>
                                             {shippingCost === 0 ? 'FREE' : <Currency value={shippingCost} />}
                                         </span>
                                     </div>
                                     {appliedCoupon && (
                                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                             <div className="flex items-center gap-2">
                                                 <span>Discount ({appliedCoupon.code})</span>
                                                 <button onClick={() => setAppliedCoupon(null)} className="hover:text-red-400 transition-colors"><Trash2 size={12}/></button>
                                             </div>
                                             <span className="tabular-nums font-black">- <Currency value={discountAmount} /></span>
                                         </div>
                                     )}
                                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">
                                         <span>Taxes</span>
                                         <span className="text-[#F8F3E8] tabular-nums font-black">Included</span>
                                     </div>
                                 </div>

                                 <div className="pt-6 border-t border-white/10 mb-8">
                                     <div className="flex justify-between items-end">
                                         <div>
                                             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] block mb-2">Grand Total</span>
                                             <span className="text-3xl md:text-4xl font-black text-[#C9A84C] tabular-nums leading-none"><Currency value={finalTotal} /></span>
                                         </div>
                                     </div>
                                 </div>

                                 {step === 'cart' ? (
                                     <div className="space-y-6">
                                         <div className="space-y-3">
                                             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] ml-2">Have a Coupon?</label>
                                             <div className={`bg-[#151515] rounded-2xl h-14 flex items-center px-6 transition-all border ${couponError ? 'border-red-500' : 'border-white/10 focus-within:border-[#C9A84C]'}`}>
                                                 <Tag size={16} className="text-[#86868B] mr-4" />
                                                 <input 
                                                     value={couponCode} 
                                                     onChange={(e) => {
                                                         setCouponCode(e.target.value.toUpperCase());
                                                         setCouponError('');
                                                     }} 
                                                     placeholder="CODE" 
                                                     className="bg-transparent w-full outline-none text-[#F8F3E8] text-[10px] font-black uppercase tracking-[0.3em] placeholder-[#86868B]" 
                                                 />
                                                 <button onClick={handleApplyCoupon} className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#E8D48B] transition-colors ml-4">Apply</button>
                                             </div>
                                             {couponError && <p className="text-[10px] font-black text-red-400 uppercase tracking-widest ml-4">{couponError}</p>}
                                             {appliedCoupon && <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest ml-4 flex items-center gap-2"><CheckCircle size={10}/> Coupon Applied</p>}
                                         </div>

                                         <div className="h-px bg-white/10 my-6" />

                                         <div className="bg-[#151515] rounded-2xl h-14 flex items-center px-6 border border-white/10 focus-within:border-[#C9A84C] transition-all">
                                             <Truck size={16} className="text-[#86868B] mr-4" />
                                             <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="PINCODE" className="bg-transparent w-full outline-none text-[#F8F3E8] text-[10px] font-black uppercase tracking-[0.3em] placeholder-[#86868B]" maxLength={6} />
                                             <button onClick={checkDelivery} className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#E8D48B] transition-colors ml-4">Check</button>
                                         </div>
                                        {deliveryStatus && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }} 
                                                animate={{ opacity: 1, y: 0 }} 
                                                className={`p-5 rounded-2xl border transition-all ${
                                                    deliveryStatus.type === 'invalid' 
                                                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                                        : deliveryStatus.type === 'instant'
                                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                }`}
                                            >
                                                {deliveryStatus.type === 'invalid' ? (
                                                    <p className="text-[10px] font-black uppercase tracking-widest">{deliveryStatus.message}</p>
                                                ) : (
                                                    <>
                                                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                                            <Truck size={14} /> {deliveryStatus.label}
                                                        </h4>
                                                        <div className="space-y-1 text-[10px] font-bold uppercase tracking-wider opacity-85">
                                                            <p>Carrier: {deliveryStatus.provider}</p>
                                                            <p>Cost: ₹{deliveryStatus.shippingCost}</p>
                                                            <p>Est. Time: {deliveryStatus.estimatedTime}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </motion.div>
                                        )}
                                        <Button onClick={() => setStep('details')} className="w-full h-16 bg-gradient-to-r from-[#E8D48B] to-[#C9A84C] text-[#0A0A0F] font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:-translate-y-1 group">
                                            Continue to Order <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />
                                        </Button>
                                    </div>
                                 ) : (
                                     <div className="space-y-4">
                                         <Button type="submit" form="checkout-form" disabled={isSubmitting} className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-900/30 transition-all hover:-translate-y-1 flex items-center justify-center gap-3">
                                             {isSubmitting ? <Loader2 className="animate-spin" /> : (
                                                 <>
                                                     <MessageCircle size={20} />
                                                     <span>Place Order via WhatsApp</span>
                                                 </>
                                             )}
                                         </Button>
                                         <button onClick={() => setStep('cart')} className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] hover:text-[#F8F3E8] transition-all py-2">
                                             Back to Cart
                                         </button>
                                     </div>
                                 )}
                             </div>

                             <div className="bg-[#1E1E1E] p-8 rounded-[2rem] border border-white/5 shadow-lg">
                                 <div className="flex items-center gap-4 mb-4">
                                     <MessageCircle className="text-emerald-400" size={20} />
                                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F8F3E8]">WhatsApp Support: {WHATSAPP_DISPLAY_PHONE}</h4>
                                 </div>
                                 <p className="text-[10px] text-[#86868B] font-medium leading-relaxed uppercase tracking-widest">
                                     Need custom quotes or immediate bulk assistance? Chat with Dinanath & Sons sales support anytime.
                                 </p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

