'use client';

import { useAppStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export function Currency({ value, className = '' }: { value: number, className?: string }) {
    const { currencyData } = useAppStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by using default until mounted
    const converted = mounted ? value * currencyData.rate : value;
    const symbol = mounted ? currencyData.symbol : '₹';

    return (
        <span className={className}>
            {symbol}{converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
    );
}
