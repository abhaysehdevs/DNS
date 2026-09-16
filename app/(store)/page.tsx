'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import { Product, products as initialLocalProducts } from '@/lib/data';
import { 
    Loader2, ArrowRight, Star, ChevronRight,
    Mail, Sparkles, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const homeCategories = [
    { name: 'Hand Tools', count: '120+ Products', img: '/images/products/ss-plier.png', href: '/shop/category/hand-tools' },
    { name: 'Machines', count: '45+ Products', img: '/images/products/sand-blasting-dust-collector-machine.png', href: '/shop/category/machines' },
    { name: 'Polishing & Buffs', count: '60+ Products', img: '/images/products/cloth-buff.png', href: '/shop/category/polishing' },
    { name: 'Cleaning Solutions', count: '25+ Products', img: '/images/products/tik-tak-silver-cleaner.png', href: '/shop/category/chemicals' },
    { name: 'Packaging & Cards', count: '30+ Products', img: '/images/packaging/silver-coins-5gms.png', href: '/shop/category/packaging' },
    { name: 'Certified Bullion', count: '50+ Products', img: '/images/products/silver-coin-20g.png', href: '/shop/category/bullion' }
];

const whyChooseUsItems = [
    { title: "60+ Years of Trust", desc: "Serving Indian jewellers since 1960." },
    { title: "Premium Quality Products", desc: "Tested and verified for industrial standards." },
    { title: "A to Z Solutions for Jewellery Making", desc: "Complete workshop catalog under one roof." },
    { title: "Trusted by Thousands of Professionals", desc: "Preferred choice of master goldsmiths." },
    { title: "Excellent Customer Support", desc: "Dedicated expert advice for machine calibration." }
];

export default function Home() {
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

    return (
        <div className="relative w-full bg-[#151515] text-[#F8F3E8] selection:bg-[#A67C35]/30 overflow-hidden">
            
            {/* Cinematic Hero */}
            <Hero />

            {/* SHOP BY CATEGORY (All categories in a single row, no scrolling, fully mobile-optimized) */}
            <section className="py-6 sm:py-12 md:py-16 px-2.5 sm:px-6 bg-[#151515] border-b border-[#343434] relative">
                <div className="container mx-auto">
                    <div className="text-center mb-4 sm:mb-8">
                        <div className="h-0.5 w-10 sm:w-16 bg-[#A67C35] mx-auto mb-2" />
                        <h2 className="text-xl sm:text-3xl md:text-5xl font-bold font-display text-[#F8F3E8] tracking-wider uppercase mb-1">Shop By Category</h2>
                        <p className="text-[7.5px] sm:text-[9.5px] font-bold text-[#A67C35] uppercase tracking-[0.25em]">Precision crafted tool catalogs</p>
                    </div>

                    {/* All categories in a single row showing at the same time - NO scrolling */}
                    <div className="grid grid-cols-6 gap-1.5 sm:gap-3 md:gap-5 w-full">
                        {homeCategories.map((cat, i) => (
                            <Link 
                                href={cat.href} 
                                key={i} 
                                className="group flex flex-col items-center text-center bg-[#1E1E1E] hover:bg-[#252525] border border-[#343434] hover:border-[#A67C35] rounded-lg sm:rounded-2xl p-1.5 sm:p-3 transition-all duration-300 shadow hover:-translate-y-1 active:scale-95"
                            >
                                <div className="w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-md sm:rounded-xl bg-[#141414] p-1.5 sm:p-2.5 flex items-center justify-center overflow-hidden border border-[#2E2E2E] group-hover:border-[#A67C35]/50 transition-colors">
                                    <img 
                                        src={cat.img} 
                                        alt={cat.name} 
                                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 mix-blend-lighten"
                                        onError={(e) => {
                                             (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                        }}
                                    />
                                </div>
                                <h4 className="text-[7.5px] sm:text-[10px] md:text-xs font-bold text-[#F8F3E8] group-hover:text-[#A67C35] transition-colors uppercase tracking-tight sm:tracking-normal line-clamp-2 leading-tight mt-1 sm:mt-2">
                                    {cat.name}
                                </h4>
                                <span className="hidden sm:inline-block text-[7.5px] sm:text-[8.5px] text-[#8E8E9A] uppercase font-bold mt-0.5">
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
                        <section key={col.id} className="py-10 sm:py-16 md:py-24 px-3.5 sm:px-6 bg-[#1E1E1E] relative border-b border-[#343434]">
                            <div className="container mx-auto">
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-16 border-b border-[#343434] pb-4 sm:pb-6 gap-3 sm:gap-4 text-center sm:text-left">
                                    <div>
                                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display text-[#F8F3E8] tracking-wider uppercase mb-1">{col.name}</h2>
                                        <p className="text-[8px] sm:text-[9px] font-bold text-[#A67C35] uppercase tracking-[0.2em]">Curated {col.name.toLowerCase()} catalog</p>
                                    </div>
                                    <Link href={`/shop?cat=${col.query.replace('category=', '')}`} className="group text-[9px] sm:text-[10px] font-bold text-[#CFCFCF] hover:text-[#A67C35] uppercase tracking-widest flex items-center gap-2 transition-colors">
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
                <section className="py-10 sm:py-16 md:py-24 px-3.5 sm:px-6 bg-[#1E1E1E] relative border-b border-[#343434]">
                    <div className="container mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-16 border-b border-[#343434] pb-4 sm:pb-6 gap-3 sm:gap-4 text-center sm:text-left">
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display text-[#F8F3E8] tracking-wider uppercase mb-1">New Arrivals</h2>
                                <p className="text-[8px] sm:text-[9px] font-bold text-[#A67C35] uppercase tracking-[0.2em]">Latest machinery updates and tool modifications</p>
                            </div>
                            <Link href="/shop" className="group text-[9px] sm:text-[10px] font-bold text-[#CFCFCF] hover:text-[#A67C35] uppercase tracking-widest flex items-center gap-2 transition-colors">
                                <span>View All Products</span>
                                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-[#A67C35]" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A67C35]">Loading inventory...</span>
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

            {/* 4. ABOUT & WHY CHOOSE US (Dark theme background) */}
            <section className="py-10 sm:py-16 md:py-24 px-3.5 sm:px-6 bg-[#151515] border-b border-[#343434] relative">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16 items-start">
                        
                        {/* About Us Description */}
                        <div className="lg:col-span-7 flex flex-col text-left space-y-4 sm:space-y-6">
                            <h4 className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#A67C35] border-b border-[#343434] pb-2">About Dinanath & Sons</h4>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold font-display tracking-wider uppercase text-[#F8F3E8] leading-tight">
                                India's Trusted Jewelry Tool <br className="hidden sm:inline"/> Experts Since 1960
                            </h2>
                            <div className="text-xs sm:text-sm text-[#CFCFCF] font-medium leading-relaxed space-y-3 sm:space-y-4">
                                <p>
                                    Established in 1960 by <strong>Mr. Dinanath Sehdev</strong>, our company began with a humble workshop in Maliwara, Chandni Chowk, Delhi. We set out with a singular target: to supply master jewellers with precision tools that match their artistry.
                                </p>
                                <p>
                                    Through three generations of dedication, Dinanath & Sons has evolved into India's trusted authority for jewelry-making machinery, metallurgical equipment, and finishing consumables. We partner directly with casting workshops and manufacturers nationwide to raise production efficiency.
                                </p>
                            </div>
                            <div className="pt-2 sm:pt-4">
                                <Link href="/about">
                                    <button className="h-10 sm:h-12 px-6 sm:px-8 bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase tracking-widest text-[8.5px] sm:text-[9px] rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md">
                                        Know More About Us
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Why Choose Us */}
                        <div className="lg:col-span-5 flex flex-col space-y-6 sm:space-y-8 text-left bg-[#1E1E1E] border border-[#343434] rounded-xl p-5 sm:p-8 shadow-xl">
                            <div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold font-display text-[#A67C35] uppercase tracking-wider mb-1.5 sm:mb-2">Why Choose Us?</h3>
                                <p className="text-[8px] sm:text-[9px] text-[#8E8E9A] uppercase tracking-widest font-bold border-b border-[#343434] pb-3 sm:pb-4">Our legacy directives</p>
                            </div>

                            <div className="space-y-4 sm:space-y-6">
                                {whyChooseUsItems.map((item, i) => (
                                    <div key={i} className="flex flex-col text-left">
                                        <h4 className="text-xs sm:text-sm font-bold text-[#F8F3E8] uppercase tracking-wider">{item.title}</h4>
                                        <p className="text-[11px] sm:text-xs text-[#8E8E9A] mt-1">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5. NEWSLETTER SECTION (Luxury Goldsmith VIP Dispatch Card) */}
            <section className="py-8 sm:py-16 md:py-20 px-3 sm:px-6 bg-[#151515] relative border-b border-[#343434] overflow-hidden">
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#A67C35]/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#A67C35]/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="container mx-auto max-w-4xl relative z-10">
                    <div className="bg-gradient-to-b from-[#1E1E1E] to-[#171717] border border-[#343434] hover:border-[#A67C35]/50 rounded-2xl sm:rounded-3xl p-5 sm:p-10 md:p-14 shadow-2xl transition-all">
                        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-12">
                            
                            {/* Left: Text & Badge */}
                            <div className="flex-1 text-center md:text-left space-y-2 sm:space-y-3">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#252525] border border-[#A67C35]/30 text-[#A67C35] text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em]">
                                    <Sparkles size={11} className="text-[#A67C35]" />
                                    <span>Workshop VIP Bulletin</span>
                                </div>
                                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-display uppercase tracking-wider text-[#F8F3E8] leading-tight">
                                    Get Trade Updates & Drops
                                </h2>
                                <p className="text-[11px] sm:text-xs text-[#CFCFCF] font-medium leading-relaxed max-w-md mx-auto md:mx-0">
                                    Be the first to receive notifications for new machine arrivals, metallurgical tips, and exclusive equipment catalogs.
                                </p>
                            </div>

                            {/* Right: Modern Compact Form */}
                            <div className="w-full md:w-auto md:min-w-[340px]">
                                {subscribed ? (
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 font-bold uppercase tracking-wider text-xs bg-emerald-500/10 border border-emerald-500/30 px-5 py-3.5 rounded-xl">
                                        <CheckCircle size={16} />
                                        <span>Subscribed to VIP Bulletin!</span>
                                    </div>
                                ) : (
                                    <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleNewsletterSubmit}>
                                        <div className="relative flex-1">
                                            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E9A] pointer-events-none" />
                                            <input 
                                                required 
                                                type="email" 
                                                placeholder="Enter your work email..." 
                                                value={newsletterEmail}
                                                onChange={e => setNewsletterEmail(e.target.value)}
                                                className="w-full h-11 sm:h-12 bg-[#121212] border border-[#343434] focus:border-[#A67C35] rounded-xl pl-10 pr-3 text-xs font-semibold text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none transition-all shadow-inner" 
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={submitting}
                                            className="h-11 sm:h-12 bg-gradient-to-r from-[#DFCE9F] via-[#C5A059] to-[#9E7B35] hover:brightness-110 active:scale-95 disabled:opacity-50 text-black font-black px-6 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
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
                                <span className="block text-[8px] sm:text-[9px] text-[#8E8E9A] text-center md:text-left mt-2 tracking-wide font-medium">
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
