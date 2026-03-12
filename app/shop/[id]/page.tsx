import { supabase } from '@/lib/supabase';
import { products as staticProducts } from '@/lib/data';
import ProductClient from './product-client';

export async function generateStaticParams() {
    // Determine which IDs to pre-render.
    // 1. Fetch IDs from DB (if available at build time)
    let dbIds: string[] = [];
    try {
        const { data: products } = await supabase.from('products').select('id');
        if (products) {
            dbIds = products.map((p: any) => p.id);
        }
    } catch (e) {
        console.warn('Failed to fetch products for static generation, falling back to static data only', e);
    }

    // 2. Combine with static products to ensure all are covered
    const allIds = new Set([
        ...dbIds,
        ...staticProducts.map(p => p.id)
    ]);

    return Array.from(allIds).map((id) => ({
        id: id,
    }));
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return <ProductClient id={params.id} />;
}
