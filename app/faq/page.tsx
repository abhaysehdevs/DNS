'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Sparkles, Zap, ShieldCheck, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const FAQS = [
    {
        question: "Logistics: Regional Distribution Protocol?",
        answer: "Our standard logistics network spans the entire Indian subcontinent via tier-1 courier partners. Priority 'Instant Deployment' is currently restricted to the Delhi NCR strategic zone."
    },
    {
        question: "Acquisition: Wholesale Procurement Process?",
        answer: "Switch the interface to 'Wholesale Mode' via the primary navigation nexus. This activates bulk inventory logic. Compiled inquiries are processed through direct technical consultation via our synchronized WhatsApp uplink."
    },
    {
        question: "Parameters: Minimum Order Quantity (MOQ)?",
        answer: "Standard 'Retail' acquisitions have zero MOQ constraints. 'Wholesale' procurement requires adherence to product-specific MOQ thresholds to activate industrial pricing tiers."
    },
    {
        question: "Settlement: Authorized Payment Channels?",
        answer: "We support high-bandwidth digital settlement via UPI, Global Credit/Debit frameworks, and Net Banking. Industrial-scale transactions are facilitated through NEFT/RTGS bank transmissions."
    },
    {
        question: "Integrity: Returns and Technical Warranty?",
        answer: "Technical discrepancies must be logged within a 48-hour window post-deployment. We require high-definition 'Unboxing Documentation' (Video) to authorize manufacturing defect claims."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-[#FFFFFF] text-[#1D1D1F] pt-32 md:pt-48 pb-24 noise-overlay selection:bg-[#C9A84C]/30 overflow-x-hidden">
            
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[20%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                
                {/* Header */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass text-[#86868B] text-[9px] font-black uppercase tracking-[0.3em] mb-10 shadow-sm"
                    >
                        <MessageSquare size={14} /> Knowledge Support Nexus
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase leading-[0.9]"
                    >
                        Technical <span style={{ background: 'linear-gradient(135deg, #1D1D1F, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Support</span>
                    </motion.h1>
                    <p className="text-[#86868B] text-lg font-medium max-w-2xl mx-auto uppercase tracking-widest text-[10px]">Standardized operational guidelines and procurement protocols</p>
                </div>

                {/* FAQ List */}
                <div className="space-y-6">
                    {FAQS.map((faq, index) => (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`glass rounded-[2rem] border transition-all duration-500 overflow-hidden ${openIndex === index ? 'border-[#C9A84C]/30 bg-black/[0.02] shadow-[0_20px_60px_rgba(0,0,0,0.05)]' : 'border-black/[0.04] hover:border-black/[0.08]'}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex justify-between items-center p-8 md:p-10 text-left transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-sm ${openIndex === index ? 'glass-gold text-[#0A0A0F]' : 'glass text-[#86868B]'}`}>
                                        <Zap size={18} />
                                    </div>
                                    <span className={`text-sm md:text-xl font-black uppercase tracking-tight transition-colors ${openIndex === index ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>{faq.question}</span>
                                </div>
                                <div className={`w-8 h-8 rounded-full glass flex items-center justify-center transition-all ${openIndex === index ? 'rotate-180 bg-[#C9A84C] text-[#0A0A0F]' : 'text-[#86868B]'}`}>
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
                                        <div className="px-10 md:px-24 pb-12 pt-0 text-[#6E6E73] text-sm md:text-lg leading-relaxed font-medium relative">
                                            <div className="absolute left-10 md:left-24 top-0 bottom-12 w-px bg-black/[0.04]" />
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
                    className="mt-20 text-center glass p-10 rounded-[3rem] border border-black/[0.04] relative overflow-hidden group shadow-xl"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                        <ShieldCheck size={120} className="text-[#C9A84C]" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#86868B] mb-6">Inquiry not resolved in current nexus?</p>
                    <Link href="/contact">
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C9A84C] hover:opacity-70 transition-opacity border-b border-[#C9A84C]/30 pb-1">Initialize Direct Transmission</button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
