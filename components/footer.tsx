'use client';

import Link from 'next/link';
import { Facebook, Instagram, Globe, ShieldCheck, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative pt-20 pb-10 overflow-hidden mt-auto"
            style={{ background: 'linear-gradient(180deg, #0A0A0F 0%, #06060C 100%)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            {/* Top gradient line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)' }} />
            {/* Ambient glow */}
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)' }} />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-16">
                    {/* Brand */}
                    <div className="lg:w-2/5 flex flex-col items-start text-left">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-1.5 rounded-xl shrink-0 glass-gold">
                                <img src="/images/logo.png" alt="Dinanath & Sons Logo" className="h-10 w-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight" style={{ background: 'linear-gradient(135deg, #F5F5F7, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Dinanath & Sons
                            </h3>
                        </div>
                        <p className="text-[#5A5A6A] text-sm leading-relaxed mb-8 max-w-sm font-medium">
                            Pioneering precision in the jewelry industry since 1980. We engineer elite tools and machinery for the world's most demanding master craftsmen.
                        </p>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-[#5A5A6A] hover:text-[#C9A84C] transition-colors cursor-pointer">
                                <Globe size={16} />
                                <span className="text-[10px] font-semibold uppercase tracking-widest">Global Logistics</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#5A5A6A] hover:text-[#C9A84C] transition-colors cursor-pointer">
                                <ShieldCheck size={16} />
                                <span className="text-[10px] font-semibold uppercase tracking-widest">Industrial Grade</span>
                            </div>
                        </div>
                    </div>

                    {/* Nav Columns */}
                    <div className="lg:w-3/5 grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
                        <div>
                            <h4 className="text-[11px] font-semibold text-[#5A5A6A] uppercase tracking-[0.2em] mb-6">Catalog</h4>
                            <ul className="space-y-3">
                                {['Tools', 'Machinery', 'Casting', 'Consumables'].map((item) => (
                                    <li key={item}>
                                        <Link href={`/shop?cat=${item}`} className="group flex items-center gap-2 text-[#8E8E9A] hover:text-[#C9A84C] transition-all text-sm font-medium">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[11px] font-semibold text-[#5A5A6A] uppercase tracking-[0.2em] mb-6">Company</h4>
                            <ul className="space-y-3">
                                {['Home', 'Blog', 'About', 'Contact'].map((item) => (
                                    <li key={item}>
                                        <Link href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="group flex items-center gap-2 text-[#8E8E9A] hover:text-[#F5F5F7] transition-all text-sm font-medium">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <h4 className="text-[11px] font-semibold text-[#5A5A6A] uppercase tracking-[0.2em] mb-6">Support</h4>
                            <ul className="space-y-4">
                                <li className="flex flex-col gap-1">
                                    <span className="text-[10px] font-semibold text-[#3A3A4A] uppercase tracking-wider">Emergency Protocol</span>
                                    <a href="tel:+919953435647" className="text-[#F5F5F7] font-semibold hover:text-[#C9A84C] transition-colors tracking-tight">+91 9953435647</a>
                                </li>
                                <li className="flex flex-col gap-1">
                                    <span className="text-[10px] font-semibold text-[#3A3A4A] uppercase tracking-wider">Correspondence</span>
                                    <a href="mailto:ajayabhay12872@gmail.com" className="text-sm font-medium text-[#5A5A6A] hover:text-[#F5F5F7] transition-colors truncate">ajayabhay12872@gmail.com</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-center gap-3">
                        {[
                            { href: 'https://www.facebook.com/p/Dinanath-Sons-100065199592427/', icon: <Facebook size={16} /> },
                            { href: 'https://www.instagram.com/dinanathandsons/', icon: <Instagram size={16} /> },
                            { href: 'https://share.google/wSmib47LIiARVrWT4', icon: <MapPin size={16} /> }
                        ].map((social, i) => (
                            <a key={i} href={social.href} target="_blank" className="w-10 h-10 rounded-full glass flex items-center justify-center text-[#5A5A6A] hover:text-[#C9A84C] hover:border-[#C9A84C]/20 transition-all duration-300">
                                {social.icon}
                            </a>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 text-[11px] font-medium text-[#3A3A4A]">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" style={{ boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} />
                            <span>Systems Operational</span>
                        </div>
                        <span className="hidden md:inline text-[#222230]">•</span>
                        <p>&copy; {currentYear} Dinanath & Sons. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
