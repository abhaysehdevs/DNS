import Link from 'next/link';
import { SearchX, ArrowLeft, Home, Wrench, Sparkles, Layers } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#151515] text-[#F8F3E8] flex items-center justify-center px-6 py-32 selection:bg-[#A67C35]/30">
            <div className="max-w-xl w-full text-center">
                {/* 404 Badge */}
                <div className="w-20 h-20 rounded-2xl bg-[#1E1E1E] border border-[#343434] flex items-center justify-center mx-auto mb-8 shadow-2xl text-[#A67C35]">
                    <SearchX size={36} />
                </div>

                <span className="text-[10px] font-mono font-bold text-[#A67C35] uppercase tracking-[0.3em] block mb-3">
                    Error 404 • Resource Not Found
                </span>

                <h1 className="text-4xl sm:text-5xl font-bold font-display text-[#F8F3E8] uppercase tracking-wide mb-4">
                    Tool Specification Not Located
                </h1>

                <p className="text-xs sm:text-sm text-[#8E8E9A] leading-relaxed max-w-md mx-auto mb-10">
                    The tool, machine, or catalog page you are looking for has been moved, re-indexed, or is temporarily unavailable in our Chandni Chowk inventory.
                </p>

                {/* Popular Links */}
                <div className="bg-[#1E1E1E] border border-[#343434] rounded-2xl p-6 mb-10 text-left">
                    <h2 className="text-[10px] font-bold text-[#F8F3E8] uppercase tracking-widest mb-4">
                        Popular Tool Categories
                    </h2>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <Link href="/shop?cat=Tools" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#242424] hover:bg-[#A67C35]/15 text-[#CFCFCF] hover:text-[#A67C35] transition-all">
                            <Wrench size={14} /> Hand Tools
                        </Link>
                        <Link href="/shop?cat=Machinery" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#242424] hover:bg-[#A67C35]/15 text-[#CFCFCF] hover:text-[#A67C35] transition-all">
                            <Layers size={14} /> Machines
                        </Link>
                        <Link href="/shop?cat=Consumables" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#242424] hover:bg-[#A67C35]/15 text-[#CFCFCF] hover:text-[#A67C35] transition-all">
                            <Sparkles size={14} /> Polishing Buffs
                        </Link>
                        <Link href="/shop" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#242424] hover:bg-[#A67C35]/15 text-[#CFCFCF] hover:text-[#A67C35] transition-all">
                            <Home size={14} /> Full Catalog
                        </Link>
                    </div>
                </div>

                {/* Navigation Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#A67C35] text-black font-bold text-xs uppercase tracking-widest hover:bg-[#B88E46] transition-all shadow-lg shadow-[#A67C35]/20"
                    >
                        <Home size={16} /> Return to Homepage
                    </Link>
                    <Link
                        href="/shop"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#242424] border border-[#343434] text-[#F8F3E8] font-bold text-xs uppercase tracking-widest hover:border-[#A67C35] transition-all"
                    >
                        <ArrowLeft size={16} /> Browse Inventory
                    </Link>
                </div>
            </div>
        </div>
    );
}
