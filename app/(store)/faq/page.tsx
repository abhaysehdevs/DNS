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
        <div className="min-h-screen bg-surface-2 text-text-primary pt-32 md:pt-44 pb-24 noise-overlay selection:bg-gold-primary/30 overflow-x-hidden">
            <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass text-text-secondary text-[9px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm"
                    >
                        <MessageSquare size={14} className="text-[#A67C35]" /> Store Policies & Knowledge Center
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight uppercase leading-[0.9]">
                        Store Policies & <span className="bg-gradient-to-r from-text-primary to-gold-primary bg-clip-text text-transparent">Support</span>
                    </h1>
                    <p className="text-text-secondary text-xs font-bold uppercase tracking-widest max-w-xl mx-auto">Standardized shipping rules, return policy, and B2B terms for Dinanath & Sons</p>
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
                                        ? 'bg-[#A67C35] text-black shadow-lg scale-105' 
                                        : 'bg-[#1E1E1E] text-[#8E8E9A] hover:text-[#F8F3E8] border border-[#343434]'
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
                            className={`bg-[#1E1E1E] rounded-2xl border transition-all duration-300 overflow-hidden ${
                                openIndex === index ? 'border-[#A67C35] shadow-lg' : 'border-[#343434] hover:border-[#343434]/80'
                            }`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex justify-between items-center p-6 text-left transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${openIndex === index ? 'bg-[#A67C35] text-black' : 'bg-[#151515] text-[#A67C35]'}`}>
                                        <Zap size={15} />
                                    </div>
                                    <span className={`text-sm md:text-base font-bold uppercase tracking-wide ${openIndex === index ? 'text-[#F8F3E8]' : 'text-[#CFCFCF]'}`}>
                                        {item.question}
                                    </span>
                                </div>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${openIndex === index ? 'rotate-180 bg-[#A67C35] text-black' : 'text-[#8E8E9A]'}`}>
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
                                        <div className="px-6 pb-6 pt-0 text-[#CFCFCF] text-xs md:text-sm leading-relaxed font-normal border-t border-[#343434]/40 mt-2 pt-4">
                                            {item.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Footer Inquiry Prompt */}
                <div className="mt-16 text-center bg-[#1E1E1E] p-8 rounded-3xl border border-[#343434] shadow-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E8E9A] mb-4">Have further technical queries about tools or bulk machinery?</p>
                    <Link href="/contact">
                        <button className="text-xs font-bold uppercase tracking-widest text-[#A67C35] hover:underline cursor-pointer border-none bg-transparent">
                            Contact Support (info@dinanathandsons.com) →
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
