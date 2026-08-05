import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { findProductByIdOrSlug, toSlug, getProductUrl } from '@/lib/slug';
import ProductClient from './product-client';

export const dynamicParams = true;

export async function generateStaticParams() {
    let slugs: string[] = [];
    try {
        const { data: products } = await supabase.from('products').select('id, name, slug');
        if (products && products.length > 0) {
            slugs = products.map((p: any) => p.slug || toSlug(p.name) || p.id);
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

    const title = `${rawProduct.name} | Dinanath & Sons`;
    const description = rawProduct.description?.substring(0, 160) || `Buy ${rawProduct.name} at wholesale prices. Premium jewelry tools and machinery.`;
    const image = rawProduct.image || rawProduct.image_url || 'https://dinanathandsons.com/placeholder.jpg';
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
                    alt: rawProduct.name,
                }
            ],
            type: 'website',
            url: canonicalUrl,
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

    const productSchema = rawProduct ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": rawProduct.name,
        "image": rawProduct.image || rawProduct.image_url || 'https://dinanathandsons.com/placeholder.jpg',
        "description": rawProduct.description || `Premium ${rawProduct.name} for jewelry manufacturing.`,
        "sku": rawProduct.sku || rawProduct.id,
        "brand": {
            "@type": "Brand",
            "name": rawProduct.brand || "Dinanath & Sons"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://dinanathandsons.com${getProductUrl(rawProduct)}`,
            "priceCurrency": "INR",
            "price": rawProduct.retail_price || 0,
            "priceValidUntil": "2027-12-31",
            "availability": rawProduct.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
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
            <ProductClient id={params.id} />
        </>
    );
}
