'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { initialBlogPosts, BlogPost } from '@/lib/data';
import { Plus, Edit2, Trash2, Search, FileText, CheckCircle2, XCircle, Eye, Calendar, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Modal State for New/Edit Post
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'Guides & Engineering',
        author: 'Dinanath Technical Editorial',
        readTime: '5 min read',
        image: '/blog-1.jpg',
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
                    excerpt: p.excerpt,
                    content: p.content,
                    date: new Date(p.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    category: p.category || 'Guides',
                    author: p.author || 'Dinanath Editorial',
                    readTime: p.read_time || '5 min read',
                    image: p.image || '/blog-1.jpg'
                }));
                setPosts(dbPosts);
            } else {
                setPosts(initialBlogPosts);
            }
        } catch (err) {
            console.error('Failed to load blog posts:', err);
            setPosts(initialBlogPosts);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (post?: BlogPost) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title,
                excerpt: post.excerpt,
                content: post.content || '',
                category: post.category,
                author: post.author,
                readTime: post.readTime,
                image: post.image,
                isPublished: true
            });
        } else {
            setEditingPost(null);
            setFormData({
                title: '',
                excerpt: '',
                content: '',
                category: 'Guides & Engineering',
                author: 'Dinanath Technical Editorial',
                readTime: '5 min read',
                image: '/blog-1.jpg',
                isPublished: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSavePost = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingPost) {
                // Update
                const { error } = await supabase
                    .from('blog_posts')
                    .update({
                        title: formData.title,
                        excerpt: formData.excerpt,
                        content: formData.content,
                        category: formData.category,
                        author: formData.author,
                        read_time: formData.readTime,
                        image: formData.image
                    })
                    .eq('id', editingPost.id);

                const updated = posts.map(p => p.id === editingPost.id ? { ...p, ...formData } : p);
                setPosts(updated);
            } else {
                // Create
                const newId = `blog-${Date.now()}`;
                const { error } = await supabase
                    .from('blog_posts')
                    .insert({
                        id: newId,
                        title: formData.title,
                        excerpt: formData.excerpt,
                        content: formData.content,
                        category: formData.category,
                        author: formData.author,
                        read_time: formData.readTime,
                        image: formData.image
                    });

                const newPost: BlogPost = {
                    id: newId,
                    title: formData.title,
                    excerpt: formData.excerpt,
                    content: formData.content,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    category: formData.category,
                    author: formData.author,
                    readTime: formData.readTime,
                    image: formData.image
                };
                setPosts([newPost, ...posts]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving blog post:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            await supabase.from('blog_posts').delete().eq('id', id);
            setPosts(posts.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting post:', err);
        }
    };

    const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))];

    const filteredPosts = posts.filter(p => {
        const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
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
                    <p className="text-xs text-[#8E8E9A] font-bold uppercase tracking-widest mt-1">Create, edit, and publish technical guides & news for Dinanath & Sons</p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="h-12 px-6 rounded-xl bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 shadow-md cursor-pointer border-none"
                >
                    <Plus size={16} strokeWidth={3} />
                    <span>Create New Article</span>
                </button>
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
                                    ? 'bg-[#A67C35] text-black'
                                    : 'bg-[#151515] text-[#8E8E9A] hover:text-[#F8F3E8] border border-[#343434]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Articles Table Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                    <div key={post.id} className="bg-[#1E1E1E] border border-[#343434] hover:border-[#A67C35] rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg transition-all">
                        <div className="relative h-44 bg-[#151515] overflow-hidden">
                            <img src={post.image || '/placeholder.jpg'} alt={post.title} className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-[#151515]/90 border border-[#343434] text-[#A67C35] text-[8px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded">
                                {post.category}
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-[9px] text-[#8E8E9A] font-mono uppercase font-bold mb-2">
                                    <Calendar size={12} /> {post.date} • {post.readTime}
                                </div>
                                <h3 className="font-bold text-[#F8F3E8] text-sm uppercase leading-snug line-clamp-2 mb-2">{post.title}</h3>
                                <p className="text-xs text-[#CFCFCF] line-clamp-3 font-normal leading-relaxed">{post.excerpt}</p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-[#343434] flex items-center justify-between">
                                <span className="text-[8.5px] font-mono text-[#8E8E9A] uppercase font-bold truncate max-w-[150px]">{post.author}</span>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleOpenModal(post)}
                                        className="w-8 h-8 rounded-lg bg-[#151515] border border-[#343434] text-[#A67C35] hover:bg-[#A67C35] hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <Edit2 size={13} />
                                    </button>

                                    <button
                                        onClick={() => handleDeletePost(post.id)}
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
                            className="relative w-full max-w-2xl bg-[#1E1E1E] border border-[#343434] rounded-2xl p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <h2 className="text-xl font-black text-[#F8F3E8] uppercase tracking-wider mb-6 pb-3 border-b border-[#343434] flex items-center gap-2">
                                <Sparkles className="text-[#A67C35]" size={20} />
                                {editingPost ? 'Edit Blog Article' : 'Publish New Technical Article'}
                            </h2>

                            <form onSubmit={handleSavePost} className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">Article Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Master Gold Casting Techniques & Temperature Parameters"
                                        className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">Category</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="e.g. Guides, Machinery, Maintenance"
                                            className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">Author</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.author}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            placeholder="e.g. Dinanath Technical Editorial"
                                            className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">Read Time</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.readTime}
                                            onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                                            placeholder="e.g. 5 min read"
                                            className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">Image URL</label>
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            placeholder="/blog-1.jpg or image URL"
                                            className="w-full h-11 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">Excerpt (Short Summary)</label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={formData.excerpt}
                                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                        placeholder="Brief technical summary displayed on blog catalog cards..."
                                        className="w-full bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl p-3 text-xs text-[#F8F3E8] font-medium focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest block mb-1.5">Full Article Content (Markdown / HTML)</label>
                                    <textarea
                                        required
                                        rows={8}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Full article content body..."
                                        className="w-full bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl p-3 text-xs text-[#F8F3E8] font-mono focus:outline-none"
                                    />
                                </div>

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
                                        className="px-6 py-2.5 rounded-xl bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold text-xs uppercase tracking-wider shadow-md border-none cursor-pointer"
                                    >
                                        {editingPost ? 'Update Article' : 'Publish Article'}
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
