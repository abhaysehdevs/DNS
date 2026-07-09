import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Saved Tooling Wishlist | Dinanath & Sons",
    description: "Save and review your preferred jewelry-making machinery, goldsmith hand tools, and calibration consumables.",
    robots: {
        index: false,
        follow: true,
    }
};

export default function WishlistLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
