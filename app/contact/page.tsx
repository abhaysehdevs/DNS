'use client';

import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { 
    MapPin, Phone, Mail, Clock, Check, Send, Sparkles, MessageSquare,
    Globe, ShieldCheck, Zap, Truck, Headphones, ChevronDown, Plus, Minus,
    ArrowUpRight, Building2, ExternalLink, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Contact() {
    const { language } = useAppStore();
    const t = translations[language].nav;
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');
        setTimeout(() => {
            setFormStatus('success');
        }, 1500);
    };

    const businessInfo = {
        address: '1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi 110006',
        phone: '9953435647',
        email: 'ajayabhay12872@gmail.com',
        hours: '11:00 AM - 8:00 PM (Mon-Sat)',
    };

    const supportTiers = [
        { 
            title: "Retail Support", 
            desc: "For individual artisans and studio setups.", 
            icon: <Zap size={20} />, 
            link: "retail-protocol",
            detail: "Order tracking, tool calibration, and individual warranties."
        },
        { 
            title: "B2B Logistics", 
            desc: "For large-scale factory deployments.", 
            icon: <Truck size={20} />, 
            link: "b2b-protocol",
            detail: "Custom quotes, bulk shipping nodes, and industrial contracts."
        },
        { 
            title: "Technical Unit", 
            desc: "Engineering and layout consulting.", 
            icon: <Building2 size={20} />, 
            link: "tech-protocol",
            detail: "Factory blueprinting, machine maintenance, and metallurgical advice."
        }
    ];

    const faqs = [
        {
            q: "What is the typical lead time for industrial machinery?",
            a: "Standard retail tools ship within 24-48 hours. Large industrial units (e.g., Rolling Mills) typically have a 2-3 week lead time depending on calibration requirements and global shipping nodes."
        },
        {
            q: "Do you offer on-site machine calibration?",
            a: "Yes. For wholesale partners, our technical team provides on-site installation and calibration across India. International support is handled via our digital engineering interface or local certified partners."
        },
        {
            q: "Can I request custom tool modifications?",
            a: "Absolutely. We specialize in metallurgical engineering and can modify tool specifications (hardness, dimensions, voltage) to meet specific manufacturing requirements."
        },
        {
            q: "How do I verify the authenticity of a Dinanath tool?",
            a: "Every tool comes with a unique serial number and a Holographic Certification Shield. You can verify your serial number through our digital database in the account portal."
        }
    ];

    return (
        <div className="min-h-screen bg-[#FFFFFF] text-[#1D1D1F] pt-40 md:pt-60 pb-24 noise-overlay selection:bg-[#C9A84C]/30 overflow-x-hidden">
            
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-[#C9A84C]/5 blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[20%] left-[-5%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    
                    {/* --- HEADER BLOCK --- */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-end gap-8 mb-32"
                    >
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-gold text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.4em] mb-10 shadow-lg">
                                <Headphones size={14} /> Global Communications Protocol
                            </div>
                            <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter uppercase mb-6 leading-[0.85]">
                                Nexus <br/>
                                <span style={{ background: 'linear-gradient(135deg, #1D1D1F, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Uplink</span>
                            </h1>
                        </div>
                        <p className="text-[#86868B] text-xl font-medium max-w-sm mb-4 leading-relaxed">
                            Established in Chandni Chowk, Delhi. Engineered to support jewelry manufacturers across 40+ countries.
                        </p>
                    </motion.div>

                    {/* --- SUPPORT TIER MATRIX --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                        {supportTiers.map((tier, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-strong rounded-[2.5rem] p-10 border border-black/[0.04] hover:border-[#C9A84C]/30 transition-all duration-500 group relative overflow-hidden flex flex-col h-full shadow-xl bg-white"
                            >
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#C9A84C]/5 rounded-full blur-2xl group-hover:bg-[#C9A84C]/10 transition-colors" />
                                <div className="w-14 h-14 rounded-2xl glass mb-10 flex items-center justify-center text-[#C9A84C] group-hover:scale-110 transition-transform shadow-sm">
                                    {tier.icon}
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">{tier.title}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#86868B] mb-6">{tier.desc}</p>
                                <p className="text-sm text-[#5A5A6A] leading-relaxed mb-10">{tier.detail}</p>
                                <button className="mt-auto text-[9px] font-black uppercase tracking-[0.3em] text-[#C9A84C] flex items-center gap-2 group/link">
                                    Access Protocol <ArrowUpRight size={14} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start mb-32">
                        
                        {/* --- FORM COLUMN --- */}
                        <div className="lg:col-span-7">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-strong rounded-[3.5rem] p-10 md:p-16 border border-black/[0.04] shadow-2xl relative overflow-hidden bg-white"
                            >
                                <div className="mb-12">
                                    <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Transmission Interface</h2>
                                    <p className="text-[10px] font-black text-[#86868B] uppercase tracking-[0.3em]">Encrypted Data Stream • Instant Synchronization</p>
                                </div>

                                <AnimatePresence mode="wait">
                                    {formStatus === 'success' ? (
                                        <motion.div 
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="text-center py-20"
                                        >
                                            <div className="w-24 h-24 rounded-full glass-gold flex items-center justify-center mx-auto mb-10 shadow-2xl">
                                                <Check size={48} className="text-[#C9A84C]" />
                                            </div>
                                            <h3 className="text-3xl font-black text-[#1D1D1F] uppercase tracking-tight mb-4">Transmission Successful</h3>
                                            <p className="text-[#86868B] font-medium mb-12">Our technical department has received your request. Expected response: &lt; 24h.</p>
                                            <button onClick={() => setFormStatus('idle')} className="text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.3em] hover:opacity-70 transition-opacity">Reset Interface</button>
                                        </motion.div>
                                    ) : (
                                        <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8" onSubmit={handleSendMessage}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Operator Identity</label>
                                                    <input required type="text" className="w-full h-16 glass rounded-2xl px-8 text-[#1D1D1F] placeholder-[#86868B]/40 focus:border-[#C9A84C]/30 focus:outline-none transition-all font-semibold" placeholder="ENTER FULL NAME" />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Return Address</label>
                                                    <input required type="email" className="w-full h-16 glass rounded-2xl px-8 text-[#1D1D1F] placeholder-[#86868B]/40 focus:border-[#C9A84C]/30 focus:outline-none transition-all font-semibold" placeholder="EMAIL@DOMAIN.COM" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Operation Type</label>
                                                <select className="w-full h-16 glass rounded-2xl px-8 text-[#1D1D1F] focus:border-[#C9A84C]/30 focus:outline-none transition-all font-bold appearance-none cursor-pointer">
                                                    <option>Wholesale Procurement</option>
                                                    <option>Technical Support</option>
                                                    <option>Order Inquiries</option>
                                                    <option>Other / Direct Contact</option>
                                                </select>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#86868B] ml-2">Mission Parameters (Message)</label>
                                                <textarea required rows={6} className="w-full glass rounded-3xl p-8 text-[#1D1D1F] placeholder-[#86868B]/40 focus:border-[#C9A84C]/30 focus:outline-none transition-all font-semibold resize-none" placeholder="DESCRIBE YOUR INDUSTRIAL REQUIREMENTS..." />
                                            </div>
                                            <Button type="submit" disabled={formStatus === 'submitting'} className="w-full h-20 text-[#0A0A0F] font-black text-xs uppercase tracking-[0.4em] rounded-2xl relative overflow-hidden group/btn shadow-xl hover:shadow-2xl" style={{ background: 'linear-gradient(135deg, #E8D48B, #C9A84C, #8B6914)' }}>
                                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-[20deg]" />
                                                <div className="flex items-center justify-center gap-4 relative z-10">
                                                    {formStatus === 'submitting' ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                                                    {formStatus === 'submitting' ? 'Uplinking...' : 'Establish Connection'}
                                                </div>
                                            </Button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* --- INFO COLUMN --- */}
                        <div className="lg:col-span-5 space-y-8">
                            
                            {/* Distribution Hub Card */}
                            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="glass-strong rounded-[3rem] p-10 border border-black/[0.04] shadow-xl relative overflow-hidden bg-white">
                                <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
                                    <img src="/contact_map_premium_1777173688004.png" className="w-full h-full object-cover" alt="Global Hubs" />
                                </div>
                                <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-3"><Globe className="text-[#C9A84C]" size={20} /> Primary Node</h3>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-start gap-5">
                                        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-[#C9A84C] shrink-0"><MapPin size={18} /></div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#86868B] mb-1">Corporate HQ</p>
                                            <p className="text-sm font-bold leading-relaxed">{businessInfo.address}</p>
                                            <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(businessInfo.address)}`, '_blank')} className="text-[8px] font-black uppercase text-[#C9A84C] mt-3 flex items-center gap-2 hover:opacity-70 transition-opacity">View Logistics Map <ExternalLink size={10}/></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-blue-500 shrink-0"><Phone size={18} /></div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#86868B] mb-1">Technical Hotline</p>
                                            <p className="text-sm font-bold">+91 {businessInfo.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5">
                                        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-emerald-500 shrink-0"><Mail size={18} /></div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#86868B] mb-1">Email Command</p>
                                            <p className="text-sm font-bold">{businessInfo.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Live Factory Hub */}
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-strong p-10 rounded-[3rem] border border-[#C9A84C]/20 bg-[#C9A84C]/5 flex flex-col items-center text-center group shadow-2xl">
                                <div className="w-20 h-20 rounded-full glass-gold flex items-center justify-center mb-8 shadow-xl relative overflow-hidden">
                                    <MessageSquare size={32} className="text-[#C9A84C] relative z-10" />
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Direct WhatsApp Uplink</h3>
                                <p className="text-xs text-[#86868B] font-medium leading-relaxed mb-10 max-w-xs">Need immediate technical specs or a wholesale quotation? Connect with our senior engineers directly.</p>
                                <Button className="w-full h-16 glass-gold text-[#0A0A0F] font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95" onClick={() => window.open(`https://wa.me/919953435647`, '_blank')}>Initiate Session</Button>
                            </motion.div>
                        </div>
                    </div>

                    {/* --- FAQ SECTION --- */}
                    <section className="mb-32">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">Support <span className="text-[#86868B]">Intelligence</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C9A84C]">Standard Operational FAQs</p>
                        </div>

                        <div className="max-w-4xl mx-auto space-y-6">
                            {faqs.map((faq, i) => (
                                <motion.div key={i} className="glass-strong rounded-[2rem] border border-black/[0.04] overflow-hidden bg-white shadow-lg">
                                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-8 flex items-center justify-between text-left group">
                                        <span className="text-lg font-black uppercase tracking-tight text-[#1D1D1F] group-hover:text-[#C9A84C] transition-colors">{faq.q}</span>
                                        <div className={`w-10 h-10 rounded-full glass flex items-center justify-center transition-all duration-500 ${openFaq === i ? 'bg-[#C9A84C] text-white rotate-180' : 'text-[#86868B]'}`}>
                                            {openFaq === i ? <Minus size={18} /> : <Plus size={18} />}
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-black/[0.04]">
                                                <div className="p-8 text-[#5A5A6A] text-base leading-relaxed font-medium">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* --- LOGISTICS PROTOCOL --- */}
                    <section className="pb-32">
                        <div className="glass-strong rounded-[4rem] p-12 md:p-24 border border-black/[0.04] bg-[#0A0A0F] text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C]/5 blur-[120px] rounded-full pointer-events-none" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
                                <div>
                                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                                        <Truck size={14} /> Logistics Protocol
                                    </div>
                                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-tight">Global <br/>Distribution</h2>
                                    <p className="text-xl text-[#8E8E9A] font-medium leading-relaxed mb-12">Every order is processed through our triple-verification protocol to ensure technical integrity and safe transit.</p>
                                    <div className="space-y-4">
                                        {['Triple-Layer Industrial Packaging', 'Full Transit Insurance Coverage', 'Real-time Telemetry Tracking'].map((item, i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className="w-6 h-6 rounded-full bg-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C]"><Check size={14} strokeWidth={4} /></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="aspect-square glass rounded-[3rem] p-12 border border-white/5 flex flex-col justify-center items-center text-center">
                                    <Globe size={80} className="text-[#C9A84C] mb-10 animate-pulse" />
                                    <h3 className="text-3xl font-black uppercase mb-6">40+ Countries</h3>
                                    <p className="text-[#8E8E9A] text-sm font-medium leading-relaxed">From the heart of Delhi to the manufacturing hubs of the world. Global standard tools, delivered.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}


