import type { Metadata } from 'next';
import './globals.css'; // <-- THIS IMPORT IS CRITICAL

export const metadata: Metadata = {
  title: 'Thiruppugazh Digital Treasury',
  description: 'Thiruppugazh songs, lyrics, and Chandam rhythm index',
  icons: { icon: '/icon.svg', apple: '/logo.svg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ta">
      <body>{children}</body>
    </html>
  );
}