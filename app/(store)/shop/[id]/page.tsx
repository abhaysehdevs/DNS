import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { findProductByIdOrSlug, toSlug, getProductUrl } from '@/lib/slug';
import ProductClient from './product-client';

export const dynamicParams = true;

export async function generateStaticParams() {
    let slugs: string[] = [];
    try {
        const { data: products, error } = await supabase.from('products').select('*');
        if (!error && products && products.length > 0) {
            slugs = products.map((p: any) => p.slug || p.specifications?.slug || toSlug(p.name) || p.id);
        } else {
            const { products: localProducts } = await import('@/lib/data');
            slugs = localProducts.map((p) => toSlug(p.name) || p.id);
        }
    } catch (e) {
        console.warn('Failed to fetch product slugs for static generation', e);
    }

    return slugs.map((slug) => ({
        id: slug,
    }));
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const rawProduct = await findProductByIdOrSlug(params.id);

    if (!rawProduct) {
        return {
            title: 'Product Not Found | Dinanath & Sons',
        };
    }

    const category = rawProduct.category || 'Jewellery Tools';
    const title = (rawProduct as any).seo_title || `${rawProduct.name} | ${category} | Dinanath & Sons`;
    const description = (rawProduct as any).seo_description || 
        (rawProduct.description ? `${rawProduct.description.slice(0, 140)}... Buy at Dinanath & Sons.` : `Buy ${rawProduct.name} at Dinanath & Sons. Professional ${category.toLowerCase()} for goldsmiths and jewellery manufacturing workshops.`);
    
    const rawImage = rawProduct.primaryImage || rawProduct.image || rawProduct.image_url || '/placeholder.jpg';
    const image = rawImage.startsWith('http') ? rawImage : `https://dinanathandsons.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
    const canonicalUrl = `https://dinanathandsons.com${getProductUrl(rawProduct)}`;

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

    const category = rawProduct?.category || 'Jewellery Tools';
    const categorySlug = toSlug(category);
    const rawImage = rawProduct?.primaryImage || rawProduct?.image || rawProduct?.image_url || '/placeholder.jpg';
    const absoluteImage = rawImage.startsWith('http') ? rawImage : `https://dinanathandsons.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
    const price = Number(rawProduct?.retailPrice ?? rawProduct?.retail_price ?? 0);
    const inStock = Boolean(rawProduct?.inStock ?? rawProduct?.in_stock ?? true);

    const productSchema = rawProduct ? {
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
    } : null;

    const breadcrumbSchema = rawProduct ? {
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
    } : null;

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
