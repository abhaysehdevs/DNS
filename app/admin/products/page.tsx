'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit, Trash2, Search, X, Save, Image as ImageIcon, Loader2, Filter, AlertCircle, CheckCircle, Layers, GripHorizontal, Box } from 'lucide-react';
import { products as localProducts } from '@/lib/data'; // Import local data for fallback images

// Define types locally since they aren't exported from data.ts
interface ProductVariant {
    id: string;
    name: string;
    retailPrice?: number;
    wholesalePrice?: number;
    inStock?: boolean;
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
    quantity?: number;
    variants?: ProductVariant[];
    variant_type?: string;
    gallery?: { id: string; type: 'image' | 'video'; url: string; }[];
}

export default function ProductsAdminPage() {
    const [products, setProducts] = useState<ProductDB[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [stockFilter, setStockFilter] = useState('All');

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<ProductDB>>({});
    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // Variant Form State
    const [showVariantForm, setShowVariantForm] = useState(false);
    const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({ inStock: true });

    // Gallery Form State
    const [newGalleryItem, setNewGalleryItem] = useState<{ type: 'image' | 'video', url: string }>({ type: 'image', url: '' });

    useEffect(() => {
        fetchProducts();
    }, []);

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

    const handleEdit = (product: ProductDB) => {
        setCurrentProduct({ ...product, variants: product.variants || [], gallery: product.gallery || [] });
        setIsEditing(true);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setCurrentProduct({
            in_stock: true,
            category: 'Tools',
            wholesale_moq: 1,
            retail_price: 0,
            wholesale_price: 0,
            variants: [],
            gallery: [],
            variant_type: 'Size'
        });
        setIsEditing(false);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            alert('Error deleting product');
            console.error(error);
        } else {
            fetchProducts();
        }
    };

    const handleAddVariant = () => {
        if (!newVariant.name) return alert('Variant Name is required');

        const variant: ProductVariant = {
            id: Math.random().toString(36).substr(2, 9),
            name: newVariant.name,
            retailPrice: newVariant.retailPrice || currentProduct.retail_price,
            wholesalePrice: newVariant.wholesalePrice || currentProduct.wholesale_price,
            inStock: newVariant.inStock ?? true,
            image: newVariant.image
        };

        setCurrentProduct({
            ...currentProduct,
            variants: [...(currentProduct.variants || []), variant]
        });
        setNewVariant({ inStock: true }); // Reset
        setShowVariantForm(false);
    };

    const handleRemoveVariant = (variantId: string) => {
        setCurrentProduct({
            ...currentProduct,
            variants: currentProduct.variants?.filter(v => v.id !== variantId)
        });
    };

    const handleAddGalleryItem = () => {
        if (!newGalleryItem.url) return;

        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            type: newGalleryItem.type,
            url: newGalleryItem.url
        };

        setCurrentProduct({
            ...currentProduct,
            gallery: [...(currentProduct.gallery || []), newItem]
        });
        setNewGalleryItem({ ...newGalleryItem, url: '' }); // Keep type, reset URL
    };

    const handleRemoveGalleryItem = (id: string) => {
        setCurrentProduct({
            ...currentProduct,
            gallery: currentProduct.gallery?.filter(item => item.id !== id)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            // Prepare payload
            // const payload = {
            //     ...currentProduct,
            //     // Ensure variants and gallery are JSON compatible
            //     variants: currentProduct.variants || [],
            //     gallery: currentProduct.gallery || []
            // };

            // Full payload with all fields enabled
            const payload: any = {
                name: currentProduct.name,
                description: currentProduct.description,
                retail_price: currentProduct.retail_price,
                wholesale_price: currentProduct.wholesale_price,
                wholesale_moq: currentProduct.wholesale_moq,
                image: currentProduct.image,
                category: currentProduct.category,
                in_stock: currentProduct.in_stock,
                variants: currentProduct.variants || [],
                variant_type: currentProduct.variant_type,
                gallery: currentProduct.gallery || []
            };
            if (isEditing && currentProduct.id) {
                // Update
                const { error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', currentProduct.id);
                if (error) throw error;
            } else {
                // Insert
                const { id, ...newProduct } = payload as any;
                const { error } = await supabase
                    .from('products')
                    .insert([newProduct]);
                if (error) throw error;
            }

            setShowForm(false);
            fetchProducts();
        } catch (error: any) {
            console.error('Error saving:', error);
            alert(`Error saving product: ${error.message}`);
        } finally {
            setFormLoading(false);
        }
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

        let matchesStock = true;
        if (stockFilter === 'In Stock') matchesStock = p.in_stock;
        if (stockFilter === 'Out of Stock') matchesStock = !p.in_stock;

        return matchesSearch && matchesCategory && matchesStock;
    });

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    return (
        <div className="min-h-screen text-gray-100 p-4">

            {/* Toolbar */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 z-10 shadow-lg">
                <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <div className="relative min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-500"
                        />
                    </div>

                    <div className="relative min-w-[150px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-8 py-2 text-sm appearance-none outline-none cursor-pointer hover:bg-gray-750"
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={handleAddNew}
                        className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <Plus size={16} /> Add New
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Product Information</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Variants</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Retail Price</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Wholesale</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex justify-center items-center gap-2">
                                            <Loader2 className="animate-spin text-blue-500" size={24} />
                                            <span className="text-lg">Loading inventory...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-12 h-12 opacity-20" />
                                            <p className="text-lg font-medium">No products found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    // Fallback Image Logic
                                    const localMatch = localProducts.find(lp =>
                                        lp.id === product.id ||
                                        lp.name.toLowerCase() === product.name.toLowerCase()
                                    );
                                    const displayImage = product.image || localMatch?.primaryImage;

                                    return (
                                        <tr key={product.id} className="group hover:bg-gray-800/40 transition-colors">
                                            <td className="px-6 py-4 max-w-[300px]">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0 relative">
                                                        {displayImage ? (
                                                            <img src={displayImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={18} /></div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-white truncate pr-4" title={product.name}>{product.name}</div>
                                                        <div className="text-xs text-gray-500 truncate max-w-[200px]" title={product.description}>{product.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {product.variants && product.variants.length > 0 ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded bg-blue-900/30 text-blue-400 text-xs border border-blue-900/50">
                                                        <Layers size={12} className="mr-1" />
                                                        {product.variants.length} {product.variant_type || 'Variants'}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-white">
                                                ₹{product.retail_price.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-gray-300 font-medium">₹{product.wholesale_price.toLocaleString()}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-wide">MOQ: {product.wholesale_moq}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {product.in_stock ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-900/30">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-900/20 text-red-400 border border-red-900/30">
                                                        <AlertCircle size={10} />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(product)} className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                                <p className="text-sm text-gray-500">Fill in the details below.</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8">

                            {/* Main Grid: Basic Info + Pricing */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                        <Box size={14} /> Basic Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-400">Product Name *</label>
                                            <input
                                                required
                                                className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                                                value={currentProduct.name || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-400">Category *</label>
                                            <select
                                                className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                                                value={currentProduct.category || 'Tools'}
                                                onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                                            >
                                                <option value="Tools">Tools</option>
                                                <option value="Machinery">Machinery</option>
                                                <option value="Consumables">Consumables</option>
                                                <option value="Packaging">Packaging</option>
                                                <option value="Chemicals">Chemicals</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-400">Description</label>
                                            <textarea
                                                rows={3}
                                                className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none resize-none"
                                                value={currentProduct.description || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Pricing & Media</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-400">Retail Price (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                                                value={currentProduct.retail_price || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, retail_price: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-400">Wholesale (₹)</label>
                                            <input
                                                type="number"
                                                required
                                                className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                                                value={currentProduct.wholesale_price || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, wholesale_price: parseFloat(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-400">MOQ</label>
                                            <input
                                                type="number"
                                                required
                                                value={currentProduct.wholesale_moq || 1}
                                                onChange={e => setCurrentProduct({ ...currentProduct, wholesale_moq: parseInt(e.target.value) })}
                                                className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-gray-400">Status</label>
                                            <label className="flex items-center gap-2 cursor-pointer mt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={currentProduct.in_stock || false}
                                                    onChange={e => setCurrentProduct({ ...currentProduct, in_stock: e.target.checked })}
                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-gray-800 border-gray-600"
                                                />
                                                <span className="text-sm text-white">In Stock</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-gray-400">Main Image</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    setFormLoading(true);
                                                    try {
                                                        const fileExt = file.name.split('.').pop();
                                                        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                                                        const filePath = `${fileName}`;

                                                        const { error: uploadError } = await supabase.storage
                                                            .from('products')
                                                            .upload(filePath, file);

                                                        if (uploadError) throw uploadError;

                                                        const { data: { publicUrl } } = supabase.storage
                                                            .from('products')
                                                            .getPublicUrl(filePath);

                                                        setCurrentProduct({ ...currentProduct, image: publicUrl });
                                                    } catch (error: any) {
                                                        alert('Error uploading image: ' + error.message);
                                                    } finally {
                                                        setFormLoading(false);
                                                    }
                                                }}
                                                className="w-full bg-black border border-gray-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>
                                        {currentProduct.image && (
                                            <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700 group">
                                                <img src={currentProduct.image} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentProduct({ ...currentProduct, image: '' })}
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Gallery Management */}
                                    <div className="space-y-3 pt-4 border-t border-gray-800">
                                        <label className="text-xs font-medium text-gray-400 block">Media Gallery (Images & Videos) - <span className="text-yellow-500">Coming Soon (Pending DB Update)</span></label>

                                        <div className="flex gap-2">
                                            <select
                                                className="bg-black border border-gray-700 rounded-lg px-2 text-sm focus:border-blue-500 outline-none"
                                                value={newGalleryItem.type}
                                                onChange={e => setNewGalleryItem({ ...newGalleryItem, type: e.target.value as 'image' | 'video' })}
                                            >
                                                <option value="image">Image</option>
                                                <option value="video">Video</option>
                                            </select>
                                            <input
                                                className="flex-1 bg-black border border-gray-700 rounded-lg p-2 text-sm focus:border-blue-500 outline-none"
                                                placeholder="Media URL..."
                                                value={newGalleryItem.url}
                                                onChange={e => setNewGalleryItem({ ...newGalleryItem, url: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddGalleryItem}
                                                className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-lg border border-gray-700 transition-colors"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                            {currentProduct.gallery?.map((item, idx) => (
                                                <div key={item.id || idx} className="flex items-center justify-between bg-gray-800/50 p-2 rounded border border-gray-700">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.type === 'video' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'}`}>
                                                            {item.type}
                                                        </span>
                                                        <span className="text-xs text-gray-300 truncate max-w-[150px]" title={item.url}>{item.url}</span>
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveGalleryItem(item.id)} className="text-gray-500 hover:text-red-400">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!currentProduct.gallery || currentProduct.gallery.length === 0) && (
                                                <div className="text-center text-xs text-gray-600 py-2 italic">No media in gallery</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Variants Section */}
                            <div className="border-t border-gray-800 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                        <Layers size={14} /> Product Variants
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowVariantForm(!showVariantForm)}
                                        className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors border border-gray-700"
                                    >
                                        + Add Variant
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1/3">
                                            <label className="text-xs font-medium text-gray-400 block mb-1">Variant Type Label</label>
                                            <input
                                                placeholder="e.g. Size, Color, Pack"
                                                className="w-full bg-black border border-gray-700 rounded-lg p-2 text-sm focus:border-blue-500 outline-none placeholder-gray-600"
                                                value={currentProduct.variant_type || ''}
                                                onChange={e => setCurrentProduct({ ...currentProduct, variant_type: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Add Variant Form */}
                                    {showVariantForm && (
                                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 animate-in slide-in-from-top-2">
                                            <h4 className="text-xs font-bold text-gray-300 mb-3 uppercase">New Variant Details</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                                <input
                                                    placeholder="Option Name (e.g. Large)"
                                                    className="bg-black border border-gray-600 rounded px-2 py-1.5 text-sm"
                                                    value={newVariant.name || ''}
                                                    onChange={e => setNewVariant({ ...newVariant, name: e.target.value })}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder={`Retail ₹ (Default: ${currentProduct.retail_price})`}
                                                    className="bg-black border border-gray-600 rounded px-2 py-1.5 text-sm"
                                                    value={newVariant.retailPrice || ''}
                                                    onChange={e => setNewVariant({ ...newVariant, retailPrice: parseFloat(e.target.value) })}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder={`Wholesale ₹ (Default: ${currentProduct.wholesale_price})`}
                                                    className="bg-black border border-gray-600 rounded px-2 py-1.5 text-sm"
                                                    value={newVariant.wholesalePrice || ''}
                                                    onChange={e => setNewVariant({ ...newVariant, wholesalePrice: parseFloat(e.target.value) })}
                                                />
                                                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={newVariant.inStock}
                                                        onChange={e => setNewVariant({ ...newVariant, inStock: e.target.checked })}
                                                    /> In Stock
                                                </label>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={() => setShowVariantForm(false)} className="text-xs text-gray-400 hover:text-white px-3 py-1">Cancel</button>
                                                <button type="button" onClick={handleAddVariant} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Add Variant</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Variants List */}
                                    {currentProduct.variants && currentProduct.variants.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {currentProduct.variants.map((variant) => (
                                                <div key={variant.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex justify-between items-center group">
                                                    <div>
                                                        <div className="font-medium text-sm text-white">{variant.name}</div>
                                                        <div className="text-xs text-gray-400">
                                                            Retail: <span className="text-gray-300">₹{variant.retailPrice || currentProduct.retail_price}</span> •
                                                            Wholesale: <span className="text-gray-300">₹{variant.wholesalePrice || currentProduct.wholesale_price}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveVariant(variant.id)}
                                                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-gray-800/30 rounded-lg border border-dashed border-gray-700 text-gray-500 text-xs">
                                            No variants added yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-6 border-t border-gray-800 flex justify-end gap-3 sticky bottom-0 bg-gray-900 pb-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-2.5 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-900/20"
                                >
                                    {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    {isEditing ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
