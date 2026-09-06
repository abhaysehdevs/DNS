'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import { Product } from '@/lib/data';
import { 
    Loader2, ArrowRight, Star, Clock, ShieldCheck, Layers, 
    Truck, Lock, ThumbsUp, ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const trustStripItems = [
    { icon: Clock, title: "60+ Years", desc: "of Trust & Excellence" },
    { icon: ShieldCheck, title: "Premium Quality", desc: "Industrial Grade Products" },
    { icon: Layers, title: "Wide Range", desc: "A to Z Workshop Solutions" },
    { icon: Truck, title: "Fast Delivery", desc: "Pan India Secure Shipping" },
    { icon: Lock, title: "Secure Payments", desc: "100% Protected Checkouts" },
    { icon: ThumbsUp, title: "Trusted by Professionals", desc: "Manufacturers & Goldsmiths" }
];

const homeCategories = [
    { name: 'Hand Tools', count: '120+ Products', img: '/images/products/ss-plier.png', href: '/shop?cat=Tools' },
    { name: 'Machines', count: '45+ Products', img: '/images/products/sand-blasting-dust-collector-machine.png', href: '/shop?cat=Machinery' },
    { name: 'Polishing & Buffs', count: '60+ Products', img: '/images/products/cloth-buff.png', href: '/shop?cat=Consumables' },
    { name: 'Cleaning Solutions', count: '25+ Products', img: '/images/products/tik-tak-silver-cleaner.png', href: '/shop?cat=Chemicals' },
    { name: 'Engraving Tools', count: '30+ Products', img: '/images/products/gas-torch-auto.png', href: '/shop?cat=Tools' },
    { name: 'Accessories', count: '50+ Products', img: '/images/products/tweezer-ss-10k.png', href: '/shop?cat=Packaging' }
];

const whyChooseUsItems = [
    { title: "60+ Years of Trust", desc: "Serving Indian jewellers since 1960." },
    { title: "Premium Quality Products", desc: "Tested and verified for industrial standards." },
    { title: "A to Z Solutions for Jewellery Making", desc: "Complete workshop catalog under one roof." },
    { title: "Trusted by Thousands of Professionals", desc: "Preferred choice of master goldsmiths." },
    { title: "Excellent Customer Support", desc: "Dedicated expert advice for machine calibration." }
];

export default function Home() {
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
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

            {/* 1. TRUST STRIP */}
            <section className="relative z-30 bg-[#1E1E1E] border-y border-[#343434] py-8 px-6">
                <div className="container mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {trustStripItems.map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center p-3 group">
                                <div className="w-10 h-10 rounded-lg bg-[#242424] border border-[#343434] flex items-center justify-center mb-3 text-[#A67C35] group-hover:scale-110 transition-transform">
                                    <item.icon size={18} strokeWidth={2} />
                                </div>
                                <h4 className="text-[10px] font-bold text-[#F8F3E8] uppercase tracking-wider mb-0.5">{item.title}</h4>
                                <p className="text-[8px] text-[#CFCFCF] tracking-wide uppercase font-semibold">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. CATEGORIES SECTION */}
            <section className="py-24 px-6 bg-[#151515] border-b border-[#343434] relative">
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <div className="h-0.5 w-16 bg-[#A67C35] mx-auto mb-4" />
                        <h2 className="text-3xl md:text-5xl font-bold font-display text-[#F8F3E8] tracking-wider uppercase mb-2">Shop By Category</h2>
                        <p className="text-[10px] font-bold text-[#A67C35] uppercase tracking-[0.25em]">Precision crafted tool catalogs</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
                        {homeCategories.map((cat, i) => (
                            <Link href={cat.href} key={i} className="group flex flex-col bg-[#242424] border border-[#343434] hover:border-[#A67C35] rounded-xl overflow-hidden shadow-lg transition-all hover:-translate-y-1">
                                <div className="aspect-[4/3] w-full bg-[#1E1E1E] p-4 flex items-center justify-center overflow-hidden relative">
                                    <img 
                                        src={cat.img} 
                                        alt={cat.name} 
                                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 mix-blend-lighten"
                                        onError={(e) => {
                                             (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                        }}
                                    />
                                </div>
                                <div className="p-4 flex items-center justify-between gap-2 border-t border-[#343434]">
                                    <div className="flex flex-col text-left">
                                        <h4 className="text-[11px] font-bold text-[#F8F3E8] uppercase tracking-wider">{cat.name}</h4>
                                        <span className="text-[8px] text-[#8E8E9A] uppercase font-bold mt-0.5">{cat.count}</span>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-[#343434] group-hover:bg-[#A67C35] group-hover:text-black flex items-center justify-center text-[#CFCFCF] transition-colors">
                                        <ChevronRight size={12} strokeWidth={2.5} />
                                    </div>
                                </div>
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
                        <section key={col.id} className="py-24 px-6 bg-[#1E1E1E] relative border-b border-[#343434]">
                            <div className="container mx-auto">
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-16 border-b border-[#343434] pb-6 gap-4 text-center sm:text-left">
                                    <div>
                                        <h2 className="text-3xl md:text-5xl font-bold font-display text-[#F8F3E8] tracking-wider uppercase mb-1">{col.name}</h2>
                                        <p className="text-[9px] font-bold text-[#A67C35] uppercase tracking-[0.2em]">Curated {col.name.toLowerCase()} catalog</p>
                                    </div>
                                    <Link href={`/shop?cat=${col.query.replace('category=', '')}`} className="group text-[10px] font-bold text-[#CFCFCF] hover:text-[#A67C35] uppercase tracking-widest flex items-center gap-2 transition-colors">
                                        <span>View Collection</span>
                                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
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
                <section className="py-24 px-6 bg-[#1E1E1E] relative border-b border-[#343434]">
                    <div className="container mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-16 border-b border-[#343434] pb-6 gap-4 text-center sm:text-left">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold font-display text-[#F8F3E8] tracking-wider uppercase mb-1">New Arrivals</h2>
                                <p className="text-[9px] font-bold text-[#A67C35] uppercase tracking-[0.2em]">Latest machinery updates and tool modifications</p>
                            </div>
                            <Link href="/shop" className="group text-[10px] font-bold text-[#CFCFCF] hover:text-[#A67C35] uppercase tracking-widest flex items-center gap-2 transition-colors">
                                <span>View All Products</span>
                                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-8 h-8 animate-spin text-[#A67C35]" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A67C35]">Loading inventory...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                                {newArrivals.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 4. ABOUT & WHY CHOOSE US (Dark theme background) */}
            <section className="py-24 px-6 bg-[#151515] border-b border-[#343434] relative">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        
                        {/* About Us Description */}
                        <div className="lg:col-span-7 flex flex-col text-left space-y-6">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A67C35] border-b border-[#343434] pb-2">About Dinanath & Sons</h4>
                            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-wider uppercase text-[#F8F3E8] leading-tight">
                                India's Trusted Jewelry Tool <br/> Experts Since 1960
                            </h2>
                            <div className="text-sm text-[#CFCFCF] font-medium leading-relaxed space-y-4">
                                <p>
                                    Established in 1960 by <strong>Mr. Dinanath Sehdev</strong>, our company began with a humble workshop in Maliwara, Chandni Chowk, Delhi. We set out with a singular target: to supply master jewellers with precision tools that match their artistry.
                                </p>
                                <p>
                                    Through three generations of dedication, Dinanath & Sons has evolved into India's trusted authority for jewelry-making machinery, metallurgical equipment, and finishing consumables. We partner directly with casting workshops and manufacturers nationwide to raise production efficiency.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Link href="/about">
                                    <button className="h-12 px-8 bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase tracking-widest text-[9px] rounded-lg transition-all hover:scale-105 active:scale-95 shadow-md">
                                        Know More About Us
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Why Choose Us */}
                        <div className="lg:col-span-5 flex flex-col space-y-8 text-left bg-[#1E1E1E] border border-[#343434] rounded-xl p-8 shadow-xl">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold font-display text-[#A67C35] uppercase tracking-wider mb-2">Why Choose Us?</h3>
                                <p className="text-[9px] text-[#8E8E9A] uppercase tracking-widest font-bold border-b border-[#343434] pb-4">Our legacy directives</p>
                            </div>

                            <div className="space-y-6">
                                {whyChooseUsItems.map((item, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <div className="w-7 h-7 rounded-full bg-[#242424] border border-[#343434] text-[#A67C35] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow">
                                            {i + 1}
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-xs font-bold text-[#F8F3E8] uppercase tracking-wider mb-1">{item.title}</h4>
                                            <p className="text-[10px] text-[#CFCFCF] font-medium leading-normal">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5. NEWSLETTER FORM (Rich Charcoal background) */}
            <section className="py-20 px-6 bg-[#1E1E1E] relative border-b border-[#343434]">
                <div className="absolute right-0 bottom-0 w-[25vw] h-[25vw] bg-[#A67C35]/5 blur-[90px] rounded-full pointer-events-none opacity-40" />
                <div className="container mx-auto max-w-4xl">
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <h2 className="text-2xl md:text-4xl font-bold font-display uppercase tracking-wider text-[#F8F3E8]">Newsletter</h2>
                            <p className="text-xs text-[#CFCFCF] font-semibold leading-relaxed uppercase tracking-wide">
                                Subscribe to get updates on new arrivals, offers, and technical logs.
                            </p>
                        </div>
                        <div className="flex-1 w-full max-w-md">
                            {subscribed ? (
                                <div className="text-emerald-500 font-bold uppercase tracking-wider text-sm text-center md:text-left bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 rounded-xl">
                                    Thanks for subscribing!
                                </div>
                            ) : (
                                <form className="flex flex-col sm:flex-row gap-3.5" onSubmit={handleNewsletterSubmit}>
                                    <input 
                                        required 
                                        type="email" 
                                        placeholder="ENTER YOUR EMAIL" 
                                        value={newsletterEmail}
                                        onChange={e => setNewsletterEmail(e.target.value)}
                                        className="flex-1 h-12 bg-[#151515] border border-[#343434] rounded-lg px-4 text-xs font-semibold tracking-wider text-[#F8F3E8] focus:outline-none focus:border-[#A67C35] transition-all placeholder-[#8E8E9A]" 
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={submitting}
                                        className="h-12 bg-[#A67C35] hover:bg-[#8A6232] disabled:opacity-50 text-black font-bold px-8 rounded-lg text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow flex items-center justify-center"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" size={16} /> : 'Subscribe'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
