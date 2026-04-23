
import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { LanguagePopup } from '@/components/language-popup';
import { AIAssistant } from '@/components/ai-assistant';
import { cn } from '@/lib/utils';
import { Preloader } from '@/components/preloader';
import { Footer } from '@/components/footer';
import { GoogleTranslate } from '@/components/google-translate';
import { CurrencyManager } from '@/components/currency-manager';
import { MobileBottomNav } from '@/components/mobile-navigation';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '700'],
  subsets: ['devanagari'],
  variable: '--font-hindi',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dinanathandsons.com'),
  title: {
    default: 'Dinanath & Sons | Premium Jewelry Tools & Machinery',
    template: '%s | Dinanath & Sons'
  },
  description: 'Leading wholesale and retail supplier of professional jewelry making tools, machinery, and consumables. Precision tooling for jewelers across India.',
  keywords: ['jewelry tools', 'jewelry machinery', 'wholesale jewelry tools', 'precision tooling', 'goldsmith tools', 'jewelry manufacturing equipment', 'Dinanath & Sons'],
  authors: [{ name: 'Dinanath & Sons' }],
  creator: 'Dinanath & Sons',
  publisher: 'Dinanath & Sons',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Dinanath & Sons | Premium Jewelry Tools & Machinery',
    description: 'Leading wholesale and retail supplier of professional jewelry making tools, machinery, and consumables.',
    url: 'https://dinanathandsons.com',
    siteName: 'Dinanath & Sons',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dinanath & Sons | Premium Jewelry Tools & Machinery',
    description: 'Leading wholesale and retail supplier of professional jewelry making tools.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9HPF6NRR0W"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9HPF6NRR0W');
          `}
        </Script>
      </head>
      <body className={cn(inter.variable, notoSansDevanagari.variable, "font-sans antialiased bg-black min-h-screen flex flex-col")}>
        <CurrencyManager />
        <GoogleTranslate />
        <Preloader />
        <Navbar />
        {/* Language Popup */}
        <LanguagePopup />
        {/* AI Assistant */}
        <AIAssistant />
        <MobileBottomNav />
        <main className="flex-1 pt-20 md:pt-24 pb-20 md:pb-0">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
