import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { TopBar } from '@/components/nav';
import { Footer } from '@/components/footer';
import { MobileMenu } from '@/components/mobile-menu';
import { BgOrbs } from '@/components/bg-orbs';
import { Toast } from '@/components/toast';
import { BookCallModal } from '@/components/book-call-modal';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Beetel Hire — Technology Meets Talent',
  description: 'Premium recruitment technology infrastructure connecting exceptional talent with modern companies.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://beetelhire.in'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="https://assets.calendly.com/assets/external/widget.css" />
      </head>
      <body>
        <Providers>
          <Toast />
          <BookCallModal>
            <MobileMenu>
              <BgOrbs />
              <TopBar />
              {children}
              <Footer />
            </MobileMenu>
          </BookCallModal>
        </Providers>
        <Script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js" strategy="afterInteractive" />
        <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
