'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export function Preloader() {
    const [isLoading, setIsLoading] = useState(true);
    const [counter, setCounter] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setCounter(prev => {
                if (prev < 100) return prev + 2;
                clearInterval(interval);
                return 100;
            });
        }, 15);

        const timer = setTimeout(() => {
            setIsComplete(true);
            setTimeout(() => setIsLoading(false), 800);
        }, 2200);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FFFFFF] overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                >
                    {/* Dynamic Background */}
                    <div className="absolute inset-0">
                        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#C9A84C]/5 blur-[120px] rounded-full" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="mb-12 relative">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="w-24 h-24 md:w-32 md:h-32 rounded-3xl glass-strong border border-black/10 flex items-center justify-center shadow-2xl bg-white"
                            >
                                <img src="/images/logo.png" alt="Dinanath's" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                            </motion.div>
                            
                            {/* Scanning line effect */}
                            <motion.div 
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-0.5 bg-[#C9A84C]/30 z-20 blur-[1px]"
                            />
                        </div>

                        <div className="flex flex-col items-center overflow-hidden">
                            <motion.h2 
                                className="text-3xl md:text-5xl font-black text-[#1D1D1F] tracking-tighter uppercase mb-4"
                                initial={{ y: 100 }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
                            >
                                Dinanath's
                            </motion.h2>
                            <motion.div 
                                className="h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent w-64 md:w-96"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                            />
                            <motion.p
                                className="text-[9px] font-black uppercase tracking-[0.5em] text-[#86868B] mt-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                            >
                                Opening Shop • {counter}%
                            </motion.p>
                        </div>

                        {/* Progress Status dots */}
                        <div className="mt-16 flex flex-col items-center gap-4">
                            <div className="flex gap-3">
                                {[0, 1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.2, 1, 0.2],
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Reveal Mask */}
                    <motion.div
                        className="absolute inset-0 bg-[#FFFFFF] z-50 origin-top"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: isComplete ? 1 : 0 }}
                        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
