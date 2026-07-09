'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Zap, ShieldCheck, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const FAQS = [
    {
        question: "Shipping: Regional Delivery Areas?",
        answer: "We ship across India using leading courier services. Express delivery is available for the Delhi NCR region."
    },
    {
        question: "Wholesale: How to Order in Bulk?",
        answer: "Switch the site to 'Wholesale Mode' via the navigation bar to see bulk pricing. Wholesale orders are processed through direct consultation via our WhatsApp support."
    },
    {
        question: "Wholesale: What is the Minimum Order Quantity (MOQ)?",
        answer: "Retail orders have no minimum order quantity. Wholesale orders require meeting specific product MOQ thresholds to qualify for bulk pricing."
    },
    {
        question: "Payments: What Payment Methods Do You Accept?",
        answer: "We accept payment via UPI, Credit/Debit Cards, and Net Banking. Large wholesale orders can be paid via NEFT or RTGS bank transfer."
    },
    {
        question: "Returns: What is the Return Policy?",
        answer: "Any issues or defects must be reported within 48 hours of delivery. We require an unboxing video to process manufacturing defect claims."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQS.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <div className="min-h-screen bg-surface-2 text-text-primary pt-32 md:pt-48 pb-24 noise-overlay selection:bg-gold-primary/30 overflow-x-hidden blueprint-grid">
                
                {/* Ambient Lighting */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-gold-primary/5 blur-[120px] rounded-full animate-pulse-glow" />
                    <div className="absolute bottom-[20%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                </div>

            <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass text-text-secondary text-[9px] font-black uppercase tracking-[0.3em] mb-10 shadow-sm"
                    >
                        <MessageSquare size={14} /> Knowledge Support Nexus
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase leading-[0.9]"
                    >
                        Technical <span className="bg-gradient-to-r from-text-primary to-gold-primary bg-clip-text text-transparent">Support</span>
                    </motion.h1>
                    <p className="text-text-secondary text-lg font-medium max-w-2xl mx-auto uppercase tracking-widest text-[10px]">Standardized operational guidelines and procurement protocols</p>
                </div>

                <div className="space-y-6">
                    {FAQS.map((faq, index) => (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`glass rounded-[2rem] border transition-all duration-500 overflow-hidden ${openIndex === index ? 'border-gold-primary/30 bg-surface-1/50 shadow-[0_20px_60px_rgba(0,0,0,0.05)]' : 'border-glass-border hover:border-glass-border/80'}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex justify-between items-center p-8 md:p-10 text-left transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm ${openIndex === index ? 'glass-gold text-[#0A0A0F]' : 'glass text-text-secondary'}`}>
                                        <Zap size={18} />
                                    </div>
                                    <span className={`text-sm md:text-xl font-black uppercase tracking-tight transition-colors ${openIndex === index ? 'text-text-primary' : 'text-text-secondary'}`}>{faq.question}</span>
                                </div>
                                <div className={`w-8 h-8 rounded-full glass flex items-center justify-center transition-all ${openIndex === index ? 'rotate-180 bg-gold-primary text-white' : 'text-text-secondary'}`}>
                                    <ChevronDown size={18} />
                                </div>
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="relative"
                                    >
                                        <div className="px-10 md:px-24 pb-12 pt-0 text-text-secondary text-sm md:text-lg leading-relaxed font-medium relative">
                                            <div className="absolute left-10 md:left-24 top-0 bottom-12 w-px bg-glass-border" />
                                            <div className="pl-8">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Link */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 text-center glass p-10 rounded-[3rem] border border-glass-border relative overflow-hidden group shadow-xl"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <ShieldCheck size={120} className="text-gold-primary" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-6">Inquiry not resolved in current nexus?</p>
                    <Link href="/contact">
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-primary hover:opacity-70 transition-opacity border-b border-gold-primary/30 pb-1 cursor-pointer">Initialize Direct Transmission</button>
                    </Link>
                </motion.div>
            </div>
        </div>
        </>
    );
}
