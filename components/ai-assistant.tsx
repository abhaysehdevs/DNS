'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, ShoppingBag, Truck, Info, Settings, TrendingUp, HelpCircle, ShieldAlert, ArrowRight, CornerDownLeft, Bot, RefreshCw } from 'lucide-react';
import { products } from '@/lib/data';
import Link from 'next/link';
import { getProductUrl } from '@/lib/slug';
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
            content: (
                <div className="space-y-2">
                    <p className="font-bold text-[#F8F3E8] text-xs">Namaste! I'm Dinanath AI 🤖</p>
                    <p className="text-xs text-[#CFCFCF] leading-relaxed">
                        Your intelligent assistant for professional jewelry manufacturing tools, workshop machinery, B2B quotes, and order logistics. How can I help your workshop today?
                    </p>
                </div>
            ),
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    // Auto-scroll on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, isOpen]);

    // Handle custom open event from mobile nav or buttons
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-ai-assistant', handleOpen);
        return () => window.removeEventListener('open-ai-assistant', handleOpen);
    }, []);

    const handleSendMessage = (e?: React.FormEvent, customText?: string) => {
        e?.preventDefault();
        const textToSend = customText || input;
        if (!textToSend.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        if (!customText) setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const botResponse = generateAIResponse(textToSend);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: botResponse,
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 450);
    };

    // Advanced Intelligent AI Engine
    const generateAIResponse = (query: string): React.ReactNode => {
        const lower = query.toLowerCase();

        // 1. Return Policy & Refund Queries (Strict Store Policy Enforcement)
        if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange') || lower.includes('replace')) {
            return (
                <div className="space-y-3 text-xs text-[#CFCFCF]">
                    <div className="flex items-center gap-2 text-[#D12A1C] font-bold uppercase tracking-wider text-[11px]">
                        <ShieldAlert size={16} /> Store Policy Notice
                    </div>
                    <p className="leading-relaxed">
                        <strong className="text-[#F8F3E8]">No Returns Policy:</strong> As a specialized B2B and retail hardware supplier, Dinanath & Sons <strong>does not offer a return or refund policy on almost all products</strong>.
                    </p>
                    <p className="leading-relaxed">
                        If a specific product exceptionally includes a return or warranty coverage, it will be <strong>explicitly displayed on that product's page</strong>.
                    </p>
                    <div className="p-3 bg-[#151515] border border-[#343434] rounded-xl text-[10px] text-[#8E8E9A] leading-normal font-semibold">
                        Manufacturing Defect Notice: If equipment arrives damaged or defective upon initial unboxing, contact technical support within 48 hours for verification.
                    </div>
                    <Link href="/return-policy" onClick={() => setIsOpen(false)} className="inline-flex items-center gap-1.5 text-[#A67C35] font-bold text-[10px] uppercase tracking-wider hover:underline pt-1">
                        Read Full Return Policy Document →
                    </Link>
                </div>
            );
        }

        // 2. Shipping & Delivery Logistics
        if (lower.includes('ship') || lower.includes('deliver') || lower.includes('courier') || lower.includes('track') || lower.includes('dispatch')) {
            return (
                <div className="space-y-3 text-xs text-[#CFCFCF]">
                    <div className="flex items-center gap-2 text-[#A67C35] font-bold uppercase tracking-wider text-[11px]">
                        <Truck size={16} /> Pan-India Logistics
                    </div>
                    <p className="leading-relaxed">
                        We dispatch all standard tool orders within <strong className="text-[#F8F3E8]">24 to 48 hours</strong> from our central Chandni Chowk store in Delhi.
                    </p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px]">
                        <li>Express delivery available for Delhi NCR.</li>
                        <li>Standard courier delivery takes 3 to 7 business days.</li>
                        <li>Heavy machinery (Rolling Mills, Castings) is shipped via surface freight (V-Trans, Safexpress, TCI).</li>
                    </ul>
                    <Link href="/track-order" onClick={() => setIsOpen(false)} className="inline-flex items-center gap-1.5 text-[#A67C35] font-bold text-[10px] uppercase tracking-wider hover:underline">
                        Track Active Shipment via AWB →
                    </Link>
                </div>
            );
        }

        // 3. Wholesale & B2B Quotations
        if (lower.includes('wholesale') || lower.includes('bulk') || lower.includes('b2b') || lower.includes('quote') || lower.includes('moq')) {
            return (
                <div className="space-y-3 text-xs text-[#CFCFCF]">
                    <p className="leading-relaxed">
                        Dinanath & Sons supports jewelry manufacturers, factories, and retail shopkeepers with direct <strong>B2B Wholesale Quotations</strong>.
                    </p>
                    <div className="bg-[#151515] p-3 rounded-xl border border-[#343434] space-y-2">
                        <p className="text-[10px] text-[#A67C35] font-bold uppercase tracking-wider">B2B Purchasing Requirements:</p>
                        <p className="text-[11px] text-[#8E8E9A] leading-normal font-semibold">
                            Wholesale rates apply when meeting Minimum Order Quantity (MOQ) thresholds for tools and equipment. Official GST Tax Invoices are provided for input credit.
                        </p>
                    </div>
                    <a 
                        href="https://wa.me/919953435647?text=Hi%20Dinanath%20Trade%20Desk,%20I%20need%20a%20wholesale%20quotation%20for%20jewelry%20tools." 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full text-center py-2.5 bg-[#A67C35] hover:bg-[#8A6232] text-black font-bold uppercase text-[9.5px] tracking-wider rounded-xl transition-all shadow"
                    >
                        Connect with B2B Trade Desk on WhatsApp
                    </a>
                </div>
            );
        }

        // 4. Product Matching Intelligence
        const matchedProducts = products.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.category.toLowerCase().includes(lower) ||
            p.description.toLowerCase().includes(lower)
        ).slice(0, 3);

        if (matchedProducts.length > 0) {
            return (
                <div className="space-y-3 text-xs text-[#CFCFCF]">
                    <p className="font-bold text-[#F8F3E8]">Here are the matching precision products from our store catalog:</p>
                    <div className="space-y-2">
                        {matchedProducts.map(p => (
                            <Link 
                                key={p.id} 
                                href={getProductUrl(p)}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 p-2.5 bg-[#151515] border border-[#343434] hover:border-[#A67C35] rounded-xl transition-all group text-left"
                            >
                                <div className="w-12 h-12 bg-white rounded-lg p-1 shrink-0 flex items-center justify-center">
                                    <img src={p.primaryImage} alt={p.name} className="max-h-full max-w-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-[#F8F3E8] group-hover:text-[#A67C35] transition-colors truncate uppercase">{p.name}</h4>
                                    <p className="text-[9px] text-[#8E8E9A] font-mono font-bold uppercase">{p.category} • ₹{p.retailPrice ? p.retailPrice.toLocaleString() : 'Out of Stock'}</p>
                                </div>
                                <ArrowRight size={14} className="text-[#8E8E9A] group-hover:text-[#A67C35] group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>
            );
        }

        // 5. Default Specialized Knowledge Assistant Response
        return (
            <div className="space-y-3 text-xs text-[#CFCFCF]">
                <p>
                    I am specialized in Dinanath & Sons' complete inventory of <strong>500+ jewellery tools, heavy rolling mills, casting machines, ultrasonic cleaners, and soldering torches</strong>.
                </p>
                <p className="text-[10px] text-[#8E8E9A] font-bold uppercase tracking-wider">
                    Try asking about: "Rolling Mills", "Return Policy", "Shipping Time", or "B2B Quotes".
                </p>
            </div>
        );
    };

    const promptChips = [
        "What is the Return Policy?",
        "Shipping & Delivery Times",
        "Show Rolling Mills",
        "B2B Wholesale Quotation"
    ];

    return (
        <>
            {/* Floating FAB Trigger Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-[150] w-14 h-14 bg-[#A67C35] hover:bg-[#8A6232] text-black rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(166,124,53,0.4)] transition-all hover:scale-110 border-none cursor-pointer"
                    >
                        <Bot size={26} strokeWidth={2.5} />
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
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[200] w-[92vw] sm:w-[420px] h-[550px] sm:h-[600px] bg-[#1E1E1E] border border-[#343434] rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-left"
                    >
                        {/* Chat Header */}
                        <div className="bg-[#151515] p-4 px-6 border-b border-[#343434] flex justify-between items-center relative select-none">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#A67C35]/15 border border-[#A67C35]/30 rounded-xl flex items-center justify-center text-[#A67C35]">
                                    <Bot size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-[#F8F3E8] uppercase tracking-wide flex items-center gap-2">
                                        Dinanath AI <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </h3>
                                    <p className="text-[9px] text-[#8E8E9A] font-mono uppercase font-semibold">Jewellery Tools Assistant</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="w-8 h-8 rounded-lg bg-[#242424] border border-[#343434] flex items-center justify-center text-[#8E8E9A] hover:text-[#F8F3E8] transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages Body */}
                        <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar bg-[#1E1E1E]">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-4 text-xs ${
                                            msg.role === 'user'
                                                ? 'bg-[#A67C35] text-black font-bold shadow-md rounded-br-none'
                                                : 'bg-[#151515] border border-[#343434] text-[#F8F3E8] rounded-bl-none shadow'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-[#151515] border border-[#343434] rounded-2xl p-3 px-4 rounded-bl-none flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#A67C35] animate-bounce" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#A67C35] animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#A67C35] animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Action Prompt Chips */}
                        <div className="px-4 py-2 bg-[#151515] border-t border-[#343434] flex items-center gap-2 overflow-x-auto custom-scrollbar">
                            {promptChips.map((chip, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(undefined, chip)}
                                    className="px-3 py-1.5 rounded-full bg-[#242424] hover:bg-[#343434] border border-[#343434] text-[#CFCFCF] text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer shrink-0"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>

                        {/* Chat Input Bar */}
                        <form onSubmit={handleSendMessage} className="p-3 px-4 bg-[#151515] border-t border-[#343434] flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask Dinanath AI..."
                                className="flex-1 h-11 bg-[#1E1E1E] border border-[#343434] focus:border-[#A67C35] rounded-xl px-4 text-xs font-bold text-[#F8F3E8] placeholder-[#8E8E9A] focus:outline-none transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="w-11 h-11 bg-[#A67C35] hover:bg-[#8A6232] text-black rounded-xl flex items-center justify-center transition-colors disabled:opacity-30 border-none cursor-pointer shrink-0 shadow"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
