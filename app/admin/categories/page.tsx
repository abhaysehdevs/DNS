'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Search, Edit2, Trash2, X, Save, Grid, Image as ImageIcon, Loader2, AlertCircle, Upload, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `category-images/${fileName}`;

            // Try to upload. Note: Ensure the bucket 'categories' is public and has proper policies.
            const { error: uploadError } = await supabase.storage
                .from('categories')
                .upload(filePath, file);

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-800 pb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter uppercase">
                        <Grid className="text-blue-500" size={40} /> Category Engine <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded uppercase ml-2 tracking-widest font-black">Enterprise Sync</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Global master taxonomy management with direct cloud-media integration.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-blue-900/40 transition-all active:scale-95"
                >
                    <Plus size={20} /> Create New Category
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Taxonomy</div>
                    <div className="text-3xl font-black text-white">{categories.length}</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Featured Tags</div>
                    <div className="text-3xl font-black text-amber-500">{categories.filter(c => c.is_featured).length}</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Active SKUs</div>
                    <div className="text-3xl font-black text-blue-500">{categories.reduce((acc, c) => acc + (c.product_count || 0), 0)}</div>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Sync Status</div>
                    <div className="flex items-center gap-2 text-green-500 font-black text-xs mt-2 uppercase">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Cloud Sync Active
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={24} />
                <input 
                    type="text"
                    placeholder="Search master taxonomy..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-[2rem] pl-16 pr-6 py-6 text-white focus:border-blue-500 outline-none transition-all shadow-xl font-medium"
                />
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={64} />
                    <p className="text-gray-500 font-black text-[10px] uppercase tracking-[0.2em]">Synchronizing Master Data...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCategories.map((category) => (
                        <motion.div 
                            layout
                            key={category.id}
                            className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl group hover:border-blue-500/30 transition-all flex flex-col"
                        >
                            <div className="h-56 bg-black relative overflow-hidden">
                                {category.image_url ? (
                                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-800">
                                        <ImageIcon size={80} />
                                    </div>
                                )}
                                <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    <button 
                                        onClick={() => handleOpenModal(category)}
                                        className="p-3 bg-white text-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(category.id)}
                                        className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all shadow-xl"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <div className="absolute bottom-6 left-6 flex items-center gap-2">
                                    {category.is_featured && (
                                        <span className="bg-amber-500 text-black text-[9px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">Featured</span>
                                    )}
                                    <span className="bg-blue-600 text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                        <Package size={12} /> {category.product_count || 0} SKUs Linked
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-black text-white mb-3 group-hover:text-blue-400 transition-colors uppercase">{category.name}</h3>
                                <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6 flex-1">{category.description || 'Professional-grade classification for high-precision jewelry instrumentation.'}</p>
                                <div className="pt-6 border-t border-gray-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-blue-500">/{category.slug}</span>
                                    <span className="text-gray-600">Priority {category.display_order}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filteredCategories.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-gray-900/20 border-2 border-dashed border-gray-800 rounded-[3rem]">
                            <Grid className="mx-auto text-gray-800 mb-6" size={80} />
                            <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No active taxonomy found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]"
                        >
                            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800">
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{editingCategory ? 'Update Taxonomy' : 'Initialize Category'}</h2>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Industrial Classification Protocol</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-black/40 hover:bg-black text-gray-500 hover:text-white rounded-2xl flex items-center justify-center transition-all border border-gray-800">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left: General Info */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Master Label</label>
                                            <input 
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-sm text-white font-bold focus:border-blue-500 outline-none transition-all"
                                                placeholder="e.g. Casting Machinery"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Industry Scope (Description)</label>
                                            <textarea 
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-sm text-white focus:border-blue-500 outline-none transition-all min-h-[150px] resize-none"
                                                placeholder="Detail the industrial utility..."
                                            />
                                        </div>
                                    </div>

                                    {/* Right: Media & Metadata */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category Media</label>
                                            <div className="relative group aspect-video bg-black rounded-2xl border-2 border-dashed border-gray-800 overflow-hidden flex flex-col items-center justify-center transition-all hover:border-blue-500/50">
                                                {formData.image_url ? (
                                                    <>
                                                        <img src={formData.image_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button 
                                                                type="button"
                                                                onClick={() => setFormData({...formData, image_url: ''})}
                                                                className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                                                            >Discard Asset</button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3">
                                                        {uploading ? <Loader2 className="animate-spin text-blue-500" size={32} /> : <ImageIcon className="text-gray-700" size={40} />}
                                                        <label className="bg-gray-800 hover:bg-white hover:text-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all">
                                                            {uploading ? 'Processing...' : 'Direct Upload'}
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                                        </label>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sequence Priority</label>
                                                <input 
                                                    type="number"
                                                    value={formData.display_order}
                                                    onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                                                    className="w-full bg-black border border-gray-800 rounded-2xl p-4 text-sm text-white font-mono focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-gray-800">
                                                <div 
                                                    onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}
                                                    className={`w-14 h-7 rounded-full relative cursor-pointer transition-all ${formData.is_featured ? 'bg-amber-600' : 'bg-gray-800'}`}
                                                >
                                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${formData.is_featured ? 'left-8' : 'left-1'}`} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-white uppercase tracking-widest block">Spotlight Status</label>
                                                    <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Showcase on primary dashboard</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 bg-gray-800 hover:bg-white hover:text-black text-white font-black text-[10px] uppercase tracking-widest py-5 rounded-[1.5rem] transition-all"
                                    >
                                        Cancel Protocol
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={saving || uploading}
                                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest py-5 rounded-[1.5rem] shadow-2xl shadow-blue-900/40 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        {editingCategory ? 'Commit Updates' : 'Deploy Taxonomy'}
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
