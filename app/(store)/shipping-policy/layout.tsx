import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shipping & Delivery Policy | Pan-India Dispatch | Dinanath & Sons',
    description: 'Information regarding order dispatch timelines, logistics partners, pan-India courier delivery, and secure transit insurance for Dinanath & Sons tools.',
    alternates: {
        canonical: 'https://dinanathandsons.com/shipping-policy',
    },
    openGraph: {
        title: 'Shipping & Delivery Policy | Dinanath & Sons',
        description: 'Pan-India shipping terms and dispatch protocols for retail and wholesale orders.',
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
