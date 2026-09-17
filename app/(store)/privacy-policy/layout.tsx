import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy & Data Protection Standards',
    description: 'Learn how Dinanath & Sons protects your personal data, order records, payment privacy, and cookie preferences in compliance with Indian IT Act standards.',
    alternates: {
        canonical: 'https://dinanathandsons.com/privacy-policy',
    },
    openGraph: {
        title: 'Privacy Policy & Data Protection Standards | Dinanath & Sons',
        description: 'Learn how Dinanath & Sons protects your personal data, order records, payment privacy, and cookie preferences in compliance with Indian IT Act standards.',
        url: 'https://dinanathandsons.com/privacy-policy',
    }
};

export default function PrivacyPolicyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
