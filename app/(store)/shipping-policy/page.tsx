'use client';

import { motion } from 'framer-motion';
import { Truck, Clock, ShieldCheck, MapPin, PackageCheck, AlertCircle, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ShippingPolicyPage() {
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
                        <Truck size={13} /> Official Logistics & Dispatch Standard
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-3 text-[#18181B] font-display">
                        Shipping & <span className="text-[#966E2E]">Delivery Policy</span>
                    </h1>
                    <p className="text-[#71717A] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider max-w-xl mx-auto">
                        Dinanath & Sons • 1914, Maliwara, Chandni Chowk, Delhi - 110006, India
                    </p>
                    <p className="text-[10px] text-[#A1A1AA] font-mono mt-1 uppercase">
                        Effective Date: September 2026 • 24-48 Hours Dispatch • Pan-India Coverage
                    </p>
                </div>

                {/* Key Highlights Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <Clock size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B]">24 - 48 Hours Dispatch</h3>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Fast fulfillment from our Chandni Chowk central store</p>
                    </div>
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <MapPin size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B]">Pan-India Delivery</h3>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Serving 19,000+ PIN codes across all Indian states</p>
                    </div>
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <PackageCheck size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B]">Industrial Freight</h3>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Reinforced wooden crate packing & transit insurance</p>
                    </div>
                </div>

                {/* Detailed Shipping Sections */}
                <div className="space-y-6 bg-white border border-[#E8E2D5] rounded-2xl p-5 sm:p-8 md:p-10 shadow-xs">
                    
                    {/* Section 1 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">1</span>
                            Order Dispatch Timelines
                        </h3>
                        <div className="text-xs text-[#52525B] leading-relaxed space-y-2">
                            <p>
                                <strong>Standard Retail Orders:</strong> All in-stock goldsmith tools, hand instruments, tweezers, pliers, measuring gauges, and buffing accessories are dispatched within <strong>24 to 48 hours</strong> (excluding Sundays and statutory gazetted holidays) following receipt of confirmed order payment.
                            </p>
                            <p>
                                <strong>B2B Bulk & Heavy Machinery Orders:</strong> Commercial wholesale consignments and industrial equipment requiring electrical calibration (such as rolling mills, sandblasting units, and casting machines) are dispatched within <strong>3 to 5 business days</strong> following rigorous bench inspection.
                            </p>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">2</span>
                            Domestic Delivery Procedures & Transit Timelines
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            We partner with top-tier express courier networks (Bluedart, Delhivery, DTDC, India Post) to serve over 19,000 postal PIN codes across India. Expected transit durations from our Chandni Chowk hub:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-[#52525B] space-y-1.5 mt-2">
                            <li><strong>Delhi NCR Region:</strong> 1 to 2 business days.</li>
                            <li><strong>Tier-1 Metro Hubs (Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, Ahmedabad):</strong> 2 to 4 business days.</li>
                            <li><strong>Rest of India (Tier-2 & Tier-3 Cities, Regional Towns):</strong> 4 to 7 business days.</li>
                            <li><strong>Remote / Northeast / Island Territories:</strong> 7 to 10 business days.</li>
                        </ul>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">3</span>
                            Heavy Machinery & Bulk Shipping Considerations
                        </h3>
                        <div className="text-xs text-[#52525B] leading-relaxed space-y-2">
                            <p>
                                <strong>Specialized Surface Freight:</strong> Heavy machinery exceeding 20 kg (including motorized rolling mills, dust collector cabinets, and induction furnaces) is shipped via dedicated surface freight logistics partners (V-Trans, TCI Freight, Safexpress).
                            </p>
                            <p>
                                <strong>Reinforced Wooden Crate Packaging:</strong> All heavy equipment is secured inside custom-built, shock-resistant wooden crates with internal high-density polyethylene foam buffers and waterproof barrier liners to prevent transit shock.
                            </p>
                            <p>
                                <strong>Transit Insurance:</strong> High-value machinery shipments are covered by comprehensive transit cargo insurance to safeguard against accidental transit damage or total loss.
                            </p>
                            <p>
                                <strong>Unloading & Access:</strong> For heavy machinery deliveries, the buyer must ensure that the designated delivery location is accessible to commercial transport trucks. Offloading facilities (labour or hydraulic lifters) are the responsibility of the receiving workshop unless pre-arranged.
                            </p>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">4</span>
                            Shipping Rates & Freight Charges
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Shipping charges are calculated transparently during online checkout based on the total volumetric weight of the cart and the recipient's delivery PIN code. For special B2B wholesale consignments, freight can either be pre-paid or booked on a "To-Pay" freight basis through the buyer's preferred transport carrier.
                        </p>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">5</span>
                            Order Tracking & Live AWB Notifications
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Once your shipment is picked up by our courier partners, an automated notification containing the Air Waybill (AWB) number and direct courier tracking URL is dispatched via Email, SMS, and WhatsApp. You can also monitor your package status in real time by visiting our <Link href="/track-order" className="text-[#966E2E] font-bold underline hover:text-[#7D5A25]">Track Order</Link> page.
                        </p>
                    </div>

                    {/* Section 6 */}
                    <div className="space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">6</span>
                            Delivery Attempts & Undelivered Consignments
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Our courier partners will make up to three (3) delivery attempts at the destination address. If delivery fails due to an incorrect address, recipient unavailability, or refusal to accept without valid justification, the shipment may be returned to our Chandni Chowk store. Re-dispatch charges will apply for re-sending returned parcels.
                        </p>
                        <div className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3.5 mt-3 space-y-1 text-xs text-[#52525B]">
                            <div className="font-bold text-[#18181B]">Questions Regarding Your Shipment?</div>
                            <div>Logistics Desk: <a href="mailto:info@dinanathandsons.com" className="text-[#966E2E] font-bold underline">info@dinanathandsons.com</a></div>
                            <div>Helpline: <a href="tel:+919953435647" className="text-[#966E2E] font-bold underline">+91 9953435647</a> (Mon - Sat, 11:00 AM - 8:00 PM IST)</div>
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
