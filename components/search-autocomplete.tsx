
'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, History, X, Command, ArrowRight, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchAutocompleteProps {
    query: string;
    onSelect: (term: string) => void;
    isVisible: boolean;
}

export function SearchAutocomplete({ query, onSelect, isVisible }: SearchAutocompleteProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) setRecentSearches(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (!query) {
            setProducts([]);
            return;
        }

        async function fetchSuggestions() {
            try {
                const { data } = await supabase
                    .from('products')
                    .select('id, name, category, image, image_url, retail_price, slug')
                    .ilike('name', `%${query}%`)
                    .limit(5);

                if (data && data.length > 0) {
                    setProducts(data.map(p => ({
                        ...p,
                        image: p.image || p.image_url || '/placeholder.jpg'
                    })));
                } else {
                    const { products: localProducts } = await import('@/lib/data');
                    const matches = localProducts.filter(p =>
                        p.name.toLowerCase().includes(query.toLowerCase()) ||
                        (typeof p.category === 'string' && p.category.toLowerCase().includes(query.toLowerCase()))
                    ).slice(0, 5);
                    setProducts(matches.map(p => ({
                        ...p,
                        image: p.image || p.primaryImage || '/placeholder.jpg',
                        retail_price: p.retailPrice
                    })));
                }
            } catch (err) {
                const { products: localProducts } = await import('@/lib/data');
                const matches = localProducts.filter(p =>
                    p.name.toLowerCase().includes(query.toLowerCase())
                ).slice(0, 5);
                setProducts(matches.map(p => ({
                    ...p,
                    image: p.image || p.primaryImage || '/placeholder.jpg',
                    retail_price: p.retailPrice
                })));
            }
        }

        const debounce = setTimeout(fetchSuggestions, 200);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleSelect = (target: string | any, type: 'product' | 'term') => {
        if (type === 'term') {
            onSelect(target);
            saveRecentSearch(target);
        } else {
            const { getProductUrl } = require('@/lib/slug');
            router.push(getProductUrl(target));
        }
    };

    const saveRecentSearch = (term: string) => {
        if (!term.trim()) return;
        const newRecent = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <span key={i} className="text-[#A67C35] font-black">{part}</span>
                : part
        );
    };

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-[#1E1E1E] border border-[#343434] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] mt-3 overflow-hidden z-[100]"
        >
            <div className="p-6">
                {query.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Recent Searches */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-[9px] font-bold text-[#A67C35] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <History size={13} className="text-[#A67C35]" /> Recent Searches
                                </h4>
                                {recentSearches.length > 0 && (
                                    <button onClick={clearRecentSearches} className="text-[8.5px] font-bold text-[#8E8E9A] hover:text-red-400 uppercase tracking-wider transition-colors">Clear All</button>
                                )}
                            </div>
                            {recentSearches.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {recentSearches.map(term => (
                                        <button
                                            key={term}
                                            onClick={() => handleSelect(term, 'term')}
                                            className="group flex items-center justify-between text-xs text-[#CFCFCF] hover:text-[#F8F3E8] bg-[#151515] hover:bg-[#242424] px-3.5 py-2.5 rounded-xl transition-all border border-[#343434] hover:border-[#A67C35]/50 text-left"
                                        >
                                            <span className="font-bold tracking-wide uppercase">{term}</span>
                                            <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#A67C35]" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs font-medium text-[#8E8E9A] italic">No recent searches</p>
                            )}
                        </div>

                        {/* Popular Categories */}
                        <div>
                            <h4 className="text-[9px] font-bold text-[#A67C35] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <TrendingUp size={13} className="text-[#A67C35]" /> Popular Categories
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                                {['Tweezers & Pliers', 'Casting Machinery', 'Automatic Gas Torches', 'Polishing Buffs', 'Rolling Mills', 'Gold Testing Kits'].map(term => (
                                    <button
                                        key={term}
                                        onClick={() => handleSelect(term, 'term')}
                                        className="group flex items-center gap-3 text-xs text-[#CFCFCF] hover:text-[#F8F3E8] bg-[#151515] hover:bg-[#242424] px-3.5 py-2.5 rounded-xl transition-all border border-[#343434] hover:border-[#A67C35]/50 text-left"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#A67C35]/40 group-hover:bg-[#A67C35] transition-colors" />
                                        <span className="font-bold tracking-wide uppercase">{term}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {products.length > 0 ? (
                            <>
                                <div className="flex justify-between items-center border-b border-[#343434] pb-3">
                                    <h4 className="text-[9px] font-bold text-[#8E8E9A] uppercase tracking-[0.2em]">Product Suggestions</h4>
                                    <span className="text-[8.5px] font-bold text-[#A67C35] bg-[#A67C35]/10 px-2 py-0.5 rounded border border-[#A67C35]/20 tracking-wider flex items-center gap-1">
                                        <Command size={10} /> Press Enter for All Results
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {products.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleSelect(p, 'product')}
                                            className="w-full flex items-center gap-4 px-3.5 py-3 bg-[#151515] hover:bg-[#242424] rounded-xl transition-all group text-left border border-[#343434] hover:border-[#A67C35]/50"
                                        >
                                            <div className="w-11 h-11 rounded-lg bg-[#1E1E1E] border border-[#343434] flex items-center justify-center overflow-hidden shrink-0 p-1">
                                                {p.image ? (
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-lighten" />
                                                ) : (
                                                    <Search size={16} className="text-[#8E8E9A] group-hover:text-[#A67C35] transition-colors" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-[#F8F3E8] group-hover:text-[#A67C35] font-bold tracking-wide uppercase truncate transition-colors">
                                                    {highlightMatch(p.name, query)}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[8.5px] font-bold text-[#8E8E9A] uppercase tracking-wider">{p.category}</span>
                                                    {p.retail_price && (
                                                        <>
                                                            <span className="text-[#343434]">•</span>
                                                            <span className="text-xs font-bold text-[#A67C35]">₹{p.retail_price.toLocaleString('en-IN')}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight size={14} className="text-[#8E8E9A] group-hover:text-[#A67C35] transition-all -translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="py-12 text-center flex flex-col items-center">
                                <div className="w-14 h-14 bg-[#151515] border border-[#343434] rounded-2xl flex items-center justify-center mb-4 text-[#8E8E9A]">
                                    <Package size={24} />
                                </div>
                                <h3 className="text-sm font-bold text-[#F8F3E8] uppercase tracking-wider mb-1">No products found</h3>
                                <p className="text-xs text-[#8E8E9A]">No items matching <span className="text-[#A67C35] font-bold">"{query}"</span> in our inventory.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="px-6 py-3 bg-[#151515] border-t border-[#343434] flex justify-between items-center text-[8.5px] font-mono font-bold text-[#8E8E9A] uppercase tracking-wider">
                <div className="flex items-center gap-4">
                    <span>Press Enter for all results</span>
                    <span>•</span>
                    <span>ESC to close</span>
                </div>
                <span className="text-[#A67C35]">Dinanath & Sons</span>
            </div>
        </motion.div>
    );
}

