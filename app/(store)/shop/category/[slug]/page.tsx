import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import { CATEGORIES, getCategoryBySlug } from '@/lib/categories';
import { products as localProducts, Product } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ProductCard } from '@/components/product-card';
import { normalizeProduct } from '@/lib/slug';
import { ChevronRight, ShieldCheck, Truck, Package, Layers } from 'lucide-react';

export const dynamicParams = true;

export async function generateStaticParams() {
    const slugs = new Set<string>();
    CATEGORIES.forEach(cat => {
        slugs.add(cat.slug);
    });
    return Array.from(slugs).map(slug => ({ slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const params = await props.params;
    const cat = getCategoryBySlug(params.slug);

    if (!cat) {
        return {
            title: 'Category Not Found | Dinanath & Sons',
            robots: {
                index: false,
                follow: false,
            }
        };
    }

    const canonicalUrl = `https://dinanathandsons.com/shop/category/${cat.slug}`;

    return {
        title: cat.seoTitle,
        description: cat.seoDescription,
        keywords: cat.keywords,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: cat.seoTitle,
            description: cat.seoDescription,
            url: canonicalUrl,
            siteName: 'Dinanath & Sons',
            type: 'website',
            images: [
                {
                    url: 'https://dinanathandsons.com/icon.png',
                    width: 512,
                    height: 512,
                    alt: cat.name,
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: cat.seoTitle,
            description: cat.seoDescription,
        }
    };
}

async function getCategoryProducts(categoryKey: string): Promise<Product[]> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', categoryKey);

        if (!error && data && data.length > 0) {
            return data.map(p => normalizeProduct(p));
        }
    } catch (e) {
        console.warn('DB query failed for category, using fallback', e);
    }

    // Fallback to local catalog
    return localProducts
        .filter(p => p.category.toLowerCase() === categoryKey.toLowerCase())
        .map(p => normalizeProduct(p));
}

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const cat = getCategoryBySlug(params.slug);

    if (!cat) {
        notFound();
    }

    // GSC Fix: If accessed via alias (e.g. /shop/category/tools), 301 redirect to canonical slug /shop/category/hand-tools
    if (params.slug !== cat.slug) {
        permanentRedirect(`/shop/category/${cat.slug}`);
    }

    const products = await getCategoryProducts(cat.categoryKey);

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
                "name": cat.name,
                "item": `https://dinanathandsons.com/shop/category/${cat.slug}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <div className="min-h-screen bg-[#151515] text-[#F8F3E8] pt-28 md:pt-40 pb-24 selection:bg-[#A67C35]/30">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    {/* Visual Breadcrumbs */}
                    <div className="mb-8">
                        <Breadcrumbs
                            items={[
                                { label: 'Inventory', href: '/shop' },
                                { label: cat.name }
                            ]}
                        />
                    </div>

                    {/* Category Header with Single H1 */}
                    <header className="mb-12 bg-[#1E1E1E] border border-[#343434] rounded-2xl p-8 md:p-12 relative overflow-hidden">
                        <div className="max-w-3xl relative z-10">
                            <span className="text-[10px] font-mono font-bold text-[#A67C35] uppercase tracking-[0.3em] block mb-3">
                                Official Category Catalog • Dinanath & Sons
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-[#F8F3E8] uppercase tracking-wide mb-4 leading-tight">
                                {cat.h1}
                            </h1>
                            <p className="text-sm md:text-base text-[#CFCFCF] font-medium leading-relaxed mb-6">
                                {cat.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#8E8E9A]">
                                <div className="flex items-center gap-1.5 text-[#A67C35]">
                                    <ShieldCheck size={14} /> Tested for Workshop Reliability
                                </div>
                                <div className="h-3 w-px bg-[#343434]" />
                                <div className="flex items-center gap-1.5">
                                    <Truck size={14} /> Pan-India Dispatch from Chandni Chowk
                                </div>
                                <div className="h-3 w-px bg-[#343434]" />
                                <div className="flex items-center gap-1.5 text-white">
                                    <Package size={14} /> {products.length} Products in Stock
                                </div>
                            </div>
                        </div>

                        {/* Wholesale Banner Inside Category */}
                        <div className="mt-8 pt-6 border-t border-[#343434] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <p className="text-xs text-[#8E8E9A]">
                                <strong className="text-[#A67C35]">Wholesale & Retail: </strong>
                                {cat.wholesaleNote}
                            </p>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#A67C35] hover:text-[#F8F3E8] transition-colors whitespace-nowrap"
                            >
                                Request Bulk Quote <ChevronRight size={12} />
                            </Link>
                        </div>
                    </header>

                    {/* Category Products Grid */}
                    <section className="mb-20">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#343434]">
                            <h2 className="text-lg md:text-xl font-bold font-display uppercase tracking-wider text-[#F8F3E8]">
                                Available {cat.name} ({products.length})
                            </h2>
                            <span className="text-[10px] font-mono text-[#8E8E9A] uppercase">
                                Showing direct stock
                            </span>
                        </div>

                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-[#1E1E1E] rounded-2xl border border-[#343434]">
                                <p className="text-sm text-[#8E8E9A] mb-4">No products found in this category currently.</p>
                                <Link href="/shop" className="text-xs text-[#A67C35] font-bold uppercase tracking-wider">
                                    View Full Inventory
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* Cross-Category Internal Links (Real Crawlable <a> Tags) */}
                    <section className="bg-[#1E1E1E] border border-[#343434] rounded-2xl p-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#F8F3E8] mb-6">
                            Explore Related Jewellery Making Categories
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {CATEGORIES.filter(c => c.slug !== cat.slug).map(c => (
                                <Link
                                    key={c.slug}
                                    href={`/shop/category/${c.slug}`}
                                    className="p-3.5 rounded-xl bg-[#242424] hover:bg-[#A67C35]/15 border border-[#343434] hover:border-[#A67C35] text-left transition-all group"
                                >
                                    <h4 className="text-xs font-bold text-[#F8F3E8] group-hover:text-[#A67C35] transition-colors mb-1">
                                        {c.name}
                                    </h4>
                                    <p className="text-[9px] text-[#8E8E9A] line-clamp-2">
                                        {c.subtitle}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
