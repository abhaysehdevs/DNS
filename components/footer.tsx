'use client';

import Link from 'next/link';
<<<<<<< Updated upstream
import { Facebook, Instagram, Twitter, Globe, ShieldCheck, ArrowUpRight } from 'lucide-react';
=======
import { Facebook, Instagram, Twitter, Globe, ShieldCheck, ArrowUpRight, MapPin } from 'lucide-react';
>>>>>>> Stashed changes

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-[#0a0a0a] border-t border-white/10 pt-20 pb-10 overflow-hidden mt-auto">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-16">

                    {/* Brand Column */}
                    <div className="lg:w-2/5 flex flex-col items-start text-left">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/5 flex-shrink-0">
                                <img src="/images/logo.png" alt="Dinanath & Sons Logo" className="h-10 w-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                            <h3 className="text-white text-2xl font-black uppercase tracking-tighter">Dinanath <span className="text-amber-500">&</span> Sons</h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm font-medium">
                            Pioneering precision in the jewelry industry since 1980. We engineer elite tools and machinery for the world's most demanding master craftsmen.
                        </p>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-colors cursor-pointer">
                                <Globe size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Global Logistics</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-colors cursor-pointer">
                                <ShieldCheck size={18} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Industrial Grade</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:w-3/5 grid grid-cols-2 md:grid-cols-3 gap-10">
                        {/* Catalog */}
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Catalog</h4>
                            <ul className="space-y-3">
                                {['Tools', 'Machinery', 'Casting', 'Consumables'].map((item) => (
                                    <li key={item}>
                                        <Link
                                            href={`/shop?cat=${item}`}
                                            className="group flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-all text-sm font-medium"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Company</h4>
                            <ul className="space-y-3">
                                {['Home', 'Blog', 'About', 'Contact'].map((item) => (
                                    <li key={item}>
                                        <Link
                                            href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                            className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all text-sm font-medium"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="col-span-2 md:col-span-1">
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Support</h4>
                            <ul className="space-y-4">
                                <li className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Emergency Protocol</span>
                                    <a href="tel:+919953435647" className="text-white font-semibold hover:text-amber-500 transition-colors tracking-tight">+91 9953435647</a>
                                </li>
                                <li className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Correspondence</span>
                                    <a href="mailto:ajayabhay12872@gmail.com" className="text-sm font-medium text-gray-400 hover:text-white transition-colors truncate">ajayabhay12872@gmail.com</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">

                    <div className="flex items-center gap-4">
<<<<<<< Updated upstream
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all">
                            <Facebook size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all">
                            <Twitter size={18} />
=======
                        <a href="https://www.facebook.com/p/Dinanath-Sons-100065199592427/" target="_blank" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all">
                            <Facebook size={18} />
                        </a>
                        <a href="https://www.instagram.com/dinanathandsons/" target="_blank" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all">
                            <Instagram size={18} />
                        </a>
                        <a href="https://share.google/wSmib47LIiARVrWT4" target="_blank" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all">
                            <MapPin size={18} />
>>>>>>> Stashed changes
                        </a>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 text-[11px] font-medium text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                            <span>Systems Operational</span>
                        </div>
                        <span className="hidden md:inline text-gray-700">•</span>
                        <p>&copy; {currentYear} Dinanath & Sons. All Rights Reserved.</p>
                    </div>

                </div>
            </div>
        </footer>
    );
}

