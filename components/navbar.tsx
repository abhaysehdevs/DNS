'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, Search, Globe, Truck, Building2, Heart, X, ChevronRight, Phone, Lock, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { SearchModal } from './search-modal';
import { useIsMobile } from '@/hooks/use-is-mobile';

export function Navbar() {
    const { mode, language, cart, wishlist, setMode, setHasSeenLanguagePopup, user } = useAppStore();
    const t = translations[language];
    const isMobile = useIsMobile();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { scrollY, scrollYProgress } = useScroll();

    const isRetail = mode === 'retail';
    const isAdmin = user?.email === 'abhaysehdevofficial@gmail.com';

    // Handle scroll effects
    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() || 0;
        if (latest > previous && latest > 150) {
            setVisible(false);
        } else {
            setVisible(true);
        }
        setScrolled(latest > 50);
    });

    // Prevent body scroll when menu is open
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
                    initial={{ y: -100, opacity: 0 }}
                    animate={{
                        y: visible ? 0 : -100,
                        opacity: visible ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`fixed top-0 left-0 right-0 z-[100] flex justify-center transition-all duration-500 ease-in-out ${scrolled ? 'pt-2 px-2 md:pt-4 md:px-4' : 'pt-0 px-0'}`}
                >
                    <div className={`
                        relative flex items-center justify-between transition-all duration-500
                        ${scrolled
                            ? 'w-full max-w-7xl h-16 px-4 md:px-6 rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl'
                            : 'w-full h-20 md:h-24 px-4 md:px-8 bg-transparent border-b border-white/5'}
                    `}>
                        {/* Brand */}
                        <div className="flex items-center gap-8 relative z-50">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="bg-white/10 p-1.5 rounded-xl backdrop-blur-md border border-white/5 shrink-0">
                                    <img
                                        src="/images/logo.png"
                                        alt="Logo"
                                        className={`transition-all duration-500 object-contain ${scrolled ? 'h-8 w-8' : 'h-10 w-10 md:h-12 md:w-12'}`}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                                <div className={`flex flex-col transition-all duration-500 ${scrolled ? 'scale-90 origin-left' : 'scale-100'}`}>
                                    <span className="font-black text-white text-base md:text-xl tracking-tight leading-none uppercase whitespace-nowrap">
                                        Dinanath <span className="text-amber-500">&</span> Sons
                                    </span>
                                    <span className="text-[8px] md:text-[9px] text-gray-500 tracking-[0.2em] uppercase font-black mt-1">
                                        Precision Tooling
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Nav */}
                            <nav className="hidden lg:flex items-center gap-2">
                                {[
                                    { href: '/', label: t.nav.home },
                                    { href: '/shop', label: t.nav.shop },
                                    { href: '/about', label: t.nav.about },
                                    { href: '/contact', label: 'Contact' }
                                ].map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 md:gap-4 relative z-50">
                            {/* Mode Toggle (Hidden on very small mobile) */}
                            <div className="hidden sm:flex items-center p-1 rounded-xl bg-white/5 border border-white/10 relative">
                                <motion.div
                                    className={`absolute inset-1 w-[calc(50%-4px)] rounded-lg ${isRetail ? 'bg-amber-600' : 'bg-blue-600'}`}
                                    animate={{ x: isRetail ? 0 : '100%' }}
                                />
                                <button onClick={() => setMode('retail')} className={`relative z-10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${isRetail ? 'text-white' : 'text-gray-500'}`}>Retail</button>
                                <button onClick={() => setMode('wholesale')} className={`relative z-10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${!isRetail ? 'text-white' : 'text-gray-500'}`}>B2B</button>
                            </div>

                            <div className="flex items-center gap-1.5 md:gap-2">
                                <button 
                                    onClick={() => window.dispatchEvent(new CustomEvent('open-language-popup'))} 
                                    className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-500 transition-all group"
                                    title="Switch Language"
                                >
                                    <Globe size={18} className="group-hover:rotate-12 transition-transform" />
                                </button>
                                <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                                    <Search size={18} />
                                </button>
                                
                                <Link href="/cart">
                                    <button className={`h-10 md:h-11 px-3 md:px-5 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${isRetail ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'}`}>
                                        <ShoppingCart size={16} />
                                        <span className="hidden md:inline">{cart.length} ITEMS</span>
                                        {cart.length > 0 && <span className="md:hidden">{cart.length}</span>}
                                    </button>
                                </Link>

                                <button onClick={() => setIsMenuOpen(true)} className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                                    <Menu size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.header>
            </AnimatePresence>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <div className="fixed inset-0 z-[200] lg:hidden">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="absolute right-0 top-0 bottom-0 w-full max-w-xs bg-black border-l border-white/10 flex flex-col p-8"
                        >
                            <div className="flex justify-between items-center mb-12">
                                <span className="font-black text-white uppercase tracking-tighter text-xl">NAVIGATION</span>
                                <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex-1 space-y-4">
                                {[
                                    { href: '/', label: 'Home' },
                                    { href: '/shop', label: 'Shop All' },
                                    { href: '/about', label: 'Our Story' },
                                    { href: '/contact', label: 'Contact Us' },
                                ].map((link) => (
                                    <Link 
                                        key={link.href} 
                                        href={link.href} 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-3xl font-black text-gray-500 hover:text-white transition-all uppercase tracking-tighter"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="pt-8 border-t border-white/10 space-y-6">
                                <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl">
                                    <button onClick={() => setMode('retail')} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isRetail ? 'bg-amber-600 text-white shadow-xl' : 'text-gray-500'}`}>Retail</button>
                                    <button onClick={() => setMode('wholesale')} className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isRetail ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500'}`}>B2B</button>
                                </div>
                                <Link href="/cart" onClick={() => setIsMenuOpen(false)} className="block">
                                    <Button className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs">
                                        View Cart ({cart.length})
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
