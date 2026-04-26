'use client';

import { Product } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { SearchX, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGridProps {
    products: Product[];
    loading: boolean;
    onClearFilters: () => void;
    displayMode?: 'grid' | 'list';
}

export function ProductGrid({ products, loading, onClearFilters, displayMode = 'grid' }: ProductGridProps) {

    // Enhanced Skeleton Loader
    const ProductSkeleton = () => (
        <div className="glass rounded-[2rem] overflow-hidden animate-pulse">
            <div className="aspect-square bg-white/[0.03]" />
            <div className="p-6 space-y-4">
                <div className="flex gap-2">
                    <div className="h-2.5 bg-white/[0.05] rounded-full w-8" />
                    <div className="h-2.5 bg-white/[0.05] rounded-full w-12" />
                </div>
                <div className="h-4 bg-white/[0.08] rounded-full w-3/4" />
                <div className="h-3 bg-white/[0.05] rounded-full w-full" />
                <div className="flex justify-between items-center pt-4">
                    <div className="h-6 bg-white/[0.1] rounded-full w-20" />
                    <div className="h-10 bg-white/[0.1] rounded-xl w-10" />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className={`grid gap-4 md:gap-8 ${displayMode === 'list' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {[...Array(8)].map((_, i) => (
                    <ProductSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-32 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-black/[0.04] text-center"
            >
                <div className="w-24 h-24 glass-gold rounded-full flex items-center justify-center mb-8 shadow-2xl" style={{ background: 'linear-gradient(135deg, #E8D48B, #C9A84C)' }}>
                    <SearchX size={40} className="text-[#0A0A0F]" />
                </div>
                <h3 className="text-3xl font-black text-[#1D1D1F] mb-4 tracking-tight uppercase">No matching tools found</h3>
                <p className="text-[#6E6E73] max-w-md mx-auto mb-10 text-base font-medium leading-relaxed">
                    We couldn't find any products matching your current filters or search terms. Try expanding your search.
                </p>
                <button
                    onClick={onClearFilters}
                    className="px-10 py-4 glass-gold text-[#0A0A0F] font-black rounded-2xl hover:scale-105 transition-all text-[10px] uppercase tracking-[0.2em] shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #E8D48B, #C9A84C)' }}
                >
                    Reset Filters
                </button>
            </motion.div>
        );
    }

    return (
        <div className={`grid gap-4 md:gap-8 ${displayMode === 'list' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            <AnimatePresence mode="popLayout">
                {products.map((product, i) => (
                    <motion.div
                        layout
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <ProductCard product={product} list={displayMode === 'list'} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
