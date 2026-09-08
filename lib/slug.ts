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

export function normalizeProduct(rawProduct: any): any {
    if (!rawProduct) return null;
    const id = String(rawProduct.id || '');
    const name = String(rawProduct.name || '');
    const slug = rawProduct.slug || toSlug(name) || id;
    const image = rawProduct.image || rawProduct.image_url || rawProduct.primaryImage || '/placeholder.jpg';
    const retailPrice = Number(rawProduct.retail_price ?? rawProduct.retailPrice ?? 0);
    const wholesalePrice = rawProduct.wholesale_price !== undefined ? Number(rawProduct.wholesale_price) : (rawProduct.wholesalePrice !== undefined ? Number(rawProduct.wholesalePrice) : undefined);
    const wholesaleMOQ = Number(rawProduct.wholesale_moq ?? rawProduct.wholesaleMOQ ?? 1);
    const inStock = rawProduct.in_stock !== undefined ? Boolean(rawProduct.in_stock) : (rawProduct.inStock !== undefined ? Boolean(rawProduct.inStock) : true);
    
    return {
        id,
        name,
        slug,
        description: rawProduct.description || '',
        retailPrice,
        wholesalePrice,
        wholesaleMOQ,
        primaryImage: image,
        image,
        image_url: image,
        videoUrl: rawProduct.video_url || rawProduct.videoUrl,
        gallery: (rawProduct.gallery && rawProduct.gallery.length > 0) ? rawProduct.gallery : [{ id: '1', type: 'image', url: image }],
        category: rawProduct.category || 'Tools',
        inStock,
        in_stock: inStock,
        quantity: rawProduct.quantity !== undefined && rawProduct.quantity !== null ? rawProduct.quantity : 15,
        reviews: rawProduct.reviews || [],
        brand: rawProduct.brand || "Dinanath & Sons",
        modelNumber: rawProduct.model_number || rawProduct.modelNumber,
        sku: rawProduct.sku || id,
        weight: rawProduct.weight,
        dimensions: rawProduct.dimensions,
        warrantyInfo: rawProduct.warranty_info || rawProduct.warrantyInfo,
        features: rawProduct.features || [],
        specifications: rawProduct.specifications || {},
        variants: rawProduct.variants || [],
        variantType: rawProduct.variant_type || rawProduct.variantType,
        seo_title: rawProduct.seo_title || rawProduct.seoTitle,
        seo_description: rawProduct.seo_description || rawProduct.seoDescription,
        retail_price: retailPrice,
        wholesale_price: wholesalePrice,
        wholesale_moq: wholesaleMOQ,
    };
}

export async function findProductByIdOrSlug(idOrSlug: string): Promise<any> {
    if (!idOrSlug) return null;
    
    try {
        // 1. Try Supabase exact ID
        const { data: byId } = await supabase.from('products').select('*').eq('id', idOrSlug).maybeSingle();
        if (byId) return normalizeProduct(byId);

        // 2. Try Supabase exact slug
        const { data: bySlug } = await supabase.from('products').select('*').eq('slug', idOrSlug).maybeSingle();
        if (bySlug) return normalizeProduct(bySlug);

        // 3. Query DB products and match by generated toSlug(name)
        const { data: allDb } = await supabase.from('products').select('*');
        if (allDb && allDb.length > 0) {
            const found = allDb.find((p: any) => toSlug(p.name) === idOrSlug || p.id === idOrSlug || p.slug === idOrSlug);
            if (found) return normalizeProduct(found);
        }
    } catch (err) {
        console.warn('Error querying product by slug:', err);
    }

    // 4. Fallback to local catalog in lib/data
    const { products: localProducts } = await import('./data');
    const local = localProducts.find(p => p.id === idOrSlug || toSlug(p.name) === idOrSlug || (p as any).slug === idOrSlug);
    return local ? normalizeProduct(local) : null;
}

