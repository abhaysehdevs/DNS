'use client';

import { Product } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { getProductUrl } from '@/lib/slug';
import { Heart, MessageSquare } from 'lucide-react';
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
    const { wishlist, toggleWishlist } = useAppStore();
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
                            alt={`${product.name} - ${product.category} | Dinanath & Sons`} 
                            containerClassName="w-full h-full flex items-center justify-center"
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-lighten" 
                        />
                    </div>
                    <div className="p-3 border-t border-[#343434] text-left">
                        <h4 className="text-[10px] font-bold text-[#F8F3E8] truncate group-hover:text-[#A67C35] transition-colors uppercase tracking-wide">{product.name}</h4>
                        <div className="mt-1">
                            {isPriceInvalid ? (
                                <span className="text-[9px] font-bold text-[#D12A1C] uppercase">Out of Stock</span>
                            ) : (
                                <span className="text-[10px] font-bold text-[#A67C35]">₹{product.retailPrice.toLocaleString()}</span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // 3. MAIN CATALOG GRID CARD LAYOUT
    return (
        <div className={`group relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${list ? 'md:flex-row items-stretch' : 'h-full'} bg-[#242424] border border-[#343434] hover:border-[#A67C35] shadow-md hover:shadow-xl w-full`}>
            
            {/* Clickable Image Container */}
            <Link href={productUrl} className={`relative block shrink-0 ${list ? 'w-full md:w-56 lg:w-72 h-36 md:h-auto border-b md:border-b-0 md:border-r border-[#343434]' : 'h-32 sm:h-44 md:h-56 w-full'} bg-[#1E1E1E] p-2 sm:p-3 overflow-hidden flex items-center justify-center`}>
                <SecureImage 
                    src={product.image || product.primaryImage} 
                    alt={`${product.name} - ${product.category} | Dinanath & Sons Chandni Chowk`} 
                    containerClassName="w-full h-full flex items-center justify-center"
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105 mix-blend-lighten drop-shadow-md" 
                />

                {/* Category Pill Tag */}
                <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 z-10 pointer-events-none">
                    <div className="bg-[#151515] text-[#A67C35] text-[6.5px] sm:text-[7.5px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded border border-[#343434] uppercase tracking-wider shadow">
                        {product.category}
                    </div>
                </div>

                {/* Out of Stock Tag */}
                {!isAvailable && (
                    <div className="absolute bottom-1.5 left-1.5 sm:bottom-2.5 sm:left-2.5 z-10 pointer-events-none">
                        <div className="bg-[#D12A1C] text-white text-[6.5px] sm:text-[7.5px] font-black px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded uppercase tracking-wider shadow">
                            Out of Stock
                        </div>
                    </div>
                )}
            </Link>

            {/* Top Right Action Tools (Wishlist & Share) */}
            <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 z-20 flex items-center gap-1">
                <ShareButton product={product} variant="icon" />
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shadow-md transition-all duration-300 border ${
                        isWishlisted 
                            ? 'bg-[#D12A1C]/10 text-[#D12A1C] border-[#D12A1C]/20' 
                            : 'bg-[#151515] border-[#343434] text-[#8E8E9A] hover:text-[#D12A1C] hover:border-[#D12A1C]/20'
                    }`}
                >
                    <Heart size={11} className={isWishlisted ? "fill-[#D12A1C]" : ""} />
                </button>
            </div>

            {/* Content Info Area (Clean Title & Price Only) */}
            <div className="p-2 sm:p-3 flex flex-col flex-1 relative z-10 text-left justify-between">
                <div>
                    <Link href={productUrl}>
                        <h3 className="font-bold text-[#F8F3E8] text-[10px] sm:text-xs md:text-sm leading-snug uppercase tracking-wide group-hover:text-[#A67C35] transition-colors duration-300 line-clamp-2 h-7 sm:h-8 mb-1">
                            {product.name}
                        </h3>
                    </Link>

                    {list && (
                        <p className="text-[#CFCFCF] text-xs leading-relaxed line-clamp-2 mt-1.5 font-light hidden md:block">{product.description}</p>
                    )}
                </div>

                {/* Price Display Section */}
                <div className="pt-2 sm:pt-2.5 border-t border-[#343434]/60 mt-auto flex items-center justify-between">
                    <div>
                        <p className="text-[6.5px] sm:text-[7px] font-mono font-bold text-[#8E8E9A] uppercase tracking-wider mb-0.5">Price</p>
                        <div className="font-bold">
                            {isPriceInvalid ? (
                                <span className="text-[9.5px] sm:text-xs font-bold text-[#D12A1C] uppercase tracking-wider">
                                    Out of Stock
                                </span>
                            ) : (
                                <span className="text-xs sm:text-sm md:text-base font-black text-[#F8F3E8]">₹{product.retailPrice.toLocaleString()}</span>
                            )}
                        </div>
                    </div>

                    <Link href={productUrl} className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-[#A67C35] uppercase tracking-wider hover:underline">
                        View →
                    </Link>
                </div>
            </div>
        </div>
    );
}
