'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Plus, Edit, Trash2, Search, X, Save, Image as ImageIcon, Loader2, 
    Filter, AlertCircle, CheckCircle, XCircle, Layers, Box, ChevronDown, 
    CheckSquare, Square, MoreHorizontal, Download, Upload, Video, 
    Settings, Info, Zap, Scale, Ruler, ShieldCheck, Tag, Link as LinkIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'media' | 'variants'>('basic');

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

    // --- Media Handlers ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image' | 'gallery' | 'video') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `product-media/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            if (target === 'image') {
                setCurrentProduct(prev => ({ ...prev, image: publicUrl }));
            } else if (target === 'video') {
                setCurrentProduct(prev => ({ ...prev, video_url: publicUrl }));
            } else if (target === 'gallery') {
                const newItem = { id: Date.now().toString(), type: file.type.startsWith('video') ? 'video' : 'image' as any, url: publicUrl };
                setCurrentProduct(prev => ({ ...prev, gallery: [...(prev.gallery || []), newItem] }));
            }
        } catch (error: any) {
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
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
            const payload = {
                ...currentProduct,
                // Ensure array fields are initialized
                features: currentProduct.features || [],
                specifications: currentProduct.specifications || {},
                variants: currentProduct.variants || [],
                gallery: currentProduct.gallery || []
            };

            if (isEditing && currentProduct.id) {
                const { error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', currentProduct.id);
                if (error) throw error;
            } else {
                const { id, ...newProduct } = payload as any;
                const { error } = await supabase
                    .from('products')
                    .insert([newProduct]);
                if (error) throw error;
            }

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

    const handleEdit = (p: ProductDB) => {
        setCurrentProduct({ 
            ...p, 
            features: p.features || [], 
            specifications: p.specifications || {},
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

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                            <tr>
                                <th className="px-8 py-6">Product Information</th>
                                <th className="px-8 py-6">Inventory Status</th>
                                <th className="px-8 py-6 text-right">Retail Price</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {loading ? (
                                <tr><td colSpan={4} className="py-32 text-center"><Loader2 className="animate-spin text-blue-500 mx-auto" size={48} /></td></tr>
                            ) : filteredProducts.map(p => (
                                <tr key={p.id} className="group hover:bg-blue-900/5 transition-colors">
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
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <button 
                                                    onClick={() => {
                                                        const { id, sku, ...clone } = p;
                                                        setCurrentProduct({ ...clone, name: `${clone.name} (Copy)`, sku: '' });
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
                                    { id: 'variants', label: 'Manage Variants', icon: Layers }
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
                                                    <div className="h-px bg-gray-800" />
                                                    <div className="p-4 bg-blue-900/10 border border-blue-900/20 rounded-2xl flex items-start gap-4">
                                                        <ShieldCheck className="text-blue-500 shrink-0" size={24} />
                                                        <div>
                                                            <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">Wholesale Configuration</p>
                                                            <p className="text-gray-400 text-[10px] leading-relaxed mb-4">Wholesale prices are HIDDEN by default. Customers requesting bulk quotations will be automatically routed to your professional WhatsApp channel.</p>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-[9px] font-black text-gray-500 uppercase">Wholesale Price (₹)</label>
                                                                    <input 
                                                                        type="number"
                                                                        value={currentProduct.wholesale_price || 0}
                                                                        onChange={e => setCurrentProduct({...currentProduct, wholesale_price: parseFloat(e.target.value)})}
                                                                        className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white font-bold"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[9px] font-black text-gray-500 uppercase">Min. Order Qty</label>
                                                                    <input 
                                                                        type="number"
                                                                        value={currentProduct.wholesale_moq || 1}
                                                                        onChange={e => setCurrentProduct({...currentProduct, wholesale_moq: parseInt(e.target.value)})}
                                                                        className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs text-white font-bold"
                                                                    />
                                                                </div>
                                                            </div>
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

                                {/* --- Tab Content: Media (Upload & Video) --- */}
                                {activeTab === 'media' && (
                                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            {/* Primary Media */}
                                            <div className="space-y-6">
                                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Master Asset</h3>
                                                <div className="relative aspect-square bg-black border-2 border-dashed border-gray-800 rounded-[3rem] overflow-hidden flex flex-col items-center justify-center group hover:border-blue-500 transition-all">
                                                    {currentProduct.image ? (
                                                        <>
                                                            <img src={currentProduct.image} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                                                <button type="button" onClick={() => setCurrentProduct({...currentProduct, image: ''})} className="bg-red-600 text-white p-4 rounded-full"><Trash2 size={24}/></button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-center p-8">
                                                            <Upload size={48} className="text-gray-700 mx-auto mb-4" />
                                                            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Drag or Click to Upload Master Image</p>
                                                            <input type="file" onChange={e => handleFileUpload(e, 'image')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                                        </div>
                                                    )}
                                                    {uploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={48}/></div>}
                                                </div>
                                            </div>

                                            {/* Video Asset */}
                                            <div className="space-y-6">
                                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Video Experience</h3>
                                                <div className="relative aspect-video bg-black border-2 border-dashed border-gray-800 rounded-[3rem] overflow-hidden flex flex-col items-center justify-center group hover:border-purple-500 transition-all">
                                                    {currentProduct.video_url ? (
                                                        <>
                                                            <video src={currentProduct.video_url} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                                <button type="button" onClick={() => setCurrentProduct({...currentProduct, video_url: ''})} className="bg-red-600 text-white p-4 rounded-full"><Trash2 size={24}/></button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-center p-8">
                                                            <Video size={48} className="text-gray-700 mx-auto mb-4" />
                                                            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Upload Product Demonstration Video</p>
                                                            <input type="file" onChange={e => handleFileUpload(e, 'video')} className="absolute inset-0 opacity-0 cursor-pointer" accept="video/*" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-600 uppercase">Or External Video URL (YouTube/Vimeo)</label>
                                                    <input value={currentProduct.video_url || ''} onChange={e => setCurrentProduct({...currentProduct, video_url: e.target.value})} className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-xs text-white" placeholder="https://youtube.com/..." />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Gallery */}
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Media Gallery</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                                {currentProduct.gallery?.map(item => (
                                                    <div key={item.id} className="relative aspect-square bg-black border border-gray-800 rounded-3xl overflow-hidden group">
                                                        <img src={item.url} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => setCurrentProduct({...currentProduct, gallery: currentProduct.gallery?.filter(g => g.id !== item.id)})} className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"><X size={12}/></button>
                                                    </div>
                                                ))}
                                                <div className="relative aspect-square border-2 border-dashed border-gray-800 rounded-3xl flex items-center justify-center hover:border-blue-500 transition-all cursor-pointer">
                                                    <Plus className="text-gray-700" size={32} />
                                                    <input type="file" multiple onChange={e => handleFileUpload(e, 'gallery')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,video/*" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- Tab Content: Variants (RE-ENABLED & FIXED) --- */}
                                {activeTab === 'variants' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-xl font-black text-white">Variant Architecture</h3>
                                                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Define SKU-level options (Size, Color, Material)</p>
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
                                                    placeholder="e.g. Size or Material"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {currentProduct.variants?.map(v => (
                                                    <div key={v.id} className="bg-black border border-gray-800 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-700 uppercase">Variant Name</label>
                                                            <input value={v.name} onChange={e => updateVariant(v.id, {name: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white" placeholder="e.g. XL or Stainless" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-gray-700 uppercase">Specific Price (₹)</label>
                                                            <input type="number" value={v.price} onChange={e => updateVariant(v.id, {price: parseFloat(e.target.value)})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white font-bold" />
                                                        </div>
                                                        <div className="flex items-center gap-4 pt-6">
                                                            <div 
                                                                onClick={() => updateVariant(v.id, {inStock: !v.inStock})}
                                                                className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${v.inStock ? 'bg-green-600' : 'bg-gray-800'}`}
                                                            >
                                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${v.inStock ? 'left-7' : 'left-1'}`} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-gray-500 uppercase">{v.inStock ? 'Available' : 'Out of Stock'}</span>
                                                        </div>
                                                        <div className="text-right pt-6">
                                                            <button type="button" onClick={() => removeVariant(v.id)} className="p-3 bg-red-900/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all"><Trash2 size={16}/></button>
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
