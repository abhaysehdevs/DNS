import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'New Arrivals in Jewellery Tools & Workshop Equipment',
    description: 'Explore the newest goldsmith tools, casting machines, micro-soldering gear, and workshop supplies added to Dinanath & Sons Chandni Chowk inventory.',
    alternates: {
        canonical: 'https://dinanathandsons.com/new-arrivals',
    },
    openGraph: {
        title: 'New Arrivals in Jewellery Tools & Workshop Equipment | Dinanath & Sons',
        description: 'Explore the newest goldsmith tools, casting machines, micro-soldering gear, and workshop supplies added to Dinanath & Sons Chandni Chowk inventory.',
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
