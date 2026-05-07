import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MediChain - Privacy-First AI Health Advisor',
  description: 'AI-powered health advisory for underserved regions with privacy-first encrypted health records',
  keywords: ['health', 'AI', 'privacy', 'blockchain', '0G', 'healthcare', 'decentralized'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
