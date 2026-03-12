
'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function WhatsAppButton() {
    const handleClick = () => {
        const message = "Hi, I have an inquiry regarding your products.";
        const url = `https://wa.me/919953435647?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center group"
        >
            <MessageCircle size={24} fill="white" />
            <span className="absolute right-full mr-3 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Chat on WhatsApp
            </span>
        </motion.button>
    );
}
