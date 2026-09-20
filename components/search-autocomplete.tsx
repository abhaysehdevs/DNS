'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, History, Command, ArrowRight, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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
                ? <span key={i} className="text-[#966E2E] font-bold">{part}</span>
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
            className="absolute top-full left-0 right-0 bg-white border border-[#E8E2D5] rounded-2xl shadow-2xl mt-2 sm:mt-3 overflow-hidden z-[100] max-h-[72vh] sm:max-h-[520px] flex flex-col text-left"
        >
            <div className="p-3 sm:p-5 md:p-6 overflow-y-auto overscroll-contain flex-1">
                {query.length === 0 ? (
                    <div className="flex flex-col md:grid md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Recent Searches */}
                        <div>
                            <div className="flex justify-between items-center mb-2.5 sm:mb-3">
                                <h4 className="text-[8.5px] sm:text-[9px] font-bold text-[#966E2E] uppercase tracking-[0.2em] flex items-center gap-1.5">
                                    <History size={12} className="text-[#966E2E]" /> Recent Searches
                                </h4>
                                {recentSearches.length > 0 && (
                                    <button onClick={clearRecentSearches} className="text-[8px] sm:text-[8.5px] font-bold text-[#71717A] hover:text-red-500 uppercase tracking-wider transition-colors">Clear</button>
                                )}
                            </div>
                            {recentSearches.length > 0 ? (
                                <div className="flex flex-wrap sm:flex-col gap-1.5 sm:gap-2">
                                    {recentSearches.slice(0, 4).map(term => (
                                        <button
                                            key={term}
                                            onClick={() => handleSelect(term, 'term')}
                                            className="group inline-flex sm:flex items-center justify-between text-[11px] sm:text-xs text-[#18181B] hover:text-[#966E2E] bg-[#FAF9F5] hover:bg-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition-all border border-[#E8E2D5] hover:border-[#966E2E]/50 text-left shadow-xs"
                                        >
                                            <span className="font-bold tracking-wide uppercase truncate">{term}</span>
                                            <ArrowRight size={12} className="hidden sm:inline-block opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#966E2E]" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[11px] sm:text-xs font-normal text-[#71717A] italic">No recent searches</p>
                            )}
                        </div>

                        {/* Popular Categories */}
                        <div>
                            <h4 className="text-[8.5px] sm:text-[9px] font-bold text-[#966E2E] uppercase tracking-[0.2em] mb-2.5 sm:mb-3 flex items-center gap-1.5">
                                <TrendingUp size={12} className="text-[#966E2E]" /> Popular Categories
                            </h4>
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                                {['Tweezers & Pliers', 'Casting Machinery', 'Automatic Gas Torches', 'Polishing Buffs', 'Rolling Mills', 'Gold Testing Kits'].map(term => (
                                    <button
                                        key={term}
                                        onClick={() => handleSelect(term, 'term')}
                                        className="group flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[#18181B] hover:text-[#966E2E] bg-[#FAF9F5] hover:bg-white px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl transition-all border border-[#E8E2D5] hover:border-[#966E2E]/50 text-left shadow-xs"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#966E2E]/40 group-hover:bg-[#966E2E] shrink-0 transition-colors" />
                                        <span className="font-bold tracking-wide uppercase truncate">{term}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {products.length > 0 ? (
                            <>
                                <div className="flex justify-between items-center border-b border-[#E8E2D5] pb-2">
                                    <h4 className="text-[8.5px] font-bold text-[#71717A] uppercase tracking-[0.2em]">Product Suggestions</h4>
                                    <span className="text-[8px] font-bold text-[#966E2E] bg-[#966E2E]/10 px-2 py-0.5 rounded border border-[#966E2E]/20 tracking-wider flex items-center gap-1">
                                        <Command size={9} /> Press Enter for All
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                                    {products.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleSelect(p, 'product')}
                                            className="w-full flex items-center gap-2.5 sm:gap-3.5 px-2.5 py-2 sm:px-3.5 sm:py-2.5 bg-[#FAF9F5] hover:bg-white rounded-xl transition-all group text-left border border-[#E8E2D5] hover:border-[#966E2E]/50 shadow-xs"
                                        >
                                            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-white border border-[#E8E2D5] flex items-center justify-center overflow-hidden shrink-0 p-1">
                                                {p.image ? (
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <Search size={14} className="text-[#71717A] group-hover:text-[#966E2E] transition-colors" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] sm:text-xs text-[#18181B] group-hover:text-[#966E2E] font-bold tracking-wide uppercase truncate transition-colors">
                                                    {highlightMatch(p.name, query)}
                                                </div>
                                                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                                                    <span className="text-[8px] sm:text-[8.5px] font-bold text-[#71717A] uppercase tracking-wider">{p.category}</span>
                                                    {p.retail_price && (
                                                        <>
                                                            <span className="text-[#E8E2D5]">•</span>
                                                            <span className="text-[11px] sm:text-xs font-bold text-[#966E2E]">₹{p.retail_price.toLocaleString('en-IN')}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <ArrowRight size={13} className="text-[#71717A] group-hover:text-[#966E2E] transition-all -translate-x-1 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center flex flex-col items-center">
                                <div className="w-10 h-10 bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl flex items-center justify-center mb-2 text-[#71717A]">
                                    <Package size={18} />
                                </div>
                                <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider mb-0.5">No products found</h3>
                                <p className="text-[11px] text-[#71717A]">No items matching <span className="text-[#966E2E] font-bold">"{query}"</span> in our inventory.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="px-3.5 sm:px-6 py-2 sm:py-2.5 bg-[#FAF9F5] border-t border-[#E8E2D5] flex justify-between items-center text-[8px] sm:text-[8.5px] font-mono font-bold text-[#71717A] uppercase tracking-wider">
                <div className="flex items-center gap-2 sm:gap-4">
                    <span>Press Enter for all results</span>
                </div>
                <span className="text-[#966E2E]">Dinanath & Sons</span>
            </div>
        </motion.div>
    );
}
