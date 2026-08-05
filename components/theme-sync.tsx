'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function ThemeSync() {
    const theme = useAppStore((state) => state.theme);

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        }
    }, [theme]);

    return null;
}
