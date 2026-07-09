import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Contact Dinanath's | Global Support Node & Machinery Logistics",
    description: "Connect with our engineering and wholesale dispatch nodes in Delhi. Access B2B protocols, technical calibration requests, and global logistics support.",
    keywords: [
        'contact jewelry machinery', 
        'jewelry tools supplier Delhi', 
        'B2B wholesale tools support', 
        'technical hotline goldsmith'
    ],
    openGraph: {
        title: "Contact Dinanath's | Global Support Node & Machinery Logistics",
        description: "Connect with our engineering and wholesale dispatch nodes in Delhi. Access B2B protocols, technical calibration requests, and global logistics support.",
        url: 'https://dinanathandsons.com/contact',
    }
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
