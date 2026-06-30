import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Secure Portal Login | Dinanath & Sons",
    description: "Access your Dinanath & Sons operator portal to review order logs, wholesale contracts, and B2B calibration parameters.",
    robots: {
        index: false,
        follow: false,
    }
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
