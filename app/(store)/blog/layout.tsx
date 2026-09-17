import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Jewellery Metallurgy, Goldsmith Craft & Machinery Blog",
    description: "Expert tutorials on gold soldering, casting methodologies, workshop machinery calibration, and metal polishing guides for jewelry craftsmen.",
    keywords: [
        'metallurgy blog', 
        'goldsmith tutorials', 
        'jewelry machinery maintenance', 
        'gold casting protocols'
    ],
    alternates: {
        canonical: 'https://dinanathandsons.com/blog',
    },
    openGraph: {
        title: "Jewellery Metallurgy, Goldsmith Craft & Machinery Blog | Dinanath & Sons",
        description: "Expert tutorials on gold soldering, casting methodologies, workshop machinery calibration, and metal polishing guides for jewelry craftsmen.",
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
