import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Jewellery Tools Deals & Special Offers',
    description: 'Save on goldsmith hand tools, polishing consumables, pliers, tweezers, and workshop machines with limited-time trade discounts and bundle savings.',
    alternates: {
        canonical: 'https://dinanathandsons.com/offers',
    },
    openGraph: {
        title: 'Jewellery Tools Deals & Special Offers | Dinanath & Sons',
        description: 'Save on goldsmith hand tools, polishing consumables, pliers, tweezers, and workshop machines with limited-time trade discounts and bundle savings.',
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
