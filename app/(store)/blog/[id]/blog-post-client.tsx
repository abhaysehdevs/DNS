'use client';

import { useMemo } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Copy, User, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
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
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F7] pt-32 md:pt-48 pb-24 noise-overlay selection:bg-[#C9A84C]/30 overflow-x-hidden">
            
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[5%] left-[-5%] w-[50%] h-[50%] bg-[#C9A84C]/5 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                
                {/* Back Link */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Link href="/blog" className="inline-flex items-center gap-3 text-[#5A5A6A] hover:text-[#C9A84C] transition-all font-black uppercase tracking-[0.3em] text-[10px] mb-12 group">
                        <div className="w-10 h-10 rounded-full glass flex items-center justify-center group-hover:bg-[#C9A84C] group-hover:text-[#0A0A0F] transition-all">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        Return to Journal
                    </Link>
                </motion.div>

                {/* Hero Header */}
                <div className="max-w-5xl mx-auto text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-gold text-[#C9A84C] text-[9px] font-black uppercase tracking-[0.3em] mb-10"
                    >
                        <Zap size={14} /> {post.category}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-8xl font-black mb-12 leading-[0.85] tracking-tighter uppercase"
                    >
                        {post.title}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center justify-center gap-10"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#5A5A6A]">Technical Author</span>
                            <span className="text-[10px] font-black text-[#F5F5F7] uppercase tracking-[0.2em]">{post.author}</span>
                        </div>
                        <div className="w-px h-8 bg-white/[0.04]" />
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#5A5A6A]">Transmission Date</span>
                            <span className="text-[10px] font-black text-[#F5F5F7] uppercase tracking-[0.2em]">{post.date}</span>
                        </div>
                        <div className="w-px h-8 bg-white/[0.04]" />
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#5A5A6A]">Study Duration</span>
                            <span className="text-[10px] font-black text-[#F5F5F7] uppercase tracking-[0.2em]">{post.readTime}</span>
                        </div>
                    </motion.div>
                </div>

                {/* Main Visual */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-7xl mx-auto aspect-[21/9] rounded-[4rem] overflow-hidden relative shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/[0.04] mb-24 group perspective-2000"
                >
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[3s] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent opacity-60" />
                </motion.div>

                {/* Article Structure */}
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20">

                    {/* Technical Metadata / Share */}
                    <div className="hidden lg:flex flex-col gap-12 w-20 shrink-0 relative">
                        <div className="sticky top-48 flex flex-col items-center gap-8">
                            <div className="text-[9px] text-[#5A5A6A] font-black uppercase tracking-[0.4em] transform rotate-90 whitespace-nowrap mb-16">
                                Share Nexus
                            </div>
                            <button className="w-14 h-14 rounded-2xl glass border border-white/[0.04] text-[#5A5A6A] hover:bg-[#1877F2] hover:text-white transition-all shadow-xl flex items-center justify-center group/icon">
                                <Facebook size={20} className="group-hover/icon:scale-110 transition-transform" />
                            </button>
                            <button className="w-14 h-14 rounded-2xl glass border border-white/[0.04] text-[#5A5A6A] hover:bg-[#1DA1F2] hover:text-white transition-all shadow-xl flex items-center justify-center group/icon">
                                <Twitter size={20} className="group-hover/icon:scale-110 transition-transform" />
                            </button>
                            <button className="w-14 h-14 rounded-2xl glass border border-white/[0.04] text-[#5A5A6A] hover:bg-[#0A66C2] hover:text-white transition-all shadow-xl flex items-center justify-center group/icon">
                                <Linkedin size={20} className="group-hover/icon:scale-110 transition-transform" />
                            </button>
                            <button onClick={copyLink} className="w-14 h-14 rounded-2xl glass border border-white/[0.04] text-[#5A5A6A] hover:bg-[#C9A84C] hover:text-[#0A0A0F] transition-all shadow-xl flex items-center justify-center group/icon">
                                <Copy size={20} className="group-hover/icon:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Intelligence Feed */}
                    <article className="flex-1">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl md:text-3xl text-[#F5F5F7] leading-snug font-black uppercase tracking-tight mb-16 border-l-4 border-[#C9A84C] pl-10 py-4 glass-strong rounded-r-3xl"
                        >
                            {post.excerpt}
                        </motion.div>

                        <div 
                            className="prose prose-invert prose-2xl max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:leading-none prose-p:text-[#8E8E9A] prose-p:font-medium prose-p:leading-relaxed prose-a:text-[#C9A84C] prose-strong:text-[#F5F5F7] prose-img:rounded-[3rem] prose-img:shadow-2xl prose-blockquote:border-none prose-blockquote:p-0 prose-li:text-[#8E8E9A] prose-li:font-medium"
                            dangerouslySetInnerHTML={{ __html: post.content }} 
                        />

                        {/* Knowledge Tags */}
                        <div className="mt-24 pt-12 border-t border-white/[0.04] flex flex-wrap gap-4">
                            {post.tags.map(tag => (
                                <span key={tag} className="glass border border-white/[0.04] text-[#5A5A6A] text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl hover:text-[#C9A84C] hover:border-[#C9A84C]/30 cursor-pointer transition-all">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Author Credentials */}
                        <div className="mt-20 glass-strong p-10 md:p-14 rounded-[3.5rem] border border-white/[0.04] flex flex-col md:flex-row gap-10 items-center md:items-start relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <ShieldCheck size={160} className="text-[#C9A84C]" />
                            </div>
                            
                            <div className="w-24 h-24 rounded-3xl glass-gold flex items-center justify-center shrink-0 shadow-2xl relative z-10 group-hover:-rotate-6 transition-transform duration-500">
                                <span className="text-4xl font-black text-[#0A0A0F]">{post.author.charAt(0)}</span>
                            </div>
                            <div className="relative z-10 text-center md:text-left">
                                <h4 className="text-[#F5F5F7] font-black text-2xl uppercase tracking-tight mb-2">{post.author}</h4>
                                <p className="text-[#C9A84C] font-black text-[9px] uppercase tracking-[0.3em] mb-6 flex items-center justify-center md:justify-start gap-3">
                                    <Sparkles size={12} /> {post.authorRole}
                                </p>
                                <p className="text-[#8E8E9A] text-base leading-relaxed font-medium">
                                    Principal technical contributor specializing in industrial {post.category.toLowerCase()} and metallurgical protocols. Dedicated to the continuous evolution of precision engineering.
                                </p>
                            </div>
                        </div>
                    </article>
                </div>
            </div>

            {/* Related Insights */}
            {relatedPosts.length > 0 && (
                <div className="mt-40 pt-32 border-t border-white/[0.04] relative">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-center md:text-left">
                            <div>
                                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass text-[#5A5A6A] text-[8px] font-black uppercase tracking-[0.3em] mb-6">
                                    Further Intelligence
                                </div>
                                <h3 className="text-4xl md:text-6xl font-black text-[#F5F5F7] tracking-tighter uppercase leading-none">Extended <br /><span style={{ background: 'linear-gradient(135deg, #F5F5F7, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Database</span></h3>
                            </div>
                            <Link href="/blog" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C] hover:opacity-70 transition-opacity pb-2">View Full Archive</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`} className="group relative rounded-[2.5rem] overflow-hidden glass border border-white/[0.04] hover:border-[#C9A84C]/30 transition-all duration-700 hover:-translate-y-4">
                                    <div className="aspect-[16/10] relative overflow-hidden bg-[#0A0A0F]">
                                        <img
                                            src={relatedPost.image}
                                            alt={relatedPost.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2000ms] ease-out opacity-80 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] to-transparent opacity-60" />
                                    </div>
                                    <div className="p-10">
                                        <h4 className="text-xl font-black text-[#F5F5F7] mb-6 group-hover:text-[#C9A84C] transition-colors leading-tight uppercase tracking-tight line-clamp-2">
                                            {relatedPost.title}
                                        </h4>
                                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-[#5A5A6A] mt-8">
                                            <span className="flex items-center gap-2 text-[#C9A84C]"><Calendar size={14} /> {relatedPost.date}</span>
                                            <div className="w-8 h-8 rounded-full glass flex items-center justify-center group-hover:bg-[#C9A84C] group-hover:text-[#0A0A0F] transition-all">
                                                <ArrowRight size={14} />
                                            </div>
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
