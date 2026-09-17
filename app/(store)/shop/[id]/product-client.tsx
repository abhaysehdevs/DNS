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
    PlayCircle, Loader2, Star, Zap, Check, CheckCircle2, ShieldCheck, Scale, Ruler,
    MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductClient({ id, initialProduct }: { id: string; initialProduct?: any }) {
    const router = useRouter();
    const { mode, language, addToCart, viewProduct, wishlist, toggleWishlist } = useAppStore();
    const t = translations[language] || translations['en'];
    const isRetail = mode === 'retail';

    const [product, setProduct] = useState<Product | null>(() => {
        if (initialProduct) {
            const retailPrice = Number(initialProduct.retailPrice ?? initialProduct.retail_price ?? 0);
            const wholesalePrice = initialProduct.wholesalePrice !== undefined ? Number(initialProduct.wholesalePrice) : (initialProduct.wholesale_price !== undefined ? Number(initialProduct.wholesale_price) : undefined);
            const wholesaleMOQ = Number(initialProduct.wholesaleMOQ ?? initialProduct.wholesale_moq ?? 1);
            const inStock = initialProduct.inStock !== undefined ? Boolean(initialProduct.inStock) : (initialProduct.in_stock !== undefined ? Boolean(initialProduct.in_stock) : true);
            const img = initialProduct.primaryImage || initialProduct.image || initialProduct.image_url || '/placeholder.jpg';

            return {
                id: initialProduct.id,
                name: initialProduct.name,
                description: initialProduct.description,
                retailPrice,
                wholesalePrice,
                wholesaleMOQ,
                primaryImage: img,
                image: img,
                videoUrl: initialProduct.videoUrl || initialProduct.video_url,
                gallery: (initialProduct.gallery && initialProduct.gallery.length > 0) ? initialProduct.gallery : [{ id: '1', type: 'image', url: img }],
                category: initialProduct.category || 'Tools',
                inStock,
                quantity: initialProduct.quantity !== undefined && initialProduct.quantity !== null ? initialProduct.quantity : 15,
                reviews: initialProduct.reviews || [],
                brand: initialProduct.brand || "Dinanath & Sons",
                modelNumber: initialProduct.modelNumber || initialProduct.model_number,
                sku: initialProduct.sku || initialProduct.id,
                weight: initialProduct.weight,
                dimensions: initialProduct.dimensions,
                warrantyInfo: initialProduct.warrantyInfo || initialProduct.warranty_info,
                features: initialProduct.features || [],
                specifications: initialProduct.specifications || {},
                variants: Array.isArray(initialProduct.variants) ? initialProduct.variants : (typeof initialProduct.variants === 'string' ? JSON.parse(initialProduct.variants || '[]') : []),
                variantType: initialProduct.variantType || initialProduct.variant_type || 'Size'
            };
        }
        return null;
    });

    const [selectedVariant, setSelectedVariant] = useState<any | null>(() => {
        const rawVars = initialProduct?.variants;
        const list = Array.isArray(rawVars) ? rawVars : (typeof rawVars === 'string' ? (() => { try { return JSON.parse(rawVars); } catch { return []; } })() : []);
        return (list && list.length > 0) ? list[0] : null;
    });

    const [loading, setLoading] = useState(!initialProduct);
    const [qty, setQty] = useState(1);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [addedAlert, setAddedAlert] = useState(false);

    useEffect(() => {
        if (product) {
            viewProduct(product.id);
            return;
        }

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
                    retailPrice: data.retail_price ?? data.retailPrice ?? 0,
                    wholesalePrice: data.wholesale_price ?? data.wholesalePrice,
                    wholesaleMOQ: data.wholesale_moq ?? data.wholesaleMOQ ?? 1,
                    primaryImage: data.image || data.primaryImage || '/placeholder.jpg',
                    image: data.image || data.primaryImage || '/placeholder.jpg',
                    videoUrl: data.video_url || data.videoUrl,
                    gallery: data.gallery || [],
                    category: data.category,
                    inStock: data.in_stock ?? data.inStock ?? true,
                    quantity: data.quantity !== undefined && data.quantity !== null ? data.quantity : 15,
                    reviews: data.reviews || [],
                    brand: data.brand || "Dinanath & Sons",
                    modelNumber: data.model_number || data.modelNumber,
                    sku: data.sku || data.id,
                    weight: data.weight,
                    dimensions: data.dimensions,
                    warrantyInfo: data.warranty_info || data.warrantyInfo,
                    features: data.features || [],
                    specifications: data.specifications || {},
                    variants: data.variants || [],
                    variantType: data.variant_type || data.variantType
                };

                setProduct(mappedProduct);
                if (mappedProduct.variants && mappedProduct.variants.length > 0) {
                    setSelectedVariant(mappedProduct.variants[0]);
                }
                setQty(1);
                viewProduct(mappedProduct.id);
            } catch (err) {
                import('@/lib/data').then((module) => {
                    const localProduct = module.products.find(p => p.id === id);
                    if (localProduct) {
                        setProduct(localProduct);
                        if (localProduct.variants && localProduct.variants.length > 0) {
                            setSelectedVariant(localProduct.variants[0]);
                        }
                        setQty(1);
                        viewProduct(localProduct.id);
                    }
                });
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [id, isRetail, viewProduct, product]);

    if (loading) return <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center"><Loader2 className="animate-spin text-[#966E2E]" size={48} /></div>;
    if (!product) return <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center text-[#18181B] uppercase tracking-widest text-xs">Product Not Found</div>;


    const gallery = getProductGallery(product);
    const isWishlisted = wishlist.includes(product.id);

    const activeDisplayImage = (selectedVariant && selectedVariant.image) 
        ? selectedVariant.image 
        : (gallery[selectedMediaIndex]?.url || product.primaryImage);

    const activePrice = (selectedVariant && selectedVariant.price !== undefined && selectedVariant.price !== null && selectedVariant.price !== '') 
        ? Number(selectedVariant.price) 
        : product.retailPrice;

    const activeSku = (selectedVariant && selectedVariant.sku) ? selectedVariant.sku : (product.sku || product.id.slice(0, 8).toUpperCase());
    const isVariantInStock = (selectedVariant && selectedVariant.inStock !== undefined) 
        ? !!selectedVariant.inStock 
        : ((selectedVariant && selectedVariant.in_stock !== undefined) ? !!selectedVariant.in_stock : product.inStock);
    const isPriceInvalid = !activePrice || activePrice <= 0;
    const canPurchase = isVariantInStock && !isPriceInvalid;

    const handleAddToCart = () => {
        if (isRetail) {
            addToCart({
                productId: product.id,
                variantId: selectedVariant?.id || undefined,
                variantName: selectedVariant?.name || undefined,
                quantity: qty,
                price: activePrice,
                mode: mode
            });
            setAddedAlert(true);
            setTimeout(() => setAddedAlert(false), 3000);
        } else {
            const varInfo = selectedVariant ? ` (Variant: ${selectedVariant.name})` : '';
            const message = `Hi Dinanath & Sons, I am interested in a wholesale quotation for: ${product.name}${varInfo} (SKU: ${activeSku}). Qty: ${qty}`;
            window.open(`https://wa.me/919953435647?text=${encodeURIComponent(message)}`, '_blank');
        }
    };

    const handleBuyNow = () => {
        if (isRetail) {
            addToCart({
                productId: product.id,
                variantId: selectedVariant?.id || undefined,
                variantName: selectedVariant?.name || undefined,
                quantity: qty,
                price: activePrice,
                mode: mode
            });
            router.push('/cart');
        } else {
            handleAddToCart();
        }
    };

    // Calculations for Mock original price
    const originalPrice = Math.round(activePrice * 1.2 / 100) * 100;
    const discountPercent = 16;

    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] pt-2 sm:pt-4 md:pt-6 pb-20 selection:bg-[#966E2E]/20">
            <div className="max-w-[1400px] mx-auto px-3.5 sm:px-6 md:px-12">
                
                {/* 1. BREADCRUMBS PATH */}
                <div className="mb-2.5 sm:mb-6 text-left">
                    <Breadcrumbs items={[
                        { label: 'Inventory', href: '/shop' },
                        { 
                            label: product.category, 
                            href: `/shop/category/${
                                product.category?.toLowerCase() === 'machinery' ? 'machines' :
                                product.category?.toLowerCase() === 'consumables' ? 'polishing' :
                                product.category?.toLowerCase() === 'packaging' ? 'packaging' :
                                product.category?.toLowerCase() === 'chemicals' ? 'chemicals' :
                                product.category?.toLowerCase() === 'bullion' ? 'bullion' : 'hand-tools'
                            }` 
                        },
                        { label: product.name }
                    ]} />
                </div>

                {/* 2. PRODUCT LAYOUT HEADER */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-16 items-start">
                    
                    {/* LEFT COLUMN: Gallery View & Thumbnails */}
                    <div className="lg:col-span-6 space-y-3 sm:space-y-6">
                        <div className="relative aspect-square max-h-[360px] sm:max-h-none mx-auto w-full bg-white border border-[#E8E2D5] rounded-2xl overflow-hidden flex items-center justify-center group shadow-xs p-3 sm:p-6">
                            {gallery[selectedMediaIndex]?.type === 'video' ? (
                                <video src={gallery[selectedMediaIndex].url} controls autoPlay className="w-full h-full object-contain" />
                            ) : (
                                <SecureImage src={activeDisplayImage} containerClassName="w-full h-full" className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" alt={product.name} />
                            )}
                            
                            {/* Badges Overlay */}
                            <div className="absolute top-3 left-3 sm:top-6 sm:left-6 flex gap-2 sm:gap-3">
                                {product.brand && <span className="bg-[#966E2E] text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 sm:px-3 sm:py-1 rounded shadow-xs">{product.brand}</span>}
                                {!product.inStock && <span className="bg-[#D12A1C] text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 sm:px-3 sm:py-1 rounded shadow-xs">Out of Stock</span>}
                            </div>
                        </div>

                        {/* Thumbnail Bar */}
                        <div className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-1.5 scrollbar-hide">
                            {gallery.map((media, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedMediaIndex(idx)}
                                    className={`relative shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border bg-white p-1.5 sm:p-2 flex items-center justify-center transition-all ${selectedMediaIndex === idx ? 'border-[#966E2E] scale-105 shadow-xs' : 'border-[#E8E2D5] opacity-60 hover:opacity-100'}`}
                                >
                                    <SecureImage src={media.url} containerClassName="w-full h-full" className="w-full h-full object-contain" alt={`${product.name} thumbnail ${idx + 1}`} />
                                    {media.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><PlayCircle size={16} className="text-[#966E2E]" /></div>}
                                </button>
                            ))}
                        </div>
                    </div>
 
                    {/* RIGHT COLUMN: Product Config & Buy Section */}
                    <div className="lg:col-span-6 flex flex-col text-left space-y-4 sm:space-y-6">
                        
                        {/* Meta Tags */}
                        <div className="flex items-center gap-2 text-[#966E2E] text-[8.5px] sm:text-[9px] font-bold uppercase tracking-[0.18em]">
                            <span>{product.category}</span>
                            {product.modelNumber && <span>• MODEL: {product.modelNumber}</span>}
                        </div>
                        
                        {/* Title - Mobile-Optimized Typography */}
                        <h1 className="text-xl sm:text-3xl md:text-5xl font-bold font-display text-[#18181B] tracking-wide uppercase leading-snug line-clamp-3 sm:line-clamp-none">{product.name}</h1>
                        
                        {/* Honest Review count & Ratings */}
                        <div className="flex items-center gap-4 sm:gap-6 text-[#52525B] text-xs">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <div className="flex text-[#966E2E] gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={13} 
                                            className={product.reviews && product.reviews.length > 0 ? "fill-[#966E2E] stroke-none" : "stroke-[#A1A1AA] fill-none"} 
                                        />
                                    ))}
                                </div>
                                <span className="font-bold text-[11px] sm:text-xs">
                                    {product.reviews && product.reviews.length > 0 ? (
                                        <span className="text-[#966E2E]">({product.reviews.length} {product.reviews.length === 1 ? 'Review' : 'Reviews'})</span>
                                    ) : (
                                        <span className="text-[#71717A] font-medium">No reviews yet</span>
                                    )}
                                </span>
                            </div>
                            <div className="h-3 w-px bg-[#E8E2D5]" />
                            <span className="font-mono text-[9.5px] sm:text-[10px] uppercase tracking-wider text-[#71717A]">SKU: {activeSku}</span>
                        </div>

                        {/* PRODUCT DETAILS & QUANTITY SPECIFICATIONS PANEL */}
                        <div className="bg-white border border-[#E8E2D5] hover:border-[#966E2E]/40 rounded-2xl p-5 space-y-4 shadow-xs transition-all">
                            {/* Stock Quantity Header Indicator */}
                            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-3 h-3 rounded-full relative flex items-center justify-center ${canPurchase ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                        {canPurchase && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                                        Available Stock Quantity: <span className="text-[#966E2E] font-mono text-sm">{product.quantity ?? 15} Units</span>
                                    </span>
                                </div>
                                <span className={`text-[8.5px] font-bold uppercase tracking-widest px-2.5 py-1 rounded ${canPurchase ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                    {canPurchase ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>

                            {/* Product Specifications & Details Chips */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {product.brand && (
                                    <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E8E2D5]">
                                        <span className="text-[7.5px] text-[#71717A] font-mono font-bold uppercase tracking-widest block">Brand</span>
                                        <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider truncate block mt-0.5">{product.brand}</span>
                                    </div>
                                )}
                                {product.modelNumber && (
                                    <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E8E2D5]">
                                        <span className="text-[7.5px] text-[#71717A] font-mono font-bold uppercase tracking-widest block">Model</span>
                                        <span className="text-xs font-bold text-[#966E2E] uppercase tracking-wider truncate block mt-0.5">{product.modelNumber}</span>
                                    </div>
                                )}
                                {product.weight && (
                                    <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E8E2D5]">
                                        <span className="text-[7.5px] text-[#71717A] font-mono font-bold uppercase tracking-widest block">Weight</span>
                                        <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider truncate block mt-0.5">{product.weight}</span>
                                    </div>
                                )}
                                {product.dimensions && (product.dimensions.length || product.dimensions.width) && (
                                    <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E8E2D5]">
                                        <span className="text-[7.5px] text-[#71717A] font-mono font-bold uppercase tracking-widest block">Dimensions</span>
                                        <span className="text-xs font-bold text-[#18181B] uppercase tracking-wider truncate block mt-0.5">
                                            {product.dimensions.length}x{product.dimensions.width} {product.dimensions.height ? `x${product.dimensions.height}` : ''}
                                        </span>
                                    </div>
                                )}
                                {product.warrantyInfo && (
                                    <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E8E2D5]">
                                        <span className="text-[7.5px] text-[#71717A] font-mono font-bold uppercase tracking-widest block">Warranty</span>
                                        <span className="text-xs font-bold text-[#966E2E] uppercase tracking-wider truncate block mt-0.5">{product.warrantyInfo}</span>
                                    </div>
                                )}
                            </div>

                            {/* Additional Specifications (Sizes, Material, Tolerances, etc.) */}
                            {product.specifications && Object.keys(product.specifications).length > 0 && (
                                <div className="space-y-2 pt-1 border-t border-[#E8E2D5]">
                                    <span className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-[#966E2E] block">
                                        Specifications & Technical Data:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(product.specifications).map(([key, val]) => (
                                            <div key={key} className="bg-[#FAF9F5] px-3 py-1.5 rounded-lg border border-[#E8E2D5] flex items-center gap-2 text-xs">
                                                <span className="text-[#71717A] font-mono text-[9px] uppercase font-bold">{key}:</span>
                                                <span className="text-[#18181B] font-bold uppercase">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Specifications Bullet list (only if configured on product) */}
                        {product.features && product.features.length > 0 && (
                            <div className="border-y border-[#E8E2D5] py-6 space-y-3.5">
                                {product.features.map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#966E2E] shrink-0 mt-2" />
                                        <p className="text-sm text-[#52525B] font-medium leading-relaxed">{feat}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pricing display & Purchasing Block */}
                        <div className="bg-white border border-[#E8E2D5] rounded-2xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 shadow-xs">
                            <div className="flex items-baseline gap-2.5 sm:gap-4 flex-wrap">
                                {isPriceInvalid ? (
                                    <div className="space-y-1">
                                        <span className="text-xl sm:text-2xl font-black text-[#D12A1C] uppercase tracking-wider block">Out of Stock</span>
                                        <p className="text-[#71717A] text-[9px] sm:text-[10px] font-bold uppercase">This product is currently out of stock or price is pending update.</p>
                                    </div>
                                ) : (
                                    <>
                                        <span className="text-2xl sm:text-4xl md:text-5xl font-black text-[#18181B] tracking-tight">₹{activePrice.toLocaleString('en-IN')}</span>
                                        <span className="text-[#71717A] text-sm sm:text-base line-through uppercase font-bold">₹{originalPrice.toLocaleString('en-IN')}</span>
                                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">({discountPercent}% OFF)</span>
                                    </>
                                )}
                            </div>

                            {/* --- VARIANT SELECTOR (DIRECTLY BELOW PRICE) --- */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="pt-2 border-t border-[#E8E2D5] space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-[#18181B] flex items-center gap-1.5">
                                            <span>Select {product.variantType || 'Option / Size / Variant'}:</span>
                                            {selectedVariant?.name && (
                                                <span className="text-[#966E2E] font-bold">({selectedVariant.name})</span>
                                            )}
                                        </label>
                                        {selectedVariant?.sku && (
                                            <span className="text-[9px] font-mono font-bold text-[#71717A] uppercase bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E8E2D5]">
                                                SKU: {selectedVariant.sku}
                                            </span>
                                        )}
                                    </div>

                                    {/* Toggle buttons */}
                                    <div className="flex flex-wrap gap-2.5">
                                        {product.variants.map((v: any, idx: number) => {
                                            const isSelected = selectedVariant?.id === v.id || (!selectedVariant && idx === 0);
                                            const vPrice = (v.price !== undefined && v.price !== null && v.price !== '') ? Number(v.price) : product.retailPrice;
                                            const inStock = v.inStock !== undefined ? !!v.inStock : (v.in_stock !== undefined ? !!v.in_stock : true);

                                            return (
                                                <button
                                                    key={v.id || idx}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedVariant(v);
                                                        if (v.image) {
                                                            const existingIdx = gallery.findIndex(g => g.url === v.image);
                                                            if (existingIdx >= 0) setSelectedMediaIndex(existingIdx);
                                                        }
                                                    }}
                                                    className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-amber-50/80 border-[#966E2E] text-[#18181B] shadow-xs ring-1 ring-[#966E2E]'
                                                            : 'bg-[#FAF9F5] border-[#E8E2D5] text-[#52525B] hover:border-[#966E2E]/40 hover:text-[#18181B]'
                                                    }`}
                                                >
                                                    {v.image && (
                                                        <div className="w-5 h-5 rounded overflow-hidden bg-white border border-[#E8E2D5] shrink-0">
                                                            <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <span className="uppercase tracking-wider">{v.name || v.title}</span>
                                                    <span className="font-mono text-[10px] text-[#966E2E] font-bold">
                                                        ₹{vPrice.toLocaleString('en-IN')}
                                                    </span>
                                                    {!inStock && (
                                                        <span className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase">OOS</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Purchase Quantity and CTAs */}
                            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
                                {/* Quantity input */}
                                <div className="flex items-center bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-1 h-11 sm:h-14 w-full sm:w-36 shrink-0 shadow-xs">
                                    <button disabled={!canPurchase} onClick={() => setQty(Math.max(1, qty - 1))} className="flex-1 h-full text-[#71717A] hover:text-[#18181B] transition-colors font-bold text-base sm:text-lg disabled:opacity-30 flex items-center justify-center cursor-pointer">-</button>
                                    <span className="w-10 text-center font-mono font-bold text-xs sm:text-sm text-[#18181B]">{qty}</span>
                                    <button disabled={!canPurchase} onClick={() => setQty(qty + 1)} className="flex-1 h-full text-[#71717A] hover:text-[#18181B] transition-colors font-bold text-base sm:text-lg disabled:opacity-30 flex items-center justify-center cursor-pointer">+</button>
                                </div>
                                
                                <div className="flex items-center gap-2 sm:gap-3.5 flex-1">
                                    {/* Premium Add to Cart button */}
                                    <button 
                                        onClick={handleAddToCart}
                                        disabled={!canPurchase}
                                        className={`flex-1 h-11 sm:h-14 px-3 sm:px-6 rounded-xl flex items-center justify-center gap-2 sm:gap-3 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-[11px] transition-all duration-300 active:scale-[0.98] shadow-sm cursor-pointer ${
                                            !canPurchase 
                                                ? 'bg-[#F3EFE6] text-[#A1A1AA] cursor-not-allowed border border-[#E8E2D5]' 
                                                : 'bg-[#966E2E] hover:bg-[#7D5A25] text-white hover:-translate-y-0.5'
                                        }`}
                                    >
                                        <ShoppingCart size={15} strokeWidth={2.5} />
                                        <span>{canPurchase ? 'Add to Cart' : 'Out of Stock'}</span>
                                    </button>

                                    {/* Buy Now button */}
                                    {canPurchase && (
                                        <button 
                                            onClick={handleBuyNow}
                                            className="flex-1 h-11 sm:h-14 px-3 sm:px-6 rounded-xl font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-[11px] transition-all duration-300 active:scale-[0.98] bg-white hover:bg-[#FAF9F5] border border-[#966E2E] text-[#966E2E] shadow-sm hover:-translate-y-0.5 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
                                        >
                                            <Zap size={14} className="text-[#966E2E]" fill="currentColor" />
                                            <span>Buy Now</span>
                                        </button>
                                    )}

                                    {/* Wishlist heart toggle */}
                                    <button 
                                        onClick={() => toggleWishlist(product.id)}
                                        className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                            isWishlisted 
                                                ? 'bg-red-50 text-red-600 border-red-200 shadow-xs' 
                                                : 'bg-white border-[#E8E2D5] text-[#71717A] hover:text-[#18181B] hover:border-[#966E2E]/40'
                                        }`}
                                        title="Add to Wishlist"
                                    >
                                        <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                                    </button>
                                </div>

                                {/* Unique Shareable Link Button */}
                                <ShareButton product={product} />
                            </div>

                            {/* Sleek WhatsApp Inquiry Button */}
                            <div className="pt-1 flex items-center justify-between">
                                <a 
                                    href={`https://api.whatsapp.com/send?phone=919953435647&text=${encodeURIComponent(
                                        `Hello Dinanath & Sons, I would like to make an inquiry for "${product.name}"${selectedVariant ? ` (Variant: ${selectedVariant.name})` : ''}.\nProduct Link: https://dinanathandsons.com/shop/${product.slug || product.id}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10.5px] font-bold uppercase tracking-wider bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-all shadow-xs active:scale-95 cursor-pointer"
                                >
                                    <MessageSquare size={14} />
                                    <span>WhatsApp Inquiry</span>
                                </a>
                                <span className="text-[9.5px] text-[#71717A] font-mono font-bold uppercase">Direct Workshop Desk</span>
                            </div>
                        </div>

                        {/* Succesful Cart Addition Banner */}
                        <AnimatePresence>
                            {addedAlert && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-700 text-xs font-bold uppercase tracking-wider shadow-xs"
                                >
                                    <CheckCircle2 size={16} />
                                    <span>Product added to your cart successfully!</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. RETURN POLICY & TRUST STRIP BOX */}
                        <div className="bg-white border border-[#E8E2D5] hover:border-[#966E2E]/40 rounded-xl p-5 space-y-3 shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] flex items-center justify-center shrink-0 shadow-xs">
                                    <RotateCcw size={20} />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2">
                                        Return Policy Notice
                                    </h4>
                                    <p className="text-[10px] text-[#71717A] font-medium leading-relaxed mt-0.5">
                                        No Return Policy available on almost all products (except where explicitly marked on specific items). Manufacturing defect inspection applies upon delivery. <Link href="/return-policy" className="text-[#966E2E] underline font-bold">View Details</Link>
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
                                <div key={i} className="bg-white border border-[#E8E2D5] rounded-xl p-3.5 flex flex-col items-center text-center shadow-xs">
                                    <item.icon size={18} className="text-[#966E2E] mb-2" />
                                    <h5 className="text-[10px] font-bold text-[#18181B] uppercase tracking-wider mb-0.5">{item.label}</h5>
                                    <span className="text-[8px] text-[#71717A] uppercase font-bold">{item.desc}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                {/* 4. TECHNICAL SPECIFICATIONS SECTION */}
                <div className="mt-28 space-y-8">
                    <div className="border-b border-[#E8E2D5] pb-4 text-left">
                        <h2 className="text-2xl md:text-3xl font-bold font-display text-[#18181B] uppercase tracking-wider">Technical Specifications</h2>
                        <p className="text-[#71717A] text-[9px] font-bold uppercase tracking-widest mt-1">In-depth engineering & manufacturing details</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className={`${product.features && product.features.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-1 text-left`}>
                            {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                                <div key={key} className={`flex py-4 px-6 rounded-lg border border-transparent ${idx % 2 === 0 ? 'bg-white shadow-xs' : ''}`}>
                                    <span className="w-1/3 text-[9px] font-bold text-[#71717A] uppercase tracking-widest self-center">{key}</span>
                                    <span className="flex-1 text-xs font-bold text-[#18181B] uppercase tracking-wider">{val}</span>
                                </div>
                            ))}
                            {Object.entries(product.specifications || {}).length === 0 && (
                                <div className="py-8 text-[#71717A] italic text-sm">No technical specs configured for this model.</div>
                            )}
                        </div>
                        
                        {/* Model highlights (only if configured on product) */}
                        {product.features && product.features.length > 0 && (
                            <div className="lg:col-span-4 bg-white border border-[#E8E2D5] rounded-xl p-6 space-y-6 text-left h-fit shadow-xs">
                                <h3 className="text-sm font-bold text-[#18181B] uppercase tracking-wider flex items-center gap-2 border-b border-[#E8E2D5] pb-3">
                                    <Zap size={14} className="text-[#966E2E]" /> Core Features
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {product.features.map((feat, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-[#FAF9F5] text-[#966E2E] border border-[#E8E2D5] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                                <Check size={10} strokeWidth={3} />
                                            </div>
                                            <p className="text-[#52525B] text-xs font-normal leading-relaxed">{feat}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
