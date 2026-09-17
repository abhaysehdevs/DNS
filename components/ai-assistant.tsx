'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Send, 
    Sparkles, 
    Plus, 
    Check, 
    Wrench
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

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
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [addedIds, setAddedIds] = useState<string[]>([]);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: 'Namaste! I am Dinanath AI ✨ Your expert Jewellery Tools & Equipment assistant. Ask me about precision tweezers, goldsmith machinery, casting torches, polishing buffs, or workshop equipment!',
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

    // Listen for custom open event from bottom nav or navbar
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-ai-assistant', handleOpen);
        return () => window.removeEventListener('open-ai-assistant', handleOpen);
    }, []);

    const handleSendMessage = async (customText?: string) => {
        const query = (customText || input).trim();
        if (!query || loading) return;

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
                replyText = `I searched our catalog for "${query}". You can ask me about goldsmith hand tools (tweezers, pliers, cutters), workshop machinery, gas torches, polishing supplies, or contact our Chandni Chowk trade desk for custom workshop requirements.`;
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
                    text: 'Our Chandni Chowk workshop desk is ready to help! Please ask about tweezers, casting torches, polishing buffs, or any tool recommendations.',
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
        { label: '🔬 Precision Tweezers & Pliers', q: 'What are the best tweezers for diamond setting and filigree?' },
        { label: '⚙️ Polishing & Dust Collectors', q: 'Tell me about polishing and dust collector machines' },
        { label: '🔥 Auto Gas Torches & Casting', q: 'What gas torch is recommended for gold melting?' },
        { label: '⭐ Workshop Equipment & Tools', q: 'What are the most popular jewelry making equipment and tools?' },
        { label: '🚚 Pan-India Shipping', q: 'Delivery and dispatch time from Chandni Chowk' }
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        className="fixed inset-x-3 bottom-20 sm:inset-auto sm:bottom-6 sm:right-6 z-[200] sm:w-[420px] h-[520px] sm:h-[620px] max-h-[calc(100svh-100px)] bg-white border border-[#E8E2D5] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
                    >
                        {/* Chat Header */}
                        <div className="bg-[#FAF9F5] p-3.5 sm:p-4 px-4 sm:px-5 border-b border-[#E8E2D5] flex justify-between items-center select-none">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-[#966E2E] to-[#7D5A25] rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-sm">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-[#18181B] tracking-tight flex items-center gap-2">
                                        Dinanath AI <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </h3>
                                    <p className="text-[9px] sm:text-[10px] text-[#966E2E] font-mono font-medium">Jewellery Tools & Equipment Advisor</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl bg-white hover:bg-[#F3EFE6] border border-[#E8E2D5] text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer shadow-xs"
                                title="Close chat"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages Body */}
                        <div ref={scrollRef} className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 sm:space-y-4 bg-[#FAF9F5]">
                            {messages.map((msg) => {
                                const isUser = msg.role === 'user';
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[88%] rounded-2xl p-3 sm:p-3.5 text-xs ${
                                                isUser
                                                    ? 'bg-[#966E2E] text-white rounded-br-none shadow-sm font-medium'
                                                    : 'bg-white border border-[#E8E2D5] text-[#18181B] rounded-bl-none leading-relaxed shadow-xs'
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
                                                            className="p-2.5 bg-white border border-[#E8E2D5] rounded-xl flex items-center gap-3 hover:border-[#966E2E]/50 transition-all text-xs shadow-xs"
                                                        >
                                                            <div className="w-12 h-12 bg-[#FAF9F5] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 p-1 border border-[#E8E2D5]">
                                                                {p.image ? (
                                                                    <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                                                                ) : (
                                                                    <Wrench size={18} className="text-[#966E2E]" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-[#18181B] truncate">{p.name}</h4>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="font-bold text-[#966E2E]">₹{Number(p.retail_price).toLocaleString('en-IN')}</span>
                                                                    <span className="text-[9px] text-emerald-600 font-mono font-bold">In Stock</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAddToCart(p)}
                                                                disabled={isAdded}
                                                                className={`p-2 rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                                                                    isAdded
                                                                        ? 'bg-emerald-600 text-white'
                                                                        : 'bg-[#966E2E] hover:bg-[#7D5A25] text-white shadow-xs font-bold'
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
                                <div className="flex items-center gap-2 text-xs text-[#52525B] bg-white p-3 rounded-2xl rounded-bl-none border border-[#E8E2D5] w-max shadow-xs">
                                    <Sparkles size={14} className="animate-spin text-[#966E2E]" />
                                    <span className="animate-pulse">Consulting jewellery tools catalog & workshop specs...</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Action Prompt Chips */}
                        <div className="px-3 py-2 bg-[#FAF9F5] border-t border-[#E8E2D5] flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {promptChips.map((chip, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(chip.q)}
                                    className="px-2.5 py-1 rounded-full bg-white hover:bg-[#F3EFE6] hover:text-[#966E2E] border border-[#E8E2D5] hover:border-[#966E2E]/50 text-[#52525B] text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 shadow-xs"
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
                            className="p-2.5 sm:p-3 bg-white border-t border-[#E8E2D5] flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about tweezers, polishing machines, torches..."
                                className="flex-1 h-9 sm:h-10 bg-[#FAF9F5] border border-[#E8E2D5] focus:border-[#966E2E] rounded-xl px-3 sm:px-4 text-xs text-[#18181B] placeholder-[#A1A1AA] focus:outline-none transition-colors font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#966E2E] hover:bg-[#7D5A25] text-white font-bold rounded-xl flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer flex-shrink-0 shadow-xs"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
