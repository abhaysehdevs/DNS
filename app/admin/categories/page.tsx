'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Edit2, Trash2, X, Save, Grid, Image as ImageIcon, Loader2, AlertCircle, Upload, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertToWebP } from '@/lib/image-utils';

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    image_url: string;
    display_order: number;
    is_featured: boolean;
    product_count?: number;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_url: '',
        display_order: 0,
        is_featured: false
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        setLoading(true);
        try {
            // Fetch categories with product counts from our custom view
            const { data, error } = await supabase
                .from('category_stats')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                // Fallback to basic categories table if view fails
                const { data: basicData, error: basicError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('display_order', { ascending: true });
                
                if (!basicError) setCategories(basicData || []);
            } else {
                setCategories(data || []);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
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
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `category-images/${fileName}`;

            // Try to upload. Note: Ensure the bucket 'categories' is public and has proper policies.
            const { error: uploadError } = await supabase.storage
                .from('categories')
                .upload(filePath, fileToUpload);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('categories')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image_url: publicUrl }));
        } catch (error: any) {
            alert('Upload failed: ' + error.message + '\nTip: Go to Supabase > Storage > Create bucket named "categories" and set it to Public.');
        } finally {
            setUploading(false);
        }
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description,
                image_url: category.image_url,
                display_order: category.display_order,
                is_featured: category.is_featured
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                image_url: '',
                display_order: categories.length,
                is_featured: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        
        const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const payload = { ...formData, slug };

        try {
            if (editingCategory) {
                const { error } = await supabase
                    .from('categories')
                    .upsert({ id: editingCategory.id, ...payload });
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([payload]);
                if (error) throw error;
            }
            
            setIsModalOpen(false);
            fetchCategories();
        } catch (err: any) {
            alert('Error saving category: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? This will NOT delete products, but they will become uncategorized.')) return;

        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            fetchCategories();
        } catch (err: any) {
            alert('Error deleting: ' + err.message);
        }
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-10 pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#E8E2D5] pb-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-[#18181B] flex items-center gap-3 tracking-tight">
                        <Grid className="text-[#966E2E]" size={36} /> Category Management
                    </h1>
                    <p className="text-[#71717A] text-sm font-medium">Global master taxonomy management with direct cloud-media integration.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-[#966E2E] hover:bg-[#7D5A25] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                    <Plus size={18} /> Create New Category
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E8E2D5] p-5 rounded-2xl shadow-sm">
                    <div className="text-[#71717A] text-[10px] font-bold uppercase tracking-wider mb-1">Total Categories</div>
                    <div className="text-3xl font-black text-[#18181B]">{categories.length}</div>
                </div>
                <div className="bg-white border border-[#E8E2D5] p-5 rounded-2xl shadow-sm">
                    <div className="text-[#71717A] text-[10px] font-bold uppercase tracking-wider mb-1">Featured Tags</div>
                    <div className="text-3xl font-black text-[#966E2E]">{categories.filter(c => c.is_featured).length}</div>
                </div>
                <div className="bg-white border border-[#E8E2D5] p-5 rounded-2xl shadow-sm">
                    <div className="text-[#71717A] text-[10px] font-bold uppercase tracking-wider mb-1">Active SKUs</div>
                    <div className="text-3xl font-black text-blue-600">{categories.reduce((acc, c) => acc + (c.product_count || 0), 0)}</div>
                </div>
                <div className="bg-white border border-[#E8E2D5] p-5 rounded-2xl shadow-sm">
                    <div className="text-[#71717A] text-[10px] font-bold uppercase tracking-wider mb-1">Sync Status</div>
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mt-2 uppercase">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Cloud Sync Active
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#71717A] group-focus-within:text-[#966E2E] transition-colors" size={20} />
                <input 
                    type="text"
                    placeholder="Search master taxonomy..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-[#E8E2D5] rounded-2xl pl-14 pr-6 py-4 text-[#18181B] placeholder-[#A1A1AA] focus:border-[#966E2E] outline-none transition-all shadow-sm font-medium text-sm"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-[#966E2E]" size={48} />
                    <p className="text-[#71717A] font-bold text-xs uppercase tracking-wider">Synchronizing Master Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCategories.map((category) => (
                        <motion.div 
                            layout
                            key={category.id}
                            className="bg-white border border-[#E8E2D5] rounded-2xl overflow-hidden shadow-sm group hover:border-[#966E2E] transition-all flex flex-col"
                        >
                            <div className="h-52 bg-[#FAF9F5] relative overflow-hidden">
                                {category.image_url ? (
                                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#A1A1AA]">
                                        <ImageIcon size={64} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button 
                                        onClick={() => handleOpenModal(category)}
                                        className="p-2.5 bg-white text-[#18181B] border border-[#E8E2D5] rounded-xl hover:bg-[#966E2E] hover:text-white transition-all shadow-sm cursor-pointer"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2.5 bg-white text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                    {category.is_featured && (
                                        <span className="bg-[#966E2E] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm">Featured</span>
                                    )}
                                    <span className="bg-[#18181B] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                                        <Package size={12} /> {category.product_count || 0} SKUs
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-[#18181B] mb-2 group-hover:text-[#966E2E] transition-colors">{category.name}</h3>
                                <p className="text-[#52525B] text-sm font-medium line-clamp-2 mb-4 flex-1">{category.description || 'Category for dinanath & sons premium collection.'}</p>
                                <div className="pt-4 border-t border-[#E8E2D5] flex justify-between items-center text-[10px] font-mono">
                                    <span className="text-[#966E2E] font-bold">/{category.slug}</span>
                                    <span className="text-[#71717A]">Priority {category.display_order}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filteredCategories.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-[#FAF9F5] border border-dashed border-[#E8E2D5] rounded-2xl">
                            <Grid className="mx-auto text-[#A1A1AA] mb-4" size={48} />
                            <p className="text-[#71717A] font-medium text-sm">No active taxonomy found matching search.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white border border-[#E8E2D5] rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-[#E8E2D5] flex justify-between items-center bg-[#FAF9F5]">
                                <div>
                                    <h2 className="text-xl font-bold text-[#18181B]">{editingCategory ? 'Update Category' : 'Create Category'}</h2>
                                    <p className="text-xs text-[#71717A] mt-0.5">Category taxonomy details</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-[#71717A] hover:text-[#18181B] rounded-xl hover:bg-[#E8E2D5]/50 transition-all cursor-pointer">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left: General Info */}
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#52525B] uppercase tracking-wider">Category Name</label>
                                            <input 
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-sm text-[#18181B] focus:border-[#966E2E] outline-none transition-all"
                                                placeholder="e.g. Diamond Machinery"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#52525B] uppercase tracking-wider">Description</label>
                                            <textarea 
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-sm text-[#18181B] focus:border-[#966E2E] outline-none transition-all min-h-[140px] resize-none"
                                                placeholder="Detail the category..."
                                            />
                                        </div>
                                    </div>

                                    {/* Right: Media & Metadata */}
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-[#52525B] uppercase tracking-wider">Category Image</label>
                                            <div className="relative group aspect-video bg-[#FAF9F5] rounded-xl border-2 border-dashed border-[#E8E2D5] overflow-hidden flex flex-col items-center justify-center transition-all hover:border-[#966E2E]">
                                                {formData.image_url ? (
                                                    <>
                                                        <img src={formData.image_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button 
                                                                type="button"
                                                                onClick={() => setFormData({...formData, image_url: ''})}
                                                                className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                                            >Discard Image</button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2">
                                                        {uploading ? <Loader2 className="animate-spin text-[#966E2E]" size={28} /> : <ImageIcon className="text-[#A1A1AA]" size={32} />}
                                                        <label className="bg-white border border-[#E8E2D5] hover:bg-[#FAF9F5] text-[#18181B] px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-2xs">
                                                            {uploading ? 'Processing...' : 'Upload Image'}
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-[#52525B] uppercase tracking-wider">Display Order</label>
                                                <input 
                                                    type="number"
                                                    value={formData.display_order}
                                                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-sm text-[#18181B] font-mono focus:border-[#966E2E] outline-none transition-all"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4 bg-[#FAF9F5] p-3 rounded-xl border border-[#E8E2D5]">
                                                <div 
                                                    onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}
                                                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all ${formData.is_featured ? 'bg-[#966E2E]' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${formData.is_featured ? 'left-6.5' : 'left-0.5'}`} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-[#18181B] block">Featured Category</label>
                                                    <p className="text-[10px] text-[#71717A]">Show on storefront home page</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-[#E8E2D5] flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-white border border-[#E8E2D5] hover:bg-[#FAF9F5] text-[#52525B] font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={saving || uploading}
                                        className="flex-[2] bg-[#966E2E] hover:bg-[#7D5A25] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        {editingCategory ? 'Save Changes' : 'Create Category'}
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
