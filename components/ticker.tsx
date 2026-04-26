'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

export function Ticker() {
    const { currencyData } = useAppStore();
    const threshold = 5000 * currencyData.rate;
    const formattedThreshold = `${currencyData.symbol}${threshold.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    const messages = [
        `🚚 Free Shipping on Orders Over ${formattedThreshold}`,
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
        <div className="h-9 overflow-hidden relative flex items-center justify-center"
            style={{
                background: 'rgba(201, 168, 76, 0.04)',
                borderBottom: '1px solid rgba(201, 168, 76, 0.06)'
            }}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-[11px] md:text-xs font-medium text-[#C9A84C] flex items-center gap-2"
                >
                    {messages[index]}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
