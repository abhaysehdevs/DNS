
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
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: 'spring', damping: 15 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-full flex items-center justify-center group"
            style={{
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                boxShadow: '0 4px 20px rgba(37, 211, 102, 0.3), 0 0 40px rgba(37, 211, 102, 0.1)'
            }}
        >
            <MessageCircle size={24} fill="white" className="text-white" />
            <span className="absolute right-full mr-3 glass text-[#F5F5F7] text-xs font-semibold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Chat on WhatsApp
            </span>
        </motion.button>
    );
}
