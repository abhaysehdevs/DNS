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

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
