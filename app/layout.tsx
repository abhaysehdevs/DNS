import type { Metadata } from 'next';
import { Cinzel, Inter, Roboto, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Script from 'next/script';
import { AuthListener } from '@/components/auth-listener';
import { SITE_CONFIG, getAbsoluteUrl } from '@/lib/site-config';
import { RETURN_POLICY } from '@/lib/policies';

const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-display' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'], variable: '--font-technical' });
const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '700'],
  subsets: ['devanagari'],
  variable: '--font-hindi',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.baseUrl),
  title: {
    default: "Dinanath & Sons | Jewellery Tools & Goldsmith Equipment Since 1960",
    template: "%s | Dinanath & Sons"
  },
  description: "India's premier supplier of jewellery making tools, goldsmith equipment, and casting machinery. Established 1960 in Maliwara, Chandni Chowk, Delhi.",
  authors: [{ name: SITE_CONFIG.businessName }],
  creator: SITE_CONFIG.businessName,
  publisher: SITE_CONFIG.businessName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Dinanath & Sons | Jewellery Tools, Goldsmith Equipment & Machinery Since 1960",
    description: "India's premier supplier of professional jewellery making tools, goldsmith equipment, casting machinery, and polishing consumables.",
    url: SITE_CONFIG.baseUrl,
    siteName: SITE_CONFIG.businessName,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: getAbsoluteUrl('/og-image.jpg'),
        width: 1200,
        height: 630,
        alt: "Dinanath & Sons - Precision Jewellery Tools Since 1960",
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Dinanath & Sons | Jewellery Tools, Goldsmith Equipment & Machinery Since 1960",
    description: "India's premier supplier of professional jewellery making tools, goldsmith equipment, and casting machinery.",
    images: [getAbsoluteUrl('/og-image.jpg')],
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
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
  themeColor: '#FAF9F5',
};

const siteGraphSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_CONFIG.baseUrl}/#organization`,
      "name": SITE_CONFIG.businessName,
      "legalName": SITE_CONFIG.legalName,
      "url": SITE_CONFIG.baseUrl,
      "logo": getAbsoluteUrl('/logo.png'),
      "foundingDate": SITE_CONFIG.foundingYear,
      "sameAs": [...SITE_CONFIG.sameAs],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": SITE_CONFIG.contact.phone,
        "contactType": "customer service",
        "email": SITE_CONFIG.contact.email,
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": SITE_CONFIG.address.streetAddress,
        "addressLocality": SITE_CONFIG.address.addressLocality,
        "addressRegion": SITE_CONFIG.address.addressRegion,
        "postalCode": SITE_CONFIG.address.postalCode,
        "addressCountry": SITE_CONFIG.address.addressCountry
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": RETURN_POLICY.windowDays,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn",
        "merchantReturnLink": getAbsoluteUrl('/return-policy')
      }
    },
    {
      "@type": "Store",
      "@id": `${SITE_CONFIG.baseUrl}/#store`,
      "name": SITE_CONFIG.businessName,
      "image": getAbsoluteUrl('/headquarters_storefront.png'),
      "telephone": SITE_CONFIG.contact.phone,
      "priceRange": "₹₹",
      "currenciesAccepted": "INR",
      "paymentAccepted": "Cash, Credit Card, UPI, Net Banking, Bank Wire",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": SITE_CONFIG.address.streetAddress,
        "addressLocality": SITE_CONFIG.address.addressLocality,
        "addressRegion": SITE_CONFIG.address.addressRegion,
        "postalCode": SITE_CONFIG.address.postalCode,
        "addressCountry": SITE_CONFIG.address.addressCountry
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": SITE_CONFIG.geo.latitude,
        "longitude": SITE_CONFIG.geo.longitude
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "11:00",
          "closes": "20:00"
        }
      ]
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_CONFIG.baseUrl}/#website`,
      "name": SITE_CONFIG.businessName,
      "url": SITE_CONFIG.baseUrl
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className="light" style={{ colorScheme: 'light' }}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteGraphSchema)
          }}
        />
        {/* Google Tag / GA4 Loader */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${SITE_CONFIG.analytics.ga4Id}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${SITE_CONFIG.analytics.ga4Id}', {
              send_page_view: true
            });
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
