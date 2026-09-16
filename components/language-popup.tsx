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
                <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-3.5 sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/75 backdrop-blur-md pointer-events-auto"
                        onClick={handleDismiss}
                    />

                    {/* Popup Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="relative bg-[#141414]/95 border border-[#A67C35]/40 rounded-2xl p-4 sm:p-5 w-full max-w-sm sm:max-w-md shadow-2xl backdrop-blur-2xl pointer-events-auto overflow-hidden text-[#F8F3E8]"
                    >
                        {/* Ambient Gold Glow */}
                        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#A67C35]/20 blur-[60px] pointer-events-none" />

                        <div className="relative z-10 space-y-3.5">
                            {/* Header */}
                            <div className="flex justify-between items-center pb-2 border-b border-[#303030]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#A67C35]/15 border border-[#A67C35]/40 flex items-center justify-center text-[#A67C35] shrink-0">
                                        <Languages size={17} strokeWidth={2.2} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-black font-display text-white uppercase tracking-wider leading-none">Choose Language</h3>
                                        <p className="text-[9px] text-[#DFCE9F] font-bold uppercase tracking-wider mt-0.5 leading-none">अपनी भाषा चुनें</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="w-7 h-7 rounded-full bg-[#202020] border border-[#343434] hover:border-[#A67C35] flex items-center justify-center text-[#8E8E9A] hover:text-white transition-colors cursor-pointer"
                                >
                                    <X size={15} />
                                </button>
                            </div>

                            {/* Languages Grid */}
                            <div>
                                <div className="text-[9px] font-mono font-bold tracking-wider text-[#8E8E9A] uppercase mb-1.5">
                                    Regional Language / भाषा
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {LANGUAGES.map((lang) => {
                                        const isSelected = language === lang.code;
                                        return (
                                            <button
                                                key={lang.code}
                                                onClick={() => handleSelectLanguage(lang.code)}
                                                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#A67C35] border-[#A67C35] text-black shadow-md font-bold'
                                                        : 'bg-[#1C1C1C] border-[#2E2E2E] text-[#D0D0D5] hover:border-[#A67C35]/50 hover:text-white'
                                                }`}
                                            >
                                                <span className="text-xs font-bold leading-none">{lang.native}</span>
                                                <span className={`text-[8.5px] uppercase tracking-wider font-mono ${isSelected ? 'text-black/70' : 'text-[#888]'}`}>
                                                    {lang.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Currency Selector */}
                            <div className="pt-2 border-t border-[#303030]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Globe size={13} className="text-[#A67C35]" />
                                        <span className="text-[9px] font-mono font-bold tracking-wider text-[#8E8E9A] uppercase">
                                            Currency / मुद्रा
                                        </span>
                                    </div>
                                    <span className="text-[8px] text-[#A67C35] font-mono font-bold">
                                        Auto-Converted
                                    </span>
                                </div>

                                <div className="grid grid-cols-5 gap-1.5">
                                    {CURRENCIES.map((curr) => {
                                        const isSelected = currencyData.code === curr.code;
                                        return (
                                            <button
                                                key={curr.code}
                                                onClick={() => handleSelectCurrency(curr.code)}
                                                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#A67C35] border-[#A67C35] text-black shadow-md font-bold'
                                                        : 'bg-[#1C1C1C] border-[#2E2E2E] text-[#A0A0A5] hover:border-[#A67C35]/50 hover:text-white'
                                                }`}
                                            >
                                                <span className="text-xs font-bold leading-none">{curr.symbol}</span>
                                                <span className={`text-[8px] font-mono mt-0.5 leading-none uppercase ${isSelected ? 'text-black/80 font-black' : 'text-[#888]'}`}>
                                                    {curr.code}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Done Button */}
                            <button
                                onClick={handleDismiss}
                                className="w-full h-8.5 bg-[#252525] border border-[#3E3E3E] hover:border-[#A67C35] text-[#F8F3E8] hover:text-[#A67C35] font-bold uppercase tracking-wider text-[9px] rounded-xl transition-all flex items-center justify-center mt-1 cursor-pointer"
                            >
                                Continue Browsing
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
