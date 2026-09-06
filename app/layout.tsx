
import type { Metadata } from 'next';
import { Cinzel, Inter, Roboto, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Script from 'next/script';

import { AuthListener } from '@/components/auth-listener';

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'], variable: '--font-technical' });
const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '700'],
  subsets: ['devanagari'],
  variable: '--font-hindi',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dinanathandsons.com'),
  title: {
    default: "Dinanath's | Premium Jewelry Tools & Machinery",
    template: "%s | Dinanath's"
  },
  description: 'Leading wholesale and retail supplier of professional jewelry making tools, machinery, and consumables. Precision tooling for jewelers across India.',
  keywords: [
    'jewelry tools', 
    'jewelry machinery', 
    'wholesale jewelry tools', 
    'precision tooling', 
    'goldsmith tools', 
    'jewelry manufacturing equipment', 
    "Dinanath's",
    'jewelry making machinery', 
    'goldsmith tools Chandni Chowk', 
    'rolling mills wholesale Delhi', 
    'precision jewelry scales', 
    'polishing consumables', 
    'micro-soldering jewelry', 
    'jewelry workshop equipment', 
    'wholesale precision engineering tools'
  ],
  authors: [{ name: "Dinanath's" }],
  creator: "Dinanath's",
  publisher: "Dinanath's",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: "Dinanath's | Premium Jewelry Tools & Machinery",
    description: 'Leading wholesale and retail supplier of professional jewelry making tools, machinery, and consumables.',
    url: 'https://dinanathandsons.com',
    siteName: "Dinanath's",
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://dinanathandsons.com/icon.png',
        width: 512,
        height: 512,
        alt: "Dinanath's Precision Jewelry Tools",
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dinanath's | Premium Jewelry Tools & Machinery",
    description: 'Leading wholesale and retail supplier of professional jewelry making tools.',
    images: ['https://dinanathandsons.com/icon.png'],
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
  themeColor: '#151515',
};

export default function RootLayout({

  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Dinanath & Sons",
              "image": "https://dinanathandsons.com/icon.png",
              "@id": "https://dinanathandsons.com/#organization",
              "url": "https://dinanathandsons.com",
              "telephone": "+919953435647",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1914, Chatta Madan Gopal, Maliwara, Chandni Chowk",
                "addressLocality": "Delhi",
                "postalCode": "110006",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 28.6562,
                "longitude": 77.2309
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday"
                ],
                "opens": "11:00",
                "closes": "20:00"
              },
              "sameAs": [
                "https://www.facebook.com/dinanathandsons",
                "https://www.instagram.com/dinanathandsons"
              ]
            })
          }}
        />
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
      <body className={cn(inter.variable, cinzel.variable, roboto.variable, notoSansDevanagari.variable, "font-sans antialiased min-h-screen flex flex-col bg-surface-2 text-text-primary")}>
        <AuthListener />
        {children}
      </body>
    </html>
  );
}

