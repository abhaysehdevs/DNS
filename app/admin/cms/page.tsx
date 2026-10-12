'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Layout, Plus, Image as ImageIcon, Save, Trash2, MoveUp, MoveDown, Loader2, Globe, Monitor, Smartphone, AlertCircle, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertToWebP } from '@/lib/image-utils';
import { MarketingPopupManager } from '@/components/admin/marketing-popup-manager';

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
    eyebrow?: string;
    secondary_button_text?: string;
    secondary_link?: string;
    whatsapp_number?: string;
    whatsapp_message?: string;
    fallback_image_desktop?: string;
    fallback_image_mobile?: string;
    featured_product_ids?: string[];
    start_date?: string;
    end_date?: string;
}
export default function CMSPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'banners' | 'announcements' | 'navigation' | 'popup'>('banners');
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

    const resetBannerToDefault = (id: string) => {
        handleUpdateBanner(id, {
            eyebrow: 'Since 1960 · Chandni Chowk, New Delhi',
            title: 'Jewellery Tools, Machines & Packaging for Goldsmiths and Manufacturers',
            subtitle: 'Pliers, tweezers, polishing machines, torches, ring tools and packaging, supplied to jewellers and workshops across India.',
            button_text: 'Shop the catalog',
            link: '/shop',
            secondary_button_text: 'Get a bulk quote',
            secondary_link: '/contact?subject=Bulk+Quote',
            whatsapp_number: '919953435647',
            whatsapp_message: 'Hello Dinanath & Sons, I would like to inquire about bulk jewellery tools & machinery.',
            platform: 'all'
        });
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#E8E2D5] pb-6">
                <div>
                    <h1 className="text-3xl font-black text-[#18181B] flex items-center gap-3">
                        <Layout className="text-[#966E2E]" /> Storefront CMS <span className="text-[10px] bg-amber-50 text-[#966E2E] border border-amber-200 px-2 py-0.5 rounded uppercase ml-2 tracking-widest font-black">Enterprise</span>
                    </h1>
                    <p className="text-[#71717A] text-sm mt-1 font-medium">Global cloud-synced marketing and layout management engine.</p>
                </div>
                {activeTab !== 'popup' && (
                    <button 
                        onClick={() => {
                            if (activeTab === 'banners') handleSaveSection('homepage_banners', banners);
                            if (activeTab === 'announcements') handleSaveSection('announcements', announcements);
                            if (activeTab === 'navigation') handleSaveNavigationPage();
                        }}
                        disabled={saving}
                        className="bg-[#966E2E] hover:bg-[#7D5A25] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 active:scale-95"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Publish {activeTab === 'navigation' ? 'Page Config' : activeTab}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap p-1.5 bg-[#FAF9F5] border border-[#E8E2D5] rounded-3xl w-fit gap-1">
                {[
                    { id: 'banners', label: 'Hero Banners', icon: Monitor },
                    { id: 'announcements', label: 'Ticker Bar', icon: Smartphone },
                    { id: 'navigation', label: 'Arrivals & Offers', icon: Globe },
                    { id: 'popup', label: 'Promo Pop-up', icon: Sparkles }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-[#966E2E] text-white shadow-sm' : 'text-[#71717A] hover:text-[#18181B]'}`}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Areas */}
            <div className="mt-8">
                {activeTab === 'banners' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
                            <div>
                                <h3 className="text-lg font-black text-[#18181B]">Homepage Hero Configuration</h3>
                                <p className="text-[#71717A] text-xs mt-1">Configure mobile-first hero copy, call-to-actions, WhatsApp channels, and featured products.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => banners[0] && resetBannerToDefault(banners[0].id)} 
                                    className="bg-white hover:bg-[#FAF9F5] text-[#71717A] border border-[#E8E2D5] hover:border-[#966E2E] px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-2xs"
                                >
                                    Reset to Defaults
                                </button>
                                <button 
                                    onClick={handleAddBanner} 
                                    className="bg-[#FAF9F5] hover:bg-white text-[#966E2E] border border-[#E8E2D5] hover:border-[#966E2E] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xs"
                                >
                                    + Add Variant
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {banners.map((banner, index) => {
                                const eyebrowText = banner.eyebrow || 'Since 1960 · Chandni Chowk, New Delhi';
                                const titleText = banner.title || 'Jewellery Tools, Machines & Packaging for Goldsmiths and Manufacturers';
                                const subtitleText = banner.subtitle || 'Pliers, tweezers, polishing machines, torches, ring tools and packaging, supplied to jewellers and workshops across India.';
                                const primaryBtnText = banner.button_text || 'Shop the catalog';
                                const secondaryBtnText = banner.secondary_button_text || 'Get a bulk quote';

                                return (
                                <motion.div layout key={banner.id} className="bg-white border border-[#E8E2D5] rounded-3xl overflow-hidden shadow-xs">
                                    {/* Editor Header Banner */}
                                    <div className="bg-[#FAF9F5] px-6 py-4 border-b border-[#E8E2D5] flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#966E2E]" />
                                            <span className="text-xs font-bold font-mono uppercase text-[#18181B]">
                                                Hero Slide #{index + 1}
                                            </span>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E8E2D5] text-[#71717A]">
                                                Platform: {banner.platform}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                type="button"
                                                onClick={() => resetBannerToDefault(banner.id)}
                                                className="text-[10px] font-semibold text-[#7A541E] hover:underline"
                                            >
                                                Reset this slide
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    onClick={() => handleUpdateBanner(banner.id, { active: !banner.active })} 
                                                    className={`w-10 h-5 rounded-full relative transition-all cursor-pointer ${banner.active ? 'bg-emerald-600' : 'bg-gray-300'}`}
                                                >
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${banner.active ? 'left-5' : 'left-1'}`} />
                                                </div>
                                                <span className="text-[10px] font-bold text-[#71717A] uppercase">{banner.active ? 'Active' : 'Draft'}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteBanner(banner.id)} 
                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                aria-label="Delete banner"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 md:p-8 space-y-6">
                                        {/* 1. Core Copy Fields with Validation & Character Counters */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#966E2E]">1. Hero Copy & Messaging</h4>
                                            
                                            {/* Eyebrow */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-[#71717A] uppercase">
                                                    <label>Eyebrow Badge (Max 60 chars)</label>
                                                    <span className={(banner.eyebrow || '').length > 60 ? 'text-rose-600 font-bold' : ''}>
                                                        {(banner.eyebrow || '').length}/60
                                                    </span>
                                                </div>
                                                <input 
                                                    value={banner.eyebrow || ''} 
                                                    maxLength={60}
                                                    placeholder="Since 1960 · Chandni Chowk, New Delhi"
                                                    onChange={e => handleUpdateBanner(banner.id, { eyebrow: e.target.value })} 
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-xs text-[#18181B] font-mono focus:border-[#966E2E] focus:bg-white outline-none" 
                                                />
                                            </div>

                                            {/* H1 Title */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-[#71717A] uppercase">
                                                    <label>Main Headline / H1 (Max 90 chars)</label>
                                                    <span className={(banner.title || '').length > 90 ? 'text-rose-600 font-bold' : ''}>
                                                        {(banner.title || '').length}/90
                                                    </span>
                                                </div>
                                                <input 
                                                    value={banner.title || ''} 
                                                    maxLength={90}
                                                    placeholder="Jewellery Tools, Machines & Packaging for Goldsmiths and Manufacturers"
                                                    onChange={e => handleUpdateBanner(banner.id, { title: e.target.value })} 
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3.5 text-sm text-[#18181B] font-bold focus:border-[#966E2E] focus:bg-white outline-none" 
                                                />
                                            </div>

                                            {/* Subheading */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[10px] font-bold text-[#71717A] uppercase">
                                                    <label>Subheading Copy (Max 180 chars)</label>
                                                    <span className={(banner.subtitle || '').length > 180 ? 'text-rose-600 font-bold' : ''}>
                                                        {(banner.subtitle || '').length}/180
                                                    </span>
                                                </div>
                                                <textarea 
                                                    rows={2}
                                                    value={banner.subtitle || ''} 
                                                    maxLength={180}
                                                    placeholder="Pliers, tweezers, polishing machines, torches, ring tools and packaging, supplied to jewellers and workshops across India."
                                                    onChange={e => handleUpdateBanner(banner.id, { subtitle: e.target.value })} 
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-xs text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none leading-relaxed" 
                                                />
                                            </div>
                                        </div>

                                        {/* 2. Call to Action Links */}
                                        <div className="space-y-4 pt-4 border-t border-[#E8E2D5]">
                                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#966E2E]">2. Call to Action Buttons & Links</h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Primary CTA */}
                                                <div className="space-y-1.5 p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#E8E2D5]">
                                                    <span className="text-[10px] font-bold text-[#966E2E] uppercase">Primary CTA (Retail)</span>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-[9px] text-[#71717A]">
                                                            <span>Label (Max 24)</span>
                                                            <span>{(banner.button_text || '').length}/24</span>
                                                        </div>
                                                        <input 
                                                            value={banner.button_text || ''} 
                                                            maxLength={24}
                                                            placeholder="Shop the catalog"
                                                            onChange={e => handleUpdateBanner(banner.id, { button_text: e.target.value })} 
                                                            className="w-full bg-white border border-[#E8E2D5] rounded-xl p-2.5 text-xs text-[#18181B] font-medium outline-none focus:border-[#966E2E]"
                                                        />
                                                        <input 
                                                            value={banner.link || ''} 
                                                            placeholder="/shop"
                                                            onChange={e => handleUpdateBanner(banner.id, { link: e.target.value })} 
                                                            className="w-full bg-white border border-[#E8E2D5] rounded-xl p-2.5 text-xs font-mono text-[#18181B] outline-none focus:border-[#966E2E]"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Secondary CTA */}
                                                <div className="space-y-1.5 p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#E8E2D5]">
                                                    <span className="text-[10px] font-bold text-[#71717A] uppercase">Secondary CTA (Wholesale / B2B)</span>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-[9px] text-[#71717A]">
                                                            <span>Label (Max 24)</span>
                                                            <span>{(banner.secondary_button_text || '').length}/24</span>
                                                        </div>
                                                        <input 
                                                            value={banner.secondary_button_text || ''} 
                                                            maxLength={24}
                                                            placeholder="Get a bulk quote"
                                                            onChange={e => handleUpdateBanner(banner.id, { secondary_button_text: e.target.value })} 
                                                            className="w-full bg-white border border-[#E8E2D5] rounded-xl p-2.5 text-xs text-[#18181B] font-medium outline-none focus:border-[#966E2E]"
                                                        />
                                                        <input 
                                                            value={banner.secondary_link || ''} 
                                                            placeholder="/contact?subject=Bulk+Quote"
                                                            onChange={e => handleUpdateBanner(banner.id, { secondary_link: e.target.value })} 
                                                            className="w-full bg-white border border-[#E8E2D5] rounded-xl p-2.5 text-xs font-mono text-[#18181B] outline-none focus:border-[#966E2E]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* WhatsApp Channel */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-[#71717A] uppercase">WhatsApp Number (e.g. 919953435647)</label>
                                                    <input 
                                                        value={banner.whatsapp_number || ''} 
                                                        placeholder="919953435647"
                                                        onChange={e => handleUpdateBanner(banner.id, { whatsapp_number: e.target.value })} 
                                                        className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-2.5 text-xs font-mono text-[#18181B] outline-none focus:border-[#966E2E]"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-[#71717A] uppercase">WhatsApp Prefilled Message</label>
                                                    <input 
                                                        value={banner.whatsapp_message || ''} 
                                                        placeholder="Hello Dinanath & Sons, I would like to inquire about jewellery tools..."
                                                        onChange={e => handleUpdateBanner(banner.id, { whatsapp_message: e.target.value })} 
                                                        className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-2.5 text-xs text-[#18181B] outline-none focus:border-[#966E2E]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Platform Targeting & Scheduling */}
                                        <div className="space-y-4 pt-4 border-t border-[#E8E2D5]">
                                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#966E2E]">3. Platform Targeting & Seasonal Scheduling</h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-[#71717A] uppercase">Device Platform</label>
                                                    <select 
                                                        value={banner.platform} 
                                                        onChange={e => handleUpdateBanner(banner.id, { platform: e.target.value as any })} 
                                                        className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-3 text-xs text-[#18181B] font-bold outline-none focus:border-[#966E2E]"
                                                    >
                                                        <option value="all">Universal (All Devices)</option>
                                                        <option value="desktop">Desktop Only</option>
                                                        <option value="mobile">Mobile Optimized Only</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-[#71717A] uppercase">Campaign Start Date</label>
                                                    <input 
                                                        type="datetime-local"
                                                        value={banner.start_date ? banner.start_date.substring(0, 16) : ''} 
                                                        onChange={e => handleUpdateBanner(banner.id, { start_date: e.target.value })} 
                                                        className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-2.5 text-xs text-[#18181B] outline-none focus:border-[#966E2E]"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-[#71717A] uppercase">Campaign End Date</label>
                                                    <input 
                                                        type="datetime-local"
                                                        value={banner.end_date ? banner.end_date.substring(0, 16) : ''} 
                                                        onChange={e => handleUpdateBanner(banner.id, { end_date: e.target.value })} 
                                                        className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl p-2.5 text-xs text-[#18181B] outline-none focus:border-[#966E2E]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 4. Fallback Images Slot */}
                                        <div className="space-y-4 pt-4 border-t border-[#E8E2D5]">
                                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#966E2E]">4. Fallback Hero Images (WebP/AVIF auto-optimized)</h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#E8E2D5] space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-[#18181B] uppercase">Desktop Fallback</span>
                                                        <span className="text-[9px] text-[#71717A]">1200x800px · Max 120KB</span>
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleUploadImage(banner.id, file);
                                                        }}
                                                        disabled={uploading === banner.id}
                                                        className="w-full bg-white border border-[#E8E2D5] rounded-xl p-1.5 text-[10px] text-[#18181B] file:bg-[#FAF9F5] file:text-[#18181B] file:border file:border-[#E8E2D5] file:px-2 file:py-0.5 file:rounded file:mr-2 file:cursor-pointer hover:file:bg-white"
                                                    />
                                                    {banner.image_url && (
                                                        <p className="text-[9px] text-emerald-700 font-mono truncate">Asset: {banner.image_url}</p>
                                                    )}
                                                </div>

                                                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#E8E2D5] space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-[#18181B] uppercase">Mobile Fallback</span>
                                                        <span className="text-[9px] text-[#71717A]">600x600px · Max 80KB</span>
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleUploadImage(banner.id, file);
                                                        }}
                                                        disabled={uploading === banner.id}
                                                        className="w-full bg-white border border-[#E8E2D5] rounded-xl p-1.5 text-[10px] text-[#18181B] file:bg-[#FAF9F5] file:text-[#18181B] file:border file:border-[#E8E2D5] file:px-2 file:py-0.5 file:rounded file:mr-2 file:cursor-pointer hover:file:bg-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 5. Live Preview Card */}
                                        <div className="pt-4 border-t border-[#E8E2D5]">
                                            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#966E2E] mb-3">Live Mobile Layout Preview</h4>
                                            <div className="max-w-md mx-auto bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 shadow-sm space-y-3">
                                                <div className="inline-block bg-white border border-[#E8E2D5] rounded-full px-2.5 py-0.5 text-[9px] font-bold font-mono text-[#7A541E] uppercase">
                                                    {eyebrowText}
                                                </div>
                                                <div className="text-base font-bold font-display text-[#18181B] leading-tight">
                                                    {titleText}
                                                </div>
                                                <div className="text-xs text-[#52525B] leading-relaxed">
                                                    {subtitleText}
                                                </div>
                                                <div className="space-y-1.5 pt-1">
                                                    <div className="w-full h-10 bg-[#966E2E] text-white font-bold text-xs rounded-xl flex items-center justify-center">
                                                        {primaryBtnText} →
                                                    </div>
                                                    <div className="w-full h-9 bg-white border border-[#E8E2D5] text-[#18181B] font-bold text-xs rounded-xl flex items-center justify-center">
                                                        {secondaryBtnText}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'announcements' && (
                    <div className="space-y-8">
                        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-8 md:p-10 shadow-sm">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-[#18181B] uppercase tracking-tighter">Global Ticker Management</h3>
                                    <p className="text-[#71717A] text-xs mt-1">System-wide broadcast messages for top navigation.</p>
                                </div>
                                <button onClick={() => setAnnouncements([...announcements, { id: `temp-${Date.now()}`, message: 'New Flash Message', background_color: '#966E2E', text_color: '#ffffff', active: true, display_order: announcements.length }])} className="bg-[#966E2E] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#7D5A25] transition-all shadow-sm">
                                    + Add Flash
                                </button>
                            </div>
                            <div className="space-y-4">
                                {announcements.map((ann, idx) => (
                                    <div key={ann.id} className="bg-[#FAF9F5] border border-[#E8E2D5] p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[10px] font-black text-[#71717A] uppercase">Flash Content</label>
                                            <input value={ann.message} onChange={e => setAnnouncements(announcements.map(a => a.id === ann.id ? {...a, message: e.target.value} : a))} className="w-full bg-white border border-[#E8E2D5] rounded-xl p-3 text-sm text-[#18181B] focus:border-[#966E2E] outline-none" />
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase text-center block">BG</label>
                                                <input type="color" value={ann.background_color} onChange={e => setAnnouncements(announcements.map(a => a.id === ann.id ? {...a, background_color: e.target.value} : a))} className="w-10 h-10 rounded-full border-none cursor-pointer bg-transparent" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase text-center block">Text</label>
                                                <input type="color" value={ann.text_color} onChange={e => setAnnouncements(announcements.map(a => a.id === ann.id ? {...a, text_color: e.target.value} : a))} className="w-10 h-10 rounded-full border-none cursor-pointer bg-transparent" />
                                            </div>
                                        </div>
                                        <button onClick={() => setAnnouncements(announcements.filter(a => a.id !== ann.id))} className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                                    </div>
                                ))}
                                {announcements.length === 0 && <div className="py-20 text-center border-2 border-dashed border-[#E8E2D5] rounded-3xl text-[#71717A] font-bold uppercase text-[10px]">No active ticker messages.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'navigation' && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="bg-white border border-[#E8E2D5] rounded-3xl p-8 md:p-10 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-[#E8E2D5] pb-6">
                                <div>
                                    <h3 className="text-xl font-black text-[#18181B] uppercase tracking-tighter">Dynamic Catalog Pages</h3>
                                    <p className="text-[#71717A] text-xs mt-1 font-medium">Configure headers, page pitch, and select specific products for specialized routes.</p>
                                </div>
                                <div className="flex bg-[#FAF9F5] border border-[#E8E2D5] p-1 rounded-xl shrink-0">
                                    <button 
                                        onClick={() => setSelectedPageKey('new-arrivals')}
                                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${selectedPageKey === 'new-arrivals' ? 'bg-[#966E2E] text-white shadow-sm' : 'text-[#71717A] hover:text-[#18181B]'}`}
                                    >
                                        New Arrivals
                                    </button>
                                    <button 
                                        onClick={() => setSelectedPageKey('offers')}
                                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${selectedPageKey === 'offers' ? 'bg-[#966E2E] text-white shadow-sm' : 'text-[#71717A] hover:text-[#18181B]'}`}
                                    >
                                        Special Offers
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Page configuration settings */}
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest block">Page Main Title</label>
                                        <input 
                                            type="text" 
                                            value={pageTitle}
                                            onChange={e => setPageTitle(e.target.value)}
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white outline-none rounded-xl p-3 text-xs font-bold text-[#18181B] transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest block">Page Subtitle / Pitch</label>
                                        <textarea 
                                            rows={4}
                                            value={pageSubtitle}
                                            onChange={e => setPageSubtitle(e.target.value)}
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white outline-none rounded-xl p-3 text-xs font-semibold text-[#18181B] transition-colors leading-relaxed"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-[#E8E2D5] flex justify-between items-center text-xs font-bold">
                                        <span className="text-[10px] font-black text-[#71717A] uppercase">Selected Products:</span>
                                        <span className="font-mono bg-amber-50 text-[#966E2E] border border-amber-200 px-2 py-0.5 rounded font-black">{pageProducts.length} items</span>
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
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white outline-none rounded-xl px-4 py-3.5 text-xs font-bold text-[#18181B] transition-colors placeholder-[#A1A1AA]"
                                        />
                                    </div>

                                    <div className="border border-[#E8E2D5] rounded-2xl overflow-hidden bg-white h-[300px] overflow-y-auto divide-y divide-[#E8E2D5]">
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
                                                        className={`p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF9F5]/70 transition-colors ${isChecked ? 'bg-amber-50/50' : ''}`}
                                                    >
                                                        <div>
                                                            <p className="text-xs font-bold text-[#18181B] uppercase tracking-wider">{p.name}</p>
                                                            <span className="text-[8px] bg-[#FAF9F5] text-[#71717A] border border-[#E8E2D5] px-2 py-0.5 rounded uppercase font-black mt-1 inline-block">{p.category}</span>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-[#966E2E] border-[#966E2E] text-white' : 'border-[#E8E2D5] bg-[#FAF9F5]'}`}>
                                                            {isChecked && <Plus size={10} strokeWidth={3} />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        {catalogProducts.length === 0 && (
                                            <div className="py-20 text-center text-[#A1A1AA] italic text-xs font-bold uppercase">No products available in database.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'popup' && (
                    <MarketingPopupManager />
                )}
            </div>

            <div className="mt-12 p-8 md:p-10 bg-amber-50/60 border border-amber-200/80 rounded-3xl relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                    <Zap size={200} className="text-[#966E2E] translate-x-20 -translate-y-10" />
                </div>
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <h4 className="text-[#966E2E] text-xl font-black uppercase tracking-widest flex items-center gap-3"><Zap fill="currentColor"/> Master CMS Engine</h4>
                    <p className="text-[#52525B] text-sm leading-relaxed">
                        Your storefront changes are synchronized globally via the Dinanath Cloud Engine. Changes take effect immediately across all client devices. Use the <strong>"Target Platform"</strong> setting to optimize visual assets for mobile-specific aspect ratios.
                    </p>
                </div>
            </div>
        </div>
    );
}
