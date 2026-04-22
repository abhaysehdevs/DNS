
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, ShoppingBag, Truck, Info, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/data';
import Link from 'next/link';
<<<<<<< Updated upstream
=======
import { Currency } from '@/components/currency';
>>>>>>> Stashed changes

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

    // Simple "AI" Logic (Rule-based + Search)
    const generateResponse = (query: string): React.ReactNode => {
        const lowerQuery = query.toLowerCase();

        // 1. Greetings
        if (lowerQuery.match(/\b(hi|hello|hey|namaste)\b/)) {
            return "Hello! Looking for any specific tools or machinery?";
        }

        // 2. Shipping / Delivery
        if (lowerQuery.includes('shipping') || lowerQuery.includes('delivery') || lowerQuery.includes('track')) {
            return (
                <div>
                    <p className="mb-2">We offer <strong>Instant Delivery</strong> in select areas and Standard Shipping nationwide.</p>
                    <p>You can check delivery availability on any product page using your Pincode.</p>
                </div>
            );
        }

        // 3. Contact
        if (lowerQuery.includes('contact') || lowerQuery.includes('phone') || lowerQuery.includes('address')) {
            return (
                <div>
                    <p className="mb-2">You can reach us directly via:</p>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Phone: +91 99534 35647</li>
                        <li>Address: 4346, Gali Bahuji, Pahari Dhiraj, Sadar Bazar, Delhi-110006</li>
                    </ul>
                </div>
            );
        }

        // 4. Product Search (The "AI" Part)
        // Simple keyword matching against product name, description, category
        const matches = products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
        ).slice(0, 3); // Limit to 3 suggestions

        if (matches.length > 0) {
            return (
                <div>
                    <p className="mb-3">I found these items for you:</p>
                    <div className="space-y-3">
                        {matches.map(p => (
                            <Link href={`/shop/${p.id}`} key={p.id} className="flex gap-3 bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors group">
                                <div className="w-12 h-12 bg-white rounded flex-shrink-0 overflow-hidden">
                                    <img src={p.primaryImage} alt={p.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold truncate group-hover:text-amber-500 transition-colors">{p.name}</div>
<<<<<<< Updated upstream
                                    <div className="text-xs text-gray-400">₹{p.retailPrice.toLocaleString()}</div>
=======
                                    <div className="text-xs text-gray-400"><Currency value={p.retailPrice} /></div>
>>>>>>> Stashed changes
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            );
        }

        // 5. Fallback
        return "I'm not sure about that specific item. Check our 'Shop' page or try searching for keywords like 'pliers', 'flux', or 'gold bar'.";
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
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-amber-600 to-amber-700 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-110 transition-transform group"
                    >
                        <Sparkles className="text-white animate-pulse" />
                        <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-white text-black text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            Ask AI Assistant
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-[400px] h-[500px] bg-black/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-900/30 rounded-full flex items-center justify-center border border-amber-500/50">
                                    <Sparkles size={20} className="text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Dinanath AI</h3>
                                    <span className="flex items-center gap-1.5 text-[10px] text-green-400">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
                            ref={scrollRef}
                        >
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                                                ? 'bg-amber-600 text-white rounded-br-none'
                                                : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-gray-900 border-t border-gray-800 flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about tools..."
                                className="flex-1 bg-black border border-gray-700 rounded-full px-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="bg-amber-600 hover:bg-amber-700 text-white rounded-full w-10 h-10 flex-shrink-0"
                                disabled={!input.trim() || isTyping}
                            >
                                <Send size={18} />
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
