import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Frequently Asked Questions (FAQ) | Dinanath & Sons Jewellery Tools",
    description: "Find answers to common questions regarding retail and wholesale orders, pan-India dispatch, goldsmith tool specifications, payments, and machine warranties.",
    keywords: [
        'jewelry tools FAQ', 
        'wholesale tool return policy', 
        'jewelry machine warranty', 
        'technical tool MOQ',
        'jewellery tools Chandni Chowk'
    ],
    alternates: {
        canonical: 'https://dinanathandsons.com/faq',
    },
    openGraph: {
        title: "Frequently Asked Questions (FAQ) | Dinanath & Sons Jewellery Tools",
        description: "Find answers to common questions regarding retail and wholesale orders, pan-India dispatch, goldsmith tool specifications, payments, and warranties.",
        url: 'https://dinanathandsons.com/faq',
    }
};

export default function FaqLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
