'use client';

import { Product } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { getProductUrl } from '@/lib/slug';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { SecureImage } from './secure-image';
import { ShareButton } from './share-button';

export function ProductCard({ 
    product, 
    compact = false, 
    list = false
}: { 
    product: Product, 
    compact?: boolean, 
    list?: boolean
}) {
    const { mode, wishlist, toggleWishlist } = useAppStore();
    const isRetail = mode === 'retail';
    const isWishlisted = wishlist.includes(product.id);

    const isPriceInvalid = !product.retailPrice || product.retailPrice <= 0;
    const isAvailable = product.inStock && !isPriceInvalid;
    const productUrl = getProductUrl(product);

    // 1. COMPACT CARD LAYOUT
    if (compact) {
        return (
            <Link href={productUrl} className="block group h-full">
                <div className="bg-[#242424] border border-[#343434] hover:border-[#A67C35] rounded-xl overflow-hidden transition-all duration-300 h-full shadow-sm">
                    <div className="h-44 bg-[#1E1E1E] flex items-center justify-center relative p-3 overflow-hidden">
                        <SecureImage 
                            src={product.image || product.primaryImage} 
                            alt={product.name} 
                            containerClassName="w-full h-full flex items-center justify-center"
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-lighten" 
                        />
                    </div>
                    <div className="p-3 border-t border-[#343434] text-left">
                        <h4 className="text-[10px] font-bold text-[#F8F3E8] truncate group-hover:text-[#A67C35] transition-colors uppercase tracking-wide">{product.name}</h4>
                        <div className="mt-1">
                            {isPriceInvalid ? (
                                <span className="text-[9px] font-bold text-[#D12A1C] uppercase">Out of Stock</span>
                            ) : isRetail ? (
                                <span className="text-[10px] font-bold text-[#A67C35]">₹{product.retailPrice.toLocaleString()}</span>
                            ) : (
                                <span className="text-[9px] text-[#A67C35] font-bold uppercase">Wholesale</span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // 3. MAIN CATALOG GRID CARD LAYOUT
    return (
        <div className={`group relative rounded-2xl overflow-hidden transition-all duration-500 flex ${list ? 'flex-col lg:flex-row items-stretch h-auto' : 'flex-col h-full'} bg-[#242424] border border-[#343434] hover:border-[#A67C35] shadow-lg hover:shadow-2xl`}>
            
            {/* Clickable Image Container */}
            <Link href={productUrl} className={`relative block shrink-0 ${list ? 'w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#343434]' : 'h-64 sm:h-72 w-full'} bg-[#1E1E1E] p-5 overflow-hidden flex items-center justify-center`}>
                <SecureImage 
                    src={product.image || product.primaryImage} 
                    alt={product.name} 
                    containerClassName="w-full h-full flex items-center justify-center"
                    className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105 mix-blend-lighten drop-shadow-md" 
                />

                {/* Category Pill Tag */}
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <div className="bg-[#151515] text-[#A67C35] text-[7.5px] font-bold px-2.5 py-1 rounded-md border border-[#343434] uppercase tracking-wider shadow">
                        {product.category}
                    </div>
                </div>

                {/* Out of Stock Tag */}
                {!isAvailable && (
                    <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                        <div className="bg-[#D12A1C] text-white text-[7.5px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
                            Out of Stock
                        </div>
                    </div>
                )}
            </Link>

            {/* Top Right Action Tools (Wishlist & Share) */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                <ShareButton product={product} variant="icon" />
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all duration-300 border ${
                        isWishlisted 
                            ? 'bg-[#D12A1C]/10 text-[#D12A1C] border-[#D12A1C]/20' 
                            : 'bg-[#151515] border-[#343434] text-[#8E8E9A] hover:text-[#D12A1C] hover:border-[#D12A1C]/20'
                    }`}
                >
                    <Heart size={13} className={isWishlisted ? "fill-[#D12A1C]" : ""} />
                </button>
            </div>

            {/* Content Info Area (Clean Title & Price Only) */}
            <div className="p-5 flex flex-col flex-1 relative z-10 text-left justify-between">
                <div>
                    <Link href={productUrl}>
                        <h3 className="font-bold text-[#F8F3E8] text-xs sm:text-sm leading-snug uppercase tracking-wide group-hover:text-[#A67C35] transition-colors duration-300 line-clamp-2 h-10 mb-2">
                            {product.name}
                        </h3>
                    </Link>

                    {list && (
                        <p className="text-[#CFCFCF] text-xs leading-relaxed line-clamp-2 mt-2 font-light">{product.description}</p>
                    )}
                </div>

                {/* Price Display Section */}
                <div className="pt-3 border-t border-[#343434]/60 mt-auto flex items-center justify-between">
                    <div>
                        <p className="text-[7px] font-mono font-bold text-[#8E8E9A] uppercase tracking-wider mb-0.5">{isRetail ? 'Rate' : 'B2B Wholesale'}</p>
                        <div className="font-bold">
                            {isPriceInvalid ? (
                                <span className="text-xs font-bold text-[#D12A1C] uppercase tracking-wider">
                                    Out of Stock
                                </span>
                            ) : isRetail ? (
                                <span className="text-base font-black text-[#F8F3E8]">₹{product.retailPrice.toLocaleString()}</span>
                            ) : (
                                <span className="text-xs text-[#A67C35] font-bold uppercase tracking-wider">
                                    Inquiry for Rate
                                </span>
                            )}
                        </div>
                    </div>

                    <Link href={productUrl} className="text-[8.5px] font-mono font-bold text-[#A67C35] uppercase tracking-wider hover:underline">
                        View Product →
                    </Link>
                </div>
            </div>
        </div>
    );
}
