import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Returns & Replacement Policy | Dinanath & Sons',
    description: 'Learn about our 7-day inspection window, replacement process for transit-damaged goods, and return guidelines for tools and machinery.',
    alternates: {
        canonical: 'https://dinanathandsons.com/return-policy',
    },
    openGraph: {
        title: 'Returns & Replacement Policy | Dinanath & Sons',
        description: 'Hassle-free 7-day return and exchange policy for Dinanath & Sons customers.',
        url: 'https://dinanathandsons.com/return-policy',
    }
};

export default function ReturnPolicyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
