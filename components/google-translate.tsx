'use client';

import { useEffect } from 'react';

export function GoogleTranslate() {
    useEffect(() => {
        const id = 'google-translate-script';
        if (!document.getElementById(id)) {
            const script = document.createElement('script');
            script.id = id;
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);

            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement({
                    pageLanguage: 'en',
                    includedLanguages: 'en,hi,mr,gu,bn,ta,te,kn,ml,pa',
                    autoDisplay: false,
                }, 'google_translate_element');
            };
        }
    }, []);

    return (
        <div id="google_translate_element" className="hidden"></div>
    );
}

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}
