import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { products as localProducts, Product } from '@/lib/data';
import { normalizeProduct } from '@/lib/slug';
import { ShopClient } from './shop-client';
import { SITE_CONFIG, getAbsoluteUrl } from '@/lib/site-config';
import { Suspense } from 'react';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Jewellery Tools & Workshop Equipment Catalog | Dinanath & Sons',
    description: 'Explore professional goldsmith tools, casting machinery, micromotors, and polishing supplies in Maliwara, Chandni Chowk, Delhi. Fast pan-India shipping.',
    alternates: {
        canonical: getAbsoluteUrl('/shop'),
    },
    openGraph: {
        title: 'Jewellery Tools & Workshop Equipment Catalog | Dinanath & Sons',
        description: 'Explore professional goldsmith tools, casting machinery, micromotors, and polishing supplies in Maliwara, Chandni Chowk, Delhi. Fast pan-India shipping.',
        url: getAbsoluteUrl('/shop'),
        type: 'website',
        siteName: 'Dinanath & Sons',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Jewellery Tools & Workshop Equipment Catalog | Dinanath & Sons',
        description: 'Explore professional goldsmith tools, casting machinery, micromotors, and polishing supplies in Maliwara, Chandni Chowk, Delhi.',
    }
};

async function getInitialProducts(): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
            return data.map((p: any) => normalizeProduct(p));
        }
    } catch (e) {
        console.warn('Shop SSR query failed, falling back to local dataset', e);
    }

    return localProducts.map((p: any) => normalizeProduct(p));
}

import { notFound, permanentRedirect } from 'next/navigation';
import { CATEGORIES } from '@/lib/categories';

export default async function ShopPage(props: { searchParams?: Promise<{ cat?: string; category?: string; [key: string]: string | undefined }> }) {
    if (props.searchParams) {
        const sp = await props.searchParams;
        const query = sp.cat || sp.category;
        if (query) {
            const cleanQuery = query.toLowerCase().trim();
            const matched = CATEGORIES.find(c => 
                c.slug === cleanQuery || 
                c.categoryKey.toLowerCase() === cleanQuery || 
                c.name.toLowerCase() === cleanQuery ||
                c.aliases.some(a => a.toLowerCase() === cleanQuery)
            );
            if (matched) {
                permanentRedirect(`/shop/category/${matched.slug}`);
            } else {
                notFound();
            }
        }
    }

    const products = await getInitialProducts();

    return (
        <Suspense fallback={null}>
            <ShopClient initialProducts={products} />
        </Suspense>
    );
}
