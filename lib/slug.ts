import { supabase } from './supabase';
import { detectRealBrandAndMpn, getNormalizedCategory } from './taxonomy';
import { getSanitizedDescription, getSanitizedProductTitle } from './product-copy';

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

// Complete legacy slug map from Google Search Console crawling reports & seed data
export const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
    // Specific GSC reported 404s & old slugs
    'graphite-crucible-70-70': 'dinanaths-graphite-crucible-1405',
    'graphite-crucible-75-75': 'dinanaths-graphite-crucible-1405',
    'dinanaths-graphite-crucible': 'dinanaths-graphite-crucible-1405',
    'e020a21b-e90e-4330-b619-f7ce9664564e': 'dinanaths-graphite-crucible-1405',
    'magnetic-polishing-machine-8-inch': 'magnetic-polishing-machine-0743',
    'marathon-m4-lab-micromotor': 'marathon-m4-lab-micromotor-4222',
    'tik-tak-silver-cleaner': 'tik-tak-silver-cleaner-9990',
    'suhaga-goti-khaar-goti': 'suhaga-goti-khaar-goti-2749',
    'lakh-bangle-choodi': 'lakh-bangle-choodi-9080',
    'metal-ear-piercing-gun-with-marking-pen-and-supporting-mirror': 'metal-ear-piercing-gun-with-marking-pen-and-supporting-mirror-3344',
    'foredom-machine-hang-up-flexible-shaft-hanging-machine': 'foredom-machine-hang-up-flexible-shaft-machine-for-multipurpose-task-carving-cutting-grinding-sanding-polishing-and-craft-work-professional-rotary-tool-with-variable-speed-contro-5584',
    '1kg-gold-silver-ingot-mould': '1kg-gold-silver-ingot-mould-3321',
    '2-in-1-manual-casting-machine': '2-in-1-manual-casting-machine-2939',
    'auto-clamp-wax-injector-with-vaccum-pump': 'auto-clamp-wax-injector-with-vaccum-pump-0837',
    'black-kasauti-gold-testing-stone-big-size': 'black-kasauti-gold-testing-stone-big-size-9772',
    'black-kasauti-gold-testing-stone-medium-size': 'black-kasauti-gold-testing-stone-medium-size-1414',
    'black-kasauti-gold-testing-stone-small-size': 'black-kasauti-gold-testing-stone-small-size-3233',
    'silver-coin-card-pack': 'silver-coin-card-pack-8046',

    '15f-precision-tweezers': 'dinanath-s-15f-stainless-steel-tweezers-1dz-3852',
    '15f-precision-tweezers-15': 'dinanath-s-15f-stainless-steel-tweezers-1dz-3852',
    't-15f-tweezers': 'dinanath-s-15f-stainless-steel-tweezers-1dz-3852',
    'dinanaths-15f-stainless-steel-tweezers-1dz': 'dinanath-s-15f-stainless-steel-tweezers-1dz-3852',
    'dinanaths-aa-tweezers': 'dinanath-s-aa-tweezers-2273',
    't-aa-tweezers': 'dinanath-s-aa-tweezers-2273',
    'red-coated-grip-tweezers': 'dinanath-s-10k-powder-coated-red-tweezer-6376',
    't-red-tweezers': 'dinanath-s-10k-powder-coated-red-tweezer-6376',
    'ss-10k-tweezers': 'dinanath-s-10k-powder-coated-stainless-steel-tweezer-2659',
    't-ss-10k': 'dinanath-s-10k-powder-coated-stainless-steel-tweezer-2659',
    'steel-nose-round-plier': 'dinanath-s-steel-nose-half-round-plier-2957',
    't-steel-nose-plier': 'dinanath-s-steel-nose-half-round-plier-2957',
    'nipper-cutter': 'dinanath-s-stainless-steel-mini-diagonal-nipper-4601',
    't-nipper-cutter': 'dinanath-s-stainless-steel-mini-diagonal-nipper-4601',
    'red-handle-plier': 'dinanath-s-black-half-round-plier-mini-9466',
    't-red-plier': 'dinanath-s-black-half-round-plier-mini-9466',
    'stainless-steel-plier': 'dinanath-s-half-round-stainless-steel-plier-9946',
    't-ss-plier': 'dinanath-s-half-round-stainless-steel-plier-9946',
    'katiya-shears': 'dinanath-s-kadi-cutting-katiya-6881',
    't-katiya': 'dinanath-s-kadi-cutting-katiya-6881',
    'sandasi-holder': 'dinanath-s-sandasi-1920',
    't-sandasi': 'dinanath-s-sandasi-1920',
    'needle-file-set': 'dinanath-s-jewellery-file-set-2152',
    't-file-set': 'dinanath-s-jewellery-file-set-2152',
    'clarion-saw-blades': 'clarion-saw-blade-1451',
    't-saw-blade': 'clarion-saw-blade-1451',
    'adjustable-saw-frame': 'jeweler-s-saw-frame-designed-for-making-intricate-cuts-in-metal-9396',
    't-saw-handle': 'jeweler-s-saw-frame-designed-for-making-intricate-cuts-in-metal-9396',
    'jewelers-saw-frame-designed-for-making-intricate-cuts-in-metal': 'jeweler-s-saw-frame-designed-for-making-intricate-cuts-in-metal-9396',
    'ring-sizing-stick': 'pn-budh-ring-stick-ring-sizer-stick-1091',
    't-ring-stick': 'pn-budh-ring-stick-ring-sizer-stick-1091',
    'ring-extender-tool': 'big-power-portable-ring-extender-machine-6014',
    't-ring-extender': 'big-power-portable-ring-extender-machine-6014',
    'heavy-duty-ring-extender': 'heavy-duty-ring-enlarger-machine-4976',
    't-ring-extender-heavy': 'heavy-duty-ring-enlarger-machine-4976',
    'ring-stretcher-machine-export-quality': 'ring-stretcher-machine-export-quality-9909',
    'big-power-portable-ring-extender-machine-double-cone': 'big-power-portable-ring-extender-machine-6014',
    'ring-expanding-machine': 'ring-expanding-machine-8818',
    'sharpening-stone': 'dinanath-s-sharping-stone-5936',
    't-sharping-stone': 'dinanath-s-sharping-stone-5936',
    'auto-ignition-gas-torch': 'dinanath-portable-gas-torch-gun-automatic-8062',
    't-gas-torch-auto': 'dinanath-portable-gas-torch-gun-automatic-8062',
    'manual-gas-torch-head': 'dinanath-portable-gas-torch-gun-manual-1562',
    't-gas-torch-manual': 'dinanath-portable-gas-torch-gun-manual-1562',
    'industrial-gas-burner': 'dinanath-s-lpg-heating-torch-burners-5534',
    't-gas-burner': 'dinanath-s-lpg-heating-torch-burners-5534',
    'dinanaths-lpg-heating-torch-burners': 'dinanath-s-lpg-heating-torch-burners-5534',
    'liquid-suhaga-flux': 'liquid-suhaga-for-jewellery-soldering-9823',
    'liquid-suhaga-for-jewellery-soldering': 'liquid-suhaga-for-jewellery-soldering-9823',
    'c-suhaga-liquid': 'liquid-suhaga-for-jewellery-soldering-9823',
    'dinanaths-brand-soldering-liquid': 'dinanath-s-brand-soldering-liquid-2643',
    'suhaga-goti-solid-borax': 'suhaga-goti-khaar-goti-2749',
    'c-suhaga-solid': 'suhaga-goti-khaar-goti-2749',
    'instant-silver-cleaner': 'tik-tak-silver-cleaner-9990',
    'c-silver-cleaner': 'tik-tak-silver-cleaner-9990',
    'tik-tak-silver-polish': 'tik-tak-silver-cleaner-9990',
    'c-tiktak-cleaner': 'tik-tak-silver-cleaner-9990',
    'butane-gas-refill': 'torch-gas-refill-7861',
    'c-gas-refill': 'torch-gas-refill-7861',
    'joint-paper-soldering-sheet': 'asbestoss-sheet-joint-per-kg-1444',
    'c-joint-paper': 'asbestoss-sheet-joint-per-kg-1444',
    'copper-alloy-balls': 'dinanath-s-copper-balls-alloy-1460',
    'c-copper-alloy': 'dinanath-s-copper-balls-alloy-1460',
    'polishing-cloth-buff': 'dinanath-s-cloth-buff-export-quality-4504',
    'c-cloth-buff': 'dinanath-s-cloth-buff-export-quality-4504',
    'sand-blast-dust-collector': 'sand-blast-media-dust-collector-machine-5339',
    'm-dust-collector': 'sand-blast-media-dust-collector-machine-5339',
    'p-coin-card': 'gold-coin-card-pack-2051',
    'jewellery-price-tags': 'jewellery-hallmark-tags-4189',
    'p-tags': 'jewellery-hallmark-tags-4189',
    'pasa-die-plate': 'dapping-block-pasa-6752',
    'p-pasa': 'dapping-block-pasa-6752',
    'kundan-box-ranihar': 'kundan-box-ranihar-3805',
    'gold-bar-1g': 'gold-bar-coin-card-pack-9060',
    '24k-gold-bar-1-gram-1': 'gold-bar-coin-card-pack-9060',
    'b-gold-bar-1g': 'gold-bar-coin-card-pack-9060',
    'gold-bar-5g': 'gold-coin-card-pack-2051',
    'b-gold-bar-5g': 'gold-coin-card-pack-2051',
    'silver-coin-20g': 'silver-coin-card-pack-8046',
    '20g-silver-coin-2': 'silver-coin-card-pack-8046',
    'b-silver-coin-20g': 'silver-coin-card-pack-8046',
};

export function getCanonicalProductSlug(product: any): string {
    if (!product) return '';
    if (product.slug) return String(product.slug).trim();
    if (product.specifications?.slug) return String(product.specifications.slug).trim();

    const baseSlug = toSlug(product.name);
    if (!baseSlug) return String(product.id || '');

    // Deterministic suffix from SKU or ID to avoid collisions
    const rawSku = product.sku || '';
    const skuDigits = String(rawSku).replace(/\D/g, '').slice(-4);
    if (skuDigits) {
        return `${baseSlug}-${skuDigits}`;
    }

    const idSuffix = product.id ? String(product.id).replace(/\D/g, '').slice(-4) : '';
    if (idSuffix) {
        return `${baseSlug}-${idSuffix}`;
    }

    return baseSlug;
}

export function getProductUrl(product: { id: string; name: string; slug?: string; specifications?: any }): string {
    if (!product) return '/shop';
    const slug = getCanonicalProductSlug(product);
    return `/shop/${slug}`;
}

export function normalizeProduct(rawProduct: any): any {
    if (!rawProduct) return null;
    const id = String(rawProduct.id || '');
    const rawName = String(rawProduct.name || '');
    const name = getSanitizedProductTitle(rawName);
    const specs = rawProduct.specifications || {};
    const slug = getCanonicalProductSlug(rawProduct);
    const image = rawProduct.image || rawProduct.image_url || rawProduct.primaryImage || '/placeholder.jpg';
    const retailPrice = Number(rawProduct.retail_price ?? rawProduct.retailPrice ?? 0);
    const wholesalePrice = rawProduct.wholesale_price !== undefined ? Number(rawProduct.wholesale_price) : (rawProduct.wholesalePrice !== undefined ? Number(rawProduct.wholesalePrice) : undefined);
    const wholesaleMOQ = Number(rawProduct.wholesale_moq ?? rawProduct.wholesaleMOQ ?? 1);
    const inStock = rawProduct.in_stock !== undefined ? Boolean(rawProduct.in_stock && retailPrice > 0) : (rawProduct.inStock !== undefined ? Boolean(rawProduct.inStock && retailPrice > 0) : retailPrice > 0);

    // Normalize SKU (fix MiniCraft null/UUID SKU)
    let sku = rawProduct.sku;
    if (!sku || sku === 'null' || sku.length > 20) {
        sku = name.includes('MiniCraft') ? 'DNS-MINI01' : ('DNS-' + id.replace(/[^0-9]/g, '').slice(-6));
    }

    // Category & Brand Normalization
    const category = getNormalizedCategory({ name, category: rawProduct.category, sku });
    const brandInfo = detectRealBrandAndMpn(name, rawProduct.brand, sku);
    const description = getSanitizedDescription({ sku, id, name, category, description: rawProduct.description });

    let variantsList: any[] = [];
    if (Array.isArray(rawProduct.variants)) {
        variantsList = rawProduct.variants;
    } else if (typeof rawProduct.variants === 'string' && rawProduct.variants.trim()) {
        try {
            const parsed = JSON.parse(rawProduct.variants);
            if (Array.isArray(parsed)) variantsList = parsed;
        } catch (e) {}
    } else if (rawProduct.specifications?.variants) {
        if (Array.isArray(rawProduct.specifications.variants)) {
            variantsList = rawProduct.specifications.variants;
        } else if (typeof rawProduct.specifications.variants === 'string') {
            try {
                const parsed = JSON.parse(rawProduct.specifications.variants);
                if (Array.isArray(parsed)) variantsList = parsed;
            } catch (e) {}
        }
    }

    // Clean specifications from SEO keys and banned boilerplate
    const cleanSpecs: Record<string, string> = {
        Brand: brandInfo.brand,
        Category: category,
        ...(brandInfo.mpn ? { Model: brandInfo.mpn } : {}),
        ...(rawProduct.weight ? { Weight: String(rawProduct.weight) } : {}),
        ...(rawProduct.warranty_info || rawProduct.warrantyInfo ? { Warranty: String(rawProduct.warranty_info || rawProduct.warrantyInfo) } : {}),
        "Dispatch Time": "24–48 Hours",
        "Country of Origin": "India",
    };

    const SEO_RESERVED = new Set(['slug', 'seo_title', 'seo_description', 'seo_keywords', 'meta_title', 'meta_description', 'variants', 'material', 'durability', 'application']);
    if (specs && typeof specs === 'object') {
        for (const [k, v] of Object.entries(specs)) {
            const lowerK = k.toLowerCase().trim();
            if (!SEO_RESERVED.has(lowerK) && typeof v === 'string' && v.trim()) {
                cleanSpecs[k] = v.trim();
            }
        }
    }

    // Strip .jfif images from gallery
    const rawGallery = (rawProduct.gallery && rawProduct.gallery.length > 0)
        ? rawProduct.gallery
        : [{ id: '1', type: 'image', url: image }];
    const gallery = rawGallery.filter((g: any) => !String(g.url || '').toLowerCase().includes('.jfif'));

    return {
        id,
        name,
        slug,
        description,
        retailPrice,
        wholesalePrice,
        wholesaleMOQ,
        primaryImage: image,
        image,
        image_url: image,
        videoUrl: rawProduct.video_url || rawProduct.videoUrl,
        gallery,
        category,
        inStock,
        in_stock: inStock,
        quantity: rawProduct.quantity !== undefined && rawProduct.quantity !== null ? rawProduct.quantity : 15,
        reviews: [], // Only real reviews allowed per ground rules
        brand: brandInfo.brand,
        modelNumber: brandInfo.mpn || rawProduct.model_number || rawProduct.modelNumber || undefined,
        sku,
        weight: rawProduct.weight,
        dimensions: rawProduct.dimensions,
        warrantyInfo: rawProduct.warranty_info || rawProduct.warrantyInfo,
        features: rawProduct.features || [],
        specifications: cleanSpecs,
        variants: variantsList,
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
    const targetsToTry = Array.from(new Set([mappedTarget, cleanId]));
    
    try {
        // 1. Try Supabase exact ID
        for (const target of targetsToTry) {
            const { data: byId } = await supabase.from('products').select('*').eq('id', target).maybeSingle();
            if (byId) {
                return normalizeProduct(byId);
            }
        }

        // 2. Try Supabase slug column
        for (const target of targetsToTry) {
            const { data: bySlug } = await supabase.from('products').select('*').eq('slug', target).maybeSingle();
            if (bySlug) {
                return normalizeProduct(bySlug);
            }
        }

        // 3. Try Supabase specifications->>slug
        for (const target of targetsToTry) {
            const { data: bySpecsSlug } = await supabase
                .from('products')
                .select('*')
                .filter('specifications->>slug', 'eq', target)
                .maybeSingle();

            if (bySpecsSlug) {
                return normalizeProduct(bySpecsSlug);
            }
        }

        // 4. Try Supabase SKU matching
        for (const target of targetsToTry) {
            const { data: bySku } = await supabase
                .from('products')
                .select('*')
                .ilike('sku', target)
                .maybeSingle();

            if (bySku) {
                return normalizeProduct(bySku);
            }
        }
    } catch (e) {
        console.warn('Database lookup failed, falling back to local catalog:', e);
    }

    // 5. Fallback to clean local catalog
    const { products: localCatalog } = await import('./data');
    for (const target of targetsToTry) {
        const found = localCatalog.find(
            (p) => 
                p.id.toLowerCase() === target ||
                (p.slug && p.slug.toLowerCase() === target) ||
                (p.sku && p.sku.toLowerCase() === target) ||
                (p.specifications?.slug && p.specifications.slug.toLowerCase() === target) ||
                toSlug(p.name) === target
        );
        if (found) {
            return normalizeProduct(found);
        }
    }

    return null;
}
