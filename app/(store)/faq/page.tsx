import { Metadata } from 'next';
import { Truck, RotateCcw, FileText, MessageSquare, ChevronDown, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { SITE_CONFIG, getAbsoluteUrl } from '@/lib/site-config';
import { SHIPPING_POLICY, RETURN_POLICY } from '@/lib/policies';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions (FAQ) & Store Policies | Dinanath & Sons',
    description: 'Find answers about order dispatch, pan-India delivery timelines, 7-day replacement guarantee, GST invoices, and workshop machinery freight.',
    alternates: {
        canonical: getAbsoluteUrl('/faq'),
    },
    openGraph: {
        title: 'Frequently Asked Questions (FAQ) & Store Policies | Dinanath & Sons',
        description: 'Find answers about order dispatch, pan-India delivery timelines, 7-day replacement guarantee, GST invoices, and workshop machinery freight.',
        url: getAbsoluteUrl('/faq'),
        type: 'website',
    },
};

const FAQ_SECTIONS = [
    {
        category: "Shipping & Delivery Policy",
        icon: Truck,
        items: [
            {
                question: "What are the dispatch timelines and shipping charges?",
                answer: `All orders are dispatched within 24 to 48 business hours directly from our central storefront in Maliwara, Chandni Chowk, Delhi. We provide free standard shipping across India on all parcel orders above ₹${SHIPPING_POLICY.freeShippingThreshold.toLocaleString('en-IN')}. For orders below ₹${SHIPPING_POLICY.freeShippingThreshold.toLocaleString('en-IN')}, a flat delivery charge of ₹${SHIPPING_POLICY.standardShippingCharge} applies.`
            },
            {
                question: "What are the estimated delivery transit times by zone?",
                answer: "Delivery transit times depend on the destination pincode: Delhi NCR takes 1–2 business days; Metro cities (Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad, Ahmedabad) take 2–4 business days; Rest of India takes 4–7 business days; Remote and North-East regions take 7–10 business days."
            },
            {
                question: "How is heavy machinery (Rolling Mills, Dust Collectors, Casting Units) transported?",
                answer: "Heavy workshop machinery exceeding 20 kg is packed in reinforced wooden crates with internal shock absorption and dispatched via reputed surface freight carriers (V-Trans, Safexpress, TCI Freight). B2B surface freight is quoted at checkout or dispatched on a To-Pay basis per customer preference."
            },
            {
                question: "Do you ship internationally outside India?",
                answer: "Currently, our online checkout and direct carrier integrations serve pan-India addresses (19,000+ PIN codes). For bulk export orders to overseas workshops, please contact our export desk directly at info@dinanathandsons.com."
            }
        ]
    },
    {
        category: "Returns, Replacements & Refund Policy",
        icon: RotateCcw,
        items: [
            {
                question: "What is your return and replacement policy?",
                answer: `${RETURN_POLICY.shortNotice} We accept return or replacement requests within 7 calendar days of delivery exclusively for items that arrive damaged in transit, with manufacturing defects, or if an incorrect item was delivered. Change-of-mind returns are not supported.`
            },
            {
                question: "How do I report a transit defect or missing item?",
                answer: "Please inspect your shipment upon delivery and report any transit damage or defect within 48 to 72 hours by emailing info@dinanathandsons.com or messaging WhatsApp +91 9953435647 with your Order Number and a continuous, unedited unboxing video showing the shipping label and defect."
            },
            {
                question: "Who pays for return shipping on defective items?",
                answer: "Dinanath & Sons covers 100% of the return shipping costs for verified manufacturing defects, transit damage, or wrong shipments. We arrange reverse courier pickup from your address."
            },
            {
                question: "How quickly are refunds issued?",
                answer: "Once the returned unit is received and inspected at our Chandni Chowk workshop desk, refunds are approved within 2 business days and credited to the original payment method (UPI, Netbanking, or Card via Razorpay) within 5 to 7 business days."
            },
            {
                question: "Which products are non-returnable?",
                answer: "Consumable liquids, chemicals, soldering fluxes (Suhaga, acids), opened polishing buffs, natural bullion packaging once opened, and custom-ordered or engraved tools cannot be returned once delivered."
            }
        ]
    },
    {
        category: "Orders, Payments & B2B Tax Invoices",
        icon: FileText,
        items: [
            {
                question: "Do you issue official GST Tax Invoices for B2B input tax credit?",
                answer: "Yes, 100% of our shipments are accompanied by official GST Tax Invoices. Enter your registered business name and 15-digit GSTIN during checkout to have your invoice generated with B2B input tax credit."
            },
            {
                question: "What payment methods are accepted?",
                answer: "We accept all conventional Indian digital payment methods through Razorpay: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit and Debit Cards (Visa, MasterCard, RuPay), Net Banking across 50+ banks, and NEFT/RTGS bank transfers for large wholesale orders."
            },
            {
                question: "Can I visit your physical storefront to purchase in person?",
                answer: "Yes! Our central store is located at 1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi - 110006. We are open Monday through Saturday from 11:00 AM to 8:00 PM IST (Sundays closed). Master craftsmen and workshop owners are welcome."
            }
        ]
    }
];

export default function FAQPage() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ_SECTIONS.flatMap(section => 
            section.items.map(item => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer
                }
            }))
        )
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] pt-4 sm:pt-6 md:pt-8 pb-16 selection:bg-[#966E2E]/20 overflow-x-hidden">
                <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-4xl">
                    
                    {/* Header */}
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#E8E2D5] text-[#71717A] text-[9px] font-black uppercase tracking-[0.2em] mb-3 shadow-xs">
                            <MessageSquare size={13} className="text-[#966E2E]" /> Store Policies & Knowledge Center
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight uppercase leading-[0.9] text-[#18181B] font-display">
                            Frequently Asked <span className="text-[#966E2E]">Questions</span>
                        </h1>
                        <p className="text-[#71717A] text-[10px] sm:text-xs font-bold uppercase tracking-widest max-w-xl mx-auto">
                            Standardized shipping timelines, 7-day defect replacement policy, and B2B terms for Dinanath & Sons
                        </p>
                    </div>

                    {/* FAQ Sections with full server-rendered HTML */}
                    <div className="space-y-10">
                        {FAQ_SECTIONS.map((section, sectionIdx) => {
                            const Icon = section.icon;
                            return (
                                <section key={sectionIdx} className="space-y-4">
                                    <div className="flex items-center gap-2.5 pb-2 border-b border-[#E8E2D5]">
                                        <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center shrink-0">
                                            <Icon size={16} />
                                        </div>
                                        <h2 className="text-base sm:text-lg font-bold font-display uppercase tracking-wider text-[#18181B]">
                                            {section.category}
                                        </h2>
                                    </div>

                                    <div className="space-y-3">
                                        {section.items.map((item, itemIdx) => (
                                            <details 
                                                key={itemIdx} 
                                                open={sectionIdx === 0 && itemIdx === 0}
                                                className="group bg-white rounded-xl border border-[#E8E2D5] hover:border-[#966E2E]/60 transition-all shadow-xs overflow-hidden"
                                            >
                                                <summary className="w-full flex justify-between items-center p-4 sm:p-5 text-left cursor-pointer list-none select-none font-bold text-xs sm:text-sm uppercase tracking-wide text-[#18181B]">
                                                    <span className="pr-4">{item.question}</span>
                                                    <div className="w-6 h-6 rounded-full bg-[#FAF9F5] text-[#71717A] group-open:text-[#966E2E] group-open:rotate-180 transition-transform flex items-center justify-center shrink-0">
                                                        <ChevronDown size={14} />
                                                    </div>
                                                </summary>
                                                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-[#52525B] text-xs sm:text-sm leading-relaxed border-t border-[#E8E2D5]/60 mt-1 pt-3">
                                                    {item.answer}
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>

                    {/* Footer Inquiry Prompt */}
                    <div className="mt-16 text-center bg-white p-8 rounded-3xl border border-[#E8E2D5] shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#71717A] mb-4">
                            Have further technical queries about tools or heavy machinery?
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider">
                            <Link href="/contact" className="text-[#966E2E] hover:underline">
                                Contact Workshop Desk →
                            </Link>
                            <span className="text-[#E8E2D5]">•</span>
                            <a href={`tel:${SITE_CONFIG.contact.phone}`} className="text-[#52525B] hover:text-[#966E2E]">
                                Call {SITE_CONFIG.contact.phoneDisplay}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
