import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shipping & Delivery Policy — Fast Pan-India Dispatch',
    description: 'Learn about our dispatch timelines, verified courier partners, secure packaging, and pan-India shipping rates for jewelry tools and machinery.',
    alternates: {
        canonical: 'https://dinanathandsons.com/shipping-policy',
    },
    openGraph: {
        title: 'Shipping & Delivery Policy — Fast Pan-India Dispatch | Dinanath & Sons',
        description: 'Learn about our dispatch timelines, verified courier partners, secure packaging, and pan-India shipping rates for jewelry tools and machinery.',
        url: 'https://dinanathandsons.com/shipping-policy',
    }
};

export default function ShippingPolicyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
