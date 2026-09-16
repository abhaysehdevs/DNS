import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shop Jewellery Tools & Goldsmith Equipment | Dinanath & Sons',
    description: 'Browse India’s complete catalog of professional jewelry making tools, goldsmith hand tools, casting machinery, and polishing supplies with pan-India delivery.',
    alternates: {
        canonical: 'https://dinanathandsons.com/shop',
    },
    openGraph: {
        title: 'Shop Jewellery Tools & Goldsmith Equipment | Dinanath & Sons',
        description: 'Browse our complete catalog of professional jewellery making tools, casting machinery, and precision instruments.',
        url: 'https://dinanathandsons.com/shop',
    }
};

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
