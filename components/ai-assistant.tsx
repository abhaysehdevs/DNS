'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Send, 
    Sparkles, 
    ShoppingBag, 
    ArrowRight, 
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
            text: 'Namaste! I am Dinanath AI ✨ Your expert Jewellery Tools & Equipment assistant. Ask me about precision tweezers, goldsmith machinery, casting torches, polishing buffs, or B2B workshop orders!',
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
            {/* Chat Window Modal (Triggered solely from Bottom Nav or Navbar) */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        className="fixed inset-x-3 bottom-20 sm:inset-auto sm:bottom-6 sm:right-6 z-[200] sm:w-[420px] h-[520px] sm:h-[620px] max-h-[calc(100svh-100px)] bg-[#151515] border border-[#A67C35]/40 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
                    >
                        {/* Chat Header */}
                        <div className="bg-[#1E1E1E] p-3.5 sm:p-4 px-4 sm:px-5 border-b border-[#343434] flex justify-between items-center select-none">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-[#A67C35] to-[#8A6232] rounded-xl sm:rounded-2xl flex items-center justify-center text-black shadow-md shadow-[#A67C35]/20">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-sm font-bold text-[#F8F3E8] tracking-tight flex items-center gap-2">
                                        Dinanath AI <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </h3>
                                    <p className="text-[9px] sm:text-[10px] text-[#A67C35] font-mono font-medium">Jewellery Tools & Equipment Advisor</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl bg-[#242424] hover:bg-[#343434] text-[#CFCFCF] hover:text-white transition-colors cursor-pointer"
                                title="Close chat"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages Body */}
                        <div ref={scrollRef} className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 sm:space-y-4 bg-[#121212]">
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
                                                    ? 'bg-[#A67C35] text-black rounded-br-none shadow-md shadow-[#A67C35]/20 font-semibold'
                                                    : 'bg-[#1E1E1E] border border-[#343434] text-[#F8F3E8] rounded-bl-none leading-relaxed'
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
                                                            className="p-2.5 bg-[#1E1E1E] border border-[#343434] rounded-xl flex items-center gap-3 hover:border-[#A67C35]/50 transition-all text-xs"
                                                        >
                                                            <div className="w-12 h-12 bg-[#151515] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 p-1 border border-[#343434]">
                                                                {p.image ? (
                                                                    <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                                                                ) : (
                                                                    <Wrench size={18} className="text-[#A67C35]" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-bold text-[#F8F3E8] truncate">{p.name}</h4>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="font-bold text-[#A67C35]">₹{Number(p.retail_price).toLocaleString('en-IN')}</span>
                                                                    <span className="text-[9px] text-emerald-400 font-mono">In Stock</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleAddToCart(p)}
                                                                disabled={isAdded}
                                                                className={`p-2 rounded-lg transition-all cursor-pointer flex-shrink-0 ${
                                                                    isAdded
                                                                        ? 'bg-emerald-600 text-white'
                                                                        : 'bg-[#A67C35] hover:bg-[#8A6232] text-black shadow font-bold'
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
                                <div className="flex items-center gap-2 text-xs text-[#CFCFCF] bg-[#1E1E1E] p-3 rounded-2xl rounded-bl-none border border-[#343434] w-max">
                                    <Sparkles size={14} className="animate-spin text-[#A67C35]" />
                                    <span className="animate-pulse">Consulting jewellery tools catalog & workshop specs...</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Action Prompt Chips */}
                        <div className="px-3 py-2 bg-[#1A1A1A] border-t border-[#343434] flex items-center gap-2 overflow-x-auto no-scrollbar">
                            {promptChips.map((chip, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(chip.q)}
                                    className="px-2.5 py-1 rounded-full bg-[#242424] hover:bg-[#A67C35]/20 hover:text-[#A67C35] border border-[#343434] hover:border-[#A67C35]/50 text-[#CFCFCF] text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer flex-shrink-0"
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
                            className="p-2.5 sm:p-3 bg-[#1E1E1E] border-t border-[#343434] flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about tweezers, polishing machines, torches..."
                                className="flex-1 h-9 sm:h-10 bg-[#151515] border border-[#343434] focus:border-[#A67C35] rounded-xl px-3 sm:px-4 text-xs text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none transition-colors font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold rounded-xl flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer flex-shrink-0 shadow-lg shadow-[#A67C35]/20"
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
