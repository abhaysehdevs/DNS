import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "FAQ & Support Intelligence | Dinanath's Jewelry Machinery",
    description: "Standard operational guides, wholesale MOQ parameters, payment channels, and technical warranties for Dinanath precision instruments.",
    keywords: [
        'jewelry tools FAQ', 
        'wholesale tool return policy', 
        'jewelry machine warranty', 
        'technical tool MOQ'
    ],
    openGraph: {
        title: "FAQ & Support Intelligence | Dinanath's Jewelry Machinery",
        description: "Standard operational guides, wholesale MOQ parameters, payment channels, and technical warranties for Dinanath precision instruments.",
        url: 'https://dinanathandsons.com/faq',
    }
};

export default function FaqLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
