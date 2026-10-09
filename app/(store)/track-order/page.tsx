import { Metadata } from 'next';
import { TrackOrderClient } from './track-order-client';
import { getAbsoluteUrl } from '@/lib/site-config';

export const metadata: Metadata = {
    title: 'Track Your Order | Dinanath & Sons',
    description: 'Track the real-time fulfillment and carrier dispatch status of your jewellery tools and workshop equipment order.',
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: getAbsoluteUrl('/track-order'),
    },
};

export default function TrackOrderPage() {
    return <TrackOrderClient />;
}
