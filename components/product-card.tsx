'use client';

import { Product } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { ShoppingCart, MessageCircle, Package, Heart, Star, Layers, Eye } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ProductQuickView } from './product-quick-view';

export function ProductCard({ product, compact = false }: { product: Product, compact?: boolean }) {
    const { mode, language, cart, wishlist, addToCart, updateQuantity, toggleWishlist } = useAppStore();
    const t = translations[language]?.product || translations['en'].product;
    const isRetail = mode === 'retail';
    const isWishlisted = wishlist.includes(product.id);
    const [imgError, setImgError] = useState(false);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const rating = product.reviews && product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 0;

    const handleGetQuote = () => {
        const message = `Hi Dinanath & Sons, I am interested in wholesale pricing for: ${product.name} (ID: ${product.id}).`;
        const url = `https://wa.me/919953435647?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    if (compact) {
        return (
            <Link href={`/shop/${product.id}`} className="block group">
                <div className="bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300">
                    <div className="aspect-square bg-white flex items-center justify-center relative overflow-hidden p-2">
                        {(product.image || product.primaryImage) && !imgError ? (
                            <img
                                src={product.image || product.primaryImage}
                                alt={product.name}
                                onError={() => setImgError(true)}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <span className="text-2xl font-bold text-gray-800">{product.category[0]}</span>
                        )}
                    </div>
                    <div className="p-3">
                        <h4 className="text-xs font-bold text-gray-200 truncate group-hover:text-amber-500 transition-colors uppercase tracking-wider">{product.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-xs font-black text-amber-500">
                                {isRetail ? `₹${product.retailPrice.toLocaleString()}` : 'B2B'}
                            </p>
                            <div className="flex items-center gap-1">
                                <Star size={10} className="text-amber-500 fill-amber-500" />
                                <span className="text-[10px] text-gray-400 font-medium">{rating > 0 ? rating.toFixed(1) : 'NEW'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <div className={`group relative bg-[#0a0a0a] border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] hover:-translate-y-1 flex flex-col h-full ${isRetail ? 'border-white/10 hover:border-amber-500/50' : 'border-white/10 hover:border-blue-500/50'}`}>
            <div className="relative aspect-square bg-white overflow-hidden shrink-0">
                <Link href={`/shop/${product.id}`} className="block absolute inset-0 z-0 p-6">
                    {(product.image || product.primaryImage) && !imgError ? (
                        <img
                            src={product.image || product.primaryImage}
                            alt={product.name}
                            onError={() => setImgError(true)}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                            <span className="text-5xl font-black uppercase">{product.category[0]}</span>
                        </div>
                    )}
                </Link>

                {/* Premium Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-none">
                    <span className="bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
                        {product.category}
                    </span>
                    {product.variants && product.variants.length > 0 && (
                        <span className="bg-amber-500 text-black text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm">
                            <Layers size={12} />
                            {product.variants.length} OPTIONS
                        </span>
                    )}
                </div>

                {/* Wishlist */}
                <div className="absolute top-3 right-3 z-20">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:bg-gray-50 hover:text-red-500'}`}
                    >
                        <Heart size={18} className={isWishlisted ? "fill-red-500" : ""} />
                    </button>
                </div>

                {/* Hover Quick View Overlay */}
                <div
                    className="absolute inset-0 pointer-events-none bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 z-20"
                >
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsQuickViewOpen(true);
                        }}
                        className="pointer-events-auto bg-black/80 backdrop-blur-md text-white text-xs font-bold px-6 py-2 rounded-full uppercase tracking-wider flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl"
                    >
                        <Eye size={16} /> Quick View
                    </button>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    size={12}
                                    className={`${s <= Math.round(rating) ? 'text-amber-500 fill-amber-500' : 'text-gray-700'}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                            ({product.reviews?.length || 0})
                        </span>
                    </div>
                    <Link href={`/shop/${product.id}`}>
                        <h3 className="text-base font-bold text-white leading-tight group-hover:text-amber-500 transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{isRetail ? 'Price' : 'B2B Wholesale'}</p>
                        <span className="text-xl font-bold text-white">
                            {isRetail ? `₹${product.retailPrice.toLocaleString()}` : (
                                <span className="flex items-center gap-1.5 text-blue-400 text-base">
                                    <Package size={16} /> Bulk Quote
                                </span>
                            )}
                        </span>
                    </div>

                    <div className="flex-shrink-0">
                        {isRetail ? (
                            cart.find(item => item.productId === product.id && item.mode === 'retail') ? (
                                <div className="flex items-center gap-2 bg-white/5 rounded-lg border border-white/10 p-1">
                                    <button
                                        onClick={(e) => { e.preventDefault(); updateQuantity(product.id, undefined, 'retail', (cart.find(item => item.productId === product.id && item.mode === 'retail')?.quantity || 1) - 1); }}
                                        className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-white hover:bg-amber-500 hover:text-black transition-all font-bold"
                                    > - </button>
                                    <span className="text-white font-bold w-4 text-center text-sm">{cart.find(item => item.productId === product.id && item.mode === 'retail')?.quantity}</span>
                                    <button
                                        onClick={(e) => { e.preventDefault(); updateQuantity(product.id, undefined, 'retail', (cart.find(item => item.productId === product.id && item.mode === 'retail')?.quantity || 0) + 1); }}
                                        className="w-7 h-7 rounded bg-white/5 flex items-center justify-center text-white hover:bg-amber-500 hover:text-black transition-all font-bold"
                                    > + </button>
                                </div>
                            ) : (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        addToCart({
                                            productId: product.id,
                                            quantity: 1,
                                            price: product.retailPrice,
                                            mode: 'retail'
                                        });
                                    }}
                                    disabled={!product.inStock}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${product.inStock ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
                                >
                                    <ShoppingCart size={18} />
                                </button>
                            )
                        ) : (
                            <button
                                onClick={(e) => { e.preventDefault(); handleGetQuote(); }}
                                className="px-4 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 font-bold transition-all shadow-md text-sm"
                            >
                                <MessageCircle size={16} /> Quote
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            <ProductQuickView
                product={product}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </div>
    );
}
