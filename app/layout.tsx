
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
<<<<<<< Updated upstream
=======
import { CurrencyManager } from '@/components/currency-manager';
>>>>>>> Stashed changes

const inter = Inter({ subsets: ['latin'] });
const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '700'],
  subsets: ['devanagari'],
  variable: '--font-hindi',
});

export const metadata: Metadata = {
  title: 'Dinanath & Sons - Premium Jewelry Tools',
  description: 'Wholesale and Retail Jewelry Making Tools & Machinery',
};

export const viewport: Metadata = {
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, notoSansDevanagari.variable, "bg-black min-h-screen flex flex-col")}>
<<<<<<< Updated upstream
=======
        <CurrencyManager />
>>>>>>> Stashed changes
        <GoogleTranslate />
        <Preloader />
        <Navbar />
        {/* Language Popup */}
        <LanguagePopup />
        {/* AI Assistant */}
        <AIAssistant />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
