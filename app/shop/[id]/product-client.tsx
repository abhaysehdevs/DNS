'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Reviews } from '@/components/reviews';
import { RelatedProducts } from '@/components/related-products';
import { RecentlyViewed } from '@/components/recently-viewed';
import { Product, getProductGallery, products as staticProducts } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { getDeliveryOptions } from '@/lib/delivery';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Truck, Check, Package, ArrowLeft, MessageCircle, Loader2, Heart, PlayCircle, Image as ImageIcon, Layers, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductClient({ id }: { id: string }) {
    const router = useRouter();
    const { mode, language, addToCart, viewProduct, wishlist, toggleWishlist } = useAppStore();
    const t = translations[language];
    const isRetail = mode === 'retail';

    const [product, setProduct] = useState<Product | null>(null);
    const [siblings, setSiblings] = useState<Product[]>([]); // Grouped products
    const [loading, setLoading] = useState(true);
    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState<any>(null);
    const [qty, setQty] = useState(1);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

    // Old Variant State (Deprecated but kept for fallback)
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                // Fallback to static data for demo if DB fails or empty
                const staticMatch = staticProducts.find(p => p.id === id);
                if (staticMatch) {
                    setProduct(staticMatch);
                    setQty(isRetail ? 1 : staticMatch.wholesaleMOQ);

                    // Fetch siblings from static data
                    if (staticMatch.groupId) {
                        const staticSiblings = staticProducts.filter(p => p.groupId === staticMatch.groupId);
                        setSiblings(staticSiblings);
                    }
                    viewProduct(staticMatch.id);
                } else {
                    console.error('Error fetching product:', error);
                }
                setLoading(false);
                return;
            }

            // Find local match for overrides
            const localMatch = staticProducts.find(p => p.id === data.id || p.name.toLowerCase() === data.name.toLowerCase());

            // Map DB data
            const mappedProduct: Product = {
                id: data.id,
                name: data.name,
                description: data.description,
                retailPrice: data.retail_price,
                wholesalePrice: data.wholesale_price,
                wholesaleMOQ: data.wholesale_moq,
                primaryImage: data.image || localMatch?.primaryImage,
                gallery: (data.gallery && data.gallery.length > 0) ? data.gallery : (localMatch?.gallery || [{ id: 'default', type: 'image', url: data.image || localMatch?.primaryImage }]),
                category: data.category,
                inStock: data.in_stock,
                reviews: data.reviews || [],
                specifications: data.specifications || {},
                variants: data.variants, // Legacy
                variantType: data.variant_type, // Legacy
                groupId: data.group_id, // New
                variantAttributes: data.variant_attributes // New
            };

            setProduct(mappedProduct);
            setQty(isRetail ? 1 : mappedProduct.wholesaleMOQ);

            // New: Fetch Siblings if Group ID exists
            if (mappedProduct.groupId) {
                const { data: siblingsData } = await supabase
                    .from('products')
                    .select('*')
                    .eq('group_id', mappedProduct.groupId);

                if (siblingsData) {
                    const mappedSiblings: Product[] = siblingsData.map((s: any) => ({
                        id: s.id,
                        name: s.name,
                        description: s.description,
                        retailPrice: s.retail_price,
                        wholesalePrice: s.wholesale_price,
                        wholesaleMOQ: s.wholesale_moq,
                        primaryImage: s.image,
                        gallery: s.gallery || [],
                        category: s.category,
                        inStock: s.in_stock,
                        reviews: s.reviews || [],
                        groupId: s.group_id,
                        variantAttributes: s.variant_attributes
                    }));
                    setSiblings(mappedSiblings);
                }
            }

            // Fallback: Legacy variants init
            if (mappedProduct.variants && mappedProduct.variants.length > 0) {
                setSelectedVariantId(mappedProduct.variants[0].id);
            }

            setLoading(false);
            viewProduct(mappedProduct.id);
        }
        fetchProduct();
    }, [id, isRetail, viewProduct]);

    // Derived gallery helper
    const gallery = product ? getProductGallery(product) : [];

    // Helper: Legacy Variant Logic (If used)
    const activeLegacyVariant = product?.variants?.find(v => v.id === selectedVariantId);

    // Price Logic: prefer product price (since variants are now separate products), fall back to legacy
    const currentRetailPrice = activeLegacyVariant?.retailPrice ?? product?.retailPrice ?? 0;
    const currentWholesalePrice = activeLegacyVariant?.wholesalePrice ?? product?.wholesalePrice ?? 0;
    const currentPrice = isRetail ? currentRetailPrice : currentWholesalePrice;

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={48} />
            </div>
        );
    }

    if (!product) return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <h1 className="text-2xl font-bold">Product Not Found</h1>
        </div>
    );

    const isWishlisted = wishlist.includes(product.id);

    const checkDelivery = () => {
        const result = getDeliveryOptions(pincode);
        setDeliveryStatus(result);
    };

    const handleAddToCart = () => {
        if (isRetail) {
            addToCart({
                productId: product.id,
                quantity: qty,
                price: currentRetailPrice,
                mode: mode,
                variantId: selectedVariantId || undefined, // Legacy
                variantName: activeLegacyVariant?.name || (product.variantAttributes ? Object.values(product.variantAttributes).join(', ') : undefined)
            });
            alert('Added to cart!');
        } else {
            let message = `Hi Dinanath & Sons, I am interested in wholesale pricing for: ${product.name} (ID: ${product.id}).`;
            if (product.variantAttributes) {
                message += ` Spec: ${Object.entries(product.variantAttributes).map(([k, v]) => `${k}: ${v}`).join(', ')}.`;
            }
            if (activeLegacyVariant) {
                message += ` Variant: ${activeLegacyVariant.name}.`;
            }
            message += ` Qty: ${qty}`;
            const url = `https://wa.me/919953435647?text=${encodeURIComponent(message)}`;
            window.open(url, '_blank');
        }
    };

    // Helper to group siblings by variant attributes
    // Assuming 1 dimension for now for simplicity, but scalable to N
    // Structure: { "Size": ["S", "M"], "Color": ["Red", "Blue"] } - Complex to automate generic matrix instantly, 
    // so we'll just list the available siblings as buttons for each attribute found.
    const siblingGroups: Record<string, Product[]> = {};
    if (siblings.length > 0 && product.variantAttributes) {
        // Find what keys vary. 
        // For now, let's just list all siblings as a flat list if they share a group, showing their unique attributes.
    }

    return (
        <div className="min-h-screen bg-black text-white pt-10 pb-20">
            <div className="container mx-auto px-4">
                <Breadcrumbs items={[
                    { label: 'Shop', href: '/shop' },
                    { label: product.category, href: `/shop?cat=${product.category}` },
                    { label: product.name }
                ]} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">
                    {/* Media Gallery Section */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={product.id} // Re-animate on product change (sibling switch)
                            className="bg-gray-900 rounded-2xl aspect-square flex items-center justify-center border border-gray-800 relative overflow-hidden shadow-2xl"
                        >
                            {/* Legacy Variant Image override */}
                            {activeLegacyVariant?.image ? (
                                <img
                                    src={activeLegacyVariant.image}
                                    alt={activeLegacyVariant.name}
                                    className="w-full h-full object-contain"
                                />
                            ) : gallery[selectedMediaIndex].type === 'video' ? (
                                <video
                                    src={gallery[selectedMediaIndex].url}
                                    controls
                                    className="w-full h-full object-contain bg-black"
                                    poster={gallery[selectedMediaIndex].thumbnailUrl}
                                />
                            ) : (
                                <img
                                    src={gallery[selectedMediaIndex].url || product.primaryImage}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                />
                            )}

                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                {deliveryStatus?.type === 'instant' && (
                                    <span className="bg-green-500/90 backdrop-blur text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                        ⚡ Instant Delivery
                                    </span>
                                )}
                                {!product.inStock && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                        </motion.div>

                        {/* Thumbnails */}
                        {gallery.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {gallery.map((media, idx) => (
                                    <button
                                        key={media.id}
                                        onClick={() => setSelectedMediaIndex(idx)}
                                        className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedMediaIndex === idx && !activeLegacyVariant?.image ? 'border-amber-500 scale-105' : 'border-gray-800 opacity-60 hover:opacity-100'}`}
                                    >
                                        <img
                                            src={media.type === 'video' ? (media.thumbnailUrl || media.url) : media.url}
                                            alt={media.altText || `View ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {media.type === 'video' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <PlayCircle size={24} className="text-white/80" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col h-full"
                    >
                        <div className="mb-2 text-amber-500 text-sm font-medium tracking-wide uppercase flex items-center gap-2">
                            {product.category}
                            <span className="text-gray-600">•</span>
                            <span className={product.inStock ? "text-green-500" : "text-red-500"}>
                                {product.inStock ? "In Stock" : "Unavailable"}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white leading-tight">{product.name}</h1>

                        {/* Rating & Attributes Summary */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="flex text-amber-400">
                                {Array(5).fill(0).map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < Math.round(product.reviews.reduce((acc, r) => acc + r.rating, 0) / (product.reviews.length || 1)) ? 'fill-current' : 'text-gray-700'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                            </div>

                            {/* Current Product Variants Badges (e.g. "Color: Red") */}
                            {product.variantAttributes && Object.entries(product.variantAttributes).map(([key, value]) => (
                                <span key={key} className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs text-gray-300">
                                    <span className="text-gray-500 mr-1">{key}:</span>{value}
                                </span>
                            ))}
                        </div>

                        <p className="text-gray-400 text-lg mb-8 leading-relaxed border-l-2 border-gray-800 pl-4">{product.description}</p>

                        {/* --- SIBLING VARIANTS (GROUP PRODUCT SYSTEM) --- */}
                        {siblings.length > 0 && (
                            <div className="mb-8 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                    <Layers size={14} /> Available Variants
                                </h3>

                                {(() => {
                                    // Get all unique attribute keys from all siblings including current
                                    const allKeys = new Set<string>();
                                    [product, ...siblings].forEach(p => {
                                        if (p.variantAttributes) Object.keys(p.variantAttributes).forEach(k => allKeys.add(k));
                                    });

                                    return Array.from(allKeys).map(attrKey => (
                                        <div key={attrKey} className="mb-4 last:mb-0">
                                            <span className="text-xs text-gray-500 font-semibold mb-2 block">{attrKey}:</span>
                                            <div className="flex flex-wrap gap-2">
                                                {/* Filter list unique by this attribute value to avoid duplicates in display if multi-dim */}
                                                {[product, ...siblings]
                                                    .filter(p => p.variantAttributes && p.variantAttributes[attrKey])
                                                    // Sort nice to have
                                                    .sort((a, b) => (a.variantAttributes?.[attrKey] || '').localeCompare(b.variantAttributes?.[attrKey] || ''))
                                                    // De-duplicate by value just in case
                                                    .filter((v, i, a) => a.findIndex(t => t.variantAttributes?.[attrKey] === v.variantAttributes?.[attrKey]) === i)
                                                    .map(sibling => {
                                                        const isSelected = sibling.id === product.id;
                                                        const val = sibling.variantAttributes![attrKey];

                                                        return (
                                                            <button
                                                                key={sibling.id}
                                                                onClick={() => router.push(`/shop/${sibling.id}`)}
                                                                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${isSelected
                                                                    ? 'border-amber-500 bg-amber-900/20 text-white shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-default'
                                                                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500 hover:text-white'
                                                                    }`}
                                                            >
                                                                {val}
                                                            </button>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        )}

                        {/* --- LEGACY VARIANTS (Keep for backward compat) --- */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                    <Layers size={14} /> Select {product.variantType || 'Option'}
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setSelectedVariantId(variant.id)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedVariantId === variant.id
                                                ? 'border-amber-500 bg-amber-900/20 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                                : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500 hover:text-white'
                                                }`}
                                        >
                                            {variant.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pricing Card */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 backdrop-blur-sm shadow-xl mt-auto">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        {isRetail ? t.product.retailPrice : 'Wholesale Inquiry'}
                                        {activeLegacyVariant && <span className="text-amber-500 ml-2 text-xs">({activeLegacyVariant.name})</span>}
                                    </p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-bold text-amber-500">
                                            {isRetail ? `₹${currentPrice.toLocaleString()}` : 'Contact for Price'}
                                        </span>
                                        {!isRetail && (
                                            <span className="text-lg text-gray-600 line-through">
                                                ₹{currentRetailPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {!isRetail && (
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400 mb-1">Min Order Qty</div>
                                        <div className="text-xl font-bold text-white">{product.wholesaleMOQ} Units</div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mb-2">
                                <div className="flex items-center border border-gray-700 rounded-lg bg-black/50">
                                    <button
                                        onClick={() => setQty(Math.max(isRetail ? 1 : product.wholesaleMOQ, qty - 1))}
                                        className="w-10 h-10 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
                                    >-</button>
                                    <span className="w-12 text-center font-bold text-white">{qty}</span>
                                    <button
                                        onClick={() => setQty(qty + 1)}
                                        className="w-10 h-10 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
                                    >+</button>
                                </div>
                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className={`ml-auto w-12 flex items-center justify-center rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors ${isWishlisted ? 'text-red-500 bg-red-900/10 border-red-900' : 'text-gray-400'}`}
                                >
                                    <Heart size={24} className={isWishlisted ? "fill-red-500" : ""} />
                                </button>
                            </div>
                            <Button
                                onClick={handleAddToCart}
                                size="lg"
                                disabled={!product.inStock}
                                className={`hidden md:flex w-full text-white font-bold text-base h-12 ${!product.inStock ? 'bg-gray-700 cursor-not-allowed' : isRetail ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {isRetail ?
                                    (product.inStock ? <><ShoppingCart className="mr-2" /> {t.product.addToCart}</> : 'Out of Stock')
                                    : <><MessageCircle className="mr-2" /> Get Quote via WhatsApp</>
                                }
                            </Button>
                        </div>

                        {/* Delivery Checker and other footer elements... */}
                        {/* (Keeping existing delivery checker code same as before, truncated for brevity implies it's still there) */}
                        <div className="border-t border-gray-800 pt-6">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-400 uppercase tracking-wide">
                                <Truck size={16} /> Check Delivery Availability
                            </h3>
                            <div className="flex gap-2 max-w-sm">
                                <input
                                    type="text"
                                    placeholder={t.delivery.enterPincode}
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    className="flex-1 bg-gray-900 border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-gray-600"
                                    maxLength={6}
                                />
                                <Button variant="outline" onClick={checkDelivery} className="border-gray-700 hover:bg-gray-800 text-gray-300">
                                    Check
                                </Button>
                            </div>

                            {deliveryStatus && (
                                <div className={`mt-4 p-3 rounded-lg border ${deliveryStatus.type === 'instant' ? 'bg-green-900/20 border-green-900/50' : deliveryStatus.type === 'invalid' ? 'bg-red-900/20 border-red-900/50' : 'bg-blue-900/20 border-blue-900/50'}`}>
                                    {deliveryStatus.type === 'instant' ? (
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-500/20 p-2 rounded-full text-green-500">
                                                <Truck size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-green-400 text-sm">Instant Delivery Available</p>
                                                <p className="text-xs text-green-500/70">Arrives in {deliveryStatus.estimatedTime}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500/20 p-2 rounded-full text-blue-500">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-blue-400 text-sm">Standard Shipping</p>
                                                <p className="text-xs text-blue-500/70">{deliveryStatus.estimatedTime || 'Invalid Pincode'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </motion.div>
                </div>

                <div className="mt-20 border-t border-gray-900 pt-12">
                    <Reviews initialReviews={product.reviews || []} productId={product.id} />
                </div>

                <div className="mt-12 border-t border-gray-900 pt-12">
                    <h2 className="text-2xl font-bold text-white mb-6">You Might Also Like</h2>
                    <RelatedProducts currentProduct={product} />
                </div>

                <RecentlyViewed />

                {/* Mobile Sticky Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800 md:hidden z-40 flex gap-4 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`w-12 flex items-center justify-center rounded-lg border border-gray-700 bg-black/50 ${isWishlisted ? 'text-red-500' : 'text-gray-400'}`}
                    >
                        <Heart size={24} className={isWishlisted ? "fill-red-500" : ""} />
                    </button>
                    <div className="flex items-center border border-gray-700 rounded-lg bg-black/50 h-12">
                        <button
                            onClick={() => setQty(Math.max(isRetail ? 1 : product.wholesaleMOQ, qty - 1))}
                            className="w-10 h-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors flex items-center justify-center font-bold text-xl"
                        >-</button>
                        <span className="w-10 text-center font-bold text-sm">{qty}</span>
                        <button
                            onClick={() => setQty(qty + 1)}
                            className="w-10 h-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors flex items-center justify-center font-bold text-xl"
                        >+</button>
                    </div>
                    <Button onClick={handleAddToCart} className={`flex-1 h-12 active:scale-95 transition-transform text-white font-bold text-sm ${isRetail ? 'bg-amber-600' : 'bg-green-600'}`}>
                        {isRetail ? t.product.addToCart : 'Get Quote'}
                    </Button>
                </div>

            </div >
        </div >
    );
}
