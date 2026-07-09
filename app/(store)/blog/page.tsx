'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowRight, Search, Clock, Tag, Mail, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '@/lib/blog-data';

export default function Blog() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const categories = ['All', ...Array.from(new Set(BLOG_POSTS.map(post => post.category)))];

    const filteredPosts = useMemo(() => {
        return BLOG_POSTS.filter((post) => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory]);

    const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
    const regularPosts = filteredPosts.slice(featuredPost ? 1 : 0);

    return (
        <div className="min-h-screen bg-surface-2 text-text-primary pt-32 md:pt-48 pb-24 noise-overlay selection:bg-gold-primary/30 overflow-x-hidden blueprint-grid">
            
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[-5%] w-[40%] h-[40%] bg-gold-primary/5 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                
                {/* Header */}
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-gold text-gold-primary text-[9px] font-black uppercase tracking-[0.3em] mb-10"
                    >
                        <Sparkles size={14} /> Industrial Journal
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black mb-8 tracking-tighter uppercase leading-[0.85]"
                    >
                        Mastering <br />
                        <span className="bg-gradient-to-r from-text-primary to-gold-primary bg-clip-text text-transparent">The Craft</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-medium"
                    >
                        Deep-dive technical analysis, metallurgical insights, and factory engineering protocols for the jewelry elite.
                    </motion.p>
                </div>

                {/* Control Bar */}
                <div className="flex flex-col lg:flex-row gap-8 justify-between items-center mb-16 glass-strong p-4 rounded-[2.5rem] border border-glass-border sticky top-32 z-30">
                    <div className="flex gap-3 overflow-x-auto w-full lg:w-auto pb-4 lg:pb-0 scrollbar-hide px-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 cursor-pointer ${activeCategory === category ? 'glass-gold text-gold-primary shadow-xl' : 'glass text-text-secondary hover:text-text-primary hover:bg-surface-1/50'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full lg:w-[400px] group px-2">
                        <Search className={`absolute left-8 top-1/2 -translate-y-1/2 transition-all duration-500 ${searchQuery ? 'text-gold-primary' : 'text-text-tertiary'}`} size={18} />
                        <input
                            type="text"
                            placeholder="Query knowledge base..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 glass rounded-2xl pl-16 pr-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-primary focus:outline-none focus:border-gold-primary/30 transition-all placeholder-text-tertiary/40"
                        />
                    </div>
                </div>

                {/* Posts Area */}
                <div className="min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {filteredPosts.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="text-center py-32 glass rounded-[3rem] border-dashed border-glass-border"
                            >
                                <Zap size={48} className="mx-auto text-text-tertiary mb-8" />
                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-4">No matching insights found</h3>
                                <p className="text-text-secondary font-medium uppercase text-[10px] tracking-[0.2em]">Adjust your query parameters to find technical data</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                                    className="mt-8 text-gold-primary font-black uppercase text-[10px] tracking-[0.3em] hover:opacity-70 transition-opacity cursor-pointer"
                                >
                                    Reset Protocol
                                </button>
                            </motion.div>
                        ) : (
                            <div className="space-y-12">
                                {/* Featured Post */}
                                {featuredPost && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="perspective-2000"
                                    >
                                        <Link href={`/blog/${featuredPost.id}`} className="group block relative rounded-[3rem] overflow-hidden glass-strong border border-glass-border hover:border-gold-primary/30 transition-all duration-700 hover:shadow-[0_40px_100px_rgba(0,0,0,0.5)] glow-gold-hover">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                                                <div className="relative h-80 lg:h-auto overflow-hidden">
                                                    <div className="absolute inset-0 bg-surface-1/20 group-hover:bg-transparent transition-colors z-10" />
                                                    <img
                                                        src={featuredPost.image}
                                                        alt={featuredPost.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
                                                    />
                                                    <div className="absolute top-10 left-10 z-20">
                                                        <span className="glass-gold text-gold-primary text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.3em] shadow-xl">
                                                            Featured Content
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-10 md:p-16 flex flex-col justify-center relative">
                                                    <div className="flex items-center gap-4 mb-8">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-primary">{featuredPost.category}</span>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-glass-border" />
                                                        <span className="text-[9px] text-text-secondary font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <Clock size={14} /> {featuredPost.readTime}
                                                        </span>
                                                    </div>

                                                    <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[0.9] uppercase tracking-tighter group-hover:text-[#C9A84C] transition-colors duration-500">
                                                        {featuredPost.title}
                                                    </h2>

                                                    <p className="text-text-secondary text-lg mb-10 leading-relaxed font-medium line-clamp-3">
                                                        {featuredPost.excerpt}
                                                     </p>

                                                     <div className="mt-auto flex items-center justify-between pt-10 border-t border-glass-border">
                                                         <div className="flex items-center gap-4">
                                                             <div className="w-12 h-12 rounded-2xl glass-gold flex items-center justify-center font-black text-[#0A0A0F] text-sm">
                                                                 {featuredPost.author.charAt(0)}
                                                             </div>
                                                             <div>
                                                                 <p className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">{featuredPost.author}</p>
                                                                 <p className="text-[9px] text-text-secondary font-black uppercase tracking-[0.2em] mt-1">{featuredPost.date}</p>
                                                             </div>
                                                         </div>
                                                         <div className="w-16 h-16 rounded-full glass flex items-center justify-center group-hover:bg-gold-primary group-hover:text-[#0A0A0F] transition-all duration-500 group-hover:rotate-45">
                                                             <ArrowRight size={24} />
                                                         </div>
                                                     </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                )}

                                {/* Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {regularPosts.map((post, i) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <Link href={`/blog/${post.id}`} className="group flex flex-col h-full glass rounded-[2.5rem] border border-glass-border overflow-hidden hover:border-gold-primary/30 hover:-translate-y-4 transition-all duration-700 glow-gold-hover">
                                                <div className="aspect-[16/10] relative overflow-hidden bg-surface-1 shrink-0">
                                                    <img
                                                        src={post.image}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1500ms] ease-out"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-transparent opacity-60" />
                                                    <div className="absolute top-6 left-6">
                                                        <span className="glass-strong text-text-primary text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-[0.3em] shadow-xl border border-glass-border">
                                                            {post.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-10 flex flex-col flex-1 relative">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <div className="flex items-center gap-2 text-[8px] font-black text-text-secondary uppercase tracking-[0.25em]">
                                                            <Calendar size={14} className="text-gold-primary" /> {post.date}
                                                        </div>
                                                        <div className="w-1 h-1 rounded-full bg-glass-border" />
                                                        <div className="flex items-center gap-2 text-[8px] font-black text-text-secondary uppercase tracking-[0.25em]">
                                                            <Clock size={14} className="text-gold-primary" /> {post.readTime}
                                                        </div>
                                                    </div>

                                                    <h3 className="text-2xl font-black text-text-primary mb-6 group-hover:text-gold-primary transition-colors leading-tight uppercase tracking-tight line-clamp-2">
                                                        {post.title}
                                                    </h3>

                                                    <p className="text-text-secondary text-sm mb-10 line-clamp-3 leading-relaxed font-medium">
                                                        {post.excerpt}
                                                    </p>

                                                    <div className="mt-auto pt-6 flex items-center justify-between border-t border-glass-border">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-primary group-hover:translate-x-2 transition-transform duration-500">Read Journal</span>
                                                        <ChevronRight size={16} className="text-text-secondary group-hover:text-gold-primary group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Premium Newsletter */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-40 glass-strong p-12 md:p-20 rounded-[4rem] border border-gold-primary/10 relative overflow-hidden text-center max-w-5xl mx-auto tech-grid"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gold-primary/10 blur-[120px] rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 glass-gold rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl">
                            <Mail size={32} className="text-[#0A0A0F]" />
                        </div>
                        <h3 className="text-4xl md:text-6xl font-black text-text-primary mb-6 uppercase tracking-tighter leading-none">Stay at the <br /><span className="bg-gradient-to-r from-text-primary to-gold-primary bg-clip-text text-transparent">Forefront</span></h3>
                        <p className="text-text-secondary max-w-xl mx-auto mb-12 text-lg font-medium leading-relaxed">
                            Acquire the latest metallurgical insights, machinery reviews, and exclusive factory protocols delivered directly to your workstation.
                        </p>

                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="DIGITAL ADDRESS"
                                required
                                className="flex-1 h-18 bg-surface-1/20 border border-glass-border rounded-2xl px-8 text-[10px] font-black uppercase tracking-[0.2em] text-text-primary focus:outline-none focus:border-gold-primary/30 transition-all placeholder-text-tertiary/40"
                            />
                            <button
                                type="submit"
                                className="h-18 glass-gold text-[#0A0A0F] font-black px-10 rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all hover:shadow-2xl hover:-translate-y-1 active:scale-95 cursor-pointer"
                            >
                                Synchronize
                            </button>
                        </form>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
