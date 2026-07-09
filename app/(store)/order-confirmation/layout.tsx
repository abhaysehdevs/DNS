import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Order Confirmation | Dinanath & Sons",
    description: "Your order details and transaction logs have been processed successfully. Operator tracking metrics are active.",
    robots: {
        index: false,
        follow: false,
    }
};

export default function OrderConfirmationLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
