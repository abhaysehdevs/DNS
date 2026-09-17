'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
    Facebook, Instagram, MapPin, Mail, Phone, Clock, 
    ArrowRight, ShieldCheck, Loader2, ChevronDown 
} from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Mobile collapsible section toggles
    const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);

    const toggleMobileSection = (section: string) => {
        setOpenMobileSection(prev => prev === section ? null : section);
    };

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newsletterEmail) return;
        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email: newsletterEmail }]);
            if (error) {
                if (error.code === '23505') {
                    alert('You are already subscribed to our newsletter!');
                } else {
                    throw error;
                }
            } else {
                setSubscribed(true);
                setNewsletterEmail('');
                setTimeout(() => setSubscribed(false), 5000);
            }
        } catch (err: any) {
            console.error(err);
            alert('Failed to subscribe. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <footer className="relative bg-[#F6F3EB] border-t border-[#E8E2D5] pt-8 sm:pt-16 pb-20 sm:pb-10 overflow-hidden mt-auto">
            {/* Top Gold Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#966E2E]/40 to-transparent" />
            
            {/* Ambient Shadow glow */}
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full pointer-events-none opacity-15 bg-gradient-to-br from-[#966E2E] to-transparent blur-[120px]" />

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                
                {/* Desktop Grid Layout (hidden on mobile, visible on lg+) */}
                <div className="hidden lg:grid grid-cols-12 gap-12 mb-12 text-left">
                    
                    {/* Brand details Column - Col Span 3 */}
                    <div className="col-span-3 flex flex-col space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white border border-[#E8E2D5] flex items-center justify-center relative overflow-hidden shadow-sm">
                                <img src="/images/logo.png" alt="Dinanath & Sons Logo" className="w-8 h-8 object-contain" onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/logo.png';
                                }} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-sm font-bold font-display text-[#18181B] tracking-wider uppercase leading-none">Dinanath & Sons</h3>
                                <span className="text-[7px] font-semibold text-[#71717A] tracking-[0.2em] uppercase mt-1">Jewellery Tools & Equipment</span>
                            </div>
                        </div>
                        <p className="text-[#52525B] text-xs leading-relaxed font-medium">
                            India's trusted jewellery tool experts since 1960. Providing a complete range of tools, machines & equipment for workshop manufacturing.
                        </p>
                        <div className="flex items-center gap-2 text-[#71717A] hover:text-[#966E2E] transition-colors text-[9px] font-bold uppercase tracking-wider">
                            <ShieldCheck size={13} className="text-[#966E2E]" />
                            <span>100% Quality Assured</span>
                        </div>
                    </div>

                    {/* Categories Column - Col Span 2 */}
                    <div className="col-span-2 flex flex-col">
                        <h4 className="text-[10px] font-bold text-[#966E2E] uppercase tracking-[0.2em] mb-4 border-b border-[#E8E2D5] pb-2">Categories</h4>
                        <ul className="space-y-2.5 text-xs font-semibold text-[#52525B]">
                            <li><Link href="/shop/category/hand-tools" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Hand Tools</Link></li>
                            <li><Link href="/shop/category/machines" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Machines</Link></li>
                            <li><Link href="/shop/category/polishing" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Polishing & Buffs</Link></li>
                            <li><Link href="/shop/category/chemicals" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Cleaning & Flux</Link></li>
                            <li><Link href="/shop/category/packaging" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Packaging & Cards</Link></li>
                            <li><Link href="/shop/category/bullion" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Certified Bullion</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links Column - Col Span 2 */}
                    <div className="col-span-2 flex flex-col">
                        <h4 className="text-[10px] font-bold text-[#966E2E] uppercase tracking-[0.2em] mb-4 border-b border-[#E8E2D5] pb-2">Information</h4>
                        <ul className="space-y-2.5 text-xs font-semibold text-[#52525B]">
                            <li><Link href="/about" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">About Us</Link></li>
                            <li><Link href="/shop" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">All Products</Link></li>
                            <li><Link href="/blog" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Technical Blog</Link></li>
                            <li><Link href="/new-arrivals" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">New Arrivals</Link></li>
                            <li><Link href="/offers" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Special Offers</Link></li>
                            <li><Link href="/contact" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Contact Us</Link></li>
                            <li><Link href="/shipping-policy" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Shipping Policy</Link></li>
                            <li><Link href="/return-policy" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Return Policy</Link></li>
                            <li><Link href="/privacy-policy" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">Terms of Service</Link></li>
                            <li><Link href="/faq" className="hover:text-[#966E2E] transition-colors uppercase tracking-wider text-[10px]">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info Column - Col Span 3 */}
                    <div className="col-span-3 flex flex-col space-y-3">
                        <h4 className="text-[10px] font-bold text-[#966E2E] uppercase tracking-[0.2em] mb-1 border-b border-[#E8E2D5] pb-2">Chandni Chowk Bench</h4>
                        
                        <div className="flex gap-2 items-start text-[10px] text-[#52525B]">
                            <MapPin size={13} className="text-[#966E2E] shrink-0 mt-0.5" />
                            <span>1914, Maliwara, Chandni Chowk, Delhi - 110006</span>
                        </div>
                        <div className="flex gap-2 items-center text-[10px] text-[#52525B]">
                            <Phone size={13} className="text-[#966E2E] shrink-0" />
                            <a href="tel:+919953435647" className="font-bold hover:text-[#966E2E] transition-colors">+91 9953435647</a>
                        </div>
                        <div className="flex gap-2 items-center text-[10px] text-[#52525B]">
                            <Mail size={13} className="text-[#966E2E] shrink-0" />
                            <a href="mailto:info@dinanathandsons.com" className="hover:text-[#966E2E] transition-colors">info@dinanathandsons.com</a>
                        </div>
                        <div className="flex gap-2 items-start text-[8px] text-[#71717A] uppercase tracking-wider font-bold">
                            <Clock size={12} className="text-[#966E2E] shrink-0 mt-0.5" />
                            <span>Mon - Sat: 11 AM - 8 PM (Sun Closed)</span>
                        </div>
                        <div className="border border-[#E8E2D5] rounded-lg overflow-hidden h-24 w-full shadow-sm mt-2">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.5975490799736!2d77.22728957630485!3d28.64182997566144!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd17c093cae1%3A0x6b7722955cf1c42!2sDariba+Kalan%2C+Chandni+Chowk%2C+Delhi!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                                className="w-full h-full border-0 opacity-90" 
                                allowFullScreen={false} 
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {/* Newsletter Subscription Column - Col Span 2 */}
                    <div className="col-span-2 flex flex-col">
                        <h4 className="text-[10px] font-bold text-[#966E2E] uppercase tracking-[0.2em] mb-4 border-b border-[#E8E2D5] pb-2">VIP Bulletin</h4>
                        <p className="text-[#71717A] text-[9px] font-bold uppercase tracking-widest mb-3 leading-relaxed">
                            Subscribe for trade updates & tool catalog drops.
                        </p>
                        {subscribed ? (
                            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Subscribed!</p>
                        ) : (
                            <form className="relative flex items-center w-full h-9 bg-white border border-[#E8E2D5] rounded-lg overflow-hidden focus-within:border-[#966E2E] transition-all shadow-sm" onSubmit={handleNewsletterSubmit}>
                                <input 
                                    required 
                                    type="email" 
                                    placeholder="Your email..." 
                                    value={newsletterEmail}
                                    onChange={e => setNewsletterEmail(e.target.value)}
                                    className="w-full h-full bg-transparent pl-3 pr-8 text-[10px] font-semibold text-[#18181B] placeholder-[#A1A1AA] focus:outline-none" 
                                />
                                <button type="submit" disabled={submitting} className="absolute right-0 top-0 bottom-0 w-8 bg-[#966E2E] hover:bg-[#7D5A25] transition-colors flex items-center justify-center text-white">
                                    {submitting ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} strokeWidth={2.5} />}
                                </button>
                            </form>
                        )}
                    </div>

                </div>

                {/* MOBILE OPTIMIZED FOOTER (compact, streamlined, fast to browse) */}
                <div className="lg:hidden flex flex-col space-y-4 mb-8 text-left">
                    
                    {/* Brand Mini Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white border border-[#E8E2D5] flex items-center justify-center shadow-sm">
                                <img src="/images/logo.png" alt="Logo" className="w-6 h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold font-display text-[#18181B] uppercase tracking-wider">Dinanath & Sons</h3>
                                <span className="text-[7.5px] text-[#966E2E] font-bold uppercase tracking-widest block">Tools Since 1960</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-[#71717A] text-[8px] font-bold uppercase">
                            <ShieldCheck size={11} className="text-[#966E2E]" />
                            <span>Verified</span>
                        </div>
                    </div>

                    {/* Quick Touch Contact Chips */}
                    <div className="grid grid-cols-3 gap-2 py-1">
                        <a 
                            href="tel:+919953435647" 
                            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-[#E8E2D5] hover:border-[#966E2E] text-center active:scale-95 transition-all shadow-sm"
                        >
                            <Phone size={13} className="text-[#966E2E] mb-1" />
                            <span className="text-[8px] font-bold text-[#18181B] uppercase tracking-wider">Call Us</span>
                        </a>
                        <a 
                            href="mailto:info@dinanathandsons.com" 
                            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-[#E8E2D5] hover:border-[#966E2E] text-center active:scale-95 transition-all shadow-sm"
                        >
                            <Mail size={13} className="text-[#966E2E] mb-1" />
                            <span className="text-[8px] font-bold text-[#18181B] uppercase tracking-wider">Email</span>
                        </a>
                        <a 
                            href="https://share.google/wSmib47LIiARVrWT4" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-[#E8E2D5] hover:border-[#966E2E] text-center active:scale-95 transition-all shadow-sm"
                        >
                            <MapPin size={13} className="text-[#966E2E] mb-1" />
                            <span className="text-[8px] font-bold text-[#18181B] uppercase tracking-wider">Locate</span>
                        </a>
                    </div>

                    {/* Collapsible Accordion 1: Categories */}
                    <div className="border border-[#E8E2D5] rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                            onClick={() => toggleMobileSection('categories')}
                            className="w-full flex items-center justify-between p-3 text-left"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#18181B]">Browse Categories</span>
                            <ChevronDown size={14} className={`text-[#966E2E] transition-transform duration-300 ${openMobileSection === 'categories' ? 'rotate-180' : ''}`} />
                        </button>
                        {openMobileSection === 'categories' && (
                            <div className="p-3 pt-0 grid grid-cols-2 gap-2 text-[9.5px] font-semibold text-[#52525B] border-t border-[#F0EBE0]">
                                <Link href="/shop/category/hand-tools" className="py-1 hover:text-[#966E2E]">Hand Tools</Link>
                                <Link href="/shop/category/machines" className="py-1 hover:text-[#966E2E]">Machines</Link>
                                <Link href="/shop/category/polishing" className="py-1 hover:text-[#966E2E]">Polishing & Buffs</Link>
                                <Link href="/shop/category/chemicals" className="py-1 hover:text-[#966E2E]">Cleaning & Flux</Link>
                                <Link href="/shop/category/packaging" className="py-1 hover:text-[#966E2E]">Packaging & Cards</Link>
                                <Link href="/shop/category/bullion" className="py-1 hover:text-[#966E2E]">Certified Bullion</Link>
                            </div>
                        )}
                    </div>

                    {/* Collapsible Accordion 2: Information & Policies */}
                    <div className="border border-[#E8E2D5] rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                            onClick={() => toggleMobileSection('info')}
                            className="w-full flex items-center justify-between p-3 text-left"
                        >
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#18181B]">Help & Store Policies</span>
                            <ChevronDown size={14} className={`text-[#966E2E] transition-transform duration-300 ${openMobileSection === 'info' ? 'rotate-180' : ''}`} />
                        </button>
                        {openMobileSection === 'info' && (
                            <div className="p-3 pt-0 grid grid-cols-2 gap-2 text-[9.5px] font-semibold text-[#52525B] border-t border-[#F0EBE0]">
                                <Link href="/about" className="py-1 hover:text-[#966E2E]">About Us</Link>
                                <Link href="/shop" className="py-1 hover:text-[#966E2E]">All Products</Link>
                                <Link href="/blog" className="py-1 hover:text-[#966E2E]">Blog</Link>
                                <Link href="/new-arrivals" className="py-1 hover:text-[#966E2E]">New Arrivals</Link>
                                <Link href="/contact" className="py-1 hover:text-[#966E2E]">Contact Us</Link>
                                <Link href="/shipping-policy" className="py-1 hover:text-[#966E2E]">Shipping Policy</Link>
                                <Link href="/return-policy" className="py-1 hover:text-[#966E2E]">Return Policy</Link>
                                <Link href="/privacy-policy" className="py-1 hover:text-[#966E2E]">Privacy Policy</Link>
                                <Link href="/terms" className="py-1 hover:text-[#966E2E]">Terms</Link>
                                <Link href="/faq" className="py-1 hover:text-[#966E2E]">FAQ</Link>
                            </div>
                        )}
                    </div>

                    {/* Address Brief */}
                    <p className="text-[8.5px] text-[#71717A] leading-relaxed px-1">
                        1914, Maliwara, Chandni Chowk, Delhi - 110006 • Mon-Sat: 11 AM - 8 PM
                    </p>

                </div>

                {/* Bottom Bar Area (Compact for mobile and desktop) */}
                <div className="pt-4 sm:pt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-[#E8E2D5]">
                    
                    {/* Social Media Link Icons */}
                    <div className="flex items-center gap-2.5">
                        {[
                            { href: 'https://www.facebook.com/p/Dinanath-Sons-100065199592427/', icon: <Facebook size={14} /> },
                            { href: 'https://www.instagram.com/dinanathandsons/', icon: <Instagram size={14} /> },
                            { href: 'https://share.google/wSmib47LIiARVrWT4', icon: <MapPin size={14} /> }
                        ].map((social, i) => (
                            <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white border border-[#E8E2D5] flex items-center justify-center text-[#71717A] hover:text-[#966E2E] hover:border-[#966E2E]/50 transition-all duration-300 shadow-sm">
                                {social.icon}
                            </a>
                        ))}
                    </div>

                    {/* Payment Logos */}
                    <div className="flex flex-wrap items-center gap-1.5 justify-center">
                        <span className="text-[7.5px] text-[#71717A] uppercase font-bold tracking-wider mr-1">Accepted:</span>
                        {[
                            { name: 'Razorpay', style: 'text-blue-600' },
                            { name: 'UPI', style: 'text-emerald-600' },
                            { name: 'GPay', style: 'text-slate-800' },
                            { name: 'PhonePe', style: 'text-purple-600' },
                            { name: 'Visa', style: 'text-amber-600' }
                        ].map((pay, i) => (
                            <span key={i} className={`bg-white border border-[#E8E2D5] px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${pay.style} shadow-sm`}>
                                {pay.name}
                            </span>
                        ))}
                    </div>

                    {/* Copyright */}
                    <div className="text-[8.5px] sm:text-[9.5px] font-bold text-[#71717A] uppercase tracking-wider text-center">
                        <p>&copy; {currentYear} Dinanath & Sons. All Rights Reserved.</p>
                    </div>
                    
                </div>
            </div>
        </footer>
    );
}
