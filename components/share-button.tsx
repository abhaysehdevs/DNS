'use client';

import { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Send, Twitter, Facebook } from 'lucide-react';
import { getProductUrl } from '@/lib/slug';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
    product: {
        id: string;
        name: string;
        slug?: string;
        description?: string;
        category?: string;
    };
    variant?: 'icon' | 'button' | 'pill';
    className?: string;
}

export function ShareButton({ product, variant = 'button', className = '' }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getFullUrl = () => {
        return `https://dinanathandsons.com${getProductUrl(product)}`;
    };

    const handleCopy = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const url = getFullUrl();
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    const handleNativeShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const url = getFullUrl();

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: `${product.name} | Dinanath & Sons`,
                    text: `Check out ${product.name} at Dinanath & Sons Jewellery Tools & Machinery:`,
                    url: url
                });
                return;
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setIsMenuOpen(!isMenuOpen);
                }
            }
        } else {
            setIsMenuOpen(!isMenuOpen);
        }
    };

    const shareUrl = typeof window !== 'undefined' ? getFullUrl() : '';
    const shareText = `Check out ${product.name} at Dinanath & Sons:`;

    // Icon only variant (for product cards)
    if (variant === 'icon') {
        return (
            <div className="relative">
                <button
                    onClick={handleCopy}
                    title="Copy unique product link"
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all duration-300 border ${
                        copied
                            ? 'bg-[#A67C35] text-black border-[#A67C35]'
                            : 'bg-[#151515] border-[#343434] text-[#8E8E9A] hover:text-[#A67C35] hover:border-[#A67C35]/30'
                    } ${className}`}
                >
                    {copied ? <Check size={13} strokeWidth={3} /> : <Share2 size={13} />}
                </button>

                <AnimatePresence>
                    {copied && (
                        <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                            className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#A67C35] text-black text-[7.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-30 pointer-events-none"
                        >
                            Link Copied!
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Button / Pill variant (for Product Detail Page)
    return (
        <div className="relative">
            <button
                onClick={handleNativeShare}
                className={`h-14 px-5 rounded-lg border border-[#343434] bg-[#151515] hover:bg-[#1E1E1E] hover:border-[#A67C35]/40 text-[#F8F3E8] font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${className}`}
            >
                <Share2 size={16} className="text-[#A67C35]" />
                <span>Share</span>
            </button>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:bg-transparent"
                            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 bottom-full mb-3 w-72 sm:w-80 bg-[#1E1E1E] border border-[#343434] rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 text-left"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-3 border-b border-[#343434] pb-2.5">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#A67C35]">Share Unique Product</span>
                                <button onClick={() => setIsMenuOpen(false)} className="text-[#8E8E9A] hover:text-[#F8F3E8] text-xs font-bold">✕</button>
                            </div>

                            {/* Direct URL Copy Bar */}
                            <div className="flex items-center bg-[#151515] border border-[#343434] rounded-xl p-1.5 mb-3">
                                <input
                                    readOnly
                                    type="text"
                                    value={shareUrl}
                                    className="bg-transparent text-[9.5px] font-mono text-[#CFCFCF] px-2 w-full focus:outline-none truncate"
                                />
                                <button
                                    onClick={() => handleCopy()}
                                    className={`px-3 py-1.5 rounded-lg text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 transition-all ${
                                        copied 
                                            ? 'bg-emerald-500 text-black' 
                                            : 'bg-[#A67C35] hover:bg-[#8A6232] text-black'
                                    }`}
                                >
                                    {copied ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
                                    <span>{copied ? 'Copied' : 'Copy'}</span>
                                </button>
                            </div>

                            {/* Direct Social Channels */}
                            <div className="grid grid-cols-4 gap-2 pt-1">
                                <a
                                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#151515] hover:bg-[#25D366]/10 border border-[#343434] hover:border-[#25D366]/30 text-[#8E8E9A] hover:text-[#25D366] transition-all group"
                                >
                                    <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[7.5px] font-bold uppercase tracking-wider mt-1">WhatsApp</span>
                                </a>

                                <a
                                    href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#151515] hover:bg-[#0088cc]/10 border border-[#343434] hover:border-[#0088cc]/30 text-[#8E8E9A] hover:text-[#0088cc] transition-all group"
                                >
                                    <Send size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[7.5px] font-bold uppercase tracking-wider mt-1">Telegram</span>
                                </a>

                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#151515] hover:bg-sky-500/10 border border-[#343434] hover:border-sky-500/30 text-[#8E8E9A] hover:text-sky-400 transition-all group"
                                >
                                    <Twitter size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[7.5px] font-bold uppercase tracking-wider mt-1">Twitter</span>
                                </a>

                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#151515] hover:bg-[#1877F2]/10 border border-[#343434] hover:border-[#1877F2]/30 text-[#8E8E9A] hover:text-[#1877F2] transition-all group"
                                >
                                    <Facebook size={18} className="group-hover:scale-110 transition-transform" />
                                    <span className="text-[7.5px] font-bold uppercase tracking-wider mt-1">Facebook</span>
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
