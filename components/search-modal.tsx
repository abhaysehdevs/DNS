'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, History, Package, ArrowRight, CornerDownLeft, Sparkles, CheckCircle2 } from 'lucide-react';
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
                    {/* Dark Ambient Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/85 backdrop-blur-md"
                    />

                    {/* Search Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -15 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-2xl bg-[#1E1E1E] border border-white/10 rounded-[2.5rem] shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden z-10"
                        onKeyDown={handleKeyDown}
                    >
                        {/* Search Input Bar */}
                        <div className="p-6 md:p-8 border-b border-white/5 bg-[#151515]">
                            <div className="flex items-center justify-between mb-4">
                                <div className="inline-flex items-center gap-2 text-[#C9A84C] text-[9px] font-black uppercase tracking-[0.3em]">
                                    <Sparkles size={12} /> Live Inventory Search
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full bg-[#1E1E1E] hover:bg-[#252525] border border-white/5 text-[#86868B] hover:text-[#F8F3E8] flex items-center justify-center transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="relative flex items-center">
                                <Search className={`absolute left-5 w-5 h-5 transition-colors ${isSearching ? 'text-[#C9A84C] animate-spin' : 'text-[#86868B]'}`} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search tools, machinery, casting, rolling mills..."
                                    className="w-full bg-[#1E1E1E] border border-white/10 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/50 rounded-2xl py-4 pl-14 pr-20 text-[#F8F3E8] placeholder-[#86868B] focus:outline-none transition-all text-sm md:text-base font-bold tracking-wide"
                                />
                                <div className="absolute right-4 flex items-center gap-2">
                                    {query && (
                                        <button
                                            onClick={() => setQuery('')}
                                            className="p-1.5 hover:bg-[#252525] rounded-lg text-[#86868B] hover:text-[#F8F3E8] transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                    <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#242424] border border-white/10 text-[9px] font-mono font-black text-[#C9A84C]">
                                        <CornerDownLeft size={10} />
                                        <span>ENTER</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Suggestions & Results Container */}
                        <div className="max-h-[55vh] overflow-y-auto custom-scrollbar bg-[#1E1E1E]">
                            {query.length === 0 ? (
                                <div className="p-6 md:p-8 space-y-6">
                                    {recentSearches.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-[#86868B] flex items-center gap-2">
                                                    <History size={13} className="text-[#C9A84C]" /> Recent Searches
                                                </h3>
                                                <button
                                                    onClick={() => {
                                                        setRecentSearches([]);
                                                        localStorage.removeItem('recentSearches');
                                                    }}
                                                    className="text-[8.5px] font-black uppercase tracking-wider text-[#86868B] hover:text-red-400 transition-colors"
                                                >
                                                    Clear History
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map(term => (
                                                    <button
                                                        key={term}
                                                        onClick={() => setQuery(term)}
                                                        className="px-4 py-2 rounded-xl bg-[#151515] border border-white/5 hover:border-[#C9A84C]/40 text-[#CFCFCF] hover:text-[#C9A84C] transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                                                    >
                                                        <span>{term}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-[#86868B] mb-3 flex items-center gap-2">
                                            <TrendingUp size={13} className="text-[#C9A84C]" /> Popular Categories
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
                                                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#151515] border border-white/5 hover:border-[#C9A84C]/40 hover:bg-[#202020] transition-all text-left group"
                                                >
                                                    <div className="w-8 h-8 rounded-xl bg-[#1E1E1E] flex items-center justify-center text-[#86868B] group-hover:text-[#C9A84C] transition-colors shrink-0">
                                                        <Package size={16} />
                                                    </div>
                                                    <span className="text-xs font-bold text-[#CFCFCF] group-hover:text-[#F8F3E8] truncate uppercase tracking-wider">{item.title}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 md:p-6">
                                    {results.length > 0 ? (
                                        <div className="space-y-2">
                                            <div className="px-2 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-[#86868B]">Hardware Results ({results.length})</div>
                                            {results.map((product) => {
                                                const productImg = product.image_url || product.image || product.primaryImage || '/placeholder.jpg';
                                                const price = product.retail_price || product.retailPrice || 0;
                                                return (
                                                    <button
                                                        key={product.id}
                                                        onClick={() => handleSelectProduct(product)}
                                                        className="w-full flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#151515] hover:bg-[#242424] transition-all text-left group border border-white/5 hover:border-[#C9A84C]/40"
                                                    >
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            <div className="w-14 h-14 rounded-xl bg-[#1E1E1E] border border-white/5 overflow-hidden shrink-0 p-1.5 flex items-center justify-center">
                                                                <img src={productImg} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-black text-[#F8F3E8] text-xs mb-1 truncate group-hover:text-[#C9A84C] transition-colors uppercase tracking-wide">{product.name}</h4>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-[9px] text-[#86868B] font-bold uppercase tracking-wider truncate bg-[#1E1E1E] px-2 py-0.5 rounded-md border border-white/5">{product.category}</span>
                                                                    {price > 0 && <span className="text-xs font-black text-[#C9A84C] font-mono">₹{price.toLocaleString('en-IN')}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-[#1E1E1E] group-hover:bg-[#C9A84C] text-[#86868B] group-hover:text-black flex items-center justify-center transition-all shrink-0">
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
                                                className="w-full mt-4 p-4 rounded-2xl bg-gradient-to-r from-[#C9A84C]/10 to-[#E8D48B]/10 border border-[#C9A84C]/30 text-center text-xs font-black uppercase tracking-[0.2em] text-[#C9A84C] hover:bg-[#C9A84C]/20 transition-colors"
                                            >
                                                View all results for "{query}" →
                                            </button>
                                        </div>
                                    ) : (
                                        !isSearching && (
                                            <div className="py-12 text-center text-[#86868B] font-bold uppercase text-xs tracking-widest space-y-2">
                                                <Package size={28} className="mx-auto text-[#444]" />
                                                <p>No products matching "{query}"</p>
                                                <p className="text-[10px] text-[#666]">Try searching by tool type or model name</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-[#151515] border-t border-white/5 flex items-center justify-between text-[9px] font-mono font-bold text-[#86868B] uppercase tracking-[0.2em] px-8">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><kbd className="px-2 py-0.5 rounded-md bg-[#242424] border border-white/10 text-[#F8F3E8]">ESC</kbd> Close</span>
                                <span className="flex items-center gap-1.5"><kbd className="px-2 py-0.5 rounded-md bg-[#242424] border border-white/10 text-[#F8F3E8]">ENTER</kbd> Full Search</span>
                            </div>
                            <span className="text-[#C9A84C]">Dinanath & Sons</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
