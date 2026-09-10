'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { BLOG_POSTS, BlogPost } from '@/lib/blog-data';
import { toBlogSlug } from '@/lib/blog';
import { convertToWebP } from '@/lib/image-utils';
import { 
    Plus, Edit2, Trash2, Search, FileText, CheckCircle2, XCircle, Eye, 
    Calendar, Sparkles, Image as ImageIcon, Upload, Loader2, X, 
    ExternalLink, Tag, Clock, User, Check, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Modal State for New/Edit Post
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showDirectUrlInput, setShowDirectUrlInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Guides',
        author: 'Dinanath Technical Editorial',
        authorRole: 'Technical Editorial',
        readTime: '5 min read',
        image: '',
        tags: 'Tools, Machinery, Goldsmithing',
        isPublished: true
    });

    useEffect(() => {
        fetchBlogPosts();
    }, []);

    const fetchBlogPosts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && data.length > 0 && !error) {
                const dbPosts: BlogPost[] = data.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    excerpt: p.excerpt || '',
                    content: p.content || '',
                    date: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
                    category: p.category || 'Guides',
                    author: p.author || 'Dinanath Technical Editorial',
                    authorRole: p.author_role || 'Technical Editorial',
                    readTime: p.read_time || '5 min read',
                    image: p.image || '/blog-1.jpg',
                    tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : ['Tools']),
                    isPublished: p.is_published !== false
                }));
                setPosts(dbPosts);
            } else {
                setPosts(BLOG_POSTS);
            }
        } catch (err) {
            console.warn('Failed to load blog posts from DB, using defaults:', err);
            setPosts(BLOG_POSTS);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (post?: BlogPost) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title,
                slug: post.id,
                excerpt: post.excerpt,
                content: post.content || '',
                category: post.category,
                author: post.author,
                authorRole: post.authorRole || 'Technical Editorial',
                readTime: post.readTime,
                image: post.image,
                tags: Array.isArray(post.tags) ? post.tags.join(', ') : 'Tools, Goldsmithing',
                isPublished: post.isPublished !== false
            });
            setShowDirectUrlInput(Boolean(post.image && post.image.startsWith('http') && !post.image.includes('supabase')));
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                category: 'Guides',
                author: 'Dinanath Technical Editorial',
                authorRole: 'Technical Editorial',
                readTime: '5 min read',
                image: '',
                tags: 'Tools, Machinery, Goldsmithing',
                isPublished: true
            });
            setShowDirectUrlInput(false);
        }
        setIsModalOpen(true);
    };

    // Auto-calculate read time based on word count
    const calculateReadTime = (content: string) => {
        const text = content.replace(/<[^>]*>/g, ' ');
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(1, Math.ceil(words / 200));
        return `${minutes} min read`;
    };

    const handleTitleChange = (title: string) => {
        setFormData(prev => ({
            ...prev,
            title,
            slug: !editingPost || prev.slug === toBlogSlug(prev.title) ? toBlogSlug(title) : prev.slug
        }));
    };

    // --- Direct Image Upload Handler ---
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            let fileToUpload = file;
            if (file.type.startsWith('image/') && file.type !== 'image/gif') {
                try {
                    fileToUpload = await convertToWebP(file);
                } catch (convErr) {
                    console.warn('WebP conversion fallback to original:', convErr);
                }
            }

            const fileExt = fileToUpload.name.split('.').pop() || 'webp';
            const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `blog-media/${fileName}`;

            // Upload to Supabase 'products' bucket which is already set up and accessible
            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, fileToUpload);

            if (uploadError) {
                // If storage bucket upload fails due to RLS, try data URL as client-side fallback
                console.warn('Storage upload error, attempting data URL preview:', uploadError);
                const reader = new FileReader();
                reader.onload = () => {
                    setFormData(prev => ({ ...prev, image: reader.result as string }));
                };
                reader.readAsDataURL(fileToUpload);
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, image: publicUrl }));
        } catch (err: any) {
            alert('Image upload error: ' + err.message + '\nNote: Run database_scripts/blog_setup.sql in your Supabase SQL Editor if storage permissions need refreshing.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSavePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const slug = formData.slug.trim() || toBlogSlug(formData.title) || `blog-${Date.now()}`;
        const tagsArray = formData.tags
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);

        const payload: any = {
            id: editingPost ? editingPost.id : slug,
            title: formData.title,
            slug: slug,
            excerpt: formData.excerpt,
            content: formData.content,
            category: formData.category,
            author: formData.author,
            author_role: formData.authorRole,
            read_time: formData.readTime || calculateReadTime(formData.content),
            image: formData.image || '/blog-1.jpg',
            tags: tagsArray,
            is_published: formData.isPublished,
            updated_at: new Date().toISOString()
        };

        try {
            let saveError = null;
            if (editingPost) {
                const { error } = await supabase
                    .from('blog_posts')
                    .update(payload)
                    .eq('id', editingPost.id);
                saveError = error;
            } else {
                const { error } = await supabase
                    .from('blog_posts')
                    .insert([payload]);
                saveError = error;
            }

            if (saveError) {
                console.warn('Supabase DB save note:', saveError.message);
                if (saveError.code === 'PGRST205' || saveError.message?.includes('schema cache')) {
                    alert('Note: The "blog_posts" table does not exist in Supabase yet. Please run database_scripts/blog_setup.sql in your Supabase SQL Editor to permanently sync with the cloud database. We will save it locally in the meantime.');
                } else {
                    throw saveError;
                }
            }

            // Update local state
            const updatedPost: BlogPost = {
                id: payload.slug || payload.id,
                title: payload.title,
                excerpt: payload.excerpt,
                content: payload.content,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                category: payload.category,
                author: payload.author,
                authorRole: payload.author_role,
                readTime: payload.read_time,
                image: payload.image,
                tags: payload.tags,
                isPublished: payload.is_published
            };

            if (editingPost) {
                setPosts(posts.map(p => p.id === editingPost.id ? updatedPost : p));
            } else {
                setPosts([updatedPost, ...posts.filter(p => p.id !== updatedPost.id)]);
            }

            setIsModalOpen(false);
            fetchBlogPosts();
        } catch (err: any) {
            alert('Error saving blog post: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            const { error } = await supabase.from('blog_posts').delete().eq('id', id);
            if (error) console.warn('DB delete note:', error);
            setPosts(posts.filter(p => p.id !== id));
        } catch (err: any) {
            alert('Error deleting post: ' + err.message);
        }
    };

    const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))];

    const filteredPosts = posts.filter(p => {
        const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesQuery && matchesCat;
    });

    return (
        <div className="space-y-8">
            {/* Header Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1E1E] p-6 rounded-2xl border border-[#343434] shadow-lg">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#F8F3E8] uppercase tracking-wider flex items-center gap-3">
                        <FileText className="text-[#A67C35]" size={28} /> Blog CMS & Editorial Suite
                    </h1>
                    <p className="text-xs text-[#8E8E9A] font-bold uppercase tracking-widest mt-1">
                        Create, upload media, and publish technical guides & news for Dinanath & Sons
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/blog"
                        target="_blank"
                        className="h-12 px-5 rounded-xl bg-[#151515] hover:bg-[#252525] text-[#F8F3E8] font-bold uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 border border-[#343434]"
                    >
                        <Eye size={15} />
                        <span>View Live Blog</span>
                    </Link>

                    <button
                        onClick={() => handleOpenModal()}
                        className="h-12 px-6 rounded-xl bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-md cursor-pointer border-none"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span>Create New Article</span>
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1E1E1E] p-4 rounded-xl border border-[#343434]">
                <div className="relative w-full sm:w-80">
                    <Search size={16} className="absolute left-4 top-3.5 text-[#8E8E9A]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search blog articles..."
                        className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl pl-11 pr-4 text-xs text-[#F8F3E8] font-bold placeholder-[#8E8E9A] focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-2 rounded-lg text-[9.5px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                selectedCategory === cat
                                    ? 'bg-[#A67C35] text-black font-black'
                                    : 'bg-[#151515] text-[#8E8E9A] hover:text-[#F8F3E8] border border-[#343434]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                    <div key={post.id} className="bg-[#1E1E1E] border border-[#343434] hover:border-[#A67C35] rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg transition-all group">
                        <div className="relative h-48 bg-[#151515] overflow-hidden">
                            <img 
                                src={post.image || '/placeholder.jpg'} 
                                alt={post.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="absolute top-3 left-3 bg-[#151515]/90 backdrop-blur-sm border border-[#343434] text-[#A67C35] text-[8px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                                {post.category}
                            </div>
                            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-[8px] font-mono font-bold uppercase px-2 py-1 rounded flex items-center gap-1">
                                {post.isPublished !== false ? (
                                    <span className="text-green-400 flex items-center gap-1">
                                        <CheckCircle2 size={10} /> Published
                                    </span>
                                ) : (
                                    <span className="text-amber-400 flex items-center gap-1">
                                        <AlertCircle size={10} /> Draft
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-[9px] text-[#8E8E9A] font-mono uppercase font-bold mb-2">
                                    <Calendar size={12} /> {post.date} • <Clock size={12} /> {post.readTime}
                                </div>
                                <h3 className="font-bold text-[#F8F3E8] text-sm uppercase leading-snug line-clamp-2 mb-2 group-hover:text-[#A67C35] transition-colors">
                                    {post.title}
                                </h3>
                                <p className="text-xs text-[#CFCFCF] line-clamp-3 font-normal leading-relaxed mb-4">
                                    {post.excerpt}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-[#343434] flex items-center justify-between">
                                <span className="text-[8.5px] font-mono text-[#8E8E9A] uppercase font-bold truncate max-w-[130px]">
                                    {post.author}
                                </span>
                                
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/blog/${post.id}`}
                                        target="_blank"
                                        title="View Live Article"
                                        className="w-8 h-8 rounded-lg bg-[#151515] border border-[#343434] text-gray-300 hover:text-white hover:bg-gray-800 flex items-center justify-center transition-colors"
                                    >
                                        <ExternalLink size={13} />
                                    </Link>

                                    <button
                                        onClick={() => handleOpenModal(post)}
                                        title="Edit Article"
                                        className="w-8 h-8 rounded-lg bg-[#151515] border border-[#343434] text-[#A67C35] hover:bg-[#A67C35] hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <Edit2 size={13} />
                                    </button>

                                    <button
                                        onClick={() => handleDeletePost(post.id)}
                                        title="Delete Article"
                                        className="w-8 h-8 rounded-lg bg-[#151515] border border-[#343434] text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form for Article Create/Edit */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-3xl bg-[#1E1E1E] border border-[#343434] rounded-2xl p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#343434]">
                                <h2 className="text-xl font-black text-[#F8F3E8] uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="text-[#A67C35]" size={20} />
                                    {editingPost ? 'Edit Blog Article' : 'Publish New Technical Article'}
                                </h2>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSavePost} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">
                                        Article Title
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleTitleChange(e.target.value)}
                                        placeholder="e.g. Master Gold Casting Techniques & Temperature Parameters"
                                        className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] focus:outline-none"
                                    />
                                </div>

                                {/* URL Slug & Category */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">
                                            URL Slug (Auto-generated)
                                        </label>
                                        <div className="flex items-center bg-[#151515] border border-[#343434] rounded-xl px-3 focus-within:border-[#A67C35]">
                                            <span className="text-[10px] text-gray-500 font-mono">/blog/</span>
                                            <input
                                                required
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => setFormData({ ...formData, slug: toBlogSlug(e.target.value) })}
                                                placeholder="article-slug"
                                                className="w-full h-11 bg-transparent text-xs font-mono text-[#F8F3E8] focus:outline-none pl-1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">
                                            Category
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="e.g. Guides, Technical, Metallurgy"
                                            className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* --- DIRECT COVER IMAGE UPLOAD (KEY REQUIREMENT) --- */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest">
                                            Article Cover Photo (Upload Directly)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowDirectUrlInput(!showDirectUrlInput)}
                                            className="text-[9px] font-mono text-[#A67C35] hover:underline uppercase"
                                        >
                                            {showDirectUrlInput ? 'Hide URL input' : 'Or enter image link'}
                                        </button>
                                    </div>

                                    {/* Upload Dropzone / Image Preview */}
                                    <div className="space-y-3">
                                        {formData.image ? (
                                            <div className="relative rounded-2xl overflow-hidden border border-[#343434] bg-[#151515] p-3 flex flex-col sm:flex-row items-center gap-4">
                                                <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden bg-black shrink-0 border border-gray-800">
                                                    <img 
                                                        src={formData.image} 
                                                        alt="Cover preview" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>

                                                <div className="flex-1 space-y-2 text-center sm:text-left">
                                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                                        <span className="text-[10px] font-bold text-green-400 bg-green-950/40 border border-green-800/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Check size={11} /> Photo Selected
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 font-mono truncate max-w-sm">
                                                        {formData.image}
                                                    </p>
                                                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={uploadingImage}
                                                            className="px-3 py-1.5 rounded-lg bg-[#A67C35] hover:bg-[#8A6232] text-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                                                        >
                                                            <Upload size={12} /> Change Photo
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                            className="px-3 py-1.5 rounded-lg bg-red-900/20 hover:bg-red-900/40 text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border border-red-800/30"
                                                        >
                                                            <X size={12} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-[#343434] hover:border-[#A67C35] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-[#151515]/50 hover:bg-[#151515] transition-all group"
                                            >
                                                {uploadingImage ? (
                                                    <div className="flex flex-col items-center gap-2 py-4">
                                                        <Loader2 size={32} className="animate-spin text-[#A67C35]" />
                                                        <span className="text-xs font-bold text-white uppercase tracking-wider">Compressing & Uploading WebP...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-14 h-14 rounded-2xl bg-[#1E1E1E] group-hover:bg-[#A67C35]/10 flex items-center justify-center mb-3 transition-colors">
                                                            <Upload size={24} className="text-[#8E8E9A] group-hover:text-[#A67C35]" />
                                                        </div>
                                                        <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                                                            Click to Upload Cover Image
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 font-bold">
                                                            PNG, JPG, or WebP. Auto-converts to optimized WebP.
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* Hidden File Input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />

                                        {/* Optional Direct URL Input if toggled */}
                                        {showDirectUrlInput && (
                                            <div className="pt-2">
                                                <input
                                                    type="text"
                                                    value={formData.image}
                                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                    placeholder="Or paste direct image URL (e.g. https://... or /blog-1.jpg)"
                                                    className="w-full h-10 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-mono text-[#F8F3E8] focus:outline-none"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Author, Role, Read Time */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">
                                            Author Name
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.author}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            placeholder="e.g. Dinanath Technical Team"
                                            className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">
                                            Author Title / Role
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.authorRole}
                                            onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                                            placeholder="e.g. Technical Director"
                                            className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">
                                            Read Time
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                required
                                                type="text"
                                                value={formData.readTime}
                                                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                                                placeholder="e.g. 5 min read"
                                                className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, readTime: calculateReadTime(prev.content) }))}
                                                className="h-11 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-[9px] font-bold uppercase whitespace-nowrap"
                                                title="Auto-calculate read time"
                                            >
                                                Auto
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tags & Publishing Status */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                    <div className="sm:col-span-2">
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">
                                            Tags (Comma Separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            placeholder="e.g. Tools, Casting, Maintenance"
                                            className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block">
                                            Publication Status
                                        </label>
                                        <div 
                                            onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
                                            className="h-11 bg-[#151515] border border-[#343434] rounded-xl px-4 flex items-center justify-between cursor-pointer hover:border-gray-600 transition-colors"
                                        >
                                            <span className="text-xs font-bold text-white">
                                                {formData.isPublished ? 'Published Live' : 'Draft / Hidden'}
                                            </span>
                                            <div className={`w-8 h-4 rounded-full relative transition-colors ${formData.isPublished ? 'bg-green-600' : 'bg-gray-700'}`}>
                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.isPublished ? 'left-4.5' : 'left-0.5'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Excerpt */}
                                <div>
                                    <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">
                                        Excerpt (Summary for Previews)
                                    </label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        placeholder="Brief technical summary displayed on blog catalog cards..."
                                        className="w-full bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl p-3 text-xs text-[#F8F3E8] font-medium focus:outline-none"
                                    />
                                </div>

                                {/* Full Content */}
                                <div>
                                    <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">
                                        Full Article Body (HTML or Markdown)
                                    </label>
                                    <textarea
                                        required
                                        rows={10}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Full article content body... Supports <h3>, <p>, <blockquote>, <ul>, <li> or Markdown."
                                        className="w-full bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl p-4 text-xs text-[#F8F3E8] font-mono focus:outline-none leading-relaxed"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#343434]">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 rounded-xl border border-[#343434] text-[#8E8E9A] hover:text-[#F8F3E8] font-bold text-xs uppercase tracking-wider"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || uploadingImage}
                                        className="px-6 py-2.5 rounded-xl bg-[#A67C35] hover:bg-[#8A6232] disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider shadow-md border-none cursor-pointer flex items-center gap-2"
                                    >
                                        {loading && <Loader2 size={14} className="animate-spin" />}
                                        <span>{editingPost ? 'Update Article' : 'Publish Article'}</span>
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
