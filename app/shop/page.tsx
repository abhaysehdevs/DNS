
'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, products as localProducts } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import {
    Search, Filter, ArrowUpDown, X, LayoutGrid, List, Sparkles,
    ChevronRight, SlidersHorizontal, Settings2, ChevronDown
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PersonalizedRecommendations } from '@/components/personalized-grid';
import { SearchAutocomplete } from '@/components/search-autocomplete';
import { FilterSidebar } from '@/components/shop/filter-sidebar';
import { ProductGrid } from '@/components/shop/product-grid';
import { AnimatePresence, motion } from 'framer-motion';

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
    const [priceRange, setPriceRange] = useState(100000);
    const [minPrice, setMinPrice] = useState(0);
    const [sortBy, setSortBy] = useState('featured');

    // UI State
    const [showFilters, setShowFilters] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');

    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Initial Data Fetch
    useEffect(() => {
        async function fetchProducts() {
            setLoading(true);
            try {
                const { data } = await supabase.from('products').select('*');

<<<<<<< Updated upstream
                if (data) {
=======
                if (data && data.length > 0) {
>>>>>>> Stashed changes
                    const mappedProducts: Product[] = data.map((p: any) => {
                        const localMatch = localProducts.find(lp =>
                            lp.id === p.id ||
                            lp.name.toLowerCase() === p.name.toLowerCase()
                        );
                        return {
                            id: p.id,
                            name: p.name,
                            description: p.description,
                            retailPrice: p.retail_price,
                            wholesalePrice: p.wholesale_price,
                            wholesaleMOQ: p.wholesale_moq,
                            image: p.image || localMatch?.primaryImage || '/placeholder.jpg',
                            primaryImage: p.image || localMatch?.primaryImage || '/placeholder.jpg',
                            gallery: (p.gallery && p.gallery.length > 0) ? p.gallery : (localMatch?.gallery || [{ id: '1', type: 'image', url: p.image || localMatch?.primaryImage || '/placeholder.jpg' }]),
                            category: p.category,
                            inStock: p.in_stock,
                            reviews: p.reviews || []
                        };
                    });

                    const uniqueCats = ['All', ...Array.from(new Set(mappedProducts.map(p => p.category)))];
                    setCategories(uniqueCats);
                    setProducts(mappedProducts);
<<<<<<< Updated upstream
=======
                } else {
                    const uniqueCats = ['All', ...Array.from(new Set(localProducts.map(p => p.category)))];
                    setCategories(uniqueCats);
                    setProducts(localProducts);
>>>>>>> Stashed changes
                }
            } catch (err) {
                console.error("Fetch failed", err);
            } finally {
                await new Promise(r => setTimeout(r, 600));
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
        setPriceRange(100000);
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
                const priceA = isRetail ? a.retailPrice : a.wholesalePrice;
                const priceB = isRetail ? b.retailPrice : b.wholesalePrice;
                return priceA - priceB;
            } else if (sortBy === 'priceDesc') {
                const priceA = isRetail ? a.retailPrice : a.wholesalePrice;
                const priceB = isRetail ? b.retailPrice : b.wholesalePrice;
                return priceB - priceA;
            } else if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
            return 0;
        });

    return (
        <div className="min-h-screen bg-[#020202] text-white pt-24 md:pt-32 pb-24 selection:bg-amber-500/30 overflow-x-hidden">

            {/* Elegant Background Accents */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">

                {/* Top Section: Breadcrumbs & Mode */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Home</Link>
                        <ChevronRight size={14} className="text-gray-600" />
                        <span className="text-sm font-medium text-amber-500">Shop</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-400">
                            {isRetail ? 'Retail Mode' : 'B2B Wholesale Mode'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

                    {/* Left Column: Fixed Categories & Filters on Desktop */}
                    <aside className="hidden lg:block lg:w-[280px] shrink-0" style={{ width: '280px', flexShrink: 0 }}>
                        <div className="sticky top-28 space-y-8">
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
                        </div>
                    </aside>

                    {/* Right Column: Content */}
                    <main className="flex-1 min-w-0" style={{ flex: 1, minWidth: 0 }}>

                        {/* Header & Search */}
                        <div className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-8 text-white">
                                Shop <span className="text-amber-500 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Products</span>
                            </h1>

                            <div className="flex flex-col md:flex-row gap-4 items-center bg-gray-900/50 p-2 rounded-2xl border border-white/10">
                                {/* Search Entry */}
                                <div className="flex-1 relative group h-12 w-full" ref={searchContainerRef}>
                                    <div className="relative h-full flex items-center">
                                        <Search className={`absolute left-4 transition-colors duration-300 ${isSearchFocused ? 'text-amber-500' : 'text-gray-500'}`} size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onFocus={() => setIsSearchFocused(true)}
                                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                            className="w-full h-full bg-transparent pl-12 pr-12 text-base placeholder-gray-500 text-white focus:outline-none transition-all"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-4 p-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-colors"
                                            > <X size={14} /> </button>
                                        )}
                                    </div>
                                    <SearchAutocomplete
                                        query={searchQuery}
                                        onSelect={handleSearchSelect}
                                        isVisible={isSearchFocused}
                                    />
                                </div>

                                {/* Control Actions */}
                                <div className="flex items-center gap-3 w-full md:w-auto px-2 border-t md:border-t-0 md:border-l border-white/10 md:pl-4 pt-2 md:pt-0">
                                    {/* Mobile Filter Trigger */}
                                    <button
                                        onClick={() => setShowFilters(true)}
                                        className="lg:hidden flex-1 h-10 px-4 bg-amber-500 text-black rounded-lg font-bold text-sm tracking-wide hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Settings2 size={16} /> Filters
                                    </button>

                                    {/* Layout Toggle (Desktop) */}
                                    <div className="hidden md:flex items-center bg-black/40 rounded-lg p-1 border border-white/5">
                                        <button
                                            onClick={() => setDisplayMode('grid')}
                                            className={`p-1.5 rounded-md transition-all ${displayMode === 'grid' ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/20' : 'text-gray-600 hover:text-white'}`}
                                        > <LayoutGrid size={16} /> </button>
                                        <button
                                            onClick={() => setDisplayMode('list')}
                                            className={`p-1.5 rounded-md transition-all ${displayMode === 'list' ? 'bg-amber-500 text-black shadow-sm shadow-amber-500/20' : 'text-gray-600 hover:text-white'}`}
                                        > <List size={16} /> </button>
                                    </div>

                                    {/* Sort logic */}
                                    <div className="flex relative group min-w-[140px] h-10 items-center bg-gray-800 rounded-lg px-4 md:px-0 md:bg-transparent">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full bg-transparent text-sm font-semibold text-white appearance-none pr-8 cursor-pointer outline-none md:pl-2"
                                        >
<<<<<<< Updated upstream
                                            <option value="featured">Featured</option>
                                            <option value="priceAsc">Price: Low to High</option>
                                            <option value="priceDesc">Price: High to Low</option>
                                            <option value="nameAsc">Name: A-Z</option>
=======
                                            <option value="featured" className="bg-gray-900 text-white">Featured</option>
                                            <option value="priceAsc" className="bg-gray-900 text-white">Price: Low to High</option>
                                            <option value="priceDesc" className="bg-gray-900 text-white">Price: High to Low</option>
                                            <option value="nameAsc" className="bg-gray-900 text-white">Name: A-Z</option>
>>>>>>> Stashed changes
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Strip */}
                        <div className="flex items-center justify-between mb-6 px-1">
                            <span className="text-sm font-medium text-gray-400">
                                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                                {selectedCategory !== 'All' && <span> in <span className="text-amber-500">{selectedCategory}</span></span>}
                            </span>
                        </div>

                        {/* Product Workspace */}
                        <div className="relative">
                            <ProductGrid
                                products={filteredProducts}
                                loading={loading}
                                onClearFilters={handleClearFilters}
<<<<<<< Updated upstream
=======
                                displayMode={displayMode}
>>>>>>> Stashed changes
                            />
                        </div>

                        {/* Deep Recommendations */}
                        {selectedCategory === 'All' && !searchQuery && !loading && (
                            <div className="mt-32 pt-24 border-t border-white/5 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                <PersonalizedRecommendations />
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Selection Drawer */}
            <AnimatePresence>
                {showFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFilters(false)}
                            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 35, stiffness: 400 }}
                            className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#050505] border-l border-white/10 z-[210] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col pt-24"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-gray-800">
                                <h3 className="text-xl font-bold text-white">Filters</h3>
                                <button onClick={() => setShowFilters(false)} className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-gray-800 transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
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
                            <div className="p-6 bg-gray-900 border-t border-gray-800">
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="w-full py-4 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all shadow-lg"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .selection\\:bg-amber-500\\/30 ::selection { background-color: rgba(245, 158, 11, 0.3); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#020202] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
        </div>}>
            <ShopContent />
        </Suspense>
    );
}
