
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ListFilter, X, Check, Search, Filter, SlidersHorizontal } from 'lucide-react';
<<<<<<< Updated upstream
=======
import { Currency } from '@/components/currency';
>>>>>>> Stashed changes

interface FilterSidebarProps {
    categories: string[];
    selectedCategories: string[];
    onCategoryChange: (category: string) => void;
    priceRange: number;
    setPriceRange: (range: number) => void;
    minPrice: number;
    setMinPrice: (range: number) => void;
    isRetail: boolean;
    className?: string;
    onMobileClose?: () => void;
}

export function FilterSidebar({
    categories,
    selectedCategories,
    onCategoryChange,
    priceRange,
    setPriceRange,
    minPrice,
    setMinPrice,
    isRetail,
    className,
    onMobileClose
}: FilterSidebarProps) {
    const [openSections, setOpenSections] = useState<string[]>(['categories', 'price']);

    const toggleSection = (section: string) => {
        setOpenSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    return (
        <div className={`bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden sticky top-32 ${className}`}>
            {/* Mobile Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/10 lg:hidden bg-[#111]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Filter size={20} className="text-amber-500" /> Filters
                </h3>
                <button onClick={onMobileClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                    <X size={18} />
                </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex flex-col p-6 border-b border-white/10 bg-[#111]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Filter size={20} className="text-amber-500" /> Filters
                </h3>
            </div>

            <div className="p-6 space-y-8">
                {/* Categories Section */}
                <div>
                    <button
                        onClick={() => toggleSection('categories')}
                        className="flex items-center justify-between w-full text-left mb-4 group"
                    >
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Categories</span>
                        <ChevronDown
                            size={16}
                            className={`text-gray-500 transition-transform duration-300 ${openSections.includes('categories') ? 'rotate-180' : ''}`}
                        />
                    </button>

                    <AnimatePresence>
                        {openSections.includes('categories') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-col gap-2 pt-1">
                                    {categories.map((cat) => {
                                        const isSelected = selectedCategories.includes(cat);
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => onCategoryChange(cat)}
                                                className={`flex items-center gap-3 w-full py-2 px-3 rounded-lg text-sm transition-all duration-200 ${isSelected
                                                    ? 'bg-amber-500/10 text-amber-500 font-semibold'
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded appearance-none border flex items-center justify-center ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-gray-500'}`}>
                                                    {isSelected && <Check size={12} className="text-black" />}
                                                </div>
                                                <span>{cat}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Price Range Section - Retail Only */}
                {isRetail && (
                    <div className="pt-6 border-t border-white/10">
                        <button
                            onClick={() => toggleSection('price')}
                            className="flex items-center justify-between w-full text-left mb-4 group"
                        >
                            <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Price Range</span>
                            <ChevronDown
                                size={16}
                                className={`text-gray-500 transition-transform duration-300 ${openSections.includes('price') ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {openSections.includes('price') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-6 pt-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500 mb-1">Min</span>
<<<<<<< Updated upstream
                                                <span className="font-semibold text-white">₹{minPrice.toLocaleString()}</span>
=======
                                                <span className="font-semibold text-white"><Currency value={minPrice} /></span>
>>>>>>> Stashed changes
                                            </div>
                                            <div className="w-4 h-[1px] bg-gray-600" />
                                            <div className="flex flex-col text-right">
                                                <span className="text-xs text-gray-500 mb-1">Max</span>
<<<<<<< Updated upstream
                                                <span className="font-semibold text-amber-500">₹{priceRange.toLocaleString()}</span>
=======
                                                <span className="font-semibold text-amber-500"><Currency value={priceRange} /></span>
>>>>>>> Stashed changes
                                            </div>
                                        </div>

                                        <div className="space-y-5">
<<<<<<< Updated upstream
                                            <div className="relative">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="50000"
=======
                                            <div className="relative h-4 mt-2 mb-4 flex items-center">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="500000"
>>>>>>> Stashed changes
                                                    step="1000"
                                                    value={minPrice}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (val <= priceRange) setMinPrice(val);
                                                    }}
<<<<<<< Updated upstream
                                                    className="w-full accent-amber-500 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
                                                />
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100000"
=======
                                                    className="absolute w-full accent-amber-500 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                                                    style={{ zIndex: minPrice > priceRange - 1000 ? 5 : 3 }}
                                                />
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="500000"
>>>>>>> Stashed changes
                                                    step="1000"
                                                    value={priceRange}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        if (val >= minPrice) setPriceRange(val);
                                                    }}
<<<<<<< Updated upstream
                                                    className="w-full accent-amber-500 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
=======
                                                    className="absolute w-full accent-amber-500 h-1 bg-transparent rounded-full appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                                                    style={{ zIndex: 4 }}
>>>>>>> Stashed changes
                                                />
                                            </div>
                                        </div>

                                        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                Wholesale (B2B) orders bypass these limitations and are based on MOQ.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
