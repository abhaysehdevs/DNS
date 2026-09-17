import { Metadata } from 'next';
import Link from 'next/link';
import { SearchX, ArrowLeft, Home, Wrench, Sparkles, Layers } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Page Not Found (404)',
    description: 'The requested tool specification or catalog page could not be located in our inventory.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#18181B] flex items-center justify-center px-6 py-32 selection:bg-[#966E2E]/20">
            <div className="max-w-xl w-full text-center">
                {/* 404 Badge */}
                <div className="w-20 h-20 rounded-2xl bg-white border border-[#E8E2D5] flex items-center justify-center mx-auto mb-8 shadow-sm text-[#966E2E]">
                    <SearchX size={36} />
                </div>

                <span className="text-[10px] font-mono font-bold text-[#966E2E] uppercase tracking-[0.3em] block mb-3">
                    Error 404 • Resource Not Located
                </span>

                <h1 className="text-4xl sm:text-5xl font-bold font-display text-[#18181B] uppercase tracking-wide mb-4">
                    Tool Specification Not Found
                </h1>

                <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed max-w-md mx-auto mb-10">
                    The tool, machine, or catalog page you are looking for has been moved, re-indexed, or is temporarily unavailable in our Chandni Chowk inventory.
                </p>

                {/* Popular Links */}
                <div className="bg-white border border-[#E8E2D5] rounded-2xl p-6 mb-10 text-left shadow-sm">
                    <h2 className="text-[10px] font-bold text-[#18181B] uppercase tracking-widest mb-4">
                        Popular Tool Categories
                    </h2>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <Link href="/shop/category/hand-tools" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FAF9F5] hover:bg-[#F3EFE6] text-[#52525B] hover:text-[#966E2E] transition-all border border-[#E8E2D5]">
                            <Wrench size={14} /> Hand Tools
                        </Link>
                        <Link href="/shop/category/machines" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FAF9F5] hover:bg-[#F3EFE6] text-[#52525B] hover:text-[#966E2E] transition-all border border-[#E8E2D5]">
                            <Layers size={14} /> Machines
                        </Link>
                        <Link href="/shop/category/polishing" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FAF9F5] hover:bg-[#F3EFE6] text-[#52525B] hover:text-[#966E2E] transition-all border border-[#E8E2D5]">
                            <Sparkles size={14} /> Polishing Buffs
                        </Link>
                        <Link href="/shop" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FAF9F5] hover:bg-[#F3EFE6] text-[#52525B] hover:text-[#966E2E] transition-all border border-[#E8E2D5]">
                            <Home size={14} /> Full Catalog
                        </Link>
                    </div>
                </div>

                {/* Navigation Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#966E2E] text-white font-bold text-xs uppercase tracking-widest hover:bg-[#7D5A25] transition-all shadow-md"
                    >
                        <Home size={16} /> Return to Homepage
                    </Link>
                    <Link
                        href="/shop"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white border border-[#E8E2D5] text-[#18181B] font-bold text-xs uppercase tracking-widest hover:border-[#966E2E] transition-all"
                    >
                        <ArrowLeft size={16} /> Browse Inventory
                    </Link>
                </div>
            </div>
        </div>
    );
}
