'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Sliders, Compass, Flame } from 'lucide-react';
import Link from 'next/link';

interface ProductItem {
    id: 'tools' | 'machinery' | 'torch';
    title: string;
    categoryLabel: string;
    badge: string;
    image: string;
    fallbackImage: string;
    tagline: string;
    link: string;
    specsSummary: string;
    icon: any;
    glowClass: string;
    staggerClass: string;
}

const ITEMS: ProductItem[] = [
    {
        id: 'tools',
        title: 'Precision Tweezers',
        categoryLabel: 'TOOLS',
        badge: '62 HRC // SUS316',
        image: '/images/products/15f-tweezers.png',
        fallbackImage: "/images/products/dinanath's-aa-tweezers.png",
        tagline: 'High-hardness stainless steel tweezers engineered for micro-tolerances.',
        link: '/shop?cat=Tools',
        specsSummary: 'Hardness rating: 62 HRC',
        icon: Sliders,
        glowClass: 'bg-[#A67C35]',
        staggerClass: 'lg:translate-y-6'
    },
    {
        id: 'machinery',
        title: 'Heavy Machinery',
        categoryLabel: 'MACHINES',
        badge: '2.5 HP // 500 CFM',
        image: '/images/products/sand-blasting-dust-collector-machine.png',
        fallbackImage: '/placeholder.jpg',
        tagline: 'Polishing dust collectors and sand blasters calibrated for industrial output.',
        link: '/shop?cat=Machinery',
        specsSummary: 'Airflow capacity: 500 CFM',
        icon: Compass,
        glowClass: 'bg-[#8A6232]',
        staggerClass: 'lg:-translate-y-4'
    },
    {
        id: 'torch',
        title: 'Automatic Gas Torch',
        categoryLabel: 'WELDING',
        badge: '3200°F PEAK TEMP',
        image: '/images/products/gas-torch-auto.png',
        fallbackImage: '/placeholder.jpg',
        tagline: 'Self-igniting automatic gas torches optimized for brazing & soldering.',
        link: '/shop?cat=Tools',
        specsSummary: 'Regulated needle valve control',
        icon: Flame,
        glowClass: 'bg-[#DFCE9F]',
        staggerClass: 'lg:translate-y-12'
    }
];

export function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
    const [hoveredId, setHoveredId] = useState<string | null>(null);

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

    // Smooth cursor movement spring
    const smoothX = useSpring(useMotionValue(0.5), { damping: 40, stiffness: 220 });
    const smoothY = useSpring(useMotionValue(0.5), { damping: 40, stiffness: 220 });

    useEffect(() => {
        smoothX.set(mousePosition.x - 0.5);
        smoothY.set(mousePosition.y - 0.5);
    }, [mousePosition]);

    return (
        <section 
            ref={containerRef}
            className="relative min-h-[95vh] lg:min-h-screen w-full flex items-center justify-center bg-[#070707] text-[#F8F3E8] overflow-hidden pt-24 pb-16 lg:py-0 px-6 md:px-12 lg:px-16"
        >
            {/* Ambient cursor spotlight */}
            <div 
                className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-500 opacity-40"
                style={{
                    background: `radial-gradient(750px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(166, 124, 53, 0.05), transparent 70%)`
                }}
            />

            {/* Subtle mesh backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(166,124,53,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(166,124,53,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />

            <div className="container mx-auto max-w-7xl relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    
                    {/* LEFT COLUMN: BRAND HUD AND COPY */}
                    <div className="lg:col-span-4 flex flex-col space-y-6 lg:space-y-8 text-left items-start">
                        
                        {/* Elegant Minimalist Heritage Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 text-[#A67C35] font-mono text-[9px] tracking-[0.35em] uppercase font-bold"
                        >
                            <Sparkles size={10} className="opacity-80" />
                            <span>ESTABLISHED 1960 • NEW DELHI</span>
                        </motion.div>

                        {/* Brand typography */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="space-y-2"
                        >
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display tracking-wider uppercase leading-[1.08]">
                                Dinanath
                                <span className="block text-2xl sm:text-3xl lg:text-4xl text-[#8E8E9A] font-sans font-light mt-1.5 tracking-[0.2em]">& SONS</span>
                            </h1>
                            <h2 className="text-xl sm:text-2xl font-display font-light uppercase tracking-widest leading-snug pt-2">
                                Precision Tools For <br />
                                <span className="bg-gradient-to-r from-[#DFCE9F] via-[#A67C35] to-[#8A6232] bg-clip-text text-transparent font-bold">
                                    Master Jewellers
                                </span>
                            </h2>
                        </motion.div>

                        {/* Tagline */}
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-xs sm:text-sm text-[#CFCFCF] leading-relaxed max-w-lg opacity-75 font-light tracking-wide"
                        >
                            For three generations, we have engineered high-hardness instruments, heavy machinery, and calibrated workshop tools to refine the artistry of India’s master goldsmiths.
                        </motion.p>

                        {/* CTA Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-wrap gap-4 pt-2"
                        >
                            <Link href="/shop">
                                <button className="h-12 px-8 bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase tracking-widest text-[9.5px] rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 shadow-lg border-none cursor-pointer">
                                    Explore Catalog
                                    <ArrowRight size={13} strokeWidth={2.5} />
                                </button>
                            </Link>
                            <Link href="/about">
                                <button className="h-12 px-8 bg-transparent border border-[#343434] hover:border-[#A67C35] text-[#CFCFCF] hover:text-[#F8F3E8] font-bold uppercase tracking-widest text-[9.5px] rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer">
                                    Our Legacy
                                </button>
                            </Link>
                        </motion.div>

                    </div>

                    {/* RIGHT COLUMN: MULTI-PRODUCT STAGGERED DECK */}
                    <div className="lg:col-span-8 flex flex-col justify-center w-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-6 w-full relative pt-8 md:pt-0 pb-12 md:pb-0">
                            
                            {ITEMS.map((item, index) => {
                                const CardIcon = item.icon;
                                const isCardHovered = hoveredId === item.id;
                                const isSomeCardHovered = hoveredId !== null;
                                const isDimmed = isSomeCardHovered && !isCardHovered;

                                // Individual card parallax tracking inside the hook
                                const cardRotateX = useTransform(smoothY, [-0.5, 0.5], [6, -6]);
                                const cardRotateY = useTransform(smoothX, [-0.5, 0.5], [-6, 6]);

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.15 + index * 0.1 }}
                                        style={{
                                            rotateX: isCardHovered ? cardRotateX : 0,
                                            rotateY: isCardHovered ? cardRotateY : 0,
                                            transformStyle: 'preserve-3d'
                                        }}
                                        onMouseEnter={() => setHoveredId(item.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        className={`relative w-full aspect-[4/5] bg-[#121212]/30 border border-[#242424] hover:border-[#A67C35]/50 rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-xl backdrop-blur-md transition-all duration-500 group select-none ${
                                            item.staggerClass
                                        } ${
                                            isDimmed ? 'opacity-30 scale-[0.96] blur-[0.5px]' : 'opacity-100 scale-100'
                                        } ${
                                            isCardHovered ? 'shadow-[0_15px_35px_rgba(0,0,0,0.7)] border-[#A67C35]' : ''
                                        }`}
                                    >
                                        {/* Card Radial Spotlight Glow */}
                                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[75%] rounded-full blur-[45px] transition-all duration-700 opacity-10 group-hover:opacity-20 pointer-events-none ${item.glowClass}`} />

                                        {/* Dynamic Header */}
                                        <div className="flex items-center justify-between w-full relative z-10">
                                            <span className="text-[7.5px] font-mono tracking-widest text-[#8E8E9A] group-hover:text-[#A67C35] transition-colors">
                                                {item.categoryLabel}
                                            </span>
                                            <div className="text-[#8E8E9A] group-hover:text-[#A67C35] transition-colors">
                                                <CardIcon size={12} strokeWidth={2} />
                                            </div>
                                        </div>

                                        {/* Main Product Showcase Area */}
                                        <div className="w-full flex-1 flex items-center justify-center p-3 relative z-10">
                                            <img 
                                                src={item.image} 
                                                alt={item.title} 
                                                className="max-h-[85%] max-w-[85%] object-contain mix-blend-lighten transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = item.fallbackImage;
                                                }}
                                            />
                                        </div>

                                        {/* Details & Specs Section */}
                                        <div className="flex flex-col text-left space-y-1 relative z-10 mt-auto pt-2 border-t border-[#242424]/40 group-hover:border-[#A67C35]/20 transition-colors">
                                            <span className="text-[7px] text-[#A67C35] font-mono font-bold tracking-wider">
                                                {item.badge}
                                            </span>
                                            <h4 className="text-xs font-bold text-[#F8F3E8] uppercase tracking-wide">
                                                {item.title}
                                            </h4>
                                            <p className="text-[8.5px] text-[#8E8E9A] font-light leading-tight line-clamp-2 pt-0.5 group-hover:text-[#CFCFCF] transition-colors">
                                                {item.tagline}
                                            </p>
                                            
                                            {/* Action Explore link (fades up on hover) */}
                                            <div className="pt-2 flex items-center gap-1.5 text-[8.5px] font-mono font-bold text-[#8E8E9A] group-hover:text-[#A67C35] transition-colors">
                                                <Link href={item.link} className="flex items-center gap-1">
                                                    <span>GO TO SHOP</span>
                                                    <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                        </div>
                    </div>

                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none hidden lg:flex flex-col items-center gap-1.5 opacity-30">
                <span className="text-[8px] font-bold text-[#8E8E9A] uppercase tracking-[0.25em]">Scroll to Explore</span>
                <div className="w-4 h-7 rounded-full border border-[#A67C35] p-1 flex justify-center">
                    <motion.div 
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-1 h-1 rounded-full bg-[#A67C35]" 
                    />
                </div>
            </div>

        </section>
    );
}
