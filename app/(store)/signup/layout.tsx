import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Create Account | Dinanath & Sons Portal",
    description: "Register for a Dinanath & Sons account to track orders, manage custom quotes, and unlock B2B wholesale prices.",
    robots: {
        index: false,
        follow: false,
    }
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
