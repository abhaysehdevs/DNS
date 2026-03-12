'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, User, ArrowRight, Search, Clock, Tag, Mail } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '@/lib/blog-data';

export default function Blog() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');

    // Extract unique categories
    const categories = ['All', ...Array.from(new Set(BLOG_POSTS.map(post => post.category)))];

    // Filter posts
    const filteredPosts = useMemo(() => {
        return BLOG_POSTS.filter((post) => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    // Featured post (first one for now)
    const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
    const regularPosts = filteredPosts.slice(featuredPost ? 1 : 0);

    return (
        <div className="min-h-screen bg-[#020202] text-white pt-24 pb-20 selection:bg-amber-500/30">
            {/* Header / Hero */}
            <div className="container mx-auto px-4 md:px-6 mb-16">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-bold mb-6 uppercase tracking-widest"
                    >
                        Journal & Insights
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
                    >
                        Mastering <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">The Craft.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg md:text-xl leading-relaxed"
                    >
                        Discover expert tutorials, industry news, and cutting-edge machinery guides curated by Dinanath & Sons for jewelry professionals.
                    </motion.p>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-6">

                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md sticky top-24 z-30">

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all ${activeCategory === category ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-black/50 text-gray-400 hover:text-white hover:bg-white/10'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-gray-600"
                        />
                    </div>
                </div>

                {/* Content Area */}
                <div className="min-h-[600px]">
                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-32 bg-white/5 rounded-3xl border border-white/10">
                            <h3 className="text-2xl font-bold text-white mb-2">No articles found</h3>
                            <p className="text-gray-500">Try adjusting your search or category filter.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                                className="mt-6 text-amber-500 font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Featured Post (if trying to view all or specifically matching the first) */}
                            {featuredPost && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-12"
                                >
                                    <Link href={`/blog/${featuredPost.id}`} className="group block relative rounded-3xl overflow-hidden bg-gray-900 border border-white/10 hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(245,158,11,0.1)]">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
                                            <div className="relative h-64 lg:h-full overflow-hidden">
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                                                <img
                                                    src={featuredPost.image}
                                                    alt={featuredPost.title}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                                />
                                            </div>
                                            <div className="p-8 md:p-12 flex flex-col justify-center relative bg-[url('/images/noise.png')] bg-repeat opacity-95">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <span className="bg-amber-500 text-black text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
                                                        {featuredPost.category}
                                                    </span>
                                                    <span className="text-amber-500 font-black text-xl leading-none">•</span>
                                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                        <Clock size={12} /> {featuredPost.readTime}
                                                    </span>
                                                </div>

                                                <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight group-hover:text-amber-500 transition-colors">
                                                    {featuredPost.title}
                                                </h2>

                                                <p className="text-gray-400 text-lg mb-8 leading-relaxed line-clamp-3">
                                                    {featuredPost.excerpt}
                                                </p>

                                                <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-white border border-white/10">
                                                            {featuredPost.author.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">{featuredPost.author}</p>
                                                            <p className="text-xs text-gray-500">{featuredPost.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black group-hover:border-amber-500 transition-all group-hover:rotate-45">
                                                        <ArrowRight size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            )}

                            {/* Regular Posts Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {regularPosts.map((post, i) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                            key={post.id}
                                        >
                                            <Link href={`/blog/${post.id}`} className="group flex flex-col h-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)]">

                                                <div className="aspect-[16/10] relative overflow-hidden bg-gray-900 shrink-0">
                                                    <img
                                                        src={post.image}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                                                    <div className="absolute top-4 left-4">
                                                        <span className="bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                                                            {post.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-6 md:p-8 flex flex-col flex-1 relative">
                                                    <h3 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-amber-500 transition-colors leading-snug line-clamp-2">
                                                        {post.title}
                                                    </h3>

                                                    <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                                                        {post.excerpt}
                                                    </p>

                                                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-widest">
                                                            <Calendar size={14} className="text-amber-500" />
                                                            {post.date}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest flex items-center gap-1.5">
                                                            <Clock size={14} className="text-amber-500" />
                                                            {post.readTime}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>

                {/* Newsletter Box */}
                <div className="mt-24 p-8 md:p-12 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent relative overflow-hidden text-center max-w-4xl mx-auto">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 blur-[100px] rounded-full pointer-events-none" />
                    <Mail size={40} className="mx-auto text-amber-500 mb-6" />
                    <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Stay at the Forefront</h3>
                    <p className="text-gray-400 max-w-lg mx-auto mb-8 text-lg">
                        Get the latest metallurgical insights, machinery reviews, and exclusive factory tours delivered directly to your inbox.
                    </p>

                    <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Your email address"
                            required
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-400 text-black font-black px-8 py-4 rounded-xl transition-colors whitespace-nowrap"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
