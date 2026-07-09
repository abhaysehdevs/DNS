'use client';

import { useAppStore } from '@/lib/store';
import { translations } from '@/lib/translations';
import { 
    MapPin, Phone, Mail, Clock, Check, Send, Sparkles, MessageSquare,
    Globe, ShieldCheck, Zap, Truck, Headphones, Minus, Plus,
    ArrowUpRight, ExternalLink, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';

export default function Contact() {
    const { language } = useAppStore();
    const t = translations[language].nav;
    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [opsClass, setOpsClass] = useState('Wholesale Procurement Node');
    const [message, setMessage] = useState('');

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');

        try {
            await supabase.from('contact_messages').insert({
                name: name,
                email: email,
                category: opsClass,
                message: message
            });

            // Trigger Email Notification
            await fetch('/api/notifications/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'contact',
                    contactName: name,
                    contactEmail: email,
                    category: opsClass,
                    message: message
                })
            });
        } catch (err) {
            console.warn('Database save / email notification failed: ', err);
        }

        setFormStatus('success');
        setName('');
        setEmail('');
        setOpsClass('Wholesale Procurement Node');
        setMessage('');
    };

    const businessInfo = {
        address: '1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi 110006',
        phone: '9953435647',
        email: 'info@daridhinaathandsons.com',
        hours: '11:00 AM - 8:00 PM (Mon-Sat)',
    };

    const supportTiers = [
        { 
            title: "Retail Support", 
            desc: "For individual jewelers and studio setups.", 
            icon: <Zap size={18} />, 
            link: "retail-protocol",
            detail: "Order dispatch status, accessory calibrations, and warranties."
        },
        { 
            title: "B2B Logistics", 
            desc: "For jewelry factory operations.", 
            icon: <Truck size={18} />, 
            link: "b2b-protocol",
            detail: "Custom quotes, bulk export shipments, and wholesale supply plans."
        },
        { 
            title: "Technical Unit", 
            desc: "Engineering setup consultation.", 
            icon: <Globe size={18} />, 
            link: "tech-protocol",
            detail: "Workshop blueprint layouts, machinery assembly, and metallurgy specs."
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

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <div className="min-h-screen bg-surface-2 text-text-primary pt-32 md:pt-44 pb-24 selection:bg-gold-primary/30 overflow-x-hidden blueprint-grid">
            
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] right-[-5%] w-[40vw] h-[40vw] bg-gold-muted blur-[120px] rounded-full animate-pulse-glow" />
                <div className="absolute bottom-[20%] left-[-5%] w-[40vw] h-[40vw] bg-cyan-glow/5 dark:bg-cyan-glow/3 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20"
                    >
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-gold text-gold-primary text-[8px] font-black uppercase tracking-[0.3em] mb-6 shadow-sm">
                                <Headphones size={12} /> Direct Support Channels
                            </div>
                            <h1 className="text-5xl md:text-[6.5rem] font-black tracking-tighter uppercase mb-4 leading-[0.85] text-text-primary">
                                Contact <br/>
                                <span className="text-transparent bg-gradient-to-r from-text-primary to-gold-primary bg-clip-text">Us</span>
                            </h1>
                        </div>
                        <p className="text-text-secondary text-base font-medium max-w-sm mb-2 leading-relaxed">
                            Based in Delhi, India. Helping jewelry manufacturing setups in over 40 countries.
                        </p>
                    </motion.div>
 
                    {/* Support tiers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                        {supportTiers.map((tier, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-surface-1 border border-glass-border rounded-2xl p-8 hover:border-gold-primary transition-all relative overflow-hidden flex flex-col h-full shadow-md"
                            >
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gold-muted rounded-full blur-xl" />
                                <div className="w-11 h-11 rounded-xl bg-surface-2 border border-glass-border mb-8 flex items-center justify-center text-gold-primary shadow-sm">
                                    {tier.icon}
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{tier.title}</h3>
                                <p className="text-[8px] font-black uppercase tracking-widest text-text-tertiary mb-4 font-mono">{tier.desc}</p>
                                <p className="text-xs text-text-secondary leading-relaxed mb-8">{tier.detail}</p>
                                <button className="mt-auto text-[8px] font-black uppercase tracking-[0.25em] text-gold-primary flex items-center gap-1.5 hover:underline cursor-pointer">
                                    Contact Support <ArrowUpRight size={12} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
 
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
                        
                        {/* Support Message Form */}
                        <div className="lg:col-span-7">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-surface-1 rounded-3xl p-8 md:p-12 border border-glass-border shadow-xl relative overflow-hidden"
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Send a Message</h2>
                                    <p className="text-[8px] font-black text-text-tertiary uppercase tracking-[0.25em] font-mono">We respond to support queries within 24 hours</p>
                                </div>
 
                                <AnimatePresence mode="wait">
                                    {formStatus === 'success' ? (
                                        <motion.div 
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.96 }}
                                            className="text-center py-16"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-gold-primary/10 flex items-center justify-center mx-auto mb-8 border border-gold-primary/20">
                                                <Check size={32} className="text-gold-primary" />
                                            </div>
                                            <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">Message Sent</h3>
                                            <p className="text-text-secondary text-sm font-medium mb-8">We have received your support message and will respond shortly.</p>
                                            <button onClick={() => setFormStatus('idle')} className="text-[9px] font-black text-gold-primary uppercase tracking-[0.25em] hover:underline cursor-pointer">Send another message</button>
                                        </motion.div>
                                    ) : (
                                        <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6" onSubmit={handleSendMessage}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[8px] font-black uppercase tracking-[0.15em] text-text-tertiary ml-1 font-mono">Your Name</label>
                                                    <input required type="text" className="w-full h-12 bg-surface-2 border border-glass-border rounded-xl px-5 text-text-primary placeholder-text-tertiary/40 focus:border-gold-primary focus:outline-none transition-all text-xs font-semibold" placeholder="FULL NAME" value={name} onChange={(e) => setName(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[8px] font-black uppercase tracking-[0.15em] text-text-tertiary ml-1 font-mono">Email Address</label>
                                                    <input required type="email" className="w-full h-12 bg-surface-2 border border-glass-border rounded-xl px-5 text-text-primary placeholder-text-tertiary/40 focus:border-gold-primary focus:outline-none transition-all text-xs font-semibold" placeholder="EMAIL@DOMAIN.COM" value={email} onChange={(e) => setEmail(e.target.value)} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase tracking-[0.15em] text-text-tertiary ml-1 font-mono">Inquiry Type</label>
                                                <select className="w-full h-12 bg-surface-2 border border-glass-border rounded-xl px-5 text-text-primary focus:border-gold-primary focus:outline-none transition-all text-xs font-bold appearance-none cursor-pointer" value={opsClass} onChange={(e) => setOpsClass(e.target.value)}>
                                                    <option>Wholesale Procurement</option>
                                                    <option>Technical Support</option>
                                                    <option>Order & Shipping</option>
                                                    <option>General Inquiry</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black uppercase tracking-[0.15em] text-text-tertiary ml-1 font-mono">Message</label>
                                                <textarea required rows={4} className="w-full bg-surface-2 border border-glass-border rounded-xl p-5 text-text-primary placeholder-text-tertiary/40 focus:border-gold-primary focus:outline-none transition-all text-xs font-semibold resize-none" placeholder="How can we help you?" value={message} onChange={(e) => setMessage(e.target.value)} />
                                            </div>
                                            <Button type="submit" disabled={formStatus === 'submitting'} className="w-full h-14 text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-xl relative overflow-hidden group/btn shadow shadow-gold-primary/15" style={{ background: 'linear-gradient(135deg, #DFCE9F, #C5A059)' }}>
                                                <div className="flex items-center justify-center gap-3 relative z-10">
                                                    {formStatus === 'submitting' ? <Loader2 className="animate-spin" size={16} /> : <Send size={15} />}
                                                    {formStatus === 'submitting' ? 'SENDING MESSAGE...' : 'SEND MESSAGE'}
                                                </div>
                                            </Button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>
 
                        {/* Distribution coordinates */}
                        <div className="lg:col-span-5 space-y-6">
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface-1 border border-glass-border rounded-3xl p-8 shadow-md relative overflow-hidden">
                                <h3 className="text-lg font-black uppercase mb-6 flex items-center gap-2 font-mono"><Globe className="text-gold-primary" size={18} /> Our Office</h3>
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-surface-2 border border-glass-border flex items-center justify-center text-gold-primary shrink-0"><MapPin size={15} /></div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-text-tertiary mb-0.5">Corporate HQ</p>
                                            <p className="text-xs font-bold leading-relaxed">{businessInfo.address}</p>
                                            <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(businessInfo.address)}`, '_blank')} className="text-[7px] font-black uppercase text-gold-primary mt-2 flex items-center gap-1.5 hover:underline cursor-pointer">View Map <ExternalLink size={8}/></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-surface-2 border border-glass-border flex items-center justify-center text-blue-500 shrink-0"><Phone size={15} /></div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-text-tertiary mb-0.5">Support Desk</p>
                                            <p className="text-xs font-bold">+91 {businessInfo.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-surface-2 border border-glass-border flex items-center justify-center text-emerald-500 shrink-0"><Mail size={15} /></div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-text-tertiary mb-0.5">Email Address</p>
                                            <p className="text-xs font-bold">{businessInfo.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
 
                            {/* WhatsApp Support */}
                            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-surface-1 border border-glass-border p-8 rounded-3xl flex flex-col items-center text-center shadow-md">
                                <div className="w-14 h-14 rounded-full bg-gold-primary/10 flex items-center justify-center mb-6 shadow relative overflow-hidden">
                                    <MessageSquare size={24} className="text-gold-primary relative z-10" />
                                    <div className="absolute inset-0 bg-gold-primary/5 animate-pulse" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-2">WhatsApp Support</h3>
                                <p className="text-[10px] text-text-secondary font-semibold leading-relaxed mb-6 max-w-xs">Chat directly with our support team for bulk order planning and inquiries.</p>
                                <Button className="w-full h-12 text-black font-black text-[9px] uppercase tracking-[0.25em] rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-95" onClick={() => window.open(`https://wa.me/919953435647`, '_blank')}
                                  style={{ background: 'linear-gradient(135deg, #DFCE9F, #C5A059)' }}
                                >Start Chat</Button>
                            </motion.div>
                        </div>
                    </div>
 
                    {/* FAQ accordion */}
                    <section className="mb-20">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-3">Support <span className="text-text-tertiary font-mono">Intelligence</span></h2>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-primary">Frequently referenced setups</p>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            {faqs.map((faq, i) => (
                                <div key={i} className="bg-surface-1 border border-glass-border rounded-xl overflow-hidden shadow-sm">
                                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-6 flex items-center justify-between text-left group cursor-pointer">
                                        <span className="text-sm font-black uppercase tracking-tight text-text-primary group-hover:text-gold-primary transition-colors">{faq.q}</span>
                                        <div className={`w-8 h-8 rounded-full bg-surface-2 border border-glass-border flex items-center justify-center transition-all duration-300 ${openFaq === i ? 'bg-gold-primary text-black rotate-180' : 'text-text-tertiary'}`}>
                                            {openFaq === i ? <Minus size={14} /> : <Plus size={14} />}
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-glass-border">
                                                <div className="p-6 text-text-secondary text-xs leading-relaxed font-semibold">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Global distribution */}
                    <section className="pb-12">
                        <div className="bg-surface-1 rounded-[2.5rem] p-10 md:p-16 border border-glass-border text-text-primary relative overflow-hidden shadow-xl tech-grid">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-gold-muted rounded-full blur-[100px] pointer-events-none opacity-40" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-2 border border-glass-border text-gold-primary text-[8px] font-black uppercase tracking-[0.25em] mb-6 shadow-sm">
                                        <Truck size={12} /> Logistics Node
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">Global <br/>Distribution</h2>
                                    <p className="text-sm text-text-secondary font-semibold leading-relaxed mb-8">Every order undergoes triple validation to verify packaging density and shipping safety before transit.</p>
                                    <div className="space-y-3">
                                        {['Triple-Layer Industrial Packaging', 'Transit Insurance Coverage', 'Real-time Tracking Updates'].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="w-5 h-5 rounded-full bg-gold-primary/20 flex items-center justify-center text-gold-primary"><Check size={11} strokeWidth={4} /></div>
                                                <span className="text-[9px] font-black uppercase tracking-wider text-text-primary font-bold">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="aspect-square bg-surface-2 border border-glass-border rounded-[2rem] p-8 flex flex-col justify-center items-center text-center">
                                    <Globe size={60} className="text-gold-primary mb-6 animate-pulse" />
                                    <h3 className="text-2xl font-black uppercase mb-3">40+ Countries</h3>
                                    <p className="text-text-secondary text-xs font-semibold leading-relaxed">Delivering certified gold workshop equipment and metallurgy tooling configurations worldwide.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
        </>
    );
}
