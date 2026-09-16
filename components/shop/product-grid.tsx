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
            <div className={`grid grid-cols-2 ${displayMode === 'list' ? 'lg:grid-cols-2' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-2.5 sm:gap-4 md:gap-6`}>
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
                className="flex flex-col items-center justify-center py-24 sm:py-32 bg-[#1E1E1E] rounded-2xl sm:rounded-[3rem] border border-[#343434] text-center px-4"
            >
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl" style={{ background: 'linear-gradient(135deg, #DFCE9F, #C5A059)' }}>
                    <SearchX size={32} className="text-[#0A0A0F]" />
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-[#F8F3E8] mb-2 sm:mb-4 tracking-tight uppercase">No matching tools found</h3>
                <p className="text-[#8E8E9A] max-w-md mx-auto mb-6 sm:mb-10 text-xs sm:text-base font-medium leading-relaxed">
                    We couldn't find any products matching your current filters or search terms. Try expanding your search or clearing filters.
                </p>
                <button
                    onClick={onClearFilters}
                    className="px-8 sm:px-10 py-3 sm:py-4 text-[#0A0A0F] font-black rounded-xl hover:scale-105 transition-all text-[9px] sm:text-[10px] uppercase tracking-[0.2em] shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #DFCE9F, #C5A059)' }}
                >
                    Reset Filters
                </button>
            </motion.div>
        );
    }

    return (
        <div className={`grid grid-cols-2 ${displayMode === 'list' ? 'lg:grid-cols-2' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-2.5 sm:gap-4 md:gap-6 w-full`}>
            {products.map((product) => (
                <div key={product.id} className="w-full min-w-0">
                    <ProductCard product={product} list={displayMode === 'list'} />
                </div>
            ))}
        </div>
    );
}
