import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/providers/theme-provider';
import { SettingsProvider } from '@/providers/settings-provider';
import { ReduxProvider } from '@/providers/ReduxProvider';
import { AuthRehydrator } from '@/components/auth-rehydrator';
import { DynamicToastContainer } from '@/components/DynamicToastContainer';
import '@/css/styles.css';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Enquiry System',
    default: 'Enquiry System',
  },
  description: 'Agency enquiry tracking for Facebook, Instagram and WhatsApp leads.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={cn(
          'demo1 antialiased flex h-full w-full flex-col text-base text-foreground bg-background',
          inter.className,
        )}
      >
        <SettingsProvider>
          <ThemeProvider>
            <ReduxProvider>
              <AuthRehydrator />
              <DynamicToastContainer />
              {children}
            </ReduxProvider>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
