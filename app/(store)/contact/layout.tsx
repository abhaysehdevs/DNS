import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Contact Dinanath & Sons | Chandni Chowk Store & Wholesale Support",
    description: "Visit Dinanath & Sons at Shop 1914, Chatta Madan Gopal, Maliwara, Chandni Chowk, Delhi - 110006. Inquire for wholesale pricing, machine calibration, and pan-India dispatch.",
    keywords: [
        'contact jewelry machinery', 
        'jewelry tools supplier Delhi', 
        'jewellery tools Chandni Chowk', 
        'B2B wholesale tools support', 
        'goldsmith tools Maliwara',
        'jewellery equipment supplier New Delhi'
    ],
    alternates: {
        canonical: 'https://dinanathandsons.com/contact',
    },
    openGraph: {
        title: "Contact Dinanath & Sons | Chandni Chowk Store & Wholesale Support",
        description: "Visit Dinanath & Sons in Maliwara, Chandni Chowk, Delhi. Direct contact for wholesale quotes, machine calibration, and tool orders.",
        url: 'https://dinanathandsons.com/contact',
    }
};

const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Dinanath & Sons",
    "description": "Visit Dinanath & Sons in Maliwara, Chandni Chowk, Delhi. Direct contact for wholesale quotes, machine calibration, and tool orders.",
    "url": "https://dinanathandsons.com/contact",
    "mainEntity": {
        "@type": "Store",
        "name": "Dinanath & Sons Chandni Chowk Store",
        "image": "https://dinanathandsons.com/icon.png",
        "telephone": "+91-9810000000",
        "email": "contact@dinanathandsons.com",
        "priceRange": "₹₹",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Shop 1914, Chatta Madan Gopal, Maliwara, Chandni Chowk",
            "addressLocality": "Central Delhi",
            "addressRegion": "Delhi",
            "postalCode": "110006",
            "addressCountry": "IN"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "28.6562",
            "longitude": "77.2307"
        },
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday"
                ],
                "opens": "11:00",
                "closes": "19:30"
            }
        ],
        "url": "https://dinanathandsons.com"
    }
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
            />
            {children}
        </>
    );
}
