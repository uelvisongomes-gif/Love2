import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/lib/query-provider';
import { InstallPWA } from '@/components/install-pwa';
import { ServiceWorkerRegister } from '@/components/sw-register';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'love2',
  description:
    'Uma mediadora pra conversar melhor com quem você ama. Não é psicóloga, não é terapeuta — é escuta e caminho.',
  manifest: '/manifest.json',
  applicationName: 'love2',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'love2',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'love2',
  },
};

export const viewport: Viewport = {
  themeColor: '#c9694a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

// Set the theme on <html> BEFORE React hydrates to avoid a flash of wrong theme.
const themeBootstrap = `
  (function() {
    try {
      var t = localStorage.getItem('theme');
      if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${manrope.variable} ${fraunces.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <QueryProvider>
          <ServiceWorkerRegister />
          {children}
          <InstallPWA />
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
