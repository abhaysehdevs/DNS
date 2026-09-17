'use client';

import { useState, useEffect } from 'react';
import AdminAiAssistant from '@/components/admin/admin-ai-assistant';
import { supabase } from '@/lib/supabase';
import { 
    Sparkles, 
    Zap, 
    Package, 
    ShoppingCart, 
    Tag, 
    ShieldCheck, 
    Terminal, 
    HelpCircle, 
    CheckCircle2, 
    Volume2 
} from 'lucide-react';

export default function AdminAiPage() {
    const [stats, setStats] = useState({
        productsCount: 0,
        ordersCount: 0,
        couponsCount: 0,
        loading: true
    });

    useEffect(() => {
        async function fetchCounts() {
            try {
                const [
                    { count: prodCount },
                    { count: ordCount },
                    { count: coupCount }
                ] = await Promise.all([
                    supabase.from('products').select('*', { count: 'exact', head: true }),
                    supabase.from('orders').select('*', { count: 'exact', head: true }),
                    supabase.from('coupons').select('*', { count: 'exact', head: true })
                ]);

                setStats({
                    productsCount: prodCount || 0,
                    ordersCount: ordCount || 0,
                    couponsCount: coupCount || 0,
                    loading: false
                });
            } catch (err) {
                console.error('Error fetching admin counts:', err);
                setStats(prev => ({ ...prev, loading: false }));
            }
        }
        fetchCounts();
    }, []);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Cockpit Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E8E2D5] p-6 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3.5 bg-[#966E2E] text-white rounded-2xl shadow-sm flex items-center justify-center">
                        <Sparkles size={28} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-[#18181B]">
                                Personal AI Command Center
                            </h1>
                            <span className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active Agent
                            </span>
                        </div>
                        <p className="text-sm text-[#71717A] mt-1">
                            Your full-authority AI copilot for Dinanath & Sons. Type or speak commands to execute actions across the store.
                        </p>
                    </div>
                </div>

                {/* Quick Live Telemetry Pills */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5] flex items-center gap-2.5 text-xs">
                        <Package size={16} className="text-[#966E2E]" />
                        <div>
                            <span className="text-[#71717A] block text-[10px] uppercase font-mono">Catalog</span>
                            <span className="font-bold text-[#18181B]">{stats.productsCount} Products</span>
                        </div>
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5] flex items-center gap-2.5 text-xs">
                        <ShoppingCart size={16} className="text-emerald-600" />
                        <div>
                            <span className="text-[#71717A] block text-[10px] uppercase font-mono">Orders</span>
                            <span className="font-bold text-[#18181B]">{stats.ordersCount} Total</span>
                        </div>
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5] flex items-center gap-2.5 text-xs">
                        <Tag size={16} className="text-purple-600" />
                        <div>
                            <span className="text-[#71717A] block text-[10px] uppercase font-mono">Promotions</span>
                            <span className="font-bold text-[#18181B]">{stats.couponsCount} Coupons</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main AI Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left / Center: Interactive AI Assistant Cockpit */}
                <div className="lg:col-span-3">
                    <AdminAiAssistant isPageMode={true} />
                </div>

                {/* Right Sidebar: Command Cheatsheet & Capabilities */}
                <div className="space-y-4">
                    <div className="bg-white border border-[#E8E2D5] rounded-2xl p-5 space-y-4 shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#18181B] border-b border-[#E8E2D5] pb-3">
                            <Terminal size={18} className="text-[#966E2E]" />
                            <span>Command Cheatsheet</span>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <span className="font-semibold text-[#966E2E] block mb-1">📦 Products & Inventory</span>
                                <ul className="space-y-1.5 text-[#52525B]">
                                    <li className="p-1.5 rounded bg-[#FAF9F5] border border-[#E8E2D5] font-mono">
                                        "Add product Copper Lug with price ₹180 in Electrical"
                                    </li>
                                    <li className="p-1.5 rounded bg-[#FAF9F5] border border-[#E8E2D5] font-mono">
                                        "Update price of Copper Lug to ₹195"
                                    </li>
                                    <li className="p-1.5 rounded bg-[#FAF9F5] border border-[#E8E2D5] font-mono">
                                        "Check low stock products"
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <span className="font-semibold text-emerald-700 block mb-1">📊 Orders & Fulfillment</span>
                                <ul className="space-y-1.5 text-[#52525B]">
                                    <li className="p-1.5 rounded bg-[#FAF9F5] border border-[#E8E2D5] font-mono">
                                        "Give me a summary of all orders"
                                    </li>
                                    <li className="p-1.5 rounded bg-[#FAF9F5] border border-[#E8E2D5] font-mono">
                                        "Show pending orders"
                                    </li>
                                    <li className="p-1.5 rounded bg-[#FAF9F5] border border-[#E8E2D5] font-mono">
                                        "Mark order #... as shipped"
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <span className="font-semibold text-purple-700 block mb-1">🎟️ Coupons & Promotions</span>
                                <ul className="space-y-1.5 text-[#52525B]">
                                    <li className="p-1.5 rounded bg-[#FAF9F5] border border-[#E8E2D5] font-mono">
                                        "Create coupon SAVE15 for 15% off"
                                    </li>
                                    <li className="p-1.5 rounded bg-[#FAF9F5] border border-[#E8E2D5] font-mono">
                                        "Show all coupons"
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <span className="font-semibold text-amber-700 block mb-1">⚡ Navigation & Control</span>
                                <ul className="space-y-1.5 text-[#52525B]">
                                    <li className="p-1.5 rounded bg-[#FAF9F5] border border-[#E8E2D5] font-mono">
                                        "Take me to categories"
                                    </li>
                                    <li className="p-1.5 rounded bg-[#FAF9F5] border border-[#E8E2D5] font-mono">
                                        "Open settings"
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl p-4 text-xs text-[#52525B] space-y-2">
                        <div className="flex items-center gap-2 font-bold text-[#18181B]">
                            <ShieldCheck size={16} className="text-[#966E2E]" />
                            <span>Strict Admin Sandboxing</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-[#71717A]">
                            This AI assistant is secured and operates only within authenticated admin sessions. Actions execute live against your Supabase backend.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
