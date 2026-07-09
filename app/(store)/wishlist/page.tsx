'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { ProductCard } from '@/components/product-card';
import { Product } from '@/lib/data';
import { Heart, ArrowRight, Sparkles, Zap, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
    const { wishlist } = useAppStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWishlist() {
            setLoading(true);
            if (wishlist.length === 0) {
                setProducts([]);
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('products')
                .select('*')
                .in('id', wishlist);

            if (data && data.length > 0) {
                const mappedProducts: Product[] = data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    retailPrice: p.retail_price,
                    wholesalePrice: p.wholesale_price,
                    wholesaleMOQ: p.wholesale_moq,
                    image: p.image,
                    primaryImage: p.image || '/placeholder.jpg',
                    gallery: p.gallery || [],
                    category: p.category,
                    inStock: p.in_stock,
                    reviews: p.reviews || []
                }));
                setProducts(mappedProducts);
            } else {
                import('@/lib/data').then((module) => {
                    const localMatches = module.products.filter(p => wishlist.includes(p.id));
                    setProducts(localMatches);
                });
            }
            setLoading(false);
        }
        fetchWishlist();
    }, [wishlist]);

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] pt-32 md:pt-48 pb-24 noise-overlay selection:bg-[#C9A84C]/30 overflow-x-hidden">
            
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[20%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div>
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-gold text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <Sparkles size={12} /> Curated Technical Selections
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9]">
                            Asset <span style={{ background: 'linear-gradient(135deg, #F5F5F7, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vault</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-6 py-3 rounded-2xl glass border border-white/[0.04] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                            <Heart size={16} className="text-[#C9A84C] fill-[#C9A84C]" />
                            {products.length} {products.length === 1 ? 'Stored Asset' : 'Stored Assets'}
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-32 gap-6"
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/10 border-t-[#C9A84C] animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">Accessing Private Vault</span>
                        </motion.div>
                    ) : products.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-32 glass rounded-[3rem] border-dashed border-white/[0.06] relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                                <Zap size={200} className="text-[#C9A84C]" />
                            </div>
                            
                            <div className="w-24 h-24 glass rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                <ShoppingBag size={40} className="text-[#3A3A4A]" />
                            </div>
                            <h2 className="text-3xl font-black text-[#F5F5F7] mb-4 uppercase tracking-tight">Your Vault is <span className="text-[#5A5A6A]">Vacant</span></h2>
                            <p className="text-[#8E8E9A] max-w-md mx-auto mb-10 text-base font-medium leading-relaxed">
                                No technical equipment has been prioritized yet. Browse our inventory to begin your professional curation.
                            </p>
                            <Link href="/shop">
                                <Button className="h-14 px-10 glass-gold text-[#C9A84C] font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all hover:-translate-y-1 group">
                                    Initialize Acquisition <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="grid"
                            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8"
                        >
                            <AnimatePresence mode="popLayout">
                                {products.map((product, i) => (
                                    <motion.div
                                        layout
                                        key={product.id}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Vault Security Footer */}
                {products.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-20 pt-10 border-t border-white/[0.04] text-center"
                    >
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#5A5A6A] flex items-center justify-center gap-3">
                            <Zap size={14} /> Synchronized with your global professional account
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
