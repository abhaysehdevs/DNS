import { supabase } from './supabase';

export function toSlug(text: string): string {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-') // Replace spaces & underscores with -
        .replace(/[^\w\-]+/g, '') // Remove non-word chars except -
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start
        .replace(/-+$/, ''); // Trim - from end
}

export function getProductUrl(product: { id: string; name: string; slug?: string }): string {
    if (!product) return '/shop';
    const slug = product.slug || toSlug(product.name) || product.id;
    return `/shop/${slug}`;
}

export async function findProductByIdOrSlug(idOrSlug: string): Promise<any> {
    if (!idOrSlug) return null;
    
    try {
        // 1. Try Supabase exact ID
        const { data: byId } = await supabase.from('products').select('*').eq('id', idOrSlug).maybeSingle();
        if (byId) return byId;

        // 2. Try Supabase exact slug
        const { data: bySlug } = await supabase.from('products').select('*').eq('slug', idOrSlug).maybeSingle();
        if (bySlug) return bySlug;

        // 3. Query DB products and match by generated toSlug(name)
        const { data: allDb } = await supabase.from('products').select('*');
        if (allDb && allDb.length > 0) {
            const found = allDb.find((p: any) => toSlug(p.name) === idOrSlug || p.id === idOrSlug);
            if (found) return found;
        }
    } catch (err) {
        console.warn('Error querying product by slug:', err);
    }

    // 4. Fallback to local catalog in lib/data
    const { products: localProducts } = await import('./data');
    return localProducts.find(p => p.id === idOrSlug || toSlug(p.name) === idOrSlug) || null;
}
