'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShoppingBag, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { WHATSAPP_DISPLAY_PHONE } from '@/lib/whatsapp-order';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Unhandled application error:', error);
    }, [error]);

    const whatsappSupportUrl = `https://wa.me/919953435647?text=${encodeURIComponent(
        `Hello Dinanath & Sons, I encountered an issue on your website (${error?.digest ? `Ref: ${error.digest}` : 'General Error'}). Could you please assist me?`
    )}`;

    return (
        <div className="min-h-[80vh] bg-[#FAF9F5] text-[#18181B] flex items-center justify-center px-4 sm:px-6 py-24 sm:py-32 selection:bg-[#966E2E]/20">
            <div className="max-w-xl w-full text-center">
                {/* Warning Icon Badge */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-[#E8E2D5] flex items-center justify-center mx-auto mb-6 shadow-sm text-amber-600">
                    <AlertTriangle size={32} className="sm:w-9 sm:h-9" />
                </div>

                <span className="text-[9.5px] sm:text-[10px] font-mono font-bold text-[#966E2E] uppercase tracking-[0.3em] block mb-2 sm:mb-3">
                    System Exception • Handled Gracefully
                </span>

                <h1 className="text-2xl sm:text-4xl font-bold font-display text-[#18181B] uppercase tracking-wide mb-3 sm:mb-4">
                    Something Went Unexpectedly Wrong
                </h1>

                <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed max-w-md mx-auto mb-8 sm:mb-10">
                    We encountered an error while processing your request. Our catalog and inventory are safe. You can retry the operation or return to browse the tool catalog.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
                    <button
                        onClick={() => reset()}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-[#966E2E] hover:bg-[#7D5A25] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                        <RefreshCw size={15} /> Try Again
                    </button>
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-white border border-[#E8E2D5] hover:border-[#966E2E] text-[#18181B] font-bold text-xs uppercase tracking-widest transition-all shadow-xs"
                    >
                        <Home size={15} /> Return to Home
                    </Link>
                </div>

                {/* Secondary Quick Links */}
                <div className="flex items-center justify-center gap-6 text-xs font-semibold text-[#52525B] mb-10">
                    <Link href="/shop" className="inline-flex items-center gap-1.5 hover:text-[#966E2E] transition-colors">
                        <ShoppingBag size={14} /> Browse Catalog
                    </Link>
                    <span className="text-[#D4CEBF]">•</span>
                    <a
                        href={whatsappSupportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                    >
                        <MessageCircle size={14} /> WhatsApp Support
                    </a>
                </div>

                {/* Collapsible Technical Debug Details */}
                <div className="border border-[#E8E2D5] rounded-xl overflow-hidden bg-white text-left shadow-xs">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full flex items-center justify-between p-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-[#71717A] hover:text-[#18181B] transition-colors"
                    >
                        <span>Technical Details {error.digest && `(Ref: ${error.digest})`}</span>
                        {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {showDetails && (
                        <div className="p-4 pt-0 border-t border-[#F0EBE0] text-[11px] font-mono text-[#71717A] break-all bg-[#FAF9F5]">
                            <p className="font-semibold text-rose-700 mb-1">{error.message || 'Unknown runtime error'}</p>
                            {error.digest && <p className="text-[10px] text-[#A1A1AA]">Error Digest: {error.digest}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
