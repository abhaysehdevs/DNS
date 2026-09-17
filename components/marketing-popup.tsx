'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Tag, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const DISMISSAL_STORAGE_KEY = 'dns_marketing_popup_dismissed';
const COOLDOWN_HOURS = 24;
const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

interface PopupData {
    id: string;
    isActive: boolean;
    title: string;
    description: string;
    couponCode: string;
    imageUrl: string;
    delaySeconds: number;
}

export function MarketingPopup() {
    const [popupData, setPopupData] = useState<PopupData | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // 1. Check if user is in the 24-hour dismissal cooldown window
    const isDismissedWithinCooldown = useCallback((): boolean => {
        if (typeof window === 'undefined') return true;
        try {
            const dismissedAt = localStorage.getItem(DISMISSAL_STORAGE_KEY);
            if (!dismissedAt) return false;

            const timePassed = Date.now() - parseInt(dismissedAt, 10);
            return timePassed < COOLDOWN_MS;
        } catch (e) {
            return false;
        }
    }, []);

    // 2. Dismiss handler (records timestamp to localStorage)
    const handleDismiss = useCallback(() => {
        setIsOpen(false);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(DISMISSAL_STORAGE_KEY, Date.now().toString());
            } catch (e) {
                // Ignore storage write errors (e.g. private mode quota)
            }
        }
    }, []);

    // 3. Copy coupon code to clipboard
    const handleCopyCode = async () => {
        if (!popupData?.couponCode) return;
        try {
            await navigator.clipboard.writeText(popupData.couponCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (e) {
            // Fallback copy
            const textArea = document.createElement('textarea');
            textArea.value = popupData.couponCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    // 4. Fetch configuration on component mount
    useEffect(() => {
        // Fast exit if user already dismissed pop-up within the last 24h
        if (isDismissedWithinCooldown()) return;

        let isMounted = true;
        let timerId: NodeJS.Timeout | null = null;

        async function fetchPopupConfig() {
            try {
                const res = await fetch('/api/marketing-popup');
                if (!res.ok) return;
                const json = await res.json();
                
                if (!isMounted || !json?.popup) return;
                const { popup } = json;

                // If inactive, render nothing
                if (!popup.isActive) return;

                setPopupData(popup);

                // Wait specified delaySeconds before triggering the pop-up
                const delayMs = Math.max(0, (popup.delaySeconds ?? 5) * 1000);
                timerId = setTimeout(() => {
                    if (isMounted && !isDismissedWithinCooldown()) {
                        setIsOpen(true);
                    }
                }, delayMs);
            } catch (err) {
                console.warn('Marketing popup fetch error:', err);
            }
        }

        fetchPopupConfig();

        return () => {
            isMounted = false;
            if (timerId) clearTimeout(timerId);
        };
    }, [isDismissedWithinCooldown]);

    // 5. Accessibility: ESC key listener
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleDismiss();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleDismiss]);

    // Prevent background body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !popupData) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="marketing-popup-title"
                >
                    {/* Backdrop Overlay (Click to dismiss) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={handleDismiss}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                        aria-hidden="true"
                    />

                    {/* Modal Dialog Card */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.92, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 15 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full max-w-md bg-white rounded-3xl border border-[#E8E2D5] shadow-2xl overflow-hidden z-10 text-center selection:bg-[#966E2E]/20"
                    >
                        {/* Top Gold Metallic Accent Line */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#DFCE9F] via-[#966E2E] to-[#DFCE9F]" />

                        {/* Top Right "X" Close Button */}
                        <button
                            type="button"
                            onClick={handleDismiss}
                            aria-label="Close promotional announcement"
                            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-[#FAF9F5] hover:bg-[#E8E2D5] text-[#71717A] hover:text-[#18181B] flex items-center justify-center transition-colors cursor-pointer border border-[#E8E2D5] shadow-xs"
                        >
                            <X size={15} strokeWidth={2.5} />
                        </button>

                        <div className="p-6 sm:p-8">
                            
                            {/* Heritage Badge */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] text-[8.5px] font-mono font-bold uppercase tracking-[0.2em] mb-4 shadow-xs">
                                <Sparkles size={11} className="text-[#966E2E]" />
                                <span>ESTD 1960 • TRADE DIRECTIVE</span>
                            </div>

                            {/* Optional Featured Image */}
                            {popupData.imageUrl && (
                                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-4 rounded-2xl bg-[#FAF9F5] border border-[#E8E2D5] p-2 flex items-center justify-center overflow-hidden shadow-inner">
                                    <img
                                        src={popupData.imageUrl}
                                        alt={popupData.title}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Headline Title */}
                            <h2 
                                id="marketing-popup-title"
                                className="text-xl sm:text-2xl font-black uppercase text-[#18181B] tracking-tight leading-tight font-display mb-2.5"
                            >
                                {popupData.title}
                            </h2>

                            {/* Description Body */}
                            <p className="text-xs sm:text-sm text-[#52525B] leading-relaxed mb-5 font-normal">
                                {popupData.description}
                            </p>

                            {/* Coupon Code Pill */}
                            {popupData.couponCode && (
                                <div className="mb-5 p-3 rounded-2xl bg-[#FAF9F5] border-2 border-dashed border-[#966E2E]/50 flex items-center justify-between gap-3 shadow-xs">
                                    <div className="flex items-center gap-2 text-left pl-1">
                                        <Tag size={15} className="text-[#966E2E] shrink-0" />
                                        <div>
                                            <span className="text-[8px] font-bold uppercase tracking-wider text-[#71717A] block leading-none">
                                                Use Discount Voucher
                                            </span>
                                            <span className="text-sm font-mono font-black text-[#18181B] tracking-widest mt-0.5 block">
                                                {popupData.couponCode}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleCopyCode}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
                                            copied
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-[#966E2E] hover:bg-[#7D5A25] text-white shadow-xs'
                                        }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check size={11} strokeWidth={3} />
                                                <span>Copied!</span>
                                            </>
                                        ) : (
                                            <span>Copy Code</span>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Action CTA Button */}
                            <Link href="/shop" onClick={handleDismiss} className="block w-full">
                                <button
                                    type="button"
                                    className="w-full h-11 bg-[#966E2E] hover:bg-[#7D5A25] active:scale-98 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <span>Explore Tools & Hardware</span>
                                    <ArrowRight size={14} strokeWidth={2.5} />
                                </button>
                            </Link>

                            {/* Secondary Dismiss Link */}
                            <button
                                type="button"
                                onClick={handleDismiss}
                                className="mt-3 text-[10px] font-semibold text-[#71717A] hover:text-[#18181B] transition-colors uppercase tracking-wider underline cursor-pointer"
                            >
                                No thanks, continue to workshop
                            </button>

                        </div>

                        {/* Subtle bottom assurance note */}
                        <div className="bg-[#FAF9F5] border-t border-[#E8E2D5] py-2 px-4 text-[8.5px] font-bold uppercase tracking-widest text-[#71717A] flex items-center justify-center gap-1.5">
                            <ShieldCheck size={11} className="text-[#966E2E]" />
                            <span>100% Quality Assured • Chandni Chowk Bench</span>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
