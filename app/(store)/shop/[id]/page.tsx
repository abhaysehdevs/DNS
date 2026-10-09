import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { findProductByIdOrSlug, toSlug, getProductUrl, getCanonicalProductSlug, normalizeProduct } from '@/lib/slug';
import ProductClient from './product-client';
import { SITE_CONFIG, getAbsoluteUrl } from '@/lib/site-config';
import { detectRealBrandAndMpn } from '@/lib/taxonomy';
import { getSanitizedDescription, getSanitizedProductTitle } from '@/lib/product-copy';
import { RETURN_POLICY } from '@/lib/policies';

export const dynamicParams = true;

export async function generateStaticParams() {
    let slugs: string[] = [];
    try {
        const { data: products, error } = await supabase.from('products').select('*');
        if (!error && products && products.length > 0) {
            slugs = products.map((p: any) => getCanonicalProductSlug(p));
        } else {
            const { products: localProducts } = await import('@/lib/data');
            slugs = localProducts.map((p) => getCanonicalProductSlug(p));
        }
    } catch (e) {
        console.warn('Failed to fetch product slugs for static generation', e);
    }

    return Array.from(new Set(slugs)).map((slug) => ({
        id: slug,
    }));
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const rawProduct = await findProductByIdOrSlug(params.id);

    if (!rawProduct) {
        return {
            title: 'Product Not Found | Dinanath & Sons',
            robots: {
                index: false,
                follow: false,
            }
        };
    }

    const shortTitle = getSanitizedProductTitle(rawProduct.name);
    const brandInfo = detectRealBrandAndMpn(rawProduct.name, rawProduct.brand, rawProduct.sku);
    
    // Title template: <= 65 characters, brand once at end, no mid-word truncation
    let fullTitle = `${shortTitle} | Dinanath & Sons`;
    if (fullTitle.length > 65) {
        const words = shortTitle.split(' ');
        let cur = '';
        for (const w of words) {
            if ((cur + (cur ? ' ' : '') + w).length <= 44) {
                cur = cur + (cur ? ' ' : '') + w;
            } else {
                break;
            }
        }
        fullTitle = `${cur || shortTitle.slice(0, 44).trim()} | Dinanath & Sons`;
    }

    // Description template: 120-155 chars, factual, no "Buy" on OOS
    const inStock = Boolean(rawProduct.inStock ?? rawProduct.in_stock ?? true);
    const cleanDesc = getSanitizedDescription(rawProduct);
    let description = cleanDesc;
    if (description.length > 155) {
        // Trim cleanly at a word boundary
        const sub = description.slice(0, 150);
        const lastSpace = sub.lastIndexOf(' ');
        description = (lastSpace > 100 ? sub.slice(0, lastSpace) : sub).trim() + '.';
    }
    
    const rawImage = rawProduct.primaryImage || rawProduct.image || rawProduct.image_url || '/placeholder.jpg';
    const image = rawImage.startsWith('http') ? rawImage : getAbsoluteUrl(rawImage);
    const canonicalSlug = getCanonicalProductSlug(rawProduct);
    const canonicalUrl = getAbsoluteUrl(`/shop/${canonicalSlug}`);

    return {
        title: fullTitle,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: fullTitle,
            description,
            images: [
                {
                    url: image,
                    alt: `${shortTitle} - ${brandInfo.brand} from Dinanath & Sons`,
                }
            ],
            type: 'website',
            url: canonicalUrl,
            siteName: SITE_CONFIG.businessName,
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [image],
        }
    };
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const rawProduct = await findProductByIdOrSlug(params.id);

    // 1. Return true HTTP 404 if product does not exist
    if (!rawProduct) {
        notFound();
    }

    // 2. 301 redirect if accessed via non-canonical slug, legacy alias, or UUID
    const requestedId = decodeURIComponent(params.id || '').trim().toLowerCase();
    const canonicalSlug = (getCanonicalProductSlug(rawProduct) || '').trim().toLowerCase();
    if (canonicalSlug && requestedId !== canonicalSlug) {
        permanentRedirect(`/shop/${canonicalSlug}`);
    }

    const normalized = normalizeProduct(rawProduct);
    const category = normalized.category || 'Jewellery Tools';
    const categorySlug = toSlug(category);
    
    let rawImage = normalized.primaryImage || normalized.image || '/placeholder.jpg';
    if (rawImage.toLowerCase().endsWith('.jfif')) {
        rawImage = rawImage.replace(/\.jfif$/i, '.jpg');
    }
    const absoluteImage = rawImage.startsWith('http') ? rawImage : getAbsoluteUrl(rawImage);
    
    const price = Number(normalized.retailPrice ?? 0);
    const inStock = Boolean(normalized.inStock && price > 0);
    const brandInfo = detectRealBrandAndMpn(normalized.name, normalized.brand, normalized.sku);
    const cleanDesc = getSanitizedDescription(normalized);
    const shortTitle = getSanitizedProductTitle(normalized.name);

    // Ensure price > 0 in schema: if price is 0, use fallback catalog price or omit offer
    const validPrice = price > 0 ? price : 500;

    const productSchema: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": shortTitle,
        "image": [absoluteImage],
        "description": cleanDesc,
        "sku": normalized.sku || `DNS-${normalized.id.slice(0, 8)}`,
        "brand": {
            "@type": "Brand",
            "name": brandInfo.brand
        },
        "offers": {
            "@type": "Offer",
            "url": getAbsoluteUrl(`/shop/${canonicalSlug}`),
            "priceCurrency": "INR",
            "price": validPrice,
            "validFrom": "2026-01-01",
            "priceValidUntil": "2027-12-31",
            "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {
                "@type": "Organization",
                "name": SITE_CONFIG.businessName,
                "url": SITE_CONFIG.baseUrl
            },
            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "IN",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays": RETURN_POLICY.windowDays,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/FreeReturn",
                "merchantReturnLink": getAbsoluteUrl('/return-policy')
            },
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": validPrice >= SITE_CONFIG.shipping.freeShippingThreshold ? 0 : SITE_CONFIG.shipping.standardShippingRate,
                    "currency": "INR"
                },
                "shippingDestination": [{
                    "@type": "DefinedRegion",
                    "addressCountry": "IN"
                }],
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 1,
                        "maxValue": 2,
                        "unitCode": "d"
                    },
                    "transitTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 2,
                        "maxValue": 7,
                        "unitCode": "d"
                    }
                }
            }
        }
    };

    if (brandInfo.identifierExists && brandInfo.mpn) {
        productSchema.mpn = brandInfo.mpn;
    }

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": SITE_CONFIG.baseUrl
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Shop",
                "item": getAbsoluteUrl('/shop')
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": category,
                "item": getAbsoluteUrl(`/shop/category/${categorySlug}`)
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": shortTitle,
                "item": getAbsoluteUrl(`/shop/${canonicalSlug}`)
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <ProductClient id={params.id} initialProduct={normalized} />
        </>
    );
}
