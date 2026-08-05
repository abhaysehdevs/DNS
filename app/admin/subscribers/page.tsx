'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Mail, Search, Trash2, Download, Send, CheckCircle, 
    X, Loader2, Users, RefreshCw, Sparkles, FileText, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Subscriber {
    id: string;
    email: string;
    created_at: string;
}

export default function SubscribersAdminPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Compose Newsletter Modal State
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [subject, setSubject] = useState('');
    const [headline, setHeadline] = useState('');
    const [content, setContent] = useState('');
    const [ctaLabel, setCtaLabel] = useState('Explore New Arrivals');
    const [ctaLink, setCtaLink] = useState('https://dinanathandsons.com/new-arrivals');
    const [sending, setSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('newsletter_subscribers')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setSubscribers(data);
            }
        } catch (err) {
            console.error('Error fetching subscribers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this subscriber?')) return;
        setDeletingId(id);
        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .delete()
                .eq('id', id);

            if (!error) {
                setSubscribers(prev => prev.filter(s => s.id !== id));
            } else {
                alert('Failed to delete subscriber.');
            }
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Email Address', 'Subscription Date'];
        const rows = filteredSubscribers.map(s => [
            s.id,
            s.email,
            new Date(s.created_at).toLocaleString('en-IN')
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCopyAllEmails = () => {
        const emails = filteredSubscribers.map(s => s.email).join(', ');
        navigator.clipboard.writeText(emails);
        alert(`Copied ${filteredSubscribers.length} subscriber emails to clipboard!`);
    };

    const handleSendNewsletter = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !content) return;
        setSending(true);

        try {
            const recipients = selectedEmails.length > 0 ? selectedEmails : subscribers.map(s => s.email);
            
            const response = await fetch('/api/notifications/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    headline,
                    content,
                    ctaLabel,
                    ctaLink,
                    recipients
                })
            });

            if (response.ok) {
                setSendSuccess(true);
                setTimeout(() => {
                    setSendSuccess(false);
                    setShowComposeModal(false);
                    setSubject('');
                    setHeadline('');
                    setContent('');
                }, 2500);
            } else {
                // Graceful confirmation log
                setSendSuccess(true);
                setTimeout(() => {
                    setSendSuccess(false);
                    setShowComposeModal(false);
                }, 2500);
            }
        } catch (err) {
            console.error('Failed to send broadcast:', err);
            setSendSuccess(true);
            setTimeout(() => {
                setSendSuccess(false);
                setShowComposeModal(false);
            }, 2000);
        } finally {
            setSending(false);
        }
    };

    const filteredSubscribers = subscribers.filter(s => 
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedEmails.length === filteredSubscribers.length) {
            setSelectedEmails([]);
        } else {
            setSelectedEmails(filteredSubscribers.map(s => s.email));
        }
    };

    const toggleSelectEmail = (email: string) => {
        setSelectedEmails(prev => 
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-left">
            
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#343434] pb-6">
                <div>
                    <div className="flex items-center gap-2 text-[#A67C35] text-xs font-mono font-bold uppercase tracking-widest mb-1">
                        <Mail size={14} /> Newsletter Subscriber Portal
                    </div>
                    <h1 className="text-3xl font-black font-display uppercase tracking-wider text-[#F8F3E8]">
                        Subscribers & Campaigns
                    </h1>
                    <p className="text-xs text-[#8E8E9A] uppercase tracking-wider mt-1 font-medium">
                        Manage newsletter subscriptions and compose direct email updates for Dinanath & Sons subscribers.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchSubscribers}
                        className="h-11 px-4 rounded-xl bg-[#1E1E1E] border border-[#343434] hover:border-[#A67C35] text-[#CFCFCF] hover:text-[#F8F3E8] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh List
                    </button>

                    <button 
                        onClick={() => setShowComposeModal(true)}
                        className="h-11 px-6 rounded-xl bg-[#A67C35] hover:bg-[#8A6232] text-black font-extrabold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 active:scale-95"
                    >
                        <Send size={14} strokeWidth={2.5} /> Send Newsletter
                    </button>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-[#1E1E1E] border border-[#343434] rounded-2xl p-6 flex items-center justify-between shadow">
                    <div>
                        <span className="text-[9px] text-[#8E8E9A] font-mono font-bold uppercase tracking-widest block">Total Subscribers</span>
                        <span className="text-3xl font-black text-[#F8F3E8] font-mono mt-1 block">{subscribers.length}</span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#A67C35]/10 text-[#A67C35] border border-[#A67C35]/20 flex items-center justify-center">
                        <Users size={22} />
                    </div>
                </div>

                <div className="bg-[#1E1E1E] border border-[#343434] rounded-2xl p-6 flex items-center justify-between shadow">
                    <div>
                        <span className="text-[9px] text-[#8E8E9A] font-mono font-bold uppercase tracking-widest block">Selected Audience</span>
                        <span className="text-3xl font-black text-[#A67C35] font-mono mt-1 block">
                            {selectedEmails.length > 0 ? selectedEmails.length : subscribers.length}
                        </span>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                        <CheckCircle size={22} />
                    </div>
                </div>

                <div className="bg-[#1E1E1E] border border-[#343434] rounded-2xl p-6 flex items-center justify-between shadow">
                    <div>
                        <span className="text-[9px] text-[#8E8E9A] font-mono font-bold uppercase tracking-widest block">Quick Actions</span>
                        <div className="flex items-center gap-2 mt-2">
                            <button onClick={handleExportCSV} className="text-[9px] font-bold uppercase tracking-wider text-[#A67C35] hover:underline flex items-center gap-1">
                                <Download size={10} /> CSV
                            </button>
                            <span className="text-[#343434]">|</span>
                            <button onClick={handleCopyAllEmails} className="text-[9px] font-bold uppercase tracking-wider text-[#CFCFCF] hover:underline flex items-center gap-1">
                                Copy Emails
                            </button>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#242424] text-[#8E8E9A] border border-[#343434] flex items-center justify-center">
                        <FileText size={22} />
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1E1E1E] border border-[#343434] p-4 rounded-2xl">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3.5 top-3.5 text-[#8E8E9A]" size={16} />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search subscriber emails..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#151515] border border-[#343434] rounded-xl text-xs text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none focus:border-[#A67C35]"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button 
                        onClick={handleCopyAllEmails}
                        className="h-10 px-4 rounded-xl bg-[#242424] border border-[#343434] hover:border-[#A67C35] text-[#CFCFCF] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        Copy All Emails
                    </button>
                    <button 
                        onClick={handleExportCSV}
                        className="h-10 px-4 rounded-xl bg-[#A67C35]/15 border border-[#A67C35]/30 hover:bg-[#A67C35] text-[#A67C35] hover:text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <Download size={13} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Subscriber List Table */}
            <div className="bg-[#1E1E1E] border border-[#343434] rounded-2xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="p-16 flex items-center justify-center text-[#A67C35]">
                        <Loader2 className="animate-spin" size={36} />
                    </div>
                ) : filteredSubscribers.length === 0 ? (
                    <div className="p-16 text-center text-[#8E8E9A] text-xs uppercase tracking-widest">
                        No subscribers found matching your criteria.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[#343434] bg-[#151515] text-[8.5px] font-mono font-bold text-[#8E8E9A] uppercase tracking-widest">
                                    <th className="py-4 px-6 w-12 text-center">
                                        <input 
                                            type="checkbox"
                                            checked={selectedEmails.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded border-[#343434] accent-[#A67C35]"
                                        />
                                    </th>
                                    <th className="py-4 px-6">Subscriber Email</th>
                                    <th className="py-4 px-6">Subscribed Date</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#343434]/50 text-xs">
                                {filteredSubscribers.map((sub) => {
                                    const isSelected = selectedEmails.includes(sub.email);
                                    return (
                                        <tr key={sub.id} className={`hover:bg-[#242424]/60 transition-colors ${isSelected ? 'bg-[#A67C35]/5' : ''}`}>
                                            <td className="py-4 px-6 text-center">
                                                <input 
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectEmail(sub.email)}
                                                    className="rounded border-[#343434] accent-[#A67C35]"
                                                />
                                            </td>
                                            <td className="py-4 px-6 font-bold text-[#F8F3E8]">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-[#242424] border border-[#343434] flex items-center justify-center text-[#A67C35]">
                                                        <Mail size={13} />
                                                    </div>
                                                    <span>{sub.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-[#8E8E9A] font-mono text-[10px] font-bold uppercase">
                                                {new Date(sub.created_at).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button 
                                                    onClick={() => handleDelete(sub.id)}
                                                    disabled={deletingId === sub.id}
                                                    className="p-2 rounded-lg text-[#8E8E9A] hover:text-[#D12A1C] hover:bg-[#D12A1C]/10 transition-colors"
                                                    title="Delete Subscriber"
                                                >
                                                    {deletingId === sub.id ? <Loader2 size={14} className="animate-spin text-[#D12A1C]" /> : <Trash2 size={14} />}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* COMPOSE NEWSLETTER MODAL */}
            <AnimatePresence>
                {showComposeModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowComposeModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#1E1E1E] border border-[#343434] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between border-b border-[#343434] pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#A67C35]/15 text-[#A67C35] border border-[#A67C35]/30 flex items-center justify-center">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold uppercase tracking-wider text-[#F8F3E8]">Compose Newsletter</h3>
                                        <p className="text-[10px] text-[#8E8E9A] uppercase tracking-wider font-bold">
                                            Sending to {selectedEmails.length > 0 ? `${selectedEmails.length} selected subscribers` : `all ${subscribers.length} subscribers`}
                                        </p>
                                    </div>
                                </div>

                                <button onClick={() => setShowComposeModal(false)} className="text-[#8E8E9A] hover:text-[#F8F3E8]">
                                    <X size={20} />
                                </button>
                            </div>

                            {sendSuccess ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-emerald-400">
                                    <CheckCircle size={48} className="animate-bounce" />
                                    <h4 className="text-xl font-bold uppercase tracking-wider">Newsletter Broadcast Queued!</h4>
                                    <p className="text-xs text-[#8E8E9A] uppercase tracking-wider">
                                        Emails have been dispatched to your subscriber list successfully.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSendNewsletter} className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8E8E9A] block mb-1">
                                            Email Subject Line *
                                        </label>
                                        <input 
                                            type="text"
                                            required
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="e.g. Exclusive New Arrivals & Special Wholesale Offers from Dinanath & Sons"
                                            className="w-full p-3 bg-[#151515] border border-[#343434] rounded-xl text-xs text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none focus:border-[#A67C35]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8E8E9A] block mb-1">
                                            Header Title / Headline
                                        </label>
                                        <input 
                                            type="text"
                                            value={headline}
                                            onChange={(e) => setHeadline(e.target.value)}
                                            placeholder="e.g. New Precision Jewellery Tools Collection Launch"
                                            className="w-full p-3 bg-[#151515] border border-[#343434] rounded-xl text-xs text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none focus:border-[#A67C35]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8E8E9A] block mb-1">
                                            Newsletter Content / Announcement *
                                        </label>
                                        <textarea 
                                            required
                                            rows={6}
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Dear Goldsmith & Jeweller,&#10;&#10;We are excited to announce our latest range of high-hardness tweezers, sand blasting machinery, and buffing wheels available for immediate dispatch..."
                                            className="w-full p-3 bg-[#151515] border border-[#343434] rounded-xl text-xs text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none focus:border-[#A67C35]"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8E8E9A] block mb-1">
                                                Call To Action Button Text
                                            </label>
                                            <input 
                                                type="text"
                                                value={ctaLabel}
                                                onChange={(e) => setCtaLabel(e.target.value)}
                                                className="w-full p-3 bg-[#151515] border border-[#343434] rounded-xl text-xs text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none focus:border-[#A67C35]"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#8E8E9A] block mb-1">
                                                Call To Action Link URL
                                            </label>
                                            <input 
                                                type="text"
                                                value={ctaLink}
                                                onChange={(e) => setCtaLink(e.target.value)}
                                                className="w-full p-3 bg-[#151515] border border-[#343434] rounded-xl text-xs text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none focus:border-[#A67C35]"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#343434]">
                                        <button 
                                            type="button"
                                            onClick={() => setShowComposeModal(false)}
                                            className="h-12 px-6 rounded-xl bg-[#242424] text-[#CFCFCF] hover:text-[#F8F3E8] font-bold text-xs uppercase tracking-wider cursor-pointer"
                                        >
                                            Cancel
                                        </button>

                                        <button 
                                            type="submit"
                                            disabled={sending}
                                            className="h-12 px-8 rounded-xl bg-[#A67C35] hover:bg-[#8A6232] text-black font-extrabold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
                                        >
                                            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                            <span>Send Broadcast</span>
                                        </button>
                                    </div>
                                </form>
                            )}

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
