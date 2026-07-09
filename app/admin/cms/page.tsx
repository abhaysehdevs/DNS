'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Layout, Plus, Image as ImageIcon, Save, Trash2, MoveUp, MoveDown, Loader2, Globe, Monitor, Smartphone, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertToWebP } from '@/lib/image-utils';

interface Banner {
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
    link: string;
    button_text: string;
    active: boolean;
    display_order: number;
    platform: 'all' | 'desktop' | 'mobile';
}
export default function CMSPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'banners' | 'announcements' | 'navigation'>('banners');
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [uploading, setUploading] = useState<string | null>(null);
    const [dbCategories, setDbCategories] = useState<any[]>([]);

    // Special pages configuration states
    const [navPages, setNavPages] = useState<any[]>([]);
    const [selectedPageKey, setSelectedPageKey] = useState<'new-arrivals' | 'offers'>('new-arrivals');
    const [pageTitle, setPageTitle] = useState('');
    const [pageSubtitle, setPageSubtitle] = useState('');
    const [pageProducts, setPageProducts] = useState<string[]>([]);
    const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        fetchBanners();
        fetchAnnouncements();
        fetchNavigationPages();
        fetchCatalogProducts();
        fetchCategories();
    }, []);

    // Fetch navigation pages logic
    const fetchNavigationPages = async () => {
        try {
            const { data } = await supabase.from('navigation_pages').select('*');
            if (data) {
                setNavPages(data);
                const selected = data.find(p => p.page_key === selectedPageKey);
                if (selected) {
                    setPageTitle(selected.title);
                    setPageSubtitle(selected.subtitle || '');
                    setPageProducts(selected.product_ids || []);
                }
            }
        } catch (e) {}
    };

    // Fetch catalog products
    const fetchCatalogProducts = async () => {
        try {
            const { data } = await supabase.from('products').select('id, name, category');
            if (data) setCatalogProducts(data);
        } catch (e) {}
    };

    // Save navigation configurations
    const handleSaveNavigationPage = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('navigation_pages')
                .upsert({
                    page_key: selectedPageKey,
                    title: pageTitle,
                    subtitle: pageSubtitle,
                    product_ids: pageProducts
                });
            if (error) throw error;
            alert('Navigation page configurations saved successfully!');
            fetchNavigationPages();
        } catch (err: any) {
            alert('Error saving navigation page: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Selected page key synchronizer
    useEffect(() => {
        const selected = navPages.find(p => p.page_key === selectedPageKey);
        if (selected) {
            setPageTitle(selected.title);
            setPageSubtitle(selected.subtitle || '');
            setPageProducts(selected.product_ids || []);
        } else {
            setPageTitle(selectedPageKey === 'new-arrivals' ? 'New Arrivals' : 'Special Offers');
            setPageSubtitle('');
            setPageProducts([]);
        }
    }, [selectedPageKey, navPages]);

    async function fetchCategories() {
        try {
            const { data } = await supabase.from('categories').select('*').order('name');
            if (data) setDbCategories(data);
        } catch (e) {}
    }

    async function fetchBanners() {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('homepage_banners').select('*').order('display_order');
            if (!error) setBanners(data || []);
        } catch (err) {} finally { setLoading(false); }
    }

    async function fetchAnnouncements() {
        try {
            const { data, error } = await supabase.from('announcements').select('*').order('display_order');
            if (!error) setAnnouncements(data || []);
        } catch (err) {}
    }

    async function fetchCollections() {
        try {
            const { data, error } = await supabase.from('featured_collections').select('*').order('display_order');
            if (!error) setCollections(data || []);
        } catch (err) {}
    }

    const handleSaveSection = async (table: string, data: any[]) => {
        setSaving(true);
        try {
            const cleanData = data.map(({ id, ...rest }) => id.toString().startsWith('temp-') ? rest : { id, ...rest });
            const { error } = await supabase.from(table).upsert(cleanData);
            if (error) throw error;
            alert(`${table} updated successfully!`);
            if (table === 'homepage_banners') fetchBanners();
            if (table === 'announcements') fetchAnnouncements();
            if (table === 'featured_collections') fetchCollections();
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAddBanner = () => {
        const newBanner: Banner = {
            id: `temp-${Date.now()}`,
            title: 'New Slide Title',
            subtitle: 'Click to edit details',
            image_url: '',
            link: '/',
            button_text: 'Explore Now',
            active: true,
            display_order: banners.length,
            platform: 'all'
        };
        setBanners([...banners, newBanner]);
    };

    const handleUpdateBanner = (id: string, updates: Partial<Banner>) => {
        setBanners(banners.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const handleDeleteBanner = (id: string) => {
        setBanners(banners.filter(b => b.id !== id));
    };

    const handleUploadImage = async (id: string, file: File) => {
        setUploading(id);
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
            const fileName = `${id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `banners/${fileName}`;

            const { error } = await supabase.storage
                .from('products')
                .upload(filePath, fileToUpload);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            setBanners(prev => prev.map(b => b.id === id ? { ...b, image_url: publicUrl } : b));
            alert('Image uploaded successfully!');
        } catch (err: any) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(null);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-8 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Layout className="text-purple-500" /> Storefront CMS <span className="text-[10px] bg-purple-600 px-2 py-0.5 rounded uppercase ml-2 tracking-widest">Enterprise</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Global cloud-synced marketing and layout management engine.</p>
                </div>
                <button 
                    onClick={() => {
                        if (activeTab === 'banners') handleSaveSection('homepage_banners', banners);
                        if (activeTab === 'announcements') handleSaveSection('announcements', announcements);
                        if (activeTab === 'navigation') handleSaveNavigationPage();
                    }}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-blue-900/40 transition-all disabled:opacity-50 active:scale-95"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Publish {activeTab === 'navigation' ? 'Page Config' : activeTab}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex p-1.5 bg-gray-900 border border-gray-800 rounded-3xl w-fit">
                {[
                    { id: 'banners', label: 'Hero Banners', icon: Monitor },
                    { id: 'announcements', label: 'Ticker Bar', icon: Smartphone },
                    { id: 'navigation', label: 'Arrivals & Offers', icon: Globe }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Areas */}
            <div className="mt-8">
                {activeTab === 'banners' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
                            <div>
                                <h3 className="text-lg font-black text-white">Main Slide Deck</h3>
                                <p className="text-gray-500 text-xs mt-1">High-impact visual stories for the homepage hero section.</p>
                            </div>
                            <button onClick={handleAddBanner} className="bg-gray-800 hover:bg-white hover:text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                + New Slide
                            </button>
                        </div>
                        <div className="space-y-6">
                            {banners.map((banner, index) => (
                                <motion.div layout key={banner.id} className="bg-gray-900 border border-gray-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="lg:w-1/3 bg-black min-h-[250px] relative group">
                                            {banner.image_url ? (
                                                <img src={banner.image_url} className="w-full h-full object-cover opacity-80" alt="Preview" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-800 gap-2 border-2 border-dashed border-gray-900 m-4 rounded-2xl">
                                                    <ImageIcon size={48} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center p-6">
                                                <div className="w-full space-y-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-blue-500 uppercase">CDN Asset URL</label>
                                                        <input 
                                                            type="text" 
                                                            value={banner.image_url}
                                                            onChange={(e) => handleUpdateBanner(banner.id, { image_url: e.target.value })}
                                                            className="w-full bg-black border border-gray-700 rounded-xl p-2 text-xs text-white outline-none focus:border-blue-500"
                                                            placeholder="Paste image link..."
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-blue-500 uppercase block">Or Upload Image</label>
                                                        <input 
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) handleUploadImage(banner.id, file);
                                                            }}
                                                            disabled={uploading === banner.id}
                                                            className="w-full bg-black border border-gray-700 rounded-xl p-1.5 text-[10px] text-white file:bg-gray-800 file:text-white file:border-0 file:px-1.5 file:py-0.5 file:rounded file:mr-1 file:cursor-pointer hover:file:bg-gray-700"
                                                        />
                                                        {uploading === banner.id && (
                                                            <span className="text-[8px] text-blue-400 font-bold block animate-pulse">Uploading...</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="lg:w-2/3 p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Main Headline</label>
                                                <input value={banner.title} onChange={e => handleUpdateBanner(banner.id, { title: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm text-white font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Supporting Text</label>
                                                <input value={banner.subtitle} onChange={e => handleUpdateBanner(banner.id, { subtitle: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Action Link</label>
                                                <input value={banner.link} onChange={e => handleUpdateBanner(banner.id, { link: e.target.value })} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-sm text-white font-mono" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Platform</label>
                                                    <select value={banner.platform} onChange={e => handleUpdateBanner(banner.id, { platform: e.target.value as any })} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-xs text-white appearance-none">
                                                        <option value="all">Universal</option>
                                                        <option value="desktop">Desktop Pro</option>
                                                        <option value="mobile">Mobile Optimized</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Order</label>
                                                    <input type="number" value={banner.display_order} onChange={e => handleUpdateBanner(banner.id, { display_order: parseInt(e.target.value) })} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-xs text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-10 py-6 bg-black/50 border-t border-gray-800 flex justify-between items-center">
                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-3">
                                                <div onClick={() => handleUpdateBanner(banner.id, { active: !banner.active })} className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${banner.active ? 'bg-green-600' : 'bg-gray-800'}`}>
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${banner.active ? 'left-7' : 'left-1'}`} />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-500 uppercase">{banner.active ? 'Visible' : 'Draft'}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteBanner(banner.id)} className="p-3 bg-red-900/10 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all"><Trash2 size={18}/></button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="space-y-8">
                        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-10">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Global Ticker Management</h3>
                                    <p className="text-gray-500 text-xs mt-1">System-wide broadcast messages for top navigation.</p>
                                </div>
                                <button onClick={() => setAnnouncements([...announcements, { id: `temp-${Date.now()}`, message: 'New Flash Message', background_color: '#3b82f6', text_color: '#ffffff', active: true, display_order: announcements.length }])} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
                                    + Add Flash
                                </button>
                            </div>
                            <div className="space-y-4">
                                {announcements.map((ann, idx) => (
                                    <div key={ann.id} className="bg-black border border-gray-800 p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-black text-gray-600 uppercase">Flash Content</label>
                                            <input value={ann.message} onChange={e => setAnnouncements(announcements.map(a => a.id === ann.id ? {...a, message: e.target.value} : a))} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-600 uppercase text-center block">BG</label>
                                                <input type="color" value={ann.background_color} onChange={e => setAnnouncements(announcements.map(a => a.id === ann.id ? {...a, background_color: e.target.value} : a))} className="w-10 h-10 rounded-full border-none cursor-pointer bg-transparent" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-600 uppercase text-center block">Text</label>
                                                <input type="color" value={ann.text_color} onChange={e => setAnnouncements(announcements.map(a => a.id === ann.id ? {...a, text_color: e.target.value} : a))} className="w-10 h-10 rounded-full border-none cursor-pointer bg-transparent" />
                                            </div>
                                        </div>
                                        <button onClick={() => setAnnouncements(announcements.filter(a => a.id !== ann.id))} className="p-3 text-red-500 hover:bg-red-900/10 rounded-xl transition-all"><Trash2 size={18}/></button>
                                    </div>
                                ))}
                                {announcements.length === 0 && <div className="py-20 text-center border-2 border-dashed border-gray-800 rounded-3xl text-gray-600 font-bold uppercase text-[10px]">No active ticker messages.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'navigation' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-gray-800 pb-6">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Dynamic Catalog Pages</h3>
                                    <p className="text-gray-500 text-xs mt-1 font-medium">Configure headers, page pitch, and select specific products for specialized routes.</p>
                                </div>
                                <div className="flex bg-black border border-gray-800 p-1 rounded-xl shrink-0">
                                    <button 
                                        onClick={() => setSelectedPageKey('new-arrivals')}
                                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${selectedPageKey === 'new-arrivals' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/25' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        New Arrivals
                                    </button>
                                    <button 
                                        onClick={() => setSelectedPageKey('offers')}
                                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${selectedPageKey === 'offers' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/25' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        Special Offers
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Page configuration settings */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Page Main Title</label>
                                        <input 
                                            type="text" 
                                            value={pageTitle}
                                            onChange={e => setPageTitle(e.target.value)}
                                            className="w-full bg-black border border-gray-800 focus:border-blue-500 outline-none rounded-xl p-3 text-xs font-bold text-white transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Page Subtitle / Pitch</label>
                                        <textarea 
                                            rows={4}
                                            value={pageSubtitle}
                                            onChange={e => setPageSubtitle(e.target.value)}
                                            className="w-full bg-black border border-gray-800 focus:border-blue-500 outline-none rounded-xl p-3 text-xs font-semibold text-white transition-colors leading-relaxed"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-xs font-bold">
                                        <span className="text-[10px] font-black text-gray-500 uppercase">Selected Products:</span>
                                        <span className="font-mono bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded font-black">{pageProducts.length} items</span>
                                    </div>
                                </div>

                                {/* Catalog products search & select */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="flex gap-3">
                                        <input 
                                            type="text"
                                            placeholder="FILTER CATALOG BY NAME OR CATEGORY..."
                                            value={productSearch}
                                            onChange={e => setProductSearch(e.target.value)}
                                            className="w-full bg-black border border-gray-800 focus:border-blue-500 outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-white transition-colors placeholder-[#5A5A6A]"
                                        />
                                    </div>

                                    <div className="border border-gray-800 rounded-2xl overflow-hidden bg-black/50 h-[300px] overflow-y-auto divide-y divide-gray-900 custom-scrollbar">
                                        {catalogProducts
                                            .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase()))
                                            .map(p => {
                                                const isChecked = pageProducts.includes(p.id);
                                                return (
                                                    <div 
                                                        key={p.id} 
                                                        onClick={() => {
                                                            if (isChecked) {
                                                                setPageProducts(pageProducts.filter(id => id !== p.id));
                                                            } else {
                                                                setPageProducts([...pageProducts, p.id]);
                                                            }
                                                        }}
                                                        className={`p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-900/50 transition-colors ${isChecked ? 'bg-blue-600/5' : ''}`}
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold text-white uppercase tracking-wider">{p.name}</p>
                                                            <span className="text-[8px] bg-gray-900 text-gray-500 border border-gray-800 px-2 py-0.5 rounded uppercase font-black mt-1 inline-block">{p.category}</span>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-blue-600 border-blue-500 text-white' : 'border-gray-800 bg-gray-900'}`}>
                                                            {isChecked && <Plus size={10} strokeWidth={3} />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        {catalogProducts.length === 0 && (
                                            <div className="py-20 text-center text-text-tertiary italic text-xs font-bold uppercase">No products available in database.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-12 p-10 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-[3rem] relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                    <Zap size={200} className="text-blue-500 translate-x-20 -translate-y-10" />
                </div>
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <h4 className="text-blue-400 text-xl font-black uppercase tracking-widest flex items-center gap-3"><Zap fill="currentColor"/> Master CMS Engine</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Your storefront changes are synchronized globally via the Dinanath Cloud Engine. Changes take effect immediately across all client devices. Use the <strong>"Target Platform"</strong> setting to optimize visual assets for mobile-specific aspect ratios.
                    </p>
                </div>
            </div>
        </div>
    );
}
