'use client';

import { motion } from 'framer-motion';
import { Scale, FileText, Building2, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
                        <Scale size={13} /> Legal Agreement & Trade Directive
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-3 text-[#18181B] font-display">
                        Terms of <span className="text-[#966E2E]">Service</span>
                    </h1>
                    <p className="text-[#71717A] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider max-w-xl mx-auto">
                        Dinanath & Sons • 1914, Maliwara, Chandni Chowk, Delhi - 110006, India
                    </p>
                    <p className="text-[10px] text-[#A1A1AA] font-mono mt-1 uppercase">
                        Last Updated: September 2026 • Compliant with Indian E-Commerce Regulations
                    </p>
                </div>

                {/* Summary Pill Box */}
                <div className="bg-[#FFFDF9] border border-[#E8E2D5] rounded-xl p-4 sm:p-5 mb-6 shadow-xs text-xs text-[#52525B] leading-relaxed">
                    <p className="font-semibold text-[#18181B] mb-1">
                        Commercial Notice for Retail & Wholesale (B2B) Purchasers:
                    </p>
                    <p>
                        Welcome to <strong>dinanathandsons.com</strong>. By accessing our website, placing an order, or entering into a commercial procurement agreement with <strong>Dinanath & Sons</strong>, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms and Conditions. If you do not agree with any part of these terms, you must refrain from placing orders through this platform.
                    </p>
                </div>

                {/* Detailed Terms Sections */}
                <div className="space-y-6 bg-white border border-[#E8E2D5] rounded-2xl p-5 sm:p-8 md:p-10 shadow-xs">
                    
                    {/* Section 1 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">1</span>
                            Commercial Identity & Operations
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            This e-commerce platform and trade catalog is owned, managed, and operated by <strong>Dinanath & Sons</strong> (Established in 1960), having its registered principal place of business at <strong>1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Central Delhi, Delhi - 110006, India</strong>. We specialize in the precision manufacturing, wholesale distribution, and retail supply of jewellery-making machinery, metallurgical equipment, goldsmith tools, casting consumables, and certified bullion products.
                        </p>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">2</span>
                            Eligibility & User Undertakings
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            By utilizing this website, you warrant and represent that you are at least 18 years of age and legally competent to enter into binding contracts under the <strong>Indian Contract Act, 1872</strong>. When acting on behalf of a corporate entity, manufacturing workshop, retail jewellery enterprise, or partnership firm, you represent that you possess the full corporate authority to bind that entity to these Terms of Service.
                        </p>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">3</span>
                            Pricing, GST Invoicing & Input Tax Credit (ITC)
                        </h3>
                        <div className="text-xs text-[#52525B] leading-relaxed space-y-2">
                            <p>
                                <strong>Currency:</strong> All prices listed on the website are denominated in <strong>Indian Rupees (INR)</strong>. 
                            </p>
                            <p>
                                <strong>Statutory GST Compliance:</strong> Dinanath & Sons operates in strict compliance with the <strong>Central Goods and Services Tax (CGST) Act, 2017</strong>, Integrated Goods and Services Tax (IGST) Act, and applicable State GST legislation. Statutory Goods and Services Tax (GST) is levied at the prescribed rates based on the Harmonized System of Nomenclature (HSN) codes of the respective tools or industrial machinery.
                            </p>
                            <p>
                                <strong>B2B Tax Invoices:</strong> For registered commercial entities seeking to claim <strong>Input Tax Credit (ITC)</strong>, a valid Goods and Services Tax Identification Number (GSTIN) and legal business name must be provided at the time of checkout. Once an invoice has been registered and generated through our GST accounting system, changes to GSTIN details cannot be made for that transaction.
                            </p>
                            <p>
                                <strong>Price Adjustments:</strong> We make every effort to maintain accurate catalog pricing. However, due to raw material price fluctuations (e.g., steel, brass, precious metals) or inadvertent typographical errors, we reserve the right to correct prices or cancel an order prior to dispatch upon promptly notifying the purchaser.
                            </p>
                        </div>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">4</span>
                            B2B Wholesale Orders & Custom Machinery Quotations
                        </h3>
                        <div className="text-xs text-[#52525B] leading-relaxed space-y-2">
                            <p>
                                <strong>Minimum Order Quantities (MOQ):</strong> Wholesale rates and bulk discounts are subject to specific Minimum Order Quantities per item, as defined in our catalog or commercial trade quotes.
                            </p>
                            <p>
                                <strong>Quotation Validity:</strong> Formal B2B proforma invoices and price quotations issued via email or WhatsApp are valid for a duration of <strong>7 calendar days</strong> from the date of issuance, unless explicitly stated otherwise in writing.
                            </p>
                            <p>
                                <strong>Wholesale Payment Terms:</strong> Unless alternative credit facilities have been executed in writing, all wholesale and customized equipment orders require 100% advance payment settlement before goods are released from our Chandni Chowk distribution hub.
                            </p>
                            <p>
                                <strong>Custom Fabrication:</strong> Orders involving customized machine specifications (such as custom motor voltages, customized roller engravings, or dedicated furnace sizes) cannot be cancelled or altered once fabrication or component allocation has commenced.
                            </p>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">5</span>
                            Payment Gateway & Financial Security
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Online electronic payments on dinanathandsons.com are securely processed through Reserve Bank of India (RBI) authorized payment aggregators, primarily <strong>Razorpay Software Private Limited</strong>. Supported payment instruments include Unified Payments Interface (UPI - GPay, PhonePe, Paytm, BHIM), Indian & International Credit Cards, Debit Cards, and Net Banking across major scheduled Indian banks. Dinanath & Sons does not store or process sensitive cardholder credentials, CVVs, or bank passwords. In the event of an inadvertent double-charge or failed gateway session, funds will be refunded to the originating account within the timeline prescribed by the payment gateway (typically 5 to 7 banking days).
                        </p>
                    </div>

                    {/* Section 6 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">6</span>
                            Shipping, Delivery & Risk of Loss
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Standard orders are dispatched within <strong>24 to 48 hours</strong> following successful payment verification. Delivery times range between 2 to 7 business days depending on geographical destination and logistics constraints. For complete details regarding logistics carriers, heavy machinery surface freight, wooden crating, and delivery procedures, please refer to our comprehensive <Link href="/shipping-policy" className="text-[#966E2E] font-bold underline hover:text-[#7D5A25]">Shipping & Delivery Policy</Link>, which is incorporated into these Terms by reference.
                        </p>
                    </div>

                    {/* Section 7 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">7</span>
                            Refunds, Replacements & Cancellation
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            We provide a <strong>7-day window</strong> from the date of delivery for reporting verified transit damage, manufacturing defects, or incorrect item dispatches. Physical defects must be reported within <strong>48 to 72 hours</strong> accompanied by a continuous unboxing video. Due to the high precision and workshop hygiene standards of goldsmith equipment, used tools are strictly non-returnable. For complete eligibility criteria and refund processing times, review our <Link href="/return-policy" className="text-[#966E2E] font-bold underline hover:text-[#7D5A25]">Refund & Cancellation Policy</Link>.
                        </p>
                    </div>

                    {/* Section 8 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">8</span>
                            Industrial Equipment Safety & Limitation of Liability
                        </h3>
                        <div className="text-xs text-[#52525B] leading-relaxed space-y-2">
                            <p>
                                <strong>Safety Protocols:</strong> Our catalog includes high-temperature electric melting furnaces, gas blowtorches, high-speed rotary polishers, motor units, and rolling mills. Purchasers and operators are solely responsible for ensuring that workshop equipment is installed by qualified personnel in well-ventilated, fire-safe environments and that appropriate personal protective equipment (PPE) is worn during operation.
                            </p>
                            <p>
                                <strong>Liability Cap:</strong> Under no circumstances shall Dinanath & Sons, its owners, or affiliates be liable for any indirect, punitive, incidental, or consequential damages resulting from improper operation, unauthorized modifications, or failure to follow electrical/mechanical guidelines. To the fullest extent permissible under Indian law, our total cumulative liability for any verified claim shall not exceed the actual invoice purchase price paid for the specific item in question.
                            </p>
                        </div>
                    </div>

                    {/* Section 9 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">9</span>
                            Intellectual Property Rights
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            All content on this website, including but not limited to brand trademarks, logos, tool photography, product descriptions, catalog schemas, and UI design, constitutes the intellectual property of Dinanath & Sons and is protected under the <strong>Trade Marks Act, 1999</strong> and the <strong>Copyright Act, 1957</strong>. Any unauthorized reproduction, scraping, commercial republishing, or distribution without prior written consent is strictly prohibited.
                        </p>
                    </div>

                    {/* Section 10 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">10</span>
                            Governing Law & Delhi Legal Jurisdiction
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            These Terms of Service, along with all contracts of sale, commercial invoices, and website interactions, shall be governed by, interpreted, and construed strictly in accordance with the <strong>laws of the Republic of India</strong>. In the event of any legal action, dispute, or proceeding arising out of or in connection with these Terms, the parties hereby irrevocably submit to the <strong>exclusive jurisdiction of the competent courts situated in Delhi, India</strong>, to the exclusion of all other courts.
                        </p>
                    </div>

                    {/* Section 11 - Grievance Redressal */}
                    <div className="space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">11</span>
                            Customer Grievance Redressal Mechanism
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Pursuant to Rule 5(9) of the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, Dinanath & Sons has appointed a designated Grievance Officer to resolve any consumer complaints or trade disputes:
                        </p>
                        <div className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-4 text-xs text-[#52525B] space-y-1.5 mt-2">
                            <div className="font-bold text-[#18181B]">Grievance Officer: Customer Support Division</div>
                            <div><strong>Entity:</strong> Dinanath & Sons</div>
                            <div><strong>Address:</strong> 1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi - 110006, India</div>
                            <div><strong>Email:</strong> <a href="mailto:info@dinanathandsons.com" className="text-[#966E2E] font-semibold underline">info@dinanathandsons.com</a></div>
                            <div><strong>Phone:</strong> <a href="tel:+919953435647" className="text-[#966E2E] font-semibold underline">+91 9953435647</a> (Mon - Sat, 11:00 AM - 8:00 PM IST)</div>
                            <div className="text-[11px] text-[#71717A] pt-1">We acknowledge consumer complaints within 48 hours and strive to resolve issues within 30 days of receipt.</div>
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
