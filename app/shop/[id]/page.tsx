import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import ProductClient from './product-client';

export const dynamicParams = true;
export async function generateStaticParams() {
    let dbIds: string[] = [];
    try {
        const { data: products } = await supabase.from('products').select('id');
        if (products) {
            dbIds = products.map((p: any) => p.id);
        }
    } catch (e) {
        console.warn('Failed to fetch products for static generation', e);
    }

    return dbIds.map((id) => ({
        id: id,
    }));
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const { data: product } = await supabase.from('products').select('*').eq('id', params.id).single();

    if (!product) {
        return {
            title: 'Product Not Found | Dinanath & Sons',
        };
    }

    const title = `${product.name} | Dinanath & Sons`;
    const description = product.description?.substring(0, 160) || `Buy ${product.name} at wholesale prices. Premium jewelry tools and machinery.`;
    const image = product.image || product.image_url || 'https://dinanathandsons.com/placeholder.jpg';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [image],
            type: 'website',
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
    
    // Fetch product for schema
    const { data: product } = await supabase.from('products').select('*').eq('id', params.id).single();
    
    const schema = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.image || product.image_url || 'https://dinanathandsons.com/placeholder.jpg',
        "description": product.description || `Premium ${product.name} for jewelry manufacturing.`,
        "sku": product.sku || product.id,
        "brand": {
            "@type": "Brand",
            "name": product.brand || "Dinanath & Sons"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://dinanathandsons.com/shop/${product.id}`,
            "priceCurrency": "INR",
            "price": product.retail_price || 0,
            "availability": product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    } : null;

    return (
        <>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            )}
            <ProductClient id={params.id} />
        </>
    );
}
