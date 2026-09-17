import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Us — 60+ Years Goldsmith Heritage in Chandni Chowk",
    description: "Founded in 1960 in Maliwara, Chandni Chowk, Dinanath & Sons is India's trusted manufacturer and distributor of professional jewelry tools and machinery.",
    keywords: [
        'goldsmith tools history', 
        'jewelry tool manufacturer India', 
        'Chandni Chowk tool shop', 
        'Dinanath heritage 1960',
        'jewellery tools Chandni Chowk',
        'professional jewelry makers'
    ],
    alternates: {
        canonical: 'https://dinanathandsons.com/about',
    },
    openGraph: {
        title: "About Us — 60+ Years Goldsmith Heritage in Chandni Chowk | Dinanath & Sons",
        description: "Founded in 1960 in Maliwara, Chandni Chowk, Dinanath & Sons is India's trusted manufacturer and distributor of professional jewelry tools and machinery.",
        url: 'https://dinanathandsons.com/about',
    }
};


const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Dinanath & Sons",
    "description": "Discover the 60+ year heritage of Dinanath & Sons, founded in 1960 in Maliwara, Chandni Chowk, Delhi. Supplying master goldsmiths and modern jewellery manufacturers with precision tools and casting machinery.",
    "url": "https://dinanathandsons.com/about",
    "mainEntity": {
        "@type": "LocalBusiness",
        "name": "Dinanath & Sons",
        "legalName": "Dinanath & Sons",
        "foundingDate": "1960",
        "image": "https://dinanathandsons.com/icon.png",
        "priceRange": "₹₹",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Shop 1914, Chatta Madan Gopal, Maliwara, Chandni Chowk",
            "addressLocality": "Central Delhi",
            "addressRegion": "Delhi",
            "postalCode": "110006",
            "addressCountry": "IN"
        },
        "url": "https://dinanathandsons.com"
    }
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
            />
            {children}
        </>
    );
}
