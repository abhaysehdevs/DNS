'use client';

import { Product, getProductGallery } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { X, ShoppingCart, MessageCircle, Star, Heart, Eye, PlayCircle, Layers, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Currency } from '@/components/currency';

export function ProductQuickView({ product, isOpen, onClose }: { product: Product, isOpen: boolean, onClose: () => void }) {
    const { mode, language, cart, addToCart, wishlist, toggleWishlist } = useAppStore();
    const t = translations[language];
    const isRetail = mode === 'retail';
    const isWishlisted = wishlist.includes(product.id);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [qty, setQty] = useState(isRetail ? 1 : product.wholesaleMOQ);
    const gallery = getProductGallery(product);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setQty(isRetail ? 1 : product.wholesaleMOQ);
            setSelectedMediaIndex(0);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, isRetail, product.wholesaleMOQ]);

    if (!isOpen || !mounted) return null;

    const rating = product.reviews && product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 0;

    const currentPrice = isRetail ? product.retailPrice : (product.wholesalePrice ?? 0);

    const handleAddToCart = () => {
        if (isRetail) {
            addToCart({
                productId: product.id,
                quantity: qty,
                price: currentPrice,
                mode: mode,
            });
            onClose();
        } else {
            let message = `Hi Dinanath & Sons, I am interested in wholesale pricing for: ${product.name} (ID: ${product.id}). Qty: ${qty}`;
            const url = `https://wa.me/919953435647?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
                    {/* Backdrop with sophisticated blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#06060C]/90 backdrop-blur-2xl cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateX: 10, y: 40 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, rotateX: -10, y: 40 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-6xl max-h-[90vh] bg-[#0A0A0F] border border-white/[0.04] rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row noise-overlay perspective-2000"
                    >
                        {/* Ambient Glows */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-20"
                            style={{ background: 'radial-gradient(circle, rgba(201, 168, 76, 0.15) 0%, transparent 70%)' }}
                        />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none opacity-10"
                            style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)' }}
                        />

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-50 w-12 h-12 glass hover:bg-white/10 rounded-full flex items-center justify-center text-[#5A5A6A] hover:text-[#F5F5F7] transition-all group"
                        >
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <div className="flex flex-col md:flex-row w-full overflow-y-auto md:overflow-hidden">
                            
                            {/* Left: Interactive Media Gallery */}
                            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col items-center justify-center relative overflow-hidden bg-white/[0.01]">
                                
                                {/* Badges */}
                                <div className="absolute top-8 left-8 flex flex-col gap-3 z-10">
                                    <span className="glass-gold text-[#C9A84C] text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">
                                        {product.category}
                                    </span>
                                    {!product.inStock && (
                                        <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* Main Media with floating animation */}
                                <motion.div
                                    key={selectedMediaIndex}
                                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                    className="w-full aspect-square relative flex items-center justify-center mb-10 translate-z-60 preserve-3d"
                                >
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="w-full h-full flex items-center justify-center"
                                    >
                                        {gallery[selectedMediaIndex]?.type === 'video' ? (
                                            <video
                                                src={gallery[selectedMediaIndex].url}
                                                controls
                                                autoPlay
                                                loop
                                                muted
                                                className="w-full h-full object-contain mix-blend-screen drop-shadow-[0_0_40px_rgba(201,168,76,0.15)]"
                                                poster={gallery[selectedMediaIndex].thumbnailUrl}
                                            />
                                        ) : (
                                            <img
                                                src={gallery[selectedMediaIndex]?.url || product.primaryImage}
                                                alt={product.name}
                                                className="w-full h-full object-contain mix-blend-screen drop-shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                                            />
                                        )}
                                    </motion.div>
                                </motion.div>

                                {/* Thumbnails */}
                                {gallery.length > 1 && (
                                    <div className="flex gap-4 overflow-x-auto w-full pb-2 scrollbar-hide justify-center px-4">
                                        {gallery.map((media, idx) => (
                                            <button
                                                key={media.id || idx}
                                                onClick={() => setSelectedMediaIndex(idx)}
                                                className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden transition-all duration-500 glass ${selectedMediaIndex === idx ? 'border-[#C9A84C]/50 scale-110 shadow-[0_0_20px_rgba(201,168,76,0.2)]' : 'opacity-40 hover:opacity-80'}`}
                                            >
                                                <img
                                                    src={media.type === 'video' ? (media.thumbnailUrl || media.url) : media.url}
                                                    alt={media.altText || `Thumbnail ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                {media.type === 'video' && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                        <PlayCircle size={24} className="text-[#C9A84C]" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Detailed Info */}
                            <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center relative z-10 border-l border-white/[0.04]">
                                
                                <div className="space-y-8">
                                    <div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-full">
                                                <Star size={14} className="text-[#C9A84C] fill-[#C9A84C]" />
                                                <span className="text-xs text-[#F5F5F7] font-black">{rating > 0 ? rating.toFixed(1) : 'NEW'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[#5A5A6A] text-[10px] font-black uppercase tracking-[0.2em]">
                                                <ShieldCheck size={14} /> Professional Grade
                                            </div>
                                        </div>

                                        <h2 className="text-4xl md:text-5xl font-black text-[#F5F5F7] leading-tight mb-6 tracking-tight uppercase">
                                            {product.name}
                                        </h2>

                                        <p className="text-[#8E8E9A] text-base leading-relaxed mb-8 font-medium">
                                            {product.description}
                                        </p>

                                        {/* Attributes */}
                                        {product.variantAttributes && Object.keys(product.variantAttributes).length > 0 && (
                                            <div className="flex flex-wrap gap-3 mb-10">
                                                {Object.entries(product.variantAttributes).map(([key, value]) => (
                                                    <div key={key} className="glass rounded-xl px-4 py-2 flex flex-col">
                                                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#5A5A6A] font-bold mb-0.5">{key}</span>
                                                        <span className="text-xs text-[#F5F5F7] font-black uppercase">{value as string}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Box */}
                                    <div className="glass-strong rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Zap size={100} className="text-[#C9A84C]" />
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 relative z-10">
                                            <div>
                                                <p className="text-[10px] text-[#5A5A6A] uppercase tracking-[0.25em] font-black mb-2">
                                                    {isRetail ? 'Investment Value' : 'B2B Wholesale Supply'}
                                                </p>
                                                <div className="flex items-baseline gap-4">
                                                    <span className={`text-4xl font-black ${isRetail ? 'text-[#C9A84C]' : 'text-blue-400'}`}>
                                                        {isRetail ? <Currency value={currentPrice} /> : 'Industrial Quote'}
                                                    </span>
                                                </div>
                                            </div>
                                            {!isRetail && (
                                                <div className="glass px-5 py-3 rounded-2xl flex flex-col items-center">
                                                    <span className="text-[9px] text-[#5A5A6A] uppercase tracking-[0.25em] font-bold mb-1">Min Order</span>
                                                    <span className="text-xl font-black text-[#F5F5F7]">{product.wholesaleMOQ} <span className="text-xs text-[#5A5A6A]">UNITS</span></span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                                            <div className="flex items-center glass rounded-2xl overflow-hidden h-16 w-full sm:w-auto p-1">
                                                <button
                                                    onClick={() => setQty(Math.max(isRetail ? 1 : product.wholesaleMOQ, qty - 1))}
                                                    className="w-12 h-full hover:bg-white/5 text-[#5A5A6A] hover:text-[#F5F5F7] transition-colors flex items-center justify-center font-black text-xl"
                                                >-</button>
                                                <div className="flex-1 sm:w-16 flex items-center justify-center font-black text-[#F5F5F7] text-xl tabular-nums">
                                                    {qty}
                                                </div>
                                                <button
                                                    onClick={() => setQty(qty + 1)}
                                                    className="w-12 h-full hover:bg-white/5 text-[#5A5A6A] hover:text-[#F5F5F7] transition-colors flex items-center justify-center font-black text-xl"
                                                >+</button>
                                            </div>
                                            
                                            <Button
                                                onClick={handleAddToCart}
                                                disabled={!product.inStock}
                                                className={`flex-1 h-16 text-[#0A0A0F] font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all relative overflow-hidden group/btn ${!product.inStock ? 'opacity-50 grayscale' : ''}`}
                                                style={{
                                                    background: isRetail 
                                                        ? 'linear-gradient(135deg, #E8D48B, #C9A84C, #8B6914)' 
                                                        : 'linear-gradient(135deg, #60A5FA, #3B82F6, #1D4ED8)',
                                                    color: isRetail ? '#0A0A0F' : '#F5F5F7'
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 skew-x-[20deg]" />
                                                {isRetail ?
                                                    (product.inStock ? <div className="flex items-center justify-center gap-3"><ShoppingCart size={18} /> Add to Collection</div> : 'Out of Stock')
                                                    : <div className="flex items-center justify-center gap-3"><MessageCircle size={18} /> Get Factory Quote</div>
                                                }
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Footer Link */}
                                    <div className="flex items-center justify-center pt-4">
                                        <Link
                                            href={`/shop/${product.id}`}
                                            onClick={onClose}
                                            className="text-[#5A5A6A] hover:text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all group/link"
                                        >
                                            Analysis & Full Specifications <Eye size={16} className="group-hover/link:scale-110 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}
