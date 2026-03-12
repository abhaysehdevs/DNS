'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Ticker() {
    const messages = [
        "🚚 Free Shipping on Orders Over ₹5,000",
        "🏭 Bulk Discounts Available for Wholesale Partners",
        "✨ New Casting Machinery Arrived - Check it Out!",
        "🛠️ Premium Hand Tools for Professional Jewelers"
    ];

    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % messages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-amber-900/20 border-b border-amber-900/10 h-10 overflow-hidden relative flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-xs md:text-sm font-medium text-amber-500 flex items-center gap-2"
                >
                    {messages[index]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
