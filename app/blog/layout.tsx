import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Dinanath & Sons Blog | Metallurgy, Goldsmith Craft & Machine Maintenance",
    description: "Professional tutorials, gold casting methodologies, rolling mill calibrations, and industrial maintenance guides for jewelry technicians.",
    keywords: [
        'metallurgy blog', 
        'goldsmith tutorials', 
        'jewelry machinery maintenance', 
        'gold casting protocols'
    ],
    openGraph: {
        title: "Dinanath & Sons Blog | Metallurgy, Goldsmith Craft & Machine Maintenance",
        description: "Professional tutorials, gold casting methodologies, rolling mill calibrations, and industrial maintenance guides for jewelry technicians.",
        url: 'https://dinanathandsons.com/blog',
    }
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
