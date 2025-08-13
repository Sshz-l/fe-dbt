import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { AppKitProvider } from '@/app/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Web Wallet',
  description: 'A simple web wallet built with Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppKitProvider>{children}</AppKitProvider>
      </body>
    </html>
  );
}