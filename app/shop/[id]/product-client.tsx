'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Reviews } from '@/components/reviews';
import { RelatedProducts } from '@/components/related-products';
import { RecentlyViewed } from '@/components/recently-viewed';
import { Product, getProductGallery } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { getDeliveryOptions } from '@/lib/delivery';
import { Button } from '@/components/ui/button';
import { Currency } from '@/components/currency';
import { 
    ShoppingCart, Truck, Check, Package, ArrowLeft, MessageCircle, 
    Loader2, Heart, PlayCircle, Image as ImageIcon, Layers, Share2, 
    ShieldCheck, Info, Scale, Ruler, Zap, Tag, Video 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductClient({ id }: { id: string }) {
    const router = useRouter();
    const { mode, language, addToCart, viewProduct, wishlist, toggleWishlist } = useAppStore();
    const t = translations[language];
    const isRetail = mode === 'retail';

    const [product, setProduct] = useState<Product | null>(null);
    const [siblings, setSiblings] = useState<Product[]>([]); 
    const [loading, setLoading] = useState(true);
    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState<any>(null);
    const [qty, setQty] = useState(1);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) {
                setLoading(false);
                return;
            }

            const mappedProduct: Product = {
                id: data.id,
                name: data.name,
                description: data.description,
                retailPrice: data.retail_price,
                wholesalePrice: data.wholesale_price,
                wholesaleMOQ: data.wholesale_moq,
                primaryImage: data.image || '/placeholder.jpg',
                videoUrl: data.video_url,
                gallery: data.gallery || [],
                category: data.category,
                inStock: data.in_stock,
                reviews: data.reviews || [],
                brand: data.brand,
                modelNumber: data.model_number,
                sku: data.sku,
                weight: data.weight,
                dimensions: data.dimensions,
                warrantyInfo: data.warranty_info,
                features: data.features || [],
                specifications: data.specifications || {},
                variants: data.variants || [],
                variantType: data.variant_type
            };

            setProduct(mappedProduct);
            setQty(isRetail ? 1 : mappedProduct.wholesaleMOQ);
            setLoading(false);
            viewProduct(mappedProduct.id);
        }
        fetchProduct();
    }, [id, isRetail, viewProduct]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
    if (!product) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Product Not Found</div>;

    const gallery = getProductGallery(product);
    const isWishlisted = wishlist.includes(product.id);

    const handleAddToCart = () => {
        if (isRetail) {
            addToCart({
                productId: product.id,
                quantity: qty,
                price: product.retailPrice,
                mode: mode
            });
            alert('Added to cart!');
        } else {
            const message = `Hi Dinanath & Sons, I am interested in a wholesale quotation for: ${product.name} (SKU: ${product.sku || product.id}). Qty: ${qty}`;
            window.open(`https://wa.me/919953435647?text=${encodeURIComponent(message)}`, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20 overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                
                <div className="pt-8 mb-8">
                    <Breadcrumbs items={[
                        { label: 'Inventory', href: '/shop' },
                        { label: product.category, href: `/shop?cat=${product.category}` },
                        { label: product.name }
                    ]} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    
                    {/* --- Visual Assets (Left) --- */}
                    <div className="space-y-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-square bg-gray-900/50 border border-gray-800 rounded-[3rem] overflow-hidden flex items-center justify-center group shadow-2xl"
                        >
                            {gallery[selectedMediaIndex]?.type === 'video' ? (
                                <video src={gallery[selectedMediaIndex].url} controls autoPlay className="w-full h-full object-contain" />
                            ) : (
                                <img src={gallery[selectedMediaIndex]?.url || product.primaryImage} className="w-full h-full object-contain p-8" alt={product.name} />
                            )}
                            
                            <div className="absolute top-6 left-6 flex gap-3">
                                {product.brand && <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">{product.brand}</span>}
                                {!product.inStock && <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Out of Stock</span>}
                            </div>
                        </motion.div>

                        {/* Thumbnails & Video Toggle */}
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {gallery.map((media, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedMediaIndex(idx)}
                                    className={`relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${selectedMediaIndex === idx ? 'border-blue-500 scale-105 shadow-lg shadow-blue-500/20' : 'border-gray-800 opacity-50 hover:opacity-100'}`}
                                >
                                    <img src={media.url} className="w-full h-full object-cover" />
                                    {media.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><PlayCircle size={28} /></div>}
                                </button>
                            ))}
                            {product.videoUrl && !gallery.find(g => g.url === product.videoUrl) && (
                                <button 
                                    onClick={() => {
                                        const videoMedia = { id: 'main-vid', type: 'video', url: product.videoUrl! };
                                        // Simplified: just show it as a trigger
                                        setSelectedMediaIndex(gallery.length); 
                                    }}
                                    className="relative shrink-0 w-24 h-24 rounded-2xl border-2 border-purple-500/50 bg-purple-900/10 flex items-center justify-center text-purple-400 group"
                                >
                                    <Video size={32} className="group-hover:scale-110 transition-transform" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* --- Product Intelligence (Right) --- */}
                    <div className="flex flex-col">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                <Tag size={12} fill="currentColor" /> {product.category} {product.modelNumber && `• MOD ${product.modelNumber}`}
                            </div>
                            
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">{product.name}</h1>
                            
                            <div className="flex items-center gap-6 text-gray-500 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-amber-500">
                                        {[...Array(5)].map((_, i) => <Check key={i} size={14} className="fill-current" />)}
                                    </div>
                                    <span className="font-bold">Verified Professional Grade</span>
                                </div>
                                <div className="h-4 w-px bg-gray-800" />
                                <span className="font-mono text-xs uppercase tracking-widest">SKU: {product.sku || product.id.slice(0, 8)}</span>
                            </div>

                            <p className="text-gray-400 text-lg leading-relaxed max-w-xl">{product.description}</p>

                            {/* Detailed Attributes Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                                <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl flex items-center gap-3">
                                    <Scale className="text-gray-600" size={20} />
                                    <div>
                                        <p className="text-[10px] text-gray-600 font-black uppercase">Weight</p>
                                        <p className="text-white text-sm font-bold">{product.weight || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl flex items-center gap-3">
                                    <ShieldCheck className="text-gray-600" size={20} />
                                    <div>
                                        <p className="text-[10px] text-gray-600 font-black uppercase">Warranty</p>
                                        <p className="text-white text-sm font-bold">{product.warrantyInfo || 'Standard'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Variant Selector (If exists) */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="space-y-4 pt-6">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <Layers size={14}/> Available {product.variantType || 'Configurations'}
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.variants.map(v => (
                                            <button key={v.id} className="px-6 py-3 rounded-2xl border border-gray-800 bg-gray-900/50 text-sm font-bold hover:border-blue-500 hover:text-blue-500 transition-all active:scale-95">
                                                {v.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pricing & Call to Action */}
                            <div className="pt-10 space-y-8">
                                <div className="flex items-baseline gap-4">
                                    {isRetail ? (
                                        <>
                                            <span className="text-5xl font-black text-white">₹{product.retailPrice.toLocaleString()}</span>
                                            <span className="text-gray-600 text-lg uppercase font-black tracking-tighter">M.R.P.</span>
                                        </>
                                    ) : (
                                        <div className="space-y-1">
                                            <span className="text-3xl font-black text-blue-500 uppercase italic tracking-wider">Wholesale Quotation Only</span>
                                            <p className="text-gray-500 text-xs font-bold uppercase">Prices disclosed upon verified inquiry (Min. {product.wholesaleMOQ} Units)</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center bg-gray-900 border border-gray-800 rounded-2xl p-1 h-16 w-full sm:w-40">
                                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="flex-1 h-full text-gray-500 hover:text-white transition-all font-black text-xl">-</button>
                                        <span className="w-12 text-center font-black text-lg">{qty}</span>
                                        <button onClick={() => setQty(qty + 1)} className="flex-1 h-full text-gray-500 hover:text-white transition-all font-black text-xl">+</button>
                                    </div>
                                    
                                    <button 
                                        onClick={handleAddToCart}
                                        disabled={!product.inStock}
                                        className={`flex-[2] h-16 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs sm:text-sm transition-all active:scale-[0.98] shadow-2xl ${
                                            !product.inStock ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 
                                            isRetail ? 'bg-white text-black hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/40'
                                        }`}
                                    >
                                        {isRetail ? (
                                            <><ShoppingCart size={20} fill="currentColor" /> {product.inStock ? 'Secure Purchase' : 'Sold Out'}</>
                                        ) : (
                                            <><MessageCircle size={20} fill="currentColor" /> Request Quotation</>
                                        )}
                                    </button>
                                    
                                    <button 
                                        onClick={() => toggleWishlist(product.id)}
                                        className={`h-16 w-full sm:w-16 rounded-2xl border border-gray-800 flex items-center justify-center transition-all ${isWishlisted ? 'bg-red-900/20 text-red-500 border-red-900/50' : 'bg-gray-900/50 text-gray-500 hover:text-white'}`}
                                    >
                                        <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* --- Amazon-Style Specifications Table --- */}
                <div className="mt-24 space-y-12">
                    <div className="border-b border-gray-800 pb-8 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-black text-white">Technical Specifications</h2>
                            <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-widest">In-depth engineering & manufacturing details</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div className="space-y-1">
                            {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                                <div key={key} className={`flex py-4 px-6 rounded-xl ${idx % 2 === 0 ? 'bg-gray-900/30' : ''}`}>
                                    <span className="w-1/3 text-[10px] font-black text-gray-600 uppercase tracking-widest self-center">{key}</span>
                                    <span className="flex-1 text-sm font-bold text-gray-300">{val}</span>
                                </div>
                            ))}
                            {Object.entries(product.specifications || {}).length === 0 && (
                                <div className="py-8 text-gray-600 italic">No technical specs provided for this model.</div>
                            )}
                        </div>
                        
                        <div className="bg-gray-900/50 border border-gray-800 rounded-[2.5rem] p-8 space-y-8 h-fit">
                            <h3 className="text-lg font-black text-white flex items-center gap-3"><Zap className="text-blue-500" /> Key Features</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {(product.features || []).map((feature, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="w-6 h-6 rounded-full bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5"><Check size={14} strokeWidth={4} /></div>
                                        <p className="text-gray-400 text-sm leading-relaxed">{feature}</p>
                                    </div>
                                ))}
                                {(!product.features || product.features.length === 0) && <p className="text-gray-600 italic">No feature highlights available.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Sections */}
                <div className="mt-24">
                    <Reviews initialReviews={product.reviews || []} productId={product.id} />
                </div>
                
                <div className="mt-24">
                    <RelatedProducts currentProduct={product} />
                </div>

            </div>
        </div>
    );
}
