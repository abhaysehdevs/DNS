import { Metadata } from 'next';
import { RotateCcw, ShieldCheck, Clock, PackageCheck, AlertCircle, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { SITE_CONFIG, getAbsoluteUrl } from '@/lib/site-config';
import { RETURN_POLICY } from '@/lib/policies';

export const metadata: Metadata = {
    title: 'Returns & Replacement Policy — 7-Day Guarantee | Dinanath & Sons',
    description: 'Learn about our 7-day defect replacement guarantee, transit damage reporting, non-returnable consumables, and refund processing timelines.',
    alternates: {
        canonical: getAbsoluteUrl('/return-policy'),
    },
    openGraph: {
        title: 'Returns & Replacement Policy — 7-Day Guarantee | Dinanath & Sons',
        description: 'Learn about our 7-day defect replacement guarantee, transit damage reporting, non-returnable consumables, and refund processing timelines.',
        url: getAbsoluteUrl('/return-policy'),
        type: 'website',
    },
};

export default function ReturnPolicyPage() {
    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] pt-4 sm:pt-6 md:pt-8 pb-16 selection:bg-[#966E2E]/20">
            <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl">
                
                {/* Header Title */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E8E2D5] text-[#966E2E] text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-3 shadow-xs">
                        <RotateCcw size={13} /> Transparent Customer Assurance
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-3 text-[#18181B] font-display">
                        Returns & Replacement Policy — <span className="text-[#966E2E]">7-Day Guarantee</span>
                    </h1>
                    <p className="text-[#71717A] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider max-w-xl mx-auto">
                        {SITE_CONFIG.businessName} • {SITE_CONFIG.address.formatted}
                    </p>
                    <p className="text-[10px] text-[#A1A1AA] font-mono mt-1 uppercase">
                        Effective Date: October 2026 • 7-Day Replacement Window • 5-7 Business Days Refund Processing
                    </p>
                </div>

                {/* Key Policy Highlights Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <Clock size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">7-Day Guarantee</h4>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Replacement or return requests accepted within 7 days of delivery</p>
                    </div>
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <ShieldCheck size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">48–72h Defect Notice</h4>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Prompt reporting for transit damage or manufacturing defects with unboxing video</p>
                    </div>
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 sm:p-4 text-center shadow-xs">
                        <RotateCcw size={20} className="text-[#966E2E] mx-auto mb-1.5" />
                        <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">5–7 Day Refunds</h4>
                        <p className="text-[10px] text-[#71717A] mt-0.5">Direct credit to original payment method (Razorpay / UPI / Bank)</p>
                    </div>
                </div>

                {/* Policy Narrative Body */}
                <div className="space-y-6 bg-white border border-[#E8E2D5] rounded-2xl p-5 sm:p-8 md:p-10 shadow-xs text-left">
                    
                    {/* Section 1 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h2 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">1</span>
                            Scope & Eligibility for Returns & Replacements
                        </h2>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            {RETURN_POLICY.shortNotice}
                        </p>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            We accept returns and issue free replacements within 7 calendar days of delivery under the following specific circumstances:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-[#52525B] space-y-1">
                            <li><strong>Transit Damage:</strong> The tool, machine, or packaging arrived physically broken, deformed, or shattered during transport.</li>
                            <li><strong>Manufacturing Defect:</strong> The unit suffers from mechanical failure, motor defect, or manufacturing misalignment not caused by misuse.</li>
                            <li><strong>Incorrect Item:</strong> The product received differs in model, specification, or size from what was ordered.</li>
                        </ul>
                        <p className="text-xs text-[#71717A] italic">
                            Please note: As a specialized workshop hardware supplier, change-of-mind returns are not accepted once products are unpacked or used on the bench.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h2 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">2</span>
                            Non-Returnable Items
                        </h2>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Due to safety, regulatory, and metallurgical considerations, the following product categories cannot be returned:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-[#52525B] space-y-1">
                            <li>Laboratory chemicals, acids (citric, boric), soldering liquid fluxes (suhaga), and silver cleaning dips.</li>
                            <li>Butane gas refills and pressurized canisters.</li>
                            <li>Consumable polishing buffs, compounds (rouge, lakh batti), and sandblast media once opened or used.</li>
                            <li>Bullion blister coin cards and assay packaging once tamper-evident seals are broken.</li>
                            <li>Custom-machined, engraved, or specially ordered workshop machinery.</li>
                        </ul>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h2 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">3</span>
                            Step-by-Step Reporting & Pickup Process
                        </h2>
                        <ol className="list-decimal pl-5 text-xs text-[#52525B] space-y-2">
                            <li>
                                <strong>Report within 48–72 hours:</strong> Contact our workshop desk at <a href="mailto:info@dinanathandsons.com" className="text-[#966E2E] font-bold">info@dinanathandsons.com</a> or WhatsApp <a href="https://wa.me/919953435647" className="text-[#966E2E] font-bold">+91 9953435647</a>. Provide your Order Number, phone number, and a brief description.
                            </li>
                            <li>
                                <strong>Unboxing Video:</strong> Attach photos and a continuous unboxing video clearly showing the outer parcel label and the damaged or defective tool.
                            </li>
                            <li>
                                <strong>Free Reverse Pickup:</strong> Once verified, Dinanath & Sons schedules a courier reverse pickup at our own expense. You will receive an AWB tracking code.
                            </li>
                            <li>
                                <strong>Replacement or Refund:</strong> A brand-new replacement unit is dispatched within 24 hours of reverse tracking activation, or a 100% refund is processed.
                            </li>
                        </ol>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h2 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">4</span>
                            Refund Timelines & Payment Method
                        </h2>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Approved refunds are credited directly to the original payment source:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-[#52525B] space-y-1">
                            <li><strong>UPI & Netbanking:</strong> 2 to 4 business days.</li>
                            <li><strong>Credit & Debit Cards:</strong> 5 to 7 business days depending on the card issuer.</li>
                            <li><strong>NEFT/RTGS Bank Transfers:</strong> 2 to 3 business days to the customer's verified bank account.</li>
                        </ul>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-2">
                        <h2 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">5</span>
                            Customer Grievance & Physical Address
                        </h2>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            For return queries, warranty verifications, or escalated disputes, our workshop grievance desk is reachable at:
                        </p>
                        <div className="bg-[#FAF9F5] border border-[#E8E2D5] p-4 rounded-xl text-xs space-y-1">
                            <p><strong>Business Name:</strong> {SITE_CONFIG.businessName}</p>
                            <p><strong>Physical Store:</strong> {SITE_CONFIG.address.formatted}</p>
                            <p><strong>Phone:</strong> {SITE_CONFIG.contact.phoneDisplay} (Mon - Sat, 11 AM - 8 PM IST)</p>
                            <p><strong>Email:</strong> {SITE_CONFIG.contact.email}</p>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
