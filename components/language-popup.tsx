'use client';

import { useState, useEffect } from 'react';
import { useAppStore, Language } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Languages, Globe } from 'lucide-react';

const LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
];

export function LanguagePopup() {
    const { language, setLanguage, hasSeenLanguagePopup, setHasSeenLanguagePopup } = useAppStore();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show popup after a short delay if user hasn't seen it
        if (!hasSeenLanguagePopup) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [hasSeenLanguagePopup]);

    // Handle manual trigger from Navbar
    useEffect(() => {
        const handleOpen = () => setIsVisible(true);
        window.addEventListener('open-language-popup', handleOpen);
        return () => window.removeEventListener('open-language-popup', handleOpen);
    }, []);

    const handleSelectLanguage = (langCode: string) => {
        setLanguage(langCode as Language);
        setIsVisible(false);
        setHasSeenLanguagePopup(true);

        if (langCode === 'en') {
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
        } else {
            document.cookie = `googtrans=/en/${langCode}; path=/;`;
        }

        // Short delay to let the state save before reload
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setHasSeenLanguagePopup(true);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none p-4 sm:p-0">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                        onClick={handleDismiss}
                    />

                    {/* Popup Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl pointer-events-auto overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-600/20 rounded-full blur-[50px]" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-500/10 p-2.5 rounded-full text-amber-500">
                                        <Languages size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Choose Language</h3>
                                        <p className="text-sm text-amber-500 font-medium">अपनी भाषा चुनें</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="text-gray-400 hover:text-white transition-colors p-1"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-gray-300 mb-6 text-sm">
                                You can view the website in your regional language.
                                <br />
                                <span className="text-gray-400 text-xs">आप अपनी क्षेत्रीय भाषा में वेबसाइट देख सकते हैं।</span>
                            </p>

                            <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleSelectLanguage(lang.code)}
                                        className={`flex flex-col items-start p-3 rounded-xl border transition-all ${language === lang.code
                                            ? 'bg-amber-600/20 border-amber-600 text-amber-500'
                                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-750'
                                            }`}
                                    >
                                        <span className="text-sm font-bold">{lang.native}</span>
                                        <span className="text-xs text-gray-500">{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
