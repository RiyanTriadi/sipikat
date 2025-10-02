import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL('https://edu-sipikat.com'),

  title: 'SIPIKAT - Sistem Pakar Kecanduan Gadget',
  description: 'Sistem pakar untuk membantu Anda mengidentifikasi dan memahami tingkat kecanduan gadget secara personal.',
  
  openGraph: {
    title: 'SIPIKAT - Sistem Pakar Kecanduan Gadget',
    description: 'Sistem pakar untuk membantu Anda mengidentifikasi dan memahami tingkat kecanduan gadget secara personal.',
    images: [
      {
        url: '/sipikat-logo.webp', 
        width: 1200,
        height: 630, 
        alt: 'Logo SIPIKAT', 
      },
    ],
    url: 'https://edu-sipikat.com',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}