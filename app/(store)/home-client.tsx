'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import { Product, products as initialLocalProducts } from '@/lib/data';
import { 
    Loader2, ArrowRight,
    Mail, Sparkles, CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const homeCategories = [
    { name: 'Hand Tools', count: '120+ Products', img: '/categories/hand-tools.png', href: '/shop/category/hand-tools' },
    { name: 'Machines', count: '45+ Products', img: '/categories/machinery.png', href: '/shop/category/machines' },
    { name: 'Polishing & Buffs', count: '60+ Products', img: '/categories/cleaning-buffs.png', href: '/shop/category/polishing' },
    { name: 'Cleaning Solutions', count: '25+ Products', img: '/categories/cleaning-solutions.png', href: '/shop/category/chemicals' },
    { name: 'Packaging & Cards', count: '30+ Products', img: '/categories/packaging-and-cards.png', href: '/shop/category/packaging' }
];

const whyChooseUsItems = [
    { title: "60+ Years of Trust", desc: "Serving Indian jewellers since 1960." },
    { title: "Premium Quality Products", desc: "Tested and verified for industrial standards." },
    { title: "A to Z Solutions for Jewellery Making", desc: "Complete workshop catalog under one roof." },
    { title: "Trusted by Thousands of Professionals", desc: "Preferred choice of master goldsmiths." },
    { title: "Excellent Customer Support", desc: "Dedicated expert advice for machine calibration." }
];

export function HomeClient() {
    const [newArrivals, setNewArrivals] = useState<Product[]>(() => initialLocalProducts.slice(0, 6));
    const [loading, setLoading] = useState(false);

    const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
    const [collectionsProducts, setCollectionsProducts] = useState<Record<string, Product[]>>({});
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail) return;
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email: newsletterEmail }]);
            if (error) {
                if (error.code === '23505') {
                    alert('You are already subscribed to our newsletter!');
                } else {
                    throw error;
                }
            } else {
                setSubscribed(true);
                setNewsletterEmail('');
                setTimeout(() => setSubscribed(false), 5000);
            }
        } catch (err: any) {
            console.error(err);
            alert('Failed to subscribe. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const { data } = await supabase.from('products').select('*').limit(6);
                if (data && data.length > 0) {
                    const mappedProducts: Product[] = data.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        retailPrice: p.retail_price,
                        wholesalePrice: p.wholesale_price,
                        wholesaleMOQ: p.wholesale_moq,
                        primaryImage: p.image || p.image_url || '/placeholder.jpg',
                        image: p.image || p.image_url || '/placeholder.jpg',
                        gallery: p.gallery || [],
                        category: p.category,
                        inStock: p.in_stock,
                        reviews: p.reviews || []
                    }));
                    setNewArrivals(mappedProducts);
                } else {
                    import('@/lib/data').then((module) => {
                        setNewArrivals(module.products.slice(0, 6));
                    });
                }
            } catch (err) {
                import('@/lib/data').then((module) => {
                    setNewArrivals(module.products.slice(0, 6));
                });
            } finally {
                setLoading(false);
            }
        }

        async function fetchFeaturedCollections() {
            try {
                const { data: cols, error: err1 } = await supabase
                    .from('featured_collections')
                    .select('*')
                    .eq('active', true)
                    .order('display_order');
                if (cols && !err1) {
                    setFeaturedCollections(cols);
                    
                    const prodsMap: Record<string, Product[]> = {};
                    for (const col of cols) {
                        let catVal = '';
                        if (col.query.startsWith('category=')) {
                            catVal = col.query.split('category=')[1];
                        }
                        
                        if (catVal) {
                            const { data: prods } = await supabase
                                .from('products')
                                .select('*')
                                .eq('category', catVal)
                                .limit(col.display_limit || 8);
                            
                            if (prods && prods.length > 0) {
                                prodsMap[col.id] = prods.map((p: any) => ({
                                    id: p.id,
                                    name: p.name,
                                    description: p.description,
                                    retailPrice: p.retail_price,
                                    wholesalePrice: p.wholesale_price,
                                    wholesaleMOQ: p.wholesale_moq,
                                    primaryImage: p.image || p.image_url || '/placeholder.jpg',
                                    image: p.image || p.image_url || '/placeholder.jpg',
                                    gallery: p.gallery || [],
                                    category: p.category,
                                    inStock: p.in_stock,
                                    reviews: p.reviews || []
                                }));
                            }
                        }
                    }
                    setCollectionsProducts(prodsMap);
                }
            } catch (e) {
                console.error('Error fetching featured collections:', e);
            }
        }

        fetchProducts();
        fetchFeaturedCollections();
    }, []);

    const getCollectionUrl = (query: string) => {
        const cat = query.replace('category=', '').toLowerCase();
        if (cat === 'tools') return '/shop/category/hand-tools';
        if (cat === 'machinery' || cat === 'machines') return '/shop/category/machines';
        if (cat === 'consumables' || cat === 'polishing') return '/shop/category/polishing';
        if (cat === 'packaging') return '/shop/category/packaging';
        if (cat === 'chemicals') return '/shop/category/chemicals';
        if (cat === 'bullion') return '/shop/category/bullion';
        return `/shop?category=${encodeURIComponent(cat)}`;
    };

    return (
        <div className="relative w-full bg-[#FAF9F5] text-[#18181B] selection:bg-[#966E2E]/20 overflow-hidden">
            
            {/* Cinematic Hero */}
            <Hero />

            {/* SHOP BY CATEGORY */}
            <section className="py-4 sm:py-8 md:py-10 px-2.5 sm:px-6 bg-[#FAF9F5] border-b border-[#E8E2D5] relative">
                <div className="container mx-auto">
                    <div className="text-center mb-3 sm:mb-6">
                        <div className="h-0.5 w-10 sm:w-16 bg-[#966E2E] mx-auto mb-2" />
                        <h2 className="text-xl sm:text-3xl md:text-5xl font-bold font-display text-[#18181B] tracking-wider uppercase mb-1">Shop By Category</h2>
                        <p className="text-[7.5px] sm:text-[9.5px] font-bold text-[#966E2E] uppercase tracking-[0.25em]">Precision crafted tool catalogs</p>
                    </div>

                    {/* All categories in a single row */}
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-3 md:gap-5 w-full">
                        {homeCategories.map((cat, i) => (
                            <Link 
                                href={cat.href} 
                                key={i} 
                                className="group flex flex-col items-center text-center bg-white hover:bg-[#FAF9F5] border border-[#E8E2D5] hover:border-[#966E2E] rounded-lg sm:rounded-2xl p-1.5 sm:p-3 transition-all duration-300 shadow-xs hover:-translate-y-1 active:scale-95"
                            >
                                <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-md sm:rounded-xl bg-white p-1 sm:p-2 flex items-center justify-center overflow-hidden border border-[#E8E2D5] group-hover:border-[#966E2E]/50 transition-colors">
                                    <img 
                                        src={cat.img} 
                                        alt={cat.name} 
                                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                             (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                        }}
                                    />
                                </div>
                                <h4 className="text-[7.5px] sm:text-[10px] md:text-xs font-bold text-[#18181B] group-hover:text-[#966E2E] transition-colors uppercase tracking-tight sm:tracking-normal line-clamp-2 leading-tight mt-1 sm:mt-2">
                                    {cat.name}
                                </h4>
                                <span className="hidden sm:inline-block text-[7.5px] sm:text-[8.5px] text-[#71717A] uppercase font-bold mt-0.5">
                                    {cat.count}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. FEATURED COLLECTIONS */}
            {featuredCollections.length > 0 ? (
                featuredCollections.map((col) => {
                    const colProducts = collectionsProducts[col.id] || [];
                    if (colProducts.length === 0) return null;
                    return (
                        <section key={col.id} className="py-6 sm:py-10 md:py-12 px-3.5 sm:px-6 bg-[#F6F3EB] relative border-b border-[#E8E2D5]">
                            <div className="container mx-auto">
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 border-b border-[#E8E2D5] pb-3 sm:pb-4 gap-2 sm:gap-4 text-center sm:text-left">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display text-[#18181B] tracking-wider uppercase mb-1">{col.name}</h2>
                                        <p className="text-[8px] sm:text-[9px] font-bold text-[#966E2E] uppercase tracking-[0.2em]">Curated {col.name.toLowerCase()} catalog</p>
                                    </div>
                                    <Link href={getCollectionUrl(col.query)} className="group text-[9px] sm:text-[10px] font-bold text-[#52525B] hover:text-[#966E2E] uppercase tracking-widest flex items-center gap-2 transition-colors">
                                        <span>View Collection</span>
                                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-6">
                                    {colProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                })
            ) : (
                /* Fallback New Arrivals */
                <section className="py-6 sm:py-10 md:py-12 px-3.5 sm:px-6 bg-[#F6F3EB] relative border-b border-[#E8E2D5]">
                    <div className="container mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 border-b border-[#E8E2D5] pb-3 sm:pb-4 gap-2 sm:gap-4 text-center sm:text-left">
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display text-[#18181B] tracking-wider uppercase mb-1">New Arrivals</h2>
                                <p className="text-[8px] sm:text-[9px] font-bold text-[#966E2E] uppercase tracking-[0.2em]">Latest machinery updates and tool modifications</p>
                            </div>
                            <Link href="/shop" className="group text-[9px] sm:text-[10px] font-bold text-[#52525B] hover:text-[#966E2E] uppercase tracking-widest flex items-center gap-2 transition-colors">
                                <span>View All Products</span>
                                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 sm:py-14 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-[#966E2E]" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#966E2E]">Loading inventory...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-6">
                                {newArrivals.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 4. ABOUT & WHY CHOOSE US */}
            <section className="py-6 sm:py-10 md:py-12 px-3.5 sm:px-6 bg-[#FAF9F5] border-b border-[#E8E2D5] relative">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16 items-start">
                        
                        {/* About Us Description */}
                        <div className="lg:col-span-7 flex flex-col text-left space-y-4 sm:space-y-6">
                            <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#966E2E] border-b border-[#E8E2D5] pb-2">About Dinanath & Sons</h4>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display tracking-wider uppercase text-[#18181B] leading-tight">
                                India's Trusted Jewelry Tool <br className="hidden sm:inline"/> Experts Since 1960
                            </h2>
                            <div className="text-xs sm:text-sm text-[#52525B] font-normal leading-relaxed space-y-3 sm:space-y-4">
                                <p>
                                    Established in 1960 by <strong>Mr. Dinanath Sehdev</strong>, our company began with a humble workshop in Maliwara, Chandni Chowk, Delhi. We set out with a singular target: to supply master jewellers with precision tools that match their artistry.
                                </p>
                                <p>
                                    Through three generations of dedication, Dinanath & Sons has evolved into India's trusted authority for jewelry-making machinery, metallurgical equipment, and finishing consumables. We partner directly with casting workshops and manufacturers nationwide to raise production efficiency.
                                </p>
                            </div>
                            <div className="pt-2 sm:pt-4">
                                <Link href="/about">
                                    <button className="h-10 sm:h-12 px-6 sm:px-8 bg-[#966E2E] hover:bg-[#7D5A25] text-white font-bold uppercase tracking-widest text-[8.5px] sm:text-[9px] rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer">
                                        Know More About Us
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Why Choose Us */}
                        <div className="lg:col-span-5 flex flex-col space-y-6 sm:space-y-8 text-left bg-white border border-[#E8E2D5] rounded-2xl p-5 sm:p-8 shadow-xs">
                            <div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-display text-[#966E2E] uppercase tracking-wider mb-1.5 sm:mb-2">Why Choose Us?</h3>
                                <p className="text-[8px] sm:text-[9px] text-[#71717A] uppercase tracking-widest font-bold border-b border-[#E8E2D5] pb-3 sm:pb-4">Our legacy directives</p>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                {whyChooseUsItems.map((item, i) => (
                                    <div key={i} className="flex flex-col text-left">
                                        <h4 className="text-xs sm:text-sm font-bold text-[#18181B] uppercase tracking-wider">{item.title}</h4>
                                        <p className="text-[11px] sm:text-xs text-[#71717A] mt-1">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5. NEWSLETTER SECTION */}
            <section className="py-6 sm:py-10 md:py-12 px-3 sm:px-6 bg-[#F6F3EB] relative border-b border-[#E8E2D5] overflow-hidden">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#966E2E]/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#966E2E]/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="bg-white border border-[#E8E2D5] hover:border-[#966E2E]/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-lg transition-all">
                        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-12">
                            
                            {/* Left: Text & Badge */}
                            <div className="flex-1 text-center md:text-left space-y-2 sm:space-y-3">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em]">
                                    <Sparkles size={11} className="text-[#966E2E]" />
                                    <span>Workshop VIP Bulletin</span>
                                </div>
                                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-display uppercase tracking-wider text-[#18181B] leading-tight">
                                    Get Trade Updates & Drops
                                </h2>
                                <p className="text-[11px] sm:text-xs text-[#52525B] font-normal leading-relaxed max-w-md mx-auto md:mx-0">
                                    Be the first to receive notifications for new machine arrivals, metallurgical tips, and exclusive equipment catalogs.
                                </p>
                            </div>

                            {/* Right: Modern Compact Form */}
                            <div className="w-full md:w-auto md:min-w-[340px]">
                                {subscribed ? (
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-600 font-bold uppercase tracking-wider text-xs bg-emerald-50 border border-emerald-200 px-5 py-3.5 rounded-xl">
                                        <CheckCircle size={16} />
                                        <span>Subscribed to VIP Bulletin!</span>
                                    </div>
                                ) : (
                                    <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleNewsletterSubmit}>
                                        <div className="relative flex-1">
                                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
                                            <input 
                                                required 
                                                type="email" 
                                                placeholder="Enter your work email..." 
                                                value={newsletterEmail}
                                                onChange={e => setNewsletterEmail(e.target.value)}
                                                className="w-full h-11 sm:h-12 bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] rounded-xl pl-10 pr-3 text-xs font-medium text-[#18181B] placeholder-[#A1A1AA] focus:outline-none transition-all shadow-xs" 
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={submitting}
                                            className="h-11 sm:h-12 bg-[#966E2E] hover:bg-[#7D5A25] active:scale-95 disabled:opacity-50 text-white font-bold px-6 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                                        >
                                            {submitting ? (
                                                <Loader2 className="animate-spin" size={15} />
                                            ) : (
                                                <>
                                                    <span>Join</span>
                                                    <ArrowRight size={13} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                                <span className="block text-[8px] sm:text-[9px] text-[#71717A] text-center md:text-left mt-2 tracking-wide font-normal">
                                    No spam. Unsubscribe anytime.
                                </span>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
