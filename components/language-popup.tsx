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

const CURRENCIES = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' }
];

export function LanguagePopup() {
    const { language, setLanguage, hasSeenLanguagePopup, setHasSeenLanguagePopup, currencyData, setCurrencyData } = useAppStore();
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

        const domain = window.location.hostname;
        const rootDomain = domain.split('.').slice(-2).join('.');

        if (langCode === 'en') {
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`;
            if (rootDomain !== domain) {
                document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain}`;
            }
        } else {
            document.cookie = `googtrans=/en/${langCode}; path=/;`;
            document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
            document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain}`;
            if (rootDomain !== domain) {
                document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${rootDomain}`;
            }
        }

        // Short delay to let the state save before reload
        setTimeout(() => {
            window.location.reload();
        }, 150);
    };

    const handleSelectCurrency = async (currCode: string) => {
        try {
            if (currCode === 'INR') {
                setCurrencyData({ code: 'INR', symbol: '₹', rate: 1 });
                return;
            }
            const rateRes = await fetch('https://open.er-api.com/v6/latest/INR');
            const rateData = await rateRes.json();
            const rate = rateData.rates[currCode] || 1;
            
            const symbols: Record<string, string> = { 
                USD: '$', EUR: '€', GBP: '£', AED: 'د.إ'
            };
            const symbol = symbols[currCode] || currCode + ' ';
            
            setCurrencyData({ code: currCode, symbol, rate });
        } catch (err) {
            console.error('Failed to change currency:', err);
        }
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
                        className="relative bg-black border-4 border-[#F5D800] rounded-none p-6 w-full max-w-md shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] pointer-events-auto overflow-hidden text-white"
                    >
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-[#F5D800] text-black p-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Languages size={22} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-wider">Choose Language</h3>
                                        <p className="text-[10px] text-[#F5D800] font-bold uppercase tracking-widest mt-0.5">अपनी भाषा चुनें</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="text-gray-400 hover:text-white transition-colors p-1 border border-transparent hover:border-white/20"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-gray-300 mb-6 text-xs leading-relaxed font-semibold uppercase tracking-wide">
                                Select your preferred language for precision browsing.
                                <br />
                                <span className="text-gray-500 text-[10px] block mt-1">आप अपनी क्षेत्रीय भाषा में वेबसाइट देख सकते हैं।</span>
                            </p>

                            <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleSelectLanguage(lang.code)}
                                        className={`flex flex-col items-start p-3 rounded-none border-2 transition-all ${language === lang.code
                                            ? 'bg-[#F5D800] border-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black'
                                            : 'bg-[#151515] border-white/10 text-gray-300 hover:border-[#F5D800] hover:text-white'
                                            }`}
                                    >
                                        <span className="text-sm font-black">{lang.native}</span>
                                        <span className={`text-[10px] font-bold ${language === lang.code ? 'text-black/60' : 'text-gray-500'}`}>{lang.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Currency Selector */}
                            <div className="mt-6 border-t-2 border-white/15 pt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-[#F5D800] text-black p-2 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                        <Globe size={18} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Choose Currency</h4>
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mt-0.5">Dynamic Exchange Conversion</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {CURRENCIES.map((curr) => (
                                        <button
                                            key={curr.code}
                                            onClick={() => handleSelectCurrency(curr.code)}
                                            className={`flex items-center justify-center gap-2.5 py-3 px-2 rounded-none border-2 text-xs font-black uppercase tracking-wider transition-all ${
                                                currencyData.code === curr.code
                                                    ? 'bg-[#F5D800] border-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                                    : 'bg-[#151515] border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                                            }`}
                                        >
                                            <span className="text-sm">{curr.symbol}</span>
                                            <span>{curr.code}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
