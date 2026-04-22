
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
                        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden"
                        onKeyDown={handleKeyDown}
                    >
                        {/* Search Input Area */}
                        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="relative flex items-center">
                                <Search className={`absolute left-4 w-6 h-6 transition-colors ${isSearching ? 'text-amber-500 animate-pulse' : 'text-gray-500'}`} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search products, machinery, or categories..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-white/[0.07] transition-all text-lg"
                                />
                                <div className="absolute right-4 flex items-center gap-2">
                                    {query && (
                                        <button
                                            onClick={() => setQuery('')}
                                            className="p-1 hover:bg-white/10 rounded-md text-gray-400"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                    <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-gray-500">
                                        <CornerDownLeft size={10} />
                                        <span>ENTER</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results Body */}
                        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {query.length === 0 ? (
                                <div className="p-8">
                                    {recentSearches.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                                                <History size={14} /> Recent Searches
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {recentSearches.map(term => (
                                                    <button
                                                        key={term}
                                                        onClick={() => setQuery(term)}
                                                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 text-gray-400 hover:text-amber-500 transition-all text-sm font-medium"
                                                    >
                                                        {term}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
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
                                                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-left group"
                                                >
                                                    <Package size={18} className="text-gray-500 group-hover:text-amber-500" />
                                                    <span className="text-sm font-semibold text-gray-400 group-hover:text-white">{cat}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4">
                                    {results.length > 0 ? (
                                        <div className="px-2">
                                            <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Top Results</div>
                                            {results.map((product) => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => handleSelectProduct(product.id)}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all text-left group"
                                                >
                                                    <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-white mb-1 truncate group-hover:text-amber-500 transition-colors">{product.name}</h4>
                                                        <p className="text-sm text-gray-500 truncate">{product.category}</p>
                                                    </div>
                                                    <ArrowRight size={18} className="text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    router.push(`/shop?q=${encodeURIComponent(query)}`);
                                                    onClose();
                                                }}
                                                className="w-full mt-4 p-4 border-t border-white/5 text-center text-sm font-bold text-amber-500 hover:text-amber-400 hover:bg-amber-500/5 transition-all"
                                            >
                                                View all results for "{query}"
                                            </button>
                                        </div>
                                    ) : (
                                        !isSearching && (
                                            <div className="p-12 text-center text-gray-500 font-medium">
                                                No products found for "{query}"
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest px-8">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500">ESC</kbd> to close</span>
                                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500">↑↓</kbd> to navigate</span>
                            </div>
                            <span>Dinanath & Sons Global Search</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
