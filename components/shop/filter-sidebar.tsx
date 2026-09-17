'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, Check, Filter, RotateCcw, 
    Sliders, Compass, Wrench, Package, Droplets, Award, Flame, Tag, LayoutGrid,
    CheckCircle2, ArrowUpDown
} from 'lucide-react';
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
    inStockOnly?: boolean;
    setInStockOnly?: (val: boolean) => void;
    sortBy?: string;
    setSortBy?: (val: string) => void;
    totalProductsCount?: number;
    onResetAll?: () => void;
    isMobileDrawer?: boolean;
}

const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
        case 'all': return LayoutGrid;
        case 'tools':
        case 'hand tools': return Sliders;
        case 'machinery':
        case 'machines': return Compass;
        case 'consumables':
        case 'polishing': return Wrench;
        case 'packaging':
        case 'display': return Package;
        case 'chemicals':
        case 'flux': return Droplets;
        case 'bullion': return Award;
        case 'casting & metallurgy':
        case 'casting': return Flame;
        default: return Tag;
    }
};

const getCategoryDisplayName = (cat: string) => {
    switch (cat.toLowerCase()) {
        case 'all': return 'All Items';
        case 'tools': return 'Hand Tools';
        case 'machinery': return 'Machinery';
        case 'consumables': return 'Polishing & Buffs';
        case 'packaging': return 'Packaging & Cards';
        case 'chemicals': return 'Cleaning & Flux';
        case 'bullion': return 'Certified Bullion';
        case 'casting & metallurgy': return 'Casting';
        default: return cat;
    }
};

const PRICE_PRESETS = [
    { label: 'All', min: 0, max: 500000 },
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 - ₹2,000', min: 500, max: 2000 },
    { label: '₹2,000 - ₹10,000', min: 2000, max: 10000 },
    { label: '₹10,000+', min: 10000, max: 500000 },
];

export function FilterSidebar({
    categories,
    selectedCategories,
    onCategoryChange,
    priceRange,
    setPriceRange,
    minPrice,
    setMinPrice,
    isRetail,
    className = '',
    onMobileClose,
    inStockOnly = false,
    setInStockOnly,
    sortBy = 'featured',
    setSortBy,
    totalProductsCount,
    onResetAll,
    isMobileDrawer = false
}: FilterSidebarProps) {
    const [openSections, setOpenSections] = useState<string[]>(['categories', 'stock', 'price', 'sort']);

    const toggleSection = (section: string) => {
        setOpenSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const hasActiveFilters = (selectedCategories[0] && selectedCategories[0] !== 'All') ||
        minPrice > 0 ||
        priceRange < 500000 ||
        inStockOnly;

    return (
        <div className={`flex flex-col text-left ${className}`}>
            {/* Desktop Header */}
            {!isMobileDrawer && (
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E8E2D5]">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#966E2E]/10 border border-[#966E2E]/25 flex items-center justify-center text-[#966E2E]">
                            <Filter size={13} />
                        </div>
                        <h3 className="text-xs font-bold text-[#18181B] uppercase tracking-wider">
                            Filter Options
                        </h3>
                    </div>
                    {hasActiveFilters && onResetAll && (
                        <button
                            onClick={onResetAll}
                            className="flex items-center gap-1 text-[9px] font-bold text-[#966E2E] hover:text-[#7D5A25] transition-colors uppercase tracking-wider cursor-pointer"
                        >
                            <RotateCcw size={10} /> Reset
                        </button>
                    )}
                </div>
            )}

            <div className="space-y-4">
                
                {/* 1. Availability Filter (In Stock Only) */}
                <div className="bg-white border border-[#E8E2D5] rounded-xl p-3 shadow-xs">
                    <button
                        onClick={() => toggleSection('stock')}
                        className="flex items-center justify-between w-full text-left cursor-pointer"
                    >
                        <span className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-[#966E2E]" /> Stock Availability
                        </span>
                        <ChevronDown
                            size={14}
                            className={`text-[#71717A] transition-transform duration-300 ${openSections.includes('stock') ? 'rotate-180' : ''}`}
                        />
                    </button>

                    <AnimatePresence>
                        {openSections.includes('stock') && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-3 flex flex-col gap-2">
                                    <button
                                        onClick={() => setInStockOnly && setInStockOnly(false)}
                                        className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            !inStockOnly
                                                ? 'bg-[#966E2E]/10 border border-[#966E2E] text-[#966E2E]'
                                                : 'bg-[#FAF9F5] border border-[#E8E2D5] text-[#71717A] hover:text-[#18181B]'
                                        }`}
                                    >
                                        <span>All Inventory</span>
                                        {!inStockOnly && <Check size={13} className="text-[#966E2E]" />}
                                    </button>

                                    <button
                                        onClick={() => setInStockOnly && setInStockOnly(true)}
                                        className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                            inStockOnly
                                                ? 'bg-[#966E2E]/10 border border-[#966E2E] text-[#966E2E]'
                                                : 'bg-[#FAF9F5] border border-[#E8E2D5] text-[#71717A] hover:text-[#18181B]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>Ready to Ship (In Stock)</span>
                                        </div>
                                        {inStockOnly && <Check size={13} className="text-[#966E2E]" />}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. Categories Filter */}
                <div className="bg-white border border-[#E8E2D5] rounded-xl p-3 shadow-xs">
                    <button
                        onClick={() => toggleSection('categories')}
                        className="flex items-center justify-between w-full text-left cursor-pointer"
                    >
                        <span className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-1.5">
                            <Tag size={13} className="text-[#966E2E]" /> Catalog Categories
                        </span>
                        <ChevronDown
                            size={14}
                            className={`text-[#71717A] transition-transform duration-300 ${openSections.includes('categories') ? 'rotate-180' : ''}`}
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
                                <div className="flex flex-col gap-1 pt-2.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                                    {categories.map((cat) => {
                                        const isSelected = selectedCategories.includes(cat);
                                        const Icon = getCategoryIcon(cat);
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => onCategoryChange(cat)}
                                                className={`flex items-center justify-between w-full py-2 px-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#966E2E] text-white font-bold shadow-xs'
                                                        : 'text-[#52525B] hover:bg-[#FAF9F5] hover:text-[#18181B]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Icon size={13} className={isSelected ? 'text-white' : 'text-[#966E2E]'} />
                                                    <span className="truncate">{getCategoryDisplayName(cat)}</span>
                                                </div>
                                                {isSelected && <Check size={12} className="text-white shrink-0 ml-1" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. Price Range Section (Retail Only) */}
                {isRetail && (
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3 shadow-xs">
                        <button
                            onClick={() => toggleSection('price')}
                            className="flex items-center justify-between w-full text-left cursor-pointer"
                        >
                            <span className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
                                Budget Range (₹)
                            </span>
                            <ChevronDown
                                size={14}
                                className={`text-[#71717A] transition-transform duration-300 ${openSections.includes('price') ? 'rotate-180' : ''}`}
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
                                    <div className="pt-3 space-y-3">
                                        {/* Quick Presets */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {PRICE_PRESETS.map((preset, idx) => {
                                                const isActive = minPrice === preset.min && priceRange === preset.max;
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            setMinPrice(preset.min);
                                                            setPriceRange(preset.max);
                                                        }}
                                                        className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                                            isActive
                                                                ? 'bg-[#966E2E] text-white shadow-xs'
                                                                : 'bg-[#FAF9F5] text-[#71717A] hover:text-[#18181B] border border-[#E8E2D5]'
                                                        }`}
                                                    >
                                                        {preset.label}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Range Indicator */}
                                        <div className="flex items-center justify-between text-xs pt-1">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-[#71717A] uppercase tracking-wider">Min</span>
                                                <span className="font-bold text-[#18181B]"><Currency value={minPrice} /></span>
                                            </div>
                                            <div className="w-4 h-px bg-[#E8E2D5]" />
                                            <div className="flex flex-col text-right">
                                                <span className="text-[8px] text-[#71717A] uppercase tracking-wider">Max</span>
                                                <span className="font-bold text-[#966E2E]"><Currency value={priceRange} /></span>
                                            </div>
                                        </div>

                                        {/* Range Sliders */}
                                        <div className="relative h-4 flex items-center">
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="500000" 
                                                step="500" 
                                                value={minPrice}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val <= priceRange) setMinPrice(val);
                                                }}
                                                className="absolute w-full accent-[#966E2E] h-1 bg-[#E8E2D5] rounded-full appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                                                style={{ zIndex: minPrice > priceRange - 500 ? 5 : 3 }}
                                            />
                                            <input 
                                                type="range" 
                                                min="0" 
                                                max="500000" 
                                                step="500" 
                                                value={priceRange}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val >= minPrice) setPriceRange(val);
                                                }}
                                                className="absolute w-full accent-[#966E2E] h-1 bg-transparent rounded-full appearance-none cursor-pointer pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
                                                style={{ zIndex: 4 }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* 4. Sort Order Filter */}
                {setSortBy && (
                    <div className="bg-white border border-[#E8E2D5] rounded-xl p-3 shadow-xs">
                        <button
                            onClick={() => toggleSection('sort')}
                            className="flex items-center justify-between w-full text-left cursor-pointer"
                        >
                            <span className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-1.5">
                                <ArrowUpDown size={13} className="text-[#966E2E]" /> Sorting Sequence
                            </span>
                            <ChevronDown
                                size={14}
                                className={`text-[#71717A] transition-transform duration-300 ${openSections.includes('sort') ? 'rotate-180' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {openSections.includes('sort') && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-2.5 flex flex-col gap-1">
                                        {[
                                            { id: 'featured', label: 'Featured Workshop Units' },
                                            { id: 'priceAsc', label: 'Price: Low to High' },
                                            { id: 'priceDesc', label: 'Price: High to Low' },
                                            { id: 'nameAsc', label: 'Name: A to Z' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSortBy(opt.id)}
                                                className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                                                    sortBy === opt.id
                                                        ? 'bg-[#966E2E]/10 text-[#966E2E] font-bold'
                                                        : 'text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF9F5]'
                                                }`}
                                            >
                                                <span>{opt.label}</span>
                                                {sortBy === opt.id && <Check size={12} className="text-[#966E2E]" />}
                                            </button>
                                        ))}
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
