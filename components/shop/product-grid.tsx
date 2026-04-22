
'use client';

import { Product } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductGridProps {
    products: Product[];
    loading: boolean;
    onClearFilters: () => void;
    displayMode?: 'grid' | 'list';
}

export function ProductGrid({ products, loading, onClearFilters, displayMode = 'grid' }: ProductGridProps) {

    // Skeleton Loader Component
    const ProductSkeleton = () => (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-800" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="flex gap-1">
                    <div className="h-3 bg-gray-800 rounded w-4" />
                    <div className="h-3 bg-gray-800 rounded w-4" />
                    <div className="h-3 bg-gray-800 rounded w-4" />
                </div>
                <div className="h-3 bg-gray-800 rounded w-full" />
                <div className="h-8 bg-gray-800 rounded w-full mt-4" />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className={`grid gap-6 ${displayMode === 'list' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {[...Array(8)].map((_, i) => (
                    <ProductSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800 text-center animate-fade-in">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <X size={32} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                    We couldn't find any products matching your filters. Try adjusting your search query or removing some filters.
                </p>
                <button
                    onClick={onClearFilters}
                    className="px-6 py-2 bg-amber-900/20 text-amber-500 border border-amber-900/50 rounded-full hover:bg-amber-900/40 transition-colors font-medium"
                >
                    Clear all filters
                </button>
            </div>
        );
    }

    return (
        <div className={`grid gap-6 animate-fade-in-up ${displayMode === 'list' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} list={displayMode === 'list'} />
            ))}
        </div>
    );
}
