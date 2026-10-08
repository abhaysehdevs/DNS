import { supabase } from '@/lib/supabase';
import { getCanonicalProductSlug, normalizeProduct } from '@/lib/slug';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function escapeXml(str: string | undefined | null): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function cleanCdata(str: string | undefined | null): string {
    if (!str) return '';
    return String(str).replace(/\]\]>/g, ']]]]><![CDATA[>');
}

function getGoogleCategory(cat: string): string {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('machin')) return 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Workshop Machinery';
    if (lower.includes('chemical') || lower.includes('flux')) return 'Business & Industrial > Science & Laboratory > Laboratory Chemicals';
    if (lower.includes('consumable') || lower.includes('polish') || lower.includes('buff')) return 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Polishing & Finishing';
    if (lower.includes('packaging') || lower.includes('card') || lower.includes('tag')) return 'Business & Industrial > Retail > Jewelry Packaging & Display';
    if (lower.includes('bullion') || lower.includes('gold') || lower.includes('silver')) return 'Apparel & Accessories > Jewelry > Bullion & Coins';
    if (lower.includes('cast') || lower.includes('crucible')) return 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Metal Casting Supplies';
    return 'Business & Industrial > Manufacturing > Metalworking & Metallurgy > Jewelry Making Tools';
}

export async function GET() {
    const baseUrl = 'https://dinanathandsons.com';

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

    const itemsXml = products.map((product) => {
        const slug = getCanonicalProductSlug(product);
        const prodUrl = `${baseUrl}/shop/${slug}`;
        const rawImg = product.image || product.primaryImage || '/placeholder.jpg';
        const imgUrl = rawImg.startsWith('http') ? rawImg : `${baseUrl}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
        const price = Number(product.retailPrice || 0);
        const inStock = Boolean(product.inStock && price > 0);
        const availability = inStock ? 'in_stock' : 'out_of_stock';
        const sku = product.sku || product.id;
        const brand = product.brand || 'Dinanath & Sons';
        const category = product.category || 'Jewellery Tools';
        const googleCat = getGoogleCategory(category);
        const desc = product.description || `Professional ${product.name} for jewelry manufacturing and goldsmith workshops.`;
        const mpn = product.modelNumber || sku;

        // Extra gallery images
        const additionalImagesXml = (product.gallery || [])
            .filter((g: any) => g.url && g.url !== rawImg && g.type === 'image')
            .map((g: any) => g.url.startsWith('http') ? g.url : `${baseUrl}${g.url.startsWith('/') ? '' : '/'}${g.url}`)
            .slice(0, 5)
            .map((url: string) => `      <g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`)
            .join('\n');

        return `    <item>
      <g:id>${escapeXml(sku)}</g:id>
      <g:title><![CDATA[${cleanCdata(product.name)}]]></g:title>
      <g:description><![CDATA[${cleanCdata(desc)}]]></g:description>
      <g:link>${escapeXml(prodUrl)}</g:link>
      <g:image_link>${escapeXml(imgUrl)}</g:image_link>
${additionalImagesXml ? additionalImagesXml + '\n' : ''}      <g:availability>${availability}</g:availability>
      <g:price>${price.toFixed(2)} INR</g:price>
      <g:brand><![CDATA[${cleanCdata(brand)}]]></g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category><![CDATA[${cleanCdata(googleCat)}]]></g:google_product_category>
      <g:product_type><![CDATA[${cleanCdata(category)}]]></g:product_type>
      <g:mpn><![CDATA[${cleanCdata(mpn)}]]></g:mpn>
      <g:identifier_exists>yes</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
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
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
    });
}
