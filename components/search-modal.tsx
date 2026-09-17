'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, History, Package, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getProductUrl } from '@/lib/slug';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setIsSearching(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
                    .limit(6);

                if (!error && data && data.length > 0) {
                    setResults(data);
                } else {
                    const { products } = await import('@/lib/data');
                    const matches = products.filter(p => 
                        p.name.toLowerCase().includes(query.toLowerCase()) || 
                        (typeof p.category === 'string' && p.category.toLowerCase().includes(query.toLowerCase())) ||
                        p.description.toLowerCase().includes(query.toLowerCase())
                    ).slice(0, 6);
                    setResults(matches.map(p => ({
                        ...p,
                        image_url: p.image || p.primaryImage
                    })));
                }
            } catch (err) {
                const { products } = await import('@/lib/data');
                const matches = products.filter(p => 
                    p.name.toLowerCase().includes(query.toLowerCase()) || 
                    (typeof p.category === 'string' && p.category.toLowerCase().includes(query.toLowerCase()))
                ).slice(0, 6);
                setResults(matches);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchResults, 250);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelectProduct = (product: any) => {
        router.push(getProductUrl(product));
        onClose();
        saveSearch(query);
    };

    const saveSearch = (term: string) => {
        if (!term || term.trim().length < 2) return;
        const newRecent = [term.trim(), ...recentSearches.filter(s => s.toLowerCase() !== term.trim().toLowerCase())].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter' && query.trim()) {
            router.push(`/shop?q=${encodeURIComponent(query)}`);
            saveSearch(query);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 select-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Search Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -15 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-2xl bg-white border border-[#E8E2D5] rounded-3xl shadow-2xl overflow-hidden z-10"
                        onKeyDown={handleKeyDown}
                    >
                        {/* Search Input Bar */}
                        <div className="p-6 md:p-8 border-b border-[#E8E2D5] bg-[#FAF9F5]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="inline-flex items-center gap-2 text-[#966E2E] text-[9px] font-bold uppercase tracking-[0.25em]">
                                    <Sparkles size={12} /> Live Inventory Search
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-white hover:bg-[#F3EFE6] border border-[#E8E2D5] text-[#52525B] hover:text-[#18181B] flex items-center justify-center transition-colors shadow-xs"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="relative flex items-center">
                                <Search className={`absolute left-5 w-5 h-5 transition-colors ${isSearching ? 'text-[#966E2E] animate-spin' : 'text-[#71717A]'}`} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search tools, machinery, casting, rolling mills..."
                                    className="w-full bg-white border border-[#E8E2D5] focus:border-[#966E2E] focus:ring-1 focus:ring-[#966E2E]/30 rounded-2xl py-3.5 pl-14 pr-20 text-[#18181B] placeholder-[#A1A1AA] focus:outline-none transition-all text-sm md:text-base font-medium tracking-wide shadow-xs"
                                />
                                <div className="absolute right-4 flex items-center gap-2">
                                    {query && (
                                        <button
                                            onClick={() => setQuery('')}
                                            className="p-1.5 hover:bg-[#FAF9F5] rounded-lg text-[#71717A] hover:text-[#18181B] transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                    <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] text-[9px] font-mono font-bold text-[#966E2E]">
                                        <CornerDownLeft size={10} />
                                        <span>ENTER</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Suggestions & Results Container */}
                        <div className="max-h-[55vh] overflow-y-auto custom-scrollbar bg-white">
                            {query.length === 0 ? (
                                <div className="p-6 md:p-8 space-y-6">
                                    {recentSearches.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#71717A] flex items-center gap-2">
                                                    <History size={13} className="text-[#966E2E]" /> Recent Searches
                                                </h3>
                                                <button
                                                    onClick={() => {
                                                        setRecentSearches([]);
                                                        localStorage.removeItem('recentSearches');
                                                    }}
                                                    className="text-[8.5px] font-bold uppercase tracking-wider text-[#71717A] hover:text-red-500 transition-colors"
                                                >
                                                    Clear History
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map(term => (
                                                    <button
                                                        key={term}
                                                        onClick={() => setQuery(term)}
                                                        className="px-4 py-2 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5] hover:border-[#966E2E]/50 text-[#18181B] hover:text-[#966E2E] transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs"
                                                    >
                                                        <span>{term}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#71717A] mb-3 flex items-center gap-2">
                                            <TrendingUp size={13} className="text-[#966E2E]" /> Popular Categories
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {[
                                                { title: 'Rolling Mills', cat: 'Rolling Mills' },
                                                { title: 'Casting Machinery', cat: 'Casting Machinery' },
                                                { title: 'Polishing & Buffing', cat: 'Polishing & Buffing' },
                                                { title: 'Pliers & Hand Tools', cat: 'Tweezers & Pliers' },
                                                { title: 'Microscopes & Loupes', cat: 'Precision Optics' },
                                                { title: 'Automatic Torches', cat: 'Automatic Torches' },
                                            ].map(item => (
                                                <button
                                                    key={item.title}
                                                    onClick={() => {
                                                        router.push(`/shop?category=${encodeURIComponent(item.cat)}`);
                                                        onClose();
                                                    }}
                                                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E8E2D5] hover:border-[#966E2E]/50 hover:bg-white transition-all text-left group shadow-xs"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-white border border-[#E8E2D5] flex items-center justify-center text-[#71717A] group-hover:text-[#966E2E] transition-colors shrink-0">
                                                        <Package size={16} />
                                                    </div>
                                                    <span className="text-xs font-bold text-[#18181B] group-hover:text-[#966E2E] truncate uppercase tracking-wider">{item.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 md:p-6">
                                    {results.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#71717A]">Hardware Results ({results.length})</div>
                                            {results.map((product) => {
                                                const productImg = product.image_url || product.image || product.primaryImage || '/placeholder.jpg';
                                                const price = product.retail_price || product.retailPrice || 0;
                                                return (
                                                    <button
                                                        key={product.id}
                                                        onClick={() => handleSelectProduct(product)}
                                                        className="w-full flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#FAF9F5] hover:bg-white transition-all text-left group border border-[#E8E2D5] hover:border-[#966E2E]/50 shadow-xs"
                                                    >
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            <div className="w-14 h-14 rounded-xl bg-white border border-[#E8E2D5] overflow-hidden shrink-0 p-1.5 flex items-center justify-center">
                                                                <img src={productImg} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-bold text-[#18181B] text-xs mb-1 truncate group-hover:text-[#966E2E] transition-colors uppercase tracking-wide">{product.name}</h4>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[9px] text-[#71717A] font-bold uppercase tracking-wider truncate bg-white px-2 py-0.5 rounded-md border border-[#E8E2D5]">{product.category}</span>
                                                                    {price > 0 && <span className="text-xs font-bold text-[#966E2E] font-mono">₹{price.toLocaleString('en-IN')}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-white group-hover:bg-[#966E2E] text-[#71717A] group-hover:text-white border border-[#E8E2D5] flex items-center justify-center transition-all shrink-0 shadow-xs">
                                                            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => {
                                                    router.push(`/shop?q=${encodeURIComponent(query)}`);
                                                    onClose();
                                                }}
                                                className="w-full mt-4 p-4 rounded-2xl bg-[#FAF9F5] border border-[#966E2E]/40 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#966E2E] hover:bg-[#F3EFE6] transition-colors shadow-xs"
                                            >
                                                View all results for "{query}" →
                                            </button>
                                        </div>
                                    ) : (
                                        !isSearching && (
                                            <div className="py-12 text-center text-[#71717A] font-bold uppercase text-xs tracking-widest space-y-2">
                                                <Package size={28} className="mx-auto text-[#A1A1AA]" />
                                                <p>No products matching "{query}"</p>
                                                <p className="text-[10px] text-[#A1A1AA]">Try searching by tool type or model name</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-[#FAF9F5] border-t border-[#E8E2D5] flex items-center justify-between text-[9px] font-mono font-bold text-[#71717A] uppercase tracking-[0.2em] px-8">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><kbd className="px-2 py-0.5 rounded-md bg-white border border-[#E8E2D5] text-[#18181B] shadow-xs">ESC</kbd> Close</span>
                                <span className="flex items-center gap-1.5"><kbd className="px-2 py-0.5 rounded-md bg-white border border-[#E8E2D5] text-[#18181B] shadow-xs">ENTER</kbd> Full Search</span>
                            </div>
                            <span className="text-[#966E2E]">Dinanath & Sons</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
