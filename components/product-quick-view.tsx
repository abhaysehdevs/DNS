'use client';

import { Product, getProductGallery } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { X, ShoppingCart, MessageCircle, Star, Heart, Package, PlayCircle, Eye, Layers, Truck } from 'lucide-react';
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

    // Prevent body scroll when modal is open
    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Auto reset state when opened
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

    const currentPrice = isRetail ? product.retailPrice : product.wholesalePrice;

    const handleAddToCart = () => {
        if (isRetail) {
            addToCart({
                productId: product.id,
                quantity: qty,
                price: currentPrice,
                mode: mode,
            });
            onClose(); // Optional: Close after adding or show success!
        } else {
            let message = `Hi Dinanath & Sons, I am interested in wholesale pricing for: ${product.name} (ID: ${product.id}). Qty: ${qty}`;
            const url = `https://wa.me/919953435647?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-12">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-5xl max-h-full bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-y-auto overflow-x-hidden"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 hover:bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/10"
                        >
                            <X size={20} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[600px]">

                            {/* Left: Interactive Media Gallery */}
                            <div className="bg-white/5 p-6 md:p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 relative group">

                                {/* Badges */}
                                <div className="absolute top-6 left-6 flex flex-col gap-2 z-10 text-left">
                                    <span className="bg-amber-500 text-black text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm w-fit">
                                        {product.category}
                                    </span>
                                    {!product.inStock && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm w-fit">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* Main Media */}
                                <motion.div
                                    key={selectedMediaIndex}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full aspect-square relative flex items-center justify-center mb-8"
                                >
                                    {gallery[selectedMediaIndex]?.type === 'video' ? (
                                        <video
                                            src={gallery[selectedMediaIndex].url}
                                            controls
                                            autoPlay
                                            loop
                                            muted
                                            className="w-full h-full object-contain mix-blend-screen"
                                            poster={gallery[selectedMediaIndex].thumbnailUrl}
                                        />
                                    ) : (
                                        <img
                                            src={gallery[selectedMediaIndex]?.url || product.primaryImage}
                                            alt={product.name}
                                            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                                        />
                                    )}
                                </motion.div>

                                {/* Thumbnails */}
                                {gallery.length > 1 && (
                                    <div className="flex gap-4 overflow-x-auto w-full pb-4 scrollbar-hide justify-center">
                                        {gallery.map((media, idx) => (
                                            <button
                                                key={media.id || idx}
                                                onClick={() => setSelectedMediaIndex(idx)}
                                                className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedMediaIndex === idx ? 'border-amber-500 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-white/10 opacity-50 hover:opacity-100 hover:scale-105 bg-white/5'}`}
                                            >
                                                <img
                                                    src={media.type === 'video' ? (media.thumbnailUrl || media.url) : media.url}
                                                    alt={media.altText || `Thumbnail ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                {media.type === 'video' && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                                        <PlayCircle size={20} className="text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Detailed Info */}
                            <div className="p-6 md:p-10 flex flex-col bg-[#0a0a0a]">
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                                            <Star size={12} className="text-amber-500 fill-amber-500" />
                                            <span className="text-[10px] text-white font-bold">{rating > 0 ? rating.toFixed(1) : 'NEW'}</span>
                                        </div>
                                        {product.reviews && product.reviews.length > 0 && (
                                            <span className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">{product.reviews.length} Reviews</span>
                                        )}
                                        <div className="ml-auto">
                                            <button
                                                onClick={() => toggleWishlist(product.id)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all ${isWishlisted ? 'border-red-500/30 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 md:hover:border-red-500/30 md:hover:text-red-500'}`}
                                            >
                                                <Heart size={18} className={isWishlisted ? "fill-red-500" : ""} />
                                            </button>
                                        </div>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
                                        {product.name}
                                    </h2>

                                    <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {product.description}
                                    </p>

                                    {/* Attributes (if any) */}
                                    {product.variantAttributes && Object.keys(product.variantAttributes).length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {Object.entries(product.variantAttributes).map(([key, value]) => (
                                                <div key={key} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex flex-col">
                                                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{key}</span>
                                                    <span className="text-xs text-white font-semibold">{value as string}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Price & Action Area */}
                                <div className="mt-auto bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                                                {isRetail ? 'Retail Price' : 'Wholesale B2B'}
                                            </p>
                                            <div className="flex items-baseline gap-3">
                                                <span className={`text-3xl md:text-4xl font-black ${isRetail ? 'text-amber-500' : 'text-blue-500'}`}>
                                                    {isRetail ? <Currency value={currentPrice} /> : 'Bulk Query'}
                                                </span>
                                            </div>
                                        </div>
                                        {!isRetail && (
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">MOQ</div>
                                                <div className="text-lg font-black text-white bg-white/10 px-3 py-1 rounded-lg border border-white/10">{product.wholesaleMOQ} Units</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex items-center border border-white/10 rounded-xl bg-black/50 overflow-hidden h-14 w-full sm:w-auto">
                                            <button
                                                onClick={() => setQty(Math.max(isRetail ? 1 : product.wholesaleMOQ, qty - 1))}
                                                className="w-12 h-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex items-center justify-center font-bold text-lg"
                                            >-</button>
                                            <div className="w-16 flex flex-col items-center justify-center h-full border-x border-white/5 bg-white/5">
                                                <span className="font-bold text-white text-lg leading-none">{qty}</span>
                                            </div>
                                            <button
                                                onClick={() => setQty(qty + 1)}
                                                className="w-12 h-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex items-center justify-center font-bold text-lg"
                                            >+</button>
                                        </div>
                                        <Button
                                            onClick={handleAddToCart}
                                            disabled={!product.inStock}
                                            className={`flex-1 h-14 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg ${!product.inStock ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : isRetail ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 border border-amber-500/50 shadow-amber-900/50' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border border-blue-500/50 shadow-blue-900/50'}`}
                                        >
                                            {isRetail ?
                                                (product.inStock ? <div className="flex items-center gap-2"><ShoppingCart size={18} /> Add to Cart</div> : 'Out of Stock')
                                                : <div className="flex items-center gap-2"><MessageCircle size={18} /> Get WhatsApp Quote</div>
                                            }
                                        </Button>
                                    </div>
                                </div>

                                {/* Full Details Link */}
                                <div className="mt-6 flex items-center justify-center">
                                    <Link
                                        href={`/shop/${product.id}`}
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors group/link"
                                    >
                                        View Full Details <Eye size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
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

