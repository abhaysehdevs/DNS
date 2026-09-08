import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'New Arrivals in Jewellery Tools & Equipment | Dinanath & Sons',
    description: 'Explore the latest precision goldsmith tools, casting machines, micro-soldering accessories, and modern workshop equipment added to Dinanath & Sons inventory.',
    alternates: {
        canonical: 'https://dinanathandsons.com/new-arrivals',
    },
    openGraph: {
        title: 'New Arrivals in Jewellery Tools | Dinanath & Sons',
        description: 'Latest goldsmith tools, casting equipment, and precision instruments at Dinanath & Sons.',
        url: 'https://dinanathandsons.com/new-arrivals',
    }
};

export default function NewArrivalsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
