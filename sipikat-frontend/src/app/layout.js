import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SIPIKAT - Sistem Pakar Kecanduan Gadget',
  description: 'Identifikasi tingkat kecanduan gadget Anda dengan sistem pakar menggunakan metode Certainty Factor.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}