'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, CheckCircle2, RotateCcw, HelpCircle, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ReturnPolicyPage() {
    return (
        <div className="min-h-screen bg-[#151515] text-[#F8F3E8] pt-32 md:pt-44 pb-24 selection:bg-[#A67C35]/30">
            <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                
                {/* Header Title */}
                <div className="text-center mb-14">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D12A1C]/10 border border-[#D12A1C]/30 text-[#D12A1C] text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-6 shadow"
                    >
                        <ShieldAlert size={14} /> Official Store Policy
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mb-4">
                        Return & <span className="text-[#A67C35]">Refund Policy</span>
                    </h1>
                    <p className="text-[#8E8E9A] text-xs font-mono font-bold uppercase tracking-widest max-w-xl mx-auto">
                        Dinanath & Sons Hardware Store — Effective Date: August 2026
                    </p>
                </div>

                {/* Important Notice Box */}
                <div className="bg-[#1E1E1E] border-2 border-[#D12A1C] rounded-2xl p-6 md:p-8 mb-10 shadow-xl space-y-4">
                    <div className="flex items-center gap-3 text-[#D12A1C]">
                        <AlertTriangle size={24} className="shrink-0" />
                        <h2 className="text-base md:text-lg font-black uppercase tracking-wider">CRITICAL RETURN POLICY DIRECTIVE</h2>
                    </div>
                    <p className="text-xs md:text-sm text-[#F8F3E8] font-bold leading-relaxed">
                        Please note: Dinanath & Sons <span className="text-[#D12A1C] underline font-black">DOES NOT OFFER A RETURN OR REFUND POLICY ON ALMOST ALL PRODUCTS</span> sold across our storefront and trade catalogs.
                    </p>
                    <p className="text-xs text-[#CFCFCF] leading-relaxed">
                        Due to the technical precision, calibration requirements, and custom manufacturing parameters of industrial jewellery machinery, tools, and metalworking equipment, all sales are final once dispatched.
                    </p>
                </div>

                {/* Detailed Policy Sections */}
                <div className="space-y-8 bg-[#1E1E1E] border border-[#343434] rounded-2xl p-6 md:p-10 shadow-lg">
                    
                    {/* Section 1 */}
                    <div className="space-y-3 pb-6 border-b border-[#343434]">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">1</span>
                            General Non-Returnable Items Rule
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            Except where explicitly indicated otherwise on a specific product page, all items sold by Dinanath & Sons—including but not limited to rolling mills, gold melting furnaces, casting equipment, pliers, tweezers, buffs, and consumables—are strictly non-returnable and non-refundable.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-3 pb-6 border-b border-[#343434]">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">2</span>
                            Products with Explicit Return Coverage
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            If a specific item qualifies for return or replacement coverage, it will be <strong>prominently highlighted on that product's individual page</strong>. Unless such return coverage is explicitly stated on the product detail page, no return requests will be accepted.
                        </p>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-3 pb-6 border-b border-[#343434]">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">3</span>
                            Manufacturing Defect & Transit Damage Protocol
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            In the unlikely event that an item arrives physically damaged during transit or with a verified manufacturing defect:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-[#CFCFCF] space-y-2">
                            <li>The customer must notify technical support within <strong>48 hours of delivery</strong> at <span className="text-[#F8F3E8] font-mono">info@dinanathandsons.com</span> or WhatsApp <span className="text-[#F8F3E8] font-mono">+91 9953435647</span>.</li>
                            <li>A continuous, unedited <strong>unboxing video</strong> showing the shipping label and package opening is required for defect claim verification.</li>
                            <li>Upon inspection and approval, Dinanath & Sons will dispatch a replacement unit or component at no extra cost.</li>
                        </ul>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">4</span>
                            Cancellation & Modification
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            Orders cannot be cancelled or modified once dispatched from our Chandni Chowk store. B2B wholesale orders involving customized machinery cannot be cancelled once production or procurement has commenced.
                        </p>
                    </div>
                </div>

                {/* Footer Copyright Note */}
                <div className="mt-12 text-center text-[10px] font-mono text-[#8E8E9A] uppercase tracking-widest">
                    © 1960 - 2026 DINANATH & SONS HARDWARE STORE. ALL RIGHTS RESERVED.
                </div>
            </div>
        </div>
    );
}
