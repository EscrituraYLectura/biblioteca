import type { Metadata } from 'next';
import '@/app/ui/global.scss';
import { Ibarra_Real_Nova } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Biblioteca | Escritura y Lectura',
  description: 'Sitio web oficial del servidor Escritura y Lectura.',
  icons: {
    icon: '/favicon.ico',
  },
};

const ibarra = Ibarra_Real_Nova({
  weight: '400',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={ibarra.className}>
      <body>{children}</body>
    </html>
  );
}
