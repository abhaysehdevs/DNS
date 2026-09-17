import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shop Jewellery Tools, Goldsmith Machinery & Supplies',
    description: 'Explore India’s complete catalog of professional jewelry making tools, casting machinery, pliers, and polishing buffs. Wholesale MOQ pricing & pan-India dispatch.',
    alternates: {
        canonical: 'https://dinanathandsons.com/shop',
    },
    openGraph: {
        title: 'Shop Jewellery Tools, Goldsmith Machinery & Supplies | Dinanath & Sons',
        description: 'Explore India’s complete catalog of professional jewelry making tools, casting machinery, pliers, and polishing buffs. Wholesale MOQ pricing & pan-India dispatch.',
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
