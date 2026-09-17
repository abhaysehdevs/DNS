'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles, Zap, ShieldCheck, MessageSquare, Truck, RotateCcw, FileText } from 'lucide-react';
import Link from 'next/link';

const POLICIES = [
    {
        category: "Shipping Policy",
        icon: Truck,
        items: [
            {
                question: "What are the shipping costs and dispatch times?",
                answer: "We offer Pan-India dispatch for all jewellery tools and machinery. Orders are dispatched within 24 to 48 hours from our Chandni Chowk store in Delhi. Express dispatch is available for Delhi NCR. Standard shipping takes 3-7 business days across India."
            },
            {
                question: "How is heavy machinery (Rolling Mills, Castings, Dust Collectors) shipped?",
                answer: "Heavy machinery and workshop equipment are securely crate-packed and dispatched via trusted surface freight logistics partners (V-Trans, Safexpress, TCI Freight). Freight tracking AWBs are provided immediately upon dispatch."
            }
        ]
    },
    {
        category: "Return & Refund Policy",
        icon: RotateCcw,
        items: [
            {
                question: "What is the 7-Day Defect Exchange & Return Policy?",
                answer: "If any tool or equipment is received damaged, defective, or missing components, you are eligible for an immediate replacement or 100% refund within 7 days of delivery. We request a short unboxing video for fast defect verification."
            },
            {
                question: "How do I initiate a return or replacement?",
                answer: "You can initiate a return by contacting support at info@dinanathandsons.com or WhatsApp +91 9953435647 with your order ID and unboxing photos/video. Our team arranges reverse pickup or replacement dispatch within 24 hours."
            }
        ]
    },
    {
        category: "Terms & Conditions",
        icon: FileText,
        items: [
            {
                question: "Are GST Tax Invoices provided for B2B Input Credit?",
                answer: "Yes, 100% of our orders are shipped with official GST Tax Invoices. Enter your GSTIN and business name during checkout to claim input tax credit."
            },
            {
                question: "What payment methods are supported?",
                answer: "We support UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, Netbanking via Razorpay online payment gateway, as well as Direct Bank Transfer (NEFT/RTGS) for bulk B2B wholesale orders."
            }
        ]
    }
];

export default function FAQ() {
    const [activeTab, setActiveTab] = useState(0);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] pt-4 sm:pt-6 md:pt-8 pb-16 noise-overlay selection:bg-[#966E2E]/20 overflow-x-hidden">
            <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl">
                
                <div className="text-center mb-6 sm:mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E8E2D5] text-[#71717A] text-[9px] font-black uppercase tracking-[0.2em] mb-3 shadow-xs"
                    >
                        <MessageSquare size={13} className="text-[#966E2E]" /> Store Policies & Knowledge Center
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight uppercase leading-[0.9] text-[#18181B] font-display">
                        Store Policies & <span className="bg-gradient-to-r from-[#18181B] to-[#966E2E] bg-clip-text text-transparent">Support</span>
                    </h1>
                    <p className="text-[#71717A] text-[10px] sm:text-xs font-bold uppercase tracking-widest max-w-xl mx-auto">Standardized shipping rules, return policy, and B2B terms for Dinanath & Sons</p>
                </div>

                {/* Category Policy Tabs */}
                <div className="flex justify-center items-center gap-3 mb-10 overflow-x-auto pb-2">
                    {POLICIES.map((group, idx) => {
                        const Icon = group.icon;
                        const isActive = activeTab === idx;
                        return (
                            <button
                                key={idx}
                                onClick={() => { setActiveTab(idx); setOpenIndex(0); }}
                                className={`px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                                    isActive 
                                        ? 'bg-[#966E2E] text-white shadow-md scale-105' 
                                        : 'bg-white text-[#71717A] hover:text-[#18181B] border border-[#E8E2D5]'
                                }`}
                            >
                                <Icon size={16} />
                                <span>{group.category}</span>
                            </button>
                        );
                    })}
                </div>

                {/* FAQ Accordions */}
                <div className="space-y-4">
                    {POLICIES[activeTab].items.map((item, index) => (
                        <div 
                            key={index} 
                            className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                                openIndex === index ? 'border-[#966E2E] shadow-md' : 'border-[#E8E2D5] hover:border-[#D8D2C5]'
                            }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex justify-between items-center p-6 text-left transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${openIndex === index ? 'bg-[#966E2E] text-white' : 'bg-[#FAF9F5] text-[#966E2E] border border-[#E8E2D5]'}`}>
                                        <Zap size={15} />
                                    </div>
                                    <span className={`text-sm md:text-base font-bold uppercase tracking-wide ${openIndex === index ? 'text-[#18181B]' : 'text-[#52525B]'}`}>
                                        {item.question}
                                    </span>
                                </div>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${openIndex === index ? 'rotate-180 bg-[#966E2E] text-white' : 'text-[#71717A] bg-[#FAF9F5]'}`}>
                                    <ChevronDown size={16} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                    >
                                        <div className="px-6 pb-6 pt-0 text-[#52525B] text-xs md:text-sm leading-relaxed font-normal border-t border-[#E8E2D5]/70 mt-2 pt-4">
                                            {item.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Footer Inquiry Prompt */}
                <div className="mt-16 text-center bg-white p-8 rounded-3xl border border-[#E8E2D5] shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#71717A] mb-4">Have further technical queries about tools or bulk machinery?</p>
                    <Link href="/contact">
                        <button className="text-xs font-bold uppercase tracking-widest text-[#966E2E] hover:underline cursor-pointer border-none bg-transparent">
                            Contact Support (info@dinanathandsons.com) →
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
