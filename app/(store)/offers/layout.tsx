import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Jewellery Tools Deals & Wholesale Offers | Dinanath & Sons',
    description: 'Save on goldsmith hand tools, polishing consumables, pliers, tweezers, and workshop machines. Limited-time discounts and bulk volume wholesale savings.',
    alternates: {
        canonical: 'https://dinanathandsons.com/offers',
    },
    openGraph: {
        title: 'Special Deals & Offers on Jewellery Tools | Dinanath & Sons',
        description: 'Exclusive wholesale and retail discounts on premium jewellery manufacturing tools and machinery.',
        url: 'https://dinanathandsons.com/offers',
    }
};

export default function OffersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
