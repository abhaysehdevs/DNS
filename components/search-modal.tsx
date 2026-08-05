'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, History, Package, ArrowRight, CornerDownLeft } from 'lucide-react';
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
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
                .limit(6);

            if (!error && data && data.length > 0) {
                setResults(data);
            } else {
                import('@/lib/data').then((module) => {
                    const matches = module.products.filter(p => 
                        p.name.toLowerCase().includes(query.toLowerCase()) || 
                        (typeof p.category === 'string' && p.category.toLowerCase().includes(query.toLowerCase())) ||
                        p.description.toLowerCase().includes(query.toLowerCase())
                    ).slice(0, 6);
                    setResults(matches.map(p => ({
                        ...p,
                        image_url: p.image || p.primaryImage
                    })));
                });
            }
            setIsSearching(false);
        };

        const timer = setTimeout(fetchResults, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSelectProduct = (product: any) => {
        router.push(getProductUrl(product));
        onClose();
        saveSearch(query);
    };

    const saveSearch = (term: string) => {
        if (!term || term.length < 2) return;
        const newRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
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
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:pt-28 select-none">
                    {/* Dark Glass Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
                    />

                    {/* Search Dialog Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-[#1E1E1E] border border-[#343434] rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
                        onKeyDown={handleKeyDown}
                    >
                        {/* Search Input Bar */}
                        <div className="p-6 border-b border-[#343434] bg-[#151515]">
                            <div className="relative flex items-center">
                                <Search className={`absolute left-4 w-5 h-5 transition-colors ${isSearching ? 'text-[#A67C35] animate-pulse' : 'text-[#8E8E9A]'}`} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search jewellery tools, machinery, buffing..."
                                    className="w-full bg-[#1E1E1E] border border-[#343434] focus:border-[#A67C35] rounded-2xl py-4 pl-12 pr-14 text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none transition-all text-base font-bold tracking-wide"
                                />
                                <div className="absolute right-4 flex items-center gap-2">
                                    {query && (
                                        <button
                                            onClick={() => setQuery('')}
                                            className="p-1 hover:bg-[#343434] rounded-md text-[#8E8E9A] hover:text-[#F8F3E8] transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                    <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-[#242424] border border-[#343434] text-[9px] font-mono font-bold text-[#A67C35]">
                                        <CornerDownLeft size={10} />
                                        <span>ENTER</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Results / Suggestions Content */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#1E1E1E]">
                            {query.length === 0 ? (
                                <div className="p-6 space-y-6">
                                    {recentSearches.length > 0 && (
                                        <div>
                                            <h3 className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#8E8E9A] mb-3 flex items-center gap-2">
                                                <History size={13} className="text-[#A67C35]" /> Recent Inquiries
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map(term => (
                                                    <button
                                                        key={term}
                                                        onClick={() => setQuery(term)}
                                                        className="px-3.5 py-2 rounded-xl bg-[#151515] border border-[#343434] hover:border-[#A67C35] text-[#CFCFCF] hover:text-[#A67C35] transition-all text-xs font-bold"
                                                    >
                                                        {term}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#8E8E9A] mb-3 flex items-center gap-2">
                                            <TrendingUp size={13} className="text-[#A67C35]" /> Popular Categories
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                            {['Tweezers & Pliers', 'Casting Machinery', 'Polishing Buffs', 'Automatic Torches', 'Precision Scales', 'Rolling Mills'].map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => {
                                                        router.push(`/shop?cat=${cat}`);
                                                        onClose();
                                                    }}
                                                    className="flex items-center gap-3 p-3.5 rounded-xl bg-[#151515] border border-[#343434] hover:border-[#A67C35] transition-all text-left group"
                                                >
                                                    <Package size={16} className="text-[#8E8E9A] group-hover:text-[#A67C35] transition-colors" />
                                                    <span className="text-xs font-bold text-[#CFCFCF] group-hover:text-[#F8F3E8] truncate">{cat}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-3">
                                    {results.length > 0 ? (
                                        <div className="px-2">
                                            <div className="px-4 py-2 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#8E8E9A]">Top Hardware Results</div>
                                            {results.map((product) => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => handleSelectProduct(product)}
                                                    className="w-full flex items-center gap-4 p-3.5 rounded-xl hover:bg-[#242424] transition-all text-left group border border-transparent hover:border-[#343434]"
                                                >
                                                    <div className="w-14 h-14 rounded-xl bg-[#151515] border border-[#343434] overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                                                        <img src={product.image_url || product.image || '/placeholder.jpg'} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-[#F8F3E8] text-xs mb-1 truncate group-hover:text-[#A67C35] transition-colors uppercase tracking-wide">{product.name}</h4>
                                                        <p className="text-[10px] text-[#8E8E9A] font-bold uppercase tracking-wider truncate">{product.category}</p>
                                                    </div>
                                                    <ArrowRight size={16} className="text-[#8E8E9A] group-hover:text-[#A67C35] group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    router.push(`/shop?q=${encodeURIComponent(query)}`);
                                                    onClose();
                                                }}
                                                className="w-full mt-3 p-4 border-t border-[#343434] text-center text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#A67C35] hover:underline"
                                            >
                                                View all results for "{query}"
                                            </button>
                                        </div>
                                    ) : (
                                        !isSearching && (
                                            <div className="p-12 text-center text-[#8E8E9A] font-mono font-bold uppercase text-[10px] tracking-[0.2em]">
                                                Search complete • No hardware matching query
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-[#151515] border-t border-[#343434] flex items-center justify-between text-[8.5px] font-mono font-bold text-[#8E8E9A] uppercase tracking-[0.2em] px-6">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-[#242424] border border-[#343434] text-[#F8F3E8]">ESC</kbd> Close</span>
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-[#242424] border border-[#343434] text-[#F8F3E8]">ENTER</kbd> Select</span>
                            </div>
                            <span className="text-[#A67C35]">Dinanath Engine</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
