
'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, Search, Globe, Truck, Building2, Heart, X, ChevronRight, Phone, Lock, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { SearchModal } from './search-modal';

export function Navbar() {
    const { mode, language, cart, wishlist, setMode, setHasSeenLanguagePopup, user } = useAppStore();
    const t = translations[language];
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

    // Keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
                    className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ease-in-out ${scrolled ? 'pt-4 px-4' : 'pt-0 px-0'}`}
                >
                    {/* Main Navbar Container */}

                    <div className={`
                        relative flex items-center justify-between transition-all duration-500 overflow-hidden
                        ${scrolled
                            ? 'w-full max-w-7xl h-16 px-6 rounded-2xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
                            : 'w-full h-24 px-8 bg-transparent border-b border-white/5'}
                    `}>
                        {/* Scroll Progress Bar */}
                        <motion.div
                            className={`absolute bottom-0 left-0 h-[1.5px] ${isRetail ? 'bg-amber-500' : 'bg-blue-500'} z-50`}
                            style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
                        />


                        {/* Glass Overlay Effect for Scrolled State */}
                        {scrolled && (
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent pointer-events-none" />
                        )}

                        {/* Brand */}
                        <div className="flex items-center gap-8 relative z-50">
                            <Link href="/" className="flex items-center gap-3 group">
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: -2 }}
                                    className="relative flex items-center gap-3"
                                >
                                    <div className="bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/5">
                                        <img
                                            src="/images/logo.png"
                                            alt="Dinanath & Sons Logo"
                                            className={`transition-all duration-500 object-contain ${scrolled ? 'h-10 w-10' : 'h-12 w-12 md:h-14 md:w-14'}`}
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    </div>
                                    <div className={`flex flex-col transition-all duration-500 ${scrolled ? 'scale-90 origin-left' : 'scale-100'}`}>
                                        <span className="font-black text-white text-lg md:text-xl tracking-tight leading-none uppercase">
                                            Dinanath <span className="text-amber-500">&</span> Sons
                                        </span>
                                        <span className="text-[9px] md:text-[10px] text-gray-400 tracking-[0.25em] uppercase font-semibold mt-1">
                                            {isRetail ? 'Premium Tools' : 'Wholesale Supply'}
                                        </span>
                                    </div>
                                    {scrolled && (
                                        <div className="absolute -inset-2 bg-amber-500/10 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </motion.div>
                            </Link>

                            {/* Desktop Nav Links */}
                            <nav className="hidden lg:flex items-center gap-1">
                                {[
                                    { href: '/', label: t.nav.home },
                                    { href: '/shop', label: t.nav.shop },
                                    { href: '/about', label: t.nav.about },
                                    { href: '/contact', label: 'Contact' }
                                ].map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="relative px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors group/link"
                                    >
                                        <span>{link.label}</span>
                                        <motion.span
                                            className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r ${isRetail ? 'from-amber-400 to-amber-600' : 'from-blue-400 to-blue-600'} scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left rounded-full`}
                                        />
                                    </Link>
                                ))}
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="ml-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter text-white bg-red-600 hover:bg-red-500 transition-all flex items-center gap-1 shadow-lg shadow-red-900/40"
                                    >
                                        <Lock size={10} /> Admin
                                    </Link>
                                )}
                            </nav>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-4 relative z-50">

                            {/* Search Hub */}
                            <div className="hidden md:flex items-center pr-2">
                                <motion.div
                                    className="relative"
                                    whileHover="hover"
                                >
                                    <button
                                        onClick={() => setIsSearchOpen(true)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/search"
                                    >
                                        <Search size={16} className="text-gray-400 group-hover/search:text-white transition-colors" />
                                        <span className="text-xs font-medium text-gray-500 group-hover/search:text-gray-300">Quick Search...</span>
                                        <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100">
                                            <span className="text-xs">⌘</span>K
                                        </kbd>
                                    </button>
                                </motion.div>
                            </div>

                            {/* Mode Toggle - Advanced Design */}
                            <div className="hidden sm:flex items-center p-1 rounded-xl bg-white/5 border border-white/10 relative">
                                <motion.div
                                    className={`absolute inset-1 w-[calc(50%-4px)] rounded-lg shadow-xl ${isRetail ? 'bg-amber-600' : 'bg-blue-600'}`}
                                    animate={{ x: isRetail ? 0 : '100%' }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                                <button
                                    onClick={() => setMode('retail')}
                                    className={`relative z-10 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${isRetail ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Retail
                                </button>
                                <button
                                    onClick={() => setMode('wholesale')}
                                    className={`relative z-10 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${!isRetail ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    B2B
                                </button>
                            </div>

                            {/* Action Icons */}
                            <div className="flex items-center gap-2">
                                {/* Wishlist */}
                                <Link href="/wishlist">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    >
                                        <Heart size={20} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
                                        {wishlist.length > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold text-white items-center justify-center">
                                                    {wishlist.length}
                                                </span>
                                            </span>
                                        )}
                                    </motion.button>
                                </Link>

                                {/* Cart / Quote */}
                                <Link href="/cart">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`group h-10 px-4 rounded-xl font-bold text-sm flex items-center gap-2 shadow-2xl transition-all ${isRetail ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'}`}
                                    >
                                        <ShoppingCart size={18} className="group-hover:rotate-12 transition-transform" />
                                        <span className="hidden md:inline">{isRetail ? 'Cart' : 'Quote'}</span>
                                        {cart.length > 0 && (
                                            <span className="bg-white/20 backdrop-blur-md rounded-lg px-1.5 py-0.5 text-[10px]">
                                                {cart.reduce((acc, item) => acc + item.quantity, 0)}
                                            </span>
                                        )}
                                    </motion.button>
                                </Link>

                                {/* Language Toggle */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setHasSeenLanguagePopup(false)}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all font-bold text-[10px]"
                                    title="Choose Language"
                                >
                                    <div className="flex flex-col items-center leading-none">
                                        <Globe size={18} className="mb-0.5" />
                                        <span className="uppercase">{language.substring(0, 2)}</span>
                                    </div>
                                </motion.button>

                                {/* User / Avatar */}
                                <Link href={user ? "/account" : "/login"} className="hidden sm:block">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className={`w-10 h-10 rounded-xl border flex items-center justify-center overflow-hidden transition-all ${user ? 'border-amber-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                    >
                                        {user ? (
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User size={20} className="text-gray-400" />
                                        )}
                                    </motion.div>
                                </Link>

                                {/* Mobile Toggle */}
                                <button
                                    onClick={() => setIsMenuOpen(true)}
                                    className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
                                >
                                    <Menu size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.header>
            </AnimatePresence>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] lg:hidden"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col p-6"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/10 p-1 rounded-xl backdrop-blur-md border border-white/5 flex-shrink-0">
                                        <img src="/images/logo.png" alt="D&S Logo" className="h-8 w-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-white text-base tracking-tight leading-none uppercase">
                                            Dinanath <span className="text-amber-500">&</span> Sons
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsSearchOpen(true);
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 mb-6 group"
                            >
                                <Search size={20} className="text-gray-500 group-hover:text-amber-500 transition-colors" />
                                <span className="text-lg font-bold text-gray-500 group-hover:text-white transition-colors">Search anything...</span>
                            </button>

                            <nav className="flex-1 space-y-2">
                                {[
                                    { href: '/', label: t.nav.home, icon: Globe },
                                    { href: '/shop', label: t.nav.shop, icon: ShoppingCart },
                                    { href: '/about', label: t.nav.about, icon: Building2 },
                                    { href: '/contact', label: 'Contact', icon: Phone },
                                ].map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-lg font-bold text-gray-300 hover:text-white transition-all group"
                                    >
                                        <link.icon size={20} className="text-gray-500 group-hover:text-amber-500" />
                                        <span>{link.label}</span>
                                        <ChevronRight size={18} className="ml-auto opacity-20 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-auto space-y-4 pt-6 border-t border-white/10">
                                <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                                    <button
                                        onClick={() => setMode('retail')}
                                        className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isRetail ? 'bg-amber-600 text-white' : 'text-gray-500'}`}
                                    >
                                        Retail
                                    </button>
                                    <button
                                        onClick={() => setMode('wholesale')}
                                        className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isRetail ? 'bg-blue-600 text-white' : 'text-gray-500'}`}
                                    >
                                        B2B
                                    </button>
                                </div>
                                <Link href="/cart" onClick={() => setIsMenuOpen(false)} className="block">
                                    <Button className={`w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest ${isRetail ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                                        {isRetail ? 'Cart' : 'Quote'} ({cart.length})
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    );
}
