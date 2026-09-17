'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    Send, 
    Mic, 
    MicOff, 
    X, 
    Maximize2, 
    Trash2, 
    ExternalLink, 
    CheckCircle2, 
    AlertCircle, 
    Loader2, 
    Bot, 
    User as UserIcon,
    ChevronRight,
    ShoppingBag,
    Package,
    Tag,
    RefreshCw,
    Minimize2
} from 'lucide-react';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    actionResult?: {
        success: boolean;
        action: string;
        message: string;
        data?: any;
        navigationUrl?: string;
    };
}

interface AdminAiAssistantProps {
    isOpenExternal?: boolean;
    onToggleExternal?: (open: boolean) => void;
    isPageMode?: boolean;
}

export default function AdminAiAssistant({ 
    isOpenExternal, 
    onToggleExternal, 
    isPageMode = false 
}: AdminAiAssistantProps) {
    const router = useRouter();
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = isPageMode ? true : (isOpenExternal !== undefined ? isOpenExternal : internalOpen);

    const setIsOpen = (val: boolean) => {
        if (onToggleExternal) {
            onToggleExternal(val);
        } else {
            setInternalOpen(val);
        }
    };

    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('dns_admin_ai_chat');
            if (saved) {
                try { return JSON.parse(saved); } catch (e) {}
            }
        }
        return [
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Hello Boss! I am your **DNS Admin AI Assistant**. You can command me to do anything in the admin panel — add new products, update prices, summarize orders, change statuses, create coupons, and more. What would you like me to handle today?',
                timestamp: Date.now()
            }
        ];
    });

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Save chat in session
    useEffect(() => {
        if (typeof window !== 'undefined' && messages.length > 0) {
            sessionStorage.setItem('dns_admin_ai_chat', JSON.stringify(messages.slice(-30)));
        }
    }, [messages]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, loading]);

    // Keyboard shortcut (Ctrl+K or Cmd+K)
    useEffect(() => {
        if (isPageMode) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsOpen(!isOpen);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isPageMode]);

    // Speech Recognition Setup
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                setSpeechSupported(true);
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = 'en-IN'; // Indian English

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
                    setIsListening(false);
                };

                recognition.onerror = (event: any) => {
                    console.warn('Speech recognition error:', event.error);
                    setIsListening(false);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current = recognition;
            }
        }
    }, []);

    const toggleSpeech = () => {
        if (!speechSupported || !recognitionRef.current) {
            alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error('Speech error:', err);
                setIsListening(false);
            }
        }
    };

    const handleSend = async (textToSend?: string) => {
        const query = (textToSend || input).trim();
        if (!query || loading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: query,
            timestamp: Date.now()
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const adminEmail = typeof window !== 'undefined' ? sessionStorage.getItem('dns_admin_email') || 'ajayabhay12872@gmail.com' : 'ajayabhay12872@gmail.com';

            const res = await fetch('/api/admin/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-email': adminEmail
                },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to get response from AI');
            }

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply || 'Task processed.',
                timestamp: Date.now(),
                actionResult: data.actionResult
            };

            setMessages(prev => [...prev, aiMsg]);

            // If action involves navigation
            if (data.actionResult?.action === 'navigate_to' && data.actionResult?.navigationUrl) {
                setTimeout(() => {
                    router.push(data.actionResult.navigationUrl);
                    if (!isPageMode) setIsOpen(false);
                }, 1200);
            }
        } catch (err: any) {
            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `⚠️ Error executing command: ${err.message}`,
                    timestamp: Date.now()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        if (confirm('Clear chat history?')) {
            const resetMsg: ChatMessage[] = [{
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Chat cleared. How can I assist you now, Boss?',
                timestamp: Date.now()
            }];
            setMessages(resetMsg);
            sessionStorage.removeItem('dns_admin_ai_chat');
        }
    };

    // Quick Command Prompts
    const quickPrompts = [
        { label: '📊 Summarize Orders', cmd: 'Give me a full summary of all orders' },
        { label: '⚠️ Low Stock Alert', cmd: 'Check low stock products' },
        { label: '📦 Add New Product', cmd: 'Add new product named Havells 2.5mm Copper Wire at price ₹450 in category Cables & Wires' },
        { label: '🎟️ Create 10% Coupon', cmd: 'Create coupon code SAVE10 for 10% discount' },
        { label: '👥 Top Customers', cmd: 'Show customer summary and top clients' }
    ];

    // Helper to format simple markdown (bold, lists, links)
    const formatMessageText = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, idx) => {
            let processed: React.ReactNode = line;

            // Bullet points
            const isBullet = line.trim().startsWith('•') || line.trim().startsWith('* ') || line.trim().startsWith('- ');
            const cleanLine = isBullet ? line.trim().replace(/^[•*-]\s*/, '') : line;

            // Render bold
            const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
            const formattedParts = parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={pIdx} className="font-bold text-[#18181B]">{part.slice(2, -2)}</strong>;
                }
                return part;
            });

            if (isBullet) {
                return (
                    <div key={idx} className="flex items-start gap-2 my-1 text-sm">
                        <span className="text-[#966E2E] mt-0.5">•</span>
                        <span>{formattedParts}</span>
                    </div>
                );
            }

            if (!line.trim()) {
                return <div key={idx} className="h-2" />;
            }

            return <p key={idx} className="text-sm my-0.5 leading-relaxed">{formattedParts}</p>;
        });
    };

    const renderChatContent = () => (
        <div className="flex flex-col h-full bg-white text-[#18181B]">
            {/* Header */}
            <div className="p-4 border-b border-[#E8E2D5] bg-[#FAF9F5] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative p-2 bg-[#966E2E] text-white rounded-xl shadow-sm">
                        <Sparkles size={18} />
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-base tracking-tight text-[#18181B]">DNS Admin AI</h2>
                            <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-[#966E2E]/10 text-[#966E2E] border border-[#966E2E]/20">
                                Full Control
                            </span>
                        </div>
                        <p className="text-xs text-[#71717A]">Voice & Command Executive Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleClearChat}
                        title="Clear Chat"
                        className="p-1.5 text-[#71717A] hover:text-rose-600 hover:bg-[#FAF9F5] rounded-lg transition-colors cursor-pointer"
                    >
                        <Trash2 size={16} />
                    </button>
                    {!isPageMode && (
                        <>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    router.push('/admin/ai');
                                }}
                                title="Open Fullscreen Hub"
                                className="p-1.5 text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF9F5] rounded-lg transition-colors cursor-pointer"
                            >
                                <Maximize2 size={16} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF9F5] rounded-lg transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Quick Prompts Bar */}
            <div className="p-2 border-b border-[#E8E2D5] bg-[#FAF9F5]/70 overflow-x-auto flex gap-2 no-scrollbar">
                {quickPrompts.map((qp, i) => (
                    <button
                        key={i}
                        disabled={loading}
                        onClick={() => handleSend(qp.cmd)}
                        className="whitespace-nowrap px-2.5 py-1 text-xs rounded-full bg-white hover:bg-[#966E2E] hover:text-white border border-[#E8E2D5] text-[#52525B] transition-all cursor-pointer flex-shrink-0 shadow-2xs"
                    >
                        {qp.label}
                    </button>
                ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            {!isUser && (
                                <div className="w-8 h-8 rounded-lg bg-[#966E2E]/10 border border-[#966E2E]/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#966E2E]">
                                    <Bot size={18} />
                                </div>
                            )}

                            <div className={`max-w-[85%] space-y-2`}>
                                <div
                                    className={`p-3.5 rounded-2xl ${
                                        isUser
                                            ? 'bg-[#966E2E] text-white rounded-tr-none shadow-sm'
                                            : 'bg-[#FAF9F5] border border-[#E8E2D5] text-[#18181B] rounded-tl-none'
                                    }`}
                                >
                                    {isUser ? (
                                        <p className="text-sm my-0.5 leading-relaxed">{msg.content}</p>
                                    ) : (
                                        formatMessageText(msg.content)
                                    )}
                                </div>

                                {/* Action Result Card */}
                                {msg.actionResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-3 rounded-xl border text-xs flex flex-col gap-2 ${
                                            msg.actionResult.success
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                : 'bg-rose-50 border-rose-200 text-rose-800'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between font-semibold">
                                            <div className="flex items-center gap-1.5">
                                                {msg.actionResult.success ? (
                                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                                ) : (
                                                    <AlertCircle size={14} className="text-rose-600" />
                                                )}
                                                <span className="uppercase tracking-wider font-mono">
                                                    Action: {msg.actionResult.action.replace('_', ' ')}
                                                </span>
                                            </div>
                                            {msg.actionResult.navigationUrl && (
                                                <button
                                                    onClick={() => {
                                                        router.push(msg.actionResult!.navigationUrl!);
                                                        if (!isPageMode) setIsOpen(false);
                                                    }}
                                                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-white text-[#18181B] border border-[#E8E2D5] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                                                >
                                                    View Page <ExternalLink size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                <span className={`text-[10px] text-[#71717A] block px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {isUser && (
                                <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#E8E2D5] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#52525B]">
                                    <UserIcon size={16} />
                                </div>
                            )}
                        </div>
                    );
                })}

                {loading && (
                    <div className="flex gap-3 items-center text-[#52525B] text-xs">
                        <div className="w-8 h-8 rounded-lg bg-[#966E2E]/10 border border-[#966E2E]/20 flex items-center justify-center text-[#966E2E]">
                            <Loader2 size={16} className="animate-spin" />
                        </div>
                        <div className="p-3 bg-[#FAF9F5] border border-[#E8E2D5] rounded-2xl rounded-tl-none flex items-center gap-2">
                            <span className="animate-pulse">AI is executing your command on the admin panel...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-[#E8E2D5] bg-[#FAF9F5]">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex items-center gap-2"
                >
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? 'Listening to voice command...' : 'Command AI: "Add product...", "Summarize orders"...'}
                            disabled={loading}
                            className={`w-full bg-white border ${
                                isListening ? 'border-rose-500 animate-pulse' : 'border-[#E8E2D5] focus:border-[#966E2E]'
                            } text-[#18181B] placeholder-[#A1A1AA] text-sm rounded-xl px-4 py-3 outline-none transition-all pr-12`}
                        />
                        {speechSupported && (
                            <button
                                type="button"
                                onClick={toggleSpeech}
                                title={isListening ? 'Stop listening' : 'Voice command (hands-free)'}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
                                    isListening
                                        ? 'bg-rose-500 text-white shadow-md animate-bounce'
                                        : 'text-[#71717A] hover:text-[#966E2E] hover:bg-[#FAF9F5]'
                                }`}
                            >
                                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="p-3 bg-[#966E2E] hover:bg-[#7D5A25] disabled:opacity-40 text-white rounded-xl shadow-sm transition-all cursor-pointer flex-shrink-0"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </form>
                <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-[#71717A]">
                    <span>Press <strong>Enter</strong> to send • <strong>Ctrl+K</strong> to toggle</span>
                    {speechSupported && <span className="text-[#966E2E]">🎙️ Voice dictation available</span>}
                </div>
            </div>
        </div>
    );

    // If used as dedicated page component (/admin/ai)
    if (isPageMode) {
        return (
            <div className="h-[calc(100vh-8.5rem)] rounded-2xl border border-[#E8E2D5] overflow-hidden shadow-sm">
                {renderChatContent()}
            </div>
        );
    }

    // Global Floating Widget
    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-[#966E2E] hover:bg-[#7D5A25] text-white rounded-full shadow-xl border border-white/20 cursor-pointer group"
                title="Open DNS Admin AI Assistant (Ctrl+K)"
            >
                <div className="relative">
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                </div>
                <span className="font-semibold text-sm tracking-tight hidden sm:inline">DNS AI Assistant</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono hidden md:inline">
                    ⌘K
                </span>
            </motion.button>

            {/* Slide-out Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                        />
                        <motion.div
                            initial={{ x: 450, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 450, opacity: 0 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                            className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] max-w-full z-50 shadow-2xl border-l border-[#E8E2D5] flex flex-col overflow-hidden"
                        >
                            {renderChatContent()}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
