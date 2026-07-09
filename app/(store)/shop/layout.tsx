import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Shop Premium Jewelry Tools | Wholesale Inventory | Dinanath & Sons',
    description: 'Browse our extensive catalog of professional jewelry making tools, casting machinery, precision instruments, and polishing consumables. Available for retail and B2B wholesale.',
    openGraph: {
        title: 'Shop Premium Jewelry Tools | Dinanath & Sons',
        description: 'Browse our extensive catalog of professional jewelry making tools, casting machinery, and precision instruments.',
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
