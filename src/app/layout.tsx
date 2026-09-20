import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { QueryProvider } from '@/lib/query-provider';
import { InstallPWA } from '@/components/install-pwa';
import { ServiceWorkerRegister } from '@/components/sw-register';
import { SwipeBack } from '@/components/swipe-back';
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
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
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
  themeColor: '#e6604a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

// Default theme = light. Só usa dark se o usuário escolheu explicitamente.
// Aplica ANTES do React hidratar pra evitar flash.
const themeBootstrap = `
  (function() {
    try {
      var t = localStorage.getItem('theme');
      document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
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
          <SwipeBack />
          {children}
          <InstallPWA />
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
