
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, History, Package, ArrowRight, CornerDownLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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

    const handleSelectProduct = (productId: string) => {
        router.push(`/shop/${productId}`);
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
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:pt-32">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-white border border-black/5 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.1)] overflow-hidden"
                        onKeyDown={handleKeyDown}
                    >
                        {/* Search Input Area */}
                        <div className="p-6 border-b border-black/[0.04] bg-gray-50/50">
                            <div className="relative flex items-center">
                                <Search className={`absolute left-4 w-6 h-6 transition-colors ${isSearching ? 'text-purple-500 animate-pulse' : 'text-gray-400'}`} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search jewelry tools, machinery..."
                                    className="w-full bg-white border border-black/[0.06] rounded-2xl py-4 pl-14 pr-14 text-[#1D1D1F] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all text-lg font-medium"
                                />
                                <div className="absolute right-4 flex items-center gap-2">
                                    {query && (
                                        <button
                                            onClick={() => setQuery('')}
                                            className="p-1 hover:bg-gray-100 rounded-md text-gray-400"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                    <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded bg-gray-100 border border-black/[0.04] text-[10px] font-bold text-gray-500">
                                        <CornerDownLeft size={10} />
                                        <span>ENTER</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Body */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
                            {query.length === 0 ? (
                                <div className="p-8">
                                    {recentSearches.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                                <History size={14} /> Recent Searches
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map(term => (
                                                    <button
                                                        key={term}
                                                        onClick={() => setQuery(term)}
                                                        className="px-4 py-2 rounded-xl bg-gray-50 border border-black/[0.04] hover:border-purple-500/30 hover:bg-purple-50/50 text-gray-600 hover:text-purple-600 transition-all text-sm font-semibold"
                                                    >
                                                        {term}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                            <TrendingUp size={14} /> Trending Categories
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {['Jewelry Tools', 'Casting Machinery', 'Polishing Buffs', 'Gold Chemicals', 'Packaging Boxes', 'Precision Scales'].map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => {
                                                        router.push(`/shop?cat=${cat}`);
                                                        onClose();
                                                    }}
                                                    className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-black/[0.04] hover:bg-white hover:border-purple-500/20 hover:shadow-lg transition-all text-left group"
                                                >
                                                    <Package size={18} className="text-gray-400 group-hover:text-purple-500" />
                                                    <span className="text-sm font-bold text-gray-600 group-hover:text-[#1D1D1F]">{cat}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4">
                                    {results.length > 0 ? (
                                        <div className="px-2">
                                            <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Top Results</div>
                                            {results.map((product) => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => handleSelectProduct(product.id)}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all text-left group"
                                                >
                                                    <div className="w-16 h-16 rounded-xl bg-gray-100 border border-black/[0.04] overflow-hidden flex-shrink-0">
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-[#1D1D1F] mb-1 truncate group-hover:text-purple-600 transition-colors">{product.name}</h4>
                                                        <p className="text-xs text-gray-500 font-medium truncate">{product.category}</p>
                                                    </div>
                                                    <ArrowRight size={18} className="text-gray-300 group-hover:text-[#1D1D1F] group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    router.push(`/shop?q=${encodeURIComponent(query)}`);
                                                    onClose();
                                                }}
                                                className="w-full mt-4 p-4 border-t border-black/[0.04] text-center text-xs font-black uppercase tracking-widest text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all"
                                            >
                                                View all results for "{query}"
                                            </button>
                                        </div>
                                    ) : (
                                        !isSearching && (
                                            <div className="p-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                                                Search complete • No results found
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-gray-50 border-t border-black/[0.04] flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] px-8">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white border border-black/[0.04] text-gray-500">ESC</kbd> Close</span>
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white border border-black/[0.04] text-gray-500">↑↓</kbd> Navigate</span>
                            </div>
                            <span>Dinanath's Engine</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
