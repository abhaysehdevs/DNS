/**
 * Site Configuration - Single Source of Truth
 * Ensures 100% consistency across canonical URLs, NAP (Name, Address, Phone),
 * metadata, schema.org structured data, and Google Merchant Center feeds.
 */

export const SITE_CONFIG = {
    // Canonical Host (Apex domain per ground rules & decision default)
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://dinanathandsons.com',
    canonicalDomain: 'dinanathandsons.com',
    
    // Business Identity (Consistent NAP)
    businessName: 'Dinanath & Sons',
    legalName: process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || 'Dinanath & Sons',
    alternateNames: ['Dinanath and Sons', "Dinanath's", 'Dinanath Tools'],
    foundingYear: '1960',
    yearsInBusiness: '60+',
    
    // Physical Store Address (Official canonical string across all surfaces)
    address: {
        streetAddress: '1914, Chatta Madan Gopal, Maliwara, Chandni Chowk',
        addressLocality: 'Delhi',
        addressRegion: 'Delhi',
        postalCode: '110006',
        addressCountry: 'IN',
        formatted: '1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi - 110006, India',
        shortFormatted: '1914, Maliwara, Chandni Chowk, Delhi - 110006',
    },
    
    // Coordinates (Maliwara, Chandni Chowk shop)
    geo: {
        latitude: 28.6562,
        longitude: 77.2309,
    },
    
    // Direct Contact Channels
    contact: {
        phone: '+919953435647',
        phoneDisplay: '+91 9953435647',
        email: 'info@dinanathandsons.com',
        whatsApp: '919953435647',
        supportHours: 'Mon - Sat: 11:00 AM - 8:00 PM IST (Sunday Closed)',
        openingHoursSpecification: [
            {
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                opens: '11:00',
                closes: '20:00',
            }
        ],
    },
    
    // Social Profiles & External Verifications
    sameAs: [
        'https://www.facebook.com/dinanathandsons',
        'https://www.instagram.com/dinanathandsons',
        'https://maps.google.com/?q=Dinanath+%26+Sons+Maliwara+Chandni+Chowk+Delhi+110006'
    ],
    
    // Tax & Compliance (DECISION NEEDED Defaults)
    tax: {
        gstInclusive: true, // Display prices are inclusive of GST
        gstin: process.env.NEXT_PUBLIC_GSTIN || '', // Available on tax invoices
        defaultGstRate: 18,
    },
    
    // Shipping Defaults
    shipping: {
        freeShippingThreshold: 1999, // INR
        standardShippingRate: 99, // INR below threshold
        handlingTimeDays: { min: 1, max: 2 }, // 24-48 hours
        handlingTimeHeavyDays: { min: 3, max: 5 }, // Heavy machinery
        transitTimeDays: {
            delhiNcr: { min: 1, max: 2 },
            metroCities: { min: 2, max: 4 },
            restOfIndia: { min: 4, max: 7 },
            remote: { min: 7, max: 10 }
        },
        country: 'IN',
        currency: 'INR',
    },
    
    // Site Verification Tokens
    verification: {
        googleSearchConsole: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
        googleMerchantCenter: process.env.NEXT_PUBLIC_GOOGLE_MERCHANT_VERIFICATION || '',
    },
    
    // Analytics
    analytics: {
        ga4Id: process.env.NEXT_PUBLIC_GA4_ID || 'G-9HPF6NRR0W',
    }
} as const;

export function getAbsoluteUrl(path: string = ''): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SITE_CONFIG.baseUrl}${cleanPath === '/' ? '' : cleanPath}`;
}
