import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Returns & Replacement Policy — 7-Day Guarantee',
    description: 'Review our straightforward 7-day return and replacement policy for precision jewelry tools and workshop equipment. Quick inspection and dedicated support.',
    alternates: {
        canonical: 'https://dinanathandsons.com/return-policy',
    },
    openGraph: {
        title: 'Returns & Replacement Policy — 7-Day Guarantee | Dinanath & Sons',
        description: 'Review our straightforward 7-day return and replacement policy for precision jewelry tools and workshop equipment. Quick inspection and dedicated support.',
        url: 'https://dinanathandsons.com/return-policy',
    }
};

export default function ReturnPolicyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
