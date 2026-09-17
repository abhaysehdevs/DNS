'use client';

import { useState, useEffect } from 'react';
import { 
    Sparkles, Save, Loader2, CheckCircle2, AlertCircle, 
    Eye, Clock, Tag, Image as ImageIcon, ToggleLeft, ToggleRight, 
    RefreshCw, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupConfig {
    id?: string;
    isActive: boolean;
    title: string;
    description: string;
    couponCode: string;
    imageUrl: string;
    delaySeconds: number;
}

export function MarketingPopupManager() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form state
    const [formData, setFormData] = useState<PopupConfig>({
        isActive: false,
        title: '',
        description: '',
        couponCode: '',
        imageUrl: '',
        delaySeconds: 5,
    });

    const [previewOpen, setPreviewOpen] = useState(false);

    // Fetch existing configuration
    const fetchConfig = async () => {
        setLoading(true);
        setStatusMessage(null);
        try {
            const res = await fetch('/api/marketing-popup');
            const data = await res.json();
            if (data?.popup) {
                setFormData({
                    isActive: Boolean(data.popup.isActive),
                    title: data.popup.title || '',
                    description: data.popup.description || '',
                    couponCode: data.popup.couponCode || '',
                    imageUrl: data.popup.imageUrl || '',
                    delaySeconds: data.popup.delaySeconds ?? 5,
                });
            }
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: 'Failed to load popup configuration.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatusMessage(null);

        try {
            const res = await fetch('/api/marketing-popup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await res.json();
            if (!res.ok || result.error) {
                throw new Error(result.error || 'Failed to update popup configuration.');
            }

            setStatusMessage({ type: 'success', text: 'Promotional pop-up updated successfully!' });
            // Auto-clear message after 4s
            setTimeout(() => setStatusMessage(null), 4000);
        } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message || 'An error occurred while saving.' });
        } finally {
            setSaving(false);
        }
    };

    // Helper: Reset 24hr cooldown in localStorage so admin can test
    const resetDismissalCooldown = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('dns_marketing_popup_dismissed');
            alert('24-Hour dismissal cooldown cleared from your browser! The pop-up will now trigger on your next storefront visit.');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white border border-[#E8E2D5] rounded-2xl shadow-xs">
                <Loader2 className="animate-spin text-[#966E2E] mb-3" size={32} />
                <span className="text-xs font-bold uppercase tracking-wider text-[#71717A]">
                    Loading Promotional Pop-up Settings...
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* Header & Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E8E2D5] p-5 rounded-2xl shadow-xs">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#966E2E]/10 border border-[#966E2E]/20 text-[#966E2E] text-[8.5px] font-bold uppercase tracking-wider mb-1">
                        <Sparkles size={11} /> Marketing Engine
                    </div>
                    <h2 className="text-xl font-black uppercase text-[#18181B] tracking-tight">
                        Promotional Pop-up Configuration
                    </h2>
                    <p className="text-xs text-[#71717A] mt-0.5">
                        Configure welcome discount modals, seasonal drops, and wholesale coupon announcements.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={resetDismissalCooldown}
                        className="px-3 py-2 bg-[#FAF9F5] border border-[#E8E2D5] hover:border-[#966E2E] text-[#52525B] hover:text-[#18181B] text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Reset 24h dismissal cooldown in your browser"
                    >
                        <RefreshCw size={12} />
                        <span>Reset 24h Cooldown</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPreviewOpen(!previewOpen)}
                        className="px-3.5 py-2 bg-[#FAF9F5] border border-[#E8E2D5] hover:border-[#966E2E] text-[#18181B] text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                        <Eye size={12} className="text-[#966E2E]" />
                        <span>{previewOpen ? 'Hide Preview' : 'Live Preview'}</span>
                    </button>
                </div>
            </div>

            {/* Status Feedback Toast */}
            <AnimatePresence>
                {statusMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-wide border shadow-xs ${
                            statusMessage.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}
                    >
                        {statusMessage.type === 'success' ? (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle size={16} className="text-red-600 shrink-0" />
                        )}
                        <span>{statusMessage.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form Column */}
                <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-[#E8E2D5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                    
                    {/* Active Status Switch Card */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5]">
                        <div className="space-y-0.5">
                            <label className="text-xs font-black uppercase tracking-wider text-[#18181B] block">
                                Pop-up Status
                            </label>
                            <p className="text-[10px] text-[#71717A]">
                                {formData.isActive
                                    ? 'The promotional modal is ACTIVE on the storefront for eligible visitors.'
                                    : 'The pop-up is currently DISABLED and will not render to any visitor.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                            className={`p-1.5 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                                formData.isActive
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-[#E8E2D5] text-[#52525B]'
                            }`}
                        >
                            {formData.isActive ? (
                                <>
                                    <ToggleRight size={22} />
                                    <span className="pr-1 text-[10px]">ACTIVE</span>
                                </>
                            ) : (
                                <>
                                    <ToggleLeft size={22} />
                                    <span className="pr-1 text-[10px]">INACTIVE</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Title */}
                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#18181B] flex items-center justify-between">
                            <span>Headline / Title <span className="text-red-500">*</span></span>
                            <span className="text-[9px] text-[#71717A] font-normal">{formData.title.length}/80 chars</span>
                        </label>
                        <input
                            required
                            maxLength={80}
                            type="text"
                            placeholder="e.g. 10% Off Your First Workshop Tool Order"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full h-10 px-3 text-xs font-semibold bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl focus:outline-none focus:border-[#966E2E] focus:bg-white text-[#18181B] transition-all"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#18181B] flex items-center justify-between">
                            <span>Description & Pitch <span className="text-red-500">*</span></span>
                            <span className="text-[9px] text-[#71717A] font-normal">{formData.description.length}/240 chars</span>
                        </label>
                        <textarea
                            required
                            rows={3}
                            maxLength={240}
                            placeholder="e.g. Unlock exclusive B2B wholesale pricing across precision tweezers, melting furnaces, and polishing buffs."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-3 text-xs font-medium bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl focus:outline-none focus:border-[#966E2E] focus:bg-white text-[#18181B] transition-all resize-none"
                        />
                    </div>

                    {/* Two-Column: Coupon Code & Delay Seconds */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Coupon Code */}
                        <div className="space-y-1.5 text-left">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#18181B] flex items-center gap-1.5">
                                <Tag size={12} className="text-[#966E2E]" />
                                <span>Coupon Code (Optional)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. WELCOME10"
                                value={formData.couponCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }))}
                                className="w-full h-10 px-3 text-xs font-mono font-bold uppercase bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl focus:outline-none focus:border-[#966E2E] focus:bg-white text-[#18181B] transition-all"
                            />
                        </div>

                        {/* Delay Seconds */}
                        <div className="space-y-1.5 text-left">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#18181B] flex items-center gap-1.5">
                                <Clock size={12} className="text-[#966E2E]" />
                                <span>Delay Before Trigger (Seconds)</span>
                            </label>
                            <input
                                type="number"
                                min={0}
                                max={120}
                                value={formData.delaySeconds}
                                onChange={(e) => setFormData(prev => ({ ...prev, delaySeconds: parseInt(e.target.value, 10) || 0 }))}
                                className="w-full h-10 px-3 text-xs font-mono font-bold bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl focus:outline-none focus:border-[#966E2E] focus:bg-white text-[#18181B] transition-all"
                            />
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className="space-y-1.5 text-left">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#18181B] flex items-center gap-1.5">
                            <ImageIcon size={12} className="text-[#966E2E]" />
                            <span>Cover Image URL (Optional)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. /images/products/sand-blasting-dust-collector-machine.png"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                            className="w-full h-10 px-3 text-xs bg-[#FAF9F5] border border-[#E8E2D5] rounded-xl focus:outline-none focus:border-[#966E2E] focus:bg-white text-[#18181B] transition-all"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E8E2D5]">
                        <button
                            type="submit"
                            disabled={saving}
                            className="h-11 px-6 bg-[#966E2E] hover:bg-[#7D5A25] active:scale-95 disabled:opacity-50 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Saving Settings...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={14} />
                                    <span>Save & Publish Pop-up</span>
                                </>
                            )}
                        </button>
                    </div>

                </form>

                {/* Live Preview Column */}
                <div className="lg:col-span-5 flex flex-col space-y-3">
                    <div className="text-left">
                        <span className="text-xs font-black uppercase tracking-wider text-[#18181B] flex items-center gap-1.5">
                            <Eye size={13} className="text-[#966E2E]" />
                            <span>Modal Visual Preview</span>
                        </span>
                        <p className="text-[10px] text-[#71717A]">
                            Real-time simulation of the modal as shown to site visitors.
                        </p>
                    </div>

                    {/* Modal Mockup Box */}
                    <div className="relative bg-[#F4F1EA] p-4 sm:p-6 rounded-2xl border border-[#E8E2D5] flex items-center justify-center min-h-[380px] overflow-hidden shadow-inner">
                        
                        {/* Overlay backdrop mockup */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none" />

                        {/* Modal Container */}
                        <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl border border-[#E8E2D5] shadow-2xl p-5 text-center overflow-hidden">
                            {/* Top decorative gold line */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DFCE9F] via-[#966E2E] to-[#DFCE9F]" />

                            {/* Badge */}
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF9F5] border border-[#E8E2D5] text-[#966E2E] text-[8px] font-bold uppercase tracking-wider mb-2.5">
                                <Sparkles size={10} />
                                <span>ESTD 1960 • TRADE DIRECTIVE</span>
                            </div>

                            {/* Image (if provided) */}
                            {formData.imageUrl && (
                                <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5] p-2 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={formData.imageUrl}
                                        alt="Promo Preview"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Title */}
                            <h3 className="text-base font-black uppercase text-[#18181B] tracking-tight leading-snug font-display mb-1.5">
                                {formData.title || 'Your Promo Title Goes Here'}
                            </h3>

                            {/* Description */}
                            <p className="text-[11px] text-[#52525B] leading-relaxed mb-3">
                                {formData.description || 'Provide a compelling discount or technical update for goldsmith workshops.'}
                            </p>

                            {/* Coupon Pill */}
                            {formData.couponCode && (
                                <div className="mb-3 p-2 rounded-xl bg-[#FAF9F5] border border-dashed border-[#966E2E] flex items-center justify-between gap-2">
                                    <div className="text-left pl-1">
                                        <span className="text-[7.5px] uppercase font-bold text-[#71717A] block leading-none">Use Promo Code</span>
                                        <span className="text-xs font-mono font-black text-[#966E2E] tracking-wider">{formData.couponCode}</span>
                                    </div>
                                    <span className="text-[8.5px] bg-[#966E2E] text-white font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                                        COPY
                                    </span>
                                </div>
                            )}

                            {/* CTA Button */}
                            <button
                                type="button"
                                className="w-full h-9 bg-[#966E2E] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs"
                            >
                                Shop Hardware Deals
                            </button>

                            <p className="text-[8px] text-[#A1A1AA] uppercase mt-2">
                                Will trigger after {formData.delaySeconds}s • Dismissable for 24 hours
                            </p>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
