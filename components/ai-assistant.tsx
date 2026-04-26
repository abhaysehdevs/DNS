
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, ShoppingBag, Truck, Info, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/data';
import Link from 'next/link';
import { Currency } from '@/components/currency';
import { useIsMobile } from '@/hooks/use-is-mobile';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: React.ReactNode;
    timestamp: Date;
}

export function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Namaste! I'm Dinanath AI. How can I help you find the perfect jewelry tool today?",
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isOpen]);

    // Handle custom open event from mobile nav
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-ai-assistant', handleOpen);
        return () => window.removeEventListener('open-ai-assistant', handleOpen);
    }, []);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI Thinking
        setTimeout(() => {
            const botResponse = generateResponse(userMsg.content as string);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: botResponse,
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 1200);
    };

    // Simple "AI" Logic (Descriptive & Professional)
    // Advanced Industry Intelligence Logic
    const generateResponse = (query: string): React.ReactNode => {
        const lowerQuery = query.toLowerCase();

        // 1. Jewelry Specific Categories
        if (lowerQuery.includes('casting') || lowerQuery.includes('machine') || lowerQuery.includes('furnace')) {
            return (
                <div className="space-y-4">
                    <p className="text-gray-200">Our <strong>Professional Casting Tools</strong> include high-quality vacuum casting machines and gold melting furnaces. These are designed to ensure your metals are melted perfectly with minimal waste.</p>
                    <div className="grid grid-cols-2 gap-2">
                        <Link href="/shop?category=Machinery" className="bg-gray-800 p-3 rounded-2xl text-[10px] font-black uppercase text-center hover:bg-blue-600 transition-colors">Machinery</Link>
                        <Link href="/shop?category=Consumables" className="bg-gray-800 p-3 rounded-2xl text-[10px] font-black uppercase text-center hover:bg-amber-600 transition-colors">Consumables</Link>
                    </div>
                </div>
            );
        }

        // 2. Shipping / Delivery (Advanced Logistics)
        if (lowerQuery.includes('shipping') || lowerQuery.includes('delivery') || lowerQuery.includes('track')) {
            return (
                <div className="space-y-4">
                    <p className="text-gray-200">We provide <strong>Reliable Shipping</strong> for all our tools and machinery. Every order is carefully packed and insured to ensure it reaches you in perfect condition.</p>
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-[1.5rem] flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                            <Truck className="text-white" size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Global Dispatch</div>
                            <div className="text-xs text-gray-400">Dispatch within 24h of verification.</div>
                        </div>
                    </div>
                </div>
            );
        }

        // 3. Wholesale (B2B Priority)
        if (lowerQuery.includes('wholesale') || lowerQuery.includes('bulk') || lowerQuery.includes('quote') || lowerQuery.includes('quotation')) {
            return (
                <div className="space-y-4">
                    <p className="text-gray-200">Dinanath & Sons offers special <strong>Wholesale Pricing</strong> for bulk orders. We support jewelry factories and distributors with the best rates in the industry.</p>
                    <a href="https://wa.me/91XXXXXXXXXX?text=I'm interested in a wholesale quotation for jewelry tools." target="_blank" rel="noopener noreferrer" className="block w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-2xl text-center font-black uppercase text-xs tracking-widest shadow-xl shadow-green-900/20 transition-all">
                        Connect with Trade Desk
                    </a>
                </div>
            );
        }

        // 4. Product Intelligence (Dynamic)
        const matches = products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
        ).slice(0, 3);

        if (matches.length > 0) {
            return (
                <div className="space-y-4">
                    <p className="text-gray-200">I found these <strong>High-Quality Tools</strong> that match what you're looking for:</p>
                    <div className="space-y-3">
                        {matches.map(p => (
                            <Link href={`/shop/${p.id}`} key={p.id} className="flex gap-4 bg-gray-900/50 border border-gray-800 p-3 rounded-2xl hover:border-blue-500/50 transition-all group">
                                <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shrink-0">
                                    <img src={p.primaryImage} alt={p.name} className="w-full h-full object-contain p-1" />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="text-xs font-black text-white truncate group-hover:text-blue-400 transition-colors">{p.name}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{p.category}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            );
        }

        // 5. Fallback (Expert Tone)
        return (
            <div className="space-y-2">
                <p>I couldn't find exactly what you're looking for. However, as your <strong>Expert Guide</strong>, I recommend checking our Shop for the latest jewelry tools and machinery.</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Tip: Try searching for 'Machinery' or 'Hand Tools'.</p>
            </div>
        );
    };

    const isMobile = useIsMobile();
    const suggestions = [
        { label: '🔥 Best Selling Tools', icon: <TrendingUp size={12}/> },
        { label: '📦 Shipping Info', icon: <Truck size={12}/> },
        { label: '💎 Wholesale Price', icon: <MessageCircle size={12}/> },
        { label: '🛠️ New Tools', icon: <Sparkles size={12}/> }
    ];

    const handleSuggestionClick = (label: string) => {
        setInput(label.replace(/^[^\s]+\s/, ''));
        // We'll trigger send in the next tick
        setTimeout(() => document.getElementById('ai-submit-btn')?.click(), 10);
    };

    return (
        <>
            {/* FAB Trigger */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-[150] w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group"
                    >
                        <Sparkles className="text-white" size={28} />
                        {!isMobile && (
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-blue-400 rounded-full -z-10"
                            />
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className={`fixed bottom-6 right-6 z-[200] w-[95vw] md:w-[450px] h-[600px] bg-black border border-gray-800 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ${isMobile ? '' : 'backdrop-blur-2xl bg-black/90'}`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-b border-gray-800 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                                <Sparkles size={120} className="text-blue-500 translate-x-10 -translate-y-10" />
                            </div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                                    <Sparkles size={24} className="text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-lg tracking-tight">Dinanath AI <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded ml-1 uppercase">Pro</span></h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Online and Ready to Help</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 bg-black/40 hover:bg-black text-gray-500 hover:text-white rounded-full flex items-center justify-center transition-all border border-gray-800 relative z-10"
                            >
                                <X size={20} />
                            </button>
                        </div>
 
                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
                            ref={scrollRef}
                        >
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-900/20'
                                                : 'bg-gray-900 text-gray-200 rounded-bl-none border border-gray-800'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-900 border border-gray-800 rounded-3xl rounded-bl-none px-6 py-4 flex gap-1.5 items-center">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                                    </div>
                                </div>
                            )}

                            {/* Suggestion Chips */}
                            {!isTyping && messages.length < 3 && (
                                <div className="pt-4 flex flex-wrap gap-2">
                                    {suggestions.map((s, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleSuggestionClick(s.label)}
                                            className="px-4 py-2 bg-black border border-gray-800 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-blue-500 hover:text-white hover:bg-blue-600/10 transition-all flex items-center gap-2"
                                        >
                                            {s.icon} {s.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
 
                        {/* Input Area */}
                        <div className="p-4 bg-gray-900 border-t border-gray-800">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask Dinanath AI anything..."
                                    className="flex-1 bg-black border border-gray-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                                />
                                <button
                                    id="ai-submit-btn"
                                    type="submit"
                                    disabled={!input.trim() || isTyping}
                                    className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                                >
                                    <Send size={24} />
                                </button>
                            </form>
                            <p className="text-[9px] text-gray-600 text-center mt-3 font-bold uppercase tracking-widest">
                                Dinanath Support • Always Online
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
