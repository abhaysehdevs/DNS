'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Plus, Edit, Trash2, Search, X, Save, Image as ImageIcon, Loader2, 
    Filter, AlertCircle, CheckCircle, XCircle, Layers, Box, ChevronDown, 
    CheckSquare, Square, MoreHorizontal, Download, Upload, Video, 
    Settings, Info, Zap, Scale, Ruler, ShieldCheck, Tag, Link as LinkIcon,
    Globe, Star, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight
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

            // Store SEO fields safely inside specifications
            const specs = {
                ...(currentProduct.specifications || {}),
                seo_title: currentProduct.seo_title || '',
                seo_description: currentProduct.seo_description || '',
                seo_keywords: currentProduct.seo_keywords || ''
            };

            const generatedSku = currentProduct.sku?.trim() ? currentProduct.sku.trim() : `DNS-${Date.now().toString().slice(-6)}`;
            const baseSlug = (currentProduct.name || 'product')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            const generatedSlug = isEditing && currentProduct.slug ? currentProduct.slug : `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

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
                specifications: specs,
                variants: currentProduct.variants || [],
                variant_type: currentProduct.variant_type || '',
                gallery: galleryList
            };

            let saveError = null;
            if (isEditing && currentProduct.id) {
                const { error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', currentProduct.id);
                saveError = error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([payload]);
                saveError = error;

                // If unique constraint error on sku or slug, retry automatically with unique suffix
                if (saveError && (saveError.message?.includes('unique constraint') || saveError.code === '23505')) {
                    payload.sku = `${payload.sku}-copy-${Math.floor(100 + Math.random() * 900)}`;
                    payload.slug = `${payload.slug}-${Math.floor(100 + Math.random() * 900)}`;
                    const { error: retryError } = await supabase.from('products').insert([payload]);
                    saveError = retryError;
                }
            }

            if (saveError) throw saveError;

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
        const specs = p.specifications || {};
        setCurrentProduct({ 
            ...p, 
            seo_title: p.seo_title || (specs as any).seo_title || '',
            seo_description: p.seo_description || (specs as any).seo_description || '',
            seo_keywords: p.seo_keywords || (specs as any).seo_keywords || '',
            features: p.features || [], 
            specifications: specs,
            variants: p.variants || [],
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
            gallery: [],
            seo_title: '',
            seo_description: '',
            seo_keywords: '',
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
        <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8 max-w-[1600px] mx-auto">
            
            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white flex items-center gap-4">
                        <Box className="text-blue-500" size={40} /> Inventory Master
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 font-medium tracking-wide uppercase">Manage professional grade listings & global stock</p>
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
                        className="bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-6 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase transition-all"
                    >
                        <Download size={16} /> EXPORT CSV
                    </button>
                    <button 
                        onClick={handleAddNew}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl flex items-center gap-3 text-sm font-black shadow-2xl shadow-blue-900/40 transition-all active:scale-95"
                    >
                        <Plus size={20} strokeWidth={3} /> NEW LISTING
                    </button>
                </div>
            </div>

            {/* --- Table Area --- */}
            <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {/* Search & Filter Toolbar */}
                <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row gap-4 bg-gray-900/50 backdrop-blur">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by Name, SKU, or Brand..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                    <select 
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="bg-black border border-gray-800 rounded-2xl px-6 py-3 text-sm outline-none focus:border-blue-500"
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3 p-3">
                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={48} /></div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="py-16 text-center text-gray-600 italic">No products found.</div>
                    ) : filteredProducts.map(p => (
                        <div key={p.id} className="bg-black border border-gray-800 rounded-2xl p-4 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shrink-0">
                                    {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-800"><ImageIcon size={24} /></div>}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="text-white font-bold text-base truncate">{p.name}</div>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (selectedIds.includes(p.id)) {
                                                    setSelectedIds(selectedIds.filter(id => id !== p.id));
                                                } else {
                                                    setSelectedIds([...selectedIds, p.id]);
                                                }
                                            }}
                                            className="text-gray-500 hover:text-white shrink-0"
                                        >
                                            {selectedIds.includes(p.id) ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} />}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="text-[9px] font-black uppercase text-gray-500 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">{p.category}</span>
                                        <span className="text-[9px] font-mono text-gray-600">SKU: {p.sku || p.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 py-2 border-t border-b border-gray-800/50">
                                <div>
                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-wider block">Inventory</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className={`text-base font-black ${p.quantity < 10 ? 'text-red-500' : 'text-green-500'}`}>{p.quantity}</span>
                                        <span className="text-[9px] text-gray-500 font-bold uppercase">Units</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-gray-600 font-black uppercase tracking-wider block">Price</span>
                                    <span className="text-base font-black text-white mt-0.5 block">₹{p.retail_price.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <button 
                                    onClick={() => {
                                        const { id, ...clone } = p;
                                        const newSku = p.sku ? `${p.sku}-COPY-${Math.floor(100 + Math.random() * 900)}` : `DNS-${Date.now().toString().slice(-6)}`;
                                        const newSlug = p.slug ? `${p.slug}-copy-${Math.floor(100 + Math.random() * 900)}` : undefined;
                                        setCurrentProduct({ 
                                            ...clone, 
                                            name: `${clone.name} (Copy)`, 
                                            sku: newSku,
                                            slug: newSlug
                                        });
                                        setIsEditing(false);
                                        setShowForm(true);
                                    }} 
                                    className="flex-1 py-2.5 bg-amber-600/10 hover:bg-amber-600 hover:text-white text-amber-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <Layers size={14} /> Duplicate
                                </button>
                                <button 
                                    onClick={() => handleEdit(p)} 
                                    className="flex-1 py-2.5 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button 
                                    onClick={() => handleDelete(p.id)} 
                                    className="p-2.5 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-400 rounded-xl transition-all"
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
                        <thead className="bg-black text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
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
                                        className="text-gray-500 hover:text-white"
                                    >
                                        {selectedIds.length === filteredProducts.length ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} />}
                                    </button>
                                </th>
                                <th className="px-8 py-6">Product Information</th>
                                <th className="px-8 py-6">Inventory Status</th>
                                <th className="px-8 py-6 text-right">Retail Price</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-32 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={48} /></td></tr>
                            ) : filteredProducts.map(p => (
                                <tr key={p.id} className="group hover:bg-blue-900/5 transition-colors">
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
                                            className="text-gray-500 hover:text-white"
                                        >
                                            {selectedIds.includes(p.id) ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} />}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-black border border-gray-800 rounded-2xl overflow-hidden shrink-0 group-hover:border-blue-500/50 transition-all">
                                                {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-800"><ImageIcon /></div>}
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{p.name}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase text-gray-600 bg-black px-2 py-1 rounded border border-gray-800">{p.category}</span>
                                                    <span className="text-[10px] font-mono text-gray-700">SKU: {p.sku || p.id.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xl font-black ${p.quantity < 10 ? 'text-red-500' : 'text-green-500'}`}>{p.quantity}</span>
                                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Units Available</span>
                                            </div>
                                            {p.variants?.length > 0 && <div className="text-[10px] text-blue-500 font-bold flex items-center gap-1"><Layers size={10} /> {p.variants.length} Variants Defined</div>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="text-xl font-black text-white">₹{p.retail_price.toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-600 font-black uppercase tracking-tighter">Public Listing Price</div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-4 md:group-hover:translate-x-0">
                                                <button 
                                                    onClick={() => {
                                                        const { id, ...clone } = p;
                                                        const newSku = p.sku ? `${p.sku}-COPY-${Math.floor(100 + Math.random() * 900)}` : `DNS-${Date.now().toString().slice(-6)}`;
                                                        const newSlug = p.slug ? `${p.slug}-copy-${Math.floor(100 + Math.random() * 900)}` : undefined;
                                                        setCurrentProduct({ 
                                                            ...clone, 
                                                            name: `${clone.name} (Copy)`, 
                                                            sku: newSku,
                                                            slug: newSlug
                                                        });
                                                        setIsEditing(false);
                                                        setShowForm(true);
                                                    }} 
                                                    className="p-3 bg-amber-600/10 text-amber-400 hover:bg-amber-600 hover:text-white rounded-2xl transition-all"
                                                    title="Duplicate Listing"
                                                >
                                                    <Layers size={20} />
                                                </button>
                                                <button onClick={() => handleEdit(p)} className="p-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all"><Edit size={20} /></button>
                                                <button onClick={() => handleDelete(p.id)} className="p-3 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all"><Trash2 size={20} /></button>
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
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-gray-800 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 max-w-lg w-[90vw] justify-between backdrop-blur"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                                {selectedIds.length}
                            </span>
                            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleBulkToggleStock}
                                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                                Toggle Stock
                            </button>
                            <button 
                                onClick={handleBulkDelete}
                                className="px-3 py-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                            >
                                Delete
                            </button>
                            <button 
                                onClick={() => setSelectedIds([])}
                                className="p-2 text-gray-500 hover:text-white rounded-xl transition-all"
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
                            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-6xl bg-gray-900 border border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-10 border-b border-gray-800 flex justify-between items-center bg-gray-900 z-10 shrink-0">
                                <div>
                                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                        <Zap size={14} fill="currentColor" /> Professional Listing Engine
                                    </div>
                                    <h2 className="text-4xl font-black text-white">{isEditing ? 'Sync Listing' : 'Initialize Product'}</h2>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => setShowForm(false)} className="w-14 h-14 bg-black border border-gray-800 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-all"><X size={28} /></button>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex px-10 gap-8 border-b border-gray-800 bg-black/20 overflow-x-auto shrink-0">
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
                                        className={`py-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        <tab.icon size={16} /> {tab.label}
                                        {activeTab === tab.id && <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-full" />}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-12 bg-gradient-to-b from-gray-900 to-black">
                                
                                {/* --- Tab Content: Basic --- */}
                                {activeTab === 'basic' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Product Primary Identity</label>
                                                <input 
                                                    required
                                                    value={currentProduct.name || ''}
                                                    onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                                                    className="w-full bg-black border border-gray-800 rounded-3xl p-5 text-xl font-bold text-white focus:border-blue-500 outline-none transition-all"
                                                    placeholder="Product Name (e.g. Master Power Drill XT)"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Category</label>
                                                    <div className="relative">
                                                        <select 
                                                            value={currentProduct.category || 'Tools'}
                                                            onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                                                            className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white appearance-none outline-none focus:border-blue-500 transition-all font-bold"
                                                        >
                                                            {categories.filter(c => c !== 'All').map(c => (
                                                                <option key={c} value={c}>{c}</option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Global Stock Qty</label>
                                                    <input 
                                                        type="number"
                                                        value={currentProduct.quantity || 0}
                                                        onChange={e => setCurrentProduct({...currentProduct, quantity: parseInt(e.target.value)})}
                                                        className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none font-bold"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Marketing Copy / Description</label>
                                                <textarea 
                                                    rows={6}
                                                    value={currentProduct.description || ''}
                                                    onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                                                    className="w-full bg-black border border-gray-800 rounded-3xl p-6 text-gray-300 focus:border-blue-500 outline-none resize-none leading-relaxed"
                                                    placeholder="Describe the product value proposition..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Retail Pricing Architecture</label>
                                                <div className="bg-black border border-gray-800 rounded-[2rem] p-8 space-y-6">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-bold text-gray-400">Public Listing Price</span>
                                                        <div className="flex items-center gap-3 bg-gray-900 px-4 py-2 rounded-xl border border-gray-800">
                                                            <span className="text-gray-500 font-bold">₹</span>
                                                            <input 
                                                                type="number"
                                                                value={currentProduct.retail_price || 0}
                                                                onChange={e => setCurrentProduct({...currentProduct, retail_price: parseFloat(e.target.value)})}
                                                                className="bg-transparent text-2xl font-black text-white outline-none w-32 text-right"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Status & Visibility</label>
                                                <div 
                                                    onClick={() => setCurrentProduct({...currentProduct, in_stock: !currentProduct.in_stock})}
                                                    className={`p-6 rounded-3xl border cursor-pointer transition-all flex items-center justify-between ${currentProduct.in_stock ? 'bg-green-600/10 border-green-600/50' : 'bg-red-600/10 border-red-600/50'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentProduct.in_stock ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                                                            {currentProduct.in_stock ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-bold">{currentProduct.in_stock ? 'Live in Catalog' : 'Hidden from Store'}</p>
                                                            <p className="text-gray-500 text-[10px] uppercase font-black">{currentProduct.in_stock ? 'Publicly Orderable' : 'Unavailable for Purchase'}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-14 h-7 rounded-full relative transition-all ${currentProduct.in_stock ? 'bg-green-600' : 'bg-gray-800'}`}>
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
                                                <label className="text-[10px] font-black text-gray-600 uppercase flex items-center gap-2"><Tag size={12}/> Brand Name</label>
                                                <input value={currentProduct.brand || ''} onChange={e => setCurrentProduct({...currentProduct, brand: e.target.value})} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none" placeholder="e.g. Bosch, Makita" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-600 uppercase flex items-center gap-2"><Info size={12}/> Model Number</label>
                                                <input value={currentProduct.model_number || ''} onChange={e => setCurrentProduct({...currentProduct, model_number: e.target.value})} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none" placeholder="e.g. GS-1200X" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-600 uppercase flex items-center gap-2"><LinkIcon size={12}/> Global SKU</label>
                                                <input value={currentProduct.sku || ''} onChange={e => setCurrentProduct({...currentProduct, sku: e.target.value})} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none" placeholder="Unique Identifier" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-6">
                                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                                                    <Scale size={16} /> Physical Attributes
                                                </h3>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-600 uppercase">Weight (kg/g)</label>
                                                        <input value={currentProduct.weight || ''} onChange={e => setCurrentProduct({...currentProduct, weight: e.target.value})} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none" placeholder="e.g. 2.5 kg" />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[10px] font-black text-gray-600 uppercase">Warranty Info</label>
                                                        <input value={currentProduct.warranty_info || ''} onChange={e => setCurrentProduct({...currentProduct, warranty_info: e.target.value})} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none" placeholder="e.g. 2 Year Manufacturer" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-gray-600 uppercase flex items-center gap-2"><Ruler size={12}/> Dimensions (L x W x H)</label>
                                                    <div className="grid grid-cols-3 gap-3">
                                                        <input value={currentProduct.dimensions?.length || ''} onChange={e => setCurrentProduct({...currentProduct, dimensions: {...(currentProduct.dimensions || {length: '', width: '', height: ''}), length: e.target.value}})} className="bg-black border border-gray-800 rounded-xl p-3 text-center text-xs" placeholder="Length" />
                                                        <input value={currentProduct.dimensions?.width || ''} onChange={e => setCurrentProduct({...currentProduct, dimensions: {...(currentProduct.dimensions || {length: '', width: '', height: ''}), width: e.target.value}})} className="bg-black border border-gray-800 rounded-xl p-3 text-center text-xs" placeholder="Width" />
                                                        <input value={currentProduct.dimensions?.height || ''} onChange={e => setCurrentProduct({...currentProduct, dimensions: {...(currentProduct.dimensions || {length: '', width: '', height: ''}), height: e.target.value}})} className="bg-black border border-gray-800 rounded-xl p-3 text-center text-xs" placeholder="Height" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-3">
                                                    <Settings size={16} /> Technical Specifications
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex gap-2">
                                                        <input id="spec-key" className="flex-1 bg-black border border-gray-800 rounded-xl p-3 text-xs" placeholder="Spec Title (e.g. Motor Power)" />
                                                        <input id="spec-val" className="flex-1 bg-black border border-gray-800 rounded-xl p-3 text-xs" placeholder="Spec Value (e.g. 1200W)" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                const key = (document.getElementById('spec-key') as HTMLInputElement).value;
                                                                const val = (document.getElementById('spec-val') as HTMLInputElement).value;
                                                                if (key && val) {
                                                                    setCurrentProduct(prev => ({...prev, specifications: {...(prev.specifications || {}), [key]: val}}));
                                                                    (document.getElementById('spec-key') as HTMLInputElement).value = '';
                                                                    (document.getElementById('spec-val') as HTMLInputElement).value = '';
                                                                }
                                                            }}
                                                            className="bg-gray-800 p-3 rounded-xl hover:bg-white hover:text-black transition-all"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-2">
                                                        {Object.entries(currentProduct.specifications || {}).map(([k, v]) => (
                                                            <div key={k} className="flex justify-between items-center bg-black border border-gray-800 p-3 rounded-xl">
                                                                <span className="text-[10px] font-bold text-gray-500 uppercase">{k}</span>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs text-white font-bold">{v}</span>
                                                                    <button type="button" onClick={() => {
                                                                        const newSpecs = {...(currentProduct.specifications || {})};
                                                                        delete newSpecs[k];
                                                                        setCurrentProduct({...currentProduct, specifications: newSpecs});
                                                                    }} className="text-red-500"><X size={12}/></button>
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
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
                                            <div>
                                                <h3 className="text-xl font-black text-white">Media Gallery ({currentProduct.gallery?.length || 0} Assets)</h3>
                                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                                                    Upload images and videos. Reposition items or pick which image serves as the main display photo.
                                                </p>
                                            </div>
                                            <label className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-blue-900/20 active:scale-95">
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
                                                            className={`relative rounded-3xl overflow-hidden bg-black border-2 transition-all group flex flex-col justify-between ${
                                                                isMain ? 'border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/20' : 'border-gray-800 hover:border-gray-700'
                                                            }`}
                                                        >
                                                            {/* Media Preview Aspect */}
                                                            <div className="relative aspect-square w-full bg-gray-950 flex items-center justify-center overflow-hidden p-3">
                                                                {item.type === 'video' ? (
                                                                    <video src={item.url} className="w-full h-full object-cover rounded-2xl" controls={false} muted playsInline />
                                                                ) : (
                                                                    <img src={item.url} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" alt="Product asset" />
                                                                )}

                                                                {/* Main Image Badge */}
                                                                {isMain && (
                                                                    <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-10">
                                                                        <Star size={11} fill="currentColor" />
                                                                        <span>Main Display Image</span>
                                                                    </div>
                                                                )}

                                                                {/* Delete button */}
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => handleDeleteGalleryItem(item.id)} 
                                                                    className="absolute top-3 right-3 p-2.5 bg-red-600/90 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                                                                    title="Remove from gallery"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>

                                                            {/* Card Action Toolbar (Reorder + Set Main) */}
                                                            <div className="p-3 bg-gray-900/90 border-t border-gray-800 flex items-center justify-between gap-2">
                                                                {/* Left / Right Position Shift */}
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        type="button"
                                                                        disabled={index === 0}
                                                                        onClick={() => handleMoveGalleryItem(index, 'left')}
                                                                        className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-30 disabled:hover:bg-gray-800 transition-all"
                                                                        title="Move Left"
                                                                    >
                                                                        <ChevronLeft size={14} />
                                                                    </button>
                                                                    <span className="text-[10px] font-mono font-bold text-gray-500 px-1">#{index + 1}</span>
                                                                    <button
                                                                        type="button"
                                                                        disabled={index === (currentProduct.gallery?.length || 1) - 1}
                                                                        onClick={() => handleMoveGalleryItem(index, 'right')}
                                                                        className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 disabled:opacity-30 disabled:hover:bg-gray-800 transition-all"
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
                                                                        className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-amber-500 hover:text-black text-amber-400 text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                                                                    >
                                                                        <Star size={11} />
                                                                        <span>Set as Main</span>
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider px-2">Primary</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Upload Tile Dropzone */}
                                                <label className="relative aspect-square border-2 border-dashed border-gray-800 hover:border-blue-500 rounded-3xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all group bg-black/40 hover:bg-blue-500/5 min-h-[220px]">
                                                    <div className="w-14 h-14 rounded-2xl bg-gray-900 group-hover:bg-blue-500/20 flex items-center justify-center mb-3 transition-colors">
                                                        <Plus className="text-gray-500 group-hover:text-blue-400" size={28} />
                                                    </div>
                                                    <p className="text-white font-black text-xs uppercase tracking-wider mb-1">Add More Media</p>
                                                    <p className="text-gray-500 text-[10px] font-bold">Auto WebP compression</p>
                                                    <input type="file" multiple onChange={e => handleFileUpload(e, 'gallery')} className="hidden" accept="image/*,video/*" />
                                                </label>
                                            </div>

                                            {uploading && (
                                                <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-xs font-bold uppercase tracking-wider">
                                                    <Loader2 className="animate-spin" size={18} />
                                                    <span>Compressing and uploading media files to storage...</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* External Video / YouTube Showcase */}
                                        <div className="pt-8 border-t border-gray-800 space-y-4">
                                            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                <Video size={16} className="text-purple-400" />
                                                <span>External Video Demonstration (YouTube / Vimeo / Direct Link)</span>
                                            </h4>
                                            <input 
                                                value={currentProduct.video_url || ''} 
                                                onChange={e => setCurrentProduct({...currentProduct, video_url: e.target.value})} 
                                                className="w-full bg-black border border-gray-800 focus:border-purple-500 rounded-2xl p-4 text-xs text-white placeholder-gray-600 focus:outline-none transition-all font-mono" 
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
                                                <h3 className="text-xl font-black text-white">Variant Architecture</h3>
                                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Define options with direct image uploads (Size, Model, Material, Voltage)</p>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={addVariant}
                                                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                                            >
                                                + Define New Variant
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <label className="text-[10px] font-black text-gray-600 uppercase">Variant Type Label</label>
                                                <input 
                                                    value={currentProduct.variant_type || ''} 
                                                    onChange={e => setCurrentProduct({...currentProduct, variant_type: e.target.value})}
                                                    className="bg-black border border-gray-800 rounded-xl px-4 py-2 text-xs text-white"
                                                    placeholder="e.g. Size, Material, or Voltage"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {currentProduct.variants?.map(v => (
                                                    <div key={v.id} className="bg-black border border-gray-800 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                                        {/* Variant Name */}
                                                        <div className="md:col-span-3 space-y-2">
                                                            <label className="text-[10px] font-black text-gray-700 uppercase">Variant Option Name</label>
                                                            <input value={v.name} onChange={e => updateVariant(v.id, {name: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white font-bold" placeholder="e.g. 5 Inch / 220V" />
                                                        </div>

                                                        {/* SKU Override */}
                                                        <div className="md:col-span-2 space-y-2">
                                                            <label className="text-[10px] font-black text-gray-700 uppercase">SKU Override</label>
                                                            <input value={v.sku || ''} onChange={e => updateVariant(v.id, {sku: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white font-mono" placeholder="e.g. SKU-VAR-01" />
                                                        </div>

                                                        {/* Price */}
                                                        <div className="md:col-span-2 space-y-2">
                                                            <label className="text-[10px] font-black text-gray-700 uppercase">Specific Price (₹)</label>
                                                            <input type="number" value={v.price} onChange={e => updateVariant(v.id, {price: parseFloat(e.target.value) || 0})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white font-bold" />
                                                        </div>

                                                        {/* Direct Image Upload */}
                                                        <div className="md:col-span-3 space-y-2">
                                                            <label className="text-[10px] font-black text-gray-700 uppercase">Variant Photo</label>
                                                            <div className="flex items-center gap-3">
                                                                {v.image ? (
                                                                    <div className="relative w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 overflow-hidden shrink-0 group">
                                                                        <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => updateVariant(v.id, { image: '' })} 
                                                                            className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                                                                            title="Remove image"
                                                                        >
                                                                            <X size={14} />
                                                                        </button>
                                                                    </div>
                                                                ) : null}

                                                                <label className="flex-1 cursor-pointer">
                                                                    <div className="h-12 bg-gray-900 hover:bg-gray-800 border border-dashed border-gray-700 hover:border-blue-500 rounded-xl px-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-gray-300 transition-all">
                                                                        {variantUploadingId === v.id ? (
                                                                            <>
                                                                                <Loader2 size={14} className="animate-spin text-blue-400" />
                                                                                <span>Uploading...</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Upload size={14} className="text-blue-400" />
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
                                                                    className={`w-10 h-5 rounded-full relative transition-all cursor-pointer ${v.inStock ? 'bg-green-600' : 'bg-gray-800'}`}
                                                                >
                                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${v.inStock ? 'left-5' : 'left-1'}`} />
                                                                </div>
                                                                <span className="text-[9px] font-black text-gray-500 uppercase">{v.inStock ? 'In Stock' : 'OOS'}</span>
                                                            </div>
                                                            <button type="button" onClick={() => removeVariant(v.id)} className="p-2.5 bg-red-900/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all"><Trash2 size={15}/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!currentProduct.variants || currentProduct.variants.length === 0) && (
                                                    <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-[2rem] bg-black/20">
                                                        <Layers className="mx-auto text-gray-800 mb-4" size={48} />
                                                        <p className="text-gray-600 font-bold text-xs uppercase">No Variants Defined Yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- Tab Content: SEO Metadata --- */}
                                {activeTab === 'seo' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                        <div>
                                            <h3 className="text-xl font-black text-white">Search Engine Optimization</h3>
                                            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Configure search engine visibility and previews</p>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Meta Title</label>
                                                <input 
                                                    type="text" 
                                                    value={currentProduct.seo_title || ''} 
                                                    onChange={e => setCurrentProduct({...currentProduct, seo_title: e.target.value})} 
                                                    className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-xs text-white" 
                                                    placeholder="e.g. Buy Premium Rolling Mill | Dinanath & Sons" 
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Meta Description</label>
                                                <textarea 
                                                    rows={4} 
                                                    value={currentProduct.seo_description || ''} 
                                                    onChange={e => setCurrentProduct({...currentProduct, seo_description: e.target.value})} 
                                                    className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-xs text-white" 
                                                    placeholder="Provide a search snippet summarizing the product..." 
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block">Keywords (comma separated)</label>
                                                <input 
                                                    type="text" 
                                                    value={currentProduct.seo_keywords || ''} 
                                                    onChange={e => setCurrentProduct({...currentProduct, seo_keywords: e.target.value})} 
                                                    className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-xs text-white" 
                                                    placeholder="rolling mill, jewelry tools, wholesale Delhi" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- Footer Actions --- */}
                                <div className="sticky bottom-0 bg-gray-900 pt-10 pb-2 flex justify-end gap-6 border-t border-gray-800 z-20">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowForm(false)}
                                        className="px-10 py-4 rounded-3xl border border-gray-800 hover:bg-gray-800 text-gray-400 font-black text-[10px] uppercase tracking-widest transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={formLoading || uploading}
                                        className="px-16 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/40 transition-all flex items-center gap-3 active:scale-95"
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
