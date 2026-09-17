import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Frequently Asked Questions — Tool Orders, Shipping & Wholesale",
    description: "Find answers to common questions regarding jewelry tool orders, pan-India shipping, bulk wholesale discounts, warranties, and payment methods.",
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
        title: "Frequently Asked Questions — Tool Orders, Shipping & Wholesale | Dinanath & Sons",
        description: "Find answers to common questions regarding jewelry tool orders, pan-India shipping, bulk wholesale discounts, warranties, and payment methods.",
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
