import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Reset Security Credentials | Dinanath & Sons",
    description: "Recover or reset your security login details for the Dinanath & Sons operator portal.",
    robots: {
        index: false,
        follow: false,
    }
};

export default function ForgotPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
