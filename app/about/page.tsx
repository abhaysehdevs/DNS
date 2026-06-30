'use client';

import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
    ShieldCheck, Zap, History, Globe, Users, Award, Microscope, Factory, ChevronRight,
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

    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.96]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    const stats = [
        { label: 'Founded', value: '1980', icon: <History size={16} /> },
        { label: 'Global Clients', value: '4,500+', icon: <Users size={16} /> },
        { label: 'Precision Tools', value: '12k+', icon: <Cpu size={16} /> },
        { label: 'Export Nodes', value: '42', icon: <Globe size={16} /> },
    ];

    const timeline = [
        { 
            year: '1980', 
            title: 'The Foundation', 
            desc: 'Dinanath & Sons established in Maliwara, Chandni Chowk, initially focusing on specialized hand tools for local jewelry workshops.',
            image: '/about_page_timeline_asset_1777173615106.png'
        },
        { 
            year: '1995', 
            title: 'Industrial Pivot', 
            desc: 'Introduction of motorized equipment and automated polishing machines, transitioning from hand tools to factory setups.',
            image: '/industrial_expo_booth.png'
        },
        { 
            year: '2010', 
            title: 'Global Connectivity', 
            desc: 'Launched global distribution networks, supplying metallurgical tools to manufacturing hubs in Dubai, Italy, and Thailand.',
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
        { title: 'Extreme Precision', desc: 'Every micron matters. Our tools are calibrated to global metallurgical standards.', icon: <Target className="text-gold-primary" size={20} /> },
        { title: 'Authentic Heritage', desc: 'Forty years of on-the-ground expertise in the heart of the jewelry industry.', icon: <Award className="text-blue-500" size={20} /> },
        { title: 'Future-Ready', desc: 'Bridging the gap between traditional goldsmithing and modern automated manufacturing.', icon: <Zap className="text-emerald-500" size={20} /> },
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-surface-2 text-text-primary overflow-x-hidden selection:bg-gold-primary/30 blueprint-grid">
            
            {/* Ambient Lighting Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] bg-gold-muted blur-[150px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-glow/5 dark:bg-cyan-glow/3 blur-[150px] rounded-full" />
            </div>

            {/* Hero Section */}
            <section className="relative h-[95vh] flex items-center justify-center pt-24 px-6 relative z-10">
                <motion.div 
                    style={{ scale: heroScale, opacity: heroOpacity }}
                    className="text-center max-w-5xl"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold text-gold-primary text-[9px] font-black uppercase tracking-[0.3em] mb-8 shadow-sm"
                    >
                        <ShieldCheck size={12} /> Industrial Authority • Since 1980
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-8xl xl:text-[7.5rem] font-black tracking-tighter leading-[0.85] mb-8 uppercase text-text-primary select-none">
                        Engineered <br />
                        <span className="text-transparent bg-gradient-to-r from-text-primary via-gold-primary to-gold-light bg-clip-text">Perfection</span>
                    </h1>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-10 mt-12">
                        <p className="text-lg md:text-xl text-text-secondary max-w-lg text-center md:text-left leading-relaxed font-medium">
                            Pioneering precision jewelry engineering from the historic lanes of Chandni Chowk to global manufacturing yards.
                        </p>
                        <div className="w-px h-16 bg-glass-border hidden md:block" />
                        <div className="grid grid-cols-2 gap-6">
                            {stats.map((s, i) => (
                                <div key={i} className="text-left">
                                    <div className="flex items-center gap-2 text-gold-primary mb-1">
                                        {s.icon}
                                        <span className="text-xl font-black font-mono">{s.value}</span>
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-text-tertiary">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Scroll to history</span>
                    <motion.div 
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-px h-12 bg-gradient-to-b from-gold-primary to-transparent" 
                    />
                </div>
            </section>

            {/* Narrative Story */}
            <section className="py-24 md:py-32 px-6 bg-surface-1 relative tech-grid border-t border-glass-border relative z-10">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-7">
                            <motion.div
                                initial={{ opacity: 0, x: -35 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tighter">
                                        Heritage of <br />
                                        <span className="text-text-tertiary font-mono">Expertise</span>
                                    </h2>
                                    <div className="w-20 h-1 bg-gold-primary rounded-full" />
                                </div>

                                <div className="text-base md:text-lg text-text-secondary leading-relaxed font-medium space-y-6">
                                    <p>
                                        In 1980, Dinanath & Sons was founded with a singular directive: to supply master jewelers in Delhi with machinery that could match their artistry.
                                    </p>
                                    <p>
                                        What started as a specialized workshop in <strong>Maliwara, Chandni Chowk</strong> has evolved into a global supplier. We don't just sell tools; we collaborate directly with workshops to refine their layouts and casting optimization workflows.
                                    </p>
                                </div>

                                <Link href="/contact">
                                    <button className="h-14 px-8 bg-surface-2 rounded-xl border border-glass-border text-text-primary font-black uppercase tracking-[0.2em] text-[9px] hover:bg-gold-primary hover:text-black transition-all shadow-md group">
                                        Partner with Us <ChevronRight size={14} className="inline ml-1.5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="relative">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="aspect-square rounded-2xl overflow-hidden shadow-xl relative z-10 border border-glass-border"
                                >
                                    <img src="/headquarters_storefront.png" className="w-full h-full object-cover" alt="Historic Dinanath Headquarters storefront" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <h4 className="font-black uppercase tracking-tight text-lg">Original Hub</h4>
                                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-gold-light mt-1">Maliwara, Chandni Chowk, Delhi</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-24 md:py-32 px-6 container mx-auto relative z-10">
                <div className="mb-20">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">Evolutionary <span className="text-text-tertiary font-mono">Timeline</span></h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-primary">Decades of jewelry machinery progress</p>
                </div>

                <div className="space-y-32">
                    {timeline.map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 35 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
                        >
                            <div className="flex-1 w-full">
                                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-glass-border group bg-surface-1">
                                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s]" alt={item.title} />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    <div className="absolute top-6 left-6">
                                        <span className="text-5xl md:text-6xl font-black text-white/30 uppercase tracking-tighter font-mono">{item.year}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <span className="text-gold-primary font-black text-xs uppercase tracking-[0.3em]">Phase {i + 1}</span>
                                <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-none text-text-primary">{item.title}</h3>
                                <p className="text-base text-text-secondary leading-relaxed font-medium">{item.desc}</p>
                                <div className="pt-4">
                                    <div className="h-px w-full bg-glass-border relative">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '100%' }}
                                            viewport={{ once: true }}
                                            className="absolute inset-0 bg-gold-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Quality Calibration Bento */}
            <section className="py-24 md:py-32 px-6 bg-surface-1 text-text-primary overflow-hidden relative border-t border-glass-border relative z-10">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-gold text-gold-primary text-[8px] font-black uppercase tracking-[0.25em] mb-4">
                                <Microscope size={12} /> Calibration Assurance
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">
                                Quality <br />
                                <span className="text-text-tertiary font-mono">Standards</span>
                            </h2>
                        </div>
                        <p className="text-text-secondary text-sm font-medium max-w-sm">Every industrial rolling mill, polishing drum, and micro-soldering unit is verified prior to dispatch.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Calibration Card */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="md:col-span-8 rounded-2xl bg-surface-2 border border-glass-border p-8 relative overflow-hidden group shadow-md"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <Target size={200} />
                            </div>
                            <div className="relative z-10 flex flex-col h-full">
                                <h3 className="text-2xl font-black uppercase mb-4">Micron Testing</h3>
                                <p className="text-text-secondary text-sm max-w-lg mb-8 font-semibold">We run digital dial indicators on rolling mill cylinders and vibration analysis on finishing setups to achieve tight operational tolerances.</p>
                                <div className="mt-auto flex gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-gold-primary mb-0.5">Tolerance</span>
                                        <span className="text-lg font-black font-mono">±0.001mm</span>
                                    </div>
                                    <div className="w-px h-8 bg-glass-border" />
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 mb-0.5">Verification</span>
                                        <span className="text-lg font-black font-mono">100% Units</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Deployment Card */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="md:col-span-4 rounded-2xl bg-gradient-to-br from-gold-primary to-gold-dark p-8 flex flex-col justify-between text-black shadow-md"
                        >
                            <Activity size={32} className="mb-8" />
                            <div>
                                <h3 className="text-xl font-black uppercase mb-2 tracking-tight">Active <br/>Deployments</h3>
                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-85 leading-normal">Ensuring steady hardware supply pipelines for manufacturing yards nationwide.</p>
                            </div>
                        </motion.div>

                        {/* Hardened Alloys Card */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="md:col-span-4 rounded-2xl bg-surface-2 border border-glass-border p-8 flex flex-col shadow-md"
                        >
                            <div className="w-10 h-10 rounded-lg bg-surface-1 border border-glass-border flex items-center justify-center mb-6">
                                <ShieldCheck className="text-emerald-500" size={20} />
                            </div>
                            <h3 className="text-lg font-black uppercase mb-2">Hardened Alloys</h3>
                            <p className="text-text-secondary text-xs leading-relaxed font-semibold">Cylinders and roller shafts leverage aerospace-grade hardened alloys to prevent deflection under high torque loads.</p>
                        </motion.div>

                        {/* Factory Consulting Card */}
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className="md:col-span-8 rounded-2xl bg-surface-2 border border-glass-border p-8 flex items-center gap-8 group overflow-hidden shadow-md"
                        >
                            <div className="hidden sm:flex w-24 h-24 bg-surface-1 border border-glass-border rounded-xl flex-shrink-0 items-center justify-center">
                                <Factory size={40} className="text-gold-primary group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase mb-2">Workshop Layout Planning</h3>
                                <p className="text-text-secondary text-sm font-semibold">Our engineers help optimize machinery spacing, power configurations, and extraction positions to improve manufacturing workflow.</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 px-6 container mx-auto text-center relative z-10">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-16 text-text-primary">Core <span className="text-text-tertiary font-mono">Directives</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {values.map((v, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-14 h-14 rounded-xl bg-surface-1 border border-glass-border flex items-center justify-center mb-6 shadow-sm">
                                    {v.icon}
                                </div>
                                <h3 className="text-lg font-black uppercase mb-2 tracking-tight text-text-primary">{v.title}</h3>
                                <p className="text-text-secondary text-sm font-semibold leading-relaxed">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Directive Quote */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-5xl mx-auto bg-surface-1 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-xl border border-glass-border">
                    <div className="absolute top-0 right-0 w-[30vw] h-[30vw] bg-gold-muted blur-[100px] rounded-full pointer-events-none opacity-40" />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-primary mb-8 block">Operational Mission</span>
                        <h2 className="text-3xl md:text-5xl font-black text-text-primary uppercase tracking-tighter mb-12 leading-tight">
                            "Equipping gold artisans and jewelry factories with certified, high-grade hardware units."
                        </h2>
                        <div className="flex items-center justify-center gap-4">
                            <div className="h-px w-10 bg-glass-border" />
                            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-text-tertiary">Dinanath & Sons • Since 1980</p>
                            <div className="h-px w-10 bg-glass-border" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Bottom Actions */}
            <section className="pb-32 pt-12 px-6 text-center relative z-10">
                <div className="flex flex-col items-center gap-8">
                    <h3 className="text-2xl font-black uppercase tracking-tight text-text-primary">Upgrade Your Hardware Setup</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/shop">
                            <button className="h-14 px-10 text-black font-black uppercase tracking-[0.2em] rounded-xl text-[9px] shadow-lg hover:scale-105 active:scale-95 transition-all"
                                style={{ background: 'linear-gradient(135deg, #DFCE9F, #C5A059)' }}
                            >
                                Explore Hardware
                            </button>
                        </Link>
                        <Link href="/contact">
                            <button className="h-14 px-10 bg-surface-1 border border-glass-border text-text-primary font-black uppercase tracking-[0.2em] rounded-xl text-[9px] hover:bg-glass-border transition-all">
                                Technical Query
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
