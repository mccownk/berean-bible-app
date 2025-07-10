
import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { ClientToaster } from '@/components/providers/client-toaster';
import { SessionProvider } from '@/components/auth/session-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});

export const metadata: Metadata = {
  title: 'Berean - Examine Scripture Daily',
  description: 'A comprehensive 750-day New Testament reading plan with repetition-based learning methodology.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            themes={['light', 'dark', 'sepia']}
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {children}
            <ClientToaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
