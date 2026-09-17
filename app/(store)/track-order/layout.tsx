import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Track Order & Shipment Status',
    description: 'Check real-time delivery and courier tracking status for your Dinanath & Sons jewellery tool shipment across India.',
    alternates: {
        canonical: 'https://dinanathandsons.com/track-order',
    },
    openGraph: {
        title: 'Track Order & Shipment Status | Dinanath & Sons',
        description: 'Check real-time delivery and courier tracking status for your Dinanath & Sons jewellery tool shipment across India.',
        url: 'https://dinanathandsons.com/track-order',
    }
};

export default function TrackOrderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
