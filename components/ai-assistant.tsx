'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Send, 
    Sparkles, 
    ShoppingBag, 
    Truck, 
    Bot, 
    ArrowRight, 
    Plus, 
    Check, 
    Zap, 
    Calculator, 
    ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { AiCableCalculator } from './ai-cable-calculator';

interface MatchedProduct {
    id: string;
    name: string;
    retail_price: number;
    wholesale_price: number;
    category: string;
    image: string;
    in_stock: boolean;
    slug?: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    advice?: string;
    products?: MatchedProduct[];
    timestamp: Date;
}

export function AIAssistant() {
    const { addToCart } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [addedIds, setAddedIds] = useState<string[]>([]);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: 'Namaste! I am Dinanath AI ⚡ Your intelligent electrical & hardware assistant. Ask me about wire sizing, appliance load calculations, live product availability, or B2B wholesale pricing!',
            timestamp: new Date()
        }
    ]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading, isOpen]);

    // Listen for custom open event
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-ai-assistant', handleOpen);
        return () => window.removeEventListener('open-ai-assistant', handleOpen);
    }, []);

    const handleSendMessage = async (customText?: string) => {
        const query = (customText || input).trim();
        if (!query || loading) return;

        // Check if user wants to open the cable calculator
        if (query.toLowerCase().includes('calculator') || query.toLowerCase().includes('wire gauge calculator')) {
            setIsCalculatorOpen(true);
            if (!customText) setInput('');
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: query,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        if (!customText) setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/store/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query })
            });

            const data = await res.json();

            let replyText = 'Here is what I found for your inquiry:';
            if (data.advice) {
                replyText = data.advice;
            } else if (data.products && data.products.length > 0) {
                replyText = `Found ${data.products.length} product(s) matching "${query}":`;
            } else {
                replyText = `I searched our catalog for "${query}". You can ask me for wire sizing (e.g., "Wire size for AC"), switches, MCBs, or contact our B2B trade desk for custom bulk inquiries.`;
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: replyText,
                advice: data.advice,
                products: data.products || [],
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: 'Our trade desk is ready to help! Please ask about wires, lighting, switches, or click below to calculate electrical load.',
                    timestamp: new Date()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product: MatchedProduct) => {
        addToCart({
            productId: product.id,
            variantName: product.name,
            quantity: 1,
            price: product.retail_price || 500,
            mode: 'retail'
        });
        setAddedIds(prev => [...prev, product.id]);
        setTimeout(() => {
            setAddedIds(prev => prev.filter(id => id !== product.id));
        }, 2000);
    };

    const promptChips = [
        { label: '⚡ Wire for 1.5 Ton AC', q: 'What wire size is needed for 1.5 Ton AC?' },
        { label: '🚿 Geyser Wiring & MCB', q: 'What wire size and MCB for 2000W geyser?' },
        { label: '🧮 AI Cable Calculator', q: 'Open AI Wire Calculator' },
        { label: '📦 B2B Wholesale Pricing', q: 'Wholesale B2B quotes and bulk discounts' },
        { label: '🚚 Pan-India Shipping', q: 'Delivery and courier dispatch time' }
    ];

    return (
        <>
            <AiCableCalculator
                isOpen={isCalculatorOpen}
                onClose={() => setIsCalculatorOpen(false)}
            />

            {/* Floating FAB Trigger */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-[150] px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full flex items-center gap-2.5 shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 border border-white/20 cursor-pointer group"
                        title="Ask Dinanath AI (Electrical & Hardware Assistant)"
                    >
                        <div className="relative">
                            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                        </div>
                        <span className="font-bold text-xs tracking-wide">Ask AI</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[200] w-[92vw] sm:w-[420px] h-[550px] sm:h-[620px] bg-surface-1 border border-glass-border rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
                    >
                        {/* Chat Header */}
                        <div className="bg-surface-2/90 backdrop-blur p-4 px-5 border-b border-glass-border flex justify-between items-center select-none">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                                        Dinanath AI <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </h3>
                                    <p className="text-[10px] text-text-tertiary font-mono">Electrical & Store Assistant</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setIsCalculatorOpen(true)}
                                    title="Open Wire Load Calculator"
                                    className="p-2 rounded-xl bg-surface-3 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                >
                                    <Calculator size={16} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-xl bg-surface-3 hover:bg-surface-2 text-text-tertiary hover:text-white transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-surface-1">
                            {messages.map((msg) => {
                                const isUser = msg.role === 'user';
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[88%] rounded-2xl p-3.5 text-xs ${
                                                isUser
                                                    ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20 font-medium'
                                                    : 'bg-surface-2 border border-glass-border text-text-primary rounded-bl-none leading-relaxed'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>

                                        {/* Product Recommendations Grid */}
                                        {msg.products && msg.products.length > 0 && (
                                            <div className="w-full mt-2 space-y-2 max-w-[95%]">
                                                {msg.products.map((p) => {
                                                    const isAdded = addedIds.includes(p.id);
                                                    return (
                                                        <div
                                                            key={p.id}
                                                            className="p-2.5 bg-surface-2 border border-glass-border rounded-xl flex items-center gap-3 hover:border-blue-500/40 transition-all text-xs"
                                                        >
                                                            <div className="w-12 h-12 bg-surface-3 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                                                                {p.image ? (
                                                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Zap size={20} className="text-blue-400" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-white truncate">{p.name}</h4>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="font-bold text-blue-400">₹{Number(p.retail_price).toLocaleString('en-IN')}</span>
                                                                    <span className="text-[10px] text-emerald-400 font-mono">In Stock</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAddToCart(p)}
                                                                disabled={isAdded}
                                                                className={`p-2 rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                                                                    isAdded
                                                                        ? 'bg-emerald-600 text-white'
                                                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                                                                }`}
                                                                title="Add to Cart"
                                                            >
                                                                {isAdded ? <Check size={14} /> : <Plus size={14} />}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {loading && (
                                <div className="flex items-center gap-2 text-xs text-text-tertiary bg-surface-2 p-3 rounded-2xl rounded-bl-none border border-glass-border w-max">
                                    <Sparkles size={14} className="animate-spin text-blue-400" />
                                    <span className="animate-pulse">Consulting catalog & electrical standards...</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Action Prompt Chips */}
                        <div className="px-3 py-2 bg-surface-2/60 border-t border-glass-border flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {promptChips.map((chip, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(chip.q)}
                                    className="px-2.5 py-1 rounded-full bg-surface-3 hover:bg-blue-600/20 hover:text-blue-300 border border-glass-border text-text-secondary text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer flex-shrink-0"
                                >
                                    {chip.label}
                                </button>
                            ))}
                        </div>

                        {/* Chat Input Bar */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="p-3 bg-surface-2 border-t border-glass-border flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about wires, lighting, or load calculation..."
                                className="flex-1 h-10 bg-surface-3 border border-glass-border focus:border-blue-500 rounded-xl px-4 text-xs text-white placeholder-text-tertiary focus:outline-none transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer flex-shrink-0 shadow-lg shadow-blue-600/30"
                            >
                                <Send size={15} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
