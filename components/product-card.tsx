'use client';

import { Product } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { ShoppingCart, MessageCircle, Heart, Shield, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ProductQuickView } from './product-quick-view';
import { Currency } from '@/components/currency';
import { motion } from 'framer-motion';

export function ProductCard({ 
    product, 
    compact = false, 
    list = false,
    lightTheme = false
}: { 
    product: Product, 
    compact?: boolean, 
    list?: boolean,
    lightTheme?: boolean
}) {
    const { mode, language, cart, wishlist, addToCart, updateQuantity, toggleWishlist } = useAppStore();
    const t = translations[language]?.product || translations['en'].product;
    const isRetail = mode === 'retail';
    const isWishlisted = wishlist.includes(product.id);
    const [imgError, setImgError] = useState(false);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const rating = product.reviews && product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 5; // Default to 5 stars for heritage branding

    const handleGetQuote = () => {
        const message = `Hi Dinanath & Sons, I am interested in wholesale pricing for: ${product.name} (SKU: ${product.sku || product.id}).`;
        const url = `https://wa.me/919953435647?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // 1. LIGHT THEME LAYOUT (For New Arrivals / Home sections)
    if (lightTheme) {
        return (
            <Link href={`/shop/${product.id}`} className="group relative bg-white border border-[#E2DCD0] rounded-xl p-4 flex flex-col text-center justify-between overflow-hidden shadow transition-all duration-300 hover:shadow-xl hover:border-[#A67C35] hover:-translate-y-1 h-full">
                {/* Red "NEW" badge */}
                <div className="absolute top-3 left-3 z-10 bg-[#D12A1C] text-white text-[7px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
                    NEW
                </div>

                <div className="flex flex-col items-center flex-1">
                    {/* Centered Image */}
                    <div className="w-full aspect-square bg-[#FAF6EE] rounded-lg p-4 flex items-center justify-center mb-4 overflow-hidden relative">
                        <img 
                            src={product.image || product.primaryImage} 
                            alt={product.name} 
                            onError={() => setImgError(true)}
                            className="w-full h-full object-contain transition-transform duration-750 group-hover:scale-105 mix-blend-multiply" 
                        />
                    </div>

                    {/* Metadata details */}
                    <div className="text-[8px] font-black text-[#8E8E9A] uppercase tracking-widest mb-1">{product.category}</div>
                    
                    <h3 className="text-[11px] font-bold text-matte-black leading-snug uppercase tracking-tight line-clamp-2 h-9 mb-2">
                        {product.name}
                    </h3>
                </div>

                {/* Price & Rating */}
                <div className="mt-2 pt-2 border-t border-[#FAF6EE] space-y-2">
                    <div className="text-xs font-black text-matte-black">
                        {isRetail ? (
                            <span>₹{product.retailPrice.toLocaleString()}</span>
                        ) : (
                            <span className="text-[9px] text-[#A67C35] uppercase font-bold tracking-wider">Wholesale Only</span>
                        )}
                    </div>
                    <div className="flex gap-0.5 justify-center text-[#A67C35]">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={9} className="fill-[#A67C35] stroke-none" />
                        ))}
                    </div>
                </div>
            </Link>
        );
    }

    // 2. COMPACT LAYOUT
    if (compact) {
        return (
            <Link href={`/shop/${product.id}`} className="block group">
                <div className="bg-[#242424] border border-[#343434] rounded-xl overflow-hidden hover:border-[#A67C35] transition-all duration-500 h-full shadow-sm">
                    <div className="aspect-square bg-[#1E1E1E] flex items-center justify-center relative p-4 overflow-hidden">
                        <img src={product.image || product.primaryImage} alt={product.name} onError={() => setImgError(true)}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-lighten" />
                    </div>
                    <div className="p-3 border-t border-[#343434] text-left">
                        <h4 className="text-[9px] font-bold text-[#CFCFCF] truncate group-hover:text-[#A67C35] transition-colors uppercase tracking-[0.15em]">{product.name}</h4>
                        <p className="text-[10px] font-bold text-[#A67C35] mt-1 tracking-wider">
                            {isRetail ? `₹${product.retailPrice.toLocaleString()}` : 'Wholesale'}
                        </p>
                    </div>
                </div>
            </Link>
        );
    }

    // 3. NORMAL DARK THEME CARD (Catalog Layout)
    return (
        <div className={`group relative rounded-xl overflow-hidden transition-all duration-500 flex ${list ? 'flex-col lg:flex-row items-stretch h-auto' : 'flex-col h-full'} bg-[#242424] border border-[#343434] hover:border-[#A67C35] shadow-lg hover:shadow-2xl`}>
            {/* Image Container */}
            <div className={`relative shrink-0 ${list ? 'w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-[#343434]' : 'aspect-square w-full'} bg-[#1E1E1E] flex items-center justify-center overflow-hidden`}>
                <Link href={`/shop/${product.id}`} className="block absolute inset-0 z-0 p-6">
                    <img 
                        src={product.image || product.primaryImage} 
                        alt={product.name} 
                        onError={() => setImgError(true)}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 mix-blend-lighten" 
                    />
                </Link>

                {/* Category Pill Tag */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <div className="bg-[#151515] text-[#A67C35] text-[7px] font-bold px-2.5 py-1 rounded border border-[#343434] uppercase tracking-wider">
                        {product.category}
                    </div>
                </div>

                {/* Wishlist Button */}
                <div className="absolute top-3 right-3 z-20">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all duration-300 border ${
                            isWishlisted 
                                ? 'bg-[#D12A1C]/10 text-[#D12A1C] border-[#D12A1C]/20' 
                                : 'bg-[#151515] border-[#343434] text-[#8E8E9A] hover:text-[#D12A1C] hover:border-[#D12A1C]/20'
                        }`}
                    >
                        <Heart size={13} className={isWishlisted ? "fill-[#D12A1C]" : ""} />
                    </button>
                </div>
            </div>

            {/* Content Info Area */}
            <div className="p-5 flex flex-col flex-1 relative z-10 text-left">
                
                {/* Meta details */}
                <div className="flex items-center gap-3 mb-3.5">
                    <div className="flex gap-1 text-[#A67C35]">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={10} className={s <= Math.round(rating) ? "fill-[#A67C35] stroke-none" : "text-[#343434] stroke-none"} />
                        ))}
                    </div>
                    <span className="text-[8px] text-[#8E8E9A] font-bold tracking-wider uppercase">{product.reviews?.length || 0} reviews</span>
                </div>

                <Link href={`/shop/${product.id}`}>
                    <h3 className={`font-bold text-[#F8F3E8] leading-snug uppercase tracking-wide group-hover:text-[#A67C35] transition-colors duration-300 ${list ? 'text-xl mb-3' : 'text-xs mb-3 line-clamp-2 h-9'}`}>
                        {product.name}
                    </h3>
                </Link>

                {list && (
                    <div className="hidden lg:block mb-4">
                        <p className="text-[#CFCFCF] text-xs leading-relaxed mb-3 pr-4">{product.description}</p>
                    </div>
                )}

                {/* Price and Action Section */}
                <div className={`mt-auto pt-4 border-t border-[#343434] flex ${list ? 'flex-col sm:flex-row items-center justify-between gap-4' : 'flex-col gap-3.5'}`}>
                    <div className="w-full text-left">
                        <p className="text-[7px] font-bold text-[#8E8E9A] uppercase tracking-wider mb-1">{isRetail ? 'Retail Price' : 'B2B Wholesale'}</p>
                        <div className="font-bold text-[#F8F3E8]">
                            {isRetail ? (
                                <span className="flex items-baseline gap-1">
                                    <span className="text-sm font-black">₹{product.retailPrice.toLocaleString()}</span>
                                    <span className="text-[7px] text-[#8E8E9A] font-bold tracking-wider ml-1">INC. GST</span>
                                </span>
                            ) : (
                                <span className="text-xs text-[#A67C35] font-bold uppercase tracking-wider">
                                    Inquiry for Price
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        {isRetail ? (
                            cart.find(item => item.productId === product.id && item.mode === 'retail') ? (
                                <div className="flex items-center gap-2 p-1 bg-[#1E1E1E] rounded-lg border border-[#343434] w-full justify-between h-9 shadow-sm">
                                    <button onClick={(e) => { e.preventDefault(); updateQuantity(product.id, undefined, 'retail', (cart.find(item => item.productId === product.id && item.mode === 'retail')?.quantity || 1) - 1); }}
                                        className="w-7 h-7 rounded bg-[#242424] flex items-center justify-center text-[#F8F3E8] hover:text-[#A67C35] hover:bg-[#343434] transition-all font-bold text-xs">-</button>
                                    <span className="text-[#F8F3E8] font-mono font-bold text-xs">{cart.find(item => item.productId === product.id && item.mode === 'retail')?.quantity}</span>
                                    <button onClick={(e) => { e.preventDefault(); updateQuantity(product.id, undefined, 'retail', (cart.find(item => item.productId === product.id && item.mode === 'retail')?.quantity || 0) + 1); }}
                                        className="w-7 h-7 rounded bg-[#242424] flex items-center justify-center text-[#F8F3E8] hover:text-[#A67C35] hover:bg-[#343434] transition-all font-bold text-xs">+</button>
                                </div>
                            ) : (
                                <button onClick={(e) => { e.preventDefault(); addToCart({ productId: product.id, quantity: 1, price: product.retailPrice, mode: 'retail' }); }}
                                    disabled={!product.inStock}
                                    className={`h-9 px-4 rounded-lg flex items-center justify-center transition-all duration-300 font-bold tracking-widest text-[8px] uppercase gap-2 w-full shadow-md ${
                                        product.inStock 
                                            ? 'bg-[#A67C35] hover:bg-[#8A6232] text-black hover:scale-[1.02] active:scale-95 cursor-pointer font-bold' 
                                            : 'text-[#8E8E9A] cursor-not-allowed bg-[#1E1E1E] border border-[#343434]'
                                    }`}
                                >
                                    <ShoppingCart size={11} strokeWidth={2.5} />
                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            )
                        ) : (
                            <button onClick={(e) => { e.preventDefault(); handleGetQuote(); }}
                                className="h-9 px-4 rounded-lg bg-[#D12A1C] hover:bg-[#b02217] text-white flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[8px] transition-all w-full shadow-md border-none">
                                <MessageCircle size={11} /> Request Quote
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ProductQuickView product={product} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />
        </div>
    );
}
