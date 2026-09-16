'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, products as initialLocalProducts } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import {
    Search, X, LayoutGrid, List,
    ChevronRight, Settings2, ChevronDown, Sparkles, Loader2,
    Sliders, Compass, Wrench, Package, Droplets, Flame, Tag, Award
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PersonalizedRecommendations } from '@/components/personalized-grid';
import { SearchAutocomplete } from '@/components/search-autocomplete';
import { FilterSidebar } from '@/components/shop/filter-sidebar';
import { ProductGrid } from '@/components/shop/product-grid';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';

const ALL_STORE_CATEGORIES = [
    { key: 'All', label: 'All Items', icon: LayoutGrid, aliases: ['all'] },
    { key: 'Tools', label: 'Hand Tools', icon: Sliders, aliases: ['tools', 'hand tools', 'hand-tools'] },
    { key: 'Machinery', label: 'Machinery', icon: Compass, aliases: ['machinery', 'machines', 'equipment'] },
    { key: 'Consumables', label: 'Polishing & Buffs', icon: Wrench, aliases: ['consumables', 'polishing', 'buffs', 'polishing & buffs'] },
    { key: 'Packaging', label: 'Packaging & Cards', icon: Package, aliases: ['packaging', 'cards', 'display', 'packaging & cards'] },
    { key: 'Chemicals', label: 'Cleaning & Flux', icon: Droplets, aliases: ['chemicals', 'cleaning', 'flux', 'solutions'] },
    { key: 'Bullion', label: 'Certified Bullion', icon: Award, aliases: ['bullion', 'coins', 'bars'] },
    { key: 'Casting & Metallurgy', label: 'Casting & Melting', icon: Flame, aliases: ['casting', 'metallurgy', 'casting & metallurgy', 'welding'] }
];

const getCategoryIcon = (cat: string) => {
    const found = ALL_STORE_CATEGORIES.find(c => c.key.toLowerCase() === cat.toLowerCase() || c.aliases.includes(cat.toLowerCase()));
    return found ? found.icon : Tag;
};

const getCategoryDisplayName = (cat: string) => {
    const found = ALL_STORE_CATEGORIES.find(c => c.key.toLowerCase() === cat.toLowerCase() || c.aliases.includes(cat.toLowerCase()));
    return found ? found.label : cat;
};

function ShopContent() {
    const { mode, language } = useAppStore();
    const t = translations[language];
    const isRetail = mode === 'retail';
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialCategory = searchParams.get('cat') || 'All';
    const initialSearch = searchParams.get('search') || searchParams.get('q') || '';

    const allCategoryKeys = ALL_STORE_CATEGORIES.map(c => c.key);
    const initialCats = allCategoryKeys;

    // Data State - preloaded so initial server-rendered HTML contains real products and links
    const [products, setProducts] = useState<Product[]>(() => initialLocalProducts);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<string[]>(initialCats);


    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [priceRange, setPriceRange] = useState(500000);
    const [minPrice, setMinPrice] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
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

                    setCategories(allCategoryKeys);
                    setProducts(mappedProducts);
                } else {
                    import('@/lib/data').then((module) => {
                        setCategories(allCategoryKeys);
                        setProducts(module.products);
                    });
                }
            } catch (err) {
                console.error("Fetch failed, loading fallbacks", err);
                import('@/lib/data').then((module) => {
                    setCategories(allCategoryKeys);
                    setProducts(module.products);
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
        setInStockOnly(false);
        setSortBy('featured');
        router.push('/shop', { scroll: false });
    };

    const filteredProducts = products
        .filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || (() => {
                const selClean = selectedCategory.toLowerCase().trim();
                const catObj = ALL_STORE_CATEGORIES.find(c => 
                    c.key.toLowerCase() === selClean || 
                    c.label.toLowerCase() === selClean || 
                    c.aliases.includes(selClean)
                );
                const validAliases = catObj ? catObj.aliases : [selClean];
                const prodCat = (product.category || '').toLowerCase().trim();
                return validAliases.some(alias => prodCat.includes(alias) || alias.includes(prodCat));
            })();
            const matchesPrice = isRetail ? (product.retailPrice <= priceRange && product.retailPrice >= minPrice) : true;
            const matchesStock = inStockOnly ? product.inStock : true;
            return matchesSearch && matchesCategory && matchesPrice && matchesStock;
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
        <div className="min-h-screen bg-surface-2 text-text-primary pt-2 sm:pt-4 md:pt-6 pb-20 selection:bg-gold-primary/30 overflow-x-hidden">
            
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-5%] w-[40vw] h-[40vw] bg-gold-muted blur-[120px] rounded-full opacity-60" />
                <div className="absolute bottom-[20%] right-[-5%] w-[40vw] h-[40vw] bg-cyan-glow/5 dark:bg-cyan-glow/3 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-3.5 sm:px-6 md:px-8 relative z-10">
                
                {/* Breadcrumbs & Title */}
                <motion.div style={{ y: headerY }} className="mb-3 sm:mb-6">
                    <div className="flex items-center gap-1.5 mb-1.5">
                        <Link href="/" className="text-[9px] font-black uppercase tracking-[0.2em] text-text-tertiary hover:text-gold-primary transition-colors">Home</Link>
                        <ChevronRight size={10} className="text-text-tertiary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gold-primary">Technical Catalog</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 sm:gap-6">
                        <div>
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full glass-gold text-gold-primary text-[7.5px] font-black uppercase tracking-[0.18em] mb-1.5 shadow"
                            >
                                <Sparkles size={10} className="animate-pulse" /> Precision Workshop Units
                            </motion.div>
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none uppercase text-text-primary">
                                Our <span className="text-transparent bg-gradient-to-r from-text-primary to-gold-primary bg-clip-text">Hardware</span>
                            </h1>
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
                    
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
                            inStockOnly={inStockOnly}
                            setInStockOnly={setInStockOnly}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            totalProductsCount={filteredProducts.length}
                            onResetAll={handleClearFilters}
                            className="bg-[#181818] border border-[#343434] rounded-2xl p-4 shadow-xl max-h-[82vh] overflow-y-auto custom-scrollbar"
                        />
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0 w-full max-w-full overflow-hidden">
                        
                        {/* Search & Category Navigation */}
                        <div className="mb-4 sm:mb-6 space-y-2.5 sm:space-y-3">
                            {/* Search Input Box (Desktop; Mobile uses sticky search bar in header) */}
                            <div className="hidden md:block relative z-40 bg-surface-1 border border-glass-border p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg" ref={searchContainerRef}>
                                <div className="relative h-10 sm:h-12 flex items-center">
                                    <Search className={`absolute left-3.5 sm:left-5 transition-all duration-300 ${isSearchFocused ? 'text-gold-primary scale-110' : 'text-text-tertiary'}`} size={16} />
                                    <input
                                        type="text"
                                        placeholder="Query inventory (e.g. casting, tweezers, rolling mill)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                        className="w-full h-full bg-transparent pl-10 sm:pl-12 pr-10 text-xs font-black placeholder-text-tertiary text-text-primary focus:outline-none transition-all"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3.5 sm:right-5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-surface-2 border border-glass-border flex items-center justify-center text-text-tertiary hover:text-text-primary transition-all"
                                        > <X size={11} /> </button>
                                    )}
                                </div>
                                <SearchAutocomplete
                                    query={searchQuery}
                                    onSelect={handleSearchSelect}
                                    isVisible={isSearchFocused}
                                />
                            </div>

                            {/* Category Browse Row: Beside "All Items", list all website's categories */}
                            <div className="w-full overflow-x-auto no-scrollbar scroll-smooth -mx-0.5 px-0.5 py-1">
                                <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
                                    {ALL_STORE_CATEGORIES.map((cat) => {
                                        const isSelected = selectedCategory.toLowerCase() === cat.key.toLowerCase() || 
                                                           selectedCategory.toLowerCase() === cat.label.toLowerCase() ||
                                                           cat.aliases.includes(selectedCategory.toLowerCase());
                                        const Icon = cat.icon;
                                        const count = cat.key === 'All' 
                                            ? products.length 
                                            : products.filter(p => {
                                                const prodCat = (p.category || '').toLowerCase().trim();
                                                return cat.aliases.some(a => prodCat.includes(a) || a.includes(prodCat));
                                            }).length;
                                        return (
                                            <button
                                                key={cat.key}
                                                onClick={() => handleCategoryChange(cat.key)}
                                                className={`group flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-bold tracking-wide transition-all duration-200 whitespace-nowrap active:scale-95 ${
                                                    isSelected
                                                        ? 'bg-gradient-to-r from-[#DFCE9F] via-[#C5A059] to-[#9E7B35] text-black shadow-md shadow-[#C5A059]/20 font-black border border-[#DFCE9F]'
                                                        : 'bg-surface-1/90 hover:bg-surface-2 text-text-secondary hover:text-text-primary border border-glass-border/70 hover:border-gold-primary/40'
                                                }`}
                                            >
                                                <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-lg flex items-center justify-center transition-colors ${
                                                    isSelected ? 'bg-black/15 text-black' : 'bg-surface-2 text-gold-primary group-hover:text-gold-secondary'
                                                }`}>
                                                    <Icon size={11} />
                                                </span>
                                                <span>{cat.label}</span>
                                                <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                                                    isSelected ? 'bg-black/20 text-black font-black' : 'bg-surface-2 text-text-tertiary'
                                                }`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Secondary Controls Bar: Filter, Grid/List, Sort Selector & Matches Count */}
                            <div className="flex items-center justify-between gap-2 pt-0.5 px-0.5">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowFilters(true)}
                                        className="lg:hidden h-9 px-3.5 text-black rounded-lg font-black text-[10px] tracking-wider transition-all flex items-center gap-1.5 uppercase shadow active:scale-95"
                                        style={{ background: 'linear-gradient(135deg, #DFCE9F, #C5A059)' }}
                                    >
                                        <Settings2 size={12} /> Filter
                                    </button>
                                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-text-tertiary">
                                        <span className="text-text-primary">{filteredProducts.length}</span> units
                                        {selectedCategory !== 'All' && <span className="text-gold-primary ml-1.5 font-bold">· {selectedCategory}</span>}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="hidden md:flex items-center bg-surface-2 rounded-xl p-1 border border-glass-border">
                                        <button
                                            onClick={() => setDisplayMode('grid')}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${displayMode === 'grid' ? 'bg-surface-1 text-gold-primary shadow-sm border border-glass-border' : 'text-text-tertiary hover:text-text-primary'}`}
                                        > <LayoutGrid size={14} /> </button>
                                        <button
                                            onClick={() => setDisplayMode('list')}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${displayMode === 'list' ? 'bg-surface-1 text-gold-primary shadow-sm border border-glass-border' : 'text-text-tertiary hover:text-text-primary'}`}
                                        > <List size={14} /> </button>
                                    </div>

                                    <div className="relative h-9 flex items-center bg-[#151515] border border-[#343434] focus-within:border-[#A67C35] rounded-lg px-3 transition-all">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full bg-transparent text-[10px] font-bold uppercase tracking-wider text-[#F8F3E8] appearance-none cursor-pointer outline-none pr-5"
                                        >
                                            <option value="featured" className="bg-[#151515] text-[#F8F3E8]">Featured</option>
                                            <option value="priceAsc" className="bg-[#151515] text-[#F8F3E8]">Price: Low to High</option>
                                            <option value="priceDesc" className="bg-[#151515] text-[#F8F3E8]">Price: High to Low</option>
                                            <option value="nameAsc" className="bg-[#151515] text-[#F8F3E8]">Name: A to Z</option>
                                        </select>
                                        <ChevronDown size={12} className="absolute right-2.5 text-[#A67C35] pointer-events-none" />
                                    </div>
                                </div>
                            </div>
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
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                            className="fixed inset-y-0 right-0 w-full sm:w-[380px] max-w-full bg-[#141414] border-l border-[#343434] z-[210] shadow-2xl flex flex-col"
                        >
                            {/* Mobile Drawer Header */}
                            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#343434] bg-[#1A1A1A]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-[#A67C35]/15 border border-[#A67C35]/40 flex items-center justify-center text-[#A67C35]">
                                        <Settings2 size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#F8F3E8] uppercase tracking-wider">Catalog Filters</h3>
                                        <span className="text-[9px] text-[#A67C35] font-bold uppercase tracking-widest">
                                            {filteredProducts.length} matching units
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowFilters(false)} 
                                    className="w-8 h-8 rounded-lg bg-[#242424] border border-[#343434] hover:border-[#A67C35] flex items-center justify-center text-[#CFCFCF] hover:text-white transition-all active:scale-95"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Mobile Drawer Body with Detailed Filters */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                <FilterSidebar
                                    categories={categories}
                                    selectedCategories={[selectedCategory]}
                                    onCategoryChange={handleCategoryChange}
                                    priceRange={priceRange}
                                    setPriceRange={setPriceRange}
                                    minPrice={minPrice}
                                    setMinPrice={setMinPrice}
                                    isRetail={isRetail}
                                    inStockOnly={inStockOnly}
                                    setInStockOnly={setInStockOnly}
                                    sortBy={sortBy}
                                    setSortBy={setSortBy}
                                    totalProductsCount={filteredProducts.length}
                                    onResetAll={handleClearFilters}
                                    isMobileDrawer={true}
                                    className="bg-transparent border-none shadow-none p-0"
                                />
                            </div>

                            {/* Mobile Drawer Sticky Footer */}
                            <div className="p-4 bg-[#1A1A1A] border-t border-[#343434] flex items-center gap-3">
                                <button
                                    onClick={handleClearFilters}
                                    className="h-11 px-4 text-[10px] font-bold uppercase tracking-wider text-[#8E8E9A] hover:text-white transition-colors bg-[#242424] border border-[#343434] rounded-xl shrink-0 active:scale-95"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="flex-1 h-11 text-black font-black rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-1.5"
                                    style={{ background: 'linear-gradient(135deg, #DFCE9F, #C5A059)' }}
                                >
                                    <span>Show {filteredProducts.length} Units</span>
                                    <ChevronRight size={13} strokeWidth={2.5} />
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
