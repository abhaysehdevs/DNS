import { Navbar } from '@/components/navbar';
import { LanguagePopup } from '@/components/language-popup';
import { AIAssistant } from '@/components/ai-assistant';
import { Footer } from '@/components/footer';
import { GoogleTranslate } from '@/components/google-translate';
import { CurrencyManager } from '@/components/currency-manager';
import { MobileBottomNav } from '@/components/mobile-navigation';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CurrencyManager />
      <GoogleTranslate />
      <Navbar />
      <LanguagePopup />
      <AIAssistant />
      <MobileBottomNav />
      <main className="flex-1 pt-20 md:pt-24 pb-28 md:pb-0">
        {children}
      </main>
      <Footer />
    </>
  );
}
