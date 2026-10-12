'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { SITE_CONFIG } from '@/lib/site-config';

export function GoogleAnalytics() {
    const pathname = usePathname();

    // Do NOT run analytics tracking inside the admin console
    if (!pathname || pathname.startsWith('/admin')) {
        return null;
    }

    const ga4Id = SITE_CONFIG.analytics.ga4Id;
    if (!ga4Id || ga4Id.trim() === '') {
        return null;
    }

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${ga4Id}', {
                        send_page_view: true
                    });
                `}
            </Script>
        </>
    );
}
