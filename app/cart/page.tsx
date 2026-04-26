'use client';

import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/translations';
import { getDeliveryOptions } from '@/lib/delivery';
import { Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Trash2, Truck, ArrowRight, ShoppingBag, Loader2, Minus, Plus, CreditCard, CheckCircle, Sparkles, ShieldCheck, Zap, Tag } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Currency } from '@/components/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { generateShiprocketDetails } from '@/lib/shiprocket';

export default function CartPage() {
    const { cart, mode, language, removeFromCart, clearCart, updateQuantity, user } = useAppStore();
    const t = translations[language];
    const isRetail = mode === 'retail';
    const router = useRouter();

    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState<any>(null);
    const [step, setStep] = useState<'cart' | 'details'>('cart');

    const [formData, setFormData] = useState({ name: '', email: '', address: '', phone: '' });
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
                        variants: p.variants || []
                    };
                });
                setCartProducts(mappedProducts);
            }
            setLoading(false);
        }
        fetchCartProducts();
    }, [cart.length, cart]);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = deliveryStatus?.type === 'instant' ? 99 : 0;
    
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

        const isBulk = mode === 'wholesale';
        const shiprocketData = generateShiprocketDetails(pincode, isBulk);
        const finalOrderId = 'ORD-' + Math.floor(Math.random() * 100000000);

        try {
            await supabase.from('orders').insert({
                id: finalOrderId,
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone,
                shipping_address: `${formData.address} (Pincode: ${pincode})`,
                total_amount: finalTotal,
                discount_amount: discountAmount,
                coupon_code: appliedCoupon?.code || null,
                status: 'pending',
                payment_method: 'cod',
                type: mode
            });

            const orderItems = cart.map(item => {
                const product = cartProducts.find(p => p.id === item.productId);
                return {
                    order_id: finalOrderId,
                    product_id: item.productId,
                    product_name: product?.name || 'Unknown Product',
                    variant_name: item.variantName || null,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                };
            });
            await supabase.from('order_items').insert(orderItems);

            if (appliedCoupon) {
                await supabase.rpc('increment_coupon_usage', { coupon_id: appliedCoupon.id });
            }
        } catch (error) {}

        localStorage.setItem(`order_${finalOrderId}`, JSON.stringify({
            id: finalOrderId,
            customer_name: formData.name,
            total_amount: finalTotal,
            discount_amount: discountAmount,
            coupon_code: appliedCoupon?.code || null,
            status: 'pending',
            shiprocket: shiprocketData,
            order_items: cart.map(item => ({
                product_name: cartProducts.find(p => p.id === item.productId)?.name || 'Unknown Product',
                quantity: item.quantity,
                price: item.price
            }))
        }));

        clearCart();
        router.push(`/order-confirmation?id=${finalOrderId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/10 border-t-[#C9A84C] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">Loading Items</span>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center p-6 noise-overlay">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <ShoppingBag size={40} className="#86868B" />
                    </div>
                    <h1 className="text-4xl font-black mb-4 uppercase tracking-tight text-[#1D1D1F]">Your Cart is <span className="text-[#86868B]">Empty</span></h1>
                    <p className="text-[#6E6E73] mb-10 max-w-md mx-auto font-medium">Add some premium tools to your cart to continue shopping.</p>
                    <Link href="/shop">
                        <Button className="h-14 px-12 glass-gold text-[#0A0A0F] font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #E8D48B, #C9A84C)' }}>
                            Explore Products
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFFFF] text-[#1D1D1F] pt-40 md:pt-60 pb-24 noise-overlay selection:bg-[#C9A84C]/30 overflow-x-hidden">
            
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
                    <div>
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-gold text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
                            <ShieldCheck size={14} /> Secure Checkout
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9]">
                            Order <span style={{ background: 'linear-gradient(135deg, #1D1D1F, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Review</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className={`flex flex-col items-center gap-3 transition-all ${step === 'cart' ? 'text-[#C9A84C]' : 'text-[#86868B]'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step === 'cart' ? 'glass-gold text-[#0A0A0F]' : 'glass'}`}>01</div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cart</span>
                        </div>
                        <div className="w-12 h-px bg-black/[0.04]" />
                        <div className={`flex flex-col items-center gap-3 transition-all ${step === 'details' ? 'text-blue-600' : 'text-[#86868B]'}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step === 'details' ? 'bg-blue-600 text-white shadow-lg' : 'glass'}`}>02</div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Shipping</span>
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
                                                className="glass rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row gap-8 relative border border-black/[0.04] bg-white/50 hover:shadow-xl transition-all group overflow-hidden"
                                            >
                                                <div className="w-full md:w-48 h-48 bg-[#F5F5F7] rounded-2xl overflow-hidden shrink-0 relative p-4 flex items-center justify-center">
                                                    <img src={displayImage} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                                                </div>

                                                <div className="flex-1 flex flex-col justify-center">
                                                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-6">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1 rounded-full">{product.category}</span>
                                                                {product.inStock && <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600"><div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> In Stock</span>}
                                                            </div>
                                                            <h3 className="text-xl md:text-2xl font-black text-[#1D1D1F] uppercase tracking-tight group-hover:text-[#C9A84C] transition-colors">{product.name}</h3>
                                                            {item.variantName && <p className="text-[10px] font-bold text-[#86868B] mt-2 uppercase tracking-widest">Variant: <span className="text-[#1D1D1F]">{item.variantName}</span></p>}
                                                        </div>
                                                        <div className="text-left md:text-right">
                                                            <span className="text-2xl font-black text-[#1D1D1F] tabular-nums"><Currency value={item.price * item.quantity} /></span>
                                                            <p className="text-[10px] font-bold text-[#86868B] mt-1 uppercase tracking-widest">Unit Price: <Currency value={item.price} /></p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between pt-6 border-t border-black/[0.04]">
                                                        <div className="flex items-center bg-[#F5F5F7] rounded-xl h-10 p-1 border border-black/[0.04]">
                                                            <button onClick={() => updateQuantity(item.productId, item.variantId, item.mode, item.quantity - 1)} className="w-8 h-full flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] transition-all"><Minus size={14} /></button>
                                                            <div className="w-10 flex items-center justify-center text-xs font-black text-[#1D1D1F] tabular-nums">{item.quantity}</div>
                                                            <button onClick={() => updateQuantity(item.productId, item.variantId, item.mode, item.quantity + 1)} className="w-8 h-full flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] transition-all"><Plus size={14} /></button>
                                                        </div>
                                                        <button onClick={() => removeFromCart(item.productId, item.variantId)} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] hover:text-red-600 transition-all flex items-center gap-2">
                                                            <Trash2 size={14} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-strong rounded-[3rem] p-8 md:p-14 border border-black/[0.04] bg-white shadow-xl">
                                    <h2 className="text-3xl font-black uppercase tracking-tight mb-10 leading-none">Shipping <span className="text-[#86868B]">Details</span></h2>
                                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Full Name</label>
                                                <input required className="w-full h-16 bg-[#F5F5F7] border border-black/[0.04] rounded-2xl px-6 text-[#1D1D1F] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-black uppercase text-[10px] tracking-widest" placeholder="Your Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Phone Number</label>
                                                <input required className="w-full h-16 bg-[#F5F5F7] border border-black/[0.04] rounded-2xl px-6 text-[#1D1D1F] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-black uppercase text-[10px] tracking-widest" placeholder="+91 000 000 0000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Email Address</label>
                                            <input required type="email" className="w-full h-16 bg-[#F5F5F7] border border-black/[0.04] rounded-2xl px-6 text-[#1D1D1F] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-black uppercase text-[10px] tracking-widest" placeholder="email@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Shipping Address</label>
                                            <textarea required rows={4} className="w-full bg-[#F5F5F7] border border-black/[0.04] rounded-3xl p-6 text-[#1D1D1F] placeholder-[#86868B] focus:border-[#C9A84C] focus:outline-none transition-all font-black uppercase text-[10px] tracking-widest resize-none" placeholder="Enter Full Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                        </div>

                                        <div className="pt-10 border-t border-black/[0.04]">
                                            <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3"><CreditCard size={20} className="text-[#C9A84C]" /> Payment Method</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-[#C9A84C]/5 rounded-[1.5rem] p-6 flex items-start gap-4 cursor-pointer relative overflow-hidden border border-[#C9A84C]/20">
                                                    <div className="w-6 h-6 mt-0.5 rounded-full border-2 border-[#C9A84C] flex items-center justify-center shrink-0">
                                                        <div className="w-3 h-3 rounded-full bg-[#C9A84C]" />
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-[#1D1D1F] block text-sm uppercase tracking-tight">Cash on Delivery</span>
                                                        <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest mt-1 block">Pay when items arrive</span>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 rounded-[1.5rem] p-6 flex items-start gap-4 cursor-not-allowed opacity-40 border border-black/[0.04]">
                                                    <div className="w-6 h-6 mt-0.5 rounded-full border-2 border-[#86868B] shrink-0" />
                                                    <div>
                                                        <span className="font-black text-[#1D1D1F] block text-sm uppercase tracking-tight">Online Payment</span>
                                                        <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest mt-1 block">Coming Soon</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="lg:col-span-4">
                        <div className="sticky top-40 space-y-6">
                            <div className="glass-strong rounded-[2.5rem] p-10 border border-black/[0.04] bg-white shadow-2xl">
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-10 leading-none text-[#1D1D1F]">Order <span className="text-[#86868B]">Summary</span></h3>

                                <div className="space-y-6 mb-10">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">
                                        <span>Subtotal</span>
                                        <span className="text-[#1D1D1F] tabular-nums font-black"><Currency value={total} /></span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">
                                         <span>Shipping</span>
                                         <span className={shippingCost === 0 ? 'text-emerald-600 font-black' : 'text-[#1D1D1F] tabular-nums font-black'}>
                                             {shippingCost === 0 ? 'FREE' : <Currency value={shippingCost} />}
                                         </span>
                                     </div>
                                     {appliedCoupon && (
                                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                                             <div className="flex items-center gap-2">
                                                 <span>Discount ({appliedCoupon.code})</span>
                                                 <button onClick={() => setAppliedCoupon(null)} className="hover:text-red-600 transition-colors"><Trash2 size={12}/></button>
                                             </div>
                                             <span className="tabular-nums font-black">- <Currency value={discountAmount} /></span>
                                         </div>
                                     )}
                                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B]">
                                         <span>Taxes</span>
                                         <span className="text-[#1D1D1F] tabular-nums font-black">Included</span>
                                     </div>
                                 </div>

                                 <div className="pt-8 border-t border-black/[0.04] mb-10">
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
                                             <div className={`bg-[#F5F5F7] rounded-2xl h-14 flex items-center px-6 transition-all border ${couponError ? 'border-red-500' : 'border-black/[0.04] focus-within:border-[#C9A84C]'}`}>
                                                 <Tag size={16} className="text-[#86868B] mr-4" />
                                                 <input 
                                                     value={couponCode} 
                                                     onChange={(e) => {
                                                         setCouponCode(e.target.value.toUpperCase());
                                                         setCouponError('');
                                                     }} 
                                                     placeholder="CODE" 
                                                     className="bg-transparent w-full outline-none text-[#1D1D1F] text-[10px] font-black uppercase tracking-[0.3em] placeholder-[#86868B]" 
                                                 />
                                                 <button onClick={handleApplyCoupon} className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#E8D48B] transition-colors ml-4">Apply</button>
                                             </div>
                                             {couponError && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-4">{couponError}</p>}
                                             {appliedCoupon && <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-4 flex items-center gap-2"><CheckCircle size={10}/> Coupon Applied</p>}
                                         </div>

                                         <div className="h-px bg-black/[0.04] my-6" />

                                         <div className="bg-[#F5F5F7] rounded-2xl h-14 flex items-center px-6 border border-black/[0.04] focus-within:border-[#C9A84C] transition-all">
                                             <Truck size={16} className="text-[#86868B] mr-4" />
                                             <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="PINCODE" className="bg-transparent w-full outline-none text-[#1D1D1F] text-[10px] font-black uppercase tracking-[0.3em] placeholder-[#86868B]" maxLength={6} />
                                             <button onClick={checkDelivery} className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#E8D48B] transition-colors ml-4">Check</button>
                                         </div>
                                        {deliveryStatus && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-2xl border ${deliveryStatus.type === 'instant' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                                                    <Truck size={14} /> {deliveryStatus.type === 'instant' ? 'Instant Delivery Available' : 'Standard Shipping Applies'}
                                                </h4>
                                                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Est. Time: {deliveryStatus.estimatedTime}</p>
                                            </motion.div>
                                        )}
                                        <Button onClick={() => setStep('details')} className="w-full h-16 glass-gold text-[#0A0A0F] font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:-translate-y-1 group" style={{ background: 'linear-gradient(135deg, #E8D48B, #C9A84C)' }}>
                                            Continue to Shipping <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />
                                        </Button>
                                    </div>
                                 ) : (
                                     <div className="space-y-4">
                                         <Button type="submit" form="checkout-form" disabled={isSubmitting} className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:-translate-y-1 shadow-emerald-200">
                                             {isSubmitting ? <Loader2 className="animate-spin" /> : 'Place Order'}
                                         </Button>
                                         <button onClick={() => setStep('cart')} className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] hover:text-[#1D1D1F] transition-all py-2">
                                             Back to Cart
                                         </button>
                                     </div>
                                 )}
                             </div>

                             <div className="glass p-8 rounded-[2rem] border border-black/[0.04] bg-white shadow-lg">
                                 <div className="flex items-center gap-4 mb-4">
                                     <ShieldCheck className="text-[#C9A84C]" size={20} />
                                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1D1D1F]">Secure Checkout</h4>
                                 </div>
                                 <p className="text-[10px] text-[#86868B] font-medium leading-relaxed uppercase tracking-widest">
                                     Your transaction is protected. We use industry-standard encryption for all orders.
                                 </p>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
