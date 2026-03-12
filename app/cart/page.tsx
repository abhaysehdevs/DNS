
'use client';

import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { translations } from '@/lib/translations';
import { getDeliveryOptions } from '@/lib/delivery';
import { Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Trash2, Truck, ArrowRight, ShoppingBag, Loader2, Minus, Plus, CreditCard, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, mode, language, removeFromCart, clearCart, updateQuantity, user } = useAppStore();
    const t = translations[language];
    const isRetail = mode === 'retail';
    const router = useRouter();

    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState<any>(null);
    const [step, setStep] = useState<'cart' | 'details' | 'success'>('cart');

    // Checkout Form Status
    const [formData, setFormData] = useState({ name: '', email: '', address: '', phone: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill user details if logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email
            }));
        }
    }, [user]);

    // State to hold product details fetched from Supabase
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
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .in('id', ids);

            if (data) {
                const mappedProductsPromises: Promise<Product>[] = data.map(async (p: any) => {
                    const localMatch = (await import('@/lib/data')).products.find(lp => lp.id === p.id);
                    return {
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        retailPrice: p.retail_price,
                        wholesalePrice: p.wholesale_price,
                        wholesaleMOQ: p.wholesale_moq,
                        primaryImage: p.image || localMatch?.primaryImage || '/placeholder.jpg',
                        image: p.image || localMatch?.primaryImage || '/placeholder.jpg',
                        gallery: p.gallery || localMatch?.gallery || [{ id: '1', type: 'image', url: p.image || localMatch?.primaryImage || '/placeholder.jpg' }],
                        category: p.category,
                        inStock: p.in_stock,
                        reviews: p.reviews || [],
                        variants: p.variants || []
                    };
                });

                const mappedProducts = await Promise.all(mappedProductsPromises);
                setCartProducts(mappedProducts);
            }
            setLoading(false);
        }
        fetchCartProducts();
    }, [cart.length, cart]);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = deliveryStatus?.type === 'instant' ? 99 : 0;
    const finalTotal = total + shippingCost;

    const checkDelivery = () => {
        const result = getDeliveryOptions(pincode);
        setDeliveryStatus(result);
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // 1. Insert Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    customer_name: formData.name,
                    customer_email: formData.email,
                    customer_phone: formData.phone,
                    shipping_address: `${formData.address} (Pincode: ${pincode})`,
                    total_amount: finalTotal,
                    status: 'pending',
                    payment_method: 'cod',
                    type: mode
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Insert Order Items
            const orderItems = cart.map(item => {
                const product = cartProducts.find(p => p.id === item.productId);
                return {
                    order_id: orderData.id,
                    product_id: item.productId,
                    product_name: product?.name || 'Unknown Product',
                    variant_name: item.variantName || null,
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                };
            });

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Success
            clearCart();
            router.push(`/order-confirmation?id=${orderData.id}`);

        } catch (error: any) {
            console.error('Checkout Error:', error);
            alert(`Failed to place order: ${error.message}`);
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={48} />
            </div>
        )
    }

    if (cart.length === 0 && step !== 'success') {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <ShoppingBag size={64} className="text-gray-800 mb-6 mx-auto" />
                    <h1 className="text-3xl font-bold mb-2 text-center">{t.cart.empty}</h1>
                    <p className="text-gray-500 mb-8 text-center max-w-md">Your cart is feeling a bit lonely. Explore our premium collection to find something special.</p>
                    <Link href="/shop" className="flex justify-center">
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 rounded-full text-lg shadow-lg shadow-amber-900/20">
                            Start Shopping
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-10 pb-20">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Stepper */}
                <div className="flex items-center justify-center mb-12">
                    <div className={`flex items-center gap-2 ${step === 'cart' ? 'text-amber-500' : 'text-green-500'}`}>
                        <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm border-current">1</span>
                        <span className="font-medium">Cart</span>
                    </div>
                    <div className={`w-16 h-px mx-4 ${step !== 'cart' ? 'bg-amber-500' : 'bg-gray-800'}`} />
                    <div className={`flex items-center gap-2 ${step === 'details' ? 'text-amber-500' : 'text-gray-600'}`}>
                        <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${step === 'details' ? 'border-amber-500 bg-amber-900/20' : 'border-gray-700'}`}>2</span>
                        <span className="font-medium">Details & Pay</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Cart Items or Form */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {step === 'cart' ? (
                                <motion.div key="cart-list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                    <h2 className="text-2xl font-bold mb-6">Shopping Cart ({cart.length})</h2>
                                    {cart.map((item) => {
                                        const product = cartProducts.find(p => p.id === item.productId);
                                        if (!product) return null;

                                        const variantFn = product.variants?.find(v => v.id === item.variantId);
                                        const displayImage = variantFn?.image || product.primaryImage || product.image || '/placeholder.jpg';

                                        return (
                                            <div key={`${item.productId}-${item.variantId}`} className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-4 flex gap-5 transition-all hover:bg-gray-800/40 hover:border-gray-700/60 group shadow-lg">
                                                <div className="w-28 h-28 bg-white/5 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 relative">
                                                    <img src={displayImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between py-1">
                                                    <div>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-bold text-lg text-white group-hover:text-amber-500 transition-colors leading-tight mb-1">{product.name}</h3>
                                                                {item.variantName && <p className="text-sm border border-gray-700 bg-gray-800/50 text-gray-300 inline-block px-2 py-0.5 rounded-md mt-1 mb-2">Variant: {item.variantName}</p>}
                                                            </div>
                                                            <button onClick={() => removeFromCart(item.productId, item.variantId)} className="text-gray-500 hover:bg-red-500/10 hover:text-red-500 p-2 rounded-lg transition-colors">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div className="flex items-center bg-black/50 rounded-lg border border-gray-700/50 h-9 p-1">
                                                            <button onClick={() => updateQuantity(item.productId, item.variantId, item.mode, item.quantity - 1)} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"><Minus size={14} /></button>
                                                            <span className="w-10 text-center text-sm font-bold text-white">{item.quantity}</span>
                                                            <button onClick={() => updateQuantity(item.productId, item.variantId, item.mode, item.quantity + 1)} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"><Plus size={14} /></button>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-500 mb-0.5">{item.quantity} x ₹{item.price.toLocaleString()}</p>
                                                            <span className="font-bold text-xl text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div key="details-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <h2 className="text-2xl font-bold mb-6">Shipping Details</h2>
                                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400">Full Name</label>
                                                <input required className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 outline-none" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-400">Phone Number</label>
                                                <input required className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 outline-none" placeholder="+91 9999999999" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Email Address</label>
                                            <input required type="email" className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 outline-none" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-400">Shipping Address</label>
                                            <textarea required rows={3} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3 text-white focus:ring-1 focus:ring-amber-500 outline-none resize-none" placeholder="Enter full address with landmark" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                        </div>

                                        <div className="pt-6 border-t border-gray-800/50">
                                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CreditCard size={20} className="text-amber-500" /> Payment Options</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="border border-amber-500/50 bg-amber-500/10 p-4 rounded-xl flex items-start gap-4 cursor-pointer hover:bg-amber-500/20 transition-colors relative overflow-hidden">
                                                    <div className="absolute -right-4 -bottom-4 opacity-10"><CheckCircle size={64} className="text-amber-500" /></div>
                                                    <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-amber-500 flex items-center justify-center flex-shrink-0">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-white block">Cash on Delivery</span>
                                                        <span className="text-sm text-gray-400">Pay when you receive the order</span>
                                                    </div>
                                                </div>
                                                <div className="border border-gray-800 bg-gray-900/30 p-4 rounded-xl flex items-start gap-4 cursor-not-allowed opacity-60">
                                                    <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-gray-600 flex-shrink-0" />
                                                    <div>
                                                        <span className="font-bold text-gray-300 block">Online Payment</span>
                                                        <span className="text-sm text-gray-500">Coming soon through Gateway</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-xl font-bold mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-300">
                                    <span>Subtotal</span>
                                    <span className="font-medium">₹{total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-300">
                                    <span>Shipping</span>
                                    <span className={`font-medium ${shippingCost === 0 ? 'text-green-400' : 'text-white'}`}>
                                        {shippingCost === 0 ? 'Free' : `₹${shippingCost.toLocaleString()}`}
                                    </span>
                                </div>
                                {step === 'details' && (
                                    <div className="flex justify-between text-gray-400">
                                        <span>Tax (Included)</span>
                                        <span>₹{Math.round(total * 0.18).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-800 pt-6 mb-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-lg font-medium text-white block">Total</span>
                                        <span className="text-xs text-gray-500">Including all taxes</span>
                                    </div>
                                    <span className="text-3xl font-bold text-amber-500">₹{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {step === 'cart' ? (
                                <>
                                    <div className="mb-6 bg-black rounded-lg p-3 border border-gray-800 flex gap-2">
                                        <input
                                            value={pincode}
                                            onChange={(e) => setPincode(e.target.value)}
                                            placeholder="Pincode"
                                            className="bg-transparent w-full outline-none text-white text-sm"
                                            maxLength={6}
                                        />
                                        <button onClick={checkDelivery} className="text-amber-500 text-sm font-bold hover:text-amber-400 uppercase">Check</button>
                                    </div>
                                    {deliveryStatus && (
                                        <div className={`mb-6 text-xs p-2 rounded ${deliveryStatus.type === 'instant' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                            {deliveryStatus.type === 'instant' ? '⚡ Instant Delivery Available' : 'Standard Shipping Applies'}
                                        </div>
                                    )}
                                    <Button onClick={() => setStep('details')} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 rounded-xl text-lg shadow-lg shadow-amber-900/20">
                                        Proceed to Checkout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        type="submit"
                                        form="checkout-form"
                                        disabled={isSubmitting}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl text-lg shadow-lg shadow-green-900/20"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Place Order'}
                                    </Button>
                                    <button onClick={() => setStep('cart')} className="w-full mt-4 text-gray-500 hover:text-white text-sm font-medium">
                                        Back to Cart
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
