import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Dinanath's | Premium Jewelry Tool Heritage Since 1914",
    description: "Discover the heritage of Dinanath & Sons in Maliwara, Chandni Chowk, Delhi. Supplying professional goldsmith tools, casting machinery, and precision rolling mills globally.",
    keywords: [
        'goldsmith tools history', 
        'jewelry tool manufacturer India', 
        'Chandni Chowk tool shop', 
        'Dinanath heritage',
        'professional jewelry makers'
    ],
    openGraph: {
        title: "About Dinanath's | Premium Jewelry Tool Heritage Since 1914",
        description: "Discover the heritage of Dinanath & Sons in Maliwara, Chandni Chowk, Delhi. Supplying professional goldsmith tools, casting machinery, and precision rolling mills globally.",
        url: 'https://dinanathandsons.com/about',
    }
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
