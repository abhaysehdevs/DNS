'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, Search, Heart, X, ChevronDown, User, Phone, Globe, Shield, Tag } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { usePathname, useRouter } from 'next/navigation';
import { SearchAutocomplete } from './search-autocomplete';
import { supabase } from '@/lib/supabase';

export function Navbar() {
    const { mode, language, cart, wishlist, setMode, user, currencyData } = useAppStore();
    const t = translations[language] || translations['en'];
    const isMobile = useIsMobile();
    const pathname = usePathname();
    const router = useRouter();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [visible, setVisible] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [currentAnnIndex, setCurrentAnnIndex] = useState(0);

    const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent, text: string) => {
        setMousePos({ x: e.clientX, y: e.clientY });
        setHoveredTooltip(text);
    };

    const handleMouseLeave = () => {
        setHoveredTooltip(null);
    };

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const { data, error } = await supabase
                    .from('announcements')
                    .select('*')
                    .eq('active', true)
                    .order('display_order');
                if (!error && data) {
                    setAnnouncements(data);
                }
            } catch (err) {
                console.error('Error fetching announcements:', err);
            }
        };
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        if (announcements.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentAnnIndex(prev => (prev + 1) % announcements.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [announcements]);

    const searchRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
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

    // Handle clicks outside search dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchFocused(false);
        }
    };

    const handleSearchSelect = (term: string) => {
        setSearchQuery(term);
        router.push(`/shop?search=${encodeURIComponent(term)}`);
        setIsSearchFocused(false);
    };

    const navLinks = [
        { href: '/', label: 'HOME' },
        { href: '/shop', label: 'PRODUCTS' },
        { href: '/shop?cat=Machinery', label: 'MACHINES' },
        { href: '/shop?cat=Tools', label: 'HAND TOOLS' },
        { href: '/shop?cat=Consumables', label: 'POLISHING' },
        { href: '/shop?cat=Packaging', label: 'PACKAGING' },
        { href: '/shop?cat=Packaging', label: 'DISPLAY' }, // maps to packaging
        { href: '/new-arrivals', label: 'NEW ARRIVALS' },
        { href: '/offers', label: 'OFFERS' },
        { href: '/about', label: 'ABOUT' },
        { href: '/contact', label: 'CONTACT' }
    ];

    const categoryList = [
        { name: 'Hand Tools', href: '/shop?cat=Tools' },
        { name: 'Machines', href: '/shop?cat=Machinery' },
        { name: 'Polishing & Buffs', href: '/shop?cat=Consumables' },
        { name: 'Cleaning Solutions', href: '/shop?cat=Chemicals' },
        { name: 'Packaging', href: '/shop?cat=Packaging' },
        { name: 'Accessories', href: '/shop?cat=Tools' }
    ];

    return (
        <>
            <motion.header
                initial={{ y: 0 }}
                animate={{ y: visible ? 0 : -120 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-0 left-0 right-0 z-[100] w-full flex flex-col bg-[#151515] border-b border-[#343434] transition-all animate-in fade-in duration-300"
            >
                {/* 1. TOP ANNOUNCEMENT BAR */}
                <div 
                    className="w-full border-b border-[#343434] py-2 px-4 md:px-6 transition-all duration-500"
                    style={{
                        backgroundColor: announcements.length > 0 ? announcements[currentAnnIndex].background_color : '#1E1E1E'
                    }}
                >
                    <div className="container mx-auto flex justify-between items-center text-[8.5px] sm:text-[10px] font-semibold uppercase tracking-wider">
                        <div 
                            className="flex items-center gap-2 justify-center w-full md:w-auto text-center md:text-left"
                            style={{
                                color: announcements.length > 0 ? announcements[currentAnnIndex].text_color : '#CFCFCF'
                            }}
                        >
                            <span className="text-[#A67C35] font-bold">★</span>
                            <span>{announcements.length > 0 ? announcements[currentAnnIndex].message : "India's Trusted Jewellery Tool Experts Since 1960"}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-6 text-text-primary font-bold">
                            <Link href="/about" className="hover:text-[#A67C35] transition-colors">About Us</Link>
                            <Link href="/contact" className="hover:text-[#A67C35] transition-colors">Contact Us</Link>
                            <Link 
                                href="/track-order" 
                                onMouseMove={(e) => handleMouseMove(e, "Live Dispatch Tracker: Input AWB codes or customer manifest credentials.")}
                                onMouseLeave={handleMouseLeave}
                                className="hover:text-[#A67C35] transition-colors"
                            >
                                Track Order
                            </Link>
                            <div className="w-px h-3 bg-[#343434]" />
                            <div 
                                onClick={() => window.dispatchEvent(new CustomEvent('open-language-popup'))}
                                onMouseMove={(e) => handleMouseMove(e, "Language Settings: Toggle displays between 8 regional languages and currency presets.")}
                                onMouseLeave={handleMouseLeave}
                                className="flex items-center gap-1.5 cursor-pointer hover:text-[#A67C35] transition-colors"
                            >
                                <Globe size={11} className="text-[#A67C35]" />
                                <span>{currencyData.code} | {
                                    language === 'en' ? 'English' :
                                    language === 'hi' ? 'हिन्दी' :
                                    language === 'mr' ? 'मराठी' :
                                    language === 'gu' ? 'ગુજરાતી' :
                                    language === 'bn' ? 'বাংলা' :
                                    language === 'ta' ? 'தமிழ்' :
                                    language === 'te' ? 'తెలుగు' :
                                    (language as string).toUpperCase()
                                }</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN HEADER BAR */}
                <div className="w-full py-4 px-4 md:px-6">
                    <div className="container mx-auto flex items-center justify-between gap-3 md:gap-6">
                        {/* Logo & Brand Identity */}
                        <Link href="/" className="flex items-center gap-3 md:gap-4 shrink-0 group">
                            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-[#1E1E1E] border border-[#343434] flex items-center justify-center relative overflow-hidden group-hover:border-[#A67C35]/60 transition-all duration-500 shadow-2xl shrink-0">
                                <div className="absolute inset-0 bg-[#A67C35]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <img src="/images/logo.png" className="w-10 h-10 md:w-16 md:h-16 object-contain relative z-10 scale-105 group-hover:scale-110 transition-transform duration-300" alt="Dinanath & Sons Logo" onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/logo.png';
                                }} />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-base xs:text-lg md:text-2xl font-black font-display text-[#F8F3E8] tracking-wider uppercase leading-none group-hover:text-[#A67C35] transition-colors">Dinanath & Sons</span>
                                <span className="text-[8px] md:text-[9.5px] font-bold text-[#A67C35] tracking-[0.25em] uppercase mt-1.5 hidden sm:block">Jewellery Tools & Equipment — Since 1960</span>
                            </div>
                        </Link>

                        {/* Search Bar - Center */}
                        <div className="hidden lg:block flex-1 max-w-xl relative" ref={searchRef}>
                            <form 
                                onSubmit={handleSearchSubmit} 
                                onMouseMove={(e) => handleMouseMove(e, "Search Catalog: Scan our collection of machinery, tools, and industrial accessories.")}
                                onMouseLeave={handleMouseLeave}
                                className="relative flex items-center w-full h-11 bg-[#1E1E1E] border border-[#343434] rounded-lg overflow-hidden focus-within:border-[#A67C35] transition-all"
                            >
                                <input
                                    type="text"
                                    placeholder="Search for tools, machines, equipment..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    className="w-full h-full bg-transparent pl-4 pr-12 text-xs text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none font-medium"
                                />
                                <button type="submit" className="absolute right-0 top-0 bottom-0 w-11 bg-[#A67C35] hover:bg-[#8A6232] transition-colors flex items-center justify-center text-black">
                                    <Search size={16} />
                                </button>
                            </form>
                            <SearchAutocomplete
                                query={searchQuery}
                                onSelect={handleSearchSelect}
                                isVisible={isSearchFocused}
                            />
                        </div>

                        {/* User Action Tools - Right */}
                        <div className="flex items-center gap-2.5 md:gap-6 shrink-0 text-[#F8F3E8]">
                            
                            {/* Wholesale Toggle */}
                            <div 
                                 onMouseMove={(e) => handleMouseMove(e, "Wholesale Switch: Toggle pricing catalog and minimum order quantities for bulk purchases.")}
                                 onMouseLeave={handleMouseLeave}
                                 className="hidden sm:flex items-center p-1 bg-[#1E1E1E] border border-[#343434] rounded-lg"
                             >
                                <button onClick={() => setMode('retail')} className={`px-3 py-1.5 rounded text-[8px] font-bold uppercase tracking-wider transition-all ${isRetail ? 'bg-[#A67C35] text-black shadow' : 'text-[#8E8E9A] hover:text-[#F8F3E8]'}`}>Retail</button>
                                <button onClick={() => setMode('wholesale')} className={`px-3 py-1.5 rounded text-[8px] font-bold uppercase tracking-wider transition-all ${!isRetail ? 'bg-[#D12A1C] text-white shadow' : 'text-[#8E8E9A] hover:text-[#F8F3E8]'}`}>Wholesale</button>
                            </div>

                            {/* Account Link */}
                            <Link 
                                 href="/account" 
                                 onMouseMove={(e) => handleMouseMove(e, "Account Gateway: Authenticate, register, or track order profiles.")}
                                 onMouseLeave={handleMouseLeave}
                                 className="hidden md:flex items-center gap-2.5 group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#1E1E1E] border border-[#343434] flex items-center justify-center text-[#CFCFCF] group-hover:text-[#A67C35] group-hover:border-[#A67C35]/30 transition-colors">
                                    <User size={16} />
                                </div>
                                <div className="hidden xl:flex flex-col text-left">
                                    <span className="text-[8px] text-[#8E8E9A] font-bold uppercase tracking-wider leading-none">{user ? 'Signed In' : 'Account'}</span>
                                    <span className="text-[10px] text-[#F8F3E8] font-bold mt-1 group-hover:text-[#A67C35] transition-colors uppercase leading-none truncate max-w-[120px]">
                                        {user ? (user.name || 'My Account') : 'Login / Register'}
                                    </span>
                                </div>

                            </Link>

                            {/* Wishlist Link */}
                            <Link 
                                 href="/wishlist" 
                                 onMouseMove={(e) => handleMouseMove(e, "Wishlist: Review your saved workshop machinery and tools.")}
                                 onMouseLeave={handleMouseLeave}
                                 className="hidden md:flex items-center gap-2.5 group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#1E1E1E] border border-[#343434] flex items-center justify-center text-[#CFCFCF] relative group-hover:text-[#A67C35] group-hover:border-[#A67C35]/30 transition-colors">
                                    <Heart size={16} />
                                    {wishlist.length > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#A67C35] text-black text-[8px] font-black rounded-full flex items-center justify-center shadow">{wishlist.length}</span>
                                    )}
                                </div>
                                <div className="hidden xl:flex flex-col text-left">
                                    <span className="text-[8px] text-[#8E8E9A] font-bold uppercase tracking-wider leading-none">Wishlist</span>
                                    <span className="text-[10px] text-[#F8F3E8] font-bold mt-1 group-hover:text-[#A67C35] transition-colors uppercase leading-none">Your Wishlist</span>
                                </div>
                            </Link>

                            {/* Cart Status Link */}
                            <Link 
                                 href="/cart" 
                                 onMouseMove={(e) => handleMouseMove(e, "Cart Checklist: Review products ready for purchase and proceed to secure checkout.")}
                                 onMouseLeave={handleMouseLeave}
                                 className="flex items-center gap-2.5 group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#1E1E1E] border border-[#343434] flex items-center justify-center text-[#CFCFCF] relative group-hover:text-[#A67C35] group-hover:border-[#A67C35]/30 transition-colors">
                                    <ShoppingCart size={16} />
                                    {cart.length > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#D12A1C] text-white text-[8px] font-black rounded-full flex items-center justify-center shadow animate-pulse">{cart.length}</span>
                                    )}
                                </div>
                                <div className="hidden xl:flex flex-col text-left">
                                    <span className="text-[8px] text-[#8E8E9A] font-bold uppercase tracking-wider leading-none">Cart</span>
                                    <span className="text-[10px] text-[#F8F3E8] font-bold mt-1 group-hover:text-[#A67C35] transition-colors uppercase leading-none">Your Cart</span>
                                </div>
                            </Link>

                            {/* Mobile Hamburger toggle */}
                            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden w-10 h-10 rounded-lg bg-[#1E1E1E] border border-[#343434] flex items-center justify-center text-[#F8F3E8]"><Menu size={20} /></button>
                        </div>
                    </div>
                </div>

                {/* 3. NAVIGATION BAR & CATEGORY SELECTOR */}
                <div className="hidden lg:block w-full bg-[#1A1A1A] border-t border-[#343434]">
                    <div className="container mx-auto flex items-center">
                        {/* Categories Dropdown Trigger */}
                        <div className="relative shrink-0 py-3 pr-6 border-r border-[#343434]">
                            <button 
                                onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                                onMouseMove={(e) => handleMouseMove(e, "Category Taxonomy: Scan tool catalogs sorted by operational categories.")}
                                onMouseLeave={handleMouseLeave}
                                className="flex items-center gap-2 bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase tracking-widest text-[9px] px-6 py-2.5 rounded-lg transition-colors shadow"
                            >
                                <Menu size={12} strokeWidth={3} />
                                <span>All Categories</span>
                                <ChevronDown size={11} strokeWidth={3} className={`transition-transform duration-300 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isCategoriesDropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 15 }}
                                        className="absolute top-full left-0 bg-[#1E1E1E] border border-[#343434] rounded-lg shadow-[0_15px_50px_rgba(0,0,0,0.8)] mt-2 w-56 overflow-hidden z-[101]"
                                    >
                                        <div className="flex flex-col py-2">
                                            {categoryList.map((cat, i) => (
                                                <Link 
                                                    key={i} 
                                                    href={cat.href}
                                                    onClick={() => setIsCategoriesDropdownOpen(false)}
                                                    className="px-6 py-3 text-[10px] font-bold text-[#CFCFCF] hover:text-black hover:bg-[#A67C35] uppercase tracking-wider transition-all"
                                                >
                                                    {cat.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Navigation Links list */}
                        <nav className="flex items-center flex-1 px-6 overflow-x-auto scrollbar-hide py-1">
                            {navLinks.map((link, i) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link 
                                        key={i} 
                                        href={link.href} 
                                        className={`px-4 py-4 text-[9px] font-bold uppercase tracking-[0.2em] transition-all relative group shrink-0 ${
                                            isActive ? 'text-[#A67C35]' : 'text-[#CFCFCF] hover:text-[#A67C35]'
                                        }`}
                                    >
                                        {link.label}
                                        <span className={`absolute bottom-2 left-4 right-4 h-0.5 bg-[#A67C35] transition-all duration-300 ${
                                            isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                                        }`} />
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Sidebar Navigation */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex lg:hidden"
                    >
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
                        
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="relative ml-auto w-full max-w-xs bg-[#151515] border-l border-[#343434] p-8 flex flex-col justify-between h-full shadow-2xl overflow-y-auto"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-8 border-b border-[#343434] pb-4">
                                    <div className="flex items-center gap-2">
                                        <Shield className="text-[#A67C35]" size={16} />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8E8E9A]">Menu Navigation</span>
                                    </div>
                                    <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-full bg-[#1E1E1E] border border-[#343434] flex items-center justify-center text-[#F8F3E8] hover:text-[#A67C35]"><X size={16} /></button>
                                </div>

                                <div className="mb-6">
                                    <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full h-10 bg-[#1E1E1E] border border-[#343434] rounded-lg overflow-hidden">
                                        <input
                                            type="text"
                                            placeholder="Search tools..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full h-full bg-transparent pl-4 pr-10 text-xs text-[#F8F3E8] focus:outline-none"
                                        />
                                        <button type="submit" className="absolute right-0 w-10 h-full bg-[#A67C35] flex items-center justify-center text-black">
                                            <Search size={14} />
                                        </button>
                                    </form>
                                </div>

                                <nav className="space-y-4">
                                    {navLinks.map((link, i) => (
                                        <Link 
                                            key={i} 
                                            href={link.href} 
                                            onClick={() => setIsMenuOpen(false)}
                                            className="block text-left text-xs font-bold uppercase tracking-widest text-[#CFCFCF] hover:text-[#A67C35] py-2 border-b border-[#343434]/40"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            <div className="pt-8 border-t border-[#343434] space-y-6">
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => { setMode('retail'); setIsMenuOpen(false); }} className={`h-11 rounded-lg font-bold uppercase tracking-wider text-[8px] border ${isRetail ? 'bg-[#A67C35] text-black border-[#A67C35]' : 'bg-[#1E1E1E] text-[#CFCFCF] border-[#343434]'}`}>Retail</button>
                                    <button onClick={() => { setMode('wholesale'); setIsMenuOpen(false); }} className={`h-11 rounded-lg font-bold uppercase tracking-wider text-[8px] border ${!isRetail ? 'bg-[#D12A1C] text-white border-[#D12A1C]' : 'bg-[#1E1E1E] text-[#CFCFCF] border-[#343434]'}`}>Wholesale</button>
                                </div>
                                <button 
                                    onClick={() => { setIsMenuOpen(false); window.dispatchEvent(new CustomEvent('open-language-popup')); }} 
                                    className="w-full h-11 rounded-lg border border-[#343434] bg-[#1E1E1E] text-[#CFCFCF] font-bold uppercase tracking-wider text-[8px] flex items-center justify-center gap-2"
                                >
                                    <Globe size={12} className="text-[#A67C35]" />
                                    Choose Language ({
                                        language === 'en' ? 'English' :
                                        language === 'hi' ? 'हिन्दी' :
                                        language === 'mr' ? 'मराठी' :
                                        language === 'gu' ? 'ગુજરાતી' :
                                        language === 'bn' ? 'বাংলা' :
                                        language === 'ta' ? 'தமிழ்' :
                                        language === 'te' ? 'తెలుగు' :
                                        (language as string).toUpperCase()
                                    })
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {hoveredTooltip && (
                <div 
                    className="fixed z-[9999] pointer-events-none bg-[#1E1E1E]/95 border border-[#A67C35] text-[#F8F3E8] text-[9px] font-black uppercase tracking-widest px-4 py-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg whitespace-normal max-w-xs transition-opacity duration-200 hidden md:block"
                    style={{
                        left: `${mousePos.x + 15}px`,
                        top: `${mousePos.y + 15}px`
                    }}
                >
                    {hoveredTooltip}
                </div>
            )}
        </>
    );
}
