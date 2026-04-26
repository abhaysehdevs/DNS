'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, Search, Globe, Heart, X, ChevronRight, Phone, Shield, Zap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { SearchModal } from './search-modal';
import { useIsMobile } from '@/hooks/use-is-mobile';

export function Navbar() {
    const { mode, language, cart, wishlist, setMode, user } = useAppStore();
    const t = translations[language];
    const isMobile = useIsMobile();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { scrollY, scrollYProgress } = useScroll();

    const isRetail = mode === 'retail';

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 150) {
            setVisible(false);
        } else {
            setVisible(true);
        }
        setScrolled(latest > 50);
    });

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.header
                    initial={{ y: -100 }}
                    animate={{ y: visible ? 0 : -100 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 pointer-events-none"
                >
                    <div className="container mx-auto flex justify-between items-center">
                        
                        {/* Brand Nexus */}
                        <div className="pointer-events-auto">
                            <Link href="/" className="flex items-center gap-4 group">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl glass-strong border border-black/[0.08] flex items-center justify-center relative overflow-hidden group-hover:border-[#C9A84C]/50 transition-all duration-500 shadow-sm">
                                    <div className="absolute inset-0 bg-[#C9A84C]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <img src="/images/logo.png" className="w-8 h-8 md:w-10 md:h-10 object-contain relative z-10" alt="D" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl md:text-2xl font-black text-[#1D1D1F] tracking-tighter uppercase leading-none">Dinanath's</span>
                                    <span className="text-[8px] md:text-[10px] font-black text-[#86868B] tracking-[0.4em] uppercase mt-1">Sons • Tools</span>
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Interaction Matrix */}
                        <div className="hidden lg:flex items-center gap-2 pointer-events-auto p-1.5 rounded-[2rem] glass-strong border border-black/[0.04] shadow-xl">
                            <nav className="flex items-center px-4 border-r border-black/[0.04] mr-4">
                                {[
                                    { href: '/', label: 'HOME' },
                                    { href: '/shop', label: 'SHOP' },
                                    { href: '/about', label: 'ABOUT' },
                                    { href: '/contact', label: 'CONTACT' }
                                ].map((link) => (
                                    <Link key={link.href} href={link.href} className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] hover:text-[#C9A84C] transition-all relative group">
                                        {link.label}
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-[#C9A84C] group-hover:w-4 transition-all duration-500" />
                                    </Link>
                                ))}
                            </nav>

                            <div className="flex items-center gap-2 pr-2">
                                <div className="flex p-1 rounded-xl glass border border-black/[0.04]">
                                    <button onClick={() => setMode('retail')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isRetail ? 'glass-gold text-[#0A0A0F]' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}>Retail</button>
                                    <button onClick={() => setMode('wholesale')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!isRetail ? 'bg-blue-600 text-white' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}>B2B</button>
                                </div>

                                <button onClick={() => setIsSearchOpen(true)} className="w-11 h-11 rounded-xl glass border border-black/[0.04] flex items-center justify-center text-[#86868B] hover:text-[#C9A84C] transition-all"><Search size={18} /></button>
                                
                                <Link href="/account" className="w-11 h-11 rounded-xl glass border border-black/[0.04] flex items-center justify-center text-[#86868B] hover:text-[#C9A84C] transition-all">
                                    <User size={18} />
                                </Link>

                                <Link href="/cart">
                                    <button className="h-11 px-6 rounded-xl glass-gold text-[#0A0A0F] font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-md hover:scale-105 active:scale-95 transition-all"
                                        style={{ background: isRetail ? 'linear-gradient(135deg, #E8D48B, #C9A84C)' : 'linear-gradient(135deg, #60A5FA, #3B82F6)' }}
                                    >
                                        <ShoppingCart size={16} />
                                        {cart.length} UNITS
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Action Hub */}
                        <div className="lg:hidden flex items-center gap-3 pointer-events-auto">
                            <button onClick={() => setIsMenuOpen(true)} className="w-14 h-14 rounded-2xl glass-strong border border-black/[0.08] flex items-center justify-center text-[#1D1D1F] shadow-xl"><Menu size={24} /></button>
                        </div>
                    </div>
                </motion.header>
            </AnimatePresence>

            {/* Full-Screen Cyber Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex"
                    >
                        <div className="absolute inset-0 bg-[#FFFFFF]/90 backdrop-blur-3xl" onClick={() => setIsMenuOpen(false)} />
                        
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative ml-auto w-full max-w-lg bg-[#FFFFFF] border-l border-black/[0.04] p-12 flex flex-col shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-20">
                                <div className="flex items-center gap-4">
                                    <Shield className="text-[#C9A84C]" size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#86868B]">Menu</span>
                                </div>
                                <button onClick={() => setIsMenuOpen(false)} className="w-14 h-14 rounded-full glass border border-black/[0.08] flex items-center justify-center text-[#1D1D1F]"><X size={24} /></button>
                            </div>

                            <nav className="flex-1 space-y-8">
                                {[
                                    { href: '/', label: 'Main Page', desc: 'Home' },
                                    { href: '/shop', label: 'Shop Tools', desc: 'Collection' },
                                    { href: '/about', label: 'Our Story', desc: 'About Us' },
                                    { href: '/contact', label: 'Contact Us', desc: 'Support' },
                                    { href: '/account', label: 'My Profile', desc: 'Personal' },
                                ].map((link, i) => (
                                    <motion.div key={link.href} initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
                                        <Link href={link.href} onClick={() => setIsMenuOpen(false)} className="group block">
                                            <p className="text-[9px] font-black text-[#C9A84C] uppercase tracking-[0.3em] mb-2">{link.desc}</p>
                                            <h3 className="text-5xl font-black text-[#86868B] group-hover:text-[#1D1D1F] uppercase tracking-tighter transition-colors">{link.label}</h3>
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            <div className="pt-12 border-t border-black/[0.04] space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setMode('retail')} className={`h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all ${isRetail ? 'glass-gold text-[#0A0A0F]' : 'glass text-[#86868B]'}`}>Retail Ops</button>
                                    <button onClick={() => setMode('wholesale')} className={`h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all ${!isRetail ? 'bg-blue-600 text-white' : 'glass text-[#86868B]'}`}>B2B Logistics</button>
                                </div>
                                <Link href="/cart" onClick={() => setIsMenuOpen(false)}>
                                    <button className="w-full h-20 rounded-[2rem] glass-gold text-[#0A0A0F] font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-6 shadow-2xl">
                                        <ShoppingCart size={24} />
                                        Go to Cart ({cart.length})
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
