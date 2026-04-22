'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

export function CurrencyManager() {
    const { setCurrencyData, currencyData } = useAppStore();
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        async function initCurrency() {
            try {
                // Get user currency from IP
                const ipRes = await fetch('https://ipapi.co/json/');
                const ipData = await ipRes.json();
                const userCurrency = ipData.currency || 'INR';

                if (userCurrency === 'INR') {
                    setCurrencyData({ code: 'INR', symbol: '₹', rate: 1 });
                    return;
                }

                // Get exchange rate
                const rateRes = await fetch('https://open.er-api.com/v6/latest/INR');
                const rateData = await rateRes.json();
                const rate = rateData.rates[userCurrency] || 1;

                // Simple symbol map
                const symbols: Record<string, string> = { 
                    USD: '$', EUR: '€', GBP: '£', AED: 'د.إ', AUD: 'A$', CAD: 'C$', SGD: 'S$', JPY: '¥', CHF: 'CHF' 
                };
                const symbol = symbols[userCurrency] || userCurrency + ' ';

                setCurrencyData({ code: userCurrency, symbol, rate });
            } catch (error) {
                console.error('Currency detection failed', error);
            }
        }

        // Only detect once per session or if default
        if (currencyData.code === 'INR') {
            initCurrency();
        }
    }, [currencyData.code, setCurrencyData]);

    return null;
}
