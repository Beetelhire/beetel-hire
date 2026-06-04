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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://beetelhire.in'),
  title: {
    default: 'Beetel Hire — Technology Meets Talent',
    template: '%s — Beetel Hire',
  },
  description:
    'Beetel Hire is a new-generation recruitment platform connecting ambitious people with the companies building what\'s next. Specialised hiring across IT, BFSI, healthcare, manufacturing, engineering, telecom, retail and energy.',
  keywords: [
    'recruitment India', 'hiring platform', 'IT recruitment', 'tech hiring',
    'executive search India', 'BFSI recruitment', 'engineering recruitment',
    'Bangalore recruiters', 'modern recruitment agency', 'Beetel Hire',
  ],
  authors: [{ name: 'Beetel Hire' }],
  creator: 'Beetel Hire',
  publisher: 'Beetel Hire',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'Beetel Hire',
    title: 'Beetel Hire — Technology Meets Talent',
    description: 'A new-generation recruitment platform connecting ambitious people with the companies building what\'s next.',
    images: [
      { url: '/beetel-hire-logo-light.svg', width: 1200, height: 630, alt: 'Beetel Hire' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beetel Hire — Technology Meets Talent',
    description: 'A new-generation recruitment platform connecting ambitious people with the companies building what\'s next.',
    images: ['/beetel-hire-logo-light.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
