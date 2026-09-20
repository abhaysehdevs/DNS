
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/data';
import { ProductCard } from '@/components/product-card';
import { getSmartRelatedProducts } from '@/lib/recommendations'; // New Algorithm

export function RelatedProducts({ currentProduct }: { currentProduct: Product }) {
    const [related, setRelated] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRelated() {
            setLoading(true);
            try {
                // Use the new smart recommendation engine with increased volume (8 items)
                const products = await getSmartRelatedProducts(currentProduct, 8);
                setRelated(products);
            } catch (error) {
                console.error("Error fetching related products:", error);
            } finally {
                setLoading(false);
            }
        }

        if (currentProduct) {
            fetchRelated();
        }
    }, [currentProduct]);

    if (loading) return (
        <div className="mt-12 sm:mt-16">
            <div className="h-7 w-48 bg-[#E8E2D5]/60 animate-pulse rounded-md mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="bg-white border border-[#E8E2D5] rounded-2xl h-72 sm:h-80 animate-pulse"></div>
                ))}
            </div>
        </div>
    );

    if (related.length === 0) return null;

    return (
        <div className="mt-12 sm:mt-16">
            <h3 className="text-lg sm:text-2xl font-bold font-display text-[#18181B] mb-4 sm:mb-6 border-b border-[#E8E2D5] pb-3 sm:pb-4 flex items-center gap-2.5">
                <span>You Might Also Need</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#966E2E] bg-[#966E2E]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#966E2E]/20">
                    Smart Picks
                </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                {related.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
