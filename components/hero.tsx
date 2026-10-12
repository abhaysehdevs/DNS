'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    ArrowRight, MessageCircle, Wrench, Cog, Sparkles, 
    Droplets, Package, ShieldCheck, Truck, Receipt, History, 
    X, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SITE_CONFIG } from '@/lib/site-config';
import { products as initialLocalProducts } from '@/lib/data';
import { normalizeProduct } from '@/lib/slug';
import { HeroCarousel, HeroProductItem } from './hero-carousel';

interface HeroConfig {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryButtonText: string;
    primaryButtonLink: string;
    secondaryButtonText: string;
    secondaryButtonLink: string;
    whatsAppNumber: string;
    whatsAppMessage: string;
    announcementMessage?: string;
    trustItems: {
        id: string;
        label: string;
        sublabel: string;
        enabled: boolean;
    }[];
}

const DEFAULT_HERO_CONFIG: HeroConfig = {
    eyebrow: 'Since 1960 · Chandni Chowk, New Delhi',
    title: 'Jewellery Tools, Machines & Packaging for Goldsmiths and Manufacturers',
    subtitle: 'Pliers, tweezers, polishing machines, torches, ring tools and packaging, supplied to jewellers and workshops across India.',
    primaryButtonText: 'Shop the catalog',
    primaryButtonLink: '/shop',
    secondaryButtonText: 'Get a bulk quote',
    secondaryButtonLink: '/contact?subject=Bulk+Quote',
    whatsAppNumber: SITE_CONFIG.contact.whatsApp || '919953435647',
    whatsAppMessage: 'Hello Dinanath & Sons, I would like to inquire about bulk jewellery tools & machinery.',
    announcementMessage: '',
    trustItems: [
        { id: 'since1960', label: 'Since 1960', sublabel: '3 generations of trade', enabled: true },
        { id: 'gst', label: 'GST invoice', sublabel: 'For B2B and wholesale orders', enabled: true },
        { id: 'shipping', label: 'Ships across India', sublabel: 'Insured dispatch from Delhi', enabled: true },
        { id: 'catalog', label: '80+ products', sublabel: 'Tools, machines, consumables', enabled: true }
    ]
};

// 5 core category quick shortcuts corresponding to catalog categories
const CATEGORY_SHORTCUTS = [
    { name: 'Hand Tools', href: '/shop/category/hand-tools', icon: Wrench },
    { name: 'Machines', href: '/shop/category/machines', icon: Cog },
    { name: 'Polishing', href: '/shop/category/polishing', icon: Sparkles },
    { name: 'Cleaning', href: '/shop/category/chemicals', icon: Droplets },
    { name: 'Packaging', href: '/shop/category/packaging', icon: Package }
];

export function Hero() {
    const [config, setConfig] = useState<HeroConfig>(DEFAULT_HERO_CONFIG);
    const [featuredProducts, setFeaturedProducts] = useState<HeroProductItem[]>([]);
    const [liveCount, setLiveCount] = useState<number>(80);
    const [isAnnouncementDismissed, setIsAnnouncementDismissed] = useState<boolean>(false);

    // Initial check for session-dismissed announcement
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                const dismissed = sessionStorage.getItem('dns_hero_announcement_dismissed');
                if (dismissed === 'true') {
                    setIsAnnouncementDismissed(true);
                }
            }
        } catch (e) {}
    }, []);

    // 1. Fetch CMS Banner configuration & active announcements
    useEffect(() => {
        async function fetchCmsData() {
            try {
                // Check homepage_banners
                const { data: banners } = await supabase
                    .from('homepage_banners')
                    .select('*')
                    .eq('active', true)
                    .order('display_order', { ascending: true })
                    .limit(1);

                if (banners && banners.length > 0) {
                    const b = banners[0];
                    setConfig(prev => ({
                        ...prev,
                        eyebrow: b.eyebrow?.trim() || prev.eyebrow,
                        title: b.title?.trim() || prev.title,
                        subtitle: b.subtitle?.trim() || prev.subtitle,
                        primaryButtonText: b.button_text?.trim() || prev.primaryButtonText,
                        primaryButtonLink: b.link?.trim() || prev.primaryButtonLink,
                        secondaryButtonText: b.secondary_button_text?.trim() || prev.secondaryButtonText,
                        secondaryButtonLink: b.secondary_link?.trim() || prev.secondaryButtonLink,
                        whatsAppNumber: b.whatsapp_number?.trim() || prev.whatsAppNumber,
                        whatsAppMessage: b.whatsapp_message?.trim() || prev.whatsAppMessage,
                        trustItems: Array.isArray(b.trust_items) && b.trust_items.length > 0 ? b.trust_items : prev.trustItems
                    }));
                }

                // Check active announcements for optional dismissible offer bar
                const { data: annList } = await supabase
                    .from('announcements')
                    .select('message')
                    .eq('active', true)
                    .limit(1);

                if (annList && annList.length > 0 && annList[0].message) {
                    setConfig(prev => ({ ...prev, announcementMessage: annList[0].message }));
                }
            } catch (err) {
                // Graceful fallback to default config
            }
        }

        fetchCmsData();
    }, []);

    // 2. Fetch live in-stock products for the showcase carousel
    useEffect(() => {
        async function fetchProducts() {
            try {
                // Get exact count of in-stock items with retail_price > 0
                const { count } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .eq('in_stock', true)
                    .gt('retail_price', 0);

                if (typeof count === 'number' && count > 0) {
                    setLiveCount(count);
                }

                // Try fetching products flagged featured_on_hero
                let candidateProducts: any[] = [];
                try {
                    const { data: flagged } = await supabase
                        .from('products')
                        .select('id, name, retail_price, in_stock, image, category, sku, specifications')
                        .eq('in_stock', true)
                        .gt('retail_price', 0)
                        .eq('featured_on_hero', true)
                        .limit(6);

                    if (flagged && flagged.length >= 2) {
                        candidateProducts = flagged;
                    }
                } catch (e) {
                    // Column might not exist yet; fall through
                }

                // If not enough flagged, fallback to newest in-stock products
                if (candidateProducts.length < 2) {
                    const { data: newest } = await supabase
                        .from('products')
                        .select('id, name, retail_price, in_stock, image, category, sku, specifications')
                        .eq('in_stock', true)
                        .gt('retail_price', 0)
                        .order('created_at', { ascending: false })
                        .limit(6);

                    if (newest && newest.length > 0) {
                        candidateProducts = newest;
                    }
                }

                if (candidateProducts.length >= 2) {
                    const mapped: HeroProductItem[] = candidateProducts.map(p => {
                        const norm = normalizeProduct(p);
                        return {
                            id: norm.id,
                            name: norm.name,
                            category: norm.category,
                            retailPrice: norm.retailPrice,
                            image: norm.image || '/placeholder.jpg',
                            slug: norm.slug
                        };
                    });
                    setFeaturedProducts(mapped);
                    return;
                }
            } catch (err) {
                // Fallback below
            }

            // Safe offline fallback: curated in-stock local items
            const localFiltered = initialLocalProducts
                .filter(p => p.inStock && p.retailPrice > 0 && p.primaryImage)
                .slice(0, 6)
                .map(p => {
                    const norm = normalizeProduct(p);
                    return {
                        id: norm.id,
                        name: norm.name,
                        category: norm.category,
                        retailPrice: norm.retailPrice,
                        image: norm.image || norm.primaryImage || '/placeholder.jpg',
                        slug: norm.slug
                    };
                });

            setFeaturedProducts(localFiltered);
        }

        fetchProducts();
    }, []);

    const handleDismissAnnouncement = () => {
        setIsAnnouncementDismissed(true);
        try {
            sessionStorage.setItem('dns_hero_announcement_dismissed', 'true');
        } catch (e) {}
    };

    const whatsAppHref = config.whatsAppNumber
        ? `https://wa.me/${config.whatsAppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(config.whatsAppMessage)}`
        : '';

    return (
        <section 
            aria-labelledby="hero-heading"
            className="relative w-full bg-[#FAF9F5] text-[#18181B] border-b border-[#E8E2D5] overflow-hidden"
        >
            {/* 1. OPTIONAL DISMISSIBLE ANNOUNCEMENT / OFFER BAR */}
            {config.announcementMessage && !isAnnouncementDismissed && (
                <div 
                    role="region" 
                    aria-label="Store Announcement"
                    className="w-full bg-[#F7F2EA] border-b border-[#E8E2D5] text-[#7A541E] text-xs font-medium py-2 px-3.5 transition-all"
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#966E2E] shrink-0" aria-hidden="true" />
                            <p className="truncate text-[11px] sm:text-xs">
                                {config.announcementMessage}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleDismissAnnouncement}
                            className="p-1 hover:bg-[#E8E2D5]/50 rounded-md text-[#7A541E] transition-colors cursor-pointer shrink-0"
                            aria-label="Dismiss announcement"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* MAIN HERO CONTAINER (Strict mobile-first layout with desktop two-column enhancement) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 lg:pt-12 pb-6 sm:pb-8 lg:pb-12">
                
                {/* Responsive Grid: Single column on mobile/tablet, 2-column on desktop (lg:1024px+) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
                    
                    {/* =========================================================================
                        LEFT COLUMN: Core Value Pitch & Direct CTAs
                        Must fit within first 640px height on mobile devices!
                       ========================================================================= */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left space-y-3.5 sm:space-y-4">
                        
                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-2 bg-white border border-[#E8E2D5] rounded-full px-3 py-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#966E2E]" aria-hidden="true" />
                            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-wider text-[#7A541E] uppercase">
                                {config.eyebrow}
                            </span>
                        </div>

                        {/* Single Semantic H1 */}
                        <h1 
                            id="hero-heading"
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-[#18181B] tracking-tight leading-[1.12]"
                        >
                            {config.title}
                        </h1>

                        {/* Subheading */}
                        <p className="text-sm sm:text-base text-[#52525B] leading-relaxed max-w-2xl font-normal">
                            {config.subtitle}
                        </p>

                        {/* Call to Actions (Mobile-first, full-width touch targets >= 44px) */}
                        <div className="w-full pt-1 sm:pt-2 space-y-2.5 sm:space-y-0 sm:flex sm:items-center sm:gap-3.5">
                            {/* Primary Retail CTA */}
                            <Link 
                                href={config.primaryButtonLink}
                                className="w-full sm:w-auto block"
                            >
                                <button
                                    type="button"
                                    className="w-full sm:w-auto h-[52px] px-6 sm:px-8 bg-[#966E2E] hover:bg-[#7D5A25] active:bg-[#684618] text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#966E2E] focus-visible:ring-offset-2"
                                >
                                    <span>{config.primaryButtonText}</span>
                                    <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
                                </button>
                            </Link>

                            {/* Secondary Wholesale / B2B CTA */}
                            <Link 
                                href={config.secondaryButtonLink}
                                className="w-full sm:w-auto block"
                            >
                                <button
                                    type="button"
                                    className="w-full sm:w-auto h-[48px] sm:h-[52px] px-5 sm:px-7 bg-white hover:bg-[#FAF9F5] border border-[#E8E2D5] hover:border-[#966E2E] text-[#18181B] font-semibold text-sm rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#966E2E] focus-visible:ring-offset-2"
                                >
                                    <span>{config.secondaryButtonText}</span>
                                    <ChevronRight size={16} className="text-[#966E2E]" aria-hidden="true" />
                                </button>
                            </Link>
                        </div>

                        {/* Tertiary WhatsApp Action */}
                        {whatsAppHref && (
                            <div className="pt-1">
                                <a 
                                    href={whatsAppHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7A541E] hover:text-[#58390F] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#966E2E] rounded-md px-1 py-0.5"
                                >
                                    <MessageCircle size={15} className="text-[#25D366]" aria-hidden="true" />
                                    <span>Chat on WhatsApp for custom orders & bulk inquiries</span>
                                </a>
                            </div>
                        )}

                        {/* Desktop Trust Strip (Displayed under CTAs in left column on desktop) */}
                        <div className="hidden lg:grid grid-cols-2 gap-3 pt-6 w-full border-t border-[#E8E2D5]">
                            {config.trustItems.filter(item => item.enabled).map((item) => {
                                const isCatalog = item.id === 'catalog';
                                const displayLabel = isCatalog ? `${liveCount}+ products` : item.label;

                                return (
                                    <div key={item.id} className="flex items-start gap-2.5">
                                        <div className="w-7 h-7 rounded-lg bg-white border border-[#E8E2D5] flex items-center justify-center shrink-0 text-[#966E2E] mt-0.5">
                                            {item.id === 'since1960' && <History size={14} />}
                                            {item.id === 'gst' && <Receipt size={14} />}
                                            {item.id === 'shipping' && <Truck size={14} />}
                                            {item.id === 'catalog' && <CheckCircle2 size={14} />}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-[#18181B] leading-tight">
                                                {displayLabel}
                                            </div>
                                            <div className="text-[11px] text-[#71717A] leading-tight mt-0.5">
                                                {item.sublabel}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </div>

                    {/* =========================================================================
                        RIGHT COLUMN: Live Product Showcase Carousel
                       ========================================================================= */}
                    <div className="lg:col-span-5 w-full">
                        <HeroCarousel products={featuredProducts} />
                    </div>

                </div>

                {/* =========================================================================
                    CATEGORY QUICK SHORTCUTS (Replace old chips)
                    Mobile: swipeable single row with fade edge. Desktop: clean inline row.
                   ========================================================================= */}
                <div className="mt-8 pt-5 border-t border-[#E8E2D5]">
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-mono font-bold tracking-wider text-[#71717A] uppercase">
                            POPULAR CATEGORIES
                        </span>
                        <Link 
                            href="/shop" 
                            className="text-[11px] font-semibold text-[#7A541E] hover:underline flex items-center gap-0.5"
                        >
                            All Categories <ChevronRight size={12} aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar touch-pan-x -mx-4 px-4 sm:mx-0 sm:px-0">
                        {CATEGORY_SHORTCUTS.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <Link
                                    key={cat.name}
                                    href={cat.href}
                                    className="shrink-0 min-h-[44px] px-3.5 py-2 bg-white hover:bg-[#FAF9F5] active:bg-[#F3EFE6] border border-[#E8E2D5] hover:border-[#966E2E] rounded-xl text-xs font-medium text-[#18181B] transition-all flex items-center gap-2 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#966E2E]"
                                >
                                    <Icon size={14} className="text-[#966E2E]" aria-hidden="true" />
                                    <span>{cat.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* =========================================================================
                    MOBILE TRUST STRIP (< 1024px)
                    2x2 Grid with high-contrast text and clean borders
                   ========================================================================= */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-4 lg:hidden border-t border-[#E8E2D5]">
                    {config.trustItems.filter(item => item.enabled).map((item) => {
                        const isCatalog = item.id === 'catalog';
                        const displayLabel = isCatalog ? `${liveCount}+ products` : item.label;

                        return (
                            <div 
                                key={item.id} 
                                className="bg-white border border-[#E8E2D5] rounded-xl p-2.5 shadow-2xs flex flex-col justify-center"
                            >
                                <div className="text-xs font-bold text-[#18181B] leading-tight">
                                    {displayLabel}
                                </div>
                                <div className="text-[10px] text-[#71717A] mt-0.5 leading-snug">
                                    {item.sublabel}
                                </div>
                            </div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
