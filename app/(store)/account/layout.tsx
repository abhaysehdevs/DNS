import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'User Account & Orders | Dinanath & Sons',
    description: 'Manage your profile, order history, shipping addresses, and wholesale status.',
    robots: {
        index: false,
        follow: false,
    }
};

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
