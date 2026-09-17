import { Metadata } from 'next';
import { HomeClient } from './home-client';

export const metadata: Metadata = {
    title: "Dinanath & Sons | Jewellery Tools, Goldsmith Equipment & Machinery Since 1960",
    description: "India's premier supplier of professional jewellery making tools, goldsmith equipment, casting machinery, and polishing supplies in Maliwara, Chandni Chowk, Delhi.",
    alternates: {
        canonical: 'https://dinanathandsons.com',
    },
    openGraph: {
        title: "Dinanath & Sons | Premium Jewellery Tools & Machinery Since 1960",
        description: "India's premier supplier of professional jewellery making tools, goldsmith equipment, casting machinery, and polishing supplies in Maliwara, Chandni Chowk, Delhi.",
        url: 'https://dinanathandsons.com',
        siteName: "Dinanath & Sons",
        type: 'website',
        images: [
            {
                url: 'https://dinanathandsons.com/icon.png',
                width: 512,
                height: 512,
                alt: "Dinanath & Sons Precision Jewellery Tools",
            }
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: "Dinanath & Sons | Premium Jewellery Tools & Machinery Since 1960",
        description: "India's premier supplier of professional jewellery making tools, goldsmith equipment, casting machinery, and polishing supplies.",
        images: ['https://dinanathandsons.com/icon.png'],
    }
};

export default function HomePage() {
    return <HomeClient />;
}
