'use client';

import { Product, getProductGallery } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { X, ShoppingCart, Star, Heart, Eye, PlayCircle, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Currency } from '@/components/currency';
import { SecureImage } from './secure-image';
import { ShareButton } from './share-button';
import { getProductUrl } from '@/lib/slug';

export function ProductQuickView({ product, isOpen, onClose }: { product: Product, isOpen: boolean, onClose: () => void }) {
    const { language, addToCart, wishlist } = useAppStore();
    const t = translations[language];
    const isWishlisted = wishlist.includes(product.id);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [qty, setQty] = useState(1);
    const gallery = getProductGallery(product);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setQty(1);
            setSelectedMediaIndex(0);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const rating = product.reviews && product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 0;

    const currentPrice = product.retailPrice;

    const handleAddToCart = () => {
        addToCart({
            productId: product.id,
            quantity: qty,
            price: currentPrice,
            mode: 'retail',
        });
        onClose();
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md cursor-pointer"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="relative w-full max-w-5xl max-h-[90vh] bg-white border border-[#E8E2D5] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                    >
                        {/* Action buttons (Share & Close) */}
                        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                            <ShareButton product={product} variant="icon" />
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-[#FAF9F5] border border-[#E8E2D5] hover:bg-[#F0EBE0] rounded-full flex items-center justify-center text-[#52525B] hover:text-[#18181B] transition-all group shadow-sm"
                                title="Close dialog"
                            >
                                <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row w-full overflow-y-auto md:overflow-hidden">
                            
                            {/* Left: Interactive Media Gallery */}
                            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col items-center justify-center relative overflow-hidden bg-[#FAF9F5]">
                                
                                {/* Badges */}
                                <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                                    <span className="bg-white border border-[#E8E2D5] text-[#966E2E] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-xs">
                                        {product.category}
                                    </span>
                                    {!product.inStock && (
                                        <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-xs">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                {/* Main Media */}
                                <motion.div
                                    key={selectedMediaIndex}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full aspect-square relative flex items-center justify-center mb-6"
                                >
                                    <div className="w-full h-full flex items-center justify-center p-4">
                                        {gallery[selectedMediaIndex]?.type === 'video' ? (
                                            <video
                                                src={gallery[selectedMediaIndex].url}
                                                controls
                                                autoPlay
                                                loop
                                                muted
                                                className="w-full h-full object-contain drop-shadow-sm"
                                                poster={gallery[selectedMediaIndex].thumbnailUrl}
                                            />
                                        ) : (
                                            <SecureImage
                                                src={gallery[selectedMediaIndex]?.url || product.primaryImage}
                                                alt={product.name}
                                                containerClassName="w-full h-full"
                                                className="w-full h-full object-contain drop-shadow-sm"
                                            />
                                        )}
                                    </div>
                                </motion.div>

                                {/* Thumbnails */}
                                {gallery.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto w-full pb-2 justify-center px-4">
                                        {gallery.map((media, idx) => (
                                            <button
                                                key={media.id || idx}
                                                onClick={() => setSelectedMediaIndex(idx)}
                                                className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 bg-white border ${selectedMediaIndex === idx ? 'border-[#966E2E] shadow-sm scale-105' : 'border-[#E8E2D5] opacity-60 hover:opacity-100'}`}
                                            >
                                                <SecureImage
                                                    src={media.type === 'video' ? (media.thumbnailUrl || media.url) : media.url}
                                                    alt={media.altText || `Thumbnail ${idx + 1}`}
                                                    containerClassName="w-full h-full"
                                                    className="w-full h-full object-cover"
                                                />
                                                {media.type === 'video' && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                        <PlayCircle size={20} className="text-[#966E2E]" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Detailed Info */}
                            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center relative z-10 border-t md:border-t-0 md:border-l border-[#E8E2D5] bg-white">
                                
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center gap-1.5 bg-[#FAF9F5] border border-[#E8E2D5] px-2.5 py-1 rounded-full">
                                                <Star size={13} className="text-[#966E2E] fill-[#966E2E]" />
                                                <span className="text-xs text-[#18181B] font-bold">{rating > 0 ? rating.toFixed(1) : 'NEW'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[#71717A] text-[10px] font-bold uppercase tracking-[0.15em]">
                                                <ShieldCheck size={13} className="text-[#966E2E]" /> Professional Grade
                                            </div>
                                        </div>

                                        <h2 className="text-2xl md:text-3xl font-black text-[#18181B] leading-tight mb-3 uppercase">
                                            {product.name}
                                        </h2>

                                        <p className="text-[#52525B] text-sm leading-relaxed mb-6 font-normal">
                                            {product.description}
                                        </p>

                                        {/* Attributes */}
                                        {product.variantAttributes && Object.keys(product.variantAttributes).length > 0 && (
                                            <div className="flex flex-wrap gap-2.5 mb-6">
                                                {Object.entries(product.variantAttributes).map(([key, value]) => (
                                                    <div key={key} className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl px-3 py-1.5 flex flex-col">
                                                        <span className="text-[8.5px] uppercase tracking-[0.15em] text-[#71717A] font-bold">{key}</span>
                                                        <span className="text-xs text-[#18181B] font-bold uppercase">{value as string}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Box */}
                                    <div className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-6 shadow-xs relative overflow-hidden">
                                        <div className="flex justify-between items-end mb-6 relative z-10">
                                            <div>
                                                <p className="text-[10px] text-[#71717A] uppercase tracking-[0.2em] font-bold mb-1">
                                                    Price
                                                </p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-black text-[#966E2E]">
                                                        <Currency value={currentPrice} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                                            <div className="flex items-center bg-white border border-[#E8E2D5] rounded-xl overflow-hidden h-12 w-full sm:w-auto p-1">
                                                <button
                                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                                    className="w-10 h-full hover:bg-[#FAF9F5] text-[#52525B] hover:text-[#18181B] transition-colors flex items-center justify-center font-bold text-lg"
                                                >-</button>
                                                <div className="flex-1 sm:w-12 flex items-center justify-center font-bold text-[#18181B] text-base tabular-nums">
                                                    {qty}
                                                </div>
                                                <button
                                                    onClick={() => setQty(qty + 1)}
                                                    className="w-10 h-full hover:bg-[#FAF9F5] text-[#52525B] hover:text-[#18181B] transition-colors flex items-center justify-center font-bold text-lg"
                                                >+</button>
                                            </div>
                                            
                                            <Button
                                                onClick={handleAddToCart}
                                                disabled={!product.inStock}
                                                className={`flex-1 h-12 bg-[#966E2E] hover:bg-[#7D5A25] text-white font-bold text-xs uppercase tracking-[0.15em] rounded-xl transition-all shadow-sm ${!product.inStock ? 'opacity-50 grayscale' : ''}`}
                                            >
                                                {product.inStock ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <ShoppingCart size={16} /> Add to Cart
                                                    </div>
                                                ) : 'Out of Stock'}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Footer Link */}
                                    <div className="flex items-center justify-center pt-2">
                                        <Link
                                            href={getProductUrl(product)}
                                            onClick={onClose}
                                            className="text-[#71717A] hover:text-[#966E2E] text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 transition-all"
                                        >
                                            View Full Product Details <Eye size={14} />
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
