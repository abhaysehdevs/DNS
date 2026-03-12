
'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { getPersonalizedRecommendations } from '@/lib/recommendations';
import { ProductCard } from '@/components/product-card';
import { Sparkles } from 'lucide-react';
import { Product } from '@/lib/data';
import { motion } from 'framer-motion';

export function PersonalizedRecommendations() {
    const { viewedProducts, cart } = useAppStore();
    const [recommended, setRecommended] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRecommendations() {
            setLoading(true);
            try {
                const historyIds = [...new Set([...viewedProducts, ...cart.map(c => c.productId)])];
                const products = await getPersonalizedRecommendations(historyIds, 4);
                setRecommended(products);
            } catch (error) {
                console.error("Personalization failed:", error);
            } finally {
                setLoading(false);
            }
        }

        loadRecommendations();
    }, [viewedProducts, cart]);

    if (loading) return (
        <div>
            <div className="h-6 w-48 bg-white/5 rounded-full mb-10 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-3xl h-[400px] animate-pulse" />
                ))}
            </div>
        </div>
    );

    if (recommended.length === 0) return null;

    return (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-3 mb-12">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Sparkles size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-[0.2em] text-white">Recommended Infrastructure</h2>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Based on your workshop profile</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recommended.map((product, idx) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <ProductCard product={product} compact={false} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
