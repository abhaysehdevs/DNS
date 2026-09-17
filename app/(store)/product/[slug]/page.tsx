import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { findProductByIdOrSlug, getCanonicalProductSlug } from '@/lib/slug';
import ProductClient from '@/app/(store)/shop/[id]/product-client';

export const dynamicParams = true;

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const rawProduct = await findProductByIdOrSlug(params.slug);

    if (!rawProduct) {
        return {
            title: 'Product Not Found',
            robots: { index: false, follow: false }
        };
    }

    const category = rawProduct.category || 'Jewellery Tools';
    let baseTitle = rawProduct.seo_title || `${rawProduct.name} | ${category}`;
    baseTitle = baseTitle.replace(/\s*\|\s*Dinanath\s*&\s*Sons.*$/i, '').trim();

    const rawDesc = rawProduct.seo_description || rawProduct.description || '';
    const description = rawDesc 
        ? (rawDesc.length > 155 ? `${rawDesc.slice(0, 152).trim()}...` : rawDesc)
        : `Buy ${rawProduct.name} at Dinanath & Sons. Professional ${category.toLowerCase()} for goldsmiths and manufacturing workshops. Pan-India delivery.`;

    const rawImage = rawProduct.primaryImage || rawProduct.image || '/placeholder.jpg';
    const image = rawImage.startsWith('http') ? rawImage : `https://dinanathandsons.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
    const canonicalSlug = getCanonicalProductSlug(rawProduct);

    return {
        title: baseTitle,
        description,
        alternates: {
            canonical: `https://dinanathandsons.com/shop/${canonicalSlug}`
        },
        openGraph: {
            title: baseTitle,
            description,
            images: [{ url: image, alt: rawProduct.name }]
        }
    };
}

export default async function ProductBySlugPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const rawProduct = await findProductByIdOrSlug(params.slug);

    if (!rawProduct) {
        notFound();
    }

    return <ProductClient id={rawProduct.id} initialProduct={rawProduct} />;
}
