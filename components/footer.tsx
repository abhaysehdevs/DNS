'use client';

import Link from 'next/link';
import { Facebook, Instagram, MapPin, Mail, Phone, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-[#151515] border-t border-[#343434] pt-20 pb-10 overflow-hidden mt-auto">
            {/* Top Gold Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A67C35]/40 to-transparent" />
            
            {/* Ambient Shadow glow */}
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full pointer-events-none opacity-20 bg-gradient-to-br from-[#A67C35] to-transparent blur-[120px]" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 text-left">
                    
                    {/* Brand details Column - Col Span 4 */}
                    <div className="lg:col-span-4 flex flex-col space-y-6">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-full bg-[#1E1E1E] border border-[#343434] flex items-center justify-center relative overflow-hidden shadow">
                                <img src="/images/logo.png" alt="Dinanath & Sons Logo" className="w-9 h-9 object-contain" onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/logo.png';
                                }} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-base font-bold font-display text-[#F8F3E8] tracking-wider uppercase leading-none">Dinanath & Sons</h3>
                                <span className="text-[7px] font-semibold text-[#8E8E9A] tracking-[0.2em] uppercase mt-1">Jewellery Tools & Equipment</span>
                            </div>
                        </div>
                        <p className="text-[#CFCFCF] text-xs leading-relaxed max-w-sm font-medium">
                            India's trusted jewellery tool experts since 1960. Providing a complete range of tools, machines & equipment for jewellery manufacturing, casting, and polishing workshops.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[#8E8E9A] hover:text-[#A67C35] transition-colors cursor-pointer text-[10px] font-bold uppercase tracking-wider">
                                <ShieldCheck size={14} className="text-[#A67C35]" />
                                <span>100% Quality Assured</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links Column - Col Span 2 */}
                    <div className="lg:col-span-2 flex flex-col">
                        <h4 className="text-[10px] font-bold text-[#A67C35] uppercase tracking-[0.2em] mb-6 border-b border-[#343434]/40 pb-2">Quick Links</h4>
                        <ul className="space-y-3 text-xs font-semibold text-[#CFCFCF]">
                            <li><Link href="/about" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">About Us</Link></li>
                            <li><Link href="/shop" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">Our Products</Link></li>
                            <li><Link href="/shop?sort=newest" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">New Arrivals</Link></li>
                            <li><Link href="/shop?sort=discount" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">Offers</Link></li>
                            <li><Link href="/blog" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service Column - Col Span 2 */}
                    <div className="lg:col-span-2 flex flex-col">
                        <h4 className="text-[10px] font-bold text-[#A67C35] uppercase tracking-[0.2em] mb-6 border-b border-[#343434]/40 pb-2">Customer Service</h4>
                        <ul className="space-y-3 text-xs font-semibold text-[#CFCFCF]">
                            <li><Link href="/account" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">My Account</Link></li>
                            <li><Link href="/account" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">Track Order</Link></li>
                            <li><Link href="/wishlist" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">Wishlist</Link></li>
                            <li><Link href="/faq" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">Shipping Policy</Link></li>
                            <li><Link href="/faq" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">Return Policy</Link></li>
                            <li><Link href="/faq" className="hover:text-[#A67C35] transition-colors uppercase tracking-wider text-[10px]">Terms & Conditions</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info Column - Col Span 2 */}
                    <div className="lg:col-span-2 flex flex-col space-y-4">
                        <h4 className="text-[10px] font-bold text-[#A67C35] uppercase tracking-[0.2em] mb-2 border-b border-[#343434]/40 pb-2">Contact Info</h4>
                        
                        <div className="flex gap-2.5 items-start">
                            <MapPin size={14} className="text-[#A67C35] shrink-0 mt-0.5" />
                            <span className="text-[10px] text-[#CFCFCF] font-semibold leading-relaxed">
                                1914, 1st Floor, Dariba Kalan, Chandni Chowk, Delhi - 110006
                            </span>
                        </div>
                        <div className="flex gap-2.5 items-center">
                            <Phone size={14} className="text-[#A67C35] shrink-0" />
                            <a href="tel:+919953435647" className="text-[10px] text-[#CFCFCF] font-bold hover:text-[#A67C35] transition-colors">
                                +91 9953435647
                            </a>
                        </div>
                        <div className="flex gap-2.5 items-center">
                            <Mail size={14} className="text-[#A67C35] shrink-0" />
                            <a href="mailto:ajayabhay12872@gmail.com" className="text-[10px] text-[#CFCFCF] font-semibold hover:text-[#A67C35] transition-colors truncate">
                                info@dinanath.com
                            </a>
                        </div>
                        <div className="flex gap-2.5 items-start">
                            <Clock size={14} className="text-[#A67C35] shrink-0 mt-0.5" />
                            <span className="text-[8px] text-[#8E8E9A] font-bold uppercase tracking-wider leading-relaxed">
                                Mon - Sat: 10:30 AM to 7:00 PM <br/>(Sunday Closed)
                            </span>
                        </div>
                    </div>

                    {/* Newsletter Subscription Column - Col Span 2 */}
                    <div className="lg:col-span-2 flex flex-col">
                        <h4 className="text-[10px] font-bold text-[#A67C35] uppercase tracking-[0.2em] mb-6 border-b border-[#343434]/40 pb-2">Newsletter</h4>
                        <p className="text-[#8E8E9A] text-[9px] font-bold uppercase tracking-widest mb-4 leading-relaxed">
                            Subscribe to get updates on new arrivals, offers & more.
                        </p>
                        <form className="relative flex items-center w-full h-10 bg-[#1E1E1E] border border-[#343434] rounded-lg overflow-hidden focus-within:border-[#A67C35] transition-all" onSubmit={e => e.preventDefault()}>
                            <input 
                                required 
                                type="email" 
                                placeholder="Your email..." 
                                className="w-full h-full bg-transparent pl-3 pr-10 text-[10px] font-semibold text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none" 
                            />
                            <button type="submit" className="absolute right-0 top-0 bottom-0 w-10 bg-[#A67C35] hover:bg-[#8A6232] transition-colors flex items-center justify-center text-black">
                                <ArrowRight size={14} strokeWidth={2.5} />
                            </button>
                        </form>
                    </div>

                </div>

                {/* Bottom Bar Area */}
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-[#343434]/40">
                    
                    {/* Social Media Link Icons */}
                    <div className="flex items-center gap-3">
                        {[
                            { href: 'https://www.facebook.com/p/Dinanath-Sons-100065199592427/', icon: <Facebook size={15} /> },
                            { href: 'https://www.instagram.com/dinanathandsons/', icon: <Instagram size={15} /> },
                            { href: 'https://share.google/wSmib47LIiARVrWT4', icon: <MapPin size={15} /> }
                        ].map((social, i) => (
                            <a key={i} href={social.href} target="_blank" className="w-9 h-9 rounded-lg bg-[#1E1E1E] border border-[#343434] flex items-center justify-center text-[#8E8E9A] hover:text-[#A67C35] hover:border-[#A67C35]/30 transition-all duration-300 shadow">
                                {social.icon}
                            </a>
                        ))}
                    </div>

                    {/* Trust operational check and copyright */}
                    <div className="flex flex-col md:flex-row items-center gap-4 text-[10px] font-bold text-[#8E8E9A] uppercase tracking-wider">
                        <div className="flex items-center gap-2 bg-[#1E1E1E] px-3.5 py-1.5 rounded-lg border border-[#343434] shadow-inner">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>100% Secure Payments</span>
                        </div>
                        <span className="hidden md:inline text-[#343434]">•</span>
                        <p>&copy; {currentYear} Dinanath & Sons. All Rights Reserved.</p>
                    </div>
                    
                </div>
            </div>
        </footer>
    );
}
