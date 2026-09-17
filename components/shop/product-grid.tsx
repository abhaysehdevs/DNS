'use client';

import { Product } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { SearchX } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductGridProps {
    products: Product[];
    loading: boolean;
    onClearFilters: () => void;
    displayMode?: 'grid' | 'list';
}

export function ProductGrid({ products, loading, onClearFilters, displayMode = 'grid' }: ProductGridProps) {

    // Skeleton Loader
    const ProductSkeleton = () => (
        <div className="bg-white border border-[#E8E2D5] rounded-2xl overflow-hidden animate-pulse shadow-xs">
            <div className="aspect-square bg-[#FAF9F5]" />
            <div className="p-4 space-y-3">
                <div className="flex gap-2">
                    <div className="h-2.5 bg-[#E8E2D5] rounded-full w-8" />
                    <div className="h-2.5 bg-[#E8E2D5] rounded-full w-12" />
                </div>
                <div className="h-3.5 bg-[#E8E2D5] rounded-full w-3/4" />
                <div className="h-3 bg-[#FAF9F5] rounded-full w-full" />
                <div className="flex justify-between items-center pt-2">
                    <div className="h-5 bg-[#E8E2D5] rounded-full w-16" />
                    <div className="h-4 bg-[#FAF9F5] rounded-md w-10" />
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
                className="flex flex-col items-center justify-center py-20 sm:py-28 bg-white rounded-2xl border border-[#E8E2D5] text-center px-4 shadow-xs"
            >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-5 bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] shadow-sm">
                    <SearchX size={30} />
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-[#18181B] mb-2 tracking-tight uppercase">No matching tools found</h3>
                <p className="text-[#71717A] max-w-md mx-auto mb-6 text-xs sm:text-sm font-normal leading-relaxed">
                    We couldn't find any products matching your current filters or search terms. Try expanding your search or clearing filters.
                </p>
                <button
                    onClick={onClearFilters}
                    className="px-6 py-2.5 bg-[#966E2E] hover:bg-[#7D5A25] text-white font-bold rounded-xl transition-all text-[9.5px] uppercase tracking-[0.15em] shadow-sm cursor-pointer"
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
