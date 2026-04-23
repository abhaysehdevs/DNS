'use client';

import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Box, Wrench, Zap, ShieldCheck, ShoppingCart, Hammer, Gem, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-is-mobile';
import Link from 'next/link';

function FloatingElement({ children, delay = 0, x, y, rotate, scale = 1, className, speed = 5 }: any) {
    const isMobile = useIsMobile();
    
    // Minimal animation on mobile
    const animateProps = isMobile ? {
        opacity: 1,
        y: [0, -10, 0],
    } : {
        opacity: 1,
        y: [0, -30, 0],
        rotate: [rotate - 5, rotate + 5, rotate - 5],
        scale: [scale, scale * 1.05, scale],
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: scale * 0.8 }}
            animate={animateProps}
            transition={{
                opacity: { delay, duration: 1.5 },
                y: { duration: speed, repeat: Infinity, ease: "easeInOut", delay },
                rotate: { duration: speed * 1.5, repeat: Infinity, ease: "easeInOut", delay },
                scale: { duration: speed * 1.2, repeat: Infinity, ease: "easeInOut", delay }
            }}
            style={{ left: x, top: y }}
            className={`absolute z-0 pointer-events-none drop-shadow-2xl ${className}`}
        >
            {children}
        </motion.div>
    );
}

function GridBackground({ mouseX, mouseY }: { mouseX: any, mouseY: any }) {
    const isMobile = useIsMobile();
    const gridX = useTransform(mouseX, [-0.5, 0.5], ['-1%', '1%']);
    const gridY = useTransform(mouseY, [-0.5, 0.5], ['-1%', '1%']);

    if (isMobile) {
        return (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
                <div className="w-full h-full"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(245, 158, 11, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.2) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div
                style={{ x: gridX, y: gridY, rotateX: 65, scale: 2.5 }}
                className="absolute inset-0 w-[200%] h-[200%] -left-[50%] -top-[10%] opacity-20"
            >
                <div className="w-full h-full"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(245, 158, 11, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.3) 1px, transparent 1px)',
                        backgroundSize: '80px 80px'
                    }}
                />
            </motion.div>
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[180px] rounded-full" />
        </div>
    );
}

export function Hero() {
    const { mode, language } = useAppStore();
    const isMobile = useIsMobile();
    const isRetail = mode === 'retail';

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isMobile) return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    const springConfig = { stiffness: 100, damping: 30 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

    return (
        <section
            onMouseMove={handleMouseMove}
            className="relative min-h-[100svh] w-full overflow-hidden flex items-center justify-center bg-[#050505] perspective-[2000px]"
        >
            <GridBackground mouseX={mouseX} mouseY={mouseY} />

            {/* Content Layer */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-black z-10 pointer-events-none" />

            {/* Industrial Jewelry Elements */}
            <div className="absolute inset-0 z-0">
                {!isMobile && (
                    <>
                        <FloatingElement x="10%" y="20%" rotate={-15} scale={1.4} speed={8}>
                            <img src="/images/products/15f-tweezers.png" className="w-64 opacity-40 mix-blend-screen" />
                        </FloatingElement>
                        <FloatingElement x="80%" y="15%" rotate={10} scale={1.6} speed={10}>
                            <img src="/images/products/gas-burner.png" className="w-72 opacity-50 mix-blend-screen" />
                        </FloatingElement>
                        <FloatingElement x="75%" y="70%" rotate={5} scale={1.8} speed={12}>
                            <img src="/images/products/heavy-duty-ring-extender.png" className="w-80 opacity-40 mix-blend-screen" />
                        </FloatingElement>
                        <FloatingElement x="15%" y="75%" rotate={20} scale={1.2} speed={9}>
                            <img src="/images/products/nipper-cutter.png" className="w-56 opacity-30 mix-blend-screen" />
                        </FloatingElement>
                    </>
                )}
                
            {/* Simplified Mobile Elements */}
            {isMobile && (
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_70%)]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-black/40" />
                </div>
            )}
            </div>

            {/* Hero Main Content */}
            <motion.div
                style={!isMobile ? { rotateX, rotateY, transformStyle: "preserve-3d" } : {}}
                className="container relative z-20 px-6 py-20"
            >
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-amber-500/20 bg-amber-500/10 backdrop-blur-xl text-[10px] md:text-xs font-black tracking-[0.2em] text-amber-500 mb-10 shadow-2xl uppercase"
                    >
                        <Sparkles size={14} className="animate-pulse" />
                        <span>EST. 1995 • Professional Jewelry Equipment</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.9] uppercase"
                    >
                        {isRetail ? (
                            <>
                                <span className="block text-gray-500 text-3xl md:text-5xl lg:text-6xl font-light italic normal-case tracking-normal mb-4">Precision for the</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-amber-600">
                                    MASTER <br className="hidden md:block" /> JEWELER
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="block text-gray-500 text-3xl md:text-5xl lg:text-6xl font-light italic normal-case tracking-normal mb-4">Industrial Grade</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-blue-600">
                                    JEWELRY <br className="hidden md:block" /> SUPPLY
                                </span>
                            </>
                        )}
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="text-base md:text-xl text-gray-400 mb-14 max-w-2xl mx-auto leading-relaxed font-medium px-4"
                    >
                        {isRetail
                            ? "From high-precision tweezers to advanced casting machinery, Dinanath & Sons provides the technical foundation for world-class jewelry craftsmanship."
                            : "Scale your manufacturing with global-standard machinery and industrial tools. Direct factory rates for bulk jewelry businesses."
                        }
                    </motion.p>

                    {/* CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-5 justify-center items-center"
                    >
                        <Link href="/shop" className="w-full sm:w-auto group">
                            <Button
                                size="lg"
                                className={`h-16 md:h-20 px-10 md:px-14 text-lg md:text-xl font-black w-full sm:w-auto rounded-[2rem] transition-all relative overflow-hidden shadow-2xl ${isRetail ? 'bg-white text-black hover:bg-amber-500 hover:text-white' : 'bg-blue-600 text-white hover:bg-white hover:text-blue-600'}`}
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    EXPLORE INVENTORY
                                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                                </span>
                            </Button>
                        </Link>

                        <Link href="/contact" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-16 md:h-20 px-10 md:px-14 text-lg md:text-xl font-black w-full sm:w-auto rounded-[2rem] border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-xl transition-all"
                            >
                                TALK TO EXPERTS
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-10 w-full px-8 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 text-[10px] font-black uppercase tracking-[0.3em] text-white z-20">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2"><Hammer size={14} /> CASTING TOOLS</div>
                    <div className="flex items-center gap-2"><Gem size={14} /> PRECISION MEASURING</div>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-2"><Settings size={14} /> INDUSTRIAL MACHINERY</div>
                    <div className="flex items-center gap-2"><Zap size={14} /> INSTANT QUOTATION</div>
                </div>
            </div>
            
            {/* Mobile Scroll Indicator */}
            <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden text-white/20"
            >
                <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
            </motion.div>
        </section>
    );
}
