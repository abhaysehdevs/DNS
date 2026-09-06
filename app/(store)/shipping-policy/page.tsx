'use client';

import { motion } from 'framer-motion';
import { Truck, Clock, ShieldCheck, MapPin, PackageCheck, FileText } from 'lucide-react';
import Link from 'next/link';

export default function ShippingPolicyPage() {
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
                        <Truck size={14} /> Official Logistics Standard
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mb-4">
                        Shipping & <span className="text-[#A67C35]">Dispatch Policy</span>
                    </h1>
                    <p className="text-[#8E8E9A] text-xs font-mono font-bold uppercase tracking-widest max-w-xl mx-auto">
                        Dinanath & Sons Hardware Store — Pan-India Distribution Network
                    </p>
                </div>

                {/* Key Highlights Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    <div className="bg-[#1E1E1E] border border-[#343434] rounded-2xl p-5 text-center space-y-2">
                        <Clock size={24} className="text-[#A67C35] mx-auto" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F3E8]">24 - 48 Hours Dispatch</h3>
                        <p className="text-[10px] text-[#8E8E9A] leading-normal font-semibold">Fast processing from Chandni Chowk store</p>
                    </div>
                    <div className="bg-[#1E1E1E] border border-[#343434] rounded-2xl p-5 text-center space-y-2">
                        <MapPin size={24} className="text-[#A67C35] mx-auto" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F3E8]">Pan-India Coverage</h3>
                        <p className="text-[10px] text-[#8E8E9A] leading-normal font-semibold">Serving 19,000+ PIN codes across India</p>
                    </div>
                    <div className="bg-[#1E1E1E] border border-[#343434] rounded-2xl p-5 text-center space-y-2">
                        <PackageCheck size={24} className="text-[#A67C35] mx-auto" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8F3E8]">Heavy Freight Handling</h3>
                        <p className="text-[10px] text-[#8E8E9A] leading-normal font-semibold">Insured surface logistics for machinery</p>
                    </div>
                </div>

                {/* Detailed Shipping Sections */}
                <div className="space-y-8 bg-[#1E1E1E] border border-[#343434] rounded-2xl p-6 md:p-10 shadow-lg">
                    
                    <div className="space-y-3 pb-6 border-b border-[#343434]">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">1</span>
                            Order Dispatch Timelines
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            All standard in-stock jewellery tools, consumables, and accessories are dispatched within <strong>24 to 48 hours</strong> (excluding Sundays and national holidays) after payment verification.
                        </p>
                    </div>

                    <div className="space-y-3 pb-6 border-b border-[#343434]">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">2</span>
                            Delivery Durations
                        </h3>
                        <ul className="list-disc pl-5 text-xs text-[#CFCFCF] space-y-2">
                            <li><strong>Delhi NCR Region:</strong> 1 to 2 business days.</li>
                            <li><strong>Metro Cities & Major Hubs:</strong> 2 to 5 business days.</li>
                            <li><strong>Rest of India:</strong> 4 to 7 business days.</li>
                            <li><strong>Heavy Machinery Freight (Rolling Mills, Furnaces):</strong> 5 to 10 business days depending on destination location.</li>
                        </ul>
                    </div>

                    <div className="space-y-3 pb-6 border-b border-[#343434]">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">3</span>
                            Heavy Machinery & Crate Packing
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            Heavy industrial machinery is packed in reinforced wooden crates with internal shockproofing. Shipments are dispatched through specialized surface logistics partners (V-Trans, TCI Freight, Safexpress). Transit insurance is applied to all high-value machinery shipments.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-[#A67C35] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/30 flex items-center justify-center text-xs">4</span>
                            Tracking & AWB Confirmation
                        </h3>
                        <p className="text-xs text-[#CFCFCF] leading-relaxed">
                            Upon dispatch, an automated notification containing your Air Waybill (AWB) number and courier tracking link is sent via email and SMS. You can also track your shipment live on our <Link href="/track-order" className="text-[#A67C35] font-bold hover:underline">Track Order</Link> page.
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
