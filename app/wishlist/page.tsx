
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { ProductCard } from '@/components/product-card';
import { Product } from '@/lib/data';
import { Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
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

<<<<<<< Updated upstream
            if (data) {
=======
            if (data && data.length > 0) {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
            } else {
                import('@/lib/data').then((module) => {
                    const localMatches = module.products.filter(p => wishlist.includes(p.id));
                    setProducts(localMatches);
                });
>>>>>>> Stashed changes
            }
            setLoading(false);
        }
        fetchWishlist();
    }, [wishlist]);

    return (
        <div className="min-h-screen bg-black text-white pt-10 pb-20">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="text-red-500 fill-red-500" size={32} />
                    <h1 className="text-3xl md:text-4xl font-bold">My Wishlist</h1>
                    <span className="text-gray-500 text-lg ml-2">({products.length})</span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
                        <Heart size={48} className="mx-auto text-gray-700 mb-4" />
                        <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-400 mb-6">Start saving your favorite tools and machinery.</p>
                        <Link href="/shop">
                            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                                Browse Shop <ArrowRight size={16} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                layout
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
