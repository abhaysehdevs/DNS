'use client';

import { useMemo } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Copy, User } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blog-data';

export default function BlogPostClient({ id }: { id: string }) {

    const post = useMemo(() => {
        return BLOG_POSTS.find(p => p.id === id);
    }, [id]);

    const relatedPosts = useMemo(() => {
        if (!post) return [];
        return BLOG_POSTS.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);
    }, [post]);

    if (!post) {
        notFound();
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white pt-24 pb-20 selection:bg-amber-500/30">
            {/* Header / Hero */}
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-colors font-bold uppercase tracking-widest text-xs mb-8 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Journal
                </Link>

                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold mb-6 uppercase tracking-widest"
                    >
                        {post.category}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter"
                    >
                        {post.title}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400 font-bold uppercase tracking-widest"
                    >
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                            <User size={14} className="text-amber-500" />
                            {post.author}
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                            <Calendar size={14} className="text-amber-500" />
                            {post.date}
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                            <Clock size={14} className="text-amber-500" />
                            {post.readTime}
                        </div>
                    </motion.div>
                </div>

                {/* Main Image */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.7 }}
                    className="max-w-5xl mx-auto aspect-video rounded-3xl overflow-hidden relative shadow-2xl shadow-amber-500/5 border border-white/10 mb-16 group"
                >
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2s] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                </motion.div>

                {/* Content Layout */}
                <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">

                    {/* Share Sidebar (Sticky Desktop) */}
                    <div className="hidden lg:flex flex-col items-center gap-4 w-16 shrink-0 relative">
                        <div className="sticky top-32 flex flex-col gap-4">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] transform -rotate-90 whitespace-nowrap mb-12">
                                Share Article
                            </div>
                            <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] flex items-center justify-center transition-all shadow-lg">
                                <Facebook size={16} />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] flex items-center justify-center transition-all shadow-lg">
                                <Twitter size={16} />
                            </button>
                            <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] flex items-center justify-center transition-all shadow-lg">
                                <Linkedin size={16} />
                            </button>
                            <button onClick={copyLink} className="w-10 h-10 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:bg-amber-500 hover:text-black hover:border-amber-500 flex items-center justify-center transition-all shadow-lg">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Main Article Content */}
                    <article className="prose prose-invert prose-lg max-w-3xl prose-headings:font-black prose-headings:tracking-tight prose-a:text-amber-500 hover:prose-a:text-amber-400 prose-blockquote:border-l-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-img:rounded-2xl">

                        {/* Excerpt Lead */}
                        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-medium mb-10 border-l-4 border-amber-500 pl-6">
                            {post.excerpt}
                        </p>

                        <div dangerouslySetInnerHTML={{ __html: post.content }} />

                        {/* Article Tags */}
                        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-3">
                            {post.tags.map(tag => (
                                <span key={tag} className="bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/50 cursor-pointer transition-all">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Author Bio Box */}
                        <div className="mt-12 p-8 bg-gradient-to-br from-gray-900 to-[#0a0a0a] border border-white/10 rounded-3xl flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shrink-0 border-2 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                                <span className="text-2xl font-black text-black">{post.author.charAt(0)}</span>
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-xl mb-1">{post.author}</h4>
                                <p className="text-amber-500 font-semibold text-xs uppercase tracking-widest mb-4">{post.authorRole}</p>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Expert contributor specializing in {post.category.toLowerCase()} and industrial implementation. Dedicated to advancing the craft through precision engineering.
                                </p>
                            </div>
                        </div>

                    </article>
                </div>
            </div>

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
                <div className="mt-32 pt-20 border-t border-white/5 bg-gradient-to-b from-transparent to-gray-900/30">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-tighter">More From <span className="text-amber-500">{post.category}</span></h3>
                                <p className="text-gray-500 mt-2">Continue reading our expert insights.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`} className="group relative rounded-3xl overflow-hidden bg-gray-900 border border-white/10 hover:border-amber-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)]">
                                    <div className="aspect-video relative overflow-hidden bg-black">
                                        <img
                                            src={relatedPost.image}
                                            alt={relatedPost.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                                        />
                                    </div>
                                    <div className="p-8">
                                        <h4 className="text-xl font-bold text-white mb-3 group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                                            {relatedPost.title}
                                        </h4>
                                        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-widest text-gray-500 mt-6">
                                            <span className="text-amber-500 flex items-center gap-1.5"><Calendar size={14} /> {relatedPost.date}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
