'use client';

import { Product } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { ShoppingCart, MessageCircle, Package, Heart, Star, Layers, Eye, Zap, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ProductQuickView } from './product-quick-view';
import { Currency } from '@/components/currency';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-is-mobile';

export function ProductCard({ product, compact = false, list = false }: { product: Product, compact?: boolean, list?: boolean }) {
    const { mode, language, cart, wishlist, addToCart, updateQuantity, toggleWishlist } = useAppStore();
    const t = translations[language]?.product || translations['en'].product;
    const isRetail = mode === 'retail';
    const isWishlisted = wishlist.includes(product.id);
    const isMobile = useIsMobile();
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
                <div className="glass rounded-2xl overflow-hidden brutalist-card h-full shadow-sm">
                    <div className="aspect-square bg-[#F5F5F7] flex items-center justify-center relative p-4">
                        {(product.image || product.primaryImage) && !imgError ? (
                            <img src={product.image || product.primaryImage} alt={product.name} onError={() => setImgError(true)}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 mix-blend-multiply" />
                        ) : (
                            <span className="text-2xl font-black text-[#E5E5E7]">{product.category[0]}</span>
                        )}
                    </div>
                    <div className="p-4 border-t border-black/[0.04]">
                        <h4 className="text-[10px] font-black text-[#86868B] truncate group-hover:text-[#C9A84C] transition-colors uppercase tracking-[0.2em]">{product.name}</h4>
                        <p className="text-[11px] font-black text-[#C9A84C] mt-2 tracking-widest">
                            {isRetail ? <Currency value={product.retailPrice} /> : 'B2B'}
                        </p>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`group relative rounded-[2.5rem] transition-all duration-700 flex ${list ? 'flex-col lg:flex-row items-stretch h-auto' : 'flex-col h-full'} bg-[#FFFFFF] border border-black/[0.04] shadow-sm hover:shadow-2xl`}
        >
            {/* Image Section */}
            <div className={`relative shrink-0 ${list ? 'w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-black/[0.04]' : 'aspect-[4/5] w-full'} rounded-t-[2.5rem] lg:rounded-l-[2.5rem] lg:rounded-tr-none overflow-hidden bg-[#F5F5F7]`}>
                <Link href={`/shop/${product.id}`} className="block absolute inset-0 z-0 p-10">
                    {(product.image || product.primaryImage) && !imgError ? (
                        <img src={product.image || product.primaryImage} alt={product.name} onError={() => setImgError(true)}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 group-hover:rotate-1 transition-transform duration-[1.5s] ease-out" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#E5E5E7]">
                            <span className="text-7xl font-black uppercase tracking-tighter">{product.category[0]}</span>
                        </div>
                    )}
                </Link>

                {/* Floating Tags */}
                <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
                    <div className="glass-strong text-[#1D1D1F] text-[9px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.25em] backdrop-blur-3xl border border-black/[0.08] shadow-lg">
                        {product.category}
                    </div>
                </div>

                {/* Wishlist Link */}
                <div className="absolute top-6 right-6 z-20">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${isWishlisted ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'glass text-[#86868B] hover:text-red-500 hover:border-red-500/20 hover:bg-black/5'}`}>
                        <Heart size={18} className={isWishlisted ? "fill-red-500" : ""} />
                    </button>
                </div>

                {/* Overlay Action */}
                <div className="absolute inset-0 pointer-events-none bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-8 z-20">
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsQuickViewOpen(true); }}
                        className="pointer-events-auto glass-gold text-[#0A0A0F] text-[10px] font-black px-8 py-3.5 rounded-xl uppercase tracking-[0.3em] flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all duration-700 hover:scale-105 shadow-xl"
                        style={{ background: 'linear-gradient(135deg, #E8D48B, #C9A84C)' }}
                    >
                        <Eye size={16} /> View Details
                    </button>
                </div>
            </div>

            {/* Info Section */}
            <div className={`p-5 md:p-8 lg:p-10 flex flex-col flex-1 relative ${list ? 'justify-center' : ''}`}>
                
                {/* Meta Row */}
                <div className="flex items-center gap-6 mb-6">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= Math.round(rating) ? 'bg-[#C9A84C]' : 'bg-[#E5E5E7]'}`} />
                        ))}
                    </div>
                    <span className="text-[10px] text-[#86868B] font-black uppercase tracking-[0.2em]">{product.reviews?.length || 0} REVIEWS</span>
                </div>

                <Link href={`/shop/${product.id}`}>
                    <h3 className={`font-black text-[#1D1D1F] leading-[1.2] uppercase tracking-tight group-hover:text-[#C9A84C] transition-colors duration-500 ${list ? 'text-2xl md:text-3xl xl:text-4xl mb-6' : 'text-lg md:text-xl mb-6'}`}>
                        {product.name}
                    </h3>
                </Link>

                {list && (
                    <div className="hidden lg:block mb-8">
                        <p className="text-[#6E6E73] text-lg leading-relaxed font-medium mb-6 pr-12">{product.description}</p>
                        <div className="flex flex-wrap gap-3">
                            {product.variantAttributes && Object.entries(product.variantAttributes).slice(0, 4).map(([key, value]) => (
                                <div key={key} className="glass px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#86868B] border border-black/[0.04]">
                                    <span className="text-[#C9A84C]/50 mr-2">{key}:</span>{value}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Price & Action Matrix */}
                <div className={`mt-auto pt-6 md:pt-10 border-t border-black/[0.04] flex ${list ? 'flex-col sm:flex-row items-center justify-between gap-6' : 'flex-col gap-5'}`}>
                    
                    <div className="w-full text-center sm:text-left">
                        <p className="text-[8px] md:text-[9px] font-black text-[#86868B] uppercase tracking-[0.4em] mb-2 md:mb-3">{isRetail ? 'Price' : 'Wholesale Price'}</p>
                        <div className={`font-black text-[#1D1D1F] ${list ? 'text-xl md:text-3xl xl:text-4xl' : 'text-lg md:text-2xl'}`}>
                            {isRetail ? (
                                <span className="flex items-baseline gap-1 justify-center sm:justify-start">
                                    <Currency value={product.retailPrice} />
                                    <span className="text-[9px] md:text-[10px] text-[#86868B] font-medium tracking-normal ml-1 md:ml-2 whitespace-nowrap">INC. TAX</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-3 text-blue-600 text-base md:text-lg uppercase tracking-widest">
                                    Contact for Price
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="w-full flex-shrink-0 flex justify-center">
                        {isRetail ? (
                            cart.find(item => item.productId === product.id && item.mode === 'retail') ? (
                                <div className="flex items-center gap-2 md:gap-3 p-1 glass rounded-2xl border border-[#C9A84C]/20 w-full justify-between h-12 md:h-14 shadow-lg bg-white/50 backdrop-blur-xl">
                                    <button onClick={(e) => { e.preventDefault(); updateQuantity(product.id, undefined, 'retail', (cart.find(item => item.productId === product.id && item.mode === 'retail')?.quantity || 1) - 1); }}
                                        className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-[#1D1D1F] hover:text-[#C9A84C] transition-all font-black text-lg bg-black/[0.04] hover:bg-black/[0.08]">-</button>
                                    <span className="text-[#1D1D1F] font-black text-sm md:text-base px-1 md:px-2">{cart.find(item => item.productId === product.id && item.mode === 'retail')?.quantity}</span>
                                    <button onClick={(e) => { e.preventDefault(); updateQuantity(product.id, undefined, 'retail', (cart.find(item => item.productId === product.id && item.mode === 'retail')?.quantity || 0) + 1); }}
                                        className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-[#1D1D1F] hover:text-[#C9A84C] transition-all font-black text-lg bg-black/[0.04] hover:bg-black/[0.08]">+</button>
                                </div>
                            ) : (
                                <button onClick={(e) => { e.preventDefault(); addToCart({ productId: product.id, quantity: 1, price: product.retailPrice, mode: 'retail' }); }}
                                    disabled={!product.inStock}
                                    className={`h-12 md:h-14 px-4 md:px-8 rounded-2xl flex items-center justify-center transition-all duration-500 font-black tracking-[0.2em] text-[9px] md:text-[10px] uppercase gap-3 md:gap-4 w-full shadow-xl ${product.inStock ? 'glass-gold text-[#0A0A0F] hover:scale-105 active:scale-95' : 'text-[#86868B] cursor-not-allowed glass border-black/[0.04]'}`}
                                    style={product.inStock ? { background: 'linear-gradient(135deg, #E8D48B, #C9A84C)' } : {}}>
                                    <ShoppingCart size={isMobile ? 16 : 18} />
                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                            )
                        ) : (
                            <button onClick={(e) => { e.preventDefault(); handleGetQuote(); }}
                                className="h-12 md:h-14 px-6 md:px-8 glass rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center gap-3 md:gap-4 font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] transition-all w-full shadow-lg">
                                <MessageCircle size={isMobile ? 16 : 18} /> Contact Us
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <ProductQuickView product={product} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />
        </motion.div>
    );
}
