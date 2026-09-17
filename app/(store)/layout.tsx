import { Navbar } from '@/components/navbar';
import { LanguagePopup } from '@/components/language-popup';
import { MarketingPopup } from '@/components/marketing-popup';
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
      <MarketingPopup />
      <AIAssistant />
      <MobileBottomNav />
      <main className="flex-1 w-full max-w-full overflow-x-clip min-w-0 pt-[124px] sm:pt-[132px] lg:pt-36 pb-24 md:pb-0">
        {children}
      </main>
      <Footer />
    </>
  );
}
