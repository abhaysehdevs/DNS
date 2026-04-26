'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import {
    Search, X, LayoutGrid, List,
    ChevronRight, Settings2, ChevronDown, Sparkles
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PersonalizedRecommendations } from '@/components/personalized-grid';
import { SearchAutocomplete } from '@/components/search-autocomplete';
import { FilterSidebar } from '@/components/shop/filter-sidebar';
import { ProductGrid } from '@/components/shop/product-grid';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';

function ShopContent() {
    const { mode, language } = useAppStore();
    const t = translations[language];
    const isRetail = mode === 'retail';
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialCategory = searchParams.get('cat') || 'All';

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>(['All']);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [priceRange, setPriceRange] = useState(500000);
    const [minPrice, setMinPrice] = useState(0);
    const [sortBy, setSortBy] = useState('featured');

    // UI State
    const [showFilters, setShowFilters] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

    const searchContainerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();
    const headerY = useTransform(scrollY, [0, 200], [0, -20]);

    // Initial Data Fetch
    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const { data } = await supabase.from('products').select('*');

                if (data && data.length > 0) {
                    const mappedProducts: Product[] = data.map((p: any) => {
                        const image = p.image || p.image_url || '/placeholder.jpg';
                        return {
                            id: p.id,
                            name: p.name,
                            description: p.description,
                            retailPrice: p.retail_price,
                            wholesalePrice: p.wholesale_price,
                            wholesaleMOQ: p.wholesale_moq,
                            image: image,
                            primaryImage: image,
                            gallery: (p.gallery && p.gallery.length > 0) ? p.gallery : [{ id: '1', type: 'image', url: image }],
                            category: p.category,
                            inStock: p.in_stock,
                            reviews: p.reviews || []
                        };
                    });

                    const uniqueCats = ['All', ...Array.from(new Set(mappedProducts.map(p => p.category)))];
                    setCategories(uniqueCats);
                    setProducts(mappedProducts);
                } else {
                    setCategories(['All']);
                    setProducts([]);
                }
            } catch (err) {
                console.error("Fetch failed", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    useEffect(() => {
        const cat = searchParams.get('cat');
        if (cat) setSelectedCategory(cat);
        else setSelectedCategory('All');
    }, [searchParams]);

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        router.push(cat === 'All' ? '/shop' : `/shop?cat=${cat}`, { scroll: false });
        setShowFilters(false);
    };

    const handleSearchSelect = (term: string) => {
        setSearchQuery(term);
        setIsSearchFocused(false);
    };

    const handleClearFilters = () => {
        setSelectedCategory('All');
        setSearchQuery('');
        setPriceRange(500000);
        setMinPrice(0);
        router.push('/shop', { scroll: false });
    };

    const filteredProducts = products
        .filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesPrice = isRetail ? (product.retailPrice <= priceRange && product.retailPrice >= minPrice) : true;
            return matchesSearch && matchesCategory && matchesPrice;
        })
        .sort((a, b) => {
            if (sortBy === 'priceAsc') {
                const priceA = isRetail ? a.retailPrice : (a.wholesalePrice ?? 0);
                const priceB = isRetail ? b.retailPrice : (b.wholesalePrice ?? 0);
                return priceA - priceB;
            } else if (sortBy === 'priceDesc') {
                const priceA = isRetail ? a.retailPrice : (a.wholesalePrice ?? 0);
                const priceB = isRetail ? b.retailPrice : (b.wholesalePrice ?? 0);
                return priceB - priceA;
            } else if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
            return 0;
        });

    return (
        <div className="min-h-screen bg-[#FFFFFF] text-[#1D1D1F] pt-40 md:pt-60 pb-24 noise-overlay selection:bg-[#C9A84C]/30 overflow-x-hidden">
            
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                
                {/* Header Section */}
                <motion.div style={{ y: headerY }} className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A5A6A] hover:text-[#C9A84C] transition-colors">Home</Link>
                        <ChevronRight size={12} className="text-[#3A3A4A]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C9A84C]">Technical Inventory</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm"
                            >
                                <Sparkles size={12} className="animate-pulse" /> Global Standard Equipment
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] uppercase text-[#1D1D1F]">
                                Our <span style={{ background: 'linear-gradient(135deg, #1D1D1F, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Collection</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className={`px-5 py-2 rounded-2xl glass border border-black/[0.04] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-sm ${isRetail ? 'text-[#C9A84C]' : 'text-blue-600'}`}>
                                <div className={`w-2 h-2 rounded-full animate-pulse ${isRetail ? 'bg-[#C9A84C]' : 'bg-blue-600'}`} />
                                {isRetail ? 'Retail Shop' : 'Wholesale Shop'}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    
                    {/* Left Sidebar */}
                    <aside className="hidden lg:block w-[320px] shrink-0">
                        <div className="sticky top-40 space-y-8">
                            <FilterSidebar
                                categories={categories}
                                selectedCategories={[selectedCategory]}
                                onCategoryChange={handleCategoryChange}
                                priceRange={priceRange}
                                setPriceRange={setPriceRange}
                                minPrice={minPrice}
                                setMinPrice={setMinPrice}
                                isRetail={isRetail}
                            />

                            {/* Additional Info Block */}
                            <div className="glass-strong rounded-3xl p-8 relative overflow-hidden shadow-xl">
                                <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#C9A84C]/10 rounded-full blur-2xl" />
                                <h4 className="text-sm font-black text-[#1D1D1F] mb-4 uppercase tracking-[0.1em]">Factory Direct</h4>
                                <p className="text-xs text-[#6E6E73] leading-relaxed mb-6 font-medium">
                                    All machinery is certified for high-precision manufacturing. Contact our technical team for custom factory layouts.
                                </p>
                                <button className="text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.2em] flex items-center gap-2 group">
                                    Technical Specs <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        
                        {/* Search & Sort Bar */}
                        <div className="mb-12">
                            <div className="flex flex-col md:flex-row gap-4 items-center glass-strong p-3 rounded-[2rem] border border-black/[0.04] shadow-2xl relative z-50 bg-white/80">
                                
                                {/* Refined Search */}
                                <div className="flex-1 relative w-full" ref={searchContainerRef}>
                                    <div className="relative h-14 flex items-center">
                                        <Search className={`absolute left-6 transition-all duration-500 ${isSearchFocused ? 'text-[#C9A84C] scale-110' : 'text-[#86868B]'}`} size={20} />
                                        <input
                                            type="text"
                                            placeholder="Query inventory (e.g. Casting, Polishing, Pliers)..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onFocus={() => setIsSearchFocused(true)}
                                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                            className="w-full h-full bg-transparent pl-16 pr-12 text-sm font-black placeholder-[#86868B] text-[#1D1D1F] focus:outline-none transition-all"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-6 w-8 h-8 rounded-full glass flex items-center justify-center text-[#86868B] hover:text-[#1D1D1F] transition-all"
                                            > <X size={14} /> </button>
                                        )}
                                    </div>
                                    <SearchAutocomplete
                                        query={searchQuery}
                                        onSelect={handleSearchSelect}
                                        isVisible={isSearchFocused}
                                    />
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-3 w-full md:w-auto md:pl-4 md:border-l border-black/[0.04]">
                                    {/* Mobile Toggle */}
                                    <button
                                        onClick={() => setShowFilters(true)}
                                        className="lg:hidden flex-1 h-14 px-6 glass-gold text-[#0A0A0F] rounded-2xl font-black text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-3 uppercase shadow-lg"
                                        style={{ background: 'linear-gradient(135deg, #E8D48B, #C9A84C)' }}
                                    >
                                        <Settings2 size={16} /> Filters
                                    </button>

                                    {/* View Toggles */}
                                    <div className="hidden md:flex items-center glass rounded-2xl p-1.5 border border-black/[0.04]">
                                        <button
                                            onClick={() => setDisplayMode('grid')}
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${displayMode === 'grid' ? 'glass-gold text-[#C9A84C] shadow-lg' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
                                        > <LayoutGrid size={18} /> </button>
                                        <button
                                            onClick={() => setDisplayMode('list')}
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${displayMode === 'list' ? 'glass-gold text-[#C9A84C] shadow-lg' : 'text-[#86868B] hover:text-[#1D1D1F]'}`}
                                        > <List size={18} /> </button>
                                    </div>

                                    {/* Sort Custom Select */}
                                    <div className="relative min-w-[180px] h-14 flex items-center glass rounded-2xl px-6 border border-black/[0.04] bg-white">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full bg-transparent text-[10px] font-black uppercase tracking-[0.15em] text-[#1D1D1F] appearance-none cursor-pointer outline-none"
                                        >
                                            <option value="featured" className="bg-white text-[#1D1D1F]">Featured</option>
                                            <option value="priceAsc" className="bg-white text-[#1D1D1F]">Price: ASC</option>
                                            <option value="priceDesc" className="bg-white text-[#1D1D1F]">Price: DESC</option>
                                            <option value="nameAsc" className="bg-white text-[#1D1D1F]">Name: A-Z</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-6 text-[#86868B] pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Line */}
                        <div className="flex items-center justify-between mb-10 px-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#86868B]">
                                Results Found: <span className="text-[#1D1D1F] ml-2">{filteredProducts.length} Items</span>
                                {selectedCategory !== 'All' && <span className="ml-4">Category: <span className="text-[#C9A84C]">{selectedCategory}</span></span>}
                            </span>
                        </div>

                        {/* Grid */}
                        <div className="relative pb-24">
                            <ProductGrid
                                products={filteredProducts}
                                loading={loading}
                                onClearFilters={handleClearFilters}
                                displayMode={displayMode}
                            />
                        </div>

                        {/* Deep Content */}
                        {selectedCategory === 'All' && !searchQuery && !loading && (
                            <div className="mt-20 pt-20 border-t border-white/[0.04]">
                                <PersonalizedRecommendations />
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filter Layer */}
            <AnimatePresence>
                {showFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFilters(false)}
                            className="fixed inset-0 bg-[#06060C]/90 backdrop-blur-2xl z-[200]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 35, stiffness: 400 }}
                            className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#0A0A0F] border-l border-white/[0.06] z-[210] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col pt-24"
                        >
                            <div className="p-8 flex items-center justify-between border-b border-white/[0.04]">
                                <h3 className="text-2xl font-black text-[#F5F5F7] uppercase tracking-tight">Parameters</h3>
                                <button onClick={() => setShowFilters(false)} className="w-12 h-12 rounded-full glass flex items-center justify-center text-[#5A5A6A] hover:text-[#F5F5F7] transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                                <FilterSidebar
                                    categories={categories}
                                    selectedCategories={[selectedCategory]}
                                    onCategoryChange={handleCategoryChange}
                                    priceRange={priceRange}
                                    setPriceRange={setPriceRange}
                                    minPrice={minPrice}
                                    setMinPrice={setMinPrice}
                                    isRetail={isRetail}
                                    className="bg-transparent border-none shadow-none"
                                />
                            </div>
                            <div className="p-8 glass border-t border-white/[0.04]">
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="w-full h-16 glass-gold text-[#C9A84C] font-black rounded-[1.5rem] hover:bg-[#C9A84C]/10 transition-all shadow-xl uppercase tracking-[0.2em] text-[10px]"
                                >
                                    Confirm Configuration
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/10 border-t-[#C9A84C] animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">Accessing Inventory</span>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
