'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Plus, Edit, Trash2, Search, X, Save, Image as ImageIcon, Loader2, 
    Filter, AlertCircle, CheckCircle, XCircle, Layers, Box, ChevronDown, 
    CheckSquare, Square, MoreHorizontal, Download, Upload, Video, 
    Settings, Info, Zap, Scale, Ruler, ShieldCheck, Tag, Link as LinkIcon,
    Globe, Star, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertToWebP } from '@/lib/image-utils';

// --- Interfaces ---
interface ProductVariant {
    id: string;
    name: string;
    price: number;
    inStock: boolean;
    sku?: string;
    image?: string;
}

interface ProductDB {
    id: string;
    name: string;
    description: string;
    retail_price: number;
    wholesale_price: number;
    wholesale_moq: number;
    image: string;
    category: string;
    in_stock: boolean;
    quantity: number;
    brand?: string;
    model_number?: string;
    sku?: string;
    weight?: string;
    video_url?: string;
    warranty_info?: string;
    variant_type?: string;
    variants: ProductVariant[];
    features: string[];
    specifications: Record<string, string>;
    dimensions: { length: string; width: string; height: string; };
    gallery: { id: string; type: 'image' | 'video'; url: string; }[];
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    slug?: string;
}

const SEO_RESERVED_KEYS = new Set([
    'slug', 'seo_title', 'seo_description', 'seo_keywords', 'meta_title', 'meta_description'
]);

export const filterOutSeoKeys = (specs: Record<string, any> = {}) => {
    const clean: Record<string, string> = {};
    if (!specs || typeof specs !== 'object') return clean;
    for (const [k, v] of Object.entries(specs)) {
        if (!SEO_RESERVED_KEYS.has(k.toLowerCase().trim())) {
            clean[k] = typeof v === 'string' ? v : String(v ?? '');
        }
    }
    return clean;
};

export default function ProductsAdminPage() {
    const [products, setProducts] = useState<ProductDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<ProductDB>>({});
    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Sub-Editors
    const [showVariantEditor, setShowVariantEditor] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'media' | 'variants' | 'seo'>('basic');

    const [dbCategories, setDbCategories] = useState<any[]>([]);

    // AI Generation States
    const [aiGeneratingDesc, setAiGeneratingDesc] = useState(false);
    const [aiGeneratingSeo, setAiGeneratingSeo] = useState(false);
    const [aiGeneratingAll, setAiGeneratingAll] = useState(false);

    const handleAiGenerateContent = async (type: 'description' | 'seo' | 'all') => {
        if (!currentProduct.name || !currentProduct.name.trim()) {
            alert('Please provide a Product Name first so the AI can inspect and research the product specifications.');
            return;
        }

        if (type === 'description') setAiGeneratingDesc(true);
        else if (type === 'seo') setAiGeneratingSeo(true);
        else setAiGeneratingAll(true);

        try {
            const res = await fetch('/api/admin/ai/generate-product-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: currentProduct.name,
                    category: currentProduct.category || 'General',
                    brand: currentProduct.brand || '',
                    model_number: currentProduct.model_number || '',
                    retail_price: currentProduct.retail_price || 0,
                    image: currentProduct.image || '',
                    gallery: currentProduct.gallery || [],
                    specifications: currentProduct.specifications || {},
                    mode: type
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate AI content');

            const generated = data.data || {};
            const marketingDescription = generated.marketingDescription || generated.description;
            const metaTitle = generated.metaTitle || generated.seo_title;
            const metaDescription = generated.metaDescription || generated.seo_description;
            const keywords = generated.keywords || generated.seo_keywords;
            const technicalSpecs = generated.technicalSpecs || generated.specifications;

            if ((type === 'description' || type === 'all') && marketingDescription) {
                setCurrentProduct(prev => ({ ...prev, description: marketingDescription }));
            }
            if (type === 'seo' || type === 'all') {
                setCurrentProduct(prev => ({
                    ...prev,
                    seo_title: metaTitle || prev.seo_title,
                    seo_description: metaDescription || prev.seo_description,
                    seo_keywords: keywords || prev.seo_keywords
                }));
            }
            if (type === 'all' && technicalSpecs && typeof technicalSpecs === 'object') {
                const cleanAiSpecs = filterOutSeoKeys(technicalSpecs);
                if (Object.keys(cleanAiSpecs).length > 0) {
                    setCurrentProduct(prev => ({
                        ...prev,
                        specifications: {
                            ...filterOutSeoKeys(prev.specifications || {}),
                            ...cleanAiSpecs
                        }
                    }));
                }
            }
        } catch (err: any) {
            alert('AI Generation error: ' + err.message);
        } finally {
            setAiGeneratingDesc(false);
            setAiGeneratingSeo(false);
            setAiGeneratingAll(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (!error && data) setDbCategories(data);
    };

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
        setLoading(false);
    };

    const [variantUploadingId, setVariantUploadingId] = useState<string | null>(null);

    // --- Media Handlers ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'gallery' | 'video') => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadSingleFile = async (file: File) => {
                let fileToUpload = file;
                if (file.type.startsWith('image/') && file.type !== 'image/gif') {
                    try {
                        fileToUpload = await convertToWebP(file);
                    } catch (e) {
                        console.error('WebP conversion failed, using original file:', e);
                    }
                }
                const fileExt = fileToUpload.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `product-media/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('products')
                    .upload(filePath, fileToUpload);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('products')
                    .getPublicUrl(filePath);

                return {
                    url: publicUrl,
                    type: file.type.startsWith('video') ? 'video' : 'image'
                };
            };

            if (target === 'gallery') {
                const newItems: { id: string; type: 'image' | 'video'; url: string; }[] = [];
                for (let i = 0; i < files.length; i++) {
                    const result = await uploadSingleFile(files[i]);
                    newItems.push({
                        id: (Date.now() + i).toString(),
                        type: result.type as any,
                        url: result.url
                    });
                }
                setCurrentProduct(prev => {
                    const updatedGallery = [...(prev.gallery || []), ...newItems];
                    const mainImg = prev.image || (updatedGallery.find(g => g.type === 'image')?.url) || updatedGallery[0]?.url || '';
                    return {
                        ...prev,
                        image: mainImg,
                        gallery: updatedGallery
                    };
                });
            } else if (target === 'video') {
                const result = await uploadSingleFile(files[0]);
                setCurrentProduct(prev => ({ ...prev, video_url: result.url }));
            }
        } catch (error: any) {
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSetMainImage = (url: string) => {
        setCurrentProduct(prev => ({ ...prev, image: url }));
    };

    const handleMoveGalleryItem = (index: number, direction: 'left' | 'right') => {
        setCurrentProduct(prev => {
            const gallery = [...(prev.gallery || [])];
            const targetIndex = direction === 'left' ? index - 1 : index + 1;
            if (targetIndex < 0 || targetIndex >= gallery.length) return prev;
            
            const temp = gallery[index];
            gallery[index] = gallery[targetIndex];
            gallery[targetIndex] = temp;

            return { ...prev, gallery };
        });
    };

    const handleDeleteGalleryItem = (id: string) => {
        setCurrentProduct(prev => {
            const itemToDelete = prev.gallery?.find(g => g.id === id);
            const remaining = prev.gallery?.filter(g => g.id !== id) || [];
            let mainImg = prev.image;
            if (itemToDelete && itemToDelete.url === prev.image) {
                mainImg = remaining.find(g => g.type === 'image')?.url || remaining[0]?.url || '';
            }
            return {
                ...prev,
                image: mainImg,
                gallery: remaining
            };
        });
    };

    // --- Variant Handlers ---
    const addVariant = () => {
        const newV: ProductVariant = {
            id: Date.now().toString(),
            name: '',
            price: currentProduct.retail_price || 0,
            inStock: true
        };
        setCurrentProduct(prev => ({ ...prev, variants: [...(prev.variants || []), newV] }));
    };

    const updateVariant = (id: string, updates: Partial<ProductVariant>) => {
        setCurrentProduct(prev => ({
            ...prev,
            variants: prev.variants?.map(v => v.id === id ? { ...v, ...updates } : v)
        }));
    };

    const handleVariantUpload = async (e: React.ChangeEvent<HTMLInputElement>, variantId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setVariantUploadingId(variantId);
        try {
            let fileToUpload = file;
            if (file.type.startsWith('image/') && file.type !== 'image/gif') {
                try {
                    fileToUpload = await convertToWebP(file);
                } catch (e) {
                    console.error('WebP conversion failed, using original file:', e);
                }
            }
            const fileExt = fileToUpload.name.split('.').pop();
            const fileName = `var-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `product-media/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, fileToUpload);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            updateVariant(variantId, { image: publicUrl });
        } catch (err: any) {
            alert('Variant image upload failed: ' + err.message);
        } finally {
            setVariantUploadingId(null);
        }
    };

    const removeVariant = (id: string) => {
        setCurrentProduct(prev => ({
            ...prev,
            variants: prev.variants?.filter(v => v.id !== id)
        }));
    };

    // --- Submission ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            const galleryList = currentProduct.gallery || [];
            // Ensure primary image is set if gallery exists
            const primaryImage = currentProduct.image || galleryList.find(g => g.type === 'image')?.url || galleryList[0]?.url || '';

            const generatedSku = currentProduct.sku?.trim() ? currentProduct.sku.trim() : `DNS-${Date.now().toString().slice(-6)}`;
            const baseSlug = (currentProduct.name || 'product')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            const generatedSlug = isEditing && currentProduct.slug ? currentProduct.slug : `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

            // Filter out any SEO fields or slug from technical specifications (Issue 2 fix)
            const cleanSpecs = filterOutSeoKeys(currentProduct.specifications || {});

            const payload: any = {
                name: currentProduct.name,
                category: currentProduct.category,
                description: currentProduct.description || '',
                retail_price: currentProduct.retail_price || 0,
                wholesale_price: currentProduct.wholesale_price || 0,
                wholesale_moq: currentProduct.wholesale_moq || 1,
                in_stock: currentProduct.in_stock !== false,
                quantity: currentProduct.quantity !== undefined ? currentProduct.quantity : 0,
                sku: generatedSku,
                slug: generatedSlug,
                brand: currentProduct.brand || '',
                model_number: currentProduct.model_number || '',
                weight: currentProduct.weight || '',
                dimensions: currentProduct.dimensions || { length: '', width: '', height: '' },
                warranty_info: currentProduct.warranty_info || '',
                image: primaryImage,
                video_url: currentProduct.video_url || '',
                features: currentProduct.features || [],
                specifications: cleanSpecs,
                variants: currentProduct.variants || [],
                variant_type: currentProduct.variant_type || 'Size',
                gallery: galleryList,
                meta_title: currentProduct.seo_title || '',
                meta_description: currentProduct.seo_description || '',
                seo_title: currentProduct.seo_title || '',
                seo_description: currentProduct.seo_description || '',
                seo_keywords: currentProduct.seo_keywords || '',
            };

            const saveToDb = async (data: any) => {
                if (isEditing && currentProduct.id) {
                    return await supabase
                        .from('products')
                        .update(data)
                        .eq('id', currentProduct.id);
                } else {
                    return await supabase
                        .from('products')
                        .insert([data]);
                }
            };

            let currentPayload = { ...payload };
            let saveRes = await saveToDb(currentPayload);

            // Adaptively handle missing columns in the Supabase schema cache
            for (let i = 0; i < 6 && saveRes.error; i++) {
                const errMsg = saveRes.error.message || '';
                const match = errMsg.match(/Could not find the '([^']+)' column/) || errMsg.match(/column "?([^" ]+)"? does not exist/);
                if (match && match[1] && match[1] in currentPayload) {
                    delete currentPayload[match[1]];
                    saveRes = await saveToDb(currentPayload);
                } else if (saveRes.error.code === 'PGRST204' || errMsg.includes('schema cache')) {
                    if ('slug' in currentPayload) delete currentPayload.slug;
                    if ('seo_title' in currentPayload) delete currentPayload.seo_title;
                    if ('seo_description' in currentPayload) delete currentPayload.seo_description;
                    if ('seo_keywords' in currentPayload) delete currentPayload.seo_keywords;
                    saveRes = await saveToDb(currentPayload);
                } else {
                    break;
                }
            }

            // If unique constraint error on sku or slug, retry automatically with unique suffix
            if (saveRes.error && (saveRes.error.message?.includes('unique constraint') || saveRes.error.code === '23505')) {
                if (currentPayload.sku) currentPayload.sku = `${currentPayload.sku}-copy-${Math.floor(100 + Math.random() * 900)}`;
                if (currentPayload.slug) currentPayload.slug = `${currentPayload.slug}-${Math.floor(100 + Math.random() * 900)}`;
                saveRes = await saveToDb(currentPayload);
            }

            if (saveRes.error) throw saveRes.error;

            setShowForm(false);
            fetchProducts();
        } catch (error: any) {
            alert('Error saving: ' + error.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) return;

        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            fetchProducts();
        } catch (error: any) {
            alert('Error deleting: ' + error.message);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} products?`)) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;
            setSelectedIds([]);
            fetchProducts();
        } catch (err: any) {
            alert('Bulk delete failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkToggleStock = async () => {
        setLoading(true);
        try {
            const firstProduct = products.find(p => p.id === selectedIds[0]);
            const newStockStatus = !firstProduct?.in_stock;

            const { error } = await supabase
                .from('products')
                .update({ in_stock: newStockStatus })
                .in('id', selectedIds);

            if (error) throw error;
            setSelectedIds([]);
            fetchProducts();
        } catch (err: any) {
            alert('Bulk update failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (p: ProductDB) => {
        const specs = filterOutSeoKeys(p.specifications || {});
        setCurrentProduct({ 
            ...p, 
            seo_title: p.seo_title || (p as any).meta_title || (p.specifications as any)?.seo_title || '',
            seo_description: p.seo_description || (p as any).meta_description || (p.specifications as any)?.seo_description || '',
            seo_keywords: p.seo_keywords || (p.specifications as any)?.seo_keywords || '',
            slug: p.slug || (p.specifications as any)?.slug || '',
            features: p.features || [], 
            specifications: specs,
            variants: Array.isArray(p.variants) ? p.variants : (typeof p.variants === 'string' ? JSON.parse(p.variants || '[]') : []),
            variant_type: p.variant_type || 'Size',
            gallery: p.gallery || [],
            dimensions: p.dimensions || { length: '', width: '', height: '' }
        });
        setIsEditing(true);
        setShowForm(true);
        setActiveTab('basic');
    };

    const handleAddNew = () => {
        setCurrentProduct({
            name: '',
            category: 'Tools',
            retail_price: 0,
            wholesale_price: 0,
            wholesale_moq: 1,
            in_stock: true,
            quantity: 0,
            features: [],
            specifications: {},
            variants: [],
            variant_type: 'Size',
            gallery: [],
            seo_title: '',
            seo_description: '',
            seo_keywords: '',
            slug: '',
            dimensions: { length: '', width: '', height: '' }
        });
        setIsEditing(false);
        setShowForm(true);
        setActiveTab('basic');
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = dbCategories.length > 0 
        ? ['All', ...dbCategories.map(c => c.name)]
        : ['All', ...Array.from(new Set(products.map(p => p.category)))];

    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] p-4 md:p-8 max-w-[1600px] mx-auto">
            
            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-[#18181B] flex items-center gap-4">
                        <Box className="text-[#966E2E]" size={40} /> Inventory Master
                    </h1>
                    <p className="text-[#71717A] text-sm mt-2 font-medium tracking-wide uppercase">Manage professional grade listings & global stock</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => {
                            const csv = products.map(p => `${p.name},${p.sku},${p.quantity},${p.retail_price}`).join('\n');
                            const blob = new Blob([`Name,SKU,Stock,Price\n${csv}`], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'inventory_export.csv';
                            a.click();
                        }}
                        className="bg-white hover:bg-[#FAF9F5] border border-[#E8E2D5] text-[#71717A] hover:text-[#18181B] px-6 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase transition-all shadow-sm"
                    >
                        <Download size={16} /> EXPORT CSV
                    </button>
                    <button 
                        onClick={handleAddNew}
                        className="bg-[#966E2E] hover:bg-[#7D5A25] text-white px-8 py-3 rounded-2xl flex items-center gap-3 text-sm font-black shadow-sm transition-all active:scale-95"
                    >
                        <Plus size={20} strokeWidth={3} /> NEW LISTING
                    </button>
                </div>
            </div>

            {/* --- Table Area --- */}
            <div className="bg-white border border-[#E8E2D5] rounded-3xl overflow-hidden shadow-sm">
                {/* Search & Filter Toolbar */}
                <div className="p-6 border-b border-[#E8E2D5] flex flex-col md:flex-row gap-4 bg-[#FAF9F5]/60 backdrop-blur">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by Name, SKU, or Brand..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-[#E8E2D5] rounded-2xl pl-12 pr-4 py-3 text-sm text-[#18181B] placeholder-[#A1A1AA] focus:border-[#966E2E] outline-none transition-all"
                        />
                    </div>
                    <select 
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="bg-white border border-[#E8E2D5] text-[#18181B] rounded-2xl px-6 py-3 text-sm outline-none focus:border-[#966E2E]"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 p-3">
                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin text-[#966E2E] mx-auto" size={48} /></div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="py-16 text-center text-[#71717A] italic">No products found.</div>
                    ) : filteredProducts.map(p => (
                        <div key={p.id} className="bg-white border border-[#E8E2D5] rounded-2xl p-4 space-y-4 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl overflow-hidden shrink-0">
                                    {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#A1A1AA]"><ImageIcon size={24} /></div>}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="text-[#18181B] font-bold text-base truncate">{p.name}</div>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (selectedIds.includes(p.id)) {
                                                    setSelectedIds(selectedIds.filter(id => id !== p.id));
                                                } else {
                                                    setSelectedIds([...selectedIds, p.id]);
                                                }
                                            }}
                                            className="text-[#A1A1AA] hover:text-[#18181B] shrink-0"
                                        >
                                            {selectedIds.includes(p.id) ? <CheckSquare size={18} className="text-[#966E2E]" /> : <Square size={18} />}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="text-[9px] font-black uppercase text-[#71717A] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E8E2D5]">{p.category}</span>
                                        <span className="text-[9px] font-mono text-[#71717A]">SKU: {p.sku || p.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 py-2 border-t border-b border-[#E8E2D5]">
                                <div>
                                    <span className="text-[9px] text-[#71717A] font-black uppercase tracking-wider block">Inventory</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-base font-black ${p.quantity < 10 ? 'text-rose-600' : 'text-emerald-600'}`}>{p.quantity}</span>
                                        <span className="text-[9px] text-[#71717A] font-bold uppercase">Units</span>
                                    </div>
                                    {p.variants && p.variants.length > 0 && (
                                        <div className="text-[9px] text-[#966E2E] font-bold flex items-center gap-1 mt-1">
                                            <Layers size={10} /> {p.variants.length} Variants
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-[#71717A] font-black uppercase tracking-wider block">Price</span>
                                    <span className="text-base font-black text-[#18181B] mt-0.5 block">₹{p.retail_price.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <button 
                                    onClick={() => {
                                        const { id, ...clone } = p;
                                        const specs = filterOutSeoKeys(clone.specifications || {});
                                        const newSku = p.sku ? `${p.sku}-COPY-${Math.floor(100 + Math.random() * 900)}` : `DNS-${Date.now().toString().slice(-6)}`;
                                        const existingSlug = p.slug || (clone.specifications as any)?.slug;
                                        const newSlug = existingSlug ? `${existingSlug}-copy-${Math.floor(100 + Math.random() * 900)}` : undefined;
                                        setCurrentProduct({ 
                                            ...clone, 
                                            name: `${clone.name} (Copy)`, 
                                            sku: newSku,
                                            slug: newSlug,
                                            specifications: specs,
                                            seo_title: clone.seo_title || (clone as any).meta_title || (clone.specifications as any)?.seo_title || '',
                                            seo_description: clone.seo_description || (clone as any).meta_description || (clone.specifications as any)?.seo_description || '',
                                            seo_keywords: clone.seo_keywords || (clone.specifications as any)?.seo_keywords || '',
                                            variants: Array.isArray(clone.variants) ? clone.variants : [],
                                            variant_type: clone.variant_type || 'Size',
                                            gallery: clone.gallery || []
                                        });
                                        setIsEditing(false);
                                        setShowForm(true);
                                    }} 
                                    className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <Layers size={14} /> Duplicate
                                </button>
                                <button 
                                    onClick={() => handleEdit(p)} 
                                    className="flex-1 py-2.5 bg-[#FAF9F5] hover:bg-[#FAF9F5]/70 text-[#966E2E] border border-[#E8E2D5] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(p.id)} 
                                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#FAF9F5] text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] border-b border-[#E8E2D5]">
                            <tr>
                                <th className="px-6 py-6 w-10">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            if (selectedIds.length === filteredProducts.length) {
                                                setSelectedIds([]);
                                            } else {
                                                setSelectedIds(filteredProducts.map(p => p.id));
                                            }
                                        }}
                                        className="text-[#A1A1AA] hover:text-[#18181B]"
                                    >
                                        {selectedIds.length === filteredProducts.length ? <CheckSquare size={16} className="text-[#966E2E]" /> : <Square size={16} />}
                                    </button>
                                </th>
                                <th className="px-8 py-6">Product Information</th>
                                <th className="px-8 py-6">Inventory Status</th>
                                <th className="px-8 py-6 text-right">Retail Price</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E2D5]">
                            {loading ? (
                                <tr><td colSpan={5} className="py-32 text-center"><Loader2 className="animate-spin text-[#966E2E] mx-auto" size={48} /></td></tr>
                            ) : filteredProducts.map(p => (
                                <tr key={p.id} className="group hover:bg-[#FAF9F5]/70 transition-colors">
                                    <td className="px-6 py-6">
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (selectedIds.includes(p.id)) {
                                                    setSelectedIds(selectedIds.filter(id => id !== p.id));
                                                } else {
                                                    setSelectedIds([...selectedIds, p.id]);
                                                }
                                            }}
                                            className="text-[#A1A1AA] hover:text-[#18181B]"
                                        >
                                            {selectedIds.includes(p.id) ? <CheckSquare size={16} className="text-[#966E2E]" /> : <Square size={16} />}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl overflow-hidden shrink-0 group-hover:border-[#966E2E]/50 transition-all">
                                                {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#A1A1AA]"><ImageIcon /></div>}
                                            </div>
                                            <div>
                                                <div className="text-[#18181B] font-bold text-lg group-hover:text-[#966E2E] transition-colors">{p.name}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase text-[#71717A] bg-[#FAF9F5] px-2 py-1 rounded border border-[#E8E2D5]">{p.category}</span>
                                                    <span className="text-[10px] font-mono text-[#71717A]">SKU: {p.sku || p.id.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xl font-black ${p.quantity < 10 ? 'text-rose-600' : 'text-emerald-600'}`}>{p.quantity}</span>
                                                <span className="text-[10px] text-[#71717A] font-black uppercase tracking-widest">Units Available</span>
                                            </div>
                                            {p.variants?.length > 0 && <div className="text-[10px] text-[#966E2E] font-bold flex items-center gap-1"><Layers size={10} /> {p.variants.length} Variants Defined</div>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="text-xl font-black text-[#18181B]">₹{p.retail_price.toLocaleString()}</div>
                                        <div className="text-[10px] text-[#71717A] font-black uppercase tracking-tighter">Public Listing Price</div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-4 md:group-hover:translate-x-0">
                                                <button 
                                                    onClick={() => {
                                                        const { id, ...clone } = p;
                                                        const specs = filterOutSeoKeys(clone.specifications || {});
                                                        const newSku = p.sku ? `${p.sku}-COPY-${Math.floor(100 + Math.random() * 900)}` : `DNS-${Date.now().toString().slice(-6)}`;
                                                        const existingSlug = p.slug || (clone.specifications as any)?.slug;
                                                        const newSlug = existingSlug ? `${existingSlug}-copy-${Math.floor(100 + Math.random() * 900)}` : undefined;
                                                        setCurrentProduct({ 
                                                            ...clone, 
                                                            name: `${clone.name} (Copy)`, 
                                                            sku: newSku,
                                                            slug: newSlug,
                                                            specifications: specs,
                                                            seo_title: clone.seo_title || (clone as any).meta_title || (clone.specifications as any)?.seo_title || '',
                                                            seo_description: clone.seo_description || (clone as any).meta_description || (clone.specifications as any)?.seo_description || '',
                                                            seo_keywords: clone.seo_keywords || (clone.specifications as any)?.seo_keywords || '',
                                                            variants: Array.isArray(clone.variants) ? clone.variants : [],
                                                            variant_type: clone.variant_type || 'Size',
                                                            gallery: clone.gallery || []
                                                        });
                                                        setIsEditing(false);
                                                        setShowForm(true);
                                                    }} 
                                                    className="p-3 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-2xl transition-all"
                                                    title="Duplicate Listing"
                                                >
                                                    <Layers size={20} />
                                                </button>
                                                <button onClick={() => handleEdit(p)} className="p-3 bg-[#FAF9F5] text-[#966E2E] hover:bg-white border border-[#E8E2D5] rounded-2xl transition-all"><Edit size={20} /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-2xl transition-all"><Trash2 size={20} /></button>
                                            </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Actions Floating Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#E8E2D5] px-6 py-4 rounded-3xl shadow-xl flex items-center gap-6 max-w-lg w-[90vw] justify-between backdrop-blur"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-[#966E2E] text-white font-black text-xs flex items-center justify-center">
                                {selectedIds.length}
                            </span>
                            <span className="text-[10px] font-black uppercase text-[#71717A] tracking-wider">Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleBulkToggleStock}
                                className="px-3 py-2 bg-[#FAF9F5] hover:bg-white border border-[#E8E2D5] text-[#18181B] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                                Toggle Stock
                            </button>
                            <button 
                                onClick={handleBulkDelete}
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                                Delete
                            </button>
                            <button 
                                onClick={() => setSelectedIds([])}
                                className="p-2 text-[#71717A] hover:text-[#18181B] rounded-xl transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Professional Form Modal --- */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowForm(false)}
                            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-6xl bg-white border border-[#E8E2D5] rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-8 md:p-10 border-b border-[#E8E2D5] flex justify-between items-center bg-white z-10 shrink-0">
                                <div>
                                    <div className="text-[10px] font-black text-[#966E2E] uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                        <Zap size={14} fill="currentColor" /> Professional Listing Engine
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-[#18181B]">{isEditing ? 'Sync Listing' : 'Initialize Product'}</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => handleAiGenerateContent('all')}
                                        disabled={aiGeneratingAll}
                                        className="px-5 py-3 bg-[#966E2E] hover:bg-[#7D5A25] text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                        title="AI inspects title, brand, and media to generate comprehensive technical description and SEO metadata"
                                    >
                                        {aiGeneratingAll ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                        <span className="hidden sm:inline">AI Auto-Write Description & SEO</span>
                                        <span className="sm:hidden">AI Auto-Write</span>
                                    </button>
                                    <button onClick={() => setShowForm(false)} className="w-12 h-12 bg-[#FAF9F5] border border-[#E8E2D5] rounded-full flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-all"><X size={24} /></button>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex px-8 md:px-10 gap-8 border-b border-[#E8E2D5] bg-[#FAF9F5] overflow-x-auto shrink-0">
                                {[
                                    { id: 'basic', label: 'Identity & Pricing', icon: Info },
                                    { id: 'details', label: 'Detailed Specs', icon: Settings },
                                    { id: 'media', label: 'Media Assets', icon: ImageIcon },
                                    { id: 'variants', label: 'Manage Variants', icon: Layers },
                                    { id: 'seo', label: 'SEO Metadata', icon: Globe }
                                ].map(tab => (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`py-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-[#966E2E]' : 'text-[#71717A] hover:text-[#18181B]'}`}
                                    >
                                        <tab.icon size={16} /> {tab.label}
                                        {activeTab === tab.id && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#966E2E] rounded-full" />}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 bg-white">
                                
                                {/* --- Tab Content: Basic --- */}
                                {activeTab === 'basic' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Product Primary Identity</label>
                                                <input 
                                                    required
                                                    value={currentProduct.name || ''}
                                                    onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-5 text-xl font-bold text-[#18181B] placeholder-[#A1A1AA] focus:border-[#966E2E] focus:bg-white outline-none transition-all"
                                                    placeholder="Product Name (e.g. Master Power Drill XT)"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Category</label>
                                                    <div className="relative">
                                                        <select 
                                                            value={currentProduct.category || 'Tools'}
                                                            onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-[#18181B] appearance-none outline-none focus:border-[#966E2E] focus:bg-white transition-all font-bold"
                                                        >
                                                            {categories.filter(c => c !== 'All').map(c => (
                                                                <option key={c} value={c}>{c}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Global Stock Qty</label>
                                                    <input 
                                                        type="number"
                                                        value={currentProduct.quantity || 0}
                                                        onChange={e => setCurrentProduct({...currentProduct, quantity: parseInt(e.target.value)})}
                                                        className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none font-bold"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Marketing Copy / Description</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAiGenerateContent('description')}
                                                        disabled={aiGeneratingDesc}
                                                        className="text-[10px] font-black uppercase tracking-wider text-[#966E2E] hover:text-[#7D5A25] flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#FAF9F5]/70 border border-[#E8E2D5] rounded-xl transition-all cursor-pointer disabled:opacity-50"
                                                        title="AI inspects title, brand, and media to write an accurate, highly specific description"
                                                    >
                                                        {aiGeneratingDesc ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                        <span>{aiGeneratingDesc ? 'Analyzing & Writing...' : '✨ Write with AI'}</span>
                                                    </button>
                                                </div>
                                                <textarea 
                                                    rows={6}
                                                    value={currentProduct.description || ''}
                                                    onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-6 text-[#18181B] placeholder-[#A1A1AA] focus:border-[#966E2E] focus:bg-white outline-none resize-none leading-relaxed"
                                                    placeholder="Describe the product value proposition..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Retail Pricing Architecture</label>
                                                <div className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-3xl p-8 space-y-6">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-bold text-[#71717A]">Public Listing Price</span>
                                                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-[#E8E2D5]">
                                                            <span className="text-[#71717A] font-bold">₹</span>
                                                            <input 
                                                                type="number"
                                                                value={currentProduct.retail_price || 0}
                                                                onChange={e => setCurrentProduct({...currentProduct, retail_price: parseFloat(e.target.value)})}
                                                                className="bg-transparent text-2xl font-black text-[#18181B] outline-none w-32 text-right"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Status & Visibility</label>
                                                <div 
                                                    onClick={() => setCurrentProduct({...currentProduct, in_stock: !currentProduct.in_stock})}
                                                    className={`p-6 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${currentProduct.in_stock ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentProduct.in_stock ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                                                            {currentProduct.in_stock ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[#18181B] font-bold">{currentProduct.in_stock ? 'Live in Catalog' : 'Hidden from Store'}</p>
                                                            <p className="text-[#71717A] text-[10px] uppercase font-black">{currentProduct.in_stock ? 'Publicly Orderable' : 'Unavailable for Purchase'}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-14 h-7 rounded-full relative transition-all ${currentProduct.in_stock ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${currentProduct.in_stock ? 'left-8' : 'left-1'}`} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- Tab Content: Details (Amazon Style) --- */}
                                {activeTab === 'details' && (
                                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase flex items-center gap-2"><Tag size={12}/> Brand Name</label>
                                                <input value={currentProduct.brand || ''} onChange={e => setCurrentProduct({...currentProduct, brand: e.target.value})} className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none" placeholder="e.g. Bosch, Makita" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase flex items-center gap-2"><Info size={12}/> Model Number</label>
                                                <input value={currentProduct.model_number || ''} onChange={e => setCurrentProduct({...currentProduct, model_number: e.target.value})} className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none" placeholder="e.g. GS-1200X" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase flex items-center gap-2"><LinkIcon size={12}/> Global SKU</label>
                                                <input value={currentProduct.sku || ''} onChange={e => setCurrentProduct({...currentProduct, sku: e.target.value})} className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none" placeholder="Unique Identifier" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-6">
                                                <h3 className="text-xs font-black text-[#18181B] uppercase tracking-widest flex items-center gap-3">
                                                    <Scale size={16} className="text-[#966E2E]" /> Physical Attributes
                                                </h3>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-[#71717A] uppercase">Weight (kg/g)</label>
                                                        <input value={currentProduct.weight || ''} onChange={e => setCurrentProduct({...currentProduct, weight: e.target.value})} className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none" placeholder="e.g. 2.5 kg" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-[#71717A] uppercase">Warranty Info</label>
                                                        <input value={currentProduct.warranty_info || ''} onChange={e => setCurrentProduct({...currentProduct, warranty_info: e.target.value})} className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none" placeholder="e.g. 2 Year Manufacturer" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-[#71717A] uppercase flex items-center gap-2"><Ruler size={12}/> Dimensions (L x W x H)</label>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <input value={currentProduct.dimensions?.length || ''} onChange={e => setCurrentProduct({...currentProduct, dimensions: {...(currentProduct.dimensions || {length: '', width: '', height: ''}), length: e.target.value}})} className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-center text-xs text-[#18181B]" placeholder="Length" />
                                                        <input value={currentProduct.dimensions?.width || ''} onChange={e => setCurrentProduct({...currentProduct, dimensions: {...(currentProduct.dimensions || {length: '', width: '', height: ''}), width: e.target.value}})} className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-center text-xs text-[#18181B]" placeholder="Width" />
                                                        <input value={currentProduct.dimensions?.height || ''} onChange={e => setCurrentProduct({...currentProduct, dimensions: {...(currentProduct.dimensions || {length: '', width: '', height: ''}), height: e.target.value}})} className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-center text-xs text-[#18181B]" placeholder="Height" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h3 className="text-xs font-black text-[#18181B] uppercase tracking-widest flex items-center gap-3">
                                                    <Settings size={16} className="text-[#966E2E]" /> Technical Specifications
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex gap-2">
                                                        <input id="spec-key" className="flex-1 bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-xs text-[#18181B]" placeholder="Spec Title (e.g. Motor Power)" />
                                                        <input id="spec-val" className="flex-1 bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-xs text-[#18181B]" placeholder="Spec Value (e.g. 1200W)" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                const keyInput = document.getElementById('spec-key') as HTMLInputElement;
                                                                const valInput = document.getElementById('spec-val') as HTMLInputElement;
                                                                const key = (keyInput?.value || '').trim();
                                                                const val = (valInput?.value || '').trim();
                                                                if (key && val) {
                                                                    if (SEO_RESERVED_KEYS.has(key.toLowerCase())) {
                                                                        alert('SEO fields (Slug, Meta Title, Description, Keywords) belong in the SEO tab and cannot be added to Technical Specifications.');
                                                                        return;
                                                                    }
                                                                    setCurrentProduct(prev => ({...prev, specifications: {...filterOutSeoKeys(prev.specifications || {}), [key]: val}}));
                                                                    keyInput.value = '';
                                                                    valInput.value = '';
                                                                }
                                                            }}
                                                            className="bg-white border border-[#E8E2D5] p-3 rounded-xl hover:bg-[#966E2E] hover:text-white text-[#18181B] transition-all cursor-pointer"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2">
                                                        {Object.entries(filterOutSeoKeys(currentProduct.specifications || {})).map(([k, v]) => (
                                                            <div key={k} className="flex justify-between items-center bg-[#FAF9F5] border border-[#E8E2D5] p-3 rounded-xl">
                                                                <span className="text-[10px] font-bold text-[#71717A] uppercase">{k}</span>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs text-[#18181B] font-bold">{v}</span>
                                                                    <button type="button" onClick={() => {
                                                                        const newSpecs = filterOutSeoKeys(currentProduct.specifications || {});
                                                                        delete newSpecs[k];
                                                                        setCurrentProduct({...currentProduct, specifications: newSpecs});
                                                                    }} className="text-rose-600 cursor-pointer"><X size={12}/></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- Tab Content: Media (Unified Gallery & Video) --- */}
                                {activeTab === 'media' && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D5] pb-6">
                                            <div>
                                                <h3 className="text-xl font-black text-[#18181B]">Media Gallery ({currentProduct.gallery?.length || 0} Assets)</h3>
                                                <p className="text-[#71717A] text-[10px] uppercase font-bold tracking-widest mt-1">
                                                    Upload images and videos. Reposition items or pick which image serves as the main display photo.
                                                </p>
                                            </div>
                                            <label className="inline-flex items-center gap-2 bg-[#966E2E] hover:bg-[#7D5A25] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-sm active:scale-95">
                                                <Upload size={16} />
                                                <span>Upload Media Files</span>
                                                <input 
                                                    type="file" 
                                                    multiple 
                                                    onChange={e => handleFileUpload(e, 'gallery')} 
                                                    className="hidden" 
                                                    accept="image/*,video/*" 
                                                />
                                            </label>
                                        </div>

                                        {/* Unified Gallery Grid */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {currentProduct.gallery?.map((item, index) => {
                                                    const isMain = currentProduct.image === item.url || (!currentProduct.image && index === 0);
                                                    return (
                                                        <div 
                                                            key={item.id} 
                                                            className={`relative rounded-3xl overflow-hidden bg-[#FAF9F5] border-2 transition-all group flex flex-col justify-between ${
                                                                isMain ? 'border-[#966E2E] ring-2 ring-[#966E2E]/20 shadow-sm' : 'border-[#E8E2D5] hover:border-[#966E2E]/50'
                                                            }`}
                                                        >
                                                            {/* Media Preview Aspect */}
                                                            <div className="relative aspect-square w-full bg-white flex items-center justify-center overflow-hidden p-3">
                                                                {item.type === 'video' ? (
                                                                    <video src={item.url} className="w-full h-full object-cover rounded-2xl" controls={false} muted playsInline />
                                                                ) : (
                                                                    <img src={item.url} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" alt="Product asset" />
                                                                )}

                                                                {/* Main Image Badge */}
                                                                {isMain && (
                                                                    <div className="absolute top-3 left-3 bg-[#966E2E] text-white font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 z-10">
                                                                        <Star size={11} fill="currentColor" />
                                                                        <span>Main Display Image</span>
                                                                    </div>
                                                                )}

                                                                {/* Delete button */}
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleDeleteGalleryItem(item.id)} 
                                                                    className="absolute top-3 right-3 p-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                                                                    title="Remove from gallery"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>

                                                            {/* Card Action Toolbar (Reorder + Set Main) */}
                                                            <div className="p-3 bg-white border-t border-[#E8E2D5] flex items-center justify-between gap-2">
                                                                {/* Left / Right Position Shift */}
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        disabled={index === 0}
                                                                        onClick={() => handleMoveGalleryItem(index, 'left')}
                                                                        className="p-2 rounded-xl bg-[#FAF9F5] hover:bg-white border border-[#E8E2D5] text-[#18181B] disabled:opacity-30 transition-all"
                                                                        title="Move Left"
                                                                    >
                                                                        <ChevronLeft size={14} />
                                                                    </button>
                                                                    <span className="text-[10px] font-mono font-bold text-[#71717A] px-1">#{index + 1}</span>
                                                                    <button
                                                                        type="button"
                                                                        disabled={index === (currentProduct.gallery?.length || 1) - 1}
                                                                        onClick={() => handleMoveGalleryItem(index, 'right')}
                                                                        className="p-2 rounded-xl bg-[#FAF9F5] hover:bg-white border border-[#E8E2D5] text-[#18181B] disabled:opacity-30 transition-all"
                                                                        title="Move Right"
                                                                    >
                                                                        <ChevronRight size={14} />
                                                                    </button>
                                                                </div>

                                                                {/* Set Main Image Button */}
                                                                {!isMain && item.type !== 'video' ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSetMainImage(item.url)}
                                                                        className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#966E2E] hover:text-white text-[#966E2E] border border-[#E8E2D5] text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                                                                    >
                                                                        <Star size={11} />
                                                                        <span>Set as Main</span>
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-[9px] font-black text-[#966E2E] uppercase tracking-wider px-2">Primary</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Upload Tile Dropzone */}
                                                <label className="relative aspect-square border-2 border-dashed border-[#E8E2D5] hover:border-[#966E2E] rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all group bg-[#FAF9F5]/40 hover:bg-[#FAF9F5] min-h-[220px]">
                                                    <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8E2D5] group-hover:border-[#966E2E]/40 flex items-center justify-center mb-3 transition-colors">
                                                        <Plus className="text-[#71717A] group-hover:text-[#966E2E]" size={28} />
                                                    </div>
                                                    <p className="text-[#18181B] font-black text-xs uppercase tracking-wider mb-1">Add More Media</p>
                                                    <p className="text-[#71717A] text-[10px] font-bold">Auto WebP compression</p>
                                                    <input type="file" multiple onChange={e => handleFileUpload(e, 'gallery')} className="hidden" accept="image/*,video/*" />
                                                </label>
                                            </div>

                                            {uploading && (
                                                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-bold uppercase tracking-wider">
                                                    <Loader2 className="animate-spin" size={18} />
                                                    <span>Compressing and uploading media files to storage...</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* External Video / YouTube Showcase */}
                                        <div className="pt-8 border-t border-[#E8E2D5] space-y-4">
                                            <h4 className="text-xs font-black text-[#18181B] uppercase tracking-widest flex items-center gap-2">
                                                <Video size={16} className="text-[#966E2E]" />
                                                <span>External Video Demonstration (YouTube / Direct Link)</span>
                                            </h4>
                                            <input 
                                                value={currentProduct.video_url || ''} 
                                                onChange={e => setCurrentProduct({...currentProduct, video_url: e.target.value})} 
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white rounded-2xl p-4 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none transition-all font-mono" 
                                                placeholder="https://www.youtube.com/watch?v=... or direct MP4 URL" 
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* --- Tab Content: Variants (Direct Image Upload & Attributes) --- */}
                                {activeTab === 'variants' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-black text-[#18181B]">Variant Architecture</h3>
                                                <p className="text-[#71717A] text-[10px] uppercase font-bold tracking-widest mt-1">Define options with direct image uploads (Size, Model, Material, Voltage)</p>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={addVariant}
                                                className="bg-[#966E2E] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#7D5A25] transition-all shadow-sm"
                                            >
                                                + Define New Variant
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase">Variant Type Label</label>
                                                <input 
                                                    value={currentProduct.variant_type || ''} 
                                                    onChange={e => setCurrentProduct({...currentProduct, variant_type: e.target.value})}
                                                    className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl px-4 py-2 text-xs text-[#18181B]"
                                                    placeholder="e.g. Size, Material, or Voltage"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {currentProduct.variants?.map(v => (
                                                    <div key={v.id} className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-3xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                                        {/* Variant Name */}
                                                        <div className="md:col-span-3 space-y-2">
                                                            <label className="text-[10px] font-black text-[#71717A] uppercase">Variant Option Name</label>
                                                            <input value={v.name} onChange={e => updateVariant(v.id, {name: e.target.value})} className="w-full bg-white border border-[#E8E2D5] rounded-xl p-3 text-xs text-[#18181B] font-bold" placeholder="e.g. 5 Inch / 220V" />
                                                        </div>

                                                        {/* SKU Override */}
                                                        <div className="md:col-span-2 space-y-2">
                                                            <label className="text-[10px] font-black text-[#71717A] uppercase">SKU Override</label>
                                                            <input value={v.sku || ''} onChange={e => updateVariant(v.id, {sku: e.target.value})} className="w-full bg-white border border-[#E8E2D5] rounded-xl p-3 text-xs text-[#18181B] font-mono" placeholder="e.g. SKU-VAR-01" />
                                                        </div>

                                                        {/* Price */}
                                                        <div className="md:col-span-2 space-y-2">
                                                            <label className="text-[10px] font-black text-[#71717A] uppercase">Specific Price (₹)</label>
                                                            <input type="number" value={v.price} onChange={e => updateVariant(v.id, {price: parseFloat(e.target.value) || 0})} className="w-full bg-white border border-[#E8E2D5] rounded-xl p-3 text-xs text-[#18181B] font-bold" />
                                                        </div>

                                                        {/* Direct Image Upload */}
                                                        <div className="md:col-span-3 space-y-2">
                                                            <label className="text-[10px] font-black text-[#71717A] uppercase">Variant Photo</label>
                                                            <div className="flex items-center gap-3">
                                                                {v.image ? (
                                                                    <div className="relative w-12 h-12 rounded-xl bg-white border border-[#E8E2D5] overflow-hidden shrink-0 group">
                                                                        <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => updateVariant(v.id, { image: '' })} 
                                                                            className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                                                                            title="Remove image"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ) : null}

                                                                <label className="flex-1 cursor-pointer">
                                                                    <div className="h-12 bg-white hover:bg-[#FAF9F5] border border-dashed border-[#E8E2D5] hover:border-[#966E2E] rounded-xl px-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-[#18181B] transition-all">
                                                                        {variantUploadingId === v.id ? (
                                                                            <>
                                                                                <Loader2 size={14} className="animate-spin text-[#966E2E]" />
                                                                                <span>Uploading...</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Upload size={14} className="text-[#966E2E]" />
                                                                                <span>{v.image ? 'Change Photo' : 'Upload Photo'}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <input 
                                                                        type="file" 
                                                                        accept="image/*" 
                                                                        onChange={e => handleVariantUpload(e, v.id)} 
                                                                        className="hidden" 
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>

                                                        {/* Stock Toggle & Delete */}
                                                        <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-6">
                                                            <div className="flex items-center gap-2">
                                                                <div 
                                                                    onClick={() => updateVariant(v.id, {inStock: !v.inStock})}
                                                                    className={`w-10 h-5 rounded-full relative transition-all cursor-pointer ${v.inStock ? 'bg-emerald-600' : 'bg-gray-300'}`}
                                                                >
                                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${v.inStock ? 'left-5' : 'left-1'}`} />
                                                                </div>
                                                                <span className="text-[9px] font-black text-[#71717A] uppercase">{v.inStock ? 'In Stock' : 'OOS'}</span>
                                                            </div>
                                                            <button type="button" onClick={() => removeVariant(v.id)} className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"><Trash2 size={15}/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!currentProduct.variants || currentProduct.variants.length === 0) && (
                                                    <div className="py-20 text-center border-2 border-dashed border-[#E8E2D5] rounded-3xl bg-white">
                                                        <Layers className="mx-auto text-[#A1A1AA] mb-4" size={48} />
                                                        <p className="text-[#71717A] font-bold text-xs uppercase">No Variants Defined Yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- Tab Content: SEO Metadata --- */}
                                {activeTab === 'seo' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-black text-[#18181B] flex items-center gap-2">
                                                    <span>Search Engine Optimization</span>
                                                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">AI Powered</span>
                                                </h3>
                                                <p className="text-[#71717A] text-[10px] uppercase font-bold tracking-widest mt-1">Configure search engine visibility and previews</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleAiGenerateContent('seo')}
                                                disabled={aiGeneratingSeo}
                                                className="px-5 py-2.5 bg-[#966E2E] hover:bg-[#7D5A25] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                                title="AI will inspect the product title, brand, and details to generate an optimized Meta Title, Description, and Keywords"
                                            >
                                                {aiGeneratingSeo ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                <span>{aiGeneratingSeo ? 'Analyzing & Writing SEO...' : '✨ Generate SEO with AI'}</span>
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest block">Meta Title</label>
                                                <input 
                                                    type="text" 
                                                    value={currentProduct.seo_title || ''} 
                                                    onChange={e => setCurrentProduct({...currentProduct, seo_title: e.target.value})} 
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white rounded-2xl p-4 text-xs text-[#18181B]" 
                                                    placeholder="e.g. Buy Premium Rolling Mill | Dinanath & Sons" 
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest block">Meta Description</label>
                                                <textarea 
                                                    rows={4} 
                                                    value={currentProduct.seo_description || ''} 
                                                    onChange={e => setCurrentProduct({...currentProduct, seo_description: e.target.value})} 
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white rounded-2xl p-4 text-xs text-[#18181B]" 
                                                    placeholder="Provide a search snippet summarizing the product..." 
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest block">Keywords (comma separated)</label>
                                                <input 
                                                    type="text" 
                                                    value={currentProduct.seo_keywords || ''} 
                                                    onChange={e => setCurrentProduct({...currentProduct, seo_keywords: e.target.value})} 
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white rounded-2xl p-4 text-xs text-[#18181B]" 
                                                    placeholder="rolling mill, jewelry tools, wholesale Delhi" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- Footer Actions --- */}
                                <div className="sticky bottom-0 bg-white pt-6 pb-2 flex justify-end gap-4 border-t border-[#E8E2D5] z-20">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowForm(false)}
                                        className="px-8 py-3 rounded-2xl border border-[#E8E2D5] bg-white hover:bg-[#FAF9F5] text-[#71717A] hover:text-[#18181B] font-black text-[10px] uppercase tracking-widest transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={formLoading || uploading}
                                        className="px-12 py-3 bg-[#966E2E] hover:bg-[#7D5A25] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-sm transition-all flex items-center gap-3 active:scale-95"
                                    >
                                        {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        {isEditing ? 'Sync Changes' : 'Initialize Listing'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
