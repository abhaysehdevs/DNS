import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Dinanath & Sons | Jewellery Tool Heritage Since 1960 | Chandni Chowk",
    description: "Discover the 60+ year heritage of Dinanath & Sons, founded in 1960 in Maliwara, Chandni Chowk, Delhi. Supplying master goldsmiths and modern jewellery manufacturers with precision tools and casting machinery.",
    keywords: [
        'goldsmith tools history', 
        'jewelry tool manufacturer India', 
        'Chandni Chowk tool shop', 
        'Dinanath heritage 1960',
        'jewellery tools Chandni Chowk',
        'professional jewelry makers'
    ],
    alternates: {
        canonical: 'https://dinanathandsons.com/about',
    },
    openGraph: {
        title: "About Dinanath & Sons | Jewellery Tool Heritage Since 1960",
        description: "Discover the heritage of Dinanath & Sons in Maliwara, Chandni Chowk, Delhi. Supplying professional goldsmith tools, casting machinery, and precision rolling mills since 1960.",
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
