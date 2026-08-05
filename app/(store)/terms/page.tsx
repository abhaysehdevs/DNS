'use client';

import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Scale, Building2, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#151515] text-[#F8F3E8] pt-32 md:pt-44 pb-24 selection:bg-[#A67C35]/30">
            <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                
                {/* Header Title */}
                <div className="text-center mb-14">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A67C35]/15 border border-[#A67C35]/30 text-[#A67C35] text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-6 shadow"
                    >
                        <Scale size={14} /> Legal Terms & Conditions
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mb-4">
                        Terms of <span className="text-[#A67C35]">Service</span>
                    </h1>
                    <p className="text-[#8E8E9A] text-xs font-mono font-bold uppercase tracking-widest max-w-xl mx-auto">
                        Dinanath & Sons Hardware Store — 1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi - 110006
                    </p>
                </div>

                {/* Detailed Terms Sections */}
                <div className="space-y-8 bg-[#1E1E1E] border border-[#343434] rounded-2xl p-6 md:p-10 shadow-lg">
                    
                    <div className="space-y-3 pb-6 border-b border-[#343434]">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">1</span>
                            Commercial Identity & Acceptance
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            This website is operated by <strong>Dinanath & Sons Hardware Store</strong> (Established 1960). Throughout the site, the terms "we", "us" and "our" refer to Dinanath & Sons. By visiting our store, placing an online order, or requesting a B2B wholesale quotation, you agree to be bound by these Terms of Service.
                        </p>
                    </div>

                    <div className="space-y-3 pb-6 border-b border-[#343434]">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">2</span>
                            Pricing & GST Tax Invoices
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            All prices displayed are in Indian Rupees (INR). Prices for retail orders are inclusive of statutory GST unless stated otherwise. Official GST Tax Invoices are issued for all orders to enable B2B input tax credit. We reserve the right to revise prices or correct typographical pricing errors prior to order dispatch.
                        </p>
                    </div>

                    <div className="space-y-3 pb-6 border-b border-[#343434]">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">3</span>
                            B2B Wholesale Quotations & Minimum Order Quantities
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            B2B wholesale quotations are negotiated based on volume and Minimum Order Quantity (MOQ) thresholds. B2B quotations are valid for 7 calendar days from issuance. Payment terms for wholesale orders require full settlement prior to factory dispatch.
                        </p>
                    </div>

                    <div className="space-y-3 pb-6 border-b border-[#343434]">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">4</span>
                            Limitation of Liability & Tool Safety
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            Dinanath & Sons manufactures and supplies industrial metalworking machinery, high-temperature melting furnaces, micro-torches, and mechanical tools. Operators must follow standard workshop safety protocols. Dinanath & Sons shall not be liable for injuries or damages arising from improper machinery operation or unauthorized modifications.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">5</span>
                            Governing Law & Jurisdiction
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            These Terms of Service and any separate agreements for goods shall be governed by and construed in accordance with the laws of India, under the exclusive jurisdiction of the Courts of Delhi.
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center text-[10px] font-mono text-[#8E8E9A] uppercase tracking-widest">
                    © 1960 - 2026 DINANATH & SONS HARDWARE STORE. ALL RIGHTS RESERVED.
                </div>
            </div>
        </div>
    );
}
