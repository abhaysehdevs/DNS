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
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] pt-2 sm:pt-4 md:pt-6 pb-20 selection:bg-[#966E2E]/20 overflow-x-hidden">
            <div className="container mx-auto px-6 relative z-10">
                
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div>
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#966E2E]/10 border border-[#966E2E]/20 text-[#966E2E] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
                            <Sparkles size={12} /> Curated Technical Selections
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-[0.9] text-[#18181B]">
                            Wishlist <span className="text-[#966E2E]">Vault</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-6 py-3 rounded-2xl bg-white border border-[#E8E2D5] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 text-[#18181B] shadow-sm">
                            <Heart size={16} className="text-[#966E2E] fill-[#966E2E]" />
                            {products.length} {products.length === 1 ? 'Stored Item' : 'Stored Items'}
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
                            <div className="w-12 h-12 rounded-full border-2 border-[#966E2E]/20 border-t-[#966E2E] animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#966E2E]">Accessing Vault</span>
                        </motion.div>
                    ) : products.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-[#E8E2D5] shadow-sm relative overflow-hidden"
                        >
                            <div className="w-24 h-24 bg-[#FAF9F5] border border-[#E8E2D5] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <ShoppingBag size={40} className="text-[#966E2E]" />
                            </div>
                            <h2 className="text-3xl font-black text-[#18181B] mb-4 uppercase tracking-tight">Your Wishlist is <span className="text-[#71717A]">Empty</span></h2>
                            <p className="text-[#52525B] max-w-md mx-auto mb-10 text-base font-medium leading-relaxed">
                                No technical equipment has been added yet. Browse our catalog to curate your toolkit.
                            </p>
                            <Link href="/shop">
                                <Button className="h-14 px-10 bg-[#966E2E] hover:bg-[#7D5A25] text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all hover:-translate-y-1 group">
                                    Explore Products <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />
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
                        className="mt-20 pt-10 border-t border-[#E8E2D5] text-center"
                    >
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#71717A] flex items-center justify-center gap-3">
                            <Zap size={14} className="text-[#966E2E]" /> Synchronized with your global account
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
