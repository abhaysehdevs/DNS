
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
  alternates: {
    canonical: 'https://dinanathandsons.com',
  },
  title: {
    default: "Dinanath & Sons | Jewellery Tools, Goldsmith Equipment & Machinery Since 1960",
    template: "%s | Dinanath & Sons"
  },
  description: 'India’s premier wholesale and retail supplier of professional jewellery making tools, goldsmith equipment, casting machinery, and polishing consumables. Serving jewelers since 1960 in Chandni Chowk, Delhi.',
  keywords: [
    'jewellery tools',
    'jewelry tools',
    'goldsmith tools',
    'jewellery tools wholesale',
    'jewellery tools shop',
    'jewellery tools Chandni Chowk',
    'jewellery tools wholesale Delhi',
    'jewellery equipment supplier India',
    'jewelry machinery',
    'precision tooling',
    'casting equipment',
    'gold testing kit',
    'suhaga borax flux',
    'coin packing cards',
    'jewellery display trays',
    'polishing consumables',
    'rolling mills wholesale Delhi',
    'micro-soldering jewelry'
  ],
  authors: [{ name: "Dinanath & Sons" }],
  creator: "Dinanath & Sons",
  publisher: "Dinanath & Sons",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Dinanath & Sons | Premium Jewellery Tools & Machinery Since 1960",
    description: 'Leading wholesale and retail supplier of professional jewellery making tools, machinery, and consumables across India.',
    url: 'https://dinanathandsons.com',
    siteName: "Dinanath & Sons",
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://dinanathandsons.com/icon.png',
        width: 512,
        height: 512,
        alt: "Dinanath & Sons Precision Jewellery Tools",
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dinanath & Sons | Premium Jewellery Tools & Machinery Since 1960",
    description: 'Leading wholesale and retail supplier of professional jewellery making tools and goldsmith machinery.',
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
              "legalName": "Dinanath & Sons Hardware Store",
              "alternateName": ["Dinanath and Sons", "Dinanath Tools", "Dinanath's"],
              "image": "https://dinanathandsons.com/icon.png",
              "@id": "https://dinanathandsons.com/#organization",
              "url": "https://dinanathandsons.com",
              "telephone": "+919953435647",
              "foundingDate": "1960",
              "description": "Established in 1960 in Maliwara, Chandni Chowk, New Delhi, Dinanath & Sons is a premier manufacturer, retail vendor, and wholesale supplier of precision jewellery making tools, goldsmith hand tools, casting machinery, and polishing consumables across India.",
              "priceRange": "₹₹",
              "currenciesAccepted": "INR",
              "paymentAccepted": "Cash, Credit Card, UPI, Net Banking, Bank Wire",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1914, Chatta Madan Gopal, Maliwara, Chandni Chowk",
                "addressLocality": "Delhi",
                "addressRegion": "Delhi",
                "postalCode": "110006",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 28.6562,
                "longitude": 77.2309
              },
              "areaServed": [
                { "@type": "Country", "name": "India" },
                { "@type": "City", "name": "Delhi" },
                { "@type": "AdministrativeArea", "name": "Chandni Chowk" }
              ],
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

