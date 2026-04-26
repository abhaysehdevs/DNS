
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Check, Filter } from 'lucide-react';
import { Currency } from '@/components/currency';

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
        <div className={`glass rounded-2xl overflow-hidden sticky top-32 ${className}`}>
            {/* Mobile Header */}
            <div className="flex justify-between items-center p-4 lg:hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(18,18,26,0.8)' }}>
                <h3 className="text-lg font-bold text-[#F5F5F7] flex items-center gap-2">
                    <Filter size={20} className="text-[#C9A84C]" /> Filters
                </h3>
                <button onClick={onMobileClose} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[#5A5A6A] hover:text-[#F5F5F7] transition-all">
                    <X size={18} />
                </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:flex flex-col p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(18,18,26,0.8)' }}>
                <h3 className="text-lg font-bold text-[#F5F5F7] flex items-center gap-2">
                    <Filter size={20} className="text-[#C9A84C]" /> Filters
                </h3>
            </div>

            <div className="p-6 space-y-8">
                {/* Categories Section */}
                <div>
                    <button
                        onClick={() => toggleSection('categories')}
                        className="flex items-center justify-between w-full text-left mb-4 group"
                    >
                        <span className="text-sm font-bold text-[#8E8E9A] group-hover:text-[#F5F5F7] transition-colors">Categories</span>
                        <ChevronDown
                            size={16}
                            className={`text-[#5A5A6A] transition-transform duration-300 ${openSections.includes('categories') ? 'rotate-180' : ''}`}
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
                                <div className="flex flex-col gap-1.5 pt-1">
                                    {categories.map((cat) => {
                                        const isSelected = selectedCategories.includes(cat);
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => onCategoryChange(cat)}
                                                className={`flex items-center gap-3 w-full py-2.5 px-3 rounded-xl text-sm transition-all duration-300 ${isSelected
                                                    ? 'text-[#C9A84C] font-semibold'
                                                    : 'text-[#5A5A6A] hover:text-[#8E8E9A]'
                                                    }`}
                                                style={isSelected ? { background: 'rgba(201,168,76,0.06)' } : {}}
                                            >
                                                <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${isSelected ? 'border-[#C9A84C]' : 'border-[#3A3A4A]'}`}
                                                    style={{
                                                        border: `1.5px solid ${isSelected ? '#C9A84C' : '#3A3A4A'}`,
                                                        background: isSelected ? 'linear-gradient(135deg, #C9A84C, #8B6914)' : 'transparent'
                                                    }}>
                                                    {isSelected && <Check size={10} className="text-[#0A0A0F]" />}
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
                    <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <button
                            onClick={() => toggleSection('price')}
                            className="flex items-center justify-between w-full text-left mb-4 group"
                        >
                            <span className="text-sm font-bold text-[#8E8E9A] group-hover:text-[#F5F5F7] transition-colors">Price Range</span>
                            <ChevronDown
                                size={16}
                                className={`text-[#5A5A6A] transition-transform duration-300 ${openSections.includes('price') ? 'rotate-180' : ''}`}
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
                                                <span className="text-[10px] text-[#3A3A4A] mb-1 uppercase tracking-wider font-semibold">Min</span>
                                                <span className="font-semibold text-[#F5F5F7]"><Currency value={minPrice} /></span>
                                            </div>
                                            <div className="w-4 h-[1px] bg-[#222230]" />
                                            <div className="flex flex-col text-right">
                                                <span className="text-[10px] text-[#3A3A4A] mb-1 uppercase tracking-wider font-semibold">Max</span>
                                                <span className="font-semibold text-[#C9A84C]"><Currency value={priceRange} /></span>
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="relative h-4 mt-2 mb-4 flex items-center">
                                                <input type="range" min="0" max="500000" step="1000" value={minPrice}
                                                    onChange={(e) => { const val = Number(e.target.value); if (val <= priceRange) setMinPrice(val); }}
                                                    className="absolute w-full accent-[#C9A84C] h-1 bg-[#222230] rounded-full appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                                                    style={{ zIndex: minPrice > priceRange - 1000 ? 5 : 3 }}
                                                />
                                                <input type="range" min="0" max="500000" step="1000" value={priceRange}
                                                    onChange={(e) => { const val = Number(e.target.value); if (val >= minPrice) setPriceRange(val); }}
                                                    className="absolute w-full accent-[#C9A84C] h-1 bg-transparent rounded-full appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                                                    style={{ zIndex: 4 }}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-3 glass rounded-xl">
                                            <p className="text-xs text-[#5A5A6A] leading-relaxed">
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
