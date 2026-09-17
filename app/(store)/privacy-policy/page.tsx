'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, Server, Cookie, UserCheck, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
                        <ShieldCheck size={13} /> Data Protection & Privacy Standard
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-none mb-3 text-[#18181B] font-display">
                        Privacy <span className="text-[#966E2E]">Policy</span>
                    </h1>
                    <p className="text-[#71717A] text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider max-w-xl mx-auto">
                        Dinanath & Sons • 1914, Maliwara, Chandni Chowk, Delhi - 110006, India
                    </p>
                    <p className="text-[10px] text-[#A1A1AA] font-mono mt-1 uppercase">
                        Effective Date: September 2026 • Compliant with Indian IT Act 2000 & DPDP Act 2023
                    </p>
                </div>

                {/* Introductory Notice */}
                <div className="bg-[#FFFDF9] border border-[#E8E2D5] rounded-xl p-4 sm:p-5 mb-6 shadow-xs text-xs text-[#52525B] leading-relaxed">
                    <p className="font-semibold text-[#18181B] mb-1">
                        Commitment to Customer & Commercial Partner Privacy:
                    </p>
                    <p>
                        At <strong>Dinanath & Sons</strong> (operating as <strong>dinanathandsons.com</strong>), we recognize the paramount importance of data confidentiality and customer trust. This Privacy Policy sets out the principles and practices governing our collection, storage, processing, and disclosure of personal and commercial data obtained through our website, mobile interface, and direct wholesale interactions.
                    </p>
                </div>

                {/* Detailed Privacy Sections */}
                <div className="space-y-6 bg-white border border-[#E8E2D5] rounded-2xl p-5 sm:p-8 md:p-10 shadow-xs">
                    
                    {/* Section 1 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">1</span>
                            Information We Collect
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            When you browse our storefront, register an account, place an order, or submit an inquiry for industrial machinery, we collect relevant information necessary to deliver our services:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-[#52525B] space-y-1.5 mt-2">
                            <li><strong>Personal & Business Identification:</strong> Full name, company / workshop name, contact telephone number, mobile number, and email address.</li>
                            <li><strong>GST & Tax Invoicing Data:</strong> Goods and Services Tax Identification Number (GSTIN), business legal entity name, and billing address for issuing official GST tax invoices.</li>
                            <li><strong>Shipping & Delivery Details:</strong> Physical workshop or residential delivery address, landmark, PIN code, and recipient contact credentials.</li>
                            <li><strong>Order & Transaction Records:</strong> Purchased item IDs, quantities, order date, total transaction value, and payment method selected.</li>
                            <li><strong>Technical & Browsing Data:</strong> Internet Protocol (IP) address, browser type, operating system, device identifiers, and browsing activity collected via session cookies.</li>
                        </ul>
                    </div>

                    {/* Section 2 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">2</span>
                            Payment Gateway & Financial Security (Razorpay)
                        </h3>
                        <div className="text-xs text-[#52525B] leading-relaxed space-y-2">
                            <p>
                                <strong>Zero Storage of Sensitive Card Credentials:</strong> Dinanath & Sons strictly adheres to Reserve Bank of India (RBI) directives on digital payment processing and card data tokenization. <strong>We do not capture, record, or store any sensitive banking credentials</strong>, including credit/debit card numbers, CVVs, expiration dates, UPI PINs, or net-banking login passwords on our servers.
                            </p>
                            <p>
                                <strong>PCI-DSS Compliant Processing:</strong> All electronic transactions are executed via encrypted channels through our RBI-licensed payment gateway partner, <strong>Razorpay Software Private Limited</strong>. Razorpay maintains PCI-DSS Level 1 certification (Payment Card Industry Data Security Standard). During payment, your financial details are securely transmitted directly to the gateway under 256-bit SSL encryption.
                            </p>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">3</span>
                            How We Utilize Your Information
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            The information gathered is utilized exclusively for legitimate business purposes:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-[#52525B] space-y-1.5 mt-2">
                            <li>Fulfilling, processing, and dispatching orders placed through the website.</li>
                            <li>Generating statutory GST Tax Invoices and maintaining commercial accounting records in compliance with Indian tax laws.</li>
                            <li>Transmitting order updates, live Air Waybill (AWB) courier tracking details, and dispatch confirmations via SMS, WhatsApp, and Email.</li>
                            <li>Providing technical customer support, machine installation consultation, and defect resolution.</li>
                            <li>Preventing fraudulent transactions and ensuring overall website security.</li>
                        </ul>
                    </div>

                    {/* Section 4 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">4</span>
                            Data Sharing with Third-Party Service Providers
                        </h3>
                        <div className="text-xs text-[#52525B] leading-relaxed space-y-2">
                            <p>
                                <strong>We do not sell, rent, or lease your personal data to advertisers or commercial brokers.</strong> We share strictly limited, necessary information with authorized third parties solely to complete our operational contracts:
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5">
                                <li><strong>Logistics & Freight Partners:</strong> We share recipient name, contact phone number, and physical shipping address with logistics partners (e.g., Shiprocket, Bluedart, Delhivery, V-Trans, TCI Freight, Safexpress) solely for physical package dispatch, customs transit compliance, and delivery coordination.</li>
                                <li><strong>Cloud Infrastructure & Database Hosts:</strong> Secure databases hosted via Supabase and AWS with enterprise-grade encryption at rest and in transit.</li>
                                <li><strong>Legal & Law Enforcement Bodies:</strong> We may disclose data when required to do so by applicable Indian legislation, court summons, or regulatory authorities under the Information Technology Act, 2000.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">5</span>
                            Cookies & Web Tracking Technologies
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Our website employs cookies—small alphanumeric files stored in your web browser—to optimize your user experience:
                        </p>
                        <ul className="list-disc pl-5 text-xs text-[#52525B] space-y-1.5 mt-2">
                            <li><strong>Essential Cookies:</strong> Required to maintain user authentication sessions, keep items in your shopping cart, and preserve security parameters.</li>
                            <li><strong>Preference Cookies:</strong> Store your preferred language (English, Hindi, etc.) and currency preferences (INR).</li>
                            <li><strong>Analytics Cookies:</strong> Help us anonymously evaluate storefront performance, page load velocities, and technical search effectiveness.</li>
                        </ul>
                        <p className="text-xs text-[#52525B] leading-relaxed mt-2">
                            You may configure your browser settings to reject cookies; however, certain interactive functionalities (such as the persistent cart and account dashboard) may be impaired.
                        </p>
                    </div>

                    {/* Section 6 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">6</span>
                            Data Retention & Security Measures
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            We retain transaction and billing records for the period mandated under the <strong>Companies Act, 2013</strong> and the <strong>Central Goods and Services Tax Act, 2017</strong> (statutorily up to 8 financial years for GST audits). All data repositories are protected using modern firewall architectures, restricted administrative credentials, encrypted session tokens, and encrypted database instances to safeguard against unauthorized access or disclosure.
                        </p>
                    </div>

                    {/* Section 7 */}
                    <div className="space-y-2 pb-5 border-b border-[#E8E2D5]">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">7</span>
                            Your Legal Rights (DPDP Act 2023)
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Under applicable Indian data protection frameworks, including the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>, you have the right to request access to your personal data, request correction of inaccurate records, or request deletion of personal information where statutory retention periods do not apply. You can also opt out of promotional communications at any time.
                        </p>
                    </div>

                    {/* Section 8 - Grievance Officer */}
                    <div className="space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#966E2E] uppercase tracking-wider flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center text-xs font-mono">8</span>
                            Data Protection & Grievance Officer
                        </h3>
                        <p className="text-xs text-[#52525B] leading-relaxed">
                            Pursuant to Section 43A of the <strong>Information Technology Act, 2000</strong> and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, contact our designated Grievance Officer for privacy concerns:
                        </p>
                        <div className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-4 text-xs text-[#52525B] space-y-1.5 mt-2">
                            <div className="font-bold text-[#18181B]">Data Privacy & Grievance Officer</div>
                            <div><strong>Entity:</strong> Dinanath & Sons</div>
                            <div><strong>Address:</strong> 1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi - 110006, India</div>
                            <div><strong>Email:</strong> <a href="mailto:info@dinanathandsons.com" className="text-[#966E2E] font-semibold underline">info@dinanathandsons.com</a></div>
                            <div><strong>Phone:</strong> <a href="tel:+919953435647" className="text-[#966E2E] font-semibold underline">+91 9953435647</a></div>
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
