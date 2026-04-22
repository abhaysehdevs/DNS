
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Preloader() {
    const [isLoading, setIsLoading] = useState(true);
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        // Faster counter: 100% in ~300ms
        const interval = setInterval(() => {
            setCounter(prev => {
                if (prev < 100) return prev + 10;
                clearInterval(interval);
                return 100;
            });
        }, 15);

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 250); // Intro cut-off at 250ms

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 0.3, ease: 'easeInOut' }
                    }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
                >
                    {/* Minimalist Tech Background */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div
                            className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: `radial-gradient(circle at center, #ffffff 1px, transparent 1px)`,
                                backgroundSize: '40px 40px'
                            }}
                        />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        {/* Elegant Ambient Glow */}
                        <motion.div
                            animate={{ opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute w-64 h-64 bg-amber-500 rounded-full blur-[120px] -z-10"
                        />

                        {/* Logo Reveal */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="relative"
                        >
                            <img
                                src="/images/logo.png"
                                alt="Dinanath Logo"
                                className="h-16 md:h-20 w-auto object-contain"
                            />

                            {/* Sharp Shine Sweep */}
                            <motion.div
                                animate={{ left: ['-100%', '200%'] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[30deg]"
                            />
                        </motion.div>

                        {/* Brand Typography */}
                        <div className="mt-6 text-center flex flex-col items-center">
                            <motion.h1
                                initial={{ opacity: 0, letterSpacing: '0.2em' }}
                                animate={{ opacity: 1, letterSpacing: '0.4em' }}
                                transition={{ duration: 0.3 }}
                                className="text-white text-lg md:text-xl font-black uppercase tracking-[0.4em]"
                            >
                                DINANATH & SONS
                            </motion.h1>

                            {/* Accent Line */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: 40 }}
                                transition={{ delay: 0.1, duration: 0.2 }}
                                className="h-[2px] bg-amber-500 my-3"
                            />

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.6 }}
                                transition={{ delay: 0.2 }}
                                className="text-[9px] text-white font-bold uppercase tracking-[0.3em]"
                            >
                                Precision • Power • Performance
                            </motion.p>

                        {/* Minimalist Progress Indicator */}
                        <div className="mt-10 w-40 flex flex-col items-center">
                            <div className="flex justify-between w-full mb-1 text-[8px] font-mono text-gray-500 uppercase tracking-widest">
                                <span>Syncing</span>
                                <span className="text-amber-500">{counter}%</span>
                            </div>
                            <div className="h-[1px] w-full bg-white/5 relative overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${counter}%` }}
                                    className="h-full bg-amber-500"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
