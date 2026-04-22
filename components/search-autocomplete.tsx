
'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, History, X, Command, ArrowRight } from 'lucide-react';
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
            const { data } = await supabase
                .from('products')
                .select('id, name, category, image')
                .ilike('name', `%${query}%`)
                .limit(4);

            if (data && data.length > 0) {
                setProducts(data);
            } else {
                import('@/lib/data').then((module) => {
                    const matches = module.products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
                    setProducts(matches.map(p => ({
                        id: p.id,
                        name: p.name,
                        category: p.category,
                        image: p.image || p.primaryImage
                    })));
                });
            }
        }

        const debounce = setTimeout(fetchSuggestions, 200);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleSelect = (term: string, type: 'product' | 'term') => {
        if (type === 'term') {
            onSelect(term);
            saveRecentSearch(term);
        } else {
            router.push(`/shop/${term}`);
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
                ? <span key={i} className="text-amber-500 font-black">{part}</span>
                : part
        );
    };

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="absolute top-full left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] mt-4 overflow-hidden z-[100] animate-in fade-in duration-300"
        >
            <div className="p-8">
                {query.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Recent Activity */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <History size={14} className="text-amber-500" /> Recent Inquiries
                                </h4>
                                {recentSearches.length > 0 && (
                                    <button onClick={clearRecentSearches} className="text-[9px] font-bold text-red-500/60 hover:text-red-500 uppercase tracking-tighter">Discard All</button>
                                )}
                            </div>
                            {recentSearches.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {recentSearches.map(term => (
                                        <button
                                            key={term}
                                            onClick={() => handleSelect(term, 'term')}
                                            className="group flex items-center justify-between text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl transition-all border border-transparent hover:border-white/5"
                                        >
                                            <span className="font-bold tracking-tight">{term}</span>
                                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-amber-500" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs font-medium text-gray-700 italic">No historical data found.</p>
                            )}
                        </div>

                        {/* Trending Categories */}
                        <div>
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <TrendingUp size={14} className="text-amber-500" /> Global Trends
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                                {['Ultrasonic Hardware', 'Laser Induction', 'Rolling Mills', 'Precision Scales'].map(term => (
                                    <button
                                        key={term}
                                        onClick={() => handleSelect(term, 'term')}
                                        className="group flex items-center gap-3 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl transition-all border border-transparent hover:border-white/5"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors" />
                                        <span className="font-bold tracking-tight">{term}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {products.length > 0 ? (
                            <>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Hardware Catalog Suggestions</h4>
                                    <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded tracking-tighter flex items-center gap-1"> <Command size={10} /> ENTER TO SCAN </span>
                                </div>
                                <div className="grid grid-cols-1 gap-1">
                                    {products.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleSelect(p.id, 'product')}
                                            className="w-full flex items-center gap-6 px-4 py-4 hover:bg-white/5 rounded-2xl transition-all group text-left border border-transparent hover:border-white/5"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center overflow-hidden">
                                                {p.image ? (
                                                    <img src={p.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <Search size={20} className="text-gray-600 group-hover:text-amber-500 transition-colors" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-base text-gray-300 group-hover:text-white font-black tracking-tight uppercase">
                                                    {highlightMatch(p.name, query)}
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">{p.category} • Precision ID: {p.id.slice(0, 8)}</div>
                                            </div>
                                            <ArrowRight size={20} className="text-gray-800 group-hover:text-amber-500 transition-all -translate-x-4 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="py-20 text-center flex flex-col items-center">
                                <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Search size={32} className="text-gray-800" />
                                </div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Null Sector Detected</h3>
                                <p className="text-gray-500 font-medium">No machinery match for <span className="text-amber-500 font-bold">"{query}"</span> in the current catalog.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="px-8 py-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-gray-600 uppercase"> <div className="w-1 h-1 rounded-full bg-gray-600" /> Press ↑↓ to navigate </span>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-gray-600 uppercase"> <div className="w-1 h-1 rounded-full bg-gray-600" /> Esc to close </span>
                </div>
                <span className="text-[9px] font-black text-amber-500/40 uppercase tracking-[0.2em]">Dinanath Intelligence Core v4.0</span>
            </div>
        </motion.div>
    );
}

