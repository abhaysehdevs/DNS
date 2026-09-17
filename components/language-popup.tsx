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
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                        onClick={handleDismiss}
                    />

                    {/* Popup Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="relative bg-white border border-[#E8E2D5] rounded-2xl p-4 sm:p-5 w-full max-w-sm sm:max-w-md shadow-2xl pointer-events-auto overflow-hidden text-[#18181B]"
                    >
                        <div className="relative z-10 space-y-3.5">
                            {/* Header */}
                            <div className="flex justify-between items-center pb-2 border-b border-[#E8E2D5]">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#FAF9F5] border border-[#E8E2D5] flex items-center justify-center text-[#966E2E] shrink-0">
                                        <Languages size={17} strokeWidth={2.2} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-black font-display text-[#18181B] uppercase tracking-wider leading-none">Choose Language</h3>
                                        <p className="text-[9px] text-[#966E2E] font-bold uppercase tracking-wider mt-0.5 leading-none">अपनी भाषा चुनें</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="w-7 h-7 rounded-full bg-[#FAF9F5] border border-[#E8E2D5] hover:bg-[#F3EFE6] flex items-center justify-center text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer"
                                >
                                    <X size={15} />
                                </button>
                            </div>

                            {/* Languages Grid */}
                            <div>
                                <div className="text-[9px] font-mono font-bold tracking-wider text-[#71717A] uppercase mb-1.5">
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
                                                        ? 'bg-[#966E2E] border-[#966E2E] text-white shadow-xs font-bold'
                                                        : 'bg-[#FAF9F5] border-[#E8E2D5] text-[#18181B] hover:border-[#966E2E]/50'
                                                }`}
                                            >
                                                <span className="text-xs font-bold leading-none">{lang.native}</span>
                                                <span className={`text-[8.5px] uppercase tracking-wider font-mono ${isSelected ? 'text-white/80' : 'text-[#71717A]'}`}>
                                                    {lang.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Currency Selector */}
                            <div className="pt-2 border-t border-[#E8E2D5]">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Globe size={13} className="text-[#966E2E]" />
                                        <span className="text-[9px] font-mono font-bold tracking-wider text-[#71717A] uppercase">
                                            Currency / मुद्रा
                                        </span>
                                    </div>
                                    <span className="text-[8px] text-[#966E2E] font-mono font-bold">
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
                                                        ? 'bg-[#966E2E] border-[#966E2E] text-white shadow-xs font-bold'
                                                        : 'bg-[#FAF9F5] border-[#E8E2D5] text-[#52525B] hover:border-[#966E2E]/50 hover:text-[#18181B]'
                                                }`}
                                            >
                                                <span className="text-xs font-bold leading-none">{curr.symbol}</span>
                                                <span className={`text-[8px] font-mono mt-0.5 leading-none uppercase ${isSelected ? 'text-white font-bold' : 'text-[#71717A]'}`}>
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
                                className="w-full h-9 bg-[#966E2E] hover:bg-[#7D5A25] text-white font-bold uppercase tracking-wider text-[9px] rounded-xl transition-all flex items-center justify-center mt-1 cursor-pointer shadow-xs"
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
