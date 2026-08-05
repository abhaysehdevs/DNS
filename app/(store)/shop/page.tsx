'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import {
    Search, X, LayoutGrid, List,
    ChevronRight, Settings2, ChevronDown, Sparkles, Loader2
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
    const initialSearch = searchParams.get('search') || searchParams.get('q') || '';

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>(['All']);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState(initialSearch);
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
                    import('@/lib/data').then((module) => {
                        const localProducts = module.products;
                        const uniqueCats = ['All', ...Array.from(new Set(localProducts.map(p => p.category)))];
                        setCategories(uniqueCats);
                        setProducts(localProducts);
                    });
                }
            } catch (err) {
                console.error("Fetch failed, loading fallbacks", err);
                import('@/lib/data').then((module) => {
                    const localProducts = module.products;
                    const uniqueCats = ['All', ...Array.from(new Set(localProducts.map(p => p.category)))];
                    setCategories(uniqueCats);
                    setProducts(localProducts);
                });
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

        const search = searchParams.get('search') || searchParams.get('q') || '';
        setSearchQuery(search);
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
            // Push out-of-stock products to the bottom
            if (a.inStock && !b.inStock) return -1;
            if (!a.inStock && b.inStock) return 1;

            // Apply selected sorting, defaulting to Top Sellers (highest review count)
            if (sortBy === 'priceAsc') {
                const priceA = isRetail ? a.retailPrice : (a.wholesalePrice ?? 0);
                const priceB = isRetail ? b.retailPrice : (b.wholesalePrice ?? 0);
                return priceA - priceB;
            } else if (sortBy === 'priceDesc') {
                const priceA = isRetail ? a.retailPrice : (a.wholesalePrice ?? 0);
                const priceB = isRetail ? b.retailPrice : (b.wholesalePrice ?? 0);
                return priceB - priceA;
            } else if (sortBy === 'nameAsc') {
                return a.name.localeCompare(b.name);
            } else {
                const reviewsA = a.reviews?.length || 0;
                const reviewsB = b.reviews?.length || 0;
                return reviewsB - reviewsA; // Popularity sort
            }
        });

    return (
        <div className="min-h-screen bg-surface-2 text-text-primary pt-32 md:pt-44 pb-24 selection:bg-gold-primary/30 overflow-x-hidden">
            
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-5%] w-[40vw] h-[40vw] bg-gold-muted blur-[120px] rounded-full opacity-60" />
                <div className="absolute bottom-[20%] right-[-5%] w-[40vw] h-[40vw] bg-cyan-glow/5 dark:bg-cyan-glow/3 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 md:px-8 relative z-10">
                
                {/* Breadcrumbs & Title */}
                <motion.div style={{ y: headerY }} className="mb-12">
                    <div className="flex items-center gap-2 mb-4">
                        <Link href="/" className="text-[9px] font-black uppercase tracking-[0.2em] text-text-tertiary hover:text-gold-primary transition-colors">Home</Link>
                        <ChevronRight size={10} className="text-text-tertiary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold-primary">Technical Catalog</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-gold text-gold-primary text-[8px] font-black uppercase tracking-[0.2em] mb-4 shadow"
                            >
                                <Sparkles size={11} className="animate-pulse" /> Precision Workshop Units
                            </motion.div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase text-text-primary">
                                Our <span className="text-transparent bg-gradient-to-r from-text-primary to-gold-primary bg-clip-text">Hardware</span>
                            </h1>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
                    
                    {/* Left Sticky Filters Sidebar */}
                    <aside className="hidden lg:block w-[260px] shrink-0 sticky top-36 self-start">
                        <FilterSidebar
                            categories={categories}
                            selectedCategories={[selectedCategory]}
                            onCategoryChange={handleCategoryChange}
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            minPrice={minPrice}
                            setMinPrice={setMinPrice}
                            isRetail={isRetail}
                            className="bg-surface-1 border border-glass-border rounded-2xl p-5 shadow-md max-h-[80vh] overflow-y-auto custom-scrollbar"
                        />
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        
                        {/* Search & Sort Panel */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row gap-3 items-center bg-surface-1 border border-glass-border p-2.5 rounded-2xl shadow-xl relative z-50">
                                
                                {/* Search input */}
                                <div className="flex-1 relative w-full" ref={searchContainerRef}>
                                    <div className="relative h-12 flex items-center">
                                        <Search className={`absolute left-5 transition-all duration-300 ${isSearchFocused ? 'text-gold-primary scale-110' : 'text-text-tertiary'}`} size={16} />
                                        <input
                                            type="text"
                                            placeholder="Query inventory (e.g. casting, tweezers, rolling mill)..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onFocus={() => setIsSearchFocused(true)}
                                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                            className="w-full h-full bg-transparent pl-12 pr-10 text-xs font-black placeholder-text-tertiary text-text-primary focus:outline-none transition-all"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-5 w-6 h-6 rounded-full bg-surface-2 border border-glass-border flex items-center justify-center text-text-tertiary hover:text-text-primary transition-all"
                                            > <X size={12} /> </button>
                                        )}
                                    </div>
                                    <SearchAutocomplete
                                        query={searchQuery}
                                        onSelect={handleSearchSelect}
                                        isVisible={isSearchFocused}
                                    />
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-2 w-full md:w-auto md:pl-3 md:border-l border-glass-border">
                                    {/* Mobile Filter toggle */}
                                    <button
                                        onClick={() => setShowFilters(true)}
                                        className="lg:hidden flex-1 h-12 px-5 text-black rounded-xl font-black text-[9px] tracking-[0.2em] transition-all flex items-center justify-center gap-2 uppercase shadow"
                                        style={{ background: 'linear-gradient(135deg, #DFCE9F, #C5A059)' }}
                                    >
                                        <Settings2 size={14} /> Filter
                                    </button>

                                    {/* Grid view switcher */}
                                    <div className="hidden md:flex items-center bg-surface-2 rounded-xl p-1 border border-glass-border">
                                        <button
                                            onClick={() => setDisplayMode('grid')}
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${displayMode === 'grid' ? 'bg-surface-1 text-gold-primary shadow-sm border border-glass-border' : 'text-text-tertiary hover:text-text-primary'}`}
                                        > <LayoutGrid size={15} /> </button>
                                        <button
                                            onClick={() => setDisplayMode('list')}
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${displayMode === 'list' ? 'bg-surface-1 text-gold-primary shadow-sm border border-glass-border' : 'text-text-tertiary hover:text-text-primary'}`}
                                        > <List size={15} /> </button>
                                    </div>

                                    {/* Custom Styled Sort Selector */}
                                    <div className="relative min-w-[160px] h-12 flex items-center bg-[#151515] border border-[#343434] focus-within:border-[#A67C35] rounded-xl px-4 transition-all">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full bg-transparent text-[10px] font-bold uppercase tracking-wider text-[#F8F3E8] appearance-none cursor-pointer outline-none pr-6"
                                        >
                                            <option value="featured" className="bg-[#151515] text-[#F8F3E8]">Featured Sort</option>
                                            <option value="priceAsc" className="bg-[#151515] text-[#F8F3E8]">Price: Low to High</option>
                                            <option value="priceDesc" className="bg-[#151515] text-[#F8F3E8]">Price: High to Low</option>
                                            <option value="nameAsc" className="bg-[#151515] text-[#F8F3E8]">Name: A to Z</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 text-[#A67C35] pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status indicators */}
                        <div className="flex items-center justify-between mb-6 px-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                                Matches: <span className="text-text-primary ml-1.5">{filteredProducts.length} hardware units</span>
                                {selectedCategory !== 'All' && <span className="ml-3">Node: <span className="text-gold-primary">{selectedCategory}</span></span>}
                            </span>
                        </div>

                        {/* Inventory Grid */}
                        <div className="relative pb-20">
                            <ProductGrid
                                products={filteredProducts}
                                loading={loading}
                                onClearFilters={handleClearFilters}
                                displayMode={displayMode}
                            />
                        </div>

                        {/* Personalized suggestions */}
                        {selectedCategory === 'All' && !searchQuery && !loading && (
                            <div className="mt-16 pt-16 border-t border-glass-border">
                                <PersonalizedRecommendations />
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile filters drawer */}
            <AnimatePresence>
                {showFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFilters(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 35, stiffness: 400 }}
                            className="fixed inset-y-0 right-0 w-full max-w-xs bg-surface-1 border-l border-glass-border z-[210] shadow-2xl flex flex-col pt-20"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-glass-border">
                                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Configuration</h3>
                                <button onClick={() => setShowFilters(false)} className="w-10 h-10 rounded-full bg-surface-2 border border-glass-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-all">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <FilterSidebar
                                    categories={categories}
                                    selectedCategories={[selectedCategory]}
                                    onCategoryChange={handleCategoryChange}
                                    priceRange={priceRange}
                                    setPriceRange={setPriceRange}
                                    minPrice={minPrice}
                                    setMinPrice={setMinPrice}
                                    isRetail={isRetail}
                                    className="bg-transparent border-none shadow-none p-0"
                                />
                            </div>
                            <div className="p-6 bg-surface-2 border-t border-glass-border">
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="w-full h-12 text-black font-black rounded-xl hover:opacity-90 transition-all shadow-md uppercase tracking-[0.2em] text-[9px]"
                                    style={{ background: 'linear-gradient(135deg, #DFCE9F, #C5A059)' }}
                                >
                                    Confirm filters
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
            <div className="min-h-screen bg-surface-2 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-gold-primary" />
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gold-primary">Accessing catalog database</span>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
