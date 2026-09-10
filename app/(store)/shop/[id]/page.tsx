import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { findProductByIdOrSlug, toSlug, getProductUrl, getCanonicalProductSlug } from '@/lib/slug';
import ProductClient from './product-client';

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

    const category = rawProduct.category || 'Jewellery Tools';
    const title = (rawProduct as any).seo_title || `${rawProduct.name} | ${category} | Dinanath & Sons`;
    const description = (rawProduct as any).seo_description || 
        (rawProduct.description ? `${rawProduct.description.slice(0, 140)}... Buy at Dinanath & Sons.` : `Buy ${rawProduct.name} at Dinanath & Sons. Professional ${category.toLowerCase()} for goldsmiths and jewellery manufacturing workshops.`);
    
    const rawImage = rawProduct.primaryImage || rawProduct.image || rawProduct.image_url || '/placeholder.jpg';
    const image = rawImage.startsWith('http') ? rawImage : `https://dinanathandsons.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
    const canonicalSlug = getCanonicalProductSlug(rawProduct);
    const canonicalUrl = `https://dinanathandsons.com/shop/${canonicalSlug}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image,
                    alt: `${rawProduct.name} - ${category} from Dinanath & Sons`,
                }
            ],
            type: 'website',
            url: canonicalUrl,
            siteName: 'Dinanath & Sons'
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        }
    };
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const rawProduct = await findProductByIdOrSlug(params.id);

    // 1. GSC Soft 404 fix: Return true HTTP 404 if product does not exist
    if (!rawProduct) {
        notFound();
    }

    // 2. GSC Alternate page with proper canonical tag fix:
    // If accessed via UUID, legacy alias slug, or alternate casing, permanently 301 redirect to canonical slug URL
    const requestedId = decodeURIComponent(params.id || '').trim().toLowerCase();
    const canonicalSlug = (getCanonicalProductSlug(rawProduct) || '').trim().toLowerCase();
    if (canonicalSlug && requestedId !== canonicalSlug) {
        permanentRedirect(`/shop/${canonicalSlug}`);
    }

    const category = rawProduct.category || 'Jewellery Tools';
    const categorySlug = toSlug(category);
    const rawImage = rawProduct.primaryImage || rawProduct.image || rawProduct.image_url || '/placeholder.jpg';
    const absoluteImage = rawImage.startsWith('http') ? rawImage : `https://dinanathandsons.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
    const price = Number(rawProduct.retailPrice ?? rawProduct.retail_price ?? 0);
    const inStock = Boolean(rawProduct.inStock ?? rawProduct.in_stock ?? true);

    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": rawProduct.name,
        "image": absoluteImage,
        "description": rawProduct.description || `Professional ${rawProduct.name} for jewelry manufacturing and goldsmith workshops.`,
        "sku": rawProduct.sku || rawProduct.id,
        "brand": {
            "@type": "Brand",
            "name": rawProduct.brand || "Dinanath & Sons"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://dinanathandsons.com${getProductUrl(rawProduct)}`,
            "priceCurrency": "INR",
            "price": price,
            "priceValidUntil": "2027-12-31",
            "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {
                "@type": "Organization",
                "name": "Dinanath & Sons",
                "url": "https://dinanathandsons.com"
            },
            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "IN",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays": 7,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/FreeReturn"
            },
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": 0,
                    "currency": "INR"
                },
                "shippingDestination": [{
                    "@type": "DefinedRegion",
                    "addressCountry": "IN"
                }]
            }
        },
        ...(rawProduct.reviews && rawProduct.reviews.length > 0 ? {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": (rawProduct.reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / rawProduct.reviews.length).toFixed(1),
                "reviewCount": rawProduct.reviews.length
            }
        } : {})
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://dinanathandsons.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Shop",
                "item": "https://dinanathandsons.com/shop"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": category,
                "item": `https://dinanathandsons.com/shop/category/${categorySlug}`
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": rawProduct.name,
                "item": `https://dinanathandsons.com${getProductUrl(rawProduct)}`
            }
        ]
    };

    return (
        <>
            {productSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
                />
            )}
            {breadcrumbSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            )}
            <ProductClient id={params.id} initialProduct={rawProduct} />
        </>
    );
}
