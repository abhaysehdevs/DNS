
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
    {
        question: "Do you ship outside Delhi?",
        answer: "Yes, we ship across India using standard courier partners. Instant delivery is currently available only in Delhi NCR."
    },
    {
        question: "How do I place a Wholesale order?",
        answer: "Switch to 'Wholesale Mode' using the toggle in the navigation bar. Add items to your inquiry list and click 'Get Quote' to chat with us on WhatsApp directly."
    },
    {
        question: "Is there a Minimum Order Quantity (MOQ)?",
        answer: "For Retail orders, there is no MOQ. For Wholesale orders, specific MOQs apply per product to avail bulk pricing."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept UPI, Credit/Debit Cards, and Net Banking. For large wholesale orders, we also accept Bank Transfers (NEFT/RTGS)."
    },
    {
        question: "Can I return a product?",
        answer: "Returns are accepted only for manufacturing defects reported within 48 hours of delivery. Please record an unboxing video for claims."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-black text-white pt-10 pb-20">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-amber-500">Frequently Asked Questions</h1>

                <div className="space-y-4">
                    {FAQS.map((faq, index) => (
                        <div key={index} className="border border-gray-800 rounded-lg bg-gray-900 overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-800 transition-colors"
                            >
                                <span className="font-medium text-lg">{faq.question}</span>
                                {openIndex === index ? <ChevronUp size={20} className="text-amber-500" /> : <ChevronDown size={20} />}
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-gray-800"
                                    >
                                        <div className="p-4 text-gray-400 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
