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

// Complete legacy slug map from Google Search Console crawling reports
export const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
    // 31 legacy slugs from GSC "Discovered - currently not indexed"
    '15f-precision-tweezers': 't-15f-tweezers',
    'adjustable-saw-frame': 'jeweler-s-saw-frame-designed-for-making-intricate-cuts-in-metal-9396',
    'auto-ignition-gas-torch': 't-gas-torch-auto',
    'butane-gas-refill': 'c-gas-refill',
    'clarion-saw-blades': 'clarion-saw-blade-1451',
    'dinanaths-aa-tweezers': 'dinanath-s-aa-tweezers-2273',
    'gold-bar-1g': 'b-gold-bar-1g',
    'gold-bar-5g': 'b-gold-bar-5g',
    'heavy-duty-ring-extender': 'heavy-duty-ring-enlarger-machine-4976',
    'industrial-gas-burner': 't-gas-burner',
    'instant-silver-cleaner': 'c-silver-cleaner',
    'jewellery-price-tags': 'p-tags',
    'joint-paper-soldering-sheet': 'c-joint-paper',
    'katiya-shears': 't-katiya',
    'liquid-suhaga-flux': 'c-suhaga-liquid',
    'manual-gas-torch-head': 't-gas-torch-manual',
    'needle-file-set': 't-file-set',
    'pasa-die-plate': 'p-pasa',
    'polishing-cloth-buff': 'c-cloth-buff',
    'red-coated-grip-tweezers': 'dinanath-s-10k-powder-coated-red-tweezer-6376',
    'red-handle-plier': 't-red-plier',
    'ring-extender-tool': 'big-power-portable-ring-extender-machine-6014',
    'ring-sizing-stick': 't-ring-stick',
    'sand-blast-dust-collector': 'm-dust-collector',
    'sandasi-holder': 't-sandasi',
    'sharpening-stone': 't-sharping-stone',
    'silver-coin-20g': 'b-silver-coin-20g',
    'stainless-steel-plier': 'dinanath-s-half-round-stainless-steel-plier-9946',
    'steel-nose-round-plier': 't-steel-nose-plier',
    'suhaga-goti-solid-borax': 'c-suhaga-solid',
    'tik-tak-silver-polish': 'c-tiktak-cleaner',
    
    // Alternate URLs from GSC "Alternate page with proper canonical tag"
    'liquid-suhaga-for-jewellery-soldering': 'c-suhaga-liquid',
    'dinanaths-lpg-heating-torch-burners': 't-gas-burner',
    'ring-expanding-machine': 'ring-expanding-machine-6032',
    'ring-stretcher-machine-export-quality': 'heavy-duty-ring-enlarger-machine-4976',
    'big-power-portable-ring-extender-machine-double-cone': 'big-power-portable-ring-extender-machine-6014',
    'kundan-box-ranihar': 'kundan-set-box-kwality-77-5569',
    'dinanaths-15f-stainless-steel-tweezers-1dz': 't-15f-tweezers',
    'dinanaths-brand-soldering-liquid': 'c-suhaga-liquid',
    'silver-coin-card-pack': 'p-coin-card',
    'nipper-cutter': 't-nipper-cutter',
    'copper-alloy-balls': 'c-copper-alloy',
    'ss-10k-tweezers': 't-ss-10k',
    'black-kasauti-gold-testing-stone-small-size': 't-sharping-stone',
    'jewelers-saw-frame-designed-for-making-intricate-cuts-in-metal': 'jeweler-s-saw-frame-designed-for-making-intricate-cuts-in-metal-9396',
};

export function getCanonicalProductSlug(product: any): string {
    if (!product) return '';
    return product.slug || product.specifications?.slug || toSlug(product.name) || String(product.id);
}

export function getProductUrl(product: { id: string; name: string; slug?: string; specifications?: any }): string {
    if (!product) return '/shop';
    const slug = getCanonicalProductSlug(product);
    return `/shop/${slug}`;
}

export function normalizeProduct(rawProduct: any): any {
    if (!rawProduct) return null;
    const id = String(rawProduct.id || '');
    const name = String(rawProduct.name || '');
    const specs = rawProduct.specifications || {};
    const slug = getCanonicalProductSlug(rawProduct);
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
        specifications: specs,
        variants: rawProduct.variants || [],
        variantType: rawProduct.variant_type || rawProduct.variantType || 'Size',
        seo_title: rawProduct.seo_title || rawProduct.meta_title || specs.seo_title || rawProduct.seoTitle,
        seo_description: rawProduct.seo_description || rawProduct.meta_description || specs.seo_description || rawProduct.seoDescription,
        seo_keywords: rawProduct.seo_keywords || specs.seo_keywords || rawProduct.seoKeywords,
        retail_price: retailPrice,
        wholesale_price: wholesalePrice,
        wholesale_moq: wholesaleMOQ,
    };
}

export async function findProductByIdOrSlug(idOrSlug: string): Promise<any> {
    if (!idOrSlug) return null;
    const cleanId = decodeURIComponent(idOrSlug).toLowerCase().trim();
    
    // Check for alias/legacy slug rewrite
    const mappedTarget = LEGACY_SLUG_REDIRECTS[cleanId] || cleanId;
    const targetsToTry = [mappedTarget, cleanId];
    
    try {
        // 1. Try Supabase exact ID
        for (const target of targetsToTry) {
            const { data: byId } = await supabase.from('products').select('*').eq('id', target).maybeSingle();
            if (byId) return normalizeProduct(byId);
        }

        // 2. Try Supabase exact slug
        for (const target of targetsToTry) {
            try {
                const { data: bySlug, error: slugErr } = await supabase.from('products').select('*').eq('slug', target).maybeSingle();
                if (!slugErr && bySlug) return normalizeProduct(bySlug);
            } catch (e) {
                // Slug column might not exist
            }
        }

        // 3. Query DB products and match by specifications.slug, slug, generated toSlug(name), or id
        const { data: allDb } = await supabase.from('products').select('*');
        if (allDb && allDb.length > 0) {
            for (const target of targetsToTry) {
                const found = allDb.find((p: any) => 
                    p.id === target ||
                    p.slug === target ||
                    p.specifications?.slug === target ||
                    toSlug(p.name) === target ||
                    (p.specifications?.slug && toSlug(p.specifications.slug) === target)
                );
                if (found) return normalizeProduct(found);
            }
        }
    } catch (err) {
        console.warn('Error querying product by slug:', err);
    }

    // 4. Fallback to local catalog in lib/data
    try {
        const { products: localProducts } = await import('./data');
        for (const target of targetsToTry) {
            const local = localProducts.find(p => 
                p.id === target || 
                toSlug(p.name) === target || 
                (p as any).slug === target ||
                (p as any).specifications?.slug === target
            );
            if (local) return normalizeProduct(local);
        }
    } catch (err) {
        console.warn('Error querying local products:', err);
    }

    return null;
}
