import { Metadata } from 'next';
import { Truck, Clock, MapPin, PackageCheck, AlertCircle, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { SITE_CONFIG, getAbsoluteUrl } from '@/lib/site-config';
import { SHIPPING_POLICY } from '@/lib/policies';

export const metadata: Metadata = {
    title: 'Shipping & Delivery Policy | Dinanath & Sons',
    description: 'Find details on our 24-48h dispatch, pan-India delivery zones (1-10 days), free shipping threshold (₹1,999), and heavy machinery surface freight.',
    alternates: {
        canonical: getAbsoluteUrl('/shipping-policy'),
    },
    openGraph: {
        title: 'Shipping & Delivery Policy | Dinanath & Sons',
        description: 'Find details on our 24-48h dispatch, pan-India delivery zones (1-10 days), free shipping threshold (₹1,999), and heavy machinery surface freight.',
        url: getAbsoluteUrl('/shipping-policy'),
        type: 'website',
    },
};

export default function ShippingPolicyPage() {
    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] pt-4 sm:pt-6 md:pt-8 pb-16 selection:bg-[#966E2E]/20">
            <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl">
                
                {/* Header Title */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E8E2D5] text-[#966E2E] text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-3 shadow-xs">
                        <Truck size={13} /> Official Logistics & Dispatch Standard
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-3 text-[#18181B] font-display">
                        Shipping & <span className="text-[#966E2E]">Delivery Policy</span>
                    </h1>
                    <p className="text-[#71717A] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider max-w-xl mx-auto">
                        {SITE_CONFIG.businessName} • {SITE_CONFIG.address.formatted}
                    </p>
                    <p className="text-[10px] text-[#A1A1AA] font-mono mt-1 uppercase">
                        Effective Date: October 2026 • 24–48 Hours Dispatch • Pan-India Coverage (19,000+ PIN Codes)
                    </p>
                </div>

                {/* Key Highlights Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <Clock size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B]">24–48 Hours Dispatch</h3>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Prompt fulfillment from our central Chandni Chowk store</p>
                    </div>
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <MapPin size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B]">Free Over ₹{SHIPPING_POLICY.freeShippingThreshold.toLocaleString('en-IN')}</h3>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Complimentary parcel delivery across all Indian states</p>
                    </div>
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <PackageCheck size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#18181B]">Industrial Freight</h3>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Reinforced wooden crate packing for heavy rolling mills & machinery</p>
                    </div>
                </div>

                {/* Detailed Shipping Sections */}
                <div className="space-y-6 bg-white border border-[#E8E2D5] rounded-2xl p-5 sm:p-8 md:p-10 shadow-xs text-left">
                    
                    {/* Section 1 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h2 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">1</span>
                            Order Dispatch Timelines
                        </h2>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Every confirmed order is packaged and dispatched within <strong>24 to 48 business hours</strong> (excluding Sundays and national holidays) directly from our central store in Maliwara, Chandni Chowk, Delhi. You will receive an SMS and email notification with your carrier AWB tracking number immediately upon handover.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h2 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">2</span>
                            Delivery Transit Times by Destination Zone
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#52525B] pt-2">
                            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E8E2D5]">
                                <h4 className="font-bold text-[#18181B] uppercase text-[11px] mb-1">Delhi NCR (Local)</h4>
                                <p><strong>1 to 2 business days.</strong> Express local dispatch available for workshop emergencies.</p>
                            </div>
                            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E8E2D5]">
                                <h4 className="font-bold text-[#18181B] uppercase text-[11px] mb-1">Major Metro Cities</h4>
                                <p><strong>2 to 4 business days.</strong> Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad.</p>
                            </div>
                            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E8E2D5]">
                                <h4 className="font-bold text-[#18181B] uppercase text-[11px] mb-1">Rest of India (Tier 2 / 3)</h4>
                                <p><strong>4 to 7 business days.</strong> Regional logistics networks across all state capitals and districts.</p>
                            </div>
                            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E8E2D5]">
                                <h4 className="font-bold text-[#18181B] uppercase text-[11px] mb-1">Remote & North-East</h4>
                                <p><strong>7 to 10 business days.</strong> Special surface and air cargo routes for remote areas.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h2 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">3</span>
                            Shipping Rates & Free Delivery Threshold
                        </h2>
                        <ul className="list-disc pl-5 text-xs text-[#52525B] space-y-1">
                            <li><strong>Orders Above ₹{SHIPPING_POLICY.freeShippingThreshold.toLocaleString('en-IN')}:</strong> Free standard parcel delivery across India.</li>
                            <li><strong>Orders Below ₹{SHIPPING_POLICY.freeShippingThreshold.toLocaleString('en-IN')}:</strong> Flat standard shipping charge of ₹{SHIPPING_POLICY.standardShippingCharge}.</li>
                            <li><strong>Heavy Machinery (&gt; 20 kg):</strong> B2B surface freight (crated transport) is quoted at checkout based on weight and PIN code, or dispatched on a To-Pay basis per client instruction.</li>
                        </ul>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h2 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">4</span>
                            Geographic Reach
                        </h2>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            We ship to all 28 Indian states and 8 union territories, covering over 19,000 postal codes through trusted courier networks including Blue Dart, Delhivery, DTDC, and India Post.
                        </p>
                        <p className="text-xs text-[#71717A] italic">
                            For overseas / export requirements, please get in touch with our international sales desk at info@dinanathandsons.com for custom freight and customs documentation.
                        </p>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-2">
                        <h2 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">5</span>
                            Order Tracking & Dispatch Inquiries
                        </h2>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Once your order has been dispatched, you can track real-time delivery status using our <Link href="/track-order" className="text-[#966E2E] underline font-bold">Track Order Portal</Link> or by contacting our logistics coordinator:
                        </p>
                        <div className="bg-[#FAF9F5] border border-[#E8E2D5] p-4 rounded-xl text-xs space-y-1">
                            <p><strong>Logistics Desk:</strong> {SITE_CONFIG.businessName}</p>
                            <p><strong>Dispatch Hub:</strong> {SITE_CONFIG.address.formatted}</p>
                            <p><strong>Phone:</strong> {SITE_CONFIG.contact.phoneDisplay}</p>
                            <p><strong>Email:</strong> {SITE_CONFIG.contact.email}</p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
