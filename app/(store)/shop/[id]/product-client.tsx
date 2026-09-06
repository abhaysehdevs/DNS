'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Reviews } from '@/components/reviews';
import { RelatedProducts } from '@/components/related-products';
import { RecentlyViewed } from '@/components/recently-viewed';
import { SecureImage } from '@/components/secure-image';
import { ShareButton } from '@/components/share-button';
import { Product, getProductGallery } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { 
    ShoppingCart, Truck, RotateCcw, Lock, FileText, Heart, 
    PlayCircle, Loader2, Star, Zap, Check, CheckCircle2, ShieldCheck, Scale, Ruler
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductClient({ id }: { id: string }) {
    const router = useRouter();
    const { mode, language, addToCart, viewProduct, wishlist, toggleWishlist } = useAppStore();
    const t = translations[language] || translations['en'];
    const isRetail = mode === 'retail';

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [addedAlert, setAddedAlert] = useState(false);

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            try {
                const { findProductByIdOrSlug } = await import('@/lib/slug');
                const data = await findProductByIdOrSlug(id);

                if (!data) {
                    setLoading(false);
                    return;
                }

                const mappedProduct: Product = {
                    id: data.id,
                    name: data.name,
                    description: data.description,
                    retailPrice: data.retail_price,
                    wholesalePrice: data.wholesale_price,
                    wholesaleMOQ: data.wholesale_moq,
                    primaryImage: data.image || '/placeholder.jpg',
                    videoUrl: data.video_url,
                    gallery: data.gallery || [],
                    category: data.category,
                    inStock: data.in_stock,
                    quantity: data.quantity !== undefined && data.quantity !== null ? data.quantity : 15,
                    reviews: data.reviews || [],
                    brand: data.brand,
                    modelNumber: data.model_number,
                    sku: data.sku,
                    weight: data.weight,
                    dimensions: data.dimensions,
                    warrantyInfo: data.warranty_info,
                    features: data.features || [],
                    specifications: data.specifications || {},
                    variants: data.variants || [],
                    variantType: data.variant_type
                };

                setProduct(mappedProduct);
                setQty(isRetail ? 1 : mappedProduct.wholesaleMOQ);
                viewProduct(mappedProduct.id);
            } catch (err) {
                // Try local fallback on exception
                import('@/lib/data').then((module) => {
                    const localProduct = module.products.find(p => p.id === id);
                    if (localProduct) {
                        setProduct(localProduct);
                        setQty(isRetail ? 1 : localProduct.wholesaleMOQ);
                        viewProduct(localProduct.id);
                    }
                });
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [id, isRetail, viewProduct]);

    if (loading) return <div className="min-h-screen bg-[#151515] flex items-center justify-center"><Loader2 className="animate-spin text-[#A67C35]" size={48} /></div>;
    if (!product) return <div className="min-h-screen bg-[#151515] flex items-center justify-center text-[#F8F3E8] uppercase tracking-widest text-xs">Product Not Found</div>;

    const gallery = getProductGallery(product);
    const isWishlisted = wishlist.includes(product.id);
    const isPriceInvalid = !product.retailPrice || product.retailPrice <= 0;
    const canPurchase = product.inStock && !isPriceInvalid;

    const handleAddToCart = () => {
        if (isRetail) {
            addToCart({
                productId: product.id,
                quantity: qty,
                price: product.retailPrice,
                mode: mode
            });
            setAddedAlert(true);
            setTimeout(() => setAddedAlert(false), 3000);
        } else {
            const message = `Hi Dinanath & Sons, I am interested in a wholesale quotation for: ${product.name} (SKU: ${product.sku || product.id}). Qty: ${qty}`;
            window.open(`https://wa.me/919953435647?text=${encodeURIComponent(message)}`, '_blank');
        }
    };

    const handleBuyNow = () => {
        if (isRetail) {
            addToCart({
                productId: product.id,
                quantity: qty,
                price: product.retailPrice,
                mode: mode
            });
            router.push('/cart');
        } else {
            handleAddToCart();
        }
    };

    // Calculations for Mock original price
    const originalPrice = Math.round(product.retailPrice * 1.2 / 100) * 100;
    const discountPercent = 16;

    // Bullet specification options
    const defaultFeatures = [
        "High-performance design optimized for professional jewellers & casting workshops.",
        "Precision engineered components using hardened alloys for long-lasting durability.",
        "Ergonomically tested model suitable for continuous workshop operations.",
        "Backed by Dinanath & Sons' 60+ years of hardware excellence and trusted support."
    ];
    const bulletFeatures = product.features && product.features.length > 0 ? product.features : defaultFeatures;

    return (
        <div className="min-h-screen bg-[#151515] text-[#F8F3E8] pt-32 md:pt-48 pb-20 selection:bg-[#A67C35]/30">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                
                {/* 1. BREADCRUMBS PATH */}
                <div className="mb-10 text-left">
                    <Breadcrumbs items={[
                        { label: 'Inventory', href: '/shop' },
                        { label: product.category, href: `/shop?cat=${product.category}` },
                        { label: product.name }
                    ]} />
                </div>

                {/* 2. PRODUCT LAYOUT HEADER */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    
                    {/* LEFT COLUMN: Gallery View & Thumbnails */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="relative aspect-square bg-[#1E1E1E] border border-[#343434] rounded-2xl overflow-hidden flex items-center justify-center group shadow-2xl p-6">
                            {gallery[selectedMediaIndex]?.type === 'video' ? (
                                <video src={gallery[selectedMediaIndex].url} controls autoPlay className="w-full h-full object-contain" />
                            ) : (
                                <SecureImage src={gallery[selectedMediaIndex]?.url || product.primaryImage} containerClassName="w-full h-full" className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 mix-blend-lighten" alt={product.name} />
                            )}
                            
                            {/* Badges Overlay */}
                            <div className="absolute top-6 left-6 flex gap-3">
                                {product.brand && <span className="bg-[#A67C35] text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow">{product.brand}</span>}
                                {!product.inStock && <span className="bg-[#D12A1C] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded shadow">Out of Stock</span>}
                            </div>
                        </div>

                        {/* Thumbnail Bar */}
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {gallery.map((media, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedMediaIndex(idx)}
                                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border bg-[#1E1E1E] p-2 flex items-center justify-center transition-all ${selectedMediaIndex === idx ? 'border-[#A67C35] scale-105 shadow-md shadow-[#A67C35]/10' : 'border-[#343434] opacity-50 hover:opacity-100'}`}
                                >
                                    <SecureImage src={media.url} containerClassName="w-full h-full" className="w-full h-full object-contain mix-blend-lighten" alt={`${product.name} thumbnail ${idx + 1}`} />
                                    {media.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/45"><PlayCircle size={20} className="text-[#A67C35]" /></div>}
                                </button>
                            ))}
                        </div>
                    </div>
 
                    {/* RIGHT COLUMN: Product Config & Buy Section */}
                    <div className="lg:col-span-6 flex flex-col text-left space-y-6">
                        
                        {/* Meta Tags */}
                        <div className="flex items-center gap-2 text-[#A67C35] text-[9px] font-bold uppercase tracking-[0.2em]">
                            <span>{product.category}</span>
                            {product.modelNumber && <span>• MODEL: {product.modelNumber}</span>}
                        </div>
                        
                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-[#F8F3E8] tracking-wide uppercase leading-tight">{product.name}</h1>
                        
                        {/* Review count & Ratings */}
                        <div className="flex items-center gap-6 text-[#CFCFCF] text-xs">
                            <div className="flex items-center gap-2">
                                <div className="flex text-[#A67C35]">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-[#A67C35] stroke-none" />)}
                                </div>
                                <span className="font-bold text-[#A67C35]">({product.reviews?.length || 25} Reviews)</span>
                            </div>
                            <div className="h-3.5 w-px bg-[#343434]" />
                            <span className="font-mono text-[10px] uppercase tracking-wider text-[#8E8E9A]">SKU: {product.sku || product.id.slice(0, 8).toUpperCase()}</span>
                        </div>

                        {/* ════════════════════════════════════════════════════════════════
                           PROMINENT PRODUCT DETAILS & QUANTITY SPECIFICATIONS PANEL
                           (Displayed right beneath Product Title)
                           ════════════════════════════════════════════════════════════════ */}
                        <div className="bg-[#1A1A1A] border border-[#343434] hover:border-[#A67C35]/50 rounded-2xl p-5 space-y-4 shadow-lg transition-all">
                            {/* Stock Quantity Header Indicator */}
                            <div className="flex items-center justify-between border-b border-[#343434]/60 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-3 h-3 rounded-full relative flex items-center justify-center ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                        {product.inStock && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-wider text-[#F8F3E8]">
                                        Available Stock Quantity: <span className="text-[#A67C35] font-mono text-sm">{product.quantity ?? 15} Units</span>
                                    </span>
                                </div>
                                <span className={`text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-1 rounded ${product.inStock ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>

                            {/* Product Specifications & Details Chips */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {product.brand && (
                                    <div className="bg-[#242424] p-2.5 rounded-xl border border-[#343434]">
                                        <span className="text-[7.5px] text-[#8E8E9A] font-mono font-bold uppercase tracking-widest block">Brand</span>
                                        <span className="text-xs font-bold text-[#F8F3E8] uppercase tracking-wider truncate block mt-0.5">{product.brand}</span>
                                    </div>
                                )}
                                {product.modelNumber && (
                                    <div className="bg-[#242424] p-2.5 rounded-xl border border-[#343434]">
                                        <span className="text-[7.5px] text-[#8E8E9A] font-mono font-bold uppercase tracking-widest block">Model</span>
                                        <span className="text-xs font-bold text-[#A67C35] uppercase tracking-wider truncate block mt-0.5">{product.modelNumber}</span>
                                    </div>
                                )}
                                {product.weight && (
                                    <div className="bg-[#242424] p-2.5 rounded-xl border border-[#343434]">
                                        <span className="text-[7.5px] text-[#8E8E9A] font-mono font-bold uppercase tracking-widest block">Weight</span>
                                        <span className="text-xs font-bold text-[#F8F3E8] uppercase tracking-wider truncate block mt-0.5">{product.weight}</span>
                                    </div>
                                )}
                                {product.dimensions && (product.dimensions.length || product.dimensions.width) && (
                                    <div className="bg-[#242424] p-2.5 rounded-xl border border-[#343434]">
                                        <span className="text-[7.5px] text-[#8E8E9A] font-mono font-bold uppercase tracking-widest block">Dimensions</span>
                                        <span className="text-xs font-bold text-[#F8F3E8] uppercase tracking-wider truncate block mt-0.5">
                                            {product.dimensions.length}x{product.dimensions.width} {product.dimensions.height ? `x${product.dimensions.height}` : ''}
                                        </span>
                                    </div>
                                )}
                                {product.warrantyInfo && (
                                    <div className="bg-[#242424] p-2.5 rounded-xl border border-[#343434]">
                                        <span className="text-[7.5px] text-[#8E8E9A] font-mono font-bold uppercase tracking-widest block">Warranty</span>
                                        <span className="text-xs font-bold text-[#A67C35] uppercase tracking-wider truncate block mt-0.5">{product.warrantyInfo}</span>
                                    </div>
                                )}
                            </div>

                            {/* Additional Specifications (Sizes, Material, Tolerances, etc.) */}
                            {product.specifications && Object.keys(product.specifications).length > 0 && (
                                <div className="space-y-2 pt-1 border-t border-[#343434]/40">
                                    <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-[#A67C35] block">
                                        Specifications & Sizes:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(product.specifications).map(([key, val]) => (
                                            <div key={key} className="bg-[#242424] px-3 py-1.5 rounded-lg border border-[#343434] flex items-center gap-2 text-xs">
                                                <span className="text-[#8E8E9A] font-mono text-[9px] uppercase font-bold">{key}:</span>
                                                <span className="text-[#F8F3E8] font-bold uppercase">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Variants List (if product has sizes / options configured) */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="space-y-2 pt-1 border-t border-[#343434]/40">
                                    <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-[#A67C35] block">
                                        {product.variantType || 'Available Sizes / Options'}:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((v: any, idx: number) => (
                                            <div key={idx} className="bg-[#242424] px-3 py-1.5 rounded-lg border border-[#A67C35]/40 text-xs font-bold text-[#F8F3E8] uppercase tracking-wider flex items-center gap-2">
                                                <span>{v.name || v.title}</span>
                                                {v.price && <span className="text-[#A67C35]">₹{v.price}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Specifications Bullet list */}
                        <div className="border-y border-[#343434] py-6 space-y-3.5">
                            {bulletFeatures.slice(0, 4).map((feat, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#A67C35] shrink-0 mt-2" />
                                    <p className="text-sm text-[#CFCFCF] font-medium leading-relaxed">{feat}</p>
                                </div>
                            ))}
                        </div>

                        {/* Pricing display & Purchasing Block */}
                        <div className="bg-[#1E1E1E] border border-[#343434] rounded-xl p-6 space-y-4">
                            <div className="flex items-baseline gap-4 flex-wrap">
                                {isPriceInvalid ? (
                                    <div className="space-y-1">
                                        <span className="text-2xl font-black text-[#D12A1C] uppercase tracking-wider block">Out of Stock</span>
                                        <p className="text-[#8E8E9A] text-[10px] font-bold uppercase">This product is currently out of stock or price is pending update.</p>
                                    </div>
                                ) : isRetail ? (
                                    <>
                                        <span className="text-4xl font-black text-[#F8F3E8]">₹{product.retailPrice.toLocaleString()}</span>
                                        <span className="text-[#8E8E9A] text-sm line-through uppercase font-bold">₹{originalPrice.toLocaleString()}</span>
                                        <span className="text-[#D12A1C] text-xs font-bold uppercase tracking-wider">({discountPercent}% OFF)</span>
                                    </>
                                ) : (
                                    <div className="space-y-1">
                                        <span className="text-2xl font-bold text-[#A67C35] uppercase tracking-wider italic">Wholesale Price disclosed upon inquiry</span>
                                        <p className="text-[#8E8E9A] text-[10px] font-bold uppercase">Prices negotiated based on volume (Minimum MOQ: {product.wholesaleMOQ} Units)</p>
                                    </div>
                                )}
                            </div>

                            {/* Purchase Quantity and CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                {/* Quantity input */}
                                <div className="flex items-center bg-[#151515] border border-[#343434] rounded-lg p-1 h-14 w-full sm:w-36 shrink-0">
                                    <button disabled={!canPurchase} onClick={() => setQty(Math.max(1, qty - 1))} className="flex-1 h-full text-[#8E8E9A] hover:text-[#F8F3E8] transition-colors font-bold text-lg disabled:opacity-30">-</button>
                                    <span className="w-10 text-center font-mono font-bold text-sm">{qty}</span>
                                    <button disabled={!canPurchase} onClick={() => setQty(qty + 1)} className="flex-1 h-full text-[#8E8E9A] hover:text-[#F8F3E8] transition-colors font-bold text-lg disabled:opacity-30">+</button>
                                </div>
                                
                                {/* Add to Cart button */}
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={!canPurchase}
                                    className={`flex-1 h-14 rounded-lg flex items-center justify-center gap-2.5 font-bold uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] shadow-lg ${
                                        !canPurchase ? 'bg-[#343434] text-[#8E8E9A] cursor-not-allowed border border-[#444444]' : 
                                        isRetail ? 'bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold' : 'bg-[#D12A1C] hover:bg-[#b02217] text-white'
                                    }`}
                                >
                                    <ShoppingCart size={15} strokeWidth={2.5} />
                                    {isRetail ? (canPurchase ? 'Add to Cart' : 'Out of Stock') : 'Request Quotation'}
                                </button>

                                {/* Buy Now button */}
                                {isRetail && (
                                    <button 
                                        onClick={handleBuyNow}
                                        disabled={!canPurchase}
                                        className={`flex-1 h-14 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all active:scale-[0.98] shadow-lg ${
                                            !canPurchase ? 'bg-[#2A2A2A] text-[#666666] cursor-not-allowed border border-[#3A3A3A]' : 'bg-[#D12A1C] hover:bg-[#b02217] text-white'
                                        }`}
                                    >
                                        Buy Now
                                    </button>
                                )}

                                {/* Wishlist heart toggle */}
                                <button 
                                    onClick={() => toggleWishlist(product.id)}
                                    className={`w-14 h-14 rounded-lg border flex items-center justify-center shrink-0 transition-all ${isWishlisted ? 'bg-[#D12A1C]/10 text-[#D12A1C] border-[#D12A1C]/30' : 'bg-[#151515] border-[#343434] text-[#8E8E9A] hover:text-[#F8F3E8]'}`}
                                    title="Add to Wishlist"
                                >
                                    <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                                </button>

                                {/* Unique Shareable Link Button */}
                                <ShareButton product={product} />
                            </div>
                        </div>

                        {/* Succesful Cart Addition Banner */}
                        <AnimatePresence>
                            {addedAlert && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-emerald-500 text-xs font-bold uppercase tracking-wider"
                                >
                                    <CheckCircle2 size={16} />
                                    <span>Product added to your cart successfully!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. RETURN POLICY & TRUST STRIP BOX */}
                        <div className="bg-[#1E1E1E] border border-[#343434] hover:border-[#A67C35]/40 rounded-xl p-5 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#151515] border border-[#343434] text-[#A67C35] flex items-center justify-center shrink-0">
                                    <RotateCcw size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#F8F3E8] uppercase tracking-wider flex items-center gap-2">
                                        Return Policy Notice
                                    </h4>
                                    <p className="text-[10px] text-[#8E8E9A] font-semibold leading-relaxed mt-0.5">
                                        No Return Policy available on almost all products (except where explicitly marked on specific items). Manufacturing defect inspection applies upon delivery. <Link href="/return-policy" className="text-[#A67C35] underline">View Details</Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* TRUST STRIP BAR */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                            {[
                                { label: "Fast Shipping", desc: "Pan India", icon: Truck },
                                { label: "Strict Quality", desc: "Inspected Tools", icon: RotateCcw },
                                { label: "Secure Payment", desc: "100% Protected", icon: Lock },
                                { label: "GST Invoice", desc: "B2B Input Credit", icon: FileText }
                            ].map((item, i) => (
                                <div key={i} className="bg-[#1E1E1E] border border-[#343434] rounded-lg p-3.5 flex flex-col items-center text-center shadow-sm">
                                    <item.icon size={18} className="text-[#A67C35] mb-2" />
                                    <h5 className="text-[10px] font-bold text-[#F8F3E8] uppercase tracking-wider mb-0.5">{item.label}</h5>
                                    <span className="text-[8px] text-[#8E8E9A] uppercase font-bold">{item.desc}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* 4. TECHNICAL SPECIFICATIONS SECTION */}
                <div className="mt-28 space-y-8">
                    <div className="border-b border-[#343434] pb-4 text-left">
                        <h2 className="text-2xl md:text-3xl font-bold font-display text-[#F8F3E8] uppercase tracking-wider">Technical Specifications</h2>
                        <p className="text-[#8E8E9A] text-[9px] font-bold uppercase tracking-widest mt-1">In-depth engineering & manufacturing details</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Specifications Table */}
                        <div className="lg:col-span-8 space-y-1 text-left">
                            {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                                <div key={key} className={`flex py-4 px-6 rounded-lg border border-transparent ${idx % 2 === 0 ? 'bg-[#1E1E1E]' : ''}`}>
                                    <span className="w-1/3 text-[9px] font-bold text-[#8E8E9A] uppercase tracking-widest self-center">{key}</span>
                                    <span className="flex-1 text-xs font-bold text-[#CFCFCF] uppercase tracking-wider">{val}</span>
                                </div>
                            ))}
                            {Object.entries(product.specifications || {}).length === 0 && (
                                <div className="py-8 text-[#8E8E9A] italic text-sm">No technical specs configured for this model.</div>
                            )}
                        </div>
                        
                        {/* Model highlights */}
                        <div className="lg:col-span-4 bg-[#1E1E1E] border border-[#343434] rounded-xl p-6 space-y-6 text-left h-fit">
                            <h3 className="text-sm font-bold text-[#F8F3E8] uppercase tracking-wider flex items-center gap-2 border-b border-[#343434] pb-3"><Zap size={14} className="text-[#A67C35]" /> Core Features</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {bulletFeatures.map((feat, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#242424] text-[#A67C35] border border-[#343434] flex items-center justify-center shrink-0 mt-0.5"><Check size={10} strokeWidth={3} /></div>
                                        <p className="text-[#CFCFCF] text-xs font-medium leading-relaxed">{feat}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                <div className="mt-28">
                    <Reviews initialReviews={product.reviews || []} productId={product.id} />
                </div>
                
                {/* Related Products */}
                <div className="mt-28">
                    <RelatedProducts currentProduct={product} />
                </div>

            </div>
        </div>
    );
}
