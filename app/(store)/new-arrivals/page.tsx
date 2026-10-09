import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { Product, products as localProducts } from '@/lib/data';
import { normalizeProduct } from '@/lib/slug';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { SITE_CONFIG, getAbsoluteUrl } from '@/lib/site-config';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'New Arrivals | Jewellery Tools & Machinery | Dinanath & Sons',
    description: 'Explore the newest jewellery making tools, precision tweezers, casting equipment, and workshop accessories at Dinanath & Sons, Delhi.',
    alternates: {
        canonical: getAbsoluteUrl('/new-arrivals'),
    },
    openGraph: {
        title: 'New Arrivals | Jewellery Tools & Machinery | Dinanath & Sons',
        description: 'Explore the newest jewellery making tools, precision tweezers, casting equipment, and workshop accessories at Dinanath & Sons, Delhi.',
        url: getAbsoluteUrl('/new-arrivals'),
        type: 'website',
    },
};

async function getNewArrivalsData(): Promise<{ products: Product[]; pageDetails: { title: string; subtitle: string } }> {
    let pageDetails = { 
        title: 'New Arrivals', 
        subtitle: 'Explore our latest arrivals in jewellery crafting tools and machinery' 
    };
    let products: Product[] = [];

    try {
        const { data: pageConfig, error: configError } = await supabase
            .from('navigation_pages')
            .select('*')
            .eq('page_key', 'new-arrivals')
            .single();

        if (!configError && pageConfig) {
            pageDetails = {
                title: pageConfig.title || pageDetails.title,
                subtitle: pageConfig.subtitle || pageDetails.subtitle,
            };

            if (pageConfig.product_ids && pageConfig.product_ids.length > 0) {
                const { data: prodData, error: prodError } = await supabase
                    .from('products')
                    .select('*')
                    .in('id', pageConfig.product_ids);

                if (!prodError && prodData && prodData.length > 0) {
                    products = prodData.map((p: any) => normalizeProduct(p));
                    return { products, pageDetails };
                }
            }
        }

        const { data: fallbackData } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(12);

        if (fallbackData && fallbackData.length > 0) {
            products = fallbackData.map((p: any) => normalizeProduct(p));
        } else {
            products = localProducts.slice(0, 12).map((p: any) => normalizeProduct(p));
        }
    } catch (e) {
        products = localProducts.slice(0, 12).map((p: any) => normalizeProduct(p));
    }

    return { products, pageDetails };
}

export default async function NewArrivalsPage() {
    const { products, pageDetails } = await getNewArrivalsData();

    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] pt-2 sm:pt-4 md:pt-6 pb-20 px-3.5 sm:px-6 selection:bg-[#966E2E]/20">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-4 sm:mb-8 flex items-center gap-4">
                    <Link href="/shop" className="text-xs font-bold text-[#71717A] hover:text-[#966E2E] transition-colors flex items-center gap-2">
                        <ArrowLeft size={16} /> BACK TO CATALOG
                    </Link>
                </div>

                <div className="mb-6 sm:mb-8 text-center md:text-left space-y-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-display text-[#18181B]">{pageDetails.title}</h1>
                    <p className="text-xs text-[#52525B] font-semibold leading-relaxed uppercase tracking-wider max-w-xl">
                        {pageDetails.subtitle}
                    </p>
                </div>

                <div className="mt-8">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-[#71717A] border-2 border-dashed border-[#E8E2D5] rounded-3xl font-bold uppercase text-[10px] tracking-wider bg-white shadow-sm">
                            No products found in this selection. Check back soon!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
