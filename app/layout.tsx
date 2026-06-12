import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Intelligent Investor',
  description: 'A common-sense view of your monthly money.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
