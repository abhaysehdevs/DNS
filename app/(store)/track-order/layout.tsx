import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Track Order & Shipment Status | Dinanath & Sons',
    description: 'Track your Dinanath & Sons order delivery status in real time using your Order ID or shipment AWB tracking number.',
    alternates: {
        canonical: 'https://dinanathandsons.com/track-order',
    },
    openGraph: {
        title: 'Track Order Status | Dinanath & Sons',
        description: 'Track your tool shipment and logistics delivery status.',
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
