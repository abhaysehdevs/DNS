import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service & Workshop Equipment Conditions',
    description: 'Read the official terms and conditions governing retail purchases, B2B wholesale supply, and machine orders at Dinanath & Sons Hardware Store, Delhi.',
    alternates: {
        canonical: 'https://dinanathandsons.com/terms',
    },
    openGraph: {
        title: 'Terms of Service & Workshop Equipment Conditions | Dinanath & Sons',
        description: 'Read the official terms and conditions governing retail purchases, B2B wholesale supply, and machine orders at Dinanath & Sons Hardware Store, Delhi.',
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
