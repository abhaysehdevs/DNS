'use client';

import { useState, useEffect, useTransition } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Plus, Edit, Trash2, Search, X, Save, Image as ImageIcon, Loader2, 
    Filter, AlertCircle, CheckCircle, XCircle, Layers, Box, ChevronDown, 
    CheckSquare, Square, Download, Upload, Video, 
    Settings, Info, Zap, Scale, Ruler, ShieldCheck, Tag, Link as LinkIcon,
    Globe, Star, RefreshCw, Undo2, ArrowUpRight, Sparkles, ExternalLink
} from 'lucide-react';
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
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    canonical_url?: string;
    og_image_url?: string;
    noindex?: boolean;
    slug?: string;
    deleted_at?: string | null;
    is_price_on_request?: boolean;
    low_stock_threshold?: number;
    reorder_quantity?: number;
    created_at?: string;
    updated_at?: string;
}

const SEO_RESERVED_KEYS = new Set([
    'slug', 'seo_title', 'seo_description', 'seo_keywords', 'meta_title', 'meta_description', 'canonical_url', 'og_image_url', 'noindex'
]);

const filterOutSeoKeys = (specs: Record<string, any> = {}) => {
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
    const [viewTab, setViewTab] = useState<'active' | 'recycleBin'>('active');

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [originalSlug, setOriginalSlug] = useState('');
    const [currentProduct, setCurrentProduct] = useState<Partial<ProductDB>>({});
    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [successToast, setSuccessToast] = useState<string | null>(null);
    const [aiGeneratingSeo, setAiGeneratingSeo] = useState(false);

    // Sub-Editors
    const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'media' | 'variants' | 'seo'>('basic');
    const [dbCategories, setDbCategories] = useState<any[]>([]);
    const [variantUploadingId, setVariantUploadingId] = useState<string | null>(null);

    // Auto-dismiss toast
    useEffect(() => {
        if (successToast) {
            const timer = setTimeout(() => setSuccessToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [successToast]);

    useEffect(() => {
        fetchProducts();
        fetchCategories();

        // Check if deep linked with ?action=new
        if (typeof window !== 'undefined' && window.location.search.includes('action=new')) {
            handleAddNew();
        }
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

        if (error) {
            console.error('Error fetching products:', error);
        } else {
            const normalized = (data || []).map((p: any) => ({
                ...p,
                meta_title: p.meta_title || p.seo_title || p.specifications?.seo_title || '',
                meta_description: p.meta_description || p.seo_description || p.specifications?.seo_description || '',
                meta_keywords: p.meta_keywords || p.seo_keywords || p.specifications?.seo_keywords || '',
                seo_title: p.meta_title || p.seo_title || p.specifications?.seo_title || '',
                seo_description: p.meta_description || p.seo_description || p.specifications?.seo_description || '',
                seo_keywords: p.meta_keywords || p.seo_keywords || p.specifications?.seo_keywords || '',
                slug: p.slug || p.specifications?.slug || '',
                canonical_url: p.canonical_url || '',
                og_image_url: p.og_image_url || '',
                noindex: Boolean(p.noindex),
                deleted_at: p.deleted_at || null
            }));
            setProducts(normalized);
        }
        setLoading(false);
    };

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

                return publicUrl;
            };

            const uploadPromises = Array.from(files).map(uploadSingleFile);
            const urls = await Promise.all(uploadPromises);

            setCurrentProduct(prev => {
                const currentGallery = prev.gallery || [];
                const newItems = urls.map(url => ({
                    id: Math.random().toString(),
                    type: target === 'video' ? ('video' as const) : ('image' as const),
                    url
                }));
                const updatedGallery = [...currentGallery, ...newItems];
                const mainImage = prev.image || updatedGallery.find(g => g.type === 'image')?.url || urls[0] || '';

                return {
                    ...prev,
                    image: mainImage,
                    gallery: updatedGallery
                };
            });
        } catch (error: any) {
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleReorderGallery = (index: number, direction: 'up' | 'down') => {
        setCurrentProduct(prev => {
            if (!prev.gallery) return prev;
            const gallery = [...prev.gallery];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
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
                    console.error('WebP conversion failed:', e);
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

    // --- Slug Generator & Duplicate Check ---
    const generateSlugFromName = (name: string) => {
        return (name || 'product')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    };

    const isSlugDuplicate = (slugToCheck: string) => {
        if (!slugToCheck) return false;
        return products.some(p => 
            !p.deleted_at && 
            p.slug?.toLowerCase() === slugToCheck.toLowerCase() && 
            p.id !== currentProduct.id
        );
    };

    // --- AI SEO Generator ---
    const handleGenerateSeoWithAi = async () => {
        if (!currentProduct.name) {
            alert('Please enter a product name first before generating SEO.');
            return;
        }

        setAiGeneratingSeo(true);
        try {
            const adminEmail = typeof window !== 'undefined' ? sessionStorage.getItem('dns_admin_email') || 'ajayabhay12872@gmail.com' : 'ajayabhay12872@gmail.com';
            const prompt = `Generate concise, professional SEO metadata for this jewellery tool e-commerce product:
Product Name: "${currentProduct.name}"
Category: "${currentProduct.category || 'Jewellery Tools'}"
Description: "${currentProduct.description || ''}"

Provide a JSON object with:
- meta_title (recommended 50 to 60 characters, mentioning Dinanath & Sons)
- meta_description (recommended 140 to 160 characters, factual, compelling summary)
- meta_keywords (5 to 8 comma-separated relevant trade keywords)`;

            const res = await fetch('/api/admin/ai', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'x-admin-email': adminEmail
                },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            if (res.ok) {
                const data = await res.json();
                const reply = data.reply || '';
                const jsonMatch = reply.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        const parsed = JSON.parse(jsonMatch[0]);
                        setCurrentProduct(prev => ({
                            ...prev,
                            meta_title: parsed.meta_title || prev.meta_title,
                            meta_description: parsed.meta_description || prev.meta_description,
                            meta_keywords: parsed.meta_keywords || prev.meta_keywords,
                            seo_title: parsed.meta_title || prev.seo_title,
                            seo_description: parsed.meta_description || prev.seo_description,
                            seo_keywords: parsed.meta_keywords || prev.seo_keywords,
                        }));
                    } catch (e) {
                        console.error('Failed to parse AI SEO response JSON', e);
                    }
                }
            }
        } catch (err: any) {
            console.error('AI SEO generation error:', err);
        } finally {
            setAiGeneratingSeo(false);
        }
    };

    // --- Submission (Phase 1: Single Request, No Silent Stripping) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveError(null);
        setFormLoading(true);

        try {
            const galleryList = currentProduct.gallery || [];
            const primaryImage = currentProduct.image || galleryList.find(g => g.type === 'image')?.url || galleryList[0]?.url || '';

            const generatedSku = currentProduct.sku?.trim() ? currentProduct.sku.trim() : `DNS-${Date.now().toString().slice(-6)}`;
            
            // Calculate final slug
            let targetSlug = (currentProduct.slug || '').trim().toLowerCase();
            if (!targetSlug) {
                const base = generateSlugFromName(currentProduct.name || 'product');
                const suffix = generatedSku ? generatedSku.replace(/\D/g, '').slice(-4) : Math.floor(1000 + Math.random() * 9000);
                targetSlug = `${base}-${suffix}`;
            }

            // Duplicate Slug Check
            if (isSlugDuplicate(targetSlug)) {
                throw new Error(`The slug "${targetSlug}" is already assigned to another active product. Please specify a unique slug.`);
            }

            // Slug Change Confirmation and 301 Redirect Record
            if (isEditing && originalSlug && targetSlug !== originalSlug) {
                const confirmRedirect = confirm(
                    `You changed the product slug from "${originalSlug}" to "${targetSlug}".\n\nWould you like to proceed and create a 301 permanent redirect record from /shop/${originalSlug} to /shop/${targetSlug}?`
                );
                if (!confirmRedirect) {
                    setFormLoading(false);
                    return;
                }

                // Create 301 redirect entry
                await supabase.from('redirects').upsert({
                    source_path: `/shop/${originalSlug}`,
                    target_path: `/shop/${targetSlug}`,
                    status_code: 301
                }, { onConflict: 'source_path' });
            }

            const cleanSpecs = filterOutSeoKeys(currentProduct.specifications || {});
            cleanSpecs.slug = targetSlug;
            cleanSpecs.seo_keywords = (currentProduct.meta_keywords || currentProduct.seo_keywords || '').trim();
            cleanSpecs.seo_title = (currentProduct.meta_title || currentProduct.seo_title || '').trim();
            cleanSpecs.seo_description = (currentProduct.meta_description || currentProduct.seo_description || '').trim();

            const finalMetaTitle = (currentProduct.meta_title || currentProduct.seo_title || '').trim();
            const finalMetaDesc = (currentProduct.meta_description || currentProduct.seo_description || '').trim();
            const finalMetaKeywords = (currentProduct.meta_keywords || currentProduct.seo_keywords || '').trim();

            const payload: any = {
                name: currentProduct.name,
                category: currentProduct.category || 'Tools',
                description: currentProduct.description || '',
                retail_price: Number(currentProduct.retail_price) || 0,
                wholesale_price: Number(currentProduct.wholesale_price) || 0,
                wholesale_moq: Number(currentProduct.wholesale_moq) || 1,
                in_stock: currentProduct.in_stock !== false,
                quantity: currentProduct.quantity !== undefined ? Number(currentProduct.quantity) : 0,
                sku: generatedSku,
                slug: targetSlug,
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
                meta_title: finalMetaTitle,
                meta_description: finalMetaDesc,
                meta_keywords: finalMetaKeywords,
                seo_title: finalMetaTitle,
                seo_description: finalMetaDesc,
                seo_keywords: finalMetaKeywords,
                canonical_url: currentProduct.canonical_url || '',
                og_image_url: currentProduct.og_image_url || '',
                noindex: Boolean(currentProduct.noindex),
                is_price_on_request: Boolean(currentProduct.is_price_on_request),
                updated_at: new Date().toISOString()
            };

            // Single request - NO retry loop stripping columns
            let saveRes: any;
            if (isEditing && currentProduct.id) {
                saveRes = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', currentProduct.id);
            } else {
                saveRes = await supabase
                    .from('products')
                    .insert([payload]);
            }

            if (saveRes.error) {
                // Keep modal open and surface the exact error to the admin
                throw new Error(saveRes.error.message || 'Database rejected the product payload.');
            }

            // Log to server audit log
            const adminEmail = typeof window !== 'undefined' ? sessionStorage.getItem('dns_admin_email') || 'ajayabhay12872@gmail.com' : 'ajayabhay12872@gmail.com';
            fetch('/api/admin/audit-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: adminEmail,
                    action: isEditing ? 'PRODUCT_UPDATE' : 'PRODUCT_CREATE',
                    resourceType: 'PRODUCT',
                    resourceId: currentProduct.id || targetSlug,
                    details: { name: payload.name, slug: targetSlug, retail_price: payload.retail_price }
                })
            }).catch(() => {});

            // Close modal only on verified success
            setShowForm(false);
            setSuccessToast(isEditing ? `"${payload.name}" updated successfully!` : `"${payload.name}" listed successfully!`);
            fetchProducts();
        } catch (error: any) {
            setSaveError(error.message || 'Failed to save product');
        } finally {
            setFormLoading(false);
        }
    };

    // --- Soft Delete (1.7b) ---
    const handleSoftDelete = async (id: string, name: string) => {
        if (!confirm(`Move "${name}" to the Recycle Bin? It can be restored within 30 days.`)) return;

        try {
            const { error } = await supabase
                .from('products')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            setSuccessToast(`"${name}" moved to Recycle Bin.`);
            fetchProducts();
        } catch (error: any) {
            alert('Error deleting: ' + error.message);
        }
    };

    const handleRestoreProduct = async (id: string, name: string) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ deleted_at: null })
                .eq('id', id);

            if (error) throw error;
            setSuccessToast(`"${name}" restored to active catalog.`);
            fetchProducts();
        } catch (error: any) {
            alert('Error restoring product: ' + error.message);
        }
    };

    const handlePermanentDelete = async (id: string, name: string) => {
        const typed = prompt(`⚠️ PERMANENT DESTRUCTION\n\nTo permanently erase this item forever from the database, type its exact name:\n"${name}"`);
        if (typed !== name) {
            if (typed !== null) alert('Name did not match. Deletion cancelled.');
            return;
        }

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setSuccessToast(`"${name}" permanently removed.`);
            fetchProducts();
        } catch (error: any) {
            alert('Error permanently deleting: ' + error.message);
        }
    };

    const handleBulkSoftDelete = async () => {
        if (!confirm(`Move ${selectedIds.length} products to the Recycle Bin?`)) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('products')
                .update({ deleted_at: new Date().toISOString() })
                .in('id', selectedIds);

            if (error) throw error;
            setSelectedIds([]);
            setSuccessToast(`${selectedIds.length} products moved to Recycle Bin.`);
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
            setSuccessToast(`Stock status updated for ${selectedIds.length} items.`);
            fetchProducts();
        } catch (err: any) {
            alert('Bulk update failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (p: ProductDB) => {
        const specs = filterOutSeoKeys(p.specifications || {});
        const currentSlug = p.slug || (p.specifications as any)?.slug || '';
        setOriginalSlug(currentSlug);
        setSaveError(null);

        setCurrentProduct({ 
            ...p, 
            meta_title: p.meta_title || p.seo_title || (p as any).seo_title || '',
            meta_description: p.meta_description || p.seo_description || (p as any).seo_description || '',
            meta_keywords: p.meta_keywords || p.seo_keywords || (p as any).seo_keywords || '',
            seo_title: p.meta_title || p.seo_title || '',
            seo_description: p.meta_description || p.seo_description || '',
            seo_keywords: p.meta_keywords || p.seo_keywords || '',
            slug: currentSlug,
            canonical_url: p.canonical_url || '',
            og_image_url: p.og_image_url || '',
            noindex: Boolean(p.noindex),
            is_price_on_request: Boolean(p.is_price_on_request),
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
        setOriginalSlug('');
        setSaveError(null);
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
            meta_title: '',
            meta_description: '',
            meta_keywords: '',
            seo_title: '',
            seo_description: '',
            seo_keywords: '',
            slug: '',
            canonical_url: '',
            og_image_url: '',
            noindex: false,
            is_price_on_request: false,
            dimensions: { length: '', width: '', height: '' }
        });
        setIsEditing(false);
        setShowForm(true);
        setActiveTab('basic');
    };

    // Filter lists
    const activeProducts = products.filter(p => !p.deleted_at);
    const recycledProducts = products.filter(p => Boolean(p.deleted_at));

    const displayedList = viewTab === 'active' ? activeProducts : recycledProducts;

    const filteredProducts = displayedList.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.slug?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = dbCategories.length > 0 
        ? ['All', ...dbCategories.map(c => c.name)]
        : ['All', ...Array.from(new Set(products.map(p => p.category)))];

    // Character counters for SEO tab
    const titleLength = (currentProduct.meta_title || currentProduct.seo_title || '').length;
    const descLength = (currentProduct.meta_description || currentProduct.seo_description || '').length;

    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] p-4 md:p-8 max-w-[1600px] mx-auto">
            
            {/* --- Success Toast --- */}
            {successToast && (
                <div className="fixed top-6 right-6 z-[200] bg-emerald-700 text-white px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
                    <CheckCircle size={20} />
                    <span className="text-xs font-bold tracking-wide">{successToast}</span>
                    <button onClick={() => setSuccessToast(null)} className="ml-2 hover:opacity-75">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-[#18181B] flex items-center gap-4">
                        <Box className="text-[#966E2E]" size={40} /> Inventory Master
                    </h1>
                    <p className="text-[#71717A] text-sm mt-2 font-medium tracking-wide uppercase">Manage professional grade listings & global stock</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* View Mode Toggle */}
                    <div className="bg-white border border-[#E8E2D5] p-1 rounded-2xl flex items-center shadow-xs">
                        <button
                            onClick={() => { setViewTab('active'); setSelectedIds([]); }}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewTab === 'active' ? 'bg-[#966E2E] text-white shadow-xs' : 'text-[#71717A] hover:text-[#18181B]'}`}
                        >
                            Active ({activeProducts.length})
                        </button>
                        <button
                            onClick={() => { setViewTab('recycleBin'); setSelectedIds([]); }}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${viewTab === 'recycleBin' ? 'bg-rose-600 text-white shadow-xs' : 'text-[#71717A] hover:text-[#18181B]'}`}
                        >
                            Recycle Bin ({recycledProducts.length})
                        </button>
                    </div>

                    <button 
                        onClick={() => {
                            const csv = products.filter(p => !p.deleted_at).map(p => 
                                `"${(p.name || '').replace(/"/g, '""')}","${p.sku || ''}","${p.slug || ''}",${p.quantity || 0},${p.retail_price || 0},"${(p.meta_title || '').replace(/"/g, '""')}","${(p.meta_keywords || '').replace(/"/g, '""')}"`
                            ).join('\n');
                            const blob = new Blob([`Name,SKU,Slug,Stock,Price,Meta_Title,Keywords\n${csv}`], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                        }}
                        className="bg-white hover:bg-[#FAF9F5] border border-[#E8E2D5] text-[#71717A] hover:text-[#18181B] px-6 py-3 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase transition-all shadow-xs"
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
            <div className="bg-white border border-[#E8E2D5] rounded-3xl overflow-hidden shadow-xs">
                {/* Search & Filter Toolbar */}
                <div className="p-6 border-b border-[#E8E2D5] flex flex-col md:flex-row gap-4 bg-[#FAF9F5]/60 backdrop-blur">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" size={20} />
                        <input 
                            type="text"
                            placeholder="Search by Name, SKU, or Slug..."
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
                        <div className="py-16 text-center text-[#71717A] italic">
                            {viewTab === 'active' ? 'No active products found.' : 'Recycle bin is empty.'}
                        </div>
                    ) : filteredProducts.map(p => (
                        <div key={p.id} className="bg-white border border-[#E8E2D5] rounded-2xl p-4 space-y-4 shadow-xs">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl overflow-hidden shrink-0">
                                    {p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <div className="w-full h-full flex items-center justify-center text-[#A1A1AA]"><ImageIcon size={24} /></div>}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="text-[#18181B] font-bold text-base truncate">{p.name}</div>
                                        {viewTab === 'active' && (
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
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        <span className="text-[9px] font-black uppercase text-[#71717A] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E8E2D5]">{p.category}</span>
                                        <span className="text-[9px] font-mono text-[#71717A]">/{p.slug || 'no-slug'}</span>
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
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-[#71717A] font-black uppercase tracking-wider block">Price</span>
                                    <span className="text-base font-black text-[#18181B] mt-0.5 block">₹{p.retail_price.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                {viewTab === 'active' ? (
                                    <>
                                        <button 
                                            onClick={() => handleEdit(p)} 
                                            className="flex-1 py-2.5 bg-[#FAF9F5] hover:bg-[#FAF9F5]/70 text-[#966E2E] border border-[#E8E2D5] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleSoftDelete(p.id, p.name)} 
                                            className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all"
                                            title="Move to Recycle Bin"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            onClick={() => handleRestoreProduct(p.id, p.name)} 
                                            className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            <Undo2 size={14} /> Restore
                                        </button>
                                        <button 
                                            onClick={() => handlePermanentDelete(p.id, p.name)} 
                                            className="p-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl transition-all"
                                            title="Delete Forever"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#FAF9F5] text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] border-b border-[#E8E2D5]">
                            <tr>
                                {viewTab === 'active' && (
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
                                            {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? <CheckSquare size={16} className="text-[#966E2E]" /> : <Square size={16} />}
                                        </button>
                                    </th>
                                )}
                                <th className="px-8 py-6">Product Information & Slug</th>
                                <th className="px-8 py-6">Inventory Status</th>
                                <th className="px-8 py-6 text-right">Retail Price</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E2D5]">
                            {loading ? (
                                <tr><td colSpan={5} className="py-32 text-center"><Loader2 className="animate-spin text-[#966E2E] mx-auto" size={48} /></td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center text-[#71717A] italic text-sm">
                                        {viewTab === 'active' ? 'No active products found.' : 'Recycle bin is empty. Deleted items remain here for 30 days.'}
                                    </td>
                                </tr>
                            ) : filteredProducts.map(p => (
                                <tr key={p.id} className="group hover:bg-[#FAF9F5]/70 transition-colors">
                                    {viewTab === 'active' && (
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
                                    )}
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl overflow-hidden shrink-0 group-hover:border-[#966E2E]/50 transition-all">
                                                {p.image ? <img src={p.image} className="w-full h-full object-cover" alt={p.name} /> : <div className="w-full h-full flex items-center justify-center text-[#A1A1AA]"><ImageIcon /></div>}
                                            </div>
                                            <div>
                                                <div className="text-[#18181B] font-bold text-lg group-hover:text-[#966E2E] transition-colors">{p.name}</div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] font-black uppercase text-[#71717A] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E8E2D5]">{p.category}</span>
                                                    <span className="text-[10px] font-mono text-[#966E2E]">/shop/{p.slug || 'no-slug'}</span>
                                                    {p.noindex && (
                                                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">NOINDEX</span>
                                                    )}
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
                                        {viewTab === 'active' ? (
                                            <div className="flex justify-end gap-3 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-4 md:group-hover:translate-x-0">
                                                <button onClick={() => handleEdit(p)} className="p-3 bg-[#FAF9F5] text-[#966E2E] hover:bg-white border border-[#E8E2D5] rounded-2xl transition-all" title="Edit Listing"><Edit size={20} /></button>
                                                <button onClick={() => handleSoftDelete(p.id, p.name)} className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-2xl transition-all" title="Move to Recycle Bin"><Trash2 size={20} /></button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => handleRestoreProduct(p.id, p.name)} className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5" title="Restore Product">
                                                    <Undo2 size={16} /> Restore
                                                </button>
                                                <button onClick={() => handlePermanentDelete(p.id, p.name)} className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5" title="Permanent Delete">
                                                    <Trash2 size={16} /> Delete Forever
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Actions Floating Bar */}
            {viewTab === 'active' && selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#E8E2D5] px-6 py-4 rounded-3xl shadow-xl flex items-center gap-6 max-w-lg w-[90vw] justify-between backdrop-blur animate-in fade-in slide-in-from-bottom-6">
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
                            onClick={handleBulkSoftDelete}
                            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                        >
                            Recycle ({selectedIds.length})
                        </button>
                        <button 
                            onClick={() => setSelectedIds([])}
                            className="p-2 text-[#71717A] hover:text-[#18181B] rounded-xl transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* --- Professional Form Modal (Reliable Direct Render - No Ghost Overlay) --- */}
            {showForm && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !formLoading) setShowForm(false);
                    }}
                >
                    <div className="relative w-full max-w-6xl bg-white border border-[#E8E2D5] rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="p-6 md:p-8 border-b border-[#E8E2D5] flex justify-between items-center bg-white z-10 shrink-0">
                            <div>
                                <div className="text-[10px] font-black text-[#966E2E] uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
                                    <Zap size={14} fill="currentColor" /> Professional Listing Engine
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-[#18181B]">{isEditing ? 'Sync Listing' : 'Initialize Product'}</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setShowForm(false)} 
                                    className="w-10 h-10 bg-[#FAF9F5] border border-[#E8E2D5] rounded-full flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Error Banner (Surfaces exact database or validation error) */}
                        {saveError && (
                            <div className="bg-rose-50 border-b border-rose-200 p-4 px-8 flex items-center gap-3 text-rose-800 text-xs font-bold shrink-0">
                                <AlertCircle size={18} className="text-rose-600 shrink-0" />
                                <div className="flex-1">
                                    <span>Error Saving Product: {saveError}</span>
                                </div>
                                <button onClick={() => setSaveError(null)} className="text-rose-500 hover:text-rose-800">
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Tab Navigation */}
                        <div className="flex px-6 md:px-8 gap-8 border-b border-[#E8E2D5] bg-[#FAF9F5] overflow-x-auto shrink-0">
                            {[
                                { id: 'basic', label: 'Identity & Pricing', icon: Info },
                                { id: 'details', label: 'Detailed Specs', icon: Settings },
                                { id: 'media', label: 'Media Assets', icon: ImageIcon },
                                { id: 'variants', label: 'Manage Variants', icon: Layers },
                                { id: 'seo', label: 'SEO Metadata', icon: Globe }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-4 flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-[#966E2E]' : 'text-[#71717A] hover:text-[#18181B]'}`}
                                >
                                    <tab.icon size={15} /> {tab.label}
                                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#966E2E] rounded-full" />}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-white">
                            
                            {/* --- Tab Content: Basic --- */}
                            {activeTab === 'basic' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Product Primary Identity</label>
                                            <input 
                                                required
                                                value={currentProduct.name || ''}
                                                onChange={e => {
                                                    const nameVal = e.target.value;
                                                    setCurrentProduct(prev => {
                                                        const updates: any = { ...prev, name: nameVal };
                                                        // Auto generate slug if not editing an existing slug
                                                        if (!isEditing && (!prev.slug || prev.slug === generateSlugFromName(prev.name || ''))) {
                                                            updates.slug = generateSlugFromName(nameVal);
                                                        }
                                                        return updates;
                                                    });
                                                }}
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-lg font-bold text-[#18181B] placeholder-[#A1A1AA] focus:border-[#966E2E] focus:bg-white outline-none transition-all"
                                                placeholder="Product Name (e.g. Master Power Drill XT)"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Category</label>
                                                <select 
                                                    value={currentProduct.category || 'Tools'}
                                                    onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-xs font-bold text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none transition-all"
                                                >
                                                    {dbCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">SKU Identifier</label>
                                                <input 
                                                    value={currentProduct.sku || ''}
                                                    onChange={e => setCurrentProduct({...currentProduct, sku: e.target.value})}
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-xs font-mono font-bold text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none transition-all"
                                                    placeholder="DNS-XXXXXX"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Brand</label>
                                            <input 
                                                value={currentProduct.brand || ''}
                                                onChange={e => setCurrentProduct({...currentProduct, brand: e.target.value})}
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-xs font-bold text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none transition-all"
                                                placeholder="e.g. Dinanath & Sons, Marathon, Foredom"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Retail Price (₹)</label>
                                                <input 
                                                    type="number"
                                                    required
                                                    min="0"
                                                    value={currentProduct.retail_price ?? ''}
                                                    onChange={e => setCurrentProduct({...currentProduct, retail_price: Number(e.target.value)})}
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-lg font-black text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Inventory Quantity</label>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    value={currentProduct.quantity ?? ''}
                                                    onChange={e => setCurrentProduct({...currentProduct, quantity: Number(e.target.value)})}
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-lg font-black text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Wholesale Price (₹)</label>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    value={currentProduct.wholesale_price ?? ''}
                                                    onChange={e => setCurrentProduct({...currentProduct, wholesale_price: Number(e.target.value)})}
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-sm font-black text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Wholesale MOQ</label>
                                                <input 
                                                    type="number"
                                                    min="1"
                                                    value={currentProduct.wholesale_moq ?? ''}
                                                    onChange={e => setCurrentProduct({...currentProduct, wholesale_moq: Number(e.target.value)})}
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-sm font-black text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 pt-2">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={currentProduct.in_stock !== false}
                                                    onChange={e => setCurrentProduct({...currentProduct, in_stock: e.target.checked})}
                                                    className="w-4 h-4 text-[#966E2E] rounded border-[#E8E2D5]"
                                                />
                                                <span className="text-xs font-bold text-[#18181B]">In Stock & Available</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={Boolean(currentProduct.is_price_on_request)}
                                                    onChange={e => setCurrentProduct({...currentProduct, is_price_on_request: e.target.checked})}
                                                    className="w-4 h-4 text-[#966E2E] rounded border-[#E8E2D5]"
                                                />
                                                <span className="text-xs font-bold text-[#18181B]">Price on Request</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Tab Content: Details --- */}
                            {activeTab === 'details' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Product Description</label>
                                        <textarea 
                                            rows={6}
                                            value={currentProduct.description || ''}
                                            onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})}
                                            className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-xs text-[#18181B] focus:border-[#966E2E] focus:bg-white outline-none transition-all leading-relaxed"
                                            placeholder="Detailed specifications, goldsmith applications, build quality, warranties..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Weight (e.g. 2.5 kg)</label>
                                            <input 
                                                value={currentProduct.weight || ''}
                                                onChange={e => setCurrentProduct({...currentProduct, weight: e.target.value})}
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-3 text-xs text-[#18181B]"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Warranty Info</label>
                                            <input 
                                                value={currentProduct.warranty_info || ''}
                                                onChange={e => setCurrentProduct({...currentProduct, warranty_info: e.target.value})}
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-3 text-xs text-[#18181B]"
                                                placeholder="e.g. 1 Year Manufacturer Warranty"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Model Number</label>
                                            <input 
                                                value={currentProduct.model_number || ''}
                                                onChange={e => setCurrentProduct({...currentProduct, model_number: e.target.value})}
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-3 text-xs text-[#18181B]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Tab Content: Media --- */}
                            {activeTab === 'media' && (
                                <div className="space-y-6">
                                    <div className="p-6 border-2 border-dashed border-[#E8E2D5] rounded-2xl text-center bg-[#FAF9F5]">
                                        <ImageIcon className="mx-auto text-[#A1A1AA] mb-2" size={36} />
                                        <p className="text-xs font-bold text-[#18181B]">Upload Product Images</p>
                                        <p className="text-[10px] text-[#71717A] mt-1">Automatic conversion to WebP format for fast web delivery</p>
                                        <label className="mt-4 inline-block px-6 py-2.5 bg-[#966E2E] hover:bg-[#7D5A25] text-white rounded-xl text-xs font-bold cursor-pointer transition-all">
                                            {uploading ? 'Processing...' : 'Browse Images'}
                                            <input type="file" multiple accept="image/*" onChange={e => handleFileUpload(e, 'gallery')} className="hidden" disabled={uploading} />
                                        </label>
                                    </div>

                                    {/* Gallery preview */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {currentProduct.gallery?.map((item, idx) => (
                                            <div key={item.id} className="relative group bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl overflow-hidden aspect-square">
                                                <img src={item.url} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button type="button" onClick={() => handleDeleteGalleryItem(item.id)} className="p-2 bg-rose-600 text-white rounded-full">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- Tab Content: Variants --- */}
                            {activeTab === 'variants' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-black text-[#18181B] uppercase tracking-wider">Product Variants</h3>
                                        <button 
                                            type="button" 
                                            onClick={addVariant}
                                            className="px-4 py-2 bg-[#966E2E] text-white rounded-xl text-xs font-bold flex items-center gap-2"
                                        >
                                            <Plus size={16} /> Add Variant
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {currentProduct.variants?.map((v, i) => (
                                            <div key={v.id} className="p-4 bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                                <input 
                                                    value={v.name}
                                                    onChange={e => updateVariant(v.id, { name: e.target.value })}
                                                    placeholder="Variant Name (e.g. 2.5mm / Red)"
                                                    className="bg-white border border-[#E8E2D5] rounded-xl p-2.5 text-xs text-[#18181B]"
                                                />
                                                <input 
                                                    type="number"
                                                    value={v.price}
                                                    onChange={e => updateVariant(v.id, { price: Number(e.target.value) })}
                                                    placeholder="Price"
                                                    className="bg-white border border-[#E8E2D5] rounded-xl p-2.5 text-xs text-[#18181B]"
                                                />
                                                <input 
                                                    value={v.sku || ''}
                                                    onChange={e => updateVariant(v.id, { sku: e.target.value })}
                                                    placeholder="SKU"
                                                    className="bg-white border border-[#E8E2D5] rounded-xl p-2.5 text-xs text-[#18181B]"
                                                />
                                                <div className="flex items-center justify-end gap-2">
                                                    <button type="button" onClick={() => removeVariant(v.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- Tab Content: SEO Metadata (Phase 1 Fixes) --- */}
                            {activeTab === 'seo' && (
                                <div className="space-y-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8E2D5] pb-4">
                                        <div>
                                            <h3 className="text-xl font-black text-[#18181B]">Search Engine Optimization (SEO)</h3>
                                            <p className="text-[#71717A] text-[10px] uppercase font-bold tracking-widest mt-0.5">Custom meta titles, descriptions, keyword indexing & Google previews</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGenerateSeoWithAi}
                                            disabled={aiGeneratingSeo}
                                            className="px-5 py-2.5 bg-[#FAF9F5] hover:bg-[#F3EFE6] border border-[#E8E2D5] text-[#966E2E] rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
                                        >
                                            {aiGeneratingSeo ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                            Generate SEO with AI
                                        </button>
                                    </div>

                                    {/* Google SERP Live Snippet Preview */}
                                    <div className="p-5 bg-white border border-[#E8E2D5] rounded-2xl space-y-1.5 shadow-xs">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[#71717A] mb-2 flex items-center gap-1.5">
                                            <Globe size={13} className="text-[#966E2E]" /> Google Search Result Preview
                                        </div>
                                        <div className="text-xs text-[#52525B] font-sans flex items-center gap-1 truncate">
                                            <span>https://dinanathandsons.com</span>
                                            <span className="text-[#A1A1AA]">›</span>
                                            <span>shop</span>
                                            <span className="text-[#A1A1AA]">›</span>
                                            <span className="text-[#966E2E] font-medium">{currentProduct.slug || 'product-slug'}</span>
                                        </div>
                                        <div className="text-base text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
                                            {(currentProduct.meta_title || currentProduct.seo_title || currentProduct.name || 'Product Title')} | Dinanath & Sons
                                        </div>
                                        <div className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                                            {currentProduct.meta_description || currentProduct.seo_description || currentProduct.description || 'Professional jewellery tools and equipment for goldsmith workshops from Dinanath & Sons, Maliwara, Chandni Chowk.'}
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="space-y-6">
                                        {/* URL Slug */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest block">URL Slug</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (currentProduct.name) {
                                                            setCurrentProduct({ ...currentProduct, slug: generateSlugFromName(currentProduct.name) });
                                                        }
                                                    }}
                                                    className="text-[10px] text-[#966E2E] font-bold hover:underline"
                                                >
                                                    Auto-generate from Name
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-[#71717A] font-mono shrink-0">/shop/</span>
                                                <input 
                                                    type="text" 
                                                    value={currentProduct.slug || ''} 
                                                    onChange={e => setCurrentProduct({...currentProduct, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} 
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white rounded-2xl p-3.5 text-xs font-mono text-[#18181B]" 
                                                    placeholder="e.g. wire-drawing-rolling-mill-dns-1002" 
                                                />
                                            </div>
                                            {isSlugDuplicate(currentProduct.slug || '') && (
                                                <p className="text-xs text-rose-600 font-bold flex items-center gap-1.5 mt-1">
                                                    <AlertCircle size={14} /> Warning: This slug is already used by another active product!
                                                </p>
                                            )}
                                            {isEditing && originalSlug && currentProduct.slug && currentProduct.slug !== originalSlug && (
                                                <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-1">
                                                    ℹ️ Slug changed: Saving will automatically create a 301 permanent redirect from <code className="font-mono">/shop/{originalSlug}</code> to <code className="font-mono">/shop/{currentProduct.slug}</code> so external links do not break.
                                                </p>
                                            )}
                                        </div>

                                        {/* Meta Title */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest block">Meta Title</label>
                                                <span className={`text-[10px] font-mono font-bold ${titleLength >= 50 && titleLength <= 60 ? 'text-emerald-600' : titleLength > 60 ? 'text-rose-600' : 'text-[#71717A]'}`}>
                                                    {titleLength} / 60 chars {titleLength >= 50 && titleLength <= 60 ? '✓ Ideal' : '(50-60 recommended)'}
                                                </span>
                                            </div>
                                            <input 
                                                type="text" 
                                                value={currentProduct.meta_title || currentProduct.seo_title || ''} 
                                                onChange={e => setCurrentProduct({
                                                    ...currentProduct, 
                                                    meta_title: e.target.value,
                                                    seo_title: e.target.value
                                                })} 
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white rounded-2xl p-4 text-xs text-[#18181B]" 
                                                placeholder="e.g. Buy Premium Rolling Mill Machine | Dinanath & Sons" 
                                            />
                                        </div>

                                        {/* Meta Description */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest block">Meta Description</label>
                                                <span className={`text-[10px] font-mono font-bold ${descLength >= 140 && descLength <= 160 ? 'text-emerald-600' : descLength > 160 ? 'text-rose-600' : 'text-[#71717A]'}`}>
                                                    {descLength} / 160 chars {descLength >= 140 && descLength <= 160 ? '✓ Ideal' : '(140-160 recommended)'}
                                                </span>
                                            </div>
                                            <textarea 
                                                rows={3} 
                                                value={currentProduct.meta_description || currentProduct.seo_description || ''} 
                                                onChange={e => setCurrentProduct({
                                                    ...currentProduct, 
                                                    meta_description: e.target.value,
                                                    seo_description: e.target.value
                                                })} 
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white rounded-2xl p-4 text-xs text-[#18181B] leading-relaxed" 
                                                placeholder="Provide an informative search snippet summarizing features, material grade, and applications..." 
                                            />
                                        </div>

                                        {/* Keywords */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest block">Meta Keywords (comma-separated)</label>
                                            <input 
                                                type="text" 
                                                value={currentProduct.meta_keywords || currentProduct.seo_keywords || ''} 
                                                onChange={e => setCurrentProduct({
                                                    ...currentProduct, 
                                                    meta_keywords: e.target.value,
                                                    seo_keywords: e.target.value
                                                })} 
                                                className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white rounded-2xl p-4 text-xs text-[#18181B]" 
                                                placeholder="rolling mill, jewellery tools, goldsmith equipment, Maliwara Delhi wholesale" 
                                            />
                                        </div>

                                        {/* Advanced Canonical & OG */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest block">Canonical URL Override (Optional)</label>
                                                <input 
                                                    type="url" 
                                                    value={currentProduct.canonical_url || ''} 
                                                    onChange={e => setCurrentProduct({...currentProduct, canonical_url: e.target.value})} 
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white rounded-2xl p-3 text-xs text-[#18181B]" 
                                                    placeholder="https://dinanathandsons.com/shop/..." 
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest block">Open Graph Image URL (Optional)</label>
                                                <input 
                                                    type="url" 
                                                    value={currentProduct.og_image_url || ''} 
                                                    onChange={e => setCurrentProduct({...currentProduct, og_image_url: e.target.value})} 
                                                    className="w-full bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] focus:bg-white rounded-2xl p-3 text-xs text-[#18181B]" 
                                                    placeholder="https://..." 
                                                />
                                            </div>
                                        </div>

                                        {/* Noindex Toggle */}
                                        <div className="pt-2">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input 
                                                    type="checkbox"
                                                    checked={Boolean(currentProduct.noindex)}
                                                    onChange={e => setCurrentProduct({...currentProduct, noindex: e.target.checked})}
                                                    className="w-4 h-4 text-[#966E2E] rounded border-[#E8E2D5]"
                                                />
                                                <div>
                                                    <span className="text-xs font-bold text-[#18181B] block">Hide from Search Engines (noindex)</span>
                                                    <span className="text-[10px] text-[#71717A] block">Instructs Google and search bots not to index this product page.</span>
                                                </div>
                                            </label>
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
                                    className="px-12 py-3 bg-[#966E2E] hover:bg-[#7D5A25] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-sm transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                                >
                                    {formLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    {isEditing ? 'Sync Changes' : 'Initialize Listing'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
