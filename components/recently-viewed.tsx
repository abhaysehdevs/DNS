'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { ProductCard } from '@/components/product-card';
import { Product } from '@/lib/data';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function RecentlyViewed() {
    const { viewedProducts } = useAppStore();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        async function fetchViewed() {
            if (viewedProducts.length === 0) return;

            const { data } = await supabase
                .from('products')
                .select('*')
                .in('id', viewedProducts);

            if (data) {
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
                // Sort by order in viewedProducts array (most recent first)
                const sorted = mappedProducts.sort((a, b) => {
                    return viewedProducts.indexOf(a.id) - viewedProducts.indexOf(b.id);
                });
                setProducts(sorted);
            }
        }
        fetchViewed();
    }, [viewedProducts]);

    if (products.length === 0) return null;

    return (
        <section className="py-12 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="text-amber-500" size={20} />
                    <h2 className="text-xl font-bold text-white">Recently Viewed</h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <ProductCard product={product} compact={true} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
