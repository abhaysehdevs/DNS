'use client';

import { motion } from 'framer-motion';
import { RotateCcw, ShieldCheck, AlertCircle, CheckCircle2, Clock, HelpCircle, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ReturnPolicyPage() {
    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] pt-4 sm:pt-6 md:pt-8 pb-16 selection:bg-[#966E2E]/20">
            <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl">
                
                {/* Header Title */}
                <div className="text-center mb-6 sm:mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E8E2D5] text-[#966E2E] text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-3 shadow-xs"
                    >
                        <RotateCcw size={13} /> Transparent Customer Assurance
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-3 text-[#18181B] font-display">
                        Refund & <span className="text-[#966E2E]">Cancellation Policy</span>
                    </h1>
                    <p className="text-[#71717A] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider max-w-xl mx-auto">
                        Dinanath & Sons • 1914, Maliwara, Chandni Chowk, Delhi - 110006, India
                    </p>
                    <p className="text-[10px] text-[#A1A1AA] font-mono mt-1 uppercase">
                        Effective Date: September 2026 • 7-Day Return Window • Standard 5-7 Day Refund Processing
                    </p>
                </div>

                {/* Key Policy Highlights Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <Clock size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">7-Day Window</h4>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Return or exchange requests accepted within 7 days of delivery</p>
                    </div>
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <ShieldCheck size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">48-72h Defect Notice</h4>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Prompt reporting for transit damage or manufacturing defects</p>
                    </div>
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <RotateCcw size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">5-7 Day Refunds</h4>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Direct credit to original payment method (Razorpay / UPI / Bank)</p>
                    </div>
                </div>

                {/* Policy Narrative Body */}
                <div className="space-y-6 bg-white border border-[#E8E2D5] rounded-2xl p-5 sm:p-8 md:p-10 shadow-xs">
                    
                    {/* Section 1 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">1</span>
                            Overview & Commitment to Quality
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            At <strong>Dinanath & Sons</strong>, each tool, machine, and accessory is inspected for dimensional precision, alloy integrity, and operational calibration prior to dispatch from our Chandni Chowk facility. We stand behind our catalog and provide a transparent, fair refund and replacement procedure in compliance with Indian consumer protection standards and payment gateway rules.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">2</span>
                            Eligibility Criteria for Returns & Replacements
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Customers may request a return, replacement, or refund within <strong>7 calendar days from the date of physical delivery</strong> under the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-[#52525B] space-y-1.5 mt-2">
                            <li><strong>Transit Damage:</strong> The product arrives with visible physical breakage, denting, or structural impairment incurred during courier transit.</li>
                            <li><strong>Manufacturing Defect:</strong> The tool or machine exhibits a verifiable functional defect, mechanical malfunction, or electrical calibration failure upon initial setup.</li>
                            <li><strong>Incorrect or Incomplete Shipment:</strong> The item delivered differs in model, specifications, or quantity from what was confirmed on the commercial invoice.</li>
                        </ul>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">3</span>
                            Conditions for Returning Tools & Equipment
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Due to the high precision, mechanical calibration, and workshop safety standards of goldsmith equipment, returned merchandise must adhere to the following conditions:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-[#52525B] space-y-1.5 mt-2">
                            <li>The item must be returned in its <strong>original manufacturer packaging</strong>, along with all included accessories, calibration sheets, manuals, power adapters, and protective covers.</li>
                            <li>Items must be unused, unmounted, and free from external workshop contamination (e.g., flux, polishing rouge, chemical exposure, or unauthorized solder marks).</li>
                            <li><strong>Non-Returnable Items:</strong> Chemical consumables (fluxes, pickling acids, rhodium solutions), opened polishing paste bars, customized or engraved items, and bullion (gold/silver coins and bars) are strictly non-returnable once seals are breached.</li>
                        </ul>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">4</span>
                            Defect Reporting Procedure & Unboxing Video
                        </h3>
                        <div className="text-xs text-[#52525B] leading-relaxed space-y-2">
                            <p>
                                <strong>Reporting Timeline:</strong> Any physical damage or missing component must be reported to our technical desk within <strong>48 to 72 hours of delivery</strong>.
                            </p>
                            <p>
                                <strong>Unboxing Video Requirement:</strong> For expedited claim verification, we require customers to record a continuous, unedited unboxing video showing the outer shipping label, box condition, package opening, and the identified issue.
                            </p>
                            <p>
                                <strong>How to Submit a Request:</strong>
                            </p>
                            <div className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3.5 space-y-1">
                                <div>Email: <a href="mailto:info@dinanathandsons.com" className="text-[#966E2E] font-bold underline">info@dinanathandsons.com</a></div>
                                <div>WhatsApp / Phone: <a href="tel:+919953435647" className="text-[#966E2E] font-bold underline">+91 9953435647</a></div>
                                <div>Please include: Order ID, contact number, photographs of the product, and unboxing video clip.</div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">5</span>
                            Refund Processing Timeline & Payment Methods
                        </h3>
                        <div className="text-xs text-[#52525B] leading-relaxed space-y-2">
                            <p>
                                <strong>Inspection Upon Receipt:</strong> Once the returned merchandise reaches our Chandni Chowk workshop, our technical quality team will inspect the item within <strong>2 to 3 business days</strong>.
                            </p>
                            <p>
                                <strong>Refund Execution:</strong> Upon approval, the refund will be initiated immediately. Refunds are processed back to the <strong>original payment method</strong> used during checkout (via Razorpay, UPI, Net Banking, or Credit/Debit Card).
                            </p>
                            <p>
                                <strong>Bank Credit Timeline:</strong> Under standard Indian banking protocols, the refunded amount typically reflects in the customer's account within <strong>5 to 7 working days</strong> from the date of refund initiation.
                            </p>
                            <p>
                                <strong>Bank Transfer / NEFT:</strong> For bulk B2B orders settled via direct NEFT/RTGS transfer, refunds will be credited to the customer's verified originating bank account within 3 to 5 business days upon receipt of bank details.
                            </p>
                        </div>
                    </div>

                    {/* Section 6 */}
                    <div className="space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">6</span>
                            Order Cancellation Policy
                        </h3>
                        <div className="text-xs text-[#52525B] leading-relaxed space-y-2">
                            <p>
                                <strong>Standard Retail Orders:</strong> You may cancel standard in-stock retail orders at any time prior to factory dispatch (typically within 12 to 24 hours of placing the order) by contacting customer support. A 100% full refund will be processed immediately.
                            </p>
                            <p>
                                <strong>Post-Dispatch Cancellations:</strong> Once an order has been packed and handed over to logistics carriers with an active Air Waybill (AWB) number, cancellation is not possible. In such cases, the shipment must be received and processed through our standard 7-day return procedure.
                            </p>
                            <p>
                                <strong>B2B Customized Machinery Orders:</strong> Wholesale orders involving bespoke machinery engineering, custom voltages, custom roller patterns, or personalized branding cannot be cancelled once manufacturing or procurement begins.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Footer Copyright Note */}
                <div className="mt-8 text-center text-[10px] font-mono text-[#71717A] uppercase tracking-widest">
                    © 1960 - {new Date().getFullYear()} DINANATH & SONS. ALL RIGHTS RESERVED.
                </div>
            </div>
        </div>
    );
}
