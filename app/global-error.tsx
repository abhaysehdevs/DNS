'use client';

import { RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-[#FAF9F5] text-[#18181B] flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full text-center">
                    <span className="text-[10px] font-mono font-bold text-[#966E2E] uppercase tracking-[0.3em] block mb-3">
                        Critical Error
                    </span>
                    <h1 className="text-3xl font-bold uppercase tracking-wide mb-3">
                        Application Failed to Load
                    </h1>
                    <p className="text-sm text-[#71717A] mb-8 leading-relaxed">
                        A critical application error interrupted the page layout. Please click below to refresh and restart the session.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            onClick={() => reset()}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#966E2E] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#7D5A25] transition-all shadow-md cursor-pointer"
                        >
                            <RefreshCw size={14} /> Restart Session
                        </button>
                        <a
                            href="/"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#E8E2D5] text-[#18181B] font-bold text-xs uppercase tracking-widest hover:border-[#966E2E] transition-all"
                        >
                            <Home size={14} /> Return to Home
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
