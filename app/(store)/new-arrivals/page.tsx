'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProductGrid } from '@/components/shop/product-grid';

export default function NewArrivalsPage() {
    const { mode } = useAppStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [pageDetails, setPageDetails] = useState({ title: 'New Arrivals', subtitle: 'Explore our latest arrivals' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            try {
                // 1. Fetch from navigation_pages configuration
                const { data: pageConfig, error: configError } = await supabase
                    .from('navigation_pages')
                    .select('*')
                    .eq('page_key', 'new-arrivals')
                    .single();

                if (!configError && pageConfig) {
                    setPageDetails({
                        title: pageConfig.title,
                        subtitle: pageConfig.subtitle || 'Explore our latest arrivals'
                    });

                    if (pageConfig.product_ids && pageConfig.product_ids.length > 0) {
                        const { data: prodData, error: prodError } = await supabase
                            .from('products')
                            .select('*')
                            .in('id', pageConfig.product_ids);

                        if (!prodError && prodData) {
                            const mapped: Product[] = prodData.map((p: any) => ({
                                id: p.id,
                                name: p.name,
                                description: p.description,
                                retailPrice: p.retail_price,
                                wholesalePrice: p.wholesale_price,
                                wholesaleMOQ: p.wholesale_moq,
                                image: p.image || p.image_url || '/placeholder.jpg',
                                primaryImage: p.image || p.image_url || '/placeholder.jpg',
                                gallery: p.gallery || [],
                                category: p.category,
                                inStock: p.in_stock,
                                reviews: p.reviews || []
                            }));
                            setProducts(mapped);
                            setLoading(false);
                            return;
                        }
                    }
                }

                // 2. Fallback: Fetch latest 8 products
                const { data: fallbackData } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(8);

                if (fallbackData && fallbackData.length > 0) {
                    const mapped: Product[] = fallbackData.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        retailPrice: p.retail_price,
                        wholesalePrice: p.wholesale_price,
                        wholesaleMOQ: p.wholesale_moq,
                        image: p.image || p.image_url || '/placeholder.jpg',
                        primaryImage: p.image || p.image_url || '/placeholder.jpg',
                        gallery: p.gallery || [],
                        category: p.category,
                        inStock: p.in_stock,
                        reviews: p.reviews || []
                    }));
                    setProducts(mapped);
                } else {
                    const module = await import('@/lib/data');
                    setProducts(module.products.slice(0, 8));
                }
            } catch (err) {
                console.error(err);
                try {
                    const module = await import('@/lib/data');
                    setProducts(module.products.slice(0, 8));
                } catch (e) {}
            } finally {
                setLoading(false);
            }
        };

        fetchPageData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#151515] flex flex-col items-center justify-center gap-6">
                <Loader2 className="animate-spin text-[#A67C35]" size={36} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#CFCFCF]">Loading New Arrivals</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#151515] text-[#F8F3E8] pt-32 pb-20 px-6">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-10 flex items-center gap-4">
                    <Link href="/shop" className="text-xs font-bold text-[#8E8E9A] hover:text-[#A67C35] transition-colors flex items-center gap-2">
                        <ArrowLeft size={16} /> BACK TO CATALOG
                    </Link>
                </div>

                <div className="mb-16 text-center md:text-left space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight font-display">{pageDetails.title}</h1>
                    <p className="text-xs text-[#CFCFCF] font-semibold leading-relaxed uppercase tracking-wider max-w-xl">
                        {pageDetails.subtitle}
                    </p>
                </div>

                <div className="mt-8">
                    {products.length > 0 ? (
                        <ProductGrid products={products} loading={false} onClearFilters={() => {}} displayMode="grid" />
                    ) : (
                        <div className="text-center py-20 text-[#8E8E9A] border-2 border-dashed border-[#343434] rounded-3xl font-bold uppercase text-[10px] tracking-wider">
                            No products found in this selection. Check back soon!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
