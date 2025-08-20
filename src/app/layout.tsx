
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppKitProvider } from '@/app/providers';
import { I18nProvider } from '@/i18n/context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DBT',
  description: 'DBT',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
          <AppKitProvider>{children}</AppKitProvider>
        </I18nProvider>
      </body>
    </html>
  );
}