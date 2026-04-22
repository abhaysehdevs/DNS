
'use client';

import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Box, Wrench, Zap, ShieldCheck, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

function FloatingElement({ children, delay = 0, x, y, rotate, scale = 1, className, speed = 5 }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: scale * 0.8 }}
            animate={{
                opacity: 1,
                y: [0, -30, 0],
                rotate: [rotate - 5, rotate + 5, rotate - 5],
                scale: [scale, scale * 1.05, scale],
            }}
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


function VideoFloatingElement({ src, delay = 0, x, y, rotate, scale = 1, className, speed = 6 }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: scale * 0.5, rotateY: 30, x: "-50%", y: "-50%" }}
            animate={{
                opacity: 1,
                y: ["-50%", "-60%", "-50%"],
                rotate: [rotate - 8, rotate + 8, rotate - 8],
                rotateY: [-20, 20, -20],
                scale: [scale, scale * 1.1, scale],
            }}
            transition={{
                opacity: { delay, duration: 2 },
                y: { duration: speed, repeat: Infinity, ease: "easeInOut", delay },
                rotate: { duration: speed * 1.4, repeat: Infinity, ease: "easeInOut", delay },
                rotateY: { duration: speed * 2, repeat: Infinity, ease: "easeInOut", delay },
                scale: { duration: speed * 1.1, repeat: Infinity, ease: "easeInOut", delay }
            }}
            style={{
                left: x,
                top: y,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className={`absolute z-0 pointer-events-none ${className}`}
        >
            <div className="relative group">
                <video
                    src={src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-80 h-80 md:w-[450px] md:h-[450px] object-contain filter drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] mix-blend-screen"
                />
                {/* Subtle glow behind the video */}
                <div className="absolute inset-0 bg-amber-500/5 blur-[100px] rounded-full -z-10 animate-pulse" />
            </div>
        </motion.div>
    );
}
function GridBackground({ mouseX, mouseY }: { mouseX: any, mouseY: any }) {
    const gridX = useTransform(mouseX, [-0.5, 0.5], ['-2%', '2%']);
    const gridY = useTransform(mouseY, [-0.5, 0.5], ['-2%', '2%']);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* 3D Grid Floor */}
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

            {/* Glowing Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[180px] rounded-full" />

            {/* Scanning Line Effect */}
            <motion.div
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent z-0"
            />
        </div>
    );
}

export function Hero() {
    const { mode, language } = useAppStore();
    const t = translations[language].hero;
    const isRetail = mode === 'retail';

    // Mouse Parallax Logic
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    // Smooth spring for the tilt effect
    const springConfig = { stiffness: 100, damping: 30 };
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

    return (
        <section
            ref={ref}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-[#050505] perspective-[2000px]"
        >
            <GridBackground mouseX={mouseX} mouseY={mouseY} />

            {/* Ambient Background Glows */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black z-10 pointer-events-none" />

            {/* Floating 3D Elements */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {/* 3D Product Videos */}
                <VideoFloatingElement
                    src="/videos/nipper-cutter.webm"
                    delay={0.5}
                    x="12%"
                    y="30%"
                    rotate={-5}
                    scale={1.2}
                    speed={8}
                    className="opacity-50 md:opacity-80"
                />

                <VideoFloatingElement
                    src="/videos/gas-gun.webm"
                    delay={1.5}
                    x="85%"
                    y="70%"
                    rotate={15}
                    scale={2.2}
                    speed={10}
                    className="opacity-70 md:opacity-90"
                />

                <VideoFloatingElement
                    src="/Images/plier.webm"
                    delay={2.5}
                    x="78%"
                    y="22%"
                    rotate={-12}
                    scale={1.3}
                    speed={9}
                    className="opacity-60 md:opacity-85"
                />

                <VideoFloatingElement
                    src="/Images/tweezers.webm"
                    delay={3.5}
                    x="25%"
                    y="75%"
                    rotate={18}
                    scale={1.2}
                    speed={11}
                    className="opacity-60 md:opacity-85"
                />
                {/* Icons and Shapes */}
                <FloatingElement delay={0} x="10%" y="80%" rotate={-10} scale={1} speed={7}>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                        <Box size={32} className="text-amber-500" />
                    </div>
                </FloatingElement>

                <FloatingElement delay={2} x="90%" y="15%" rotate={20} scale={0.9} speed={9}>
                    <div className="p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                        <Zap size={40} className="text-amber-400" />
                    </div>
                </FloatingElement>

                <FloatingElement delay={3} x="45%" y="90%" rotate={0} scale={0.7} speed={6}>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                        <ShieldCheck size={24} className="text-amber-600" />
                    </div>
                </FloatingElement>
            </div>

            {/* Main Content Card with 3D Tilt */}
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="container relative z-20 px-4"
            >
                <div className="max-w-5xl mx-auto text-center translate-z-20">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 backdrop-blur-md text-sm font-semibold text-amber-500 mb-8 shadow-inner"
                    >
                        <Sparkles size={14} className="animate-spin-slow" />
                        <span>{isRetail ? 'PREMIUM JEWELRY TOOLS' : 'WHOLESALE INDUSTRIAL SUPPLY'}</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        key={mode}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white mb-8 leading-[0.9] text-glow select-none"
                    >
                        {isRetail ? (
                            <>
                                <span className="block italic font-light text-4xl md:text-6xl text-gray-400 mb-2">Master Your</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-amber-200 to-amber-600 drop-shadow-sm">
                                    CRAFT.
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="block italic font-light text-4xl md:text-6xl text-gray-400 mb-2">Scale Your</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-blue-200 to-blue-600 drop-shadow-sm">
                                    BUSINESS.
                                </span>
                            </>
                        )}
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-lg md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
                    >
                        {isRetail
                            ? "Elevate your artistry with Dinanath & Sons' world-class collection of precision jewelry tools and casting consumables."
                            : "Direct manufacturer supply for industrial jewelry machinery and packaging at unbeatable wholesale rates."
                        }
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                    >
                        <Link href="/shop" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className={`group h-16 px-10 text-xl font-bold w-full sm:w-auto rounded-full transition-all duration-300 relative overflow-hidden ${isRetail ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_30px_rgba(217,119,6,0.5)]' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.5)]'}`}
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isRetail ? 'Start Shopping' : 'Get Wholesale Quote'}
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                                />
                            </Button>
                        </Link>

                        <Link href="/contact" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-16 px-10 text-xl font-bold w-full sm:w-auto rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white backdrop-blur-sm transition-all"
                            >
                                Contact Experts
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            {/* Stats / Trust Badges */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-12 w-full max-w-6xl mx-auto px-4 flex flex-wrap justify-between gap-8 text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs z-20 pointer-events-none"
            >
                <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-white/20" />
                    <span>Est. 1995</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-white/20" />
                    <span>Global Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-white/20" />
                    <span>OEM Certified</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-white/20" />
                    <span>24/7 Support</span>
                </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ delay: 2, duration: 2, repeat: Infinity }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/20 flex flex-col items-center gap-2 pointer-events-none"
            >
                <div className="w-[1px] h-8 bg-gradient-to-b from-white/40 to-transparent" />
            </motion.div>
        </section>
    );
}
