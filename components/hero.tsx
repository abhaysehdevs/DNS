'use client';

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Sliders, Compass, Flame, ShieldCheck, Zap, Award, Search, CheckCircle2, ChevronRight, Package, Wrench, Layers } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface ShowcaseCategory {
    id: string;
    title: string;
    categoryLabel: string;
    badge: string;
    image: string;
    tagline: string;
    link: string;
    specs: { label: string; value: string }[];
    description: string;
    icon: any;
    glowColor: string;
}

const CATEGORY_SHOWCASES: ShowcaseCategory[] = [
    {
        id: 'tools',
        title: 'Precision Goldsmith Tools',
        categoryLabel: 'HAND TOOLS & INSTRUMENTS',
        badge: 'SUS316 // 62 HRC HARDNESS',
        image: '/images/products/15f-tweezers.png',
        tagline: 'Micro-tolerance stainless steel tweezers, pliers, cutters & setting instruments.',
        description: 'Engineered for precision stone setting, delicate soldering, and microscopic metalwork. Manufactured from high-grade anti-magnetic alloys.',
        link: '/shop?cat=Tools',
        specs: [
            { label: 'Material', value: 'Non-Magnetic SUS316 Stainless Steel' },
            { label: 'Hardness', value: '62 HRC Tempered Tips' },
            { label: 'Precision', value: 'Zero-Tolerance Alignment' }
        ],
        icon: Sliders,
        glowColor: '#A67C35'
    },
    {
        id: 'machinery',
        title: 'Jewellery Workshop Machinery',
        categoryLabel: 'HEAVY MACHINERY & EQUIPMENT',
        badge: '2.5 HP // 500 CFM DUST EXTRACTOR',
        image: '/images/products/sand-blasting-dust-collector-machine.png',
        tagline: 'Industrial sand blasters, polishing dust collectors & motor units calibrated for output.',
        description: 'High-torque workshop machinery built for gold recovery, metal surface texturing, and heavy-duty continuous operations.',
        link: '/shop?cat=Machinery',
        specs: [
            { label: 'Motor Rating', value: '2.5 HP Heavy Duty Copper Wound' },
            { label: 'Filtration', value: 'Dual HEPA Dust Collector Chamber' },
            { label: 'Airflow', value: '500 CFM High Vacuum' }
        ],
        icon: Compass,
        glowColor: '#8A6232'
    },
    {
        id: 'torch',
        title: 'Automatic Brazing & Soldering',
        categoryLabel: 'WELDING & MELTING',
        badge: '3200°F PEAK MELTING TEMP',
        image: '/images/products/gas-torch-auto.png',
        tagline: 'Piezo auto-ignition torches, gas burners & flux accessories for gold casting.',
        description: 'Self-igniting micro torches with needle-valve flame regulation designed for seamless gold, silver, and platinum soldering.',
        link: '/shop?cat=Tools',
        specs: [
            { label: 'Max Temp', value: '3200°F (1760°C) Pinpoint Flame' },
            { label: 'Ignition', value: 'Instant Piezo Push Trigger' },
            { label: 'Fuel Compat', value: 'LPG / MAPP / Propane Gas' }
        ],
        icon: Flame,
        glowColor: '#DFCE9F'
    },
    {
        id: 'polishing',
        title: 'Polishing & Finishing Buffs',
        categoryLabel: 'BUFFING & CONSUMABLES',
        badge: 'HIGH-GLOSS MIRROR FINISH',
        image: '/images/products/15f-tweezers.png',
        tagline: 'Cotton buff wheels, rouge compounds, and bristle brushes for high mirror lustre.',
        description: 'Specially treated stitched cotton buffs and diamond polishing compounds formulated for ultra-smooth finishing of precious alloys.',
        link: '/shop?cat=Consumables',
        specs: [
            { label: 'Buff Type', value: 'Fine Cotton Stitched & Loose' },
            { label: 'Applications', value: 'Gold, Silver & Platinum Lustre' },
            { label: 'Durability', value: 'Reinforced Center Washer' }
        ],
        icon: Wrench,
        glowColor: '#C9A84C'
    },
    {
        id: 'packaging',
        title: 'Luxury Packaging & Trays',
        categoryLabel: 'PACKAGING & DISPLAY',
        badge: 'PREMIUM VELVET & LEATHERETTE',
        image: '/images/products/sand-blasting-dust-collector-machine.png',
        tagline: 'Custom jewellery presentation boxes, velvet rolls, and counter display organizers.',
        description: 'Elevate your retail brand with bespoke jewellery display boxes, gem counters, and velvet storage trays.',
        link: '/shop?cat=Packaging',
        specs: [
            { label: 'Finishing', value: 'Soft Micro-Velvet & Matte Leatherette' },
            { label: 'Branding', value: 'Custom Gold Foil Embossing Available' },
            { label: 'Capacity', value: 'Multi-Compartment Organizer Trays' }
        ],
        icon: Package,
        glowColor: '#A67C35'
    }
];

export function Hero() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
    const [activeTabId, setActiveTabId] = useState<string>('tools');
    const [searchQuery, setSearchQuery] = useState('');
    const [banners, setBanners] = useState<any[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    const activeShowcase = CATEGORY_SHOWCASES.find(c => c.id === activeTabId) || CATEGORY_SHOWCASES[0];

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data, error } = await supabase
                    .from('homepage_banners')
                    .select('*')
                    .eq('active', true)
                    .order('display_order');
                if (!error && data) {
                    setBanners(data);
                }
            } catch (err) {
                console.error('Error loading banners:', err);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [banners]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            setMousePosition({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const smoothX = useSpring(useMotionValue(0.5), { damping: 40, stiffness: 220 });
    const smoothY = useSpring(useMotionValue(0.5), { damping: 40, stiffness: 220 });

    useEffect(() => {
        smoothX.set(mousePosition.x - 0.5);
        smoothY.set(mousePosition.y - 0.5);
    }, [mousePosition, smoothX, smoothY]);

    const cardRotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
    const cardRotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <section 
            ref={containerRef}
            className="relative w-full flex flex-col justify-start lg:justify-center lg:min-h-[92vh] bg-[#090909] text-[#F8F3E8] overflow-hidden pt-2 sm:pt-4 lg:pt-24 pb-4 sm:pb-6 lg:pb-16 px-3.5 sm:px-8 md:px-12 lg:px-16 border-b border-[#343434]"
        >
            {/* Ambient Radial Spotlight */}
            <div 
                className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-700 opacity-30"
                style={{
                    background: `radial-gradient(900px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(166, 124, 53, 0.12), transparent 70%)`
                }}
            />

            {/* Grid Pattern Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(166,124,53,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(166,124,53,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0" />
            
            {/* Top Glow Blur Pill */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-[#A67C35]/10 rounded-full blur-[140px] pointer-events-none z-0" />

            <div className="container mx-auto max-w-7xl relative z-10 w-full">
                
                {/* ==================== 1. MOBILE DEDICATED HERO (lg:hidden) ==================== */}
                <div className="block lg:hidden w-full max-w-lg mx-auto space-y-2.5">
                    
                    {/* 1. Flagship Brand Banner Card */}
                    <div className="relative w-full rounded-2xl overflow-hidden border border-[#A67C35]/35 bg-gradient-to-br from-[#1C1812] via-[#131313] to-[#0A0A0A] p-4 sm:p-5 shadow-2xl text-left">
                        {/* Background Storefront Watermark Overlay */}
                        <div 
                            className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center mix-blend-luminosity"
                            style={{ backgroundImage: "url('/headquarters_storefront.png')" }}
                        />
                        {/* Ambient Gradient Glow */}
                        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#A67C35]/20 blur-[60px] pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/75 to-transparent pointer-events-none" />

                        <div className="relative z-10 flex flex-col space-y-2">
                            {/* Heritage Badge */}
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center gap-1.5 bg-[#1E1E1E]/90 border border-[#A67C35]/40 rounded-full px-3 py-1 shadow-sm backdrop-blur-sm">
                                    <Sparkles size={11} className="text-[#A67C35] animate-pulse" />
                                    <span className="text-[8.5px] font-mono font-bold tracking-[0.15em] text-[#A67C35] uppercase">
                                        ESTD 1960 • CHANDNI CHOWK, DELHI
                                    </span>
                                </div>
                                <span className="text-[8px] font-mono text-[#DFCE9F] font-bold tracking-wider uppercase border border-[#A67C35]/30 px-2 py-0.5 rounded-md bg-[#181818]/80">
                                    3RD GEN
                                </span>
                            </div>

                            {/* Headline */}
                            <div className="pt-1">
                                <h1 className="text-[23px] font-black font-display tracking-wide uppercase text-white leading-tight">
                                    Dinanath <span className="text-[#A67C35] font-sans font-light tracking-[0.1em]">& SONS</span>
                                </h1>
                                <div className="text-[11px] font-bold text-[#DFCE9F] tracking-wide uppercase mt-0.5">
                                    Jewellery Tools & Equipment Pioneer
                                </div>
                            </div>

                            {/* Value Pitch */}
                            <p className="text-[10.5px] text-[#A8A8B0] leading-relaxed font-light">
                                Supplying India's master goldsmiths with precision tweezers, casting torches, and industrial polishing machinery.
                            </p>

                            {/* Action CTA Buttons */}
                            <div className="flex items-center gap-2.5 pt-2">
                                <Link href="/shop" className="flex-1">
                                    <button className="w-full h-10 bg-[#A67C35] hover:bg-[#8A6232] text-black font-black uppercase tracking-wider text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg active:scale-95 cursor-pointer">
                                        <span>Explore 500+ Tools</span>
                                        <ArrowRight size={13} strokeWidth={2.5} />
                                    </button>
                                </Link>
                                <Link href="/shop/category/machines" className="flex-1">
                                    <button className="w-full h-10 bg-[#1E1E1E] border border-[#3A3A3A] hover:border-[#A67C35] text-[#F8F3E8] font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer">
                                        <span>Machinery</span>
                                        <ChevronRight size={13} className="text-[#A67C35]" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 4. Trust & Heritage Stats Strip */}
                    <div className="grid grid-cols-4 gap-1.5 w-full pt-1">
                        {[
                            { label: "60+ YRS", sub: "Heritage" },
                            { label: "500+", sub: "Tools" },
                            { label: "PAN INDIA", sub: "Dispatch" },
                            { label: "100%", sub: "Genuine" }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-[#141414] border border-[#2B2B2B] rounded-xl py-2 px-1 text-center shadow-xs">
                                <div className="text-[11px] font-black text-[#A67C35] font-mono leading-none">{stat.label}</div>
                                <div className="text-[7.5px] text-[#8E8E9A] font-bold uppercase tracking-wider mt-1 leading-none">{stat.sub}</div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* ==================== 2. DESKTOP HERO DISPLAY GRID (hidden lg:block) ==================== */}
                <div className="hidden lg:block w-full">
                    {/* 1. HERITAGE & VALUE BANNER STRIP */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#343434]/50">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2.5 bg-[#1E1E1E] border border-[#A67C35]/30 rounded-full px-4 py-1.5 shadow-lg"
                        >
                            <Sparkles size={12} className="text-[#A67C35] animate-pulse" />
                            <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#A67C35] uppercase">
                                ESTABLISHED 1960 • CHANDNI CHOWK, NEW DELHI
                            </span>
                        </motion.div>

                        {/* Quick Category Quick-Nav Chips */}
                        <div className="flex items-center gap-2">
                            {CATEGORY_SHOWCASES.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeTabId === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveTabId(cat.id)}
                                        className={`px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                                            isActive 
                                                ? 'bg-[#A67C35] text-black border-[#A67C35] shadow-md shadow-[#A67C35]/20 font-black' 
                                                : 'bg-[#1E1E1E]/60 text-[#CFCFCF] border-[#343434] hover:border-[#A67C35]/50 hover:text-[#F8F3E8]'
                                        }`}
                                    >
                                        <Icon size={11} />
                                        <span>{cat.title.split(' ')[0]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. MAIN HERO DISPLAY GRID */}
                    <div className="grid grid-cols-12 gap-14 items-center">
                        
                        {/* LEFT COLUMN: BRAND PROPOSITION & INTERACTIVE CONTROLS */}
                        <div className="col-span-6 flex flex-col space-y-6 text-left items-start">
                            
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-3"
                            >
                                <h1 className="text-5xl lg:text-6xl font-black font-display tracking-wider uppercase leading-[1.08] text-white">
                                    Dinanath
                                    <span className="block text-3xl lg:text-4xl text-[#A67C35] font-sans font-light mt-1 tracking-[0.2em]">
                                        & SONS
                                    </span>
                                </h1>

                                <h2 className="text-2xl font-display font-light uppercase tracking-wide leading-snug pt-1 text-[#F8F3E8]">
                                    India's Premier <span className="bg-gradient-to-r from-[#DFCE9F] via-[#A67C35] to-[#8A6232] bg-clip-text text-transparent font-bold">Jewellery Tools & Equipment</span> Pioneer
                                </h2>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-sm text-[#CFCFCF] leading-relaxed max-w-xl font-light tracking-wide opacity-90"
                            >
                                Equipping over three generations of master goldsmiths, jewelry manufacturers, and casting workshops with precision tweezers, heavy polishing machines, automatic gas torches, and certified supplies.
                            </motion.p>

                            {/* Interactive Search Launcher */}
                            <motion.form 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                onSubmit={handleSearchSubmit}
                                className="w-full max-w-lg relative flex items-center bg-[#1E1E1E] border border-[#343434] hover:border-[#A67C35]/60 rounded-xl overflow-hidden shadow-2xl transition-all h-12"
                            >
                                <div className="pl-4 text-[#A67C35]">
                                    <Search size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search catalog: Tweezers, Dust Collectors, Torches, Buffs..."
                                    className="w-full py-3.5 px-3 bg-transparent text-xs text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none font-medium"
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-3.5 bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase text-[9px] tracking-widest transition-colors flex items-center gap-1.5 shrink-0"
                                >
                                    <span>Search</span>
                                    <ArrowRight size={12} strokeWidth={2.5} />
                                </button>
                            </motion.form>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-wrap gap-4 pt-1"
                            >
                                <Link href="/shop">
                                    <button className="h-12 px-7 bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase tracking-widest text-[9.5px] rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 shadow-xl border-none cursor-pointer">
                                        <span>Explore Full Catalog</span>
                                        <ArrowRight size={14} strokeWidth={2.5} />
                                    </button>
                                </Link>

                                <Link href={activeShowcase.link}>
                                    <button className="h-12 px-7 bg-[#1E1E1E] border border-[#343434] hover:border-[#A67C35] text-[#F8F3E8] font-bold uppercase tracking-widest text-[9.5px] rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer">
                                        <span>Browse {activeShowcase.title.split(' ')[0]}</span>
                                        <ChevronRight size={14} className="text-[#A67C35]" />
                                    </button>
                                </Link>
                            </motion.div>

                            {/* Interactive Feature Badges */}
                            <div className="grid grid-cols-4 gap-3 pt-4 w-full">
                                {[
                                    { label: "60+ YRS", sub: "Heritage Excellence" },
                                    { label: "500+", sub: "Jewellery Tools" },
                                    { label: "PAN INDIA", sub: "Fast Dispatch" },
                                    { label: "100%", sub: "Quality Assured" }
                                ].map((stat, idx) => (
                                    <div key={idx} className="bg-[#151515] border border-[#343434] rounded-xl p-2.5 text-center shadow">
                                        <div className="text-sm font-black text-[#A67C35] uppercase font-mono">{stat.label}</div>
                                        <div className="text-[7.5px] text-[#8E8E9A] font-bold uppercase tracking-wider mt-0.5">{stat.sub}</div>
                                    </div>
                                ))}
                            </div>

                        </div>

                        {/* RIGHT COLUMN: INTERACTIVE 3D CATEGORY SHOWCASE CARD */}
                        <div className="col-span-6 flex flex-col items-center justify-center w-full relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeShowcase.id}
                                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96, y: -15 }}
                                    transition={{ duration: 0.4 }}
                                    style={{
                                        rotateX: cardRotateX,
                                        rotateY: cardRotateY,
                                        transformStyle: 'preserve-3d'
                                    }}
                                    className="relative w-full max-w-lg bg-[#141414]/90 border border-[#A67C35]/40 rounded-3xl p-8 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-xl group select-none"
                                >
                                    {/* Radial Glow Behind Image */}
                                    <div 
                                        className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-[80px] opacity-25 pointer-events-none transition-all duration-700"
                                        style={{ backgroundColor: activeShowcase.glowColor }}
                                    />

                                    {/* Header Tag */}
                                    <div className="flex items-center justify-between w-full mb-4 relative z-10 border-b border-[#343434]/60 pb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#A67C35] animate-ping" />
                                            <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-[#A67C35] uppercase">
                                                {activeShowcase.categoryLabel}
                                            </span>
                                        </div>
                                        <span className="text-[7.5px] font-mono text-black font-extrabold bg-[#A67C35] px-2.5 py-0.5 rounded uppercase tracking-wider shadow">
                                            {activeShowcase.badge}
                                        </span>
                                    </div>

                                    {/* Main Showcase Image */}
                                    <div className="w-full h-64 flex items-center justify-center p-4 relative z-10 my-2">
                                        <img 
                                            src={activeShowcase.image} 
                                            alt={activeShowcase.title}
                                            className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/logo.png';
                                            }}
                                        />
                                    </div>

                                    {/* Content & Live Spec Badges */}
                                    <div className="relative z-10 space-y-3 pt-3 border-t border-[#343434]/60 text-left">
                                        <div>
                                            <h3 className="text-xl font-bold text-[#F8F3E8] uppercase tracking-wide">
                                                {activeShowcase.title}
                                            </h3>
                                            <p className="text-xs text-[#CFCFCF] font-light leading-relaxed mt-1 line-clamp-2">
                                                {activeShowcase.description}
                                            </p>
                                        </div>

                                        {/* Specifications Grid */}
                                        <div className="grid grid-cols-1 gap-1.5 pt-1">
                                            {activeShowcase.specs.map((spec, i) => (
                                                <div key={i} className="flex items-center justify-between text-[8.5px] bg-[#1E1E1E] px-3 py-1.5 rounded-lg border border-[#343434]/40">
                                                    <span className="text-[#8E8E9A] font-mono uppercase tracking-wider">{spec.label}</span>
                                                    <span className="text-[#A67C35] font-bold font-mono tracking-wider">{spec.value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Action Bar */}
                                        <div className="pt-2 flex items-center justify-between">
                                            <Link href={activeShowcase.link} className="w-full">
                                                <button className="w-full h-11 bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase tracking-widest text-[9px] rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer">
                                                    <span>View {activeShowcase.title}</span>
                                                    <ArrowRight size={13} strokeWidth={2.5} />
                                                </button>
                                            </Link>
                                        </div>

                                    </div>

                                </motion.div>
                            </AnimatePresence>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
