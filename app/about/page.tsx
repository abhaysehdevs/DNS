'use client';

import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
    Hammer, Cog, ShieldCheck, Zap, History, MapPin, Sparkles, Building2, 
    Globe, Users, Award, Microscope, Factory, Truck, ChevronRight, Play,
    Cpu, Activity, Target
} from 'lucide-react';
import { useRef } from 'react';
import Link from 'next/link';

export default function About() {
    const { language } = useAppStore();
    const t = translations[language].nav;
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const smoothProgress = useSpring(scrollYProgress, { damping: 20, stiffness: 100 });

    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const stats = [
        { label: 'Founded', value: '1980', icon: <History size={20} /> },
        { label: 'Global Clients', value: '4,500+', icon: <Users size={20} /> },
        { label: 'Precision Tools', value: '12k+', icon: <Cpu size={20} /> },
        { label: 'Export Nodes', value: '42', icon: <Globe size={20} /> },
    ];

    const timeline = [
        { 
            year: '1980', 
            title: 'The Foundation', 
            desc: 'Dinanath & Sons established in Maliwara, Chandni Chowk, initially focusing on specialized hand tools for local artisans.',
            image: '/about_page_timeline_asset_1777173615106.png'
        },
        { 
            year: '1995', 
            title: 'Industrial Pivot', 
            desc: 'Introduction of motorized equipment and automated polishing machines, transitioning from a workshop to an industrial supplier.',
            image: '/industrial_expo_booth.png'
        },
        { 
            year: '2010', 
            title: 'Global Connectivity', 
            desc: 'Launched international logistics pipeline, supplying metallurgical tools to manufacturing hubs in Dubai, Italy, and Thailand.',
            image: '/modern_factory_floor.png'
        },
        { 
            year: '2024', 
            title: 'Digital Engineering', 
            desc: 'Implementation of smart inventory systems and AI-driven precision testing for the next generation of industrial manufacturing.',
            image: '/about_page_modern_engineering_1777173637011.png'
        }
    ];

    const values = [
        { title: 'Extreme Precision', desc: 'Every micron matters. Our tools are calibrated to global metallurgical standards.', icon: <Target className="text-[#C9A84C]" /> },
        { title: 'Authentic Heritage', desc: 'Forty years of on-the-ground expertise in the heart of the jewelry industry.', icon: <Award className="text-blue-500" /> },
        { title: 'Future-Ready', desc: 'Bridging the gap between traditional craft and modern robotic manufacturing.', icon: <Zap className="text-emerald-500" /> },
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-[#FFFFFF] text-[#1D1D1F] overflow-x-hidden selection:bg-[#C9A84C]/30 noise-overlay">
            
            {/* Ambient Lighting Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[20%] left-[-10%] w-[50%] h-[50%] bg-[#C9A84C]/5 blur-[150px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full" />
            </div>

            {/* Cinematic Hero Section */}
            <section className="relative h-screen flex items-center justify-center pt-32 px-6">
                <motion.div 
                    style={{ scale: heroScale, opacity: heroOpacity }}
                    className="text-center max-w-6xl z-20"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-gold text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.4em] mb-12 shadow-xl"
                    >
                        <ShieldCheck size={14} /> Industrial Authority • Established 1980
                    </motion.div>
                    
                    <h1 className="text-7xl md:text-[11rem] font-black tracking-tighter leading-[0.8] mb-12 uppercase text-[#1D1D1F]">
                        Building <br />
                        <span style={{ background: 'linear-gradient(135deg, #1D1D1F 40%, #C9A84C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Legacies</span>
                    </h1>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-16">
                        <p className="text-xl md:text-2xl text-[#5A5A6A] max-w-xl text-center md:text-left leading-relaxed font-medium">
                            Pioneering precision jewelry engineering from the heart of Chandni Chowk to the global stage. We supply the tools that define perfection.
                        </p>
                        <div className="w-px h-24 bg-black/10 hidden md:block" />
                        <div className="grid grid-cols-2 gap-8">
                            {stats.map((s, i) => (
                                <div key={i} className="text-left">
                                    <div className="flex items-center gap-2 text-[#C9A84C] mb-2">
                                        {s.icon}
                                        <span className="text-2xl font-black">{s.value}</span>
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#86868B]">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scroll to Explore</span>
                    <motion.div 
                        animate={{ y: [0, 15, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-px h-16 bg-gradient-to-b from-[#C9A84C] to-transparent" 
                    />
                </div>
            </section>

            {/* Section 2: Narrative & Deep Story */}
            <section className="py-48 px-6 bg-[#F5F5F7] relative">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
                        <div className="lg:col-span-7">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-12"
                            >
                                <div className="space-y-6">
                                    <h2 className="text-5xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter">
                                        The Heart of <br />
                                        <span className="text-[#86868B]">Precision</span>
                                    </h2>
                                    <div className="w-32 h-2 bg-[#C9A84C] rounded-full" />
                                </div>

                                <div className="text-xl md:text-2xl text-[#5A5A6A] leading-relaxed font-medium space-y-8">
                                    <p>
                                        In 1980, Dinanath & Sons was founded with a singular vision: to provide the master jewelers of Delhi with tools that could match their unparalleled artistry.
                                    </p>
                                    <p>
                                        What started as a small boutique workshop in <strong>Chandni Chowk</strong> has evolved into an international engineering powerhouse. We don't just distribute machinery; we collaborate with manufacturers to refine the very science of jewelry production.
                                    </p>
                                    <p className="text-lg text-[#86868B]">
                                        Our headquarters remains in the same historic district where it all began, serving as a testament to our enduring commitment to authentic craftsmanship and industrial growth.
                                    </p>
                                </div>

                                <Link href="/contact">
                                    <button className="h-16 px-12 glass rounded-2xl border border-black/10 text-[#1D1D1F] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#C9A84C] hover:text-white transition-all shadow-xl group">
                                        Partner with Us <ChevronRight size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="relative">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                    viewport={{ once: true }}
                                    className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative z-10"
                                >
                                    <img src="/headquarters_storefront.png" className="w-full h-full object-cover" alt="Heritage HQ" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-10 left-10 text-white">
                                        <h4 className="font-black uppercase tracking-tight text-2xl">Original HQ</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Maliwara, Chandni Chowk</p>
                                    </div>
                                </motion.div>
                                <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#C9A84C]/10 blur-3xl rounded-full -z-10" />
                                <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full -z-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: The Timeline (Horizontal Scroll Simulation or Vertical) */}
            <section className="py-48 px-6 container mx-auto">
                <div className="mb-32">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">Evolutionary <span className="text-[#86868B]">Timeline</span></h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Decades of industrial advancement</p>
                </div>

                <div className="space-y-48">
                    {timeline.map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-20 items-center`}
                        >
                            <div className="flex-1 w-full">
                                <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl group">
                                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt={item.title} />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                    <div className="absolute top-8 left-8">
                                        <span className="text-6xl md:text-8xl font-black text-white/20 uppercase tracking-tighter">{item.year}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-6">
                                <span className="text-[#C9A84C] font-black text-sm uppercase tracking-[0.4em] mb-4 block">Stage {i + 1}</span>
                                <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">{item.title}</h3>
                                <p className="text-xl text-[#5A5A6A] leading-relaxed font-medium">{item.desc}</p>
                                <div className="pt-6">
                                    <div className="h-px w-full bg-black/10 relative">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '100%' }}
                                            viewport={{ once: true }}
                                            className="absolute inset-0 bg-[#C9A84C]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Section 4: Engineering Standards (Advanced Bento) */}
            <section className="py-48 px-6 bg-[#0A0A0F] text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#FFFFFF] to-transparent pointer-events-none opacity-10" />
                
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-8">
                        <div>
                            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                                <Microscope size={14} /> Quality Assurance
                            </div>
                            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                                Technical <br />
                                <span style={{ background: 'linear-gradient(135deg, #F5F5F7, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Excellence</span>
                            </h2>
                        </div>
                        <p className="text-[#8E8E9A] text-lg font-medium max-w-md">Our testing protocols ensure that every piece of machinery operates at the peak of industrial efficiency.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Calibration Card */}
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="md:col-span-8 rounded-[3.5rem] bg-white/[0.03] border border-white/5 p-12 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Target size={250} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-3xl font-black uppercase mb-6">Micron Calibration</h3>
                                <p className="text-[#8E8E9A] text-lg max-w-xl mb-12">We use laser-guided measurement systems to verify the tolerance levels of our rolling mills and casting units. Perfection is not an aim; it is our baseline.</p>
                                <div className="mt-auto flex gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A84C] mb-1">Tolerance</span>
                                        <span className="text-2xl font-black">±0.001mm</span>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Verification</span>
                                        <span className="text-2xl font-black">100% Units</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Speed/Efficiency Card */}
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="md:col-span-4 rounded-[3.5rem] glass-gold p-12 flex flex-col justify-between text-[#0A0A0F]"
                        >
                            <Activity size={48} className="mb-12" />
                            <div>
                                <h3 className="text-2xl font-black uppercase mb-4 tracking-tight">Rapid <br/>Deployment</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Global supply chain nodes ensure zero downtime for your factory operations.</p>
                            </div>
                        </motion.div>

                        {/* Material Card */}
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="md:col-span-4 rounded-[3.5rem] bg-white/[0.03] border border-white/5 p-12 flex flex-col"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-10">
                                <ShieldCheck className="text-emerald-500" size={32} />
                            </div>
                            <h3 className="text-xl font-black uppercase mb-4">Hardened Alloys</h3>
                            <p className="text-[#8E8E9A] text-sm leading-relaxed">Our rolling mills use aerospace-grade tungsten carbide alloys for maximum longevity under heavy industrial loads.</p>
                        </motion.div>

                        {/* Support Card */}
                        <motion.div 
                            whileHover={{ y: -10 }}
                            className="md:col-span-8 rounded-[3.5rem] bg-white/[0.03] border border-white/5 p-12 flex items-center gap-12 group overflow-hidden"
                        >
                            <div className="hidden lg:block w-48 h-48 bg-[#C9A84C]/10 rounded-full flex-shrink-0 flex items-center justify-center">
                                <Factory size={64} className="text-[#C9A84C] group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black uppercase mb-4">Factory Layout Consulting</h3>
                                <p className="text-[#8E8E9A] text-lg">We don't just sell machines. Our engineers design complete factory layouts for optimized production flow and efficiency.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Section 5: Core Values */}
            <section className="py-48 px-6 container mx-auto text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-24">Core <span className="text-[#86868B]">Principles</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {values.map((v, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-20 h-20 rounded-[2rem] glass border border-black/5 flex items-center justify-center mb-8 shadow-xl">
                                    {v.icon}
                                </div>
                                <h3 className="text-xl font-black uppercase mb-4 tracking-tight">{v.title}</h3>
                                <p className="text-[#5A5A6A] font-medium leading-relaxed">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 6: Mission Statement / Final Quote */}
            <section className="py-48 px-6">
                <div className="max-w-6xl mx-auto glass-strong rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden shadow-2xl border border-black/[0.04]">
                    <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full pointer-events-none" />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C] mb-12 block">The Directive</span>
                        <h2 className="text-4xl md:text-7xl font-black text-[#1D1D1F] uppercase tracking-tighter mb-16 leading-[0.9]">
                            "Empowering the world's finest craftsmen with the industry's most advanced technology."
                        </h2>
                        <div className="flex items-center justify-center gap-6">
                            <div className="h-px w-16 bg-black/10" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#86868B]">Dinanath & Sons • Est 1980</p>
                            <div className="h-px w-16 bg-black/10" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="pb-48 pt-24 px-6 text-center">
                <div className="flex flex-col items-center gap-12">
                    <h3 className="text-4xl font-black uppercase tracking-tight">Ready to Upgrade?</h3>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <Link href="/shop">
                            <button className="h-18 px-16 glass-gold text-[#0A0A0F] font-black uppercase tracking-[0.3em] rounded-2xl text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                Explore Inventory
                            </button>
                        </Link>
                        <Link href="/contact">
                            <button className="h-18 px-16 glass border border-black/10 text-[#1D1D1F] font-black uppercase tracking-[0.3em] rounded-2xl text-[10px] hover:bg-black/5 transition-all">
                                Technical Inquiry
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
