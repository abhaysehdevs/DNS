import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Shopping Cart | Dinanath & Sons Precision Tools",
    description: "Review and complete the procurement of your gold casting machines, goldsmith hand tools, and workshop equipment.",
    robots: {
        index: false,
        follow: false,
    }
};

export default function CartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
