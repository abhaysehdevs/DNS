
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
                // Use the new smart recommendation engine
                const products = await getSmartRelatedProducts(currentProduct, 4);
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
        <div className="mt-20">
            <h3 className="text-2xl font-bold text-white mb-8 border-b border-gray-800 pb-4 animate-pulse bg-gray-900 h-8 w-64 rounded"></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-gray-900 rounded-xl h-96 animate-pulse"></div>
                ))}
            </div>
        </div>
    );

    if (related.length === 0) return null;

    return (
        <div className="mt-20">
            <h3 className="text-2xl font-bold text-white mb-8 border-b border-gray-800 pb-4 flex items-center gap-2">
                You Might Also Need
                <span className="text-xs font-normal text-amber-500 bg-amber-900/20 px-2 py-1 rounded-full uppercase tracking-wider border border-amber-900/50">
                    Smart Picks
                </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}
