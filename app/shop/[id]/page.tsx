import { supabase } from '@/lib/supabase';
import ProductClient from './product-client';

export const dynamicParams = true;
export async function generateStaticParams() {
    let dbIds: string[] = [];
    try {
        const { data: products } = await supabase.from('products').select('id');
        if (products) {
            dbIds = products.map((p: any) => p.id);
        }
    } catch (e) {
        console.warn('Failed to fetch products for static generation', e);
    }

    return dbIds.map((id) => ({
        id: id,
    }));
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return <ProductClient id={params.id} />;
}
