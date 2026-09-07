'use client';

import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/translations';
import { getDeliveryOptions } from '@/lib/delivery';
import { Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { 
    Trash2, Truck, ArrowRight, ShoppingBag, Loader2, Minus, Plus, 
    CheckCircle, ShieldCheck, Tag, MessageCircle, Mail, MapPin, 
    FileText, Check, AlertCircle, Sparkles, Send
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Currency } from '@/components/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { generateShiprocketDetails } from '@/lib/shiprocket';
import { getWhatsAppOrderUrl, WHATSAPP_DISPLAY_PHONE, WhatsAppOrderData, SITE_URL } from '@/lib/whatsapp-order';
import { getProductUrl } from '@/lib/slug';

export default function CartPage() {
    const { cart, mode, language, removeFromCart, clearCart, updateQuantity, user } = useAppStore();
    const t = translations[language];
    const router = useRouter();

    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState<any>(null);
    const [step, setStep] = useState<'cart' | 'details'>('cart');
    const [orderMethod, setOrderMethod] = useState<'whatsapp' | 'email'>('whatsapp');

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
                    const { products } = await import('@/lib/data');
                    const localMatches = products.filter(p => ids.includes(p.id));
                    setCartProducts(localMatches);
                }
            } catch (err) {
                const { products } = await import('@/lib/data');
                const localMatches = products.filter(p => ids.includes(p.id));
                setCartProducts(localMatches);
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

    const finalTotal = Math.max(0, total + shippingCost - discountAmount);

    const handleApplyCoupon = async () => {
        setCouponError('');
        if (!couponCode.trim()) return;

        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.trim().toUpperCase())
                .eq('active', true)
                .single();

            if (error || !data) {
                setCouponError('Invalid coupon code');
                return;
            }

            if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
                setCouponError('This coupon code has expired');
                return;
            }

            if (data.usage_limit && data.usage_count >= data.usage_limit) {
                setCouponError('Coupon usage limit reached');
                return;
            }

            if (total < (data.min_order_amount || 0)) {
                setCouponError(`Min order of ₹${data.min_order_amount} required`);
                return;
            }

            setAppliedCoupon(data);
            setCouponCode('');
        } catch (e) {
            setCouponError('Unable to apply coupon at this time');
        }
    };

    const checkDelivery = () => {
        if (!pincode || pincode.trim().length < 6) return;
        const result = getDeliveryOptions(pincode.trim());
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
            const productSlug = product?.slug;
            const productUrl = `${SITE_URL}${getProductUrl({ id: item.productId, name: product?.name || 'Product', slug: productSlug })}`;
            return {
                productId: item.productId,
                productName: product?.name || 'Unknown Product',
                variantName: item.variantName || undefined,
                quantity: item.quantity,
                price: item.price,
                productSlug: productSlug,
                productUrl: productUrl,
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

        // Build Email plain text body for mailto fallback
        let emailManifest = `DINANATH & SONS ORDER MANIFEST\n`;
        emailManifest += `Order Reference: ${orderId}\n`;
        emailManifest += `Customer: ${formData.name}\n`;
        emailManifest += `Phone: ${formData.phone}\n`;
        emailManifest += `Email: ${formData.email || 'N/A'}\n`;
        emailManifest += `Shipping Address: ${formData.address} (PIN: ${pincode || 'N/A'})\n\n`;
        emailManifest += `ORDERED ITEMS:\n`;
        orderItemsPayload.forEach((it, i) => {
            emailManifest += `${i + 1}. ${it.productName} (Qty: ${it.quantity}) - ₹${(it.price * it.quantity).toLocaleString('en-IN')}\n`;
            emailManifest += `   Link: ${it.productUrl}\n`;
        });
        emailManifest += `\nSubtotal: ₹${total.toLocaleString('en-IN')}\n`;
        if (shippingCost > 0) emailManifest += `Delivery: ₹${shippingCost.toLocaleString('en-IN')}\n`;
        if (discountAmount > 0) emailManifest += `Discount: -₹${discountAmount.toLocaleString('en-IN')}\n`;
        emailManifest += `TOTAL: ₹${finalTotal.toLocaleString('en-IN')}\n`;
        if (formData.notes) emailManifest += `Special Instructions: ${formData.notes}\n`;

        const mailtoUrl = `mailto:info@dinanathandsons.com?subject=${encodeURIComponent(`New Order #${orderId} - ₹${finalTotal.toLocaleString('en-IN')}`)}&body=${encodeURIComponent(emailManifest)}`;

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
                payment_method: orderMethod,
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
                    shippingAddress: `${formData.address}${pincode ? ` (PIN: ${pincode})` : ''}`,
                    totalAmount: finalTotal,
                    paymentMethod: orderMethod,
                    items: orderItemsPayload.map(it => ({
                        product_name: it.productName,
                        variant_name: it.variantName || null,
                        quantity: it.quantity,
                        price: it.price,
                        product_url: it.productUrl
                    }))
                })
            }).catch(e => console.error('Notification error', e));
        } catch (error) {
            console.error('Checkout recording error:', error);
        }

        // Save order data locally
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
            payment_method: orderMethod,
            shiprocket: shiprocketData,
            whatsapp_url: whatsappUrl,
            mailto_url: mailtoUrl,
            order_items: orderItemsPayload
        }));

        if (orderMethod === 'whatsapp') {
            window.open(whatsappUrl, '_blank');
        } else {
            // For email method, also attempt mailto or proceed to confirmation
            window.location.href = mailtoUrl;
        }

        clearCart();
        router.push(`/order-confirmation?id=${orderId}&channel=${orderMethod}`);
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
                            <ShieldCheck size={14} /> Transparent Order Processing
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9]">
                            Order <span className="bg-gradient-to-r from-[#F8F3E8] via-[#E8D48B] to-[#C9A84C] bg-clip-text text-transparent">Review</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={() => setStep('cart')} className={`flex flex-col items-center gap-3 transition-all ${step === 'cart' ? 'text-[#C9A84C]' : 'text-[#86868B]'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step === 'cart' ? 'bg-gradient-to-r from-[#E8D48B] to-[#C9A84C] text-[#0A0A0F]' : 'bg-[#1E1E1E] border border-white/5'}`}>01</div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cart ({cart.length})</span>
                        </button>
                        <div className="w-12 h-px bg-white/10" />
                        <button onClick={() => setStep('details')} className={`flex flex-col items-center gap-3 transition-all ${step === 'details' ? 'text-[#C9A84C]' : 'text-[#86868B]'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step === 'details' ? 'bg-gradient-to-r from-[#E8D48B] to-[#C9A84C] text-[#0A0A0F]' : 'bg-[#1E1E1E] border border-white/5'}`}>02</div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Checkout Mode</span>
                        </button>
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
                                    
                                    {/* 2 Order Options Selector */}
                                    <div className="mb-10">
                                        <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C9A84C] mb-3 flex items-center gap-2">
                                            <Sparkles size={13} /> Select Order Processing Method
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#F8F3E8] leading-none mb-6">
                                            Choose How to <span className="text-[#C9A84C]">Place Your Order</span>
                                        </h2>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                            {/* Option 1: WhatsApp */}
                                            <button
                                                type="button"
                                                onClick={() => setOrderMethod('whatsapp')}
                                                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                                                    orderMethod === 'whatsapp'
                                                        ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                                                        : 'bg-[#151515] border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                                        <MessageCircle size={22} />
                                                    </div>
                                                    {orderMethod === 'whatsapp' && (
                                                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                                                            <Check size={14} strokeWidth={3} />
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-sm uppercase tracking-wide text-[#F8F3E8] mb-1">1. Order via WhatsApp</h3>
                                                    <p className="text-[10px] text-[#86868B] uppercase tracking-wider font-semibold">
                                                        Instant dispatch on {WHATSAPP_DISPLAY_PHONE} with product links & details.
                                                    </p>
                                                </div>
                                            </button>

                                            {/* Option 2: Email */}
                                            <button
                                                type="button"
                                                onClick={() => setOrderMethod('email')}
                                                className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                                                    orderMethod === 'email'
                                                        ? 'bg-[#C9A84C]/10 border-[#C9A84C] shadow-[0_0_30px_rgba(201,168,76,0.15)]'
                                                        : 'bg-[#151515] border-white/10 hover:border-white/20'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center">
                                                        <Mail size={22} />
                                                    </div>
                                                    {orderMethod === 'email' && (
                                                        <span className="w-6 h-6 rounded-full bg-[#C9A84C] text-black flex items-center justify-center">
                                                            <Check size={14} strokeWidth={3} />
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-sm uppercase tracking-wide text-[#F8F3E8] mb-1">2. Order via Email</h3>
                                                    <p className="text-[10px] text-[#86868B] uppercase tracking-wider font-semibold">
                                                        Sends complete itemized invoice directly to info@dinanathandsons.com.
                                                    </p>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Customer & Address Form */}
                                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
                                        <div className="border-t border-white/10 pt-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C9A84C] mb-4">Customer & Shipping Information</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Full Name *</label>
                                                <input required className="w-full h-14 bg-[#151515] border border-white/10 rounded-2xl px-5 text-[#F8F3E8] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-bold uppercase text-xs tracking-wider" placeholder="Your Name or Business" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Phone / WhatsApp *</label>
                                                <input required className="w-full h-14 bg-[#151515] border border-white/10 rounded-2xl px-5 text-[#F8F3E8] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-bold uppercase text-xs tracking-wider" placeholder="+91 000 000 0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">{orderMethod === 'email' ? 'Email Address *' : 'Email Address (Optional)'}</label>
                                                <input type="email" required={orderMethod === 'email'} className="w-full h-14 bg-[#151515] border border-white/10 rounded-2xl px-5 text-[#F8F3E8] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-bold text-xs tracking-wider" placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Delivery PIN Code</label>
                                                <input className="w-full h-14 bg-[#151515] border border-white/10 rounded-2xl px-5 text-[#F8F3E8] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-bold uppercase text-xs tracking-wider" placeholder="6-Digit PIN" value={pincode} onChange={(e) => setPincode(e.target.value)} maxLength={6} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Shipping Address *</label>
                                            <textarea required rows={3} className="w-full bg-[#151515] border border-white/10 rounded-2xl p-5 text-[#F8F3E8] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-bold uppercase text-xs tracking-wider resize-none" placeholder="Shop / Workshop / House No., Street, City, State" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Order Notes / Custom Requirements</label>
                                            <input className="w-full h-14 bg-[#151515] border border-white/10 rounded-2xl px-5 text-[#F8F3E8] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-medium text-xs" placeholder="e.g., Specific courier preference or gst invoice request" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar Order Summary + Fixed Pincode & Coupon UI */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-40 space-y-6">
                            
                            {/* Summary Card */}
                            <div className="bg-[#1E1E1E] rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl">
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-8 leading-none text-[#F8F3E8]">Order <span className="text-[#C9A84C]">Summary</span></h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">
                                        <span>Subtotal ({cart.length} items)</span>
                                        <span className="text-[#F8F3E8] tabular-nums font-black"><Currency value={total} /></span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">
                                         <span>Shipping & Freight</span>
                                         <span className={shippingCost === 0 ? 'text-emerald-400 font-black' : 'text-[#F8F3E8] tabular-nums font-black'}>
                                             {shippingCost === 0 ? 'FREE DELIVERY' : <Currency value={shippingCost} />}
                                         </span>
                                     </div>
                                     {appliedCoupon && (
                                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                                             <div className="flex items-center gap-2">
                                                 <Tag size={12} />
                                                 <span>{appliedCoupon.code}</span>
                                                 <button onClick={() => setAppliedCoupon(null)} className="hover:text-red-400 transition-colors ml-1"><Trash2 size={12}/></button>
                                             </div>
                                             <span className="tabular-nums font-black">- <Currency value={discountAmount} /></span>
                                         </div>
                                     )}
                                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">
                                         <span>GST & Taxes</span>
                                         <span className="text-[#F8F3E8] tabular-nums font-black">All Inclusive</span>
                                     </div>
                                </div>

                                <div className="pt-6 border-t border-white/10 mb-8">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] block mb-1">Total Payable</span>
                                            <span className="text-3xl md:text-4xl font-black text-[#C9A84C] tabular-nums leading-none"><Currency value={finalTotal} /></span>
                                        </div>
                                    </div>
                                </div>

                                {step === 'cart' ? (
                                    <div className="space-y-6">
                                        
                                        {/* Fixed "Have a Coupon" Card */}
                                        <div className="bg-[#151515] p-4 rounded-2xl border border-white/10 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[9.5px] font-black uppercase tracking-[0.25em] text-[#86868B] flex items-center gap-2">
                                                    <Tag size={12} className="text-[#C9A84C]" /> Have a Coupon?
                                                </label>
                                            </div>
                                            <div className="flex gap-2">
                                                <input 
                                                    value={couponCode} 
                                                    onChange={(e) => {
                                                        setCouponCode(e.target.value.toUpperCase());
                                                        setCouponError('');
                                                    }} 
                                                    placeholder="PROMO CODE" 
                                                    className="bg-[#1E1E1E] border border-white/10 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#F8F3E8] text-xs font-black uppercase tracking-widest placeholder-[#666] outline-none flex-1"
                                                />
                                                <button 
                                                    onClick={handleApplyCoupon}
                                                    disabled={!couponCode.trim()}
                                                    className="px-5 py-3 rounded-xl bg-[#C9A84C] hover:bg-[#E8D48B] text-[#0A0A0F] font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                            {couponError && (
                                                <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 p-2 rounded-lg">
                                                    <AlertCircle size={12} />
                                                    <span>{couponError}</span>
                                                </div>
                                            )}
                                            {appliedCoupon && (
                                                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 p-2 rounded-lg">
                                                    <CheckCircle size={12} />
                                                    <span>Applied successfully</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Fixed Pincode Delivery Card */}
                                        <div className="bg-[#151515] p-4 rounded-2xl border border-white/10 space-y-3">
                                            <label className="text-[9.5px] font-black uppercase tracking-[0.25em] text-[#86868B] flex items-center gap-2">
                                                <Truck size={12} className="text-[#C9A84C]" /> Estimate Delivery Pincode
                                            </label>
                                            <div className="flex gap-2">
                                                <input 
                                                    value={pincode} 
                                                    onChange={(e) => setPincode(e.target.value)} 
                                                    placeholder="6-DIGIT PINCODE" 
                                                    maxLength={6}
                                                    className="bg-[#1E1E1E] border border-white/10 focus:border-[#C9A84C] rounded-xl px-4 py-3 text-[#F8F3E8] text-xs font-black uppercase tracking-widest placeholder-[#666] outline-none flex-1"
                                                />
                                                <button 
                                                    onClick={checkDelivery}
                                                    disabled={pincode.length < 6}
                                                    className="px-5 py-3 rounded-xl bg-[#242424] hover:bg-[#2A2A2A] border border-white/10 text-[#F8F3E8] hover:text-[#C9A84C] font-black text-[10px] uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    Check
                                                </button>
                                            </div>
                                            {deliveryStatus && (
                                                <div className={`p-3 rounded-xl border text-[10px] uppercase font-bold tracking-wider ${
                                                    deliveryStatus.type === 'invalid' 
                                                        ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                }`}>
                                                    <p className="flex items-center gap-1.5 font-black mb-1">
                                                        <Truck size={12} /> {deliveryStatus.label}
                                                    </p>
                                                    <p className="text-[9px] opacity-80">{deliveryStatus.estimatedTime} • {deliveryStatus.shippingCost === 0 ? 'Free Shipping' : `₹${deliveryStatus.shippingCost}`}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Continue CTA */}
                                        <Button onClick={() => setStep('details')} className="w-full h-16 bg-gradient-to-r from-[#E8D48B] to-[#C9A84C] text-[#0A0A0F] font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 group">
                                            Proceed to Checkout <ArrowRight size={18} className="ml-3 group-hover:translate-x-1.5 transition-transform" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <Button 
                                            type="submit" 
                                            form="checkout-form" 
                                            disabled={isSubmitting} 
                                            className={`w-full h-16 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 ${
                                                orderMethod === 'whatsapp' 
                                                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40' 
                                                    : 'bg-[#C9A84C] hover:bg-[#8A6232] text-black shadow-amber-950/40'
                                            }`}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : (
                                                <>
                                                    {orderMethod === 'whatsapp' ? <MessageCircle size={20} /> : <Mail size={20} />}
                                                    <span>{orderMethod === 'whatsapp' ? 'Submit Order on WhatsApp' : 'Submit Order via Email'}</span>
                                                </>
                                            )}
                                        </Button>
                                        
                                        <button onClick={() => setStep('cart')} className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] hover:text-[#F8F3E8] transition-all py-2">
                                            ← Back to Cart Edit
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Help Desk Card */}
                            <div className="bg-[#1E1E1E] p-6 rounded-[2rem] border border-white/5 space-y-2">
                                <div className="flex items-center gap-3 text-emerald-400 text-xs font-black uppercase tracking-wider">
                                    <MessageCircle size={16} /> WhatsApp: {WHATSAPP_DISPLAY_PHONE}
                                </div>
                                <p className="text-[10px] text-[#86868B] uppercase tracking-wider font-semibold">
                                    Official support email: <span className="text-[#C9A84C]">info@dinanathandsons.com</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
