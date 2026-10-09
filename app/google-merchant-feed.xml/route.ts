import { supabase } from '@/lib/supabase';
import { getCanonicalProductSlug, normalizeProduct } from '@/lib/slug';
import { SITE_CONFIG } from '@/lib/site-config';
import { 
    detectRealBrandAndMpn, 
    getGoogleProductCategory, 
    isExcludedFromMerchantCenter 
} from '@/lib/taxonomy';
import { 
    getSanitizedDescription, 
    getSanitizedProductTitle 
} from '@/lib/product-copy';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function escapeXml(str: string | undefined | null): string {
    if (!str) return '';
    return String(str)
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Strip zero-width spaces/joiners
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function cleanCdata(str: string | undefined | null): string {
    if (!str) return '';
    return String(str)
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\]\]>/g, ']]]]><![CDATA[>');
}

export async function GET() {
    const baseUrl = SITE_CONFIG.baseUrl;

    let products: any[] = [];
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
            products = data.map((p: any) => normalizeProduct(p));
        } else {
            const { products: localProducts } = await import('@/lib/data');
            products = localProducts.map((p: any) => normalizeProduct(p));
        }
    } catch (e) {
        console.error('Error querying products for Google Merchant Center XML feed:', e);
        const { products: localProducts } = await import('@/lib/data');
        products = localProducts.map((p: any) => normalizeProduct(p));
    }

    // Filter products: MUST be eligible for Merchant Center (P0-1, P0-2, P0-9, Workstream G)
    const eligibleProducts = products.filter(product => {
        const check = isExcludedFromMerchantCenter(product);
        return !check.excluded;
    });

    const itemsXml = eligibleProducts.map((product) => {
        const slug = getCanonicalProductSlug(product);
        const prodUrl = `${baseUrl}/shop/${slug}`;
        
        // Image validation (exclude .jfif per P1-11)
        let rawImg = product.image || product.primaryImage || '/placeholder.jpg';
        if (rawImg.toLowerCase().endsWith('.jfif')) {
            rawImg = rawImg.replace(/\.jfif$/i, '.jpg');
        }
        const imgUrl = rawImg.startsWith('http') ? rawImg : `${baseUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
        
        const price = Number(product.retailPrice || 0);
        const inStock = Boolean(product.inStock && price > 0);
        const availability = inStock ? 'in_stock' : 'out_of_stock';
        
        // SKU & ID stability
        let sku = product.sku || product.id;
        if (sku && sku.length > 20 && sku.includes('-')) {
            // Replace long UUID with DNS scheme if minicraft or similar
            if ((product.name || '').toLowerCase().includes('minicraft')) {
                sku = 'DNS-MINI01';
            }
        }

        // Real brand and MPN detection (P0-8, P0-9)
        const brandInfo = detectRealBrandAndMpn(product.name, product.brand, sku);
        const cleanTitle = getSanitizedProductTitle(product.name);
        const cleanDesc = getSanitizedDescription(product);
        
        // Official Google Product Category & Breadcrumb product type
        const gpc = getGoogleProductCategory(product);
        const breadcrumbType = `Jewellery Tools > ${product.category || 'Tools'}`;
        
        // Weight and shipping label categorization (P0-4, Workstream G.12)
        const isMachinery = (product.category || '').toLowerCase().includes('machin') ||
            (product.name || '').toLowerCase().includes('rolling mill') ||
            (product.name || '').toLowerCase().includes('water jet') ||
            (product.name || '').toLowerCase().includes('dust collector') ||
            (product.name || '').toLowerCase().includes('casting machine') ||
            price >= 20000;
        
        const shippingLabel = isMachinery ? 'heavy_freight' : 'parcel';
        const shippingWeight = isMachinery ? '25.00 kg' : '0.75 kg';

        // Additional gallery images (exclude duplicates and .jfif)
        const additionalImagesXml = (product.gallery || [])
            .filter((g: any) => g && g.url && g.url !== rawImg && g.type === 'image' && !g.url.toLowerCase().endsWith('.jfif'))
            .map((g: any) => g.url.startsWith('http') ? g.url : `${baseUrl}${g.url.startsWith('/') ? '' : '/'}${g.url}`)
            .slice(0, 5)
            .map((url: string) => `      <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`)
            .join('\n');

        // MPN & identifier_exists tags
        const identifierXml = brandInfo.identifierExists && brandInfo.mpn
            ? `      <g:mpn><![CDATA[${cleanCdata(brandInfo.mpn)}]]></g:mpn>\n      <g:identifier_exists>yes</g:identifier_exists>`
            : `      <g:identifier_exists>no</g:identifier_exists>`;

        return `    <item>
      <g:id>${escapeXml(sku)}</g:id>
      <g:title><![CDATA[${cleanCdata(cleanTitle)}]]></g:title>
      <g:description><![CDATA[${cleanCdata(cleanDesc)}]]></g:description>
      <g:link>${escapeXml(prodUrl)}</g:link>
      <g:image_link>${escapeXml(imgUrl)}</g:image_link>
${additionalImagesXml ? additionalImagesXml + '\n' : ''}      <g:availability>${availability}</g:availability>
      <g:price>${price.toFixed(2)} INR</g:price>
      <g:brand><![CDATA[${cleanCdata(brandInfo.brand)}]]></g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category><![CDATA[${cleanCdata(gpc.path)}]]></g:google_product_category>
      <g:product_type><![CDATA[${cleanCdata(breadcrumbType)}]]></g:product_type>
${identifierXml}
      <g:shipping_label>${shippingLabel}</g:shipping_label>
      <g:shipping_weight>${shippingWeight}</g:shipping_weight>
    </item>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Dinanath &amp; Sons - Google Merchant Center Product Feed</title>
    <link>${baseUrl}</link>
    <description>Official Google Merchant Center Product Data Feed for Dinanath &amp; Sons (Jewellery Tools, Machinery, and Workshop Consumables).</description>
${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
    });
}
