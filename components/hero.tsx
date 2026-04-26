'use client';

import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Hammer, Gem, Settings, Zap, ArrowDown, Cpu, Activity, Layout, Crosshair, Globe } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import Link from 'next/link';

function GridBackground() {
    return (
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
             style={{ 
                 backgroundImage: 'radial-gradient(#1D1D1F 1px, transparent 1px), linear-gradient(to right, #1D1D1F 1px, transparent 1px), linear-gradient(to bottom, #1D1D1F 1px, transparent 1px)',
                 backgroundSize: '40px 40px, 100px 100px, 100px 100px',
                 backgroundPosition: 'center center'
             }} 
        />
    );
}

function TechnicalCallout({ x, y, label, detail, delay = 0 }: { x: string, y: string, label: string, detail: string, delay?: number }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-30 flex items-center gap-4"
            style={{ left: x, top: y }}
        >
            <div className="relative">
                <div className="w-3 h-3 rounded-full bg-[#C9A84C] animate-pulse" />
                <div className="absolute inset-[-4px] border border-[#C9A84C]/30 rounded-full animate-ping" />
            </div>
            <div className="glass-strong p-3 rounded-xl border border-black/5 shadow-xl backdrop-blur-xl min-w-[150px]">
                <p className="text-[8px] font-black text-[#C9A84C] uppercase tracking-[0.2em] mb-1">{label}</p>
                <p className="text-[10px] font-bold text-[#1D1D1F] uppercase">{detail}</p>
            </div>
        </motion.div>
    );
}

export function Hero() {
    const { mode } = useAppStore();
    const isMobile = useIsMobile();
    const isRetail = mode === 'retail';
    const containerRef = useRef<HTMLElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end start']
    });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Spring-smoothed mouse values
    const smoothX = useSpring(useMotionValue(0), { damping: 50, stiffness: 400 });
    const smoothY = useSpring(useMotionValue(0), { damping: 50, stiffness: 400 });

    useEffect(() => {
        smoothX.set(mousePosition.x);
        smoothY.set(mousePosition.y);
    }, [mousePosition, smoothX, smoothY]);

    const titleY = useTransform(scrollYProgress, [0, 1], [0, 300]);
    const rotateX = useTransform(smoothY, [0, 1000], [5, -5]);
    const rotateY = useTransform(smoothX, [0, 1920], [-5, 5]);

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen md:min-h-[115vh] w-full flex flex-col justify-center items-center overflow-hidden bg-white pt-20"
        >
            <GridBackground />
            
            {/* Ambient Technical Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 left-10 w-px h-64 bg-gradient-to-b from-transparent via-black/10 to-transparent" />
                <div className="absolute top-1/2 right-10 w-px h-64 bg-gradient-to-b from-transparent via-black/10 to-transparent" />
                <div className="absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-black/5 to-transparent" />
            </div>

            <div className="container relative z-10 px-6 mx-auto">
                <div className="flex flex-col items-center text-center">
                    
                    {/* Interaction Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-6 mb-12"
                    >
                        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full glass border border-black/[0.04] text-[9px] font-black uppercase tracking-[0.3em] text-[#86868B]">
                            <Activity size={12} className="text-[#C9A84C]" /> System Online
                        </div>
                        <div className="w-px h-4 bg-black/10" />
                        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full glass border border-black/[0.04] text-[9px] font-black uppercase tracking-[0.3em] text-[#86868B]">
                            <Layout size={12} className="text-blue-500" /> Version 2.0
                        </div>
                    </motion.div>

                    {/* Experimental Main Title */}
                    <div className="relative mb-16">
                        <motion.div
                            style={{ y: titleY }}
                            className="absolute -top-32 left-1/2 -translate-x-1/2 text-[15vw] font-black text-black/[0.02] uppercase tracking-[-0.05em] whitespace-nowrap pointer-events-none hidden md:block"
                        >
                            PRECISION
                        </motion.div>
                        
                        <h1 className="relative z-10 flex flex-col items-center">
                            <motion.span 
                                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                className="text-5xl md:text-9xl xl:text-[11rem] font-black text-[#1D1D1F] tracking-tighter leading-[0.8] uppercase block"
                            >
                                Dinanath
                            </motion.span>
                            <motion.span 
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="text-2xl md:text-6xl xl:text-7xl font-black italic tracking-tight uppercase block mt-4"
                                style={{
                                    background: 'linear-gradient(135deg, #1D1D1F 30%, #C9A84C 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}
                            >
                                & Engineering Tools
                            </motion.span>
                        </h1>
                    </div>

                    {/* Central 3D Interactive Component */}
                    <motion.div 
                        style={{ rotateX, rotateY }}
                        className="relative w-full max-w-4xl aspect-[21/9] md:aspect-[21/7] mt-10 perspective-2000 preserve-3d"
                    >
                        {/* Blueprint Grid Plane */}
                        <div className="absolute inset-0 bg-[#C9A84C]/5 rounded-[4rem] border border-[#C9A84C]/20 overflow-hidden">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#C9A84C 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        </div>

                        {/* Main Floating Machine Component */}
                        <motion.div 
                            initial={{ z: -100, opacity: 0 }}
                            animate={{ z: 0, opacity: 1 }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center p-12"
                        >
                            <img 
                                src="/images/products/sand-blasting-dust-collector-machine.png" 
                                className="h-full w-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.15)] z-20" 
                                alt="Core Engineering"
                            />
                            
                            {/* Technical Callouts - Only on Desktop */}
                            {!isMobile && (
                                <>
                                    <TechnicalCallout x="20%" y="30%" label="Module 01" detail="Dust Extraction" delay={1.2} />
                                    <TechnicalCallout x="70%" y="20%" label="Main Unit" detail="Pressure Control" delay={1.4} />
                                    <TechnicalCallout x="65%" y="70%" label="Filter" detail="HEPA Interface" delay={1.6} />
                                </>
                            )}
                        </motion.div>

                        {/* Interactive UI Overlays */}
                        <div className="absolute top-8 left-8 flex flex-col gap-3">
                            <div className="w-12 h-12 rounded-xl glass border border-black/5 flex items-center justify-center text-[#C9A84C] shadow-lg">
                                <Crosshair size={20} />
                            </div>
                            <div className="glass p-3 rounded-xl border border-black/5 shadow-lg">
                                <p className="text-[7px] font-black text-[#86868B] uppercase tracking-widest mb-1">X-Axis</p>
                                <div className="h-1 w-16 bg-black/5 rounded-full overflow-hidden">
                                    <motion.div className="h-full bg-[#C9A84C]" animate={{ width: ['20%', '80%', '20%'] }} transition={{ duration: 3, repeat: Infinity }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Description & CTA */}
                    <div className="mt-20 max-w-2xl flex flex-col items-center">
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-lg md:text-xl text-[#6E6E73] font-medium leading-relaxed mb-12"
                        >
                            Your trusted source for professional jewelry equipment. High-quality tools and machinery for expert craftsmen.
                        </motion.p>
                        
                        <div className="flex flex-col sm:flex-row gap-6">
                            <Link href="/shop" className="group">
                                <button className="h-18 px-12 bg-[#1D1D1F] text-white font-black uppercase tracking-[0.3em] rounded-[2rem] text-[10px] transition-all hover:scale-105 hover:bg-[#C9A84C] hover:text-[#0A0A0F] active:scale-95 flex items-center gap-4 shadow-2xl">
                                    Shop Collection
                                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/contact">
                                <button className="h-18 px-12 glass border border-black/10 text-[#1D1D1F] font-black uppercase tracking-[0.3em] rounded-[2rem] text-[10px] transition-all hover:bg-black/5 active:scale-95">
                                    Get Support
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Industrial Data Ribbon */}
            <div className="absolute bottom-0 left-0 w-full border-t border-black/[0.04] bg-white/80 backdrop-blur-xl z-30 py-6">
                <div className="container mx-auto px-6 flex flex-wrap justify-center md:justify-between items-center gap-8">
                    {[
                        { label: "Quality Check", value: "PASSED", icon: <Cpu size={14} />, color: "text-emerald-600" },
                        { label: "Happy Clients", value: "1,240+", icon: <Globe size={14} />, color: "text-blue-600" },
                        { label: "Fast Shipping", value: "Everywhere", icon: <Zap size={14} />, color: "text-[#C9A84C]" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg glass flex items-center justify-center ${item.color}`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-[7px] font-black text-[#86868B] uppercase tracking-[0.3em]">{item.label}</p>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.value}</p>
                            </div>
                        </div>
                    ))}
                    
                    <motion.div 
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="hidden md:flex items-center gap-4 px-6 py-2 rounded-full glass border border-black/5 cursor-pointer"
                    >
                        <span className="text-[8px] font-black text-[#86868B] uppercase tracking-[0.3em]">Scroll Down</span>
                        <ArrowDown size={14} className="text-[#C9A84C]" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
