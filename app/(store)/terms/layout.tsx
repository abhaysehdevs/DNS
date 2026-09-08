import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | Dinanath & Sons Hardware Store',
    description: 'Official Terms of Service governing website access, online and wholesale orders, B2B quotes, and payments with Dinanath & Sons Hardware Store.',
    alternates: {
        canonical: 'https://dinanathandsons.com/terms',
    },
    openGraph: {
        title: 'Terms of Service | Dinanath & Sons',
        description: 'Terms and conditions for retail purchases and wholesale supply contracts.',
        url: 'https://dinanathandsons.com/terms',
    }
};

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
