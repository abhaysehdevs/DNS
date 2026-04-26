'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Hero } from '@/components/hero';
import { ProductCard } from '@/components/product-card';
import { Product } from '@/lib/data';
import { useAppStore } from '@/lib/store';
import { Loader2, TrendingUp, ShieldCheck, Truck, Users, ArrowRight, Star, Quote, ChevronRight, PlayCircle, BookOpen, Zap, Shield, Globe, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-is-mobile';

const testimonials = [
  { name: "Rajesh Kumar", role: "Industrial Manufacturer", content: "Dinanath & Sons transformed our factory efficiency. Their SB-900 series is world-class.", rating: 5 },
  { name: "Amit Verma", role: "Master Goldsmith", content: "Unrivaled precision. The technical support team actually understands the craft.", rating: 5 },
  { name: "Sneha Studio", role: "Creative Director", content: "Scaling was impossible until we integrated their industrial polishing protocols.", rating: 5 },
  { name: "Vikram Singh", role: "Luxury Retailer", content: "Premium presentation, robust logistics. The definitive partner for high-end jewelry.", rating: 5 }
];

const features = [
  { icon: <Shield size={28} />, title: "Original Tools", desc: "Authentic equipment from global manufacturers.", color: "text-[#C9A84C]" },
  { icon: <Globe size={28} />, title: "Worldwide Shipping", desc: "Safe and insured delivery across the country.", color: "text-blue-500" },
  { icon: <Users size={28} />, title: "B2B Support", desc: "Expert help for large-scale manufacturing.", color: "text-emerald-500" },
  { icon: <TrendingUp size={28} />, title: "Best Prices", desc: "Competitive pricing for bulk and retail orders.", color: "text-purple-500" }
];

export default function Home() {
  const isMobile = useIsMobile();
  const { mode } = useAppStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'featured' | 'new' | 'bestsellers'>('featured');

  useEffect(() => {
    async function fetchFeatured() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').limit(12);
      if (data && data.length > 0) {
        const mappedProducts: Product[] = data.map((p: any) => ({
          id: p.id, name: p.name, description: p.description, retailPrice: p.retail_price,
          wholesalePrice: p.wholesale_price, wholesaleMOQ: p.wholesale_moq,
          primaryImage: p.image || p.image_url || '/placeholder.jpg',
          image: p.image || p.image_url || '/placeholder.jpg',
          gallery: p.gallery || [], category: p.category, inStock: p.in_stock, reviews: p.reviews || []
        }));
        setFeaturedProducts(mappedProducts);
      }
      setLoading(false);
    }
    fetchFeatured();
  }, []);

  const displayProducts = featuredProducts.slice(
    activeTab === 'featured' ? 0 : activeTab === 'new' ? 4 : 8,
    activeTab === 'featured' ? 8 : activeTab === 'new' ? 12 : 12
  );

  return (
    <div className="relative w-full bg-[#FFFFFF] selection:bg-[#C9A84C]/30 overflow-hidden">
      
      <Hero />

      <section className="relative z-30 -mt-24 pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                className="glass-strong rounded-[2rem] p-10 border border-black/[0.04] hover:border-[#C9A84C]/30 transition-all duration-700 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                    <Zap size={120} className={f.color} />
                </div>
                <div className={`w-16 h-16 rounded-2xl glass mb-8 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:bg-white/5 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-black uppercase tracking-tight text-[#1D1D1F] mb-3 group-hover:text-[#C9A84C] transition-colors">{f.title}</h3>
                <p className="text-xs text-[#5A5A6A] leading-relaxed font-medium uppercase tracking-wider">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COLLECTION INTERFACE - Cinematic Tabs ═══ */}
      <section className="py-32 md:py-48 relative px-6 overflow-hidden">
        <div className="container mx-auto">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-24 gap-12">
                <div className="max-w-3xl">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }} 
                        whileInView={{ opacity: 1, x: 0 }} 
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass text-[#5A5A6A] text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                    >
                        <ShieldCheck size={14} /> Certified Collection
                    </motion.div>
                    <h2 className="text-6xl md:text-8xl font-black text-[#1D1D1F] tracking-tighter uppercase leading-[0.85]">
                        Professional <br />
                        <span style={{ background: 'linear-gradient(135deg, #1D1D1F, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tools</span>
                    </h2>
                </div>

                <div className="flex flex-wrap p-2 rounded-[2rem] glass-strong border border-black/[0.04]">
                    {['featured', 'new', 'bestsellers'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === tab ? 'glass-gold text-[#0A0A0F] shadow-2xl' : 'text-[#5A5A6A] hover:text-[#1D1D1F]'}`}
                            style={activeTab === tab ? { background: 'linear-gradient(135deg, #E8D48B, #C9A84C)' } : {}}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-12 h-12 rounded-full border-2 border-[#C9A84C]/10 border-t-[#C9A84C] animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">Synchronizing Database</span>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={activeTab} 
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 1.02 }} 
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {displayProducts.map((product, i) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}

            <div className="mt-24 text-center">
                <Link href="/shop">
                    <button className="h-18 px-16 glass rounded-2xl border border-black/[0.04] text-[#1D1D1F] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#C9A84C] hover:text-[#0A0A0F] transition-all duration-500 hover:scale-105 active:scale-95 group">
                        See All Products 
                        <ArrowRight size={18} className="inline ml-4 group-hover:translate-x-2 transition-transform" />
                    </button>
                </Link>
            </div>
        </div>
      </section>

      {/* ═══ INTEL CORE - Bento Section ═══ */}
      <section className="py-32 md:py-48 bg-[#F5F5F7] relative px-6">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/[0.04] to-transparent" />
          <div className="container mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                  <div className="lg:col-span-5">
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-gold text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                          <BookOpen size={14} /> Help & Guides
                      </div>
                      <h2 className="text-5xl md:text-7xl font-black text-[#1D1D1F] leading-[0.9] uppercase tracking-tighter mb-10">
                          Expert <br />
                          <span className="text-[#86868B]">Advice</span>
                      </h2>
                      <p className="text-[#6E6E73] text-xl leading-relaxed font-medium mb-12">Industrial-grade insights for metallurgical engineering, machinery calibration, and high-volume production management.</p>
                      
                      <div className="space-y-4">
                          {[
                              { title: "Metallurgy 2.0", type: "Technical Whitepaper", time: "12 min read", icon: <Shield size={20} /> },
                              { title: "Casting Optimization", type: "Process Video", time: "08:45", icon: <PlayCircle size={20} /> }
                          ].map((item, i) => (
                              <div key={i} className="glass p-6 rounded-[1.5rem] border border-black/[0.04] hover:border-[#C9A84C]/30 transition-all group cursor-pointer flex items-center justify-between">
                                  <div className="flex items-center gap-6">
                                      <div className="w-12 h-12 rounded-xl glass-gold flex items-center justify-center text-[#0A0A0F] group-hover:scale-110 transition-transform">{item.icon}</div>
                                      <div>
                                          <h4 className="font-black text-[#1D1D1F] uppercase tracking-tight text-lg">{item.title}</h4>
                                          <p className="text-[10px] font-black text-[#86868B] uppercase tracking-widest">Guide</p>
                                      </div>
                                  </div>
                                  <span className="text-[9px] font-black text-[#C9A84C] uppercase tracking-widest">Learn More</span>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Radical Bento Display */}
                  <div className="lg:col-span-7 grid grid-cols-12 grid-rows-12 gap-6 h-[600px] md:h-[750px]">
                      <div className="col-span-8 row-span-12 rounded-[3rem] overflow-hidden relative glass-strong border border-black/[0.04] group">
                          <img src="/images/products/sand-blasting-dust-collector-machine.png" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-[2s]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#FFFFFF] to-transparent" />
                          <div className="absolute bottom-12 left-12 right-12">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C9A84C] mb-4 block">New Deployment</span>
                                <h3 className="text-4xl font-black text-[#1D1D1F] uppercase tracking-tighter leading-none mb-6">Atmospheric <br/>Dust Control</h3>
                                <button className="w-14 h-14 rounded-full glass-gold flex items-center justify-center text-[#0A0A0F]"><ArrowRight size={24} /></button>
                          </div>
                      </div>
                      <div className="col-span-4 row-span-5 rounded-[2.5rem] glass border border-black/[0.04] flex flex-col justify-center items-center text-center p-8">
                            <Zap size={40} className="text-[#C9A84C] mb-6 animate-pulse" />
                            <h4 className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-[0.2em]">High Efficiency</h4>
                            <p className="text-[8px] font-bold text-[#86868B] uppercase mt-2">Energy Flux 98%</p>
                      </div>
                      <div className="col-span-4 row-span-7 rounded-[2.5rem] overflow-hidden relative glass border border-black/[0.04]">
                            <img src="/images/products/15f-tweezers.png" className="absolute inset-0 w-full h-full object-contain p-8 mix-blend-multiply opacity-80" />
                            <div className="absolute inset-0 bg-blue-500/5" />
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* ═══ GLOBAL NETWORK - Marquee ═══ */}
      <section className="py-32 md:py-48 relative overflow-hidden px-6 bg-[#FFFFFF]">
          <div className="container mx-auto">
              <div className="text-center mb-24">
                  <h2 className="text-4xl md:text-6xl font-black text-[#1D1D1F] uppercase tracking-tighter mb-6">Trusted by <br/><span className="text-[#86868B]">Professionals</span></h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Highly rated in over 40 countries</p>
              </div>

              <div className="flex flex-nowrap overflow-hidden mask-fade-edges -mx-6">
                  <motion.div animate={{ x: [0, -1000] }} transition={{ repeat: Infinity, ease: "linear", duration: 25 }} className="flex gap-8">
                      {[...testimonials, ...testimonials].map((t, i) => (
                          <div key={i} className="w-[350px] md:w-[450px] shrink-0 glass-strong rounded-[2.5rem] p-10 border border-black/[0.04] relative shadow-xl">
                              <Quote size={48} className="absolute top-10 right-10 text-black/[0.02]" />
                              <div className="flex gap-1.5 mb-8">
                                  {Array(5).fill(0).map((_, idx) => <Star key={idx} size={14} className="text-[#C9A84C]" fill="currentColor" />)}
                              </div>
                              <p className="text-lg text-[#6E6E73] font-medium leading-relaxed mb-8 italic">"{t.content}"</p>
                              <div className="flex items-center gap-5">
                                  <div className="w-12 h-12 rounded-xl glass-gold flex items-center justify-center font-black text-[#0A0A0F] text-lg">{t.name[0]}</div>
                                  <div>
                                      <div className="font-black text-[#1D1D1F] uppercase tracking-tight text-sm">{t.name}</div>
                                      <div className="text-[10px] font-bold text-[#86868B] uppercase tracking-widest">{t.role}</div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </motion.div>
              </div>
          </div>
      </section>

      {/* ═══ BRAND EXPERIENCE - Gallery ═══ */}
      <section className="py-32 md:py-48 px-6 bg-[#F5F5F7]">
          <div className="container mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                  <div>
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-gold text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                          <Sparkles size={14} /> Brand Experience
                      </div>
                      <h2 className="text-5xl md:text-7xl font-black text-[#1D1D1F] uppercase tracking-tighter leading-none">
                          Our <span className="text-[#86868B]">Heritage & Events</span>
                      </h2>
                  </div>
                  <p className="text-[#6E6E73] text-lg font-medium max-w-md">Discover our global physical locations, industrial exhibitions, and the professional events that define our legacy.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
                  <div className="md:col-span-8 h-[400px] md:h-full rounded-[3rem] overflow-hidden relative group shadow-2xl">
                      <img src="/headquarters_storefront.png" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt="Main Headquarters" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-10 left-10 right-10">
                          <h4 className="text-white text-3xl md:text-4xl font-black uppercase tracking-tighter">Primary Headquarters</h4>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-[0.3em] mt-3">Chandni Chowk, Delhi</p>
                      </div>
                  </div>
                  <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-6 h-auto md:h-full">
                      <div className="rounded-[2.5rem] h-[300px] md:h-full overflow-hidden relative group shadow-xl">
                          <img src="/industrial_expo_booth.png" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt="Industrial Expo" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-8 left-8 right-8">
                              <h4 className="text-white text-xl font-black uppercase tracking-tight">Industrial Expo</h4>
                              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">2024 Tech Summit</p>
                          </div>
                      </div>
                      <div className="rounded-[2.5rem] h-[300px] md:h-full overflow-hidden relative group shadow-xl">
                          <img src="/modern_factory_floor.png" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt="Factory Floor" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-8 left-8 right-8">
                              <h4 className="text-white text-xl font-black uppercase tracking-tight">Factory Operations</h4>
                              <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Manufacturing Unit</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* ═══ NEXUS UPLINK - Newsletter ═══ */}
      <section className="py-32 md:py-48 px-6 relative overflow-hidden bg-[#F5F5F7]">
          <div className="container mx-auto">
              <div className="glass-strong rounded-[4rem] p-12 md:p-24 border border-black/[0.04] relative overflow-hidden flex flex-col xl:flex-row items-center gap-20 shadow-2xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C]/5 blur-[120px] rounded-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
                  
                  <div className="flex-1 relative z-10 text-center xl:text-left">
                      <h2 className="text-5xl md:text-7xl font-black text-[#1D1D1F] uppercase tracking-tighter leading-none mb-8">Stay <br/><span style={{ background: 'linear-gradient(135deg, #1D1D1F, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Updated</span></h2>
                      <p className="text-xl text-[#6E6E73] max-w-xl mx-auto xl:mx-0 font-medium leading-relaxed mb-12">Get the latest tool updates, special offers, and expert tips delivered directly to your inbox from Dinanath's.</p>
                      
                      <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto xl:mx-0" onSubmit={e => e.preventDefault()}>
                          <input required type="email" placeholder="EMAIL ADDRESS" 
                            className="flex-1 h-18 bg-black/[0.02] border border-black/[0.06] rounded-2xl px-8 text-[10px] font-black uppercase tracking-[0.3em] text-[#1D1D1F] focus:outline-none focus:border-[#C9A84C]/30 transition-all placeholder-[#86868B]" />
                          <button type="submit" className="h-18 glass-gold text-[#0A0A0F] font-black px-12 rounded-2xl text-[10px] uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 shadow-2xl">
                              Join
                          </button>
                      </form>
                  </div>

                  <div className="flex-1 hidden xl:block relative group">
                        <div className="relative z-10 glass rounded-[3rem] p-12 border border-black/[0.04] animate-float shadow-xl">
                            <ShieldCheck size={120} className="text-[#C9A84C] mb-8" />
                            <h4 className="text-2xl font-black text-[#1D1D1F] uppercase mb-4">Secure Shopping</h4>
                            <p className="text-xs text-[#86868B] font-bold uppercase tracking-[0.2em] leading-relaxed">Fast and safe delivery for all professional jewelry equipment from Dinanath's experts.</p>
                        </div>
                        <div className="absolute inset-0 glass blur-[40px] -z-10 group-hover:scale-110 transition-transform duration-700 opacity-30" />
                  </div>
              </div>
          </div>
      </section>

    </div>
  );
}
